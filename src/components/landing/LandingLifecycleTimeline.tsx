import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { LIFECYCLE_STEPS } from './echelonLandingData';

const STEP_MS = 3800;
const count = LIFECYCLE_STEPS.length;

export function LandingLifecycleTimeline() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((idx: number) => {
    setActiveIdx(((idx % count) + count) % count);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    const tickMs = 40;
    const increment = (tickMs / STEP_MS) * 100;

    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p + increment >= 100) {
          setActiveIdx((i) => (i + 1) % count);
          return 0;
        }
        return p + increment;
      });
    }, tickMs);

    return () => clearInterval(id);
  }, [inView, reduceMotion, activeIdx]);

  const lineProgress =
    count <= 1 ? 100 : (activeIdx / (count - 1)) * 100 + progress / (count - 1);

  return (
    <div ref={containerRef} className="landing-lifecycle-timeline mt-14">
      {/* Desktop horizontal timeline */}
      <div className="relative hidden md:block">
        <div className="absolute top-8 right-[10%] left-[10%] h-0.5 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--landing-accent)]/40 via-[var(--landing-accent)] to-[var(--landing-accent)]/80"
            animate={{ width: `${Math.min(lineProgress, 100)}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          />
        </div>

        <div className="relative grid grid-cols-5 gap-3">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const state =
              idx < activeIdx ? 'complete' : idx === activeIdx ? 'active' : 'upcoming';

            return (
              <button
                key={step.title}
                type="button"
                onClick={() => goTo(idx)}
                className="group flex flex-col items-center text-center focus:outline-none"
                aria-current={state === 'active' ? 'step' : undefined}
                aria-label={`Step ${step.num}: ${step.title}`}
              >
                <div
                  className={cn(
                    'relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-500',
                    state === 'active' &&
                      'border-[var(--landing-accent)] bg-[#0a1610] shadow-[0_0_32px_rgba(0,255,102,0.35)] scale-110',
                    state === 'complete' &&
                      'border-[var(--landing-accent)]/50 bg-[#0a1210] shadow-[0_0_16px_rgba(0,255,102,0.12)]',
                    state === 'upcoming' &&
                      'border-white/10 bg-[#080a0c] opacity-45 group-hover:opacity-70',
                  )}
                >
                  {state === 'active' && !reduceMotion && (
                    <span className="absolute inset-0 animate-ping rounded-full border border-[var(--landing-accent)]/30" />
                  )}
                  <img src={step.iconSrc} alt="" className="relative h-9 w-9 object-contain" />
                </div>
                <span
                  className={cn(
                    'font-mono text-[11px] font-bold transition-colors',
                    state === 'active' ? 'text-[var(--landing-accent)]' : 'text-white/30',
                  )}
                >
                  {step.num}
                </span>
                <h3
                  className={cn(
                    'mt-1 text-sm font-semibold transition-colors',
                    state === 'active' ? 'text-white' : state === 'complete' ? 'text-white/70' : 'text-white/35',
                  )}
                >
                  {step.title}
                </h3>
                <p className="mt-1 text-[11px] leading-snug text-white/35">{step.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical timeline */}
      <div className="md:hidden">
        <div className="relative pl-8">
          <div className="absolute top-2 bottom-2 left-[1.15rem] w-0.5 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="w-full rounded-full bg-[var(--landing-accent)]"
              animate={{
                height: `${((activeIdx + progress / 100) / (count - 1)) * 100}%`,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            />
          </div>

          <div className="space-y-4">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const state =
                idx < activeIdx ? 'complete' : idx === activeIdx ? 'active' : 'upcoming';
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={cn(
                    'relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all',
                    state === 'active'
                      ? 'border-[var(--landing-accent)]/30 bg-[var(--landing-accent)]/[0.06]'
                      : 'border-white/[0.05] bg-white/[0.02]',
                    state === 'upcoming' && 'opacity-50',
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-5 -left-[1.6rem] flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[#06080a]',
                      state === 'active' ? 'border-[var(--landing-accent)]' : 'border-white/15',
                    )}
                  >
                    <img src={step.iconSrc} alt="" className="h-4 w-4 object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[10px] font-bold text-[var(--landing-accent)]">{step.num}</span>
                    <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                    <p className="mt-0.5 text-xs text-white/40">{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
