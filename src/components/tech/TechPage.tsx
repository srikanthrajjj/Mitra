import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import { TechShowcase } from './TechShowcase';
import { TechLiveDemo } from './TechLiveDemo';
import { TechHero } from './TechHero';
import { TechFooter } from './TechFooter';
import { useSmoothScroll } from './useSmoothScroll';
import { TECH_PILLARS, TECH_STATS } from './techData';
import { BLOB, GLASS_LIGHT, tint } from './techStyles';

interface TechPageProps {
  onGetStarted: () => void;
  onSignIn?: () => void;
  onBack?: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

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
      className={cn('group relative overflow-hidden rounded-[28px]', GLASS_LIGHT, className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(320px circle at var(--sx, 50%) var(--sy, 50%), hsl(var(--foreground) / 0.06), transparent 70%)',
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

/**
 * Mixed light/dark page. Sections are flat and meet at clean, rounded, stacked edges
 * (no gradient blends): light hero, big dark live-chat panel, light features, a dark
 * block for lifecycle and finale, light outcomes, dark finale.
 */
export function TechPage({ onGetStarted, onSignIn, onBack }: TechPageProps) {
  useSmoothScroll();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="dark min-h-screen overflow-x-clip bg-background text-foreground antialiased selection:bg-brand-green/25">
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-brand-green"
        aria-hidden
      />

      <header className="dark fixed inset-x-0 top-4 z-50 px-4">
        <nav
          className={cn(
            'mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border pl-5 pr-2 backdrop-blur-[30px] backdrop-saturate-[1.8] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-colors duration-300',
            scrolled ? 'border-foreground/[0.15] bg-background/75' : 'border-foreground/[0.13] bg-foreground/[0.06]',
          )}
        >
          <button type="button" onClick={onBack} aria-label="IlluminAIte home">
            <IlluminaiteLogo className="h-[24px] w-auto" />
          </button>
          <div className="hidden items-center gap-7 text-[13px] font-medium text-muted-foreground md:flex">
            <a href="#demo" className="transition-colors hover:text-foreground">Live demo</a>
            <a href="#product" className="transition-colors hover:text-foreground">Product</a>
            <a href="#outcomes" className="transition-colors hover:text-foreground">Outcomes</a>
            <a href="#trust" className="transition-colors hover:text-foreground">Governance</a>
          </div>
          <div className="flex items-center gap-1">
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </button>
            )}
            <Button variant="cta" size="sm" onClick={onGetStarted} className="rounded-full">
              Try IlluminAIte
            </Button>
          </div>
        </nav>
      </header>

      <TechHero onGetStarted={onGetStarted} />

      {/* Live chat: dark panel directly under the hero */}
      <section
        id="demo"
        style={{ backgroundColor: tint(9) }}
        className="dark relative z-10 -mt-10 rounded-t-[2.5rem] px-4 pb-28 pt-16 text-foreground [overflow:clip] md:-mt-14 md:rounded-t-[3.5rem] md:px-6 md:pb-44 md:pt-20"
      >
        <div className={cn(BLOB, 'left-[8%] top-[12%] h-[26rem] w-[26rem] opacity-70')} aria-hidden />
        <div className={cn(BLOB, 'right-[6%] bottom-[10%] h-[30rem] w-[30rem] opacity-50')} aria-hidden />
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-foreground/[0.13] bg-foreground/[0.05] backdrop-blur-[30px] backdrop-saturate-[1.8] backdrop-brightness-[1.1] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] md:rounded-[2.25rem]"
        >
          <TechLiveDemo />
        </motion.div>
      </section>

      {/* Light block: features, outcomes, governance */}
      <div
        style={{ backgroundColor: tint(7) }}
        className="light relative z-10 -mt-12 rounded-t-[2.5rem] pb-0 text-foreground [overflow:clip] md:-mt-16 md:rounded-t-[3.5rem]"
      >
        <TechShowcase />

        <section
          id="outcomes"
          style={{ backgroundColor: tint(13) }}
          className="relative z-10 -mt-10 rounded-t-[2.5rem] pb-28 pt-24 [overflow:clip] md:-mt-14 md:rounded-t-[3.5rem] md:pb-36 md:pt-32"
        >
          <div className={cn(BLOB, 'left-[-6%] top-[30%] h-[28rem] w-[28rem] opacity-60')} aria-hidden />
          <div className={cn(BLOB, 'right-[-4%] bottom-[6%] h-[24rem] w-[24rem] opacity-50')} aria-hidden />
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green-deep">Outcomes</p>
              <h2 className="mt-4 max-w-3xl font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-7xl">
                Measured where it matters: speed, cost and accuracy.
              </h2>
            </Reveal>
            <div className="relative mt-14 grid gap-4 md:grid-cols-3">
              {TECH_STATS.map((s) => (
                <div key={s.label} className={cn('rounded-[28px] p-8 md:p-10', GLASS_LIGHT)}>
                  <div className="font-display text-7xl font-extrabold tracking-[-0.05em] text-brand-green-deep md:text-8xl">
                    <CountUp target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="mt-4 font-display text-lg font-semibold">{s.label}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="trust"
          style={{ backgroundColor: tint(8) }}
          className="relative z-10 -mt-10 rounded-t-[2.5rem] pb-32 pt-24 [overflow:clip] md:-mt-14 md:rounded-t-[3.5rem] md:pb-48 md:pt-32"
        >
          <div className={cn(BLOB, 'right-[8%] top-[34%] h-[26rem] w-[26rem] opacity-60')} aria-hidden />
          <div className={cn(BLOB, 'left-[4%] bottom-[8%] h-[22rem] w-[22rem] opacity-40')} aria-hidden />
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green-deep">Built for enterprise delivery</p>
              <h2 className="mt-4 max-w-3xl font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-7xl">
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
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green text-background">
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
      </div>

      <TechFooter onGetStarted={onGetStarted} />
    </div>
  );
}
