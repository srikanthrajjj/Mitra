import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { TECH_STAGES } from './techData';

gsap.registerPlugin(ScrollTrigger);

/** Scroll-pinned story: one viewport, five stages, progress driven by scroll. */
export function TechLifecycle() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * TECH_STAGES.length * 0.7}`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(TECH_STAGES.length - 1, Math.floor(self.progress * TECH_STAGES.length));
          setActive(idx);
          if (barRef.current) gsap.set(barRef.current, { scaleY: self.progress });
        },
      });
      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  const stage = TECH_STAGES[active];
  const Icon = stage.icon;

  return (
    <section
      ref={sectionRef}
      id="lifecycle"
      className="relative flex min-h-screen items-center py-24 lg:py-0"
    >
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">The delivery lifecycle</p>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] md:text-6xl">
            From requirements to go-live, one agent per stage.
          </h2>

          <div className="relative mt-10 pl-6">
            <div className="absolute bottom-1 left-0 top-1 w-px bg-border" />
            <div
              ref={barRef}
              className="absolute bottom-1 left-0 top-1 w-px origin-top bg-brand-green"
              style={{ transform: 'scaleY(0)' }}
            />
            <ol className="space-y-1">
              {TECH_STAGES.map((s, i) => (
                <li key={s.num}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      'flex w-full items-baseline gap-4 rounded-lg px-3 py-2 text-left transition-colors',
                      i === active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className={cn('font-mono text-xs', i === active && 'text-brand-green')}>{s.num}</span>
                    <span className="font-display text-lg font-semibold md:text-xl">{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="relative min-h-[19rem] overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.num}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-brand-green">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Stage {stage.num}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold md:text-3xl">{stage.summary}</h3>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{stage.detail}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {stage.outputs.map((o) => (
                  <li
                    key={o}
                    className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs text-foreground"
                  >
                    {o}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
