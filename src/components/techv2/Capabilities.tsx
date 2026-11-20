import { useCallback, useRef, useState, type RefObject } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SKILLS } from '../../data/skills';
import { cn } from '@/lib/utils';

interface Shape {
  d: string;
  accent?: boolean;
}

/** Closed polygon with rounded corners (quadratic curves), so boxes and diamonds read as soft, not sharp. */
function rpoly(pts: [number, number][], r = 6): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const v1 = [prev[0] - cur[0], prev[1] - cur[1]];
    const v2 = [next[0] - cur[0], next[1] - cur[1]];
    const l1 = Math.hypot(v1[0], v1[1]);
    const l2 = Math.hypot(v2[0], v2[1]);
    const k = Math.min(r, l1 / 2, l2 / 2);
    const a = [cur[0] + (v1[0] / l1) * k, cur[1] + (v1[1] / l1) * k];
    const c = [cur[0] + (v2[0] / l2) * k, cur[1] + (v2[1] / l2) * k];
    d += `${i === 0 ? 'M' : 'L'}${a[0]} ${a[1]}Q${cur[0]} ${cur[1]} ${c[0]} ${c[1]}`;
  }
  return `${d}Z`;
}
const box = (x: number, y: number, w: number, h: number, r = 7) =>
  rpoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r);

/** Line-art for each skill, drawn on a 240 x 120 canvas. Accent strokes are a touch brighter. */
const VISUALS: Record<string, Shape[]> = {
  'create-user-story': [
    { d: rpoly([[78, 14], [148, 14], [170, 36], [170, 106], [78, 106]], 8) },
    { d: 'M148 14v16q0 6 6 6h16' },
    { d: 'M94 56h52M94 72h64M94 88h40' },
    { d: 'M136 92l8 8 18-20', accent: true },
  ],
  'generate-brd': [
    { d: box(52, 18, 136, 88, 9) },
    { d: 'M68 36h56', accent: true },
    { d: 'M68 56h104M68 74h104M68 92h104M110 56v36' },
  ],
  'design-workflow': [
    { d: box(26, 48, 38, 24, 7) + box(176, 48, 38, 24, 7) },
    { d: rpoly([[120, 42], [144, 60], [120, 78], [96, 60]], 7), accent: true },
    { d: 'M64 60h32M144 60h32M120 78v14q0 8 8 8h48' },
  ],
  'solution-architecture': [
    { d: box(56, 20, 128, 22, 8) + box(56, 50, 128, 22, 8) },
    { d: box(56, 80, 128, 22, 8), accent: true },
    { d: 'M120 42v8M120 72v8' },
  ],
  'ui-review': [
    { d: box(36, 18, 168, 86, 10) },
    { d: 'M36 36h168' },
    { d: box(52, 52, 58, 38, 6) + 'M124 56h64M124 70h48' },
    { d: 'M186 78a13 13 0 1 0 0.01 0M196 90l14 14', accent: true },
  ],
  'create-test-cases': [
    { d: 'M52 34l7 7 11-14M52 62l7 7 11-14' },
    { d: 'M86 36h96M86 64h80M86 92h88' },
    { d: 'M52 90l7 7 11-14', accent: true },
  ],
  'api-specification': [
    { d: 'M88 36L58 60l30 24M152 36l30 24-30 24' },
    { d: 'M132 28l-24 64', accent: true },
  ],
  'stakeholder-summary': [
    { d: 'M52 36a11 11 0 1 0 0.01 0M52 88a11 11 0 1 0 0.01 0' },
    { d: 'M76 40c26 0 34 10 54 20M76 86c26 0 34-10 54-26' },
    { d: box(132, 36, 64, 48, 8) },
    { d: 'M146 54h38M146 68h26', accent: true },
  ],
  'release-notes': [
    { d: rpoly([[52, 26], [140, 26], [180, 60], [140, 94], [52, 94]], 9) },
    { d: 'M72 60a5 5 0 1 0 0.01 0' },
    { d: 'M96 52h44M96 68h30', accent: true },
  ],
  'risk-assessment': [
    { d: 'M120 16l50 18v26c0 24-20 38-50 46-30-8-50-22-50-46V34z' },
    { d: 'M120 46v26M120 86v.5', accent: true },
  ],
  custom: [
    { d: box(70, 22, 100, 76, 10) },
    { d: 'M120 44v32M104 60h32', accent: true },
  ],
};

interface Capability {
  id: string;
  title: string;
  description: string;
  label: string;
}

