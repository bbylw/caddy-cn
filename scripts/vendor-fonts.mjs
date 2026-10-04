// 把 @fontsource-variable 的 woff2 复制到 public/fonts，供手写 @font-face 自托管引用。
// 只保留 latin / latin-ext 两个子集，避免中文字体体积。
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'fonts');
const pkgs = [
  ['@fontsource-variable/geist', 'geist'],
  ['@fontsource-variable/geist-mono', 'geist-mono'],
];
const keep = /-(latin|latin-ext)-wght-normal\.woff2$/;

await mkdir(out, { recursive: true });

let n = 0;
for (const [pkg, prefix] of pkgs) {
  const dir = join(root, 'node_modules', pkg, 'files');
  const files = (await readdir(dir)).filter((f) => keep.test(f));
  for (const f of files) {
    await copyFile(join(dir, f), join(out, `${prefix}-${f}`));
    n += 1;
  }
}

console.log(`[fonts] 已复制 ${n} 个 woff2 到 public/fonts`);
