import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Soft pulse for the single green accent in each illustration. */
function Pulse({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.g
      initial={{ opacity: 0.55 }}
      animate={reduce ? { opacity: 1 } : { opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.g>
  );
}

const LINE = 'fill-none stroke-muted-foreground/45';
const ACCENT = 'fill-brand-green stroke-brand-green';

type V = { on: boolean };
const GREEN_FILL = 'fill-brand-green/20 stroke-brand-green';
const LOOP = { repeat: Infinity, ease: 'linear' as const };

/** Quiet, low-contrast illustrations. One green accent each; hovering the card plays the story. */
function Onboarding({ on }: V) {
  return (
    <>
      {[16, 44, 72].map((y, i) => {
        const done = i === 0 || on;
        const delay = on ? i * 0.2 : 0;
        return (
          <g key={y}>
            <rect x="24" y={y} width="14" height="14" rx="3" className={i === 0 ? GREEN_FILL : LINE} />
            {i > 0 && (
              <motion.rect x="24" y={y} width="14" height="14" rx="3" className={GREEN_FILL} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ delay, duration: 0.25 }} />
            )}
            <motion.path
              d={`M28 ${y + 7}l3 3 5-6`}
              className="fill-none stroke-brand-green"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
              transition={{ delay: delay + 0.08, duration: 0.3 }}
            />
            <rect x="48" y={y + 4} width={i === 0 ? 120 : i === 1 ? 92 : 108} height="6" rx="3" className="fill-muted-foreground/30" />
          </g>
        );
      })}
    </>
  );
}

function Triage({ on }: V) {
  return (
    <>
      {[
        { y: 18, w: 190, hot: true },
        { y: 44, w: 140, hot: false },
        { y: 70, w: 90, hot: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x="24" y={r.y} width={r.w} height="12" rx="6" className={r.hot ? GREEN_FILL : LINE} />
          {r.hot ? (
            <motion.circle cy={r.y + 6} r="2.5" className={ACCENT} initial={false} animate={{ cx: on ? 206 : 36 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
          ) : (
            <circle cx="36" cy={r.y + 6} r="2.5" className="fill-muted-foreground/45 stroke-muted-foreground/45" />
          )}
        </g>
      ))}
    </>
  );
}

function Vendor({ on }: V) {
  return (
    <>
      <path d="M52 48H112M148 48H190" className={LINE} strokeDasharray="3 4" />
      <rect x="24" y="34" width="28" height="28" rx="7" className={LINE} />
      <rect x="112" y="34" width="36" height="28" rx="7" className={LINE} />
      <motion.rect x="112" y="34" width="36" height="28" rx="7" className={GREEN_FILL} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ delay: on ? 0.5 : 0, duration: 0.3 }} />
      <rect x="190" y="34" width="28" height="28" rx="7" className={GREEN_FILL} />
      <path d="M198 48l5 5 8-9" className="fill-none stroke-brand-green" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <motion.circle
        cy="48"
        r="3"
        className={ACCENT}
        initial={false}
        animate={on ? { cx: [38, 130, 204], opacity: [0, 1, 0] } : { cx: 38, opacity: 0 }}
        transition={on ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      />
    </>
  );
}

function Routing({ on }: V) {
  return (
    <>
      <circle cx="30" cy="48" r="5" className={LINE} />
      <path d="M35 48h50M85 48c28 0 28-28 56-28h60M85 48h116M85 48c28 0 28 28 56 28h60" className={LINE} />
      {[20, 48, 76].map((y, i) => (
        <rect key={y} x="201" y={y - 7} width="20" height="14" rx="4" className={i === 1 ? GREEN_FILL : LINE} />
      ))}
      <motion.circle
        cy="48"
        r="3"
        className={ACCENT}
        initial={false}
        animate={on ? { cx: [30, 201, 201], opacity: [1, 1, 0] } : { cx: 30, opacity: 1 }}
        transition={on ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      />
    </>
  );
}

function Access({ on }: V) {
  return (
    <>
      {[18, 44, 70].map((y, i) => {
        const knobOn = (i === 1) !== on;
        return (
          <g key={y}>
            <rect x="24" y={y} width="100" height="6" rx="3" className="fill-muted-foreground/30" />
            <rect x="176" y={y - 4} width="40" height="14" rx="7" className={LINE} />
            <motion.rect x="176" y={y - 4} width="40" height="14" rx="7" className={GREEN_FILL} initial={false} animate={{ opacity: knobOn ? 1 : 0 }} transition={{ delay: on ? i * 0.15 : 0, duration: 0.25 }} />
            <motion.circle cy={y + 3} r="4.5" className={knobOn ? ACCENT : 'fill-muted-foreground/45 stroke-muted-foreground/45'} initial={false} animate={{ cx: knobOn ? 209 : 183 }} transition={{ delay: on ? i * 0.15 : 0, duration: 0.3 }} />
          </g>
        );
      })}
    </>
  );
}

const DESKS: [number, number][] = [[2, 1], [3, 1], [3, 0], [4, 0], [4, 2], [1, 2], [2, 1]];
function Workplace({ on }: V) {
  const px = (c: number) => 24 + c * 34;
  const py = (r: number) => 14 + r * 26;
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={i} x={px(i % 6)} y={py(Math.floor(i / 6))} width="26" height="18" rx="4" className={LINE} />
      ))}
      <motion.rect
        width="26"
        height="18"
        rx="4"
        className={GREEN_FILL}
        initial={false}
        animate={on ? { x: DESKS.map(([c]) => px(c)), y: DESKS.map(([, r]) => py(r)) } : { x: px(2), y: py(1) }}
        transition={on ? { duration: 3.2, ...LOOP } : { duration: 0.3 }}
      />
    </>
  );
}

