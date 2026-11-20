import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
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

/**
 * Line-art for each skill, drawn on a 64 x 64 grid with about 6 units of margin and rendered
 * at exactly 200 x 200 px (a 1:1 square), so every icon has the same footprint. Accent strokes are a touch brighter.
 */
const VISUALS: Record<string, Shape[]> = {
  'create-user-story': [
    { d: rpoly([[14, 6], [38, 6], [50, 18], [50, 58], [14, 58]], 5) },
    { d: 'M38 6v8q0 4 4 4h8' },
    { d: 'M22 28h20M22 36h24M22 44h12' },
    { d: 'M38 50l4 4 8-9', accent: true },
  ],
  'generate-brd': [
    { d: box(8, 8, 48, 48, 6) },
    { d: 'M16 18h20', accent: true },
    { d: 'M16 30h32M16 40h32M16 50h32M30 30v20' },
  ],
  'design-workflow': [
    { d: box(4, 25, 12, 12, 3) + box(48, 25, 12, 12, 3) },
    { d: rpoly([[32, 18], [43, 31], [32, 44], [21, 31]], 3), accent: true },
    { d: 'M16 31h5M43 31h5M32 44v7q0 4 4 4h12' },
  ],
  'solution-architecture': [
    { d: box(10, 8, 44, 13, 4) + box(10, 25, 44, 13, 4) },
    { d: box(10, 42, 44, 13, 4), accent: true },
    { d: 'M32 21v4M32 38v4' },
  ],
  'ui-review': [
    { d: box(6, 10, 52, 44, 6) },
    { d: 'M6 22h52' },
    { d: box(12, 28, 18, 18, 3) + 'M36 30h16M36 36h8' },
    { d: 'M52 46a5 5 0 1 0 .01 0M50 50l6 6', accent: true },
  ],
  'create-test-cases': [
    { d: 'M10 16l4 4 7-9M10 32l4 4 7-9' },
    { d: 'M28 16h26M28 32h22M28 48h26' },
    { d: 'M10 48l4 4 7-9', accent: true },
  ],
  'api-specification': [
    { d: 'M24 18L10 32l14 14M40 18l14 14-14 14' },
    { d: 'M35 14l-6 36', accent: true },
  ],
  'stakeholder-summary': [
    { d: 'M18 18a6 6 0 1 0 .01 0M18 46a6 6 0 1 0 .01 0' },
    { d: 'M24 20c10 0 14 6 18 10M24 44c10 0 14-6 18-14' },
    { d: box(42, 20, 16, 24, 4) },
    { d: 'M47 28h6M47 34h4', accent: true },
  ],
  'release-notes': [
    { d: rpoly([[6, 14], [40, 14], [58, 32], [40, 50], [6, 50]], 5) },
    { d: 'M19 32a3 3 0 1 0 .01 0' },
    { d: 'M28 28h14M28 36h9', accent: true },
  ],
  'risk-assessment': [
    { d: 'M32 6l22 8v14c0 14-9 22-22 28C19 50 10 42 10 28V14z' },
    { d: 'M32 24v14M32 46v.5', accent: true },
  ],
  'data-model-design': [
    { d: box(6, 10, 20, 14, 3) + box(38, 10, 20, 14, 3) },
    { d: box(22, 42, 20, 14, 3), accent: true },
    { d: 'M26 17h12M16 24l12 18M48 24L36 42' },
  ],
  'integration-mapping': [
    { d: box(4, 22, 16, 20, 4) + box(44, 22, 16, 20, 4) },
    { d: 'M20 27h24M38 21l6 6-6 6', accent: true },
    { d: 'M44 38H20M26 32l-6 6 6 6' },
  ],
  'access-control-design': [
    { d: box(14, 28, 36, 28, 5) },
    { d: 'M22 28v-6a10 10 0 0 1 20 0v6' },
    { d: 'M32 39a3 3 0 1 0 .01 0M32 43v6', accent: true },
  ],
  'flow-designer-build': [
    { d: 'M10 32a4 4 0 1 0 .01 0' + box(46, 26, 12, 12, 3) },
    { d: box(26, 26, 12, 12, 3), accent: true },
    { d: 'M18 32h8M38 32h8M32 38v10q0 4 4 4h14' },
  ],
  'business-rule-scripts': [
    { d: 'M24 10c-8 0-8 6-8 10s0 8-6 12c6 4 6 8 6 12s0 10 8 10M40 10c8 0 8 6 8 10s0 8 6 12c-6 4-6 8-6 12s0 10-8 10' },
    { d: 'M28 32h8', accent: true },
  ],
  'catalog-item-builder': [
    { d: box(8, 8, 22, 22, 4) + box(34, 8, 22, 22, 4) + box(8, 34, 22, 22, 4) },
    { d: box(34, 34, 22, 22, 4), accent: true },
    { d: 'M40 45h10' },
  ],
  'code-review': [
    { d: 'M10 18h20M10 28h32M10 38h24M10 48h28' },
    { d: 'M42 46l5 5 11-12', accent: true },
  ],
  'training-guide': [
    { d: 'M32 14c-6-4-16-4-24-2v36c8-2 18-2 24 2 6-4 16-4 24-2V12c-8-2-18-2-24 2z' },
    { d: 'M32 14v36', accent: true },
  ],
  'runbook-writer': [
    { d: 'M12 13a3 3 0 1 0 .01 0M12 29a3 3 0 1 0 .01 0M12 45a3 3 0 1 0 .01 0' },
    { d: 'M22 16h32M22 32h26M22 48h30' },
    { d: 'M12 19v10M12 35v10', accent: true },
  ],
  'regression-planner': [
    { d: 'M50 28a18 18 0 1 0-4 14' },
    { d: 'M52 14v14H38', accent: true },
  ],
  'performance-review': [
    { d: 'M8 8v48h48' },
    { d: 'M14 44l10-12 10 8 14-22', accent: true },
  ],
  'data-migration-check': [
    { d: box(6, 14, 16, 10, 4) + box(6, 28, 16, 10, 4) + box(6, 42, 16, 10, 4) },
    { d: box(42, 14, 16, 10, 4) + box(42, 28, 16, 10, 4) + box(42, 42, 16, 10, 4) },
    { d: 'M26 32h12M34 26l6 6-6 6', accent: true },
  ],
  custom: [
    { d: box(10, 10, 44, 44, 8) },
    { d: 'M32 22v20M22 32h20', accent: true },
  ],
};

