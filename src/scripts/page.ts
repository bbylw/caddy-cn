/* 全站客户端脚本：入场揭示、代码复制、顶栏菜单。 */

export {};

declare global {
  interface Window {
    __caddyPage?: boolean;
  }
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

    // dataset.copy 返回的已是解码后的文本，切勿再手工反转义。
    const text = btn.dataset.copy ?? '';

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
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  const setOpen = (open: boolean) => {
    document.documentElement.dataset.menu = open ? 'open' : 'closed';
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.querySelector<HTMLElement>('a,button')?.focus();
    } else {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(document.documentElement.dataset.menu !== 'open');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.documentElement.dataset.menu === 'open') {
      setOpen(false);
    }
  });
}

if (!window.__caddyPage) {
  window.__caddyPage = true;
  setupReveal();
  setupCopy();
  setupMenu();
}
