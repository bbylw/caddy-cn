import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../lib/use-prefers-reduced-motion';

/** 共享时间轴长度，所有数值都按它换算成百分比 */
const AXIS = 72;

type Stream = {
  /** 请求条起点（轴单位） */
  s: number;
  /** 请求条长度（轴单位） */
  w: number;
  /** 排队等待区间，仅 HTTP/1.1 有 */
  q?: [number, number];
};

type Protocol = {
  id: string;
  name: string;
  conns: string;
  handshake: string;
  /** 每条连接各自握手的行索引 */
  perLane?: number[];
  /** 一条共享的握手条 */
  shared?: { s: number; w: number };
  streams: Stream[];
  notes: string[];
  lane: 'lane-1' | 'lane-2' | 'lane-3';
};

const STREAM_WIDTHS = [22, 33, 25, 40, 29, 36, 26, 30];

const PROTOCOLS: Protocol[] = [
  {
    id: 'h1',
    name: 'HTTP/1.1',
    conns: '6 条 TCP 连接',
    handshake: '每条连接各自握手',
    perLane: [0, 1, 2, 3, 4, 5],
    streams: [
      { s: 14, w: 22 },
      { s: 14, w: 33 },
      { s: 14, w: 25 },
      { s: 14, w: 40 },
      { s: 14, w: 29 },
      { s: 14, w: 36 },
      { q: [14, 36], s: 36, w: 26 },
      { q: [14, 39], s: 39, w: 30 },
    ],
    notes: ['超过并发上限的请求要排队', '连接内串行，一个慢请求堵住一条连接'],
    lane: 'lane-1',
  },
  {
    id: 'h2',
    name: 'HTTP/2',
    conns: '1 条 TCP 连接',
    handshake: '1 次 TLS 握手',
    shared: { s: 0, w: 14 },
    streams: STREAM_WIDTHS.map((w) => ({ s: 14, w })),
    notes: ['所有请求在同一条连接上多路复用', '丢包会让全部流一起等重传'],
    lane: 'lane-2',
  },
  {
    id: 'h3',
    name: 'HTTP/3',
    conns: '1 条 QUIC 连接',
    handshake: '0-RTT 恢复',
    shared: { s: 0, w: 3 },
    streams: STREAM_WIDTHS.map((w) => ({ s: 3, w })),
    notes: ['基于 UDP，握手与传输不再互相牵制', '丢包只影响丢的那一条流'],
    lane: 'lane-3',
  },
];

const pct = (v: number) => `${(v / AXIS) * 100}%`;
const endOf = (p: Protocol) =>
  Math.max(...p.streams.map((s) => s.s + s.w), p.shared ? p.shared.w : 0);

/** 类名必须以字面量出现，Tailwind 才能扫描到 */
const LANE_BG: Record<Protocol['lane'], string> = {
  'lane-1': 'bg-lane-1',
  'lane-2': 'bg-lane-2',
  'lane-3': 'bg-lane-3',
};
const LANE_DOT: Record<Protocol['lane'], string> = {
  'lane-1': 'var(--lane-1)',
  'lane-2': 'var(--lane-2)',
  'lane-3': 'var(--lane-3)',
};

type Phase = 'idle' | 'armed' | 'running';

export default function ProtocolTimeline() {
  const reduce = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const replayTimer = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [runId, setRunId] = useState(0);

  useEffect(
    () => () => {
      if (replayTimer.current !== null) window.clearTimeout(replayTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (reduce) {
      setPhase('idle');
      return;
    }
    setPhase('armed');
    const host = hostRef.current;
    if (!host || !('IntersectionObserver' in window)) {
      setPhase('running');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();
          setPhase('running');
        }
      },
      { threshold: 0.2 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduce, runId]);

  const replay = useCallback(() => {
    setPhase('armed');
    if (replayTimer.current !== null) window.clearTimeout(replayTimer.current);
    replayTimer.current = window.setTimeout(() => setRunId((n) => n + 1), 30);
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] text-ink-3">
          8 个资源 · 共享时间轴 · 时序为示意，非基准测试数据
        </p>
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-7 items-center gap-1.5 rounded-ctl px-2 font-mono text-[11px] text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowsClockwiseIcon size={13} aria-hidden="true" /> 重播
        </button>
      </div>

      <div
        ref={hostRef}
        key={runId}
        data-phase={phase}
        className="pt-panel grid gap-8 md:grid-cols-3 md:gap-6"
      >
        {PROTOCOLS.map((p) => (
          <article key={p.id} className="min-w-0">
            <header className="flex items-baseline justify-between gap-3">
              <h3 className="font-mono text-[14px] font-medium tracking-tight">{p.name}</h3>
              <span className="font-mono text-[11px] text-ink-3">{p.conns}</span>
            </header>

            <p className="mt-1 font-mono text-[11px] text-ink-3">{p.handshake}</p>

            <div className="relative mt-4">
              {/* 时间轴刻度 */}
              <div className="pointer-events-none absolute inset-0 flex justify-between" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-full w-px bg-[var(--hair)] opacity-60" />
                ))}
              </div>

              {/* 共享握手条 */}
              {p.shared ? (
                <div className="relative mb-2 h-[7px]">
                  <span
                    className="pt-bar absolute inset-y-0 left-0 block rounded-[2px] bg-[var(--hair-2)]"
                    style={{
                      left: pct(p.shared.s),
                      width: pct(p.shared.w),
                      animationDelay: '0ms',
                    }}
                  />
                </div>
              ) : null}

              {/* 8 条流 */}
              <ol className="flex flex-col gap-[3px]">
                {p.streams.map((s, i) => (
                  <li key={i} className="relative h-[11px]">
                    {s.q ? (
                      <span
                        className="absolute inset-y-[3px] left-0 block rounded-[2px] bg-[var(--hair)]"
                        style={{ left: pct(s.q[0]), width: pct(s.q[1] - s.q[0]) }}
                        title="排队等待空闲连接"
                      />
                    ) : null}
                    {p.perLane?.includes(i) ? (
                      <span
                        className="absolute inset-y-0 left-0 block rounded-[2px] bg-[var(--hair-2)]"
                        style={{ left: '0%', width: pct(s.s) }}
                        title="TCP + TLS 握手"
                      />
                    ) : null}
                    <span
                      className={`pt-bar absolute inset-y-0 block rounded-[2px] ${LANE_BG[p.lane]}`}
                      style={{
                        left: pct(s.s),
                        width: pct(s.w),
                        animationDelay: `${120 + i * 70}ms`,
                      }}
                    />
                    <span className="absolute inset-y-0 -left-6 grid w-5 place-items-center font-mono text-[9.5px] text-ink-3">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </li>
                ))}
              </ol>

              {/* 全部完成标记 */}
              <div
                className="absolute top-0 bottom-0 w-px border-l border-dashed border-[var(--hair-2)]"
                style={{ left: pct(endOf(p)) }}
                aria-hidden="true"
              />
            </div>

            <ul className="mt-4 flex flex-col gap-1.5">
              {p.notes.map((note) => (
                <li
                  key={note}
                  className="flex gap-2 border-t border-hair pt-1.5 text-[12.5px] leading-snug text-ink-2"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-pill"
                    style={{ background: LANE_DOT[p.lane] }}
                    aria-hidden="true"
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