const VISUALS: Record<string, (p: V) => ReactNode> = {
  onboarding: Onboarding,
  triage: Triage,
  vendor: Vendor,
  routing: Routing,
  access: Access,
  workplace: Workplace,
};

interface UseCase {
  team: string;
  title: string;
  after: string;
  visual: string;
  wide?: boolean;
}

/** Illustrative scenarios drawn from common ServiceNow delivery work, not customer claims. */
const USE_CASES: UseCase[] = [
  { team: 'HR', title: 'Employee onboarding', after: 'One request provisions accounts, devices and tasks.', visual: 'onboarding' },
  { team: 'IT operations', title: 'Incident triage', after: 'Incidents arrive classified, routed and with context.', visual: 'triage' },
  { team: 'Procurement', title: 'Vendor intake', after: 'Every vendor follows the same governed approval path.', visual: 'vendor' },
  { team: 'Customer service', title: 'Case routing', after: 'Cases reach the right team before the SLA clock matters.', visual: 'routing' },
  { team: 'Security', title: 'Access reviews', after: 'Reviews run in-platform with a full evidence trail.', visual: 'access' },
  { team: 'Facilities', title: 'Workplace requests', after: 'One portal, tracked end to end.', visual: 'workplace' },
];

function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 10 10" className={cn('absolute h-[10px] w-[10px] text-muted-foreground', className)} aria-hidden>
      <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function UseCases() {
  return (
    <section id="usecases" className="mx-auto w-full max-w-[1056px] border-x border-dashed border-border">
      <div data-reveal className="px-6 py-20 md:px-12 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green">Use cases</p>
        <h2 className="mt-4 max-w-[760px] font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          The backlog every ServiceNow team already has, shipped
        </h2>
        <p className="mt-5 max-w-[560px] text-lg leading-snug text-muted-foreground">
          Illustrative scenarios from common delivery work.
        </p>
      </div>

      <div className="relative grid gap-px border-y border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((u, i) => (
          <UseCaseCard key={u.title} u={u} i={i} />
        ))}
      </div>
    </section>
  );
}

function UseCaseCard({ u, i }: { u: UseCase; i: number }) {
  const [on, setOn] = useState(false);
  const Visual = VISUALS[u.visual];
  return (
          <motion.article
            onMouseEnter={() => setOn(true)}
            onMouseLeave={() => setOn(false)}
            onFocus={() => setOn(true)}
            onBlur={() => setOn(false)}
            tabIndex={0}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'group relative bg-background p-7 transition-colors duration-300 hover:bg-mitra-highlight md:p-8',
              u.wide && 'sm:col-span-2 lg:col-span-3 md:flex md:items-center md:gap-12',
            )}
          >
            <Corner className="-left-[5px] -top-[5px]" />
            <svg
              viewBox="0 0 240 96"
              className={cn(
                'h-24 w-full opacity-90 transition-opacity duration-300 group-hover:opacity-100',
                u.wide && 'md:h-32 md:w-[38%] md:shrink-0',
              )}
              fill="none"
              strokeWidth="1"
              aria-hidden
            >
              <Visual on={on} />
            </svg>
            <div className={cn(!u.wide && 'mt-6')}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{u.team}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em]">{u.title}</h3>
              <p className={cn('mt-2 text-[15px] leading-snug text-muted-foreground', u.wide && 'max-w-[520px]')}>{u.after}</p>
            </div>
          </motion.article>
  );
}
