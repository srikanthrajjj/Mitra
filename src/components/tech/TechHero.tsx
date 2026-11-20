import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { TECH_HERO } from './techData';
import { BLOB, GLASS_DARK, tint } from './techStyles';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const WORDS = ['define', 'design', 'build', 'test', 'document', 'deploy'] as const;
const WIDEST = 'document';
const SWAP_MS = 2600;

/**
 * Word swap inside a fixed-width highlight box. The box is as wide as the longest word and
 * the word is centred in it, so short words look intentional and the swap never changes the
 * layout. On small screens "ServiceNow." wraps beneath it.
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
    <span className="mt-[0.1em] flex flex-wrap items-center justify-center gap-x-[0.2em]">
      <span
        className="relative inline-block overflow-hidden rounded-[0.22em] border border-brand-green/40 bg-brand-green/[0.14] text-brand-green backdrop-blur-[30px] backdrop-saturate-[1.8] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)]"
        style={{ height: '1.16em', lineHeight: '1.16em', paddingInline: '0.26em' }}
        aria-label="define, design, build, test, document or deploy"
      >
        <span className="invisible block" aria-hidden>
          {WIDEST}
        </span>
        <AnimatePresence initial={false}>
          <motion.span
            key={WORDS[i]}
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pb-[0.04em]"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
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
      {/* Soft ambient light for the glass surfaces */}
      <div className={cn(BLOB, 'left-[12%] top-[18%] h-[24rem] w-[24rem] opacity-60')} aria-hidden />
      <div className={cn(BLOB, 'right-[10%] bottom-[12%] h-[28rem] w-[28rem] opacity-45')} aria-hidden />

      <div className="relative mx-auto w-full max-w-[100rem] px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={cn('mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-brand-green', GLASS_DARK)}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          {TECH_HERO.eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
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
            className={cn('inline-flex h-14 items-center rounded-full px-9 text-base font-semibold transition-colors hover:bg-foreground/10', GLASS_DARK)}
          >
            Watch it build
          </a>
        </motion.div>
      </div>

    </section>
  );
}
