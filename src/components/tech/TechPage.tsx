import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { cn } from '@/lib/utils';
import { TechHeroField } from './TechHeroField';
import { TechLifecycle } from './TechLifecycle';
import { TechArchitecture } from './TechArchitecture';
import { useSmoothScroll } from './useSmoothScroll';
import { TECH_HERO, TECH_PILLARS, TECH_STATS } from './techData';

interface TechPageProps {
  onGetStarted: () => void;
  onBack?: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function RevealWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.045 }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1800, bounce: 0 });
  const text = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) mv.set(target);
  }, [inView, mv, target]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--sx', `${e.clientX - r.left}px`);
    el.style.setProperty('--sy', `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={cn('group relative overflow-hidden rounded-2xl border border-border bg-card', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(320px circle at var(--sx, 50%) var(--sy, 50%), hsl(var(--foreground) / 0.07), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function TechPage({ onGetStarted, onBack }: TechPageProps) {
  useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="dark min-h-screen overflow-x-clip bg-background text-foreground antialiased selection:bg-brand-green/25">
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
          scrolled ? 'border-b border-border bg-background/80 backdrop-blur-md' : 'border-b border-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button type="button" onClick={onBack} aria-label="IlluminAIte home">
            <IlluminaiteLogo className="h-[26px] w-auto" />
          </button>
          <div className="hidden items-center gap-8 text-[13px] font-medium text-muted-foreground md:flex">
            <a href="#lifecycle" className="transition-colors hover:text-foreground">Lifecycle</a>
            <a href="#architecture" className="transition-colors hover:text-foreground">Architecture</a>
            <a href="#outcomes" className="transition-colors hover:text-foreground">Outcomes</a>
            <a href="#trust" className="transition-colors hover:text-foreground">Governance</a>
          </div>
          <button
            type="button"
            onClick={onGetStarted}
            className="rounded-full bg-brand-green px-4 py-2 text-[13px] font-semibold text-background transition-colors hover:bg-brand-green-hover"
          >
            Try IlluminAIte
          </button>
        </nav>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <TechHeroField className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green"
          >
            {TECH_HERO.eyebrow}
          </motion.p>
          <h1 className="mt-6 max-w-4xl font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            <RevealWords text={TECH_HERO.title} delay={0.15} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
            className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {TECH_HERO.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.05 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-brand-green-hover"
            >
              Try IlluminAIte
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#lifecycle"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
            >
              See how it works
            </a>
          </motion.div>
        </div>
      </section>

      <TechLifecycle />
      <TechArchitecture />

      <section id="outcomes" className="border-t border-border py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Outcomes</p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              Measured where it matters: speed, cost and accuracy.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {TECH_STATS.map((s) => (
              <div key={s.label} className="bg-background p-8 md:p-10">
                <div className="font-display text-6xl font-extrabold tracking-tight text-brand-green md:text-7xl">
                  <CountUp target={s.target} suffix={s.suffix} />
                </div>
                <div className="mt-4 font-display text-lg font-semibold">{s.label}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="border-t border-border py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Built for enterprise delivery</p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              Autonomous where it helps. Accountable where it counts.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {TECH_PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                >
                  <SpotlightCard className="h-full p-8">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-brand-green">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-6 font-display text-xl font-bold">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border py-28 md:py-40">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green/10 blur-3xl" />
        <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            See Mitra build on your instance.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Start from a workshop conversation and finish with a go-live ready ServiceNow implementation.
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand-green px-7 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-brand-green-hover"
          >
            Try IlluminAIte <ArrowRight className="h-4 w-4" />
          </button>
        </Reveal>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-muted-foreground">
          <IlluminaiteLogo className="h-5 w-auto opacity-80" />
          <span>© IlluminAIte</span>
        </div>
      </footer>
    </div>
  );
}
