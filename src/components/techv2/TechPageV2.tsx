import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowRight, Check, ChevronRight, FileText } from 'lucide-react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import { TechLiveDemo } from '../tech/TechLiveDemo';
import { GridBackdrop } from './GridBackdrop';
import { UseCases } from './UseCases';
import { TECH_PILLARS, TECH_STAGES, TECH_STATS } from '../tech/techData';

interface TechPageV2Props {
  onGetStarted: () => void;
  onSignIn?: () => void;
  onBack?: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const SWAP_WORDS = ['workflows', 'scoped apps', 'catalog items', 'integrations', 'portals'];
const CAPABILITIES = ['Scoped apps', 'Flow Designer', 'Catalog items', 'ATF testing', 'Update sets', 'CMDB'];
const STATEMENT = 'Every ServiceNow build starts with an impossible amount of manual work.';

/** Centered 1056px column with the dashed side guides used across the page. */
const COLUMN = 'mx-auto w-full max-w-[1056px] border-x border-dashed border-border';

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });
  const text = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    if (inView) mv.set(target);
  }, [inView, mv, target]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

/** Headline word that swaps with a soft blur, like a single line of text changing in place. */
function SwapWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % SWAP_WORDS.length), 2600);
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <span className="relative inline-grid justify-items-center align-baseline">
      {/* invisible sizer keeps the line height and width stable */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
        {SWAP_WORDS.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={SWAP_WORDS[i]}
          className="col-start-1 row-start-1 whitespace-nowrap text-brand-green"
          initial={{ opacity: 0, filter: 'blur(10px)', y: 12 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(10px)', y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {SWAP_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function BlurWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = 0.15 + (index / total) * 0.55;
  const end = start + 0.12;
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const blur = useTransform(progress, [start, end], [10, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  return (
    <motion.span style={{ opacity, filter }} className="mr-[0.26em] inline-block">
      {word}
    </motion.span>
  );
}

/** Drifting node network behind the statement. Reads the brand colour from the CSS token. */
function NetworkField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const style = getComputedStyle(canvas);
    const green = style.getPropertyValue('--color-brand-green').trim() || 'currentColor';
    const line = style.getPropertyValue('--color-foreground').trim();
    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nodes = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00006,
      vy: (Math.random() - 0.5) * 0.00006,
      hot: Math.random() < 0.22,
    }));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx * 16;
          n.y += n.vy * 16;
          if (n.x < 0 || n.x > 1) n.vx *= -1;
          if (n.y < 0 || n.y > 1) n.vy *= -1;
        }
      }
      ctx.lineWidth = 1;
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const dx = (nodes[a].x - nodes[b].x) * w;
          const dy = (nodes[a].y - nodes[b].y) * h;
          const d = Math.hypot(dx, dy);
          if (d < 190) {
            ctx.globalAlpha = (1 - d / 190) * 0.22;
            ctx.strokeStyle = line;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x * w, nodes[a].y * h);
            ctx.lineTo(nodes[b].x * w, nodes[b].y * h);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.globalAlpha = n.hot ? 0.95 : 0.4;
        ctx.fillStyle = n.hot ? green : line;
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, n.hot ? 3 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduce]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const words = useMemo(() => STATEMENT.split(' '), []);
  return (
    <section ref={ref} className="relative h-[130vh] border-y border-border">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        <NetworkField />
        <h2 className="relative max-w-[640px] text-center text-[clamp(1.9rem,4.4vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.0225em]">
          {words.map((w, i) => (
            <BlurWord key={`${w}-${i}`} word={w} index={i} total={words.length} progress={scrollYProgress} />
          ))}
        </h2>
      </div>
    </section>
  );
}

