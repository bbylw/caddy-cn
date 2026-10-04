const THEME_KEY = 'caddy-theme';
const THEME_COLOR: Record<Theme, string> = { light: '#fbfcfd', dark: '#0d1116' };

export type Theme = 'light' | 'dark';

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[next]);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* 隐私模式下忽略写入 */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
