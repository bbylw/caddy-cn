import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { readTheme, toggleTheme, type Theme } from '../lib/theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setReady(true);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme())}
      aria-label={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
      title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
      className="grid size-9 place-items-center rounded-ctl border border-hair text-ink-2 transition-colors hover:border-hair-2 hover:text-ink"
    >
      <span
        className="grid size-4 place-items-center transition-opacity"
        style={{ opacity: ready ? 1 : 0 }}
        aria-hidden="true"
      >
        {theme === 'dark' ? (
          <MoonIcon size={16} weight="regular" />
        ) : (
          <SunIcon size={16} weight="regular" />
        )}
      </span>
    </button>
  );
}