function StageTabs() {
  const [active, setActive] = useState(0);
  const stage = TECH_STAGES[active];
  const Icon = stage.icon;

  return (
    <section id="product" className={cn(COLUMN, 'border-b border-border')}>
      <div className="px-6 py-20 md:px-12 md:py-28">
        <h2 className="max-w-[560px] font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          Your build team, <span className="text-brand-green">on demand</span>
        </h2>
        <p className="mt-5 max-w-[520px] text-lg leading-snug text-muted-foreground">
          Specialised agents take each delivery stage from requirement to governed promotion, and ping you for approval.
        </p>
      </div>

      <div className="grid border-t border-border md:grid-cols-2">
        <div className="border-b border-border p-6 md:border-b-0 md:border-r md:p-8">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Delivery stages">
            {TECH_STAGES.map((s, i) => {
              const TabIcon = s.icon;
              const on = i === active;
              return (
                <button
                  key={s.title}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors',
                    on
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground hover:bg-accent',
                  )}
                >
                  <TabIcon className="h-4 w-4" aria-hidden />
                  {s.title}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-10"
            >
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green">Stage {stage.num}</p>
              <h3 className="mt-3 text-lg font-medium leading-snug">{stage.summary}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{stage.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative min-h-[420px] overflow-hidden p-6 md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="space-y-5"
            >
              <div className="ml-auto max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-[15px] leading-snug">
                Run the {stage.title.toLowerCase()} stage for the onboarding app and stage everything for review.
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden />
                  {stage.title} agent
                </div>
                <p className="mt-2 text-[15px] leading-snug">
                  Done. {stage.outputs.length} outputs are staged as drafts, nothing is live.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm text-muted-foreground">Outputs</span>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    Approve
                  </span>
                </div>
                {stage.outputs.map((o, i) => (
                  <motion.div
                    key={o}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.09, duration: 0.35, ease: EASE }}
                    className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="flex-1 text-sm">{o}</span>
                    <Check className="h-4 w-4 text-brand-green" aria-hidden />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function TechPageV2({ onGetStarted, onSignIn, onBack }: TechPageV2Props) {
  return (
    <div className="dark min-h-screen overflow-x-clip bg-background font-sans text-foreground antialiased selection:bg-brand-green/25">
      {/* Announcement + nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-[1056px] items-center justify-between px-6">
          <button type="button" onClick={onBack} aria-label="IlluminAIte home">
            <IlluminaiteLogo className="h-[24px] w-auto" />
          </button>
          <div className="hidden items-center gap-8 text-[15px] text-muted-foreground md:flex">
            <a href="#demo" className="transition-colors hover:text-foreground">Live demo</a>
            <a href="#product" className="transition-colors hover:text-foreground">Product</a>
            <a href="#usecases" className="transition-colors hover:text-foreground">Use cases</a>
            <a href="#outcomes" className="transition-colors hover:text-foreground">Outcomes</a>
            <a href="#trust" className="transition-colors hover:text-foreground">Governance</a>
          </div>
          <div className="flex items-center gap-2">
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="hidden px-3 py-2 text-[15px] text-foreground transition-colors hover:text-brand-green sm:block"
              >
                Sign in
              </button>
            )}
            <Button variant="cta" size="sm" onClick={onGetStarted} className="rounded-md">
              Get a demo
            </Button>
          </div>
        </nav>
        <div className="flex h-12 items-center justify-center gap-3 border-t border-border px-4 text-sm">
          <span className="rounded-md bg-brand-green/10 px-2 py-1 text-brand-green">New</span>
          <span className="truncate text-foreground">Governed AI delivery for ServiceNow</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 pb-20 pt-24 text-center md:pb-28 md:pt-36"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
        }}
      >
        <GridBackdrop className="pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[620px]"
          style={{
            background:
              'radial-gradient(ellipse 55% 60% at 50% 0%, color-mix(in srgb, var(--color-brand-green) 14%, transparent), transparent 70%)',
          }}
          aria-hidden
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
          Agentic delivery for ServiceNow
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
          className="relative mx-auto max-w-[1100px] font-display text-[clamp(2.9rem,8vw,7rem)] font-semibold leading-[0.98] tracking-[-0.04em]"
        >
          Ship ServiceNow
          <br />
          <SwapWord />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="relative mx-auto mt-8 max-w-[620px] text-lg leading-snug text-muted-foreground md:text-xl"
        >
          Describe what you need. Specialised AI agents define, build, test, document and deploy it on your instance,
          with a human checkpoint at every promotion.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
          className="relative mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button variant="cta" onClick={onGetStarted} className="rounded-md px-6">
            Get a demo
          </Button>
          <a
            href="#usecases"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background/60 px-5 text-sm text-foreground backdrop-blur transition-colors hover:bg-accent"
          >
            See use cases <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </motion.div>
      </section>

      {/* App window */}
      <section id="demo" className="px-4 pb-24 md:px-6 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-[1310px] overflow-hidden rounded-xl border border-border bg-card"
        >
          <TechLiveDemo />
        </motion.div>
      </section>

      {/* Capability strip, in the spot a customer-logo row would sit */}
      <section className={cn(COLUMN, 'border-b-0')}>
        <div className="flex items-center justify-between px-6 py-8 md:px-12">
          <p className="text-[15px]">Built for every layer of ServiceNow delivery</p>
          <a href="#product" className="hidden items-center gap-1 text-[15px] text-muted-foreground transition-colors hover:text-foreground sm:flex">
            See the platform <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
        <div className="grid grid-cols-2 border-y border-border sm:grid-cols-3 lg:grid-cols-6">
          {CAPABILITIES.map((c) => (
            <div
              key={c}
              className="flex h-24 items-center justify-center border-b border-r border-border px-3 text-center text-[15px] font-medium text-muted-foreground transition-colors last:border-r-0 hover:text-foreground sm:[&:nth-child(3n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(6n)]:border-r-0"
            >
              {c}
            </div>
          ))}
        </div>
        <div className="h-24" />
      </section>

      <Statement />

      <StageTabs />

      <UseCases />

      {/* Outcomes */}
      <section id="outcomes" className={cn(COLUMN, 'border-b border-border')}>
        <div className="px-6 py-20 md:px-12 md:py-28">
          <h2 className="max-w-[640px] font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            Measured where it matters: speed, cost and accuracy
          </h2>
        </div>
        <div className="grid border-t border-border md:grid-cols-3">
          {TECH_STATS.map((s) => (
            <div key={s.label} className="border-b border-border p-8 last:border-b-0 md:border-b-0 md:border-r md:p-10 md:last:border-r-0">
              <div className="font-display text-[clamp(4.5rem,9vw,8rem)] font-semibold leading-none tracking-[-0.05em] text-brand-green">
                <CountUp target={s.target} suffix={s.suffix} />
              </div>
              <div className="mt-4 text-lg font-medium">{s.label}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Governance */}
      <section id="trust" className={cn(COLUMN, 'border-b border-border')}>
        <div className="px-6 py-20 md:px-12 md:py-28">
          <h2 className="max-w-[640px] font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
            Engineered for teams with higher standards
          </h2>
        </div>
        <div className="grid border-t border-border md:grid-cols-3">
          {TECH_PILLARS.map((p) => {
            const PillarIcon = p.icon;
            return (
              <div key={p.title} className="group border-b border-border p-8 transition-colors last:border-b-0 hover:bg-mitra-highlight md:border-b-0 md:border-r md:p-10 md:last:border-r-0">
                <PillarIcon className="h-5 w-5 text-brand-green" aria-hidden />
                <div className="mt-6 text-lg font-medium">{p.title}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{p.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-brand-green">
                  Learn more <ChevronRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA + footer */}
      <section className={cn(COLUMN, 'px-6 py-24 text-center md:py-32')}>
        <h2 className="mx-auto max-w-[720px] font-display text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1.06] tracking-[-0.0225em]">
          See IlluminAIte build on your instance
        </h2>
        <div className="mt-9">
          <Button variant="cta" onClick={onGetStarted} className="rounded-md px-6">
            Get a demo
          </Button>
        </div>
      </section>
      <div className="overflow-hidden border-t border-border" aria-hidden>
        <div className="select-none text-center font-display text-[clamp(3.5rem,17vw,16rem)] font-semibold leading-[0.85] tracking-[-0.05em] text-foreground/[0.05]">
          IlluminAIte
        </div>
      </div>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1056px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <IlluminaiteLogo className="h-[22px] w-auto" />
          <div className="flex gap-6">
            <a href="#demo" className="transition-colors hover:text-foreground">Live demo</a>
            <a href="#product" className="transition-colors hover:text-foreground">Product</a>
            <a href="#outcomes" className="transition-colors hover:text-foreground">Outcomes</a>
            <a href="#trust" className="transition-colors hover:text-foreground">Governance</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
