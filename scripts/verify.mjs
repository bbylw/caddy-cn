// 硬断言验收：node scripts/verify.mjs
// 需要先 bun run build，并另开终端跑 node scripts/serve.mjs。
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:8199';

if (!existsSync(join(process.cwd(), 'dist'))) {
  console.error('[verify] 缺少 dist/，请先 bun run build');
  process.exit(1);
}

const ROUTES = [
  '/',
  '/docs',
  '/docs/welcome',
  '/docs/install',
  '/docs/getting-started',
  '/docs/quick-starts',
  '/docs/caddyfile',
  '/docs/json',
  '/docs/config-adapters',
  '/docs/api',
  '/docs/command-line',
  '/docs/automatic-https',
  '/docs/running',
  '/docs/architecture',
  '/docs/modules',
  '/docs/features',
  '/about',
];

const failures = [];
const notes = [];

function fail(route, msg) {
  failures.push(`${route} :: ${msg}`);
}

/* ---------- 浏览器端检查 ---------- */
async function inspect(page, route, { theme, width }) {
  const label = `${route} [${theme} ${width}]`;

  // 溢出
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const bad = [];
    if (doc.scrollWidth > doc.clientWidth + 1) {
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > doc.clientWidth + 1) {
          // 处于可滚动容器内的元素属于正常横向滚动，不算溢出
          let node = el.parentElement;
          while (node && node !== document.body) {
            const ox = getComputedStyle(node).overflowX;
            if (['auto', 'scroll', 'clip', 'hidden'].includes(ox)) return;
            node = node.parentElement;
          }
          bad.push(
            `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`,
          );
        }
      });
    }
    return { sw: doc.scrollWidth, cw: doc.clientWidth, bad: bad.slice(0, 5) };
  });
  if (overflow.sw > overflow.cw + 1) {
    fail(label, `横向溢出 ${overflow.sw} > ${overflow.cw}：${overflow.bad.join(', ')}`);
  }

  // 标题唯一
  const h1 = await page.locator('h1').count();
  if (h1 !== 1) fail(label, `h1 数量为 ${h1}，应为 1`);

  // 空链接 / 空按钮
  const empties = await page.evaluate(() =>
    [...document.querySelectorAll('a,button')].filter((el) => {
      const text = (el.textContent ?? '').trim();
      const label = el.getAttribute('aria-label')?.trim();
      return !text && !label && !el.querySelector('svg,img');
    }).length,
  );
  if (empties > 0) fail(label, `${empties} 个空链接或空按钮`);

  // em dash / en dash / 全角空格
  const dashes = await page.evaluate(() => {
    const hits = [];
    document.querySelectorAll('body *').forEach((el) => {
      if (el.children.length > 0) return;
      const text = el.textContent ?? '';
      if (/[—–]|[\u3000]/.test(text)) {
        hits.push(`${el.tagName.toLowerCase()}: ${text.trim().slice(0, 30)}`);
      }
    });
    return hits.slice(0, 5);
  });
  if (dashes.length) fail(label, `出现破折号或全角空格：${dashes.join(' | ')}`);

  // 逐元素对比度（跳过语法高亮的 pre 内容）
  const contrastIssues = await page.evaluate(() => {
    function parseColor(input) {
      if (!input) return null;
      const v = input.trim();
      if (v.startsWith('#')) {
        const h = v.slice(1);
        if (h.length === 3) return [0, 1, 2].map((i) => parseInt(h[i] + h[i], 16) / 255);
        if (h.length === 6) return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
        if (h.length === 8) return [0, 2, 4, 6].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
        return null;
      }
      const m = v.match(
        /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.%]+))?\s*\)$/i,
      );
      if (m) {
        const a = m[4] == null ? 1 : m[4].endsWith('%') ? Number(m[4]) / 100 : Number(m[4]);
        return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255, a];
      }
      if (/^(oklch|color\(|lab|lch|oklab)/i.test(v)) return 'unsupported';
      return null;
    }
    const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
    const ratio = (a, b) => {
      const la = lum(a);
      const lb = lum(b);
      const [hi, lo] = la > lb ? [la, lb] : [lb, la];
      return (hi + 0.05) / (lo + 0.05);
    };

    const issues = [];
    const seen = new Set();
    document.querySelectorAll('body *').forEach((el) => {
      if (el.closest('pre')) return;
      if (el.closest('[aria-hidden="true"]')) return;
      const own = [...el.childNodes].filter(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
      );
      if (!own.length) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) return;
      const fg = parseColor(cs.color);
      if (!fg || fg === 'unsupported' || (fg.length === 4 && fg[3] < 0.85)) return;

      // 找最近一层有非透明背景的祖先
      let node = el;
      let bg = null;
      while (node && node !== document.documentElement) {
        const c = parseColor(getComputedStyle(node).backgroundColor);
        if (c && c !== 'unsupported' && (c.length === 3 || c[3] > 0.9)) {
          bg = c;
          break;
        }
        node = node.parentElement;
      }
      if (!bg) bg = [1, 1, 1];

      const size = Number.parseFloat(cs.fontSize);
      const weight = Number.parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const min = large ? 3 : 4.5;
      const r = ratio(fg, bg);
      if (r < min - 0.02) {
        const key = `${cs.color}|${size}|${el.className?.toString().slice(0, 24) ?? ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          issues.push(
            `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} ` +
              `${cs.color} on ${JSON.stringify(bg)} = ${r.toFixed(2)} (需 ${min})`,
          );
        }
      }
    });
    return issues.slice(0, 6);
  });
  contrastIssues.forEach((issue) => fail(label, `对比度不足：${issue}`));

  return { label };
}

/* ---------- 交互回归（只在首页跑） ---------- */
async function interactions(page) {
  // 主题切换
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.click('[aria-label*="主题"]');
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  if (before === after) fail('/', '主题切换未生效');
  await page.click('[aria-label*="主题"]');

  // 滚动进度条有动画且随滚动变化
  const anim = await page.evaluate(() => {
    const el = document.querySelector('.topbar-progress');
    if (!el) return { found: false };
    const list = el.getAnimations();
    return {
      found: true,
      count: list.length,
      timeline: list[0]?.timeline?.constructor?.name ?? 'none',
    };
  });
  if (!anim.found) fail('/', '缺少 .topbar-progress');
  else if (anim.count === 0 || anim.timeline === 'none') {
    fail('/', `进度条动画未创建（${anim.count} 个，timeline=${anim.timeline}）`);
  }

  // 工作台：切场景会换代码，切 tab 会换代码，复制按钮有反馈态
  await page.locator('#workbench').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const wbCode = page.locator('#workbench .codeblock pre');
  const firstCode = await wbCode.textContent();
  await page.locator('[role="tablist"][aria-label="配置场景"] button').nth(1).click();
  await page.waitForTimeout(200);
  const secondCode = await wbCode.textContent();
  if (firstCode === secondCode) fail('/', '工作台切换场景后代码未变化');
  await page.locator('[role="tablist"][aria-label="配置场景"] button').nth(0).click();
  await page.waitForTimeout(200);

  await page.locator('button[aria-pressed]').filter({ hasText: '适配后的 JSON' }).click();
  await page.waitForTimeout(200);
  const jsonCode = await wbCode.textContent();
  if (!jsonCode.includes('apps')) fail('/', '切到 JSON 视图后未显示 JSON 内容');
  await page.locator('button[aria-pressed]').filter({ hasText: 'Caddyfile' }).click();
  await page.waitForTimeout(200);

  // 安装 tab
  await page.locator('#install').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const instCode = page.locator('#install .codeblock pre');
  await page.locator('[role="tablist"][aria-label="安装方式"] button').nth(2).click();
  await page.waitForTimeout(200);
  const mac = await instCode.textContent();
  if (!mac.includes('brew')) fail('/', '安装 tab 切换后内容未变化');

  // 协议时序动画已创建
  const pt = await page.evaluate(() => {
    const el = document.querySelector('.pt-panel');
    if (!el) return { found: false };
    el.scrollIntoView({ block: 'center' });
    return { found: true, phase: el.dataset.phase };
  });
  if (!pt.found) fail('/', '缺少协议时序装置');
  await page.waitForTimeout(1400);
  const ptPhase = await page.evaluate(() => document.querySelector('.pt-panel')?.dataset.phase);
  if (ptPhase !== 'running') fail('/', `协议时序未进入 running（实际 ${ptPhase}）`);
}

/* ---------- 内链完整性 ---------- */
function checkLinks() {
  const pages = new Set(
    ROUTES.map((r) => (r.endsWith('/') && r !== '/' ? r.slice(0, -1) : r)),
  );
  const seen = new Set();
  const broken = [];
  for (const route of ROUTES) {
    const file =
      route === '/'
        ? join(process.cwd(), 'dist', 'index.html')
        : join(process.cwd(), 'dist', route, 'index.html');
    if (!existsSync(file)) {
      broken.push(`${route}（文件不存在）`);
      continue;
    }
    const html = readFileSync(file, 'utf8');
    const re = /href="(\/[^"#]*)"/g;
    let m;
    while ((m = re.exec(html))) {
      const href = m[1].replace(/\/+$/, '') || '/';
      if (href.startsWith('/@') || href.startsWith('/_')) continue;
      if (seen.has(href)) continue;
      seen.add(href);
      if (!pages.has(href) && !existsSync(join(process.cwd(), 'dist', href))) {
        broken.push(`${route} -> ${href}`);
      }
    }
  }
  return broken;
}

/* ---------- 主流程 ---------- */
const browser = await chromium.launch({ executablePath: CHROME });

for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.addInitScript((t) => {
      try {
        localStorage.setItem('caddy-theme', t);
      } catch {
        /* ignore */
      }
    }, theme);

    for (const route of ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(450);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await inspect(page, route, { theme, width: viewport.width });
    }
    await ctx.close();
  }
}

// 交互回归（亮色桌面）
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await interactions(page);
  await page.close();
}

const broken = checkLinks();
broken.forEach((b) => fail('link-check', b));

await browser.close();

if (failures.length) {
  console.log(`\n[verify] 未通过 ${failures.length} 项：\n`);
  failures.forEach((f) => console.log(`  x ${f}`));
  process.exit(1);
}

console.log(`[verify] ${ROUTES.length} 个路由 x 双主题 x 双视口 全部通过，内链完整。`);
if (notes.length) notes.forEach((n) => console.log(`  i ${n}`));
