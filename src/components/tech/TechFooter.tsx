import { useRef } from 'react';
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { cn } from '@/lib/utils';
import { TechAgentMesh } from './TechAgentMesh';

const EASE = [0.22, 1, 0.36, 1] as const;
const HEADLINE = ['See', 'IlluminAIte', 'build', 'on', 'your', 'instance.'] as const;
const WORDMARK = 'IlluminAIte'.split('');
const LINKS = [
  { label: 'Live demo', href: '#demo' },
  { label: 'Product', href: '#product' },
  { label: 'Lifecycle', href: '#lifecycle' },
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
    <div ref={rootRef} className="relative overflow-hidden">
      {/* Finale */}
      <section className="relative">
        <TechAgentMesh className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_75%_at_50%_45%,black_35%,transparent_100%)]" />
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
      <div className="relative select-none px-2 md:px-6" aria-hidden>
        <div className="relative mx-auto max-w-[110rem]">
          <p className="flex justify-center font-display text-[clamp(3.2rem,15.2vw,17rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_hsl(var(--foreground)/0.2)]">
            {WORDMARK.map((ch, i) => (
              <motion.span
                key={`o-${i}`}
                className="inline-block cursor-default"
                initial={{ y: '40%', opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.05 }}
                whileHover={{ y: '-6%', transition: { duration: 0.25 } }}
              >
                {ch}
              </motion.span>
            ))}
          </p>
          <motion.p
            style={{ clipPath: clip }}
            className="pointer-events-none absolute inset-0 flex justify-center font-display text-[clamp(3.2rem,15.2vw,17rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-brand-green"
          >
            {WORDMARK.map((ch, i) => (
              <span key={`f-${i}`} className="inline-block">
                {ch}
              </span>
            ))}
          </motion.p>
        </div>
      </div>

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
