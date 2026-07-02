import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { HERO_STATS } from './echelonLandingData';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, active: boolean, durationMs = 2000): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs]);

  return value;
}

function AnimatedKpiValue({
  target,
  suffix,
  active,
  delayMs = 0,
}: {
  target: number;
  suffix: string;
  active: boolean;
  delayMs?: number;
}) {
  const [delayedActive, setDelayedActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setDelayedActive(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);

  const value = useCountUp(target, delayedActive);

  return (
    <span className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

export function LandingKpiStrip({
  className,
  theme = 'dark',
}: {
  className?: string;
  theme?: 'light' | 'dark';
}) {
  const isDark = theme === 'dark';
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={cn(
        'landing-kpi-strip mx-auto mb-14 max-w-4xl pb-14 transition-opacity duration-700',
        inView ? 'opacity-100' : 'opacity-0',
        isDark ? 'border-b border-white/[0.06]' : 'border-b border-black/[0.08]',
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
        {HERO_STATS.map((stat, idx) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col items-center px-4 text-center',
              idx > 0 && (isDark ? 'md:border-l md:border-white/[0.06]' : 'md:border-l md:border-black/[0.08]'),
            )}
          >
            <div
              className={cn(
                'font-mono text-4xl font-bold leading-none md:text-5xl',
                isDark ? 'text-[var(--landing-accent)]' : 'text-[var(--landing-accent-deep)]',
              )}
            >
              <AnimatedKpiValue
                target={stat.target}
                suffix={stat.suffix}
                active={inView}
                delayMs={idx * 120}
              />
            </div>
            <div className={cn('mt-2 text-sm font-semibold', isDark ? 'text-white/90' : 'text-black/85')}>
              {stat.label}
            </div>
            <p
              className={cn(
                'mt-2 max-w-[15rem] text-xs font-light leading-relaxed',
                isDark ? 'text-white/45' : 'text-black/45',
              )}
            >
              {stat.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
