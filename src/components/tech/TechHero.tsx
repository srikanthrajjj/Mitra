import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import { TechHeroField } from './TechHeroField';
import { TECH_HERO, TECH_STAGES } from './techData';

const EASE = [0.22, 1, 0.36, 1] as const;
const WORDS = ['define', 'design', 'build', 'test', 'document', 'deploy'] as const;

/** Kinetic verb: slides through the lifecycle stages. Static for reduced motion. */
function CyclingLine() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(2);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2300);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <motion.span layout transition={{ duration: 0.5, ease: EASE }} className="inline-flex items-baseline gap-[0.26em]">
      <motion.span
        layout
        transition={{ duration: 0.5, ease: EASE }}
        className="relative inline-flex overflow-hidden pb-[0.2em] -mb-[0.2em]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={WORDS[i]}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="inline-block text-brand-green"
          >
            {WORDS[i]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <motion.span layout transition={{ duration: 0.5, ease: EASE }}>
        ServiceNow.
      </motion.span>
    </motion.span>
  );
}

const CHIPS = [
  { stage: 0, className: 'left-[5%] top-[30%]', dur: 6.5 },
  { stage: 1, className: 'left-[9%] top-[56%]', dur: 7.5 },
  { stage: 2, className: 'right-[6%] top-[27%]', dur: 7 },
  { stage: 3, className: 'right-[10%] top-[50%]', dur: 6 },
  { stage: 4, className: 'right-[4%] top-[70%]', dur: 8 },
] as const;

interface TechHeroProps {
  onGetStarted: () => void;
}

/**
 * Dark hero: kinetic headline, cursor-reactive dot grid, floating lifecycle chips and a
 * scroll-driven shader background. The live demo panel follows directly below.
 */
export function TechHero({ onGetStarted }: TechHeroProps) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="dark relative overflow-hidden bg-background pb-16 pt-36 text-foreground md:pb-24 md:pt-44"
    >
      <TechHeroField className="absolute inset-0 opacity-80" />
      {/* Dots brighten around the cursor */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(hsl(var(--foreground)/0.5)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(240px_circle_at_var(--mx,50%)_var(--my,35%),black,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(hsl(var(--foreground)/0.1)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
        aria-hidden
      />

      {CHIPS.map((c) => {
        const s = TECH_STAGES[c.stage];
        const Icon = s.icon;
        return (
          <motion.div
            key={s.num}
            aria-hidden
            className={cn(
              'pointer-events-none absolute hidden items-center gap-2 rounded-full border border-border bg-card/70 py-2 pl-2.5 pr-4 text-xs font-semibold backdrop-blur-md xl:flex',
              c.className,
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
            transition={{
              opacity: { duration: 0.8, delay: 1 + c.stage * 0.12 },
              scale: { duration: 0.8, delay: 1 + c.stage * 0.12 },
              y: { duration: c.dur, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-background">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {s.title}
          </motion.div>
        );
      })}

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-brand-green backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
          {TECH_HERO.eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="mt-8 font-display text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-7xl md:text-[5.25rem]"
        >
          AI agents that
          <br />
          <CyclingLine />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {TECH_HERO.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button variant="cta" size="lg" onClick={onGetStarted} className="group rounded-full px-7">
            Try IlluminAIte
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <a
            href="#demo"
            className="rounded-full border border-border bg-card/70 px-7 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-accent"
          >
            Watch it build
          </a>
        </motion.div>
      </div>
    </section>
  );
}
