export interface DocEntry {
  slug: string;
  title: string;
  lede: string;
}

export interface DocGroup {
  title: string;
  pages: DocEntry[];
}

/** 文档站点的全部页面，顺序即导航与上下篇顺序 */
export const DOC_GROUPS: DocGroup[] = [
  {
    title: '开始',
    pages: [
      {
        slug: 'welcome',
        title: '欢迎',
        lede: 'Caddy 是一个强大的、可扩展的平台，用来托管你的站点、服务与应用。',
      },
      {
        slug: 'install',
        title: '安装',
        lede: '按你的系统挑一种方式，把 caddy 放进 PATH。',
      },
      {
        slug: 'getting-started',
        title: '入门指南',
        lede: '一次走完：运行守护进程、调用 API、写第一份配置、零停机重载。',
      },
      {
        slug: 'quick-starts',
        title: '快速上手',
        lede: '不讲原理，直接给出能跑的配置。',
      },
    ],
  },
  {
    title: '配置',
    pages: [
      {
        slug: 'caddyfile',
        title: 'Caddyfile',
        lede: 'Caddyfile 的结构、地址、匹配器、片段与环境变量。',
      },
      {
        slug: 'json',
        title: 'JSON 配置',
        lede: 'Caddy 的原生配置语言，能力完整、可编程、可导出。',
      },
      {
        slug: 'config-adapters',
        title: '配置适配器',
        lede: '不喜欢 JSON？把任意格式转成 JSON 再喂给 Caddy。',
      },
      {
        slug: 'api',
        title: '管理 API',
        lede: '配置的动态下发、遍历与导出，全部走一个本地端点。',
      },
      {
        slug: 'command-line',
        title: '命令行',
        lede: 'run、start、stop、reload、adapt、fmt，以及那些开箱即用的子命令。',
      },
    ],
  },
  {
    title: 'HTTPS',
    pages: [
      {
        slug: 'automatic-https',
        title: '自动 HTTPS',
        lede: '签发、续期、跳转，Caddy 是第一个默认就这么做的服务器。',
      },
      {
        slug: 'running',
        title: '运行与守护',
        lede: '交给 systemd，或者用容器跑；把端口和数据目录安排妥当。',
      },
    ],
  },
  {
    title: '深入',
    pages: [
      {
        slug: 'architecture',
        title: '架构',
        lede: 'Caddy 不只是 Web 服务器，它是一个运行长期 Go 程序的平台。',
      },
      {
        slug: 'modules',
        title: '模块',
        lede: '命名空间、标准模块清单，以及怎么把插件编译进二进制。',
      },
      {
        slug: 'features',
        title: '特性总览',
        lede: '把 Caddy 的能力摊开看一遍。',
      },
    ],
  },
];

export const DOC_PAGES: Array<DocEntry & { group: string }> = DOC_GROUPS.flatMap((group) =>
  group.pages.map((page) => ({ ...page, group: group.title })),
);

export function findDoc(slug: string) {
  const index = DOC_PAGES.findIndex((page) => page.slug === slug);
  if (index < 0) return null;
  return {
    page: DOC_PAGES[index]!,
    prev: index > 0 ? DOC_PAGES[index - 1]! : null,
    next: index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1]! : null,
  };
}

export function docHref(slug: string) {
  return `/docs/${slug}`;
}