interface Capability {
  id: string;
  title: string;
  description: string;
  label: string;
}

/** Skills that are not in the app's library yet. Shown with a "Soon" tag so the page stays honest. */
const UPCOMING: Capability[] = [
  { id: 'data-model-design', title: 'Data Model Design', description: 'Model tables, extensions and relationships before the build starts.', label: 'Design · Soon' },
  { id: 'integration-mapping', title: 'Integration Mapping', description: 'Map data flows between ServiceNow and the systems around it.', label: 'Design · Soon' },
  { id: 'access-control-design', title: 'Access Control Design', description: 'Plan roles, ACLs and permissions for every persona.', label: 'Design · Soon' },
  { id: 'flow-designer-build', title: 'Flow Designer Build', description: 'Draft flows, subflows and actions from a plain description.', label: 'Development · Soon' },
  { id: 'business-rule-scripts', title: 'Business Rule Scripts', description: 'Generate server-side scripts and business rules with tests.', label: 'Development · Soon' },
  { id: 'catalog-item-builder', title: 'Catalog Item Builder', description: 'Define catalog items, variables and fulfilment in one pass.', label: 'Development · Soon' },
  { id: 'code-review', title: 'Code Review', description: 'Review scripts against ServiceNow best practice before promotion.', label: 'Development · Soon' },
  { id: 'training-guide', title: 'Training Guide', description: 'Turn a finished build into material end users can learn from.', label: 'Documentation · Soon' },
  { id: 'runbook-writer', title: 'Runbook Writer', description: 'Write operations runbooks and support notes for the new app.', label: 'Documentation · Soon' },
  { id: 'regression-planner', title: 'Regression Planner', description: 'Plan regression packs so upgrades do not break what works.', label: 'Testing · Soon' },
  { id: 'performance-review', title: 'Performance Review', description: 'Spot slow queries and heavy scripts before users do.', label: 'Testing · Soon' },
  { id: 'data-migration-check', title: 'Data Migration Check', description: 'Validate migrated records against the source system.', label: 'Testing · Soon' },
];

