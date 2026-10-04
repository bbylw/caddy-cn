// 由 public/favicon.svg 与 favicon-maskable.svg 光栅化出 PNG 图标集：
//   node scripts/favicon.mjs
// 依赖 playwright-core + 本机 Chrome，与 verify/shot 一致。
// 直接把 SVG 内联进页面渲染，避免 file:// 子资源被 about:blank 源拦截。
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUB = join(process.cwd(), 'public');
const OUT = join(PUB, 'icons');
mkdirSync(OUT, { recursive: true });

const inlineSvg = (name, size) =>
  readFileSync(join(PUB, name), 'utf8')
    .replace(/^<\?xml[^>]*\?>/, '')
    .replace('<svg ', `<svg width="${size}" height="${size}" `);

const JOBS = [
  { svg: 'favicon.svg', sizes: [16, 32, 48, 64, 128, 192, 512], prefix: 'favicon' },
  { svg: 'favicon.svg', sizes: [180], prefix: 'apple-touch-icon', fixed: 'apple-touch-icon' },
  { svg: 'favicon-maskable.svg', sizes: [192, 512], prefix: 'maskable' },
];

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });

for (const job of JOBS) {
  for (const size of job.sizes) {
    await page.setContent(
      `<!doctype html><body style="margin:0">${inlineSvg(job.svg, size)}</body>`,
    );
    await page.waitForTimeout(60);
    const file = job.fixed ? `${job.fixed}.png` : `${job.prefix}-${size}.png`;
    await page.screenshot({ path: join(OUT, file), clip: { x: 0, y: 0, width: size, height: size } });
    console.log(`[favicon] ${file}`);
  }
}

await browser.close();
