import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { TECH_HERO } from './techData';
import { tint } from './techStyles';

const EASE = [0.22, 1, 0.36, 1] as const;
const WORDS = ['define', 'design', 'build', 'test', 'document', 'deploy'] as const;
/** The first word repeats at the end so the reel can roll forward forever, then snap back. */
const REEL = [...WORDS, WORDS[0]] as const;
const STEP_MS = 2400;
const ROLL_S = 0.8;
const LINE = 1.1; // line height in em

function ReelWord({ word, index, pos }: { word: string; index: number; pos: MotionValue<number> }) {
  const opacity = useTransform(pos, (p) => Math.max(0, 1 - Math.abs(p - index) * 1.5));
  const filter = useTransform(pos, (p) => `blur(${Math.min(6, Math.abs(p - index) * 6)}px)`);
  const scale = useTransform(pos, (p) => 1 - Math.min(0.1, Math.abs(p - index) * 0.1));
  return (
    <motion.span
      className="block text-center text-brand-green will-change-transform"
      style={{ height: `${LINE}em`, lineHeight: `${LINE}em`, opacity, filter, scale }}
    >
      {word}
    </motion.span>
  );
}

/**
 * Slot-reel verb on its own line, so nothing sits beside it that could shift when the
 * word changes length. The box has a fixed height; one position value drives the roll and
 * a blur cross-fade, so the swap is purely vertical and never moves the layout.
 */
function CyclingWord() {
  const reduced = useReducedMotion();
  const pos = useMotionValue(2);
  const idx = useRef(2);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      idx.current += 1;
      const target = idx.current;
      animate(pos, target, { duration: ROLL_S, ease: [0.65, 0, 0.35, 1] }).then(() => {
        if (target >= WORDS.length) {
          idx.current = 0;
          pos.jump(0);
        }
      });
    }, STEP_MS);
    return () => clearInterval(id);
  }, [reduced, pos]);

  const y = useTransform(pos, (p) => `${-p * LINE}em`);

  return (
    <span
      className="relative block overflow-hidden"
      style={{ height: `${LINE}em`, paddingBottom: '0.14em', marginBottom: '-0.14em', contain: 'layout paint' }}
      role="text"
      aria-label="define, design, build, test, document or deploy"
    >
      <motion.span className="block" style={{ y }} aria-hidden>
        {REEL.map((w, i) => (
          <ReelWord key={`${w}-${i}`} word={w} index={i} pos={pos} />
        ))}
      </motion.span>
    </span>
  );
}

interface TechHeroProps {
  onGetStarted: () => void;
}

/**
 * Full-height dark hero: a big kinetic headline over a cursor-reactive dot grid. The live
 * demo panel follows below the fold.
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
      style={{ backgroundColor: tint(4) }}
      className="dark relative flex min-h-[100dvh] items-center justify-center overflow-hidden pb-24 pt-32 text-foreground"
    >
      {/* Dots brighten around the cursor */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(hsl(var(--foreground)/0.55)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,40%),black,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(hsl(var(--foreground)/0.1)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 text-center">
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
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="mt-9 font-display text-[clamp(2.4rem,7.2vw,6.9rem)] font-extrabold leading-[1.04] tracking-[-0.05em]"
        >
          <span className="block">AI agents that</span>
          <CyclingWord />
          <span className="block">ServiceNow.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          className="mx-auto mt-9 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl lg:text-2xl"
        >
          {TECH_HERO.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Button variant="cta" size="lg" onClick={onGetStarted} className="group h-14 rounded-full px-9 text-base">
            Try IlluminAIte
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <a
            href="#demo"
            className="inline-flex h-14 items-center rounded-full border border-border bg-card/70 px-9 text-base font-semibold backdrop-blur transition-colors hover:bg-accent"
          >
            Watch it build
          </a>
        </motion.div>
      </div>

      <motion.a
        href="#demo"
        aria-label="Scroll to the live demo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-16 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground sm:flex"
      >
        Scroll
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