const CAPABILITIES: Capability[] = [
  ...SKILLS.map((s) => ({ id: s.id, title: s.name, description: s.description, label: s.category })),
  ...UPCOMING,
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
      animate={{ y: show ? 0 : 18 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="group flex h-[clamp(500px,60vh,540px)] w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-mitra-surface transition-colors duration-300 hover:border-brand-green/40 sm:w-[360px]"
    >
      {/* Visual: top 40% */}
      <div className="relative h-[260px] shrink-0 border-b border-border">
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
        <div className="relative flex h-full items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 64 64" className="h-[200px] w-[200px] shrink-0" shapeRendering="geometricPrecision" fill="none" strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <defs>
              <linearGradient id={`${item.id}-base`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--color-brand-green) 62%, var(--color-muted-foreground))', stopOpacity: 0.9 }} />
                <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--color-brand-green) 62%, var(--color-muted-foreground))', stopOpacity: 0.45 }} />
              </linearGradient>
              <linearGradient id={`${item.id}-accent`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0" style={{ stopColor: 'var(--color-brand-green)', stopOpacity: 1 }} />
                <stop offset="1" style={{ stopColor: 'var(--color-brand-green)', stopOpacity: 0.55 }} />
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

/**
 * One card in the sideways deck. Once a card reaches the left edge it stays there instead of
 * scrolling away, and each card that lands on top pushes the older ones back: they dip in
 * scale, tilt a touch, slip a little further left and dim, like sheets of paper being piled up.
 */
function StackItem({
  index,
  base,
  step,
  pad,
  x,
  children,
}: {
  index: number;
  base: number;
  step: number;
  pad: number;
  x: MotionValue<number>;
  children: ReactNode;
}) {
  // How many cards have landed on this one (0 = still sliding in or on top), capped at 3.
  const buried = useTransform(x, (v) => Math.min(Math.max(-v / step - index, 0), 3));
  const tx = useTransform([x, buried], ([v, b]: number[]) => Math.round(Math.max(0, pad - (base + v)) - 16 * Math.min(b, 2)));
  const scale = useTransform(buried, (b) => 1 - 0.035 * b);
  const rotate = useTransform(buried, (b) => -0.9 * b);
  const shade = useTransform(buried, (b) => Math.min(b * 0.22, 0.6));

  return (
    <motion.div style={{ x: tx, scale, rotate, zIndex: index, transformOrigin: '0% 60%' }} className="relative shrink-0">
      {children}
      <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 rounded-2xl bg-background" aria-hidden />
    </motion.div>
  );
}

export function Capabilities() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  // Sideways travel per pixel of page scroll. More than 1 so a long deck doesn't take forever.
  const SPEED = 1.7;
  const [layout, setLayout] = useState<{ bases: number[]; step: number; pad: number }>({ bases: [], step: 380, pad: 24 });

  // How far the track has to travel sideways. The section is made exactly that much taller, so
  // vertical scroll drives the horizontal movement one to one while the content stays pinned.
  useLayoutEffect(() => {
    const measure = () => {
      const el = track.current;
      if (!el) return;
      setDist(Math.max(0, el.scrollWidth - window.innerWidth));
      const bases = Array.from(el.children).map((c) => (c as HTMLElement).offsetLeft);
      setLayout({ bases, step: bases.length > 1 ? bases[1] - bases[0] : 380, pad: bases[0] ?? 24 });
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
  // A light spring on the scroll position makes the deck glide and settle instead of tracking 1:1.
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 });
  const x = useTransform(smooth, [0, 1], [0, -dist]);
  const xPx = useTransform(x, (v) => Math.round(v));
  const bar = useTransform(scrollYProgress, [0, 1], ['4%', '100%']);

  return (
    <section
      ref={section}
      id="capabilities"
      className="relative border-b border-border"
      style={{ height: `calc(100vh - 105px + ${dist / SPEED}px)` }}
    >
      <div className="sticky top-[105px] flex h-[calc(100vh-105px)] flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1056px] px-6 pb-8 md:px-12 md:pb-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green">Skills</p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,5.4vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Capabilities
          </h2>
          <p className="mt-3 max-w-[520px] text-base leading-snug text-muted-foreground md:text-lg [@media(max-height:820px)]:hidden">
            Ready-made skills your agents run at every stage, so the documents, designs and tests never slow the build.
          </p>
        </div>

        <div className="py-3">
          <motion.div
            ref={track}
            style={{ x: xPx }}
            className="flex w-max gap-3 pl-[max(1.5rem,calc((100vw-1056px)/2+1.5rem))] pr-[max(1.5rem,calc((100vw-1056px)/2+1.5rem))] md:gap-5"
          >
            {CAPABILITIES.map((c, i) => (
              <StackItem key={c.id} index={i} base={layout.bases[i] ?? i * layout.step} step={layout.step} pad={layout.pad} x={xPx}>
                <CapabilityCard item={c} index={i} total={CAPABILITIES.length} />
              </StackItem>
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
