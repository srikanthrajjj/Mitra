import { useCallback, useEffect, useRef } from 'react';
import {
  motion,
  stagger,
  useAnimate,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { cn } from '@/lib/utils';
import { BLOB, tint } from './techStyles';

const EASE = [0.22, 1, 0.36, 1] as const;
const HEADLINE = ['See', 'IlluminAIte', 'build', 'on', 'your', 'instance.'] as const;
const WORDMARK = 'IlluminAIte'.split('');
const LINKS = [
  { label: 'Live demo', href: '#demo' },
  { label: 'Product', href: '#product' },
  { label: 'Outcomes', href: '#outcomes' },
  { label: 'Governance', href: '#trust' },
] as const;

/** Button that leans toward the cursor and springs back (micro-interaction). */
function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 16, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={cn('inline-block p-6', className)}>
      <motion.div style={{ x, y }}>{children}</motion.div>
    </div>
  );
}

/** Nav link with an underline that sweeps in from the left and out to the right. */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="group relative inline-block py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
      {children}
      <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-brand-green transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100" />
    </a>
  );
}

const WORD_CLASS =
  'font-display text-[clamp(3.2rem,15.2vw,17rem)] font-extrabold leading-[0.9] tracking-[-0.05em]';
const OUTLINE = 'text-transparent [-webkit-text-stroke:1.5px_hsl(var(--foreground)/0.2)]';
/** The "AI" in IlluminAIte: letters at these positions get the assistant animation. */
const AI_START = WORDMARK.indexOf('A');

const SHINE_MASK =
  'linear-gradient(105deg, transparent calc(var(--s) * 1% - 24%), black calc(var(--s) * 1%), transparent calc(var(--s) * 1% + 24%))';

/** One wordmark letter: outline plus the scroll-driven green fill, and an optional shine layer. */
function Letter({ ch, clip, shine }: { ch: string; clip: MotionValue<string>; shine?: boolean }) {
  return (
    <span className="relative inline-block">
      <span className={OUTLINE}>{ch}</span>
      <motion.span aria-hidden className="absolute inset-0 text-brand-green" style={{ clipPath: clip }}>
        {ch}
      </motion.span>
      {shine && (
        <span
          aria-hidden
          data-shine
          className="absolute inset-0 text-foreground"
          style={{ ['--s' as string]: -50, maskImage: SHINE_MASK, WebkitMaskImage: SHINE_MASK }}
        >
          {ch}
        </span>
      )}
    </span>
  );
}

/** Four-point sparkle, the common "AI assistant" glyph. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" />
    </svg>
  );
}

const SPARKS = [
  { left: '96%', top: '14%', size: '0.3em', fill: 'fill-foreground' },
  { left: '2%', top: '24%', size: '0.2em', fill: 'fill-brand-green-hover' },
  { left: '58%', top: '-4%', size: '0.15em', fill: 'fill-foreground' },
] as const;

const LIFT = [0.22, 1, 0.36, 1] as const;

/**
 * The "AI" pair. The letters never disappear. A sequence plays every few seconds and when you
 * hover or tap them: the A and I lift with a small spring (the I a beat later), a soft light
 * sweeps across each letter, and three sparkles bloom around them and fade. The rest of the
 * wordmark stays still.
 */
function AssistantPair({ letters, clip }: { letters: string[]; clip: MotionValue<string> }) {
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate();
  const inView = useInView(scope, { amount: 0.5 });
  const running = useRef(false);

  const run = useCallback(async () => {
    if (running.current || reduced || !scope.current) return;
    running.current = true;
    const up = { duration: 0.4, ease: LIFT };
    const settle = { type: 'spring', stiffness: 230, damping: 12 } as const;
    try {
      await Promise.all([
        animate('[data-ai="a"]', { y: '-7%', rotate: -2.5 }, up).then(() =>
          animate('[data-ai="a"]', { y: '0%', rotate: 0 }, settle),
        ),
        animate('[data-ai="i"]', { y: '-11%', rotate: 2.5 }, { ...up, delay: 0.1 }).then(() =>
          animate('[data-ai="i"]', { y: '0%', rotate: 0 }, settle),
        ),
        animate('[data-shine]', { '--s': [-50, 150] }, { duration: 1.15, delay: stagger(0.14, { startDelay: 0.12 }), ease: [0.4, 0, 0.2, 1] }),
        animate(
          '[data-spark]',
          { opacity: [0, 1, 1, 0], scale: [0, 1.15, 0.9, 0], rotate: [-80, 0, 40, 100] },
          { duration: 1.5, delay: stagger(0.16, { startDelay: 0.35 }), ease: 'easeOut' },
        ),
      ]);
    } finally {
      running.current = false;
    }
  }, [animate, reduced, scope]);

  useEffect(() => {
    if (!inView || reduced) return;
    const first = setTimeout(run, 1400);
    const every = setInterval(run, 6500);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [inView, reduced, run]);

  return (
    <span
      ref={scope}
      onPointerEnter={run}
      onClick={run}
      className="relative inline-flex cursor-pointer"
      aria-hidden
    >
      {letters.map((ch, i) => (
        <span key={`${ch}-${i}`} data-ai={i === 0 ? 'a' : 'i'} className="inline-block" style={{ transformOrigin: '50% 92%' }}>
          <Letter ch={ch} clip={clip} shine />
        </span>
      ))}
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        >
          <Sparkle className={`h-full w-full opacity-0 ${s.fill}`} />
          <span data-spark className="absolute inset-0" style={{ opacity: 0 }}>
            <Sparkle className={`h-full w-full ${s.fill}`} />
          </span>
        </span>
      ))}
    </span>
  );
}