const CAPABILITIES: Capability[] = [
  ...SKILLS.map((s) => ({ id: s.id, title: s.name, description: s.description, label: s.category })),
  {
    id: 'custom',
    title: 'Build your own skill',
    description: 'Capture your own process as a skill and run it on demand.',
    label: 'Custom',
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const GRID = 'color-mix(in srgb, var(--color-foreground) 7%, transparent)';

function CapabilityCard({ item, root }: { item: Capability; root: RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { root, amount: 0.6 });
  const show = reduce || inView;
  const shapes = VISUALS[item.id] ?? VISUALS.custom;

  return (
    <article
      ref={ref}
      className="group flex h-[390px] w-[300px] shrink-0 snap-start flex-col border-r border-border bg-background transition-colors duration-300 first:border-l hover:bg-mitra-highlight sm:w-[340px]"
    >
      {/* Visual: top 40% */}
      <div className="relative h-[40%] border-b border-border">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${GRID} 1px, transparent 1px), linear-gradient(to bottom, ${GRID} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 80% 90% at 50% 50%, black, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 90% at 50% 50%, black, transparent 90%)',
          }}
          aria-hidden
        />
        <svg viewBox="0 0 240 120" className="relative h-full w-full p-3" fill="none" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <defs>
            <linearGradient id={`${item.id}-base`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="240" y2="120">
              <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--color-brand-green) 62%, var(--color-muted-foreground))', stopOpacity: 0.9 }} />
              <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--color-brand-green) 62%, var(--color-muted-foreground))', stopOpacity: 0.42 }} />
            </linearGradient>
            <linearGradient id={`${item.id}-accent`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="240" y2="120">
              <stop offset="0" style={{ stopColor: 'var(--color-brand-green)', stopOpacity: 0.95 }} />
              <stop offset="1" style={{ stopColor: 'var(--color-brand-green)', stopOpacity: 0.45 }} />
            </linearGradient>
          </defs>
          {shapes.map((s, i) => (
            <motion.path
              key={i}
              d={s.d}
              stroke={`url(#${item.id}-${s.accent ? 'accent' : 'base'})`}
              initial={false}
              animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
              transition={{ delay: show ? i * 0.22 : 0, duration: show ? 0.85 : 0.2, ease: EASE }}
            />
          ))}
        </svg>
      </div>

      {/* Copy appears once the drawing has started */}
      <div className="flex flex-1 flex-col p-6">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-green"
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
          transition={{ delay: show ? 0.45 : 0, duration: 0.45, ease: EASE }}
        >
          {item.label}
        </motion.p>
        <motion.h3
          className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.02em]"
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
          transition={{ delay: show ? 0.6 : 0, duration: 0.5, ease: EASE }}
        >
          {item.title}
        </motion.h3>
        <motion.p
          className="mt-3 text-[15px] leading-snug text-muted-foreground"
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
          transition={{ delay: show ? 0.78 : 0, duration: 0.5, ease: EASE }}
        >
          {item.description}
        </motion.p>
      </div>
    </article>
  );
}

export function Capabilities() {
  const scroller = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ down: false, startX: 0, startLeft: 0 });

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  const by = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });

  return (
    <section id="capabilities" className="border-b border-border">
      <div className="mx-auto flex w-full max-w-[1056px] flex-col justify-between gap-8 border-x border-dashed border-border px-6 py-20 md:flex-row md:items-end md:px-12 md:py-28">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green">Skills</p>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Capabilities
          </h2>
          <p className="mt-5 max-w-[520px] text-lg leading-snug text-muted-foreground">
            Ready-made skills your agents run at every stage, so the documents, designs and tests never slow the build.
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Scroll capabilities">
          <button
            type="button"
            onClick={() => by(-1)}
            disabled={progress < 0.01}
            aria-label="Previous capabilities"
            className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => by(1)}
            disabled={progress > 0.99}
            aria-label="Next capabilities"
            className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={onScroll}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || !scroller.current) return;
          drag.current = { down: true, startX: e.clientX, startLeft: scroller.current.scrollLeft };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!drag.current.down || !scroller.current) return;
          scroller.current.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
        }}
        onPointerUp={() => {
          drag.current.down = false;
          setDragging(false);
        }}
        onPointerLeave={() => {
          drag.current.down = false;
          setDragging(false);
        }}
        className={cn(
          'flex select-none overflow-x-auto border-t border-border pl-[max(0px,calc((100vw-1056px)/2))] pr-[max(0px,calc((100vw-1056px)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          dragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory',
        )}
        style={{ scrollPaddingLeft: 'max(0px, calc((100vw - 1056px) / 2))' }}
      >
        {CAPABILITIES.map((c) => (
          <CapabilityCard key={c.id} item={c} root={scroller} />
        ))}
      </div>

      <div className="h-px bg-border" aria-hidden>
        <div className="h-px bg-brand-green transition-[width] duration-150" style={{ width: `${Math.max(progress, 0.04) * 100}%` }} />
      </div>
    </section>
  );
}
