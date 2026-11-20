import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Headset,
  Laptop,
  LifeBuoy,
  ShieldCheck,
  ShoppingCart,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UseCase {
  team: string;
  title: string;
  before: string;
  after: string;
  builds: string[];
  icon: LucideIcon;
}

/** Illustrative scenarios drawn from common ServiceNow delivery work, not customer claims. */
const USE_CASES: UseCase[] = [
  {
    team: 'HR',
    title: 'Employee onboarding',
    before: 'Day-one access requests chase five teams over email.',
    after: 'One request provisions accounts, devices and tasks.',
    builds: ['Table extensions', 'Catalog items', 'Onboarding flow'],
    icon: UserPlus,
  },
  {
    team: 'IT operations',
    title: 'Incident triage',
    before: 'P1s sit in a shared queue while engineers hunt for context.',
    after: 'Incidents arrive classified, routed and with context attached.',
    builds: ['Assignment rules', 'Enrichment flow', 'Runbook tasks'],
    icon: LifeBuoy,
  },
  {
    team: 'Procurement',
    title: 'Vendor intake',
    before: 'Spreadsheets and email threads for every new supplier review.',
    after: 'Every vendor follows the same governed approval path.',
    builds: ['Intake form', 'Approval flow', 'Risk checklist'],
    icon: ShoppingCart,
  },
  {
    team: 'Customer service',
    title: 'Case routing',
    before: 'Agents re-route cases by hand and SLAs slip.',
    after: 'Cases reach the right team before the SLA clock matters.',
    builds: ['Routing rules', 'SLA definitions', 'Escalations'],
    icon: Headset,
  },
  {
    team: 'Security',
    title: 'Access reviews',
    before: 'Quarterly reviews run on exported spreadsheets.',
    after: 'Reviews run in-platform with a full evidence trail.',
    builds: ['Review tasks', 'Attestations', 'Audit trail'],
    icon: ShieldCheck,
  },
  {
    team: 'Facilities',
    title: 'Workplace requests',
    before: 'Moves, desks and repairs live in inboxes.',
    after: 'One portal, tracked end to end.',
    builds: ['Request portal', 'Fulfilment tasks', 'Notifications'],
    icon: Laptop,
  },
];

/** Request -> Build -> Live, with a dot that travels the line so each card reads as a process. */
function Pipeline({ offset }: { offset: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mt-6 flex items-center justify-between" aria-hidden>
      <div className="absolute inset-x-1.5 top-1/2 h-px bg-border" />
      {!reduce && (
        <motion.span
          className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-green"
          initial={{ left: '0%' }}
          animate={{ left: ['0%', 'calc(100% - 6px)'] }}
          transition={{ duration: 3.2, delay: offset, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
        />
      )}
      {['Request', 'Build', 'Live'].map((s, i) => (
        <span key={s} className="relative flex flex-col items-center gap-1.5 bg-background px-1.5 group-hover:bg-mitra-highlight">
          <span className={cn('h-2 w-2 rounded-full border', i === 2 ? 'border-brand-green bg-brand-green' : 'border-border bg-background')} />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{s}</span>
        </span>
      ))}
    </div>
  );
}

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
          Illustrative scenarios from common delivery work. Each one starts as a sentence and ends as a governed build.
        </p>
      </div>

      <div className="relative grid border-y border-border sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((u, i) => {
          const Icon = u.icon;
          return (
            <motion.article
              key={u.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col border-b border-border p-7 transition-colors duration-300 last:border-b-0 hover:bg-mitra-highlight sm:border-r sm:[&:nth-child(2n)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0 md:p-8"
            >
              <Corner className="-left-[5px] -top-[5px]" />
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-border text-brand-green transition-colors group-hover:border-brand-green">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{u.team}</span>
              </div>

              <h3 className="mt-7 font-display text-2xl font-semibold tracking-[-0.02em]">{u.title}</h3>

              <p className="mt-4 text-[15px] leading-snug text-muted-foreground">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/60">Before</span>
                {u.before}
              </p>
              <p className="mt-3 text-[15px] font-medium leading-snug text-foreground">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-green">After</span>
                {u.after}
              </p>

              <Pipeline offset={i * 0.45} />

              <div className="mt-6 flex flex-wrap gap-1.5">
                {u.builds.map((b) => (
                  <span key={b} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    {b}
                  </span>
                ))}
              </div>
              <span className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-brand-green">
                See how it builds <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