/** Large outlined wordmark that fills with green on scroll; only the "AI" animates. */
function Wordmark({ clip }: { clip: MotionValue<string> }) {
  const before = WORDMARK.slice(0, AI_START);
  const pair = WORDMARK.slice(AI_START, AI_START + 2);
  const after = WORDMARK.slice(AI_START + 2);

  return (
    <div className="relative mx-auto max-w-[110rem] select-none overflow-hidden px-2 pt-16 md:px-6 md:pt-24" aria-hidden>
      <motion.p
        className={cn('flex justify-center', WORD_CLASS)}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {before.map((ch, i) => (
          <Letter key={`b-${i}`} ch={ch} clip={clip} />
        ))}
        <AssistantPair letters={pair} clip={clip} />
        {after.map((ch, i) => (
          <Letter key={`a-${i}`} ch={ch} clip={clip} />
        ))}
      </motion.p>
    </div>
  );
}

interface TechFooterProps {
  onGetStarted: () => void;
}

/**
 * Closing scene. An agent-network canvas sits behind a word-by-word headline and a
 * magnetic call to action. Below it, a giant outlined wordmark fills with green as it
 * scrolls into view, and each letter lifts on hover.
 */
export function TechFooter({ onGetStarted }: TechFooterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const headIn = useInView(headRef, { once: true, amount: 0.5 });
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start end', 'end end'] });
  const fill = useSpring(useTransform(scrollYProgress, [0.55, 1], [100, 0]), { stiffness: 90, damping: 24 });
  const clip = useMotionTemplate`inset(${fill}% 0 0 0)`;

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div
      ref={rootRef}
      style={{ backgroundColor: tint(3) }}
      className="dark relative z-10 -mt-10 overflow-hidden rounded-t-[2.5rem] text-foreground md:-mt-14 md:rounded-t-[3.5rem]"
    >
      {/* Finale */}
      <section className="relative">
        <div className={cn(BLOB, 'left-1/2 top-[30%] h-[26rem] w-[40rem] -translate-x-1/2 opacity-40')} aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center md:py-44">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs uppercase tracking-[0.25em] text-brand-green"
          >
            Ready when you are
          </motion.p>
          <h2 ref={headRef} className="mt-6 font-display text-[clamp(2.6rem,8vw,7rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">
            {HEADLINE.map((word, i) => (
              <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-bottom last:mr-0">
                <motion.span
                  className={cn('inline-block', word === 'build' && 'text-brand-green')}
                  initial={false}
                  animate={headIn ? { y: 0, rotate: 0 } : { y: '110%', rotate: 4 }}
                  transition={{ duration: 0.85, ease: EASE, delay: 0.08 + i * 0.07 }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Start from a workshop conversation and finish with a go-live ready ServiceNow implementation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
            className="mt-6"
          >
            <Magnetic>
              <Button variant="cta" size="lg" onClick={onGetStarted} className="group rounded-full px-9 text-base">
                Try IlluminAIte
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      {/* Wordmark */}
      <Wordmark clip={clip} />

      {/* Footer bar */}
      <footer className="relative border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row">
          <IlluminaiteLogo className="h-5 w-auto opacity-80" />
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-1" aria-label="Footer">
            {LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </nav>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <span>© IlluminAIte</span>
            <button
              type="button"
              onClick={toTop}
              aria-label="Back to top"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-brand-green hover:bg-brand-green hover:text-background"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
