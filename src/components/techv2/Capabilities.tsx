import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
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

function CapabilityCard({ item, index, total }: { item: Capability; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.6 });
  const show = reduce || inView;
  const shapes = VISUALS[item.id] ?? VISUALS.custom;

  return (
    <motion.article
      ref={ref}
      initial={false}
      animate={{ opacity: show ? 1 : 0.35, scale: show ? 1 : 0.95, y: show ? 0 : 18 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="group flex h-[clamp(430px,58vh,540px)] w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors duration-300 hover:border-brand-green/40 hover:bg-mitra-highlight sm:w-[360px]"
    >
      {/* Visual: top 40% */}
      <div className="relative h-[40%] min-h-[170px] border-b border-border">
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
        <svg viewBox="0 0 240 120" className="relative h-full w-full p-8" fill="none" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
      <div className="flex flex-1 flex-col px-8 pb-7 pt-8">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-green"
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
          transition={{ delay: show ? 0.45 : 0, duration: 0.45, ease: EASE }}
        >
          {item.label}
        </motion.p>
        <motion.h3
          className="mt-5 font-display text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.025em]"
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
          transition={{ delay: show ? 0.6 : 0, duration: 0.5, ease: EASE }}
        >
          {item.title}
        </motion.h3>
        <motion.p
          className="mt-4 max-w-[30ch] text-base leading-relaxed text-muted-foreground"
          initial={false}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
          transition={{ delay: show ? 0.78 : 0, duration: 0.5, ease: EASE }}
        >
          {item.description}
        </motion.p>
        <motion.div
          className="mt-auto flex items-center justify-between border-t border-border pt-5 font-mono text-[11px] tracking-[0.16em] text-muted-foreground"
          initial={false}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ delay: show ? 0.95 : 0, duration: 0.5 }}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{String(total).padStart(2, '0')}</span>
        </motion.div>
      </div>
    </motion.article>
  );
}

export function Capabilities() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  // How far the track has to travel sideways. The section is made exactly that much taller, so
  // vertical scroll drives the horizontal movement one to one while the content stays pinned.
  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start 105px', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], ['4%', '100%']);

  return (
    <section
      ref={section}
      id="capabilities"
      className="relative border-b border-border"
      style={{ height: `calc(100vh - 105px + ${dist}px)` }}
    >
      <div className="sticky top-[105px] flex h-[calc(100vh-105px)] flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1056px] px-6 pb-8 md:px-12 md:pb-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green">Skills</p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,5.4vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Capabilities
          </h2>
          <p className="mt-3 max-w-[520px] text-base leading-snug text-muted-foreground md:text-lg">
            Ready-made skills your agents run at every stage, so the documents, designs and tests never slow the build.
          </p>
        </div>

        <div className="py-3">
          <motion.div
            ref={track}
            style={{ x }}
            className="flex w-max gap-6 pl-[max(1.5rem,calc((100vw-1056px)/2+1.5rem))] pr-[max(1.5rem,calc((100vw-1056px)/2+1.5rem))] md:gap-10"
          >
            {CAPABILITIES.map((c, i) => (
              <CapabilityCard key={c.id} item={c} index={i} total={CAPABILITIES.length} />
            ))}
          </motion.div>
        </div>

        <div className="mx-auto w-full max-w-[1056px] px-6 pt-6 md:px-12 md:pt-8">
          <div className="h-px bg-border" aria-hidden>
            <motion.div className="h-px bg-brand-green" style={{ width: bar }} />
          </div>
        </div>
      </div>
    </section>
  );
}
