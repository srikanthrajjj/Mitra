import type { ReactNode } from 'react';
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

const LINE = 'fill-none stroke-border';
const ACCENT = 'fill-brand-green stroke-brand-green';

/** Quiet, low-contrast illustrations. One green accent each, everything else hairline. */
const VISUALS: Record<string, ReactNode> = {
  onboarding: (
    <>
      {[16, 44, 72].map((y, i) => (
        <g key={y}>
          <rect x="24" y={y} width="14" height="14" rx="3" className={i === 0 ? 'fill-brand-green/20 stroke-brand-green' : LINE} />
          <rect x="48" y={y + 4} width={i === 0 ? 120 : i === 1 ? 92 : 108} height="6" rx="3" className="fill-border" />
        </g>
      ))}
      <Pulse>
        <path d="M28 23l3 3 5-6" className="fill-none stroke-brand-green" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Pulse>
    </>
  ),
  triage: (
    <>
      {[
        { y: 18, w: 190, hot: true },
        { y: 44, w: 140, hot: false },
        { y: 70, w: 90, hot: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x="24" y={r.y} width={r.w} height="12" rx="6" className={r.hot ? 'fill-brand-green/15 stroke-brand-green' : LINE} />
          <circle cx="36" cy={r.y + 6} r="2.5" className={r.hot ? ACCENT : 'fill-border stroke-border'} />
        </g>
      ))}
    </>
  ),
  vendor: (
    <>
      <path d="M52 48H112M148 48H190" className={LINE} strokeDasharray="3 4" />
      <rect x="24" y="34" width="28" height="28" rx="7" className={LINE} />
      <rect x="112" y="34" width="36" height="28" rx="7" className={LINE} />
      <Pulse>
        <rect x="190" y="34" width="28" height="28" rx="7" className="fill-brand-green/20 stroke-brand-green" />
        <path d="M198 48l5 5 8-9" className="fill-none stroke-brand-green" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </Pulse>
    </>
  ),
  routing: (
    <>
      <circle cx="30" cy="48" r="5" className={LINE} />
      <path d="M35 48h50M85 48c28 0 28-28 56-28h60M85 48h116M85 48c28 0 28 28 56 28h60" className={LINE} />
      {[20, 48, 76].map((y, i) => (
        <rect key={y} x="201" y={y - 7} width="20" height="14" rx="4" className={i === 1 ? 'fill-brand-green/20 stroke-brand-green' : LINE} />
      ))}
      <Pulse>
        <circle cx="30" cy="48" r="3" className={ACCENT} />
      </Pulse>
    </>
  ),
  access: (
    <>
      {[18, 44, 70].map((y, i) => (
        <g key={y}>
          <rect x="24" y={y} width="100" height="6" rx="3" className="fill-border" />
          <rect x="176" y={y - 4} width="40" height="14" rx="7" className={i === 1 ? 'fill-brand-green/20 stroke-brand-green' : LINE} />
          <circle cx={i === 1 ? 209 : 183} cy={y + 3} r="4.5" className={i === 1 ? ACCENT : 'fill-border stroke-border'} />
        </g>
      ))}
    </>
  ),
  workplace: (
    <>
      {Array.from({ length: 18 }, (_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const lit = i === 8;
        return (
          <rect
            key={i}
            x={24 + col * 34}
            y={14 + row * 26}
            width="26"
            height="18"
            rx="4"
            className={lit ? 'fill-brand-green/20 stroke-brand-green' : LINE}
          />
        );
      })}
    </>
  ),
};

interface UseCase {
  team: string;
  title: string;
  after: string;
  visual: keyof typeof VISUALS;
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
      <div className="px-6 py-20 md:px-12 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-green">Use cases</p>
        <h2 className="mt-4 max-w-[760px] font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
          The backlog every ServiceNow team already has, shipped
        </h2>
        <p className="mt-5 max-w-[560px] text-lg leading-snug text-muted-foreground">
          Illustrative scenarios from common delivery work.
        </p>
      </div>

      <div className="relative grid border-y border-border sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((u, i) => (
          <motion.article
            key={u.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group relative border-b border-border p-7 transition-colors duration-300 last:border-b-0 hover:bg-mitra-highlight sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 md:p-8 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
          >
            <Corner className="-left-[5px] -top-[5px]" />
            <svg
              viewBox="0 0 240 96"
              className="h-24 w-full opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              fill="none"
              strokeWidth="1"
              aria-hidden
            >
              {VISUALS[u.visual]}
            </svg>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{u.team}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em]">{u.title}</h3>
            <p className="mt-2 text-[15px] leading-snug text-muted-foreground">{u.after}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
