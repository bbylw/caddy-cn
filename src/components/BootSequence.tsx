import { ArrowsClockwiseIcon, LockIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../lib/use-prefers-reduced-motion';

interface Line {
  ts: string;
  mod: string;
  msg: string;
  kv?: string;
}

/** Caddy 启动并接管 example.com 时的日志，格式取自真实输出 */
const LINES: Line[] = [
  { ts: '09:14:02.104', mod: 'admin', msg: 'admin endpoint started', kv: 'localhost:2019' },
  { ts: '09:14:02.106', mod: 'caddyfile', msg: 'using adjacent Caddyfile' },
  { ts: '09:14:02.107', mod: 'http.auto_https', msg: 'enabling automatic redirects' },
  { ts: '09:14:02.108', mod: 'tls.cache.maintenance', msg: 'started certificate maintenance' },
  { ts: '09:14:02.109', mod: 'tls.obtain', msg: 'acquiring lock', kv: 'example.com' },
  { ts: '09:14:02.402', mod: 'tls.acme_client', msg: 'trying to solve challenge', kv: 'http-01' },
  { ts: '09:14:03.118', mod: 'tls.acme_client', msg: 'challenge solved', kv: 'http-01' },
  { ts: '09:14:04.276', mod: 'tls.acme_client', msg: 'validations succeeded', kv: 'example.com' },
  {
    ts: '09:14:05.931',
    mod: 'tls',
    msg: 'certificate obtained',
    kv: 'example.com',
  },
  { ts: '09:14:05.933', mod: 'http', msg: 'enabling HTTP/3 listener' },
  {
    ts: '09:14:05.934',
    mod: 'http.log',
    msg: 'server running',
    kv: 'h1, h2, h3',
  },
  { ts: '09:14:05.934', mod: 'caddy', msg: 'serving initial configuration' },
];

const PROTOCOLS = ['HTTP/1.1', 'HTTP/2', 'HTTP/3'];

export default function BootSequence() {
  const reduce = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(reduce ? LINES.length : 0);
  const [runId, setRunId] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (reduce) {
      setShown(LINES.length);
      return;
    }
    setShown(0);
    started.current = false;
  }, [reduce, runId]);

  useEffect(() => {
    if (reduce) return;
    const host = hostRef.current;
    if (!host || started.current) return;

    if (!('IntersectionObserver' in window)) {
      setShown(LINES.length);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          started.current = true;
          let i = 0;
          const timer = window.setInterval(() => {
            i += 1;
            setShown(i);
            if (i >= LINES.length) window.clearInterval(timer);
          }, 220);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduce, runId]);

  const replay = useCallback(() => setRunId((n) => n + 1), []);
  const done = shown >= LINES.length;

  return (
    <div
      ref={hostRef}
      className="overflow-hidden rounded-box border border-hair bg-[var(--paper-2)] shadow-1"
    >
      <div className="flex items-center justify-between gap-3 border-b border-hair px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-ink-3">$</span>
          <span className="font-mono text-[12.5px] text-ink">caddy run</span>
        </div>
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-7 items-center gap-1.5 rounded-ctl px-2 font-mono text-[11px] text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowsClockwiseIcon size={13} aria-hidden="true" /> 重新运行
        </button>
      </div>

      <div className="px-4 py-3">
        <ol className="flex flex-col gap-1">
          {LINES.slice(0, shown).map((line, i) => (
            <li
              key={`${runId}-${line.ts}-${i}`}
              className="wb-item flex min-w-0 items-baseline gap-2 font-mono text-[11.5px] leading-relaxed"
              style={{ animationDelay: '0ms' }}
            >
              <span className="shrink-0 text-ink-3">{line.ts}</span>
              <span className="shrink-0 text-brand">INFO</span>
              <span className="shrink-0 text-ink-2">{line.mod}</span>
              <span className="min-w-0 truncate text-ink">{line.msg}</span>
              {line.kv ? (
                <span className="ml-auto shrink-0 text-ink-3">{line.kv}</span>
              ) : null}
            </li>
          ))}
          {!done ? (
            <li className="font-mono text-[11.5px] text-ink-3">
              <span className="boot-caret">▍</span>
            </li>
          ) : null}
        </ol>
      </div>

      <div className="border-t border-hair">
        <div className="flex items-center gap-3 px-4 py-3">
          <span
            className={[
              'grid size-8 shrink-0 place-items-center rounded-ctl border transition-colors',
              done ? 'border-brand text-brand' : 'border-hair text-ink-3',
            ].join(' ')}
          >
            {done ? <LockIcon size={16} weight="bold" /> : <ShieldCheckIcon size={16} />}
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-[13px] text-ink">example.com</p>
            <p className="mt-0.5 font-mono text-[11px] text-ink-3">
              {done ? "Let's Encrypt · 90 天 · 到期前自动续期" : '等待证书'}
            </p>
          </div>
          <div className="ml-auto flex shrink-0 gap-1.5">
            {PROTOCOLS.map((p, i) => (
              <span
                key={p}
                className={[
                  'rounded-pill border px-2 py-0.5 font-mono text-[10.5px] transition-colors',
                  done
                    ? 'border-brand/40 text-brand'
                    : 'border-hair text-ink-3',
                ].join(' ')}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="h-[2px] bg-brand transition-[width] duration-200 ease-out"
        style={{ width: `${(shown / LINES.length) * 100}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
