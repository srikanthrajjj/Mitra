import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { TechHeroEnergy } from './TechHeroEnergy';
import { TECH_HERO } from './techData';
import { tint } from './techStyles';

const EASE = [0.22, 1, 0.36, 1] as const;
const WORDS = ['define', 'design', 'build', 'test', 'document', 'deploy'] as const;
const WIDEST = 'document';
const SWAP_MS = 2600;

/**
 * Simple word swap: the old word slides up and fades while the new one slides in. The
 * slot is as wide as the longest word and the word is right-aligned, so the swap never
 * changes the layout. On small screens "ServiceNow." wraps beneath it.
 */
function SwapWord() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(2);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), SWAP_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <span className="flex flex-wrap items-center justify-center gap-x-[0.24em]">
      <span
        className="relative inline-block overflow-hidden"
        style={{ paddingBottom: '0.16em', marginBottom: '-0.16em' }}
        aria-label="define, design, build, test, document or deploy"
      >
        <span className="invisible block" aria-hidden>
          {WIDEST}
        </span>
        <AnimatePresence initial={false}>
          <motion.span
            key={WORDS[i]}
            aria-hidden
            className="absolute inset-x-0 top-0 block text-center text-brand-green sm:text-right"
            initial={{ y: '70%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-70%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {WORDS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>ServiceNow.</span>
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
  return (
    <section
      style={{ backgroundColor: tint(4) }}
      className="dark relative flex min-h-[100dvh] items-center justify-center overflow-hidden pb-24 pt-32 text-foreground"
    >
      <TechHeroEnergy className="absolute inset-0 [mask-image:radial-gradient(ellipse_90%_85%_at_50%_45%,black_45%,transparent_100%)]" />

      <div className="relative mx-auto w-full max-w-[100rem] px-5 text-center">
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
          className="mt-9 font-display text-[clamp(2.7rem,8.2vw,8.5rem)] font-extrabold leading-[1.02] tracking-[-0.05em] [-webkit-text-stroke:0.028em_currentColor]"
        >
          <span className="block">AI agents that</span>
          <SwapWord />
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
