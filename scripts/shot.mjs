// 截图脚本：node scripts/shot.mjs [path] [name]
// 需要先 bun run build，并在另一个终端跑 node scripts/serve.mjs。
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE ?? 'http://127.0.0.1:8199';
const OUT = join(process.cwd(), '.shots');

const route = process.argv[2] ?? '/';
const name = process.argv[3] ?? 'shot';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });

async function capture(theme, width, height, tag) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('caddy-theme', t);
    } catch {
      /* ignore */
    }
  }, theme);
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({
    path: join(OUT, `${name}-${tag}-${theme}.png`),
    fullPage: true,
  });
  await page.close();
}

await capture('light', 1440, 900, 'desktop');
await capture('dark', 1440, 900, 'desktop');
await capture('light', 390, 844, 'mobile');

await browser.close();
console.log(`[shot] ${route} -> .shots/${name}-*.png`);
