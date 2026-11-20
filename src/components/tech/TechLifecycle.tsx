import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STAGE_VISUALS } from './TechStageVisuals';
import { TECH_STAGES } from './techData';
import { tint } from './techStyles';

gsap.registerPlugin(ScrollTrigger);

const N = TECH_STAGES.length;
/** Background shade per stage: slight green variations that change as you scroll. */
const STAGE_TINTS = [5, 9, 13, 9, 6] as const;

/**
 * Delivery lifecycle. On desktop the section pins and scroll advances a five-stage rail;
 * each stage shows a small example of what that agent produces. Below lg it becomes
 * click-through tabs with no pinning.
 */
export function TechLifecycle() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)', () => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * N * 0.8}`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(N - 1, Math.floor(self.progress * N));
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
      triggerRef.current = trigger;
      return () => {
        trigger.kill();
        triggerRef.current = null;
      };
    });

    return () => mm.revert();
  }, []);

  const go = (i: number) => {
    const t = triggerRef.current;
    if (t) {
      window.scrollTo({ top: t.start + ((i + 0.5) / N) * (t.end - t.start), behavior: 'smooth' });
    } else {
      setActive(i);
    }
  };

  const stage = TECH_STAGES[active];
  const Visual = STAGE_VISUALS[active];

  return (
    <section
      ref={sectionRef}
      id="lifecycle"
      style={{ backgroundColor: tint(STAGE_TINTS[active] ?? STAGE_TINTS[0]) }}
      className="relative flex items-center pb-24 pt-32 transition-[background-color] duration-[900ms] ease-out lg:min-h-screen lg:py-0"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">The delivery lifecycle</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] md:text-6xl">
          From requirements to go‑live, one agent per stage.
        </h2>

        {/* Stage rail */}
        <div className="relative mt-10 md:mt-12">
          <div className="absolute left-[10%] right-[10%] top-5 h-px bg-border" aria-hidden />
          <div
            className="absolute left-[10%] top-5 h-px bg-brand-green transition-[width] duration-700 ease-out"
            style={{ width: `${(active / (N - 1)) * 80}%` }}
            aria-hidden
          />
          <ol className="relative grid grid-cols-5">
            {TECH_STAGES.map((s, i) => {
              const done = i < active;
              const on = i === active;
              return (
                <li key={s.num} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on ? 'step' : undefined}
                    aria-label={`Stage ${s.num}: ${s.title}`}
                    className="group flex flex-col items-center gap-3 outline-none"
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs transition-all duration-500',
                        done && 'border-brand-green bg-brand-green text-background',
                        on && 'scale-110 border-brand-green bg-background text-brand-green shadow-[0_0_0_6px_hsl(var(--ring)/0.18)]',
                        !done && !on && 'border-border bg-background text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {done ? <Check className="h-4 w-4" strokeWidth={3} /> : s.num}
                    </span>
                    <span
                      className={cn(
                        'hidden text-center font-display text-sm font-bold transition-colors sm:block',
                        on ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      {s.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Stage panel */}
        <div className="mt-10 grid grid-cols-1 gap-8 rounded-3xl border border-border bg-card p-6 md:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${stage.num}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0 flex-col"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Stage {stage.num}</p>
              <h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">{stage.title}</h3>
              <p className="mt-3 font-display text-lg font-semibold leading-snug">{stage.summary}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{stage.detail}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {stage.outputs.map((o) => (
                  <li key={o} className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs">
                    {o}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`vis-${stage.num}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              <Visual />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
