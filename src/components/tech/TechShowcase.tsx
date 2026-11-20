import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TechMarquee } from './TechMarquee';
import { DOT_GRID } from './techStyles';
import { TECH_FEATURES, type TechFeature } from './techData';

type Mode = 'light' | 'dark';
const EASE = [0.22, 1, 0.36, 1] as const;

const PLACEMENT = {
  right: 'left-4 top-0 -translate-y-1/2',
  left: 'right-4 top-0 -translate-y-1/2',
  top: 'bottom-4 left-1/2 -translate-x-1/2',
  bottom: 'top-4 left-1/2 -translate-x-1/2',
  'top-left': 'bottom-4 right-[-0.5rem]',
  'top-right': 'bottom-4 left-[-0.5rem]',
} as const;

/** Pin with a label, popping onto the screenshot when its feature is active. */
function Callout({ x, y, label, side = 'right', show, index }: TechFeature['callouts'][number] & { show: boolean; index: number }) {
  return (
    <motion.div
      className="absolute z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={false}
      animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4, ease: EASE, delay: show ? 0.35 + index * 0.18 : 0 }}
    >
      <span className="absolute -left-2.5 -top-2.5 flex h-5 w-5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-50" />
        <span className="relative h-3 w-3 rounded-full border-2 border-background bg-brand-green" />
      </span>
      <span
        className={cn(
          'absolute whitespace-nowrap rounded-full bg-brand-green px-3 py-1.5 text-[11px] font-bold text-background shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] md:text-xs',
          PLACEMENT[side],
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}

interface FrameProps {
  features: TechFeature[];
  activeIndex: number;
}

/** Browser frame that cross-fades between real screenshots and pins the active callouts. */
function ShowcaseFrame({ features, activeIndex }: FrameProps) {
  const [mode, setMode] = useState<Mode>('light');
  const current = features[activeIndex];

  return (
    <div
      className={cn(
        mode,
        'overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-500',
        mode === 'dark' ? 'shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]' : 'shadow-[0_40px_100px_-40px_rgba(0,0,0,0.35)]',
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-mitra-surface px-4 py-3 transition-colors duration-500">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        </div>
        <div className="mx-auto max-w-xs flex-1 truncate rounded-md bg-background px-3 py-1 text-center font-mono text-[11px] text-muted-foreground transition-colors duration-500">
          {current.windowTitle}
        </div>
        <div className="flex rounded-full border border-border bg-background p-0.5" role="group" aria-label="Preview theme">
          {(['light', 'dark'] as const).map((m) => {
            const Icon = m === 'light' ? Sun : Moon;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                aria-label={`${m} theme`}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                  mode === m ? 'bg-brand-green text-background' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative aspect-[2368/1800] bg-card">
        {features.map((f, i) => {
          const on = i === activeIndex;
          return (
            <div
              key={f.id}
              className={cn('absolute inset-0 transition-opacity duration-500', on ? 'opacity-100' : 'opacity-0')}
              aria-hidden={!on}
            >
              <img
                src={f.image}
                alt={on ? f.alt : ''}
                width={2368}
                height={1800}
                loading="lazy"
                decoding="async"
                className={cn('absolute inset-0 h-full w-full transition-opacity duration-500', mode === 'dark' ? 'opacity-100' : 'opacity-0')}
              />
              <img
                src={f.imageLight}
                alt=""
                aria-hidden
                width={2368}
                height={1800}
                loading="lazy"
                decoding="async"
                className={cn('absolute inset-0 h-full w-full transition-opacity duration-500', mode === 'light' ? 'opacity-100' : 'opacity-0')}
              />
              {f.callouts.map((c, j) => (
                <Callout key={c.label} {...c} show={on} index={j} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureCopy({ f, dim }: { f: TechFeature; dim?: boolean }) {
  return (
    <div className={cn('transition-opacity duration-500', dim ? 'opacity-35' : 'opacity-100')}>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-green-deep">{f.kicker}</p>
      <h3 className="mt-4 font-display text-[clamp(1.9rem,3.4vw,3.25rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">
        {f.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{f.desc}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {f.bullets.map((b) => (
          <li key={b} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium">
            <Check className="h-3.5 w-3.5 text-brand-green-deep" strokeWidth={3} />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Light feature story. On desktop the screenshot stays pinned while the copy scrolls past
 * and the active feature's callouts pop in. Below lg each feature stacks with its own frame.
 */
export function TechShowcase() {
  const [active, setActive] = useState(0);
  const blocks = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.getAttribute('data-i')));
        });
      },
      { rootMargin: '-42% 0px -42% 0px' },
    );
    blocks.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="product" className="relative pt-14 md:pt-20">
      <div
        className={cn('pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]', DOT_GRID)}
        aria-hidden
      />
      <TechMarquee />

      <div className="relative mx-auto max-w-7xl px-6 pt-24 md:pt-32">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-green-deep">Inside the product</p>
        <h2 className="mt-5 max-w-4xl font-display text-[clamp(2.2rem,5.6vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
          See the work <span className="text-brand-green-deep">before</span> it ships.
        </h2>
      </div>

      {/* Desktop: pinned frame + scrolling copy */}
      <div className="relative mx-auto mt-12 hidden max-w-7xl gap-14 px-6 lg:grid lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <div>
          {TECH_FEATURES.map((f, i) => (
            <div
              key={f.id}
              ref={(el) => {
                blocks.current[i] = el;
              }}
              data-i={i}
              className="flex min-h-[78dvh] items-center"
            >
              <FeatureCopy f={f} dim={i !== active} />
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="sticky top-[max(5.5rem,calc(50dvh-17rem))] pb-8">
            <ShowcaseFrame features={TECH_FEATURES} activeIndex={active} />
            <div className="mt-5 flex justify-center gap-2" aria-hidden>
              {TECH_FEATURES.map((f, i) => (
                <span
                  key={f.id}
                  className={cn('h-1.5 rounded-full transition-all duration-500', i === active ? 'w-8 bg-brand-green' : 'w-1.5 bg-border')}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tablet and phone: stacked */}
      <div className="relative mx-auto mt-12 max-w-3xl space-y-20 px-6 lg:hidden">
        {TECH_FEATURES.map((f, i) => (
          <div key={f.id} className="space-y-8">
            <FeatureCopy f={f} />
            <ShowcaseFrame features={[f]} activeIndex={0} key={`m-${f.id}-${i}`} />
          </div>
        ))}
      </div>
      <div className="h-20 md:h-32" aria-hidden />
    </section>
  );
}
