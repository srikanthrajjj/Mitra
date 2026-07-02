import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HERO, PLATFORM_PILLARS } from './echelonLandingData';

const PILLAR_MS = 5500;
const MAX_ITEMS = 4;

function parseItem(item: string) {
  const [label, ...rest] = item.split(': ');
  return { label, detail: rest.join(': ') };
}

interface LandingPlatformPanelProps {
  activePillar: string;
  onPillarChange: (id: string) => void;
  onGetStarted: () => void;
}

export function LandingPlatformPanel({
  activePillar,
  onPillarChange,
  onGetStarted,
}: LandingPlatformPanelProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeIdx = Math.max(
    0,
    PLATFORM_PILLARS.findIndex((p) => p.id === activePillar),
  );
  const pillar = PLATFORM_PILLARS[activeIdx] ?? PLATFORM_PILLARS[0];
  const Icon = pillar.icon;
  const TabIcon = Icon;

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      const next =
        PLATFORM_PILLARS[
          ((idx % PLATFORM_PILLARS.length) + PLATFORM_PILLARS.length) % PLATFORM_PILLARS.length
        ];
      onPillarChange(next.id);
      setProgress(0);
    },
    [onPillarChange],
  );

  useEffect(() => {
    if (!inView || paused || reduceMotion) return;

    const tickMs = 40;
    const increment = (tickMs / PILLAR_MS) * 100;

    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p + increment >= 100) {
          goTo(activeIdx + 1);
          return 0;
        }
        return p + increment;
      });
    }, tickMs);

    return () => clearInterval(id);
  }, [inView, paused, reduceMotion, activeIdx, goTo]);

  const items = pillar.items.slice(0, MAX_ITEMS).map(parseItem);

  const tabButton = (p: (typeof PLATFORM_PILLARS)[number], idx: number, variant: 'rail' | 'pill') => {
    const isActive = p.id === activePillar;
    const PillarIcon = p.icon;

    if (variant === 'pill') {
      return (
        <button
          key={p.id}
          type="button"
          onClick={() => goTo(idx)}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]/60',
            isActive
              ? 'border-[var(--landing-accent)]/50 bg-[var(--landing-accent)]/15 text-white shadow-[0_0_24px_rgba(0,255,102,0.15)]'
              : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/80',
          )}
          aria-current={isActive ? 'true' : undefined}
        >
          <PillarIcon className="h-4 w-4 shrink-0" strokeWidth={2} />
          {p.shortLabel}
        </button>
      );
    }

    return (
      <button
        key={p.id}
        type="button"
        onClick={() => goTo(idx)}
        className={cn(
          'group relative w-full rounded-xl border px-4 py-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]/60',
          isActive
            ? 'border-[var(--landing-accent)]/40 bg-[var(--landing-accent)]/[0.08] shadow-[inset_3px_0_0_var(--landing-accent)]'
            : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.03]',
        )}
        aria-current={isActive ? 'true' : undefined}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
              isActive
                ? 'border-[var(--landing-accent)]/40 bg-[var(--landing-accent)]/15 text-[var(--landing-accent)]'
                : 'border-white/10 bg-white/[0.04] text-white/40 group-hover:text-white/70',
            )}
          >
            <PillarIcon className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                'block text-sm font-semibold tracking-wide',
                isActive ? 'text-white' : 'text-white/55 group-hover:text-white/80',
              )}
            >
              {p.shortLabel}
            </span>
            {isActive && (
              <span className="mt-0.5 block truncate text-xs font-medium text-white/45">{p.title}</span>
            )}
          </div>
        </div>

        {isActive && !reduceMotion && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-[var(--landing-accent)] transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      ref={panelRef}
      className="landing-platform-panel mt-12 overflow-hidden rounded-[1.75rem] border border-[var(--landing-accent)]/20 bg-[#060a08]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="landing-platform-panel-glow pointer-events-none absolute inset-0" aria-hidden />

      {/* Mobile / tablet — large pill tabs */}
      <div className="relative border-b border-white/[0.08] p-4 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PLATFORM_PILLARS.map((p, idx) => tabButton(p, idx, 'pill'))}
        </div>
      </div>

      <div className="relative grid lg:grid-cols-[minmax(0,15.5rem)_1fr]">
        <nav
          className="hidden flex-col gap-2 border-r border-white/[0.08] p-4 lg:flex"
          aria-label="ServiceNow platform capabilities"
        >
          {PLATFORM_PILLARS.map((p, idx) => tabButton(p, idx, 'rail'))}
        </nav>

        <div className="relative min-h-[340px] p-6 md:p-8 lg:min-h-[380px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className="text-xs font-bold tabular-nums tracking-widest text-[var(--landing-accent)]">
              {String(activeIdx + 1).padStart(2, '0')}
              <span className="text-white/25"> / {String(PLATFORM_PILLARS.length).padStart(2, '0')}</span>
            </span>
            {!reduceMotion && inView && (
              <span className="hidden text-[11px] font-medium uppercase tracking-wider text-white/30 sm:block">
                {paused ? 'Paused' : 'Auto-advancing'}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pillar.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--landing-accent)]/35 bg-[var(--landing-accent)]/12 shadow-[0_0_32px_rgba(0,255,102,0.12)]">
                    <TabIcon className="h-7 w-7 text-[var(--landing-accent)]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-white md:text-2xl">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/55 md:text-base">
                      {pillar.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onGetStarted}
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--landing-accent)] px-6 py-3 text-sm font-bold text-black transition-all hover:brightness-110 hover:shadow-[0_0_28px_rgba(0,255,102,0.35)] md:self-start"
                >
                  {HERO.secondaryCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                </button>
              </div>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {items.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.05 + i * 0.06, duration: 0.35 }}
                    className="landing-platform-feature-card rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 transition-colors hover:border-[var(--landing-accent)]/30 hover:bg-[var(--landing-accent)]/[0.06]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--landing-accent)]/15 text-xs font-bold text-[var(--landing-accent)]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-snug text-white">{item.label}</p>
                        {item.detail && (
                          <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/45 md:text-sm">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
