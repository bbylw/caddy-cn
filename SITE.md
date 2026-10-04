# Caddy 中文站（caddy-cn）

Caddy 官方文档的中文整理站。**根目录 `README.md` 是 Caddy 官方 README 的中文译文，不要修改**；项目自身的说明都在本文件。

## 技术栈

- Astro 7（静态输出）+ TypeScript 6
- React 19（仅用于交互岛：启动日志、Caddyfile 工作台、协议时序、安装 tabs、主题切换）
- Tailwind CSS v4（`@tailwindcss/vite`，CSS-first，无 tailwind.config）
- Shiki 4（构建期高亮，`defaultColor: false` 双主题）
- Bun

## 命令

```bash
bun install          # 安装依赖
bun run fonts        # 把 @fontsource-variable 的 woff2 复制到 public/fonts
bun run icons        # 由 public/favicon*.svg 光栅化 PNG 图标集到 public/icons
bun run dev          # 开发
bun run build        # 构建到 dist/
bunx astro check     # 类型与诊断
bun run verify       # 硬断言验收（需先 build，并另开终端跑 node scripts/serve.mjs）
node scripts/shot.mjs <path> <name>   # 截图，输出到 .shots/
```

## 约定

### 视觉

- 冷灰中性 + 单一强调色（Caddy 绿）。令牌在 `src/styles/global.css`，整组在 `html[data-theme='dark']` 下翻转，组件不写 `dark:` 变体。
- 圆角：容器 `--radius-box` 12px，控件 `--radius-ctl` 8px，徽标全圆。
- 分节用发丝线 `.band`；眉题 / 标注统一 `.mono`（Geist Mono，大写 + 字距）。
- 字体自托管在 `public/fonts`（Geist / Geist Mono，latin + latin-ext 子集），中文回落系统字体栈，禁止引入 CDN。
- 图标：`public/favicon.svg` 主题自适应（亮暗各用一组令牌色），PNG 集 / apple-touch / maskable 由 `bun run icons` 光栅化到 `public/icons` 并提交；改 SVG 后需重跑。
- 全站禁止 em dash / en dash，全角标点后不能断行（模板里的换行会渲染成空格）。

### 代码高亮

- Shiki 没有 Caddyfile 语法，`src/lib/caddyfile.tmLanguage.json` 是自写的 tmLanguage。改指令清单时同步更新它。
- `src/lib/shiki.ts` 的 `highlight()` 输出同时携带浅深两档颜色，靠 CSS 变量切换；`.shiki` 与 `pre.astro-code` 两套选择器都要覆盖。

### 动画

- 滚动进度条：`animation-timeline: scroll(root)` 必须与 `animation` 简写**分写在两条不同选择器**的声明里，否则压缩器会把它折成一条 `animation` 简写导致整条声明失效。
- 交互岛的动画都遵循 `prefers-reduced-motion`；`.reveal` 在无 JS 时全显。

### 验收

`scripts/verify.mjs` 是硬断言：17 个路由 × 双主题 × 双视口的横向溢出、h1 唯一、空链接、破折号、逐元素 WCAG 对比度（跳过 `pre` 内的语法高亮）、内链完整性，以及首页的交互回归（主题切换、进度条动画、工作台切场景 / 切 tab、安装 tabs、协议时序进入 `running`）。改动选择器或文案前先想想会不会碰断它。

## 结构

```
src/
  components/   Icon / CodeBlock / Note / SiteHeader / SiteFooter
                React 岛：BootSequence / Workbench / ProtocolTimeline / InstallTabs / ThemeToggle
  data/         docs.ts（导航与上下篇）、scenarios.ts（工作台）、install.ts
  layouts/      BaseLayout（全站）、DocsLayout（文档页，含左栏目录与上下篇）
  lib/          shiki.ts、caddyfile.tmLanguage.json、theme.ts
  pages/        index.astro（落地页）、about、404、docs/[13 篇]
  styles/       global.css（全部令牌与组件层样式）
scripts/        serve.mjs（静态预览 8199）、verify.mjs（验收）、shot.mjs（截图）、vendor-fonts.mjs
```

## 已知取舍

- 落地页刻意不放摄影图：视觉重量来自真实的交互装置与数据可视化，而非库存照片。
- 工作台里的 JSON 标注为「`caddy adapt` 的输出（节选）」，省略了与场景无关的日志、存储等配置。
- 协议时序图是示意，不是基准测试数据，页面上有标注。
