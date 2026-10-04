/* 全站客户端脚本：主题切换、入场揭示、代码复制、顶栏菜单。 */

const THEME_KEY = 'caddy-theme';

declare global {
  interface Window {
    __caddyPage?: boolean;
  }
}

function currentTheme(): 'light' | 'dark' {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(next: 'light' | 'dark') {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* 隐私模式下忽略 */
  }
}

export function toggleTheme() {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
}

/* ---------- 入场揭示 ---------- */
function setupReveal() {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => io.observe(el));
}

/* ---------- 代码复制 ---------- */
function setupCopy() {
  document.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      '[data-copy]',
    );
    if (!btn) return;

    const raw = btn.dataset.copy ?? '';
    const text = raw
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    const done = () => {
      btn.dataset.state = 'done';
      window.setTimeout(() => {
        btn.dataset.state = 'idle';
      }, 1600);
    };

    navigator.clipboard?.writeText(text).then(done).catch(() => {
      btn.dataset.state = 'error';
      window.setTimeout(() => {
        btn.dataset.state = 'idle';
      }, 1600);
    });
  });
}

/* ---------- 移动端菜单 ---------- */
function setupMenu() {
  document.addEventListener('click', (event) => {
    const el = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-menu-toggle]');
    if (!el) return;
    const open = document.documentElement.dataset.menu === 'open';
    document.documentElement.dataset.menu = open ? 'closed' : 'open';
    el.setAttribute('aria-expanded', String(!open));
  });
}

if (!window.__caddyPage) {
  window.__caddyPage = true;
  setupReveal();
  setupCopy();
  setupMenu();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.documentElement.dataset.menu === 'open') {
      document.documentElement.dataset.menu = 'closed';
      document
        .querySelector('[data-menu-toggle]')
        ?.setAttribute('aria-expanded', 'false');
    }
  });
}
