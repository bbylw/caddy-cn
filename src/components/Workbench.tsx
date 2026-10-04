import { CheckIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTabList } from '../lib/use-tablist';
import { CopyButton } from './CopyButton';

export interface ScenarioView {
  id: string;
  name: string;
  summary: string;
  caddyfile: string;
  json: string;
  caddyfileHtml: string;
  jsonHtml: string;
  effects: string[];
}

type Tab = 'caddyfile' | 'json';

const TABS: Array<[Tab, string]> = [
  ['caddyfile', 'Caddyfile'],
  ['json', '适配后的 JSON'],
];

export default function Workbench({ scenarios }: { scenarios: ScenarioView[] }) {
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<Tab>('caddyfile');
  const list = useTabList(scenarios.length, active, setActive);
  const current = scenarios[active] ?? scenarios[0];
  if (!current) return null;
  const raw = tab === 'caddyfile' ? current.caddyfile : current.json;
  const html = tab === 'caddyfile' ? current.caddyfileHtml : current.jsonHtml;
  const panelId = 'workbench-panel';

  return (
    <div
      id="workbench"
      className="grid gap-6 lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-8"
    >
      {/* 场景选择：桌面竖排，移动端横向 scroll-snap */}
      <div
        className="-mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        role="tablist"
        aria-label="配置场景"
        onKeyDown={list.onKeyDown}
      >
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            ref={list.setTabRef(i)}
            type="button"
            role="tab"
            id={`workbench-tab-${s.id}`}
            aria-selected={i === active}
            aria-controls={panelId}
            tabIndex={list.tabIndex(i)}
            onClick={() => setActive(i)}
            className={[
              'shrink-0 snap-start rounded-ctl border px-3.5 py-2.5 text-left transition-colors lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-3',
              i === active
                ? 'border-brand text-brand lg:border-l-brand lg:bg-[var(--paper-2)]'
                : 'border-hair text-ink-2 hover:border-hair-2 hover:text-ink lg:border-l-hair lg:bg-transparent',
            ].join(' ')}
          >
            <span
              className={[
                'block text-[13.5px] font-medium',
                i === active ? 'text-brand' : 'text-ink',
              ].join(' ')}
            >
              {s.name}
            </span>
            <span className="mt-1 hidden text-[12px] leading-snug text-ink-3 lg:block">
              {s.summary}
            </span>
          </button>
        ))}
      </div>

      <div
        className="min-w-0"
        role="tabpanel"
        id={panelId}
        aria-labelledby={`workbench-tab-${current.id}`}
        tabIndex={0}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-ctl border border-hair bg-[var(--paper-2)] p-1">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                className={[
                  'rounded-[6px] px-3 py-1.5 font-mono text-[12px] tracking-wide transition-colors',
                  tab === id
                    ? 'bg-[var(--paper)] text-ink shadow-1'
                    : 'text-ink-3 hover:text-ink-2',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
          <CopyButton
            copy={raw}
            ariaLabel="复制当前配置"
            size={13}
            className="inline-flex h-8 items-center gap-1.5 rounded-ctl px-2.5 text-[12px]"
          />
        </div>

        <div className="codeblock codeblock--tight">
          <div
            key={`${current.id}-${tab}`}
            className="wb-fade"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <p className="mt-2 font-mono text-[11px] text-ink-3">
          {tab === 'caddyfile'
            ? 'Caddy 的原生配置是 JSON，Caddyfile 只是它的一种写法。'
            : 'caddy adapt 的输出，此处为节选。'}
        </p>

        <div className="mt-6">
          <p className="mono mb-3">Caddy 自动完成</p>
          <ul key={current.id} className="flex flex-col">
            {current.effects.map((effect, i) => (
              <li
                key={effect}
                className="wb-item flex gap-3 border-t border-hair py-2.5 text-[13.5px] leading-relaxed text-ink-2"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CheckIcon
                  size={15}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>{effect}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
