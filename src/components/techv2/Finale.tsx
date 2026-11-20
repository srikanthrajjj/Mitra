import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ArrowUp, ShieldCheck } from 'lucide-react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import { TECH_PILLARS, TECH_STAGES } from '../tech/techData';
import { AmbientGlow } from './AmbientGlow';

const COLUMN = 'mx-auto w-full max-w-[1056px] border-x border-dashed border-border';
const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Governance: the five stages with a human gate between each one      */
/* ------------------------------------------------------------------ */

function GovernedFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const last = TECH_STAGES.length - 1;

  // The build moves through the stages on its own; each hop waits at a gate for approval.
  useEffect(() => {
    if (reduce) {
      setActive(last);
      return;
    }
    if (!inView) return;
    const id = window.setInterval(() => setActive((a) => (a >= last + 1 ? 0 : a + 1)), 1700);
    return () => window.clearInterval(id);
  }, [inView, reduce, last]);

  return (
    <div ref={ref} className="px-6 pb-16 md:px-12 md:pb-24">
      <div className="flex flex-col items-stretch lg:flex-row lg:items-stretch">
        {TECH_STAGES.map((s, i) => {
          const Icon = s.icon;
          const here = active === i;
          const passed = active > i;
          return (
            <div key={s.title} className="flex flex-col items-stretch lg:flex-1 lg:flex-row lg:items-stretch">
              <div
                className={cn(
                  'relative rounded-2xl border bg-mitra-surface p-5 transition-all duration-700 lg:flex-1',
                  here ? 'border-brand-green/70' : passed ? 'border-brand-green/30' : 'border-border',
                )}
              >
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-2xl bg-brand-green/[0.07] transition-opacity duration-700',
                    here ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between">
                  <Icon className={cn('h-5 w-5 transition-colors duration-700', here || passed ? 'text-brand-green' : 'text-muted-foreground')} aria-hidden />
                  <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground">{s.num}</span>
                </div>
                <p className="relative mt-5 font-display text-lg font-semibold tracking-[-0.02em]">{s.title}</p>
                <p className="relative mt-1.5 text-[13px] leading-snug text-muted-foreground">{s.outputs.slice(0, 2).join(' · ')}</p>
              </div>

              {i < last && (
                <div className="relative mx-auto flex h-14 w-px items-center justify-center lg:h-px lg:w-14 lg:shrink-0 lg:self-center">
                  <div className="absolute inset-0 bg-border" aria-hidden />
                  <div
                    className="absolute left-0 top-0 h-full w-full origin-top bg-brand-green transition-transform duration-1000 ease-out lg:origin-left"
                    style={{ transform: passed || (here && active > i) ? 'scale(1)' : 'scale(0)' }}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'absolute grid h-7 w-7 place-items-center rounded-full border bg-background transition-colors duration-700',
                      active > i ? 'border-brand-green text-brand-green' : 'border-border text-muted-foreground',
                    )}
                    title="Human approval"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Nothing is promoted until a person approves it
      </p>
    </div>
  );
}

export function GovernanceFlow() {
  return (
    <section id="trust" className={cn(COLUMN, 'relative border-b border-border')}>
      <AmbientGlow intensity={0.3} />
      <div data-reveal className="relative px-6 py-20 md:px-12 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green">Governance</p>
        <h2 className="mt-4 max-w-[760px] font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          Fast for the team. Safe for the platform.
        </h2>
        <p className="mt-5 max-w-[560px] text-lg leading-snug text-muted-foreground">
          Agents do the work at every stage, and a person approves every step before it moves on.
        </p>
      </div>
      <div className="relative">
        <GovernedFlow />
      </div>
      <div className="relative grid border-t border-border md:grid-cols-3">
        {TECH_PILLARS.map((p, i) => {
          const PillarIcon = p.icon;
          return (
            <div
              key={p.title}
              data-reveal
              style={{ transitionDelay: `${i * 120}ms` }}
              className="border-b border-border p-8 last:border-b-0 md:border-b-0 md:border-r md:p-10 md:last:border-r-0"
            >
              <PillarIcon className="h-5 w-5 text-brand-green" aria-hidden />
              <div className="mt-6 text-lg font-medium">{p.title}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing call to action                                              */
/* ------------------------------------------------------------------ */

const PROMPTS = [
  'Build a vendor intake app with a risk checklist and approvals',
  'Create an incident triage flow that routes by priority',
  'Set up employee onboarding with catalog items and SLA timers',
  'Design an access review process with an audit trail',
];

function PromptTicker({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduce) {
      setTyped(PROMPTS[0].length);
      return;
    }
    if (!active) return;
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
    (async () => {
      let i = 0;
      while (!cancelled) {
        const text = PROMPTS[i % PROMPTS.length];
        setIdx(i % PROMPTS.length);
        for (let n = 1; n <= text.length && !cancelled; n++) {
          setTyped(n);
          await wait(26);
        }
        await wait(1900);
        for (let n = text.length; n >= 0 && !cancelled; n -= 2) {
          setTyped(Math.max(n, 0));
          await wait(10);
        }
        await wait(350);
        i++;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, reduce]);

  return (
    <p className="mx-auto flex min-h-[3.2rem] max-w-[44rem] items-start justify-center gap-3 px-2 text-left font-mono text-sm leading-relaxed text-muted-foreground md:min-h-[1.75rem] md:text-base">
      <span className="select-none text-brand-green">&gt;</span>
      <span>
        {PROMPTS[idx].slice(0, typed)}
        <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-pulse bg-brand-green" />
      </span>
    </p>
  );
}

export function FinalCta({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const glow = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const ringScale = useTransform(scrollYProgress, [0, 1], [0.78, 1]);

  return (
    <section id="start" ref={ref} className="relative overflow-hidden px-6 pb-28 pt-40 text-center md:pb-40 md:pt-56">
      {/* beam dropping in from the governance flow above */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-32 w-px -translate-x-1/2"
        style={{ backgroundImage: 'linear-gradient(to bottom, transparent, var(--color-brand-green))' }}
        aria-hidden
      />
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: glow }} aria-hidden>
        <div
          className="absolute left-1/2 top-1/2 h-[70rem] w-[min(180vw,2600px)] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(ellipse 45% 42% at 50% 50%, color-mix(in srgb, var(--color-brand-green) 16%, transparent), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 6%, transparent) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 75%)',
          }}
        />
      </motion.div>
      {/* slow rotating light ring */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(120vw,60rem)] -translate-x-1/2 -translate-y-1/2"
        style={{ scale: ringScale }}
        aria-hidden
      >
        <motion.div
          className="h-full w-full rounded-full opacity-60"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--color-brand-green) 34%, transparent) 70deg, transparent 150deg, transparent 220deg, color-mix(in srgb, var(--color-brand-green) 20%, transparent) 290deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, transparent 61%, black 62%, black 63.5%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 61%, black 62%, black 63.5%, transparent 65%)',
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      <div className="relative mx-auto max-w-[1056px]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-mono text-xs uppercase tracking-[0.24em] text-brand-green"
        >
          Ready when you are
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, delay: 0.08, ease: EASE }}
          className="mx-auto mt-6 max-w-[16ch] font-display text-[clamp(2.8rem,8.2vw,7.2rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
        >
          See Illumin<span className="font-sans font-bold">AI</span>te build
          <span className="text-brand-green"> on your instance</span>
        </motion.h2>
        <div className="mt-12">
          <PromptTicker active={inView} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <Button variant="cta" onClick={onGetStarted} className="h-11 rounded-md px-7 text-[15px]">
            Start building
          </Button>
          <a
            href="#demo"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background/60 px-6 text-[15px] text-foreground backdrop-blur transition-colors hover:bg-accent"
          >
            Watch it build <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function FooterV2({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn?: () => void }) {
  const mark = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mark, offset: ['start end', 'end end'] });
  const fill = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);
  const linkCls = 'text-[15px] text-muted-foreground transition-colors hover:text-foreground';

  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto grid max-w-[1056px] gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-12 md:py-20">
        <div>
          <IlluminaiteLogo className="h-[26px] w-auto" />
          <p className="mt-5 max-w-[26ch] text-[15px] leading-snug text-muted-foreground">
            Specialised AI agents that build, test and ship on ServiceNow, with a person approving every step.
          </p>
        </div>
        <nav aria-label="Product" className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">Product</p>
          <a href="#demo" className={linkCls}>Live demo</a>
          <a href="#product" className={linkCls}>How it works</a>
          <a href="#capabilities" className={linkCls}>Capabilities</a>
        </nav>
        <nav aria-label="Explore" className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">Explore</p>
          <a href="#usecases" className={linkCls}>Use cases</a>
          <a href="#outcomes" className={linkCls}>Outcomes</a>
          <a href="#trust" className={linkCls}>Governance</a>
        </nav>
        <div className="flex flex-col items-start gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">Get started</p>
          <button type="button" onClick={onGetStarted} className={linkCls}>Start building</button>
          {onSignIn && (
            <button type="button" onClick={onSignIn} className={linkCls}>Sign in</button>
          )}
        </div>
      </div>

      {/* giant wordmark that fills with green as it scrolls into place */}
      <div ref={mark} className="relative overflow-hidden border-t border-border" aria-hidden>
        <div
          className="select-none text-center font-display text-[clamp(3.5rem,19vw,17rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-transparent [-webkit-background-clip:text] [background-clip:text]"
          style={{ backgroundImage: 'linear-gradient(to bottom, hsl(var(--foreground) / 0.22), hsl(var(--foreground) / 0.03))' }}
        >
          Illumin<span className="font-sans font-bold">AI</span>te
        </div>
        <motion.div
          className="pointer-events-none absolute inset-0 select-none text-center font-display text-[clamp(3.5rem,19vw,17rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-transparent [-webkit-background-clip:text] [background-clip:text]"
          style={{
            opacity: fill,
            backgroundImage: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-brand-green) 55%, transparent), transparent 85%)',
          }}
        >
          Illumin<span className="font-sans font-bold">AI</span>te
        </motion.div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1056px] flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-muted-foreground sm:flex-row md:px-12">
          <span>© {new Date().getFullYear()} IlluminAIte</span>
          <a href="#hero" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
            Back to top <ArrowUp className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
