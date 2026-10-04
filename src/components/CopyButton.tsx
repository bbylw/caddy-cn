import { CheckIcon, CopyIcon, XIcon } from '@phosphor-icons/react';

/**
 * 复制按钮。data-copy 交给 scripts/page.ts 的委托处理器读写剪贴板并切换 data-state，
 * 三态文案由 global.css 里 .c-copy/.c-check/.c-x 的显隐控制。
 */
export function CopyButton({
  copy,
  ariaLabel,
  className,
  size = 13,
  idle = '复制',
}: {
  copy: string;
  ariaLabel: string;
  className: string;
  size?: number;
  idle?: string;
}) {
  return (
    <button type="button" data-copy={copy} data-state="idle" aria-label={ariaLabel} className={className}>
      <span className="c-copy inline-flex items-center gap-1.5">
        <CopyIcon size={size} /> {idle}
      </span>
      <span className="c-check inline-flex items-center gap-1.5">
        <CheckIcon size={size} /> 已复制
      </span>
      <span className="c-x inline-flex items-center gap-1.5">
        <XIcon size={size} /> 失败
      </span>
    </button>
  );
}
