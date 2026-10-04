import { useRef, type KeyboardEvent } from 'react';

/**
 * ARIA tabs 键盘模式：roving tabindex + 方向键 / Home / End。
 * 返回挂到 tablist 与每个 tab 上的 props，不规定标记结构，交由调用方决定视觉。
 */
export function useTabList(
  count: number,
  active: number,
  onSelect: (index: number) => void,
) {
  const refs = useRef<Array<HTMLElement | null>>([]);

  const setTabRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (active + 1) % count;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (active - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };

  return {
    onKeyDown,
    setTabRef,
    tabIndex: (index: number) => (index === active ? 0 : -1),
  };
}
