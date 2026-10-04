import { CheckIcon, CopyIcon, XIcon } from '@phosphor-icons/react';
import { useState } from 'react';

export interface InstallerView {
  id: string;
  label: string;
  code: string;
  note: string;
  html: string;
}

export default function InstallTabs({ installers }: { installers: InstallerView[] }) {
  const [active, setActive] = useState(0);
  const current = installers[active]!;

  return (
    <div id="install">
      <div
        className="-mx-5 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        role="tablist"
        aria-label="安装方式"
      >
        {installers.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={[
              'shrink-0 snap-start rounded-pill border px-3.5 py-1.5 text-[13px] transition-colors',
              i === active
                ? 'border-brand bg-brand-veil text-brand'
                : 'border-hair text-ink-2 hover:border-hair-2 hover:text-ink',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="codeblock codeblock--tight">
          <div
            key={current.id}
            className="wb-fade"
            dangerouslySetInnerHTML={{ __html: current.html }}
          />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <p className="border-t border-hair pt-3 text-[13.5px] leading-relaxed text-ink-2">
            {current.note}
          </p>
          <button
            type="button"
            data-copy={current.code}
            data-state="idle"
            aria-label="复制安装命令"
            className="inline-flex h-9 w-fit items-center gap-1.5 rounded-ctl px-3 text-[12.5px]"
          >
            <span className="c-copy inline-flex items-center gap-1.5">
              <CopyIcon size={14} /> 复制命令
            </span>
            <span className="c-check inline-flex items-center gap-1.5">
              <CheckIcon size={14} /> 已复制
            </span>
            <span className="c-x inline-flex items-center gap-1.5">
              <XIcon size={14} /> 失败
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
