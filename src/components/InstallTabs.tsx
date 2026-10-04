import { useState } from 'react';
import { useTabList } from '../lib/use-tablist';
import { CopyButton } from './CopyButton';

export interface InstallerView {
  id: string;
  label: string;
  code: string;
  note: string;
  html: string;
}

export default function InstallTabs({ installers }: { installers: InstallerView[] }) {
  const [active, setActive] = useState(0);
  const list = useTabList(installers.length, active, setActive);
  const current = installers[active] ?? installers[0];
  if (!current) return null;
  const panelId = 'install-panel';

  return (
    <div id="install">
      <div
        className="-mx-5 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        role="tablist"
        aria-label="安装方式"
        onKeyDown={list.onKeyDown}
      >
        {installers.map((item, i) => (
          <button
            key={item.id}
            ref={list.setTabRef(i)}
            type="button"
            role="tab"
            id={`install-tab-${item.id}`}
            aria-selected={i === active}
            aria-controls={panelId}
            tabIndex={list.tabIndex(i)}
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

      <div
        className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]"
        role="tabpanel"
        id={panelId}
        aria-labelledby={`install-tab-${current.id}`}
        tabIndex={0}
      >
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
          <CopyButton
            copy={current.code}
            ariaLabel="复制安装命令"
            idle="复制命令"
            size={14}
            className="inline-flex h-9 w-fit items-center gap-1.5 rounded-ctl px-3 text-[12.5px]"
          />
        </div>
      </div>
    </div>
  );
}
