import { createHighlighter, type Highlighter } from 'shiki';
import caddyfile from './caddyfile.tmLanguage.json';

export const THEMES = { light: 'github-light', dark: 'github-dark' } as const;

let instance: Promise<Highlighter> | null = null;

function get(): Promise<Highlighter> {
  instance ??= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: [
      'json',
      'bash',
      'nginx',
      'yaml',
      'toml',
      'go',
      'ini',
      'dockerfile',
      'hcl',
      caddyfile as never,
    ],
  });
  return instance;
}

export type CodeLang =
  | 'caddyfile'
  | 'json'
  | 'bash'
  | 'nginx'
  | 'yaml'
  | 'toml'
  | 'go'
  | 'ini'
  | 'dockerfile'
  | 'hcl';

/**
 * 产出同时携带浅色与深色两档颜色的 HTML（defaultColor: false），
 * 由 CSS 变量 --shiki-light / --shiki-dark 在运行时切换。
 */
export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const hl = await get();
  return hl.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
    structure: 'classic',
    transformers: [
      {
        pre(node) {
          const cls = node.properties.class;
          node.properties.class = `${cls ?? ''} shiki codeblock__pre`
            .replace(/\s+/g, ' ')
            .trim();
          node.properties.style = undefined;
          node.properties.tabindex = '0';
        },
        code(node) {
          node.properties.style = undefined;
        },
      },
    ],
  });
}
