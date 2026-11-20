import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Illustrative outputs for each lifecycle stage. They use the same example the live demo
 * builds (an employee onboarding app) and replay each time a stage becomes active.
 */

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-[22rem] min-w-0 flex-col rounded-2xl border border-border bg-background/70 p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{label}</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
          Example output
        </span>
      </div>
      {children}
    </div>
  );
}

const rise = (i: number, base = 0.2) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: base + i * 0.3, ease: [0.22, 1, 0.36, 1] as const },
});

/** Step counter that advances on a timer; instant in reduced-motion. */
function useSteps(total: number, intervalMs: number, startMs = 500): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(total);
      return;
    }
    let i = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      id = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= total && id) clearInterval(id);
      }, intervalMs);
    }, startMs);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [total, intervalMs, startMs]);
  return n;
}

const STORIES = [
  { who: 'New hire', title: 'See my onboarding tasks in one place', criteria: 3 },
  { who: 'Manager', title: 'Approve equipment requests', criteria: 2 },
  { who: 'HR', title: 'Track onboarding SLAs', criteria: 3 },
] as const;

export function DefineVisual() {
  return (
    <Frame label="Workshop to user stories">
      <motion.p
        {...rise(0, 0)}
        className="rounded-xl bg-muted px-4 py-3 text-[13px] italic leading-snug text-muted-foreground"
      >
        “New hires need one place to see their tasks, approvals and SLAs.”
      </motion.p>
      <div className="my-3 flex justify-center text-brand-green">
        <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <ArrowRight className="h-4 w-4 rotate-90" />
        </motion.span>
      </div>
      <div className="space-y-2.5">
        {STORIES.map((s, i) => (
          <motion.div
            key={s.title}
            {...rise(i, 0.55)}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-brand-green">
              As a {s.who.toLowerCase()}
            </span>
            <span className="min-w-[9rem] flex-1 text-[13px] font-medium leading-snug">{s.title}</span>
            <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">{s.criteria} criteria</span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green text-background">
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </span>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

const FIELDS = [
  ['number', 'string'],
  ['employee', 'reference'],
  ['start_date', 'date'],
  ['state', 'choice'],
  ['assignment_group', 'reference'],
] as const;

const FLOW = ['Catalog item submitted', 'Manager approval', 'Create onboarding tasks', 'SLA timer starts'] as const;

export function DesignVisual() {
  return (
    <Frame label="Tables, flows and catalog items">
      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-[11px] text-brand-green">Onboarding Case</p>
          <ul className="mt-3 space-y-1.5">
            {FIELDS.map(([name, type], i) => (
              <motion.li
                key={name}
                {...rise(i, 0.15)}
                transition={{ ...rise(i, 0.15).transition, delay: 0.15 + i * 0.12 }}
                className="flex items-center justify-between rounded-md bg-muted px-2.5 py-1.5 text-[12px]"
              >
                <span className="font-mono">{name}</span>
                <span className="text-muted-foreground">{type}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-[11px] text-brand-green">Flow Designer</p>
          <ol className="mt-3">
            {FLOW.map((step, i) => (
              <li key={step}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.35, duration: 0.4 }}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-[12px] font-medium"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green font-mono text-[10px] text-background">
                    {i + 1}
                  </span>
                  {step}
                </motion.div>
                {i < FLOW.length - 1 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.5 + i * 0.35, duration: 0.3 }}
                    className="mx-[1.1rem] h-3 w-px origin-top bg-brand-green"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Frame>
  );
}

const TESTS = [
  'Catalog item submits',
  'Approval routes to manager',
  'SLA timer starts',
  'Assignment rules apply',
  'Scoped app installs cleanly',
] as const;

export function TestVisual() {
  const passed = useSteps(TESTS.length, 650, 600);
  return (
    <Frame label="Automated Test Framework">
      <ul className="space-y-2">
        {TESTS.map((t, i) => {
          const done = passed > i;
          const running = passed === i;
          return (
            <motion.li
              key={t}
              {...rise(i, 0.1)}
              transition={{ ...rise(i, 0.1).transition, delay: 0.1 + i * 0.1 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-[13px]"
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                  done ? 'border-brand-green bg-brand-green text-background' : 'border-border text-brand-green',
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3.5} /> : running ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              </span>
              <span className={cn('flex-1 font-medium', !done && !running && 'text-muted-foreground')}>{t}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{done ? 'passed' : running ? 'running' : 'queued'}</span>
            </motion.li>
          );
        })}
      </ul>
      <div className="mt-auto flex items-center justify-between pt-4 font-mono text-[11px] uppercase tracking-[0.15em]">
        <span className="text-muted-foreground">Suite result</span>
        <span className={cn(passed >= TESTS.length ? 'text-brand-green' : 'text-muted-foreground')}>
          {passed} / {TESTS.length} passed
        </span>
      </div>
    </Frame>
  );
}

const DOC_LINES = [100, 88, 94, 72, 82, 56] as const;
const DOC_CHIPS = ['Training guide', 'Release notes', 'Build documentation'] as const;

export function DocumentVisual() {
  return (
    <Frame label="Generated alongside the build">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-brand-green" />
          <motion.p {...rise(0, 0)} className="font-display text-sm font-bold">
            Onboarding Tracker: admin guide
          </motion.p>
        </div>
        <div className="mt-4 space-y-2.5">
          {DOC_LINES.map((w, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: `${w}%`, transformOrigin: 'left' }}
              className="h-2 rounded-full bg-muted"
            />
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {DOC_CHIPS.map((c, i) => (
          <motion.span
            key={c}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 + i * 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium"
          >
            <Check className="h-3 w-3 text-brand-green" strokeWidth={3} />
            {c}
          </motion.span>
        ))}
      </div>
    </Frame>
  );
}

const ENVS = ['Development', 'Test', 'Production'] as const;

export function DeployVisual() {
  // 0 dev, 1 test, 2 awaiting approval, 3 production
  const step = useSteps(3, 1100, 700);
  const at = Math.min(step, 3);
  const cell = at === 0 ? 0 : at === 1 ? 1 : at === 2 ? 1 : 2;

  return (
    <Frame label="Governed promotion">
      <div className="grid flex-1 grid-cols-3 gap-3">
        {ENVS.map((env, i) => (
          <div
            key={env}
            className={cn(
              'flex flex-col rounded-xl border bg-card p-3 transition-colors duration-500',
              cell === i ? 'border-brand-green' : 'border-border',
            )}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{env}</p>
            <div className="mt-3 flex min-h-[3.4rem] flex-1 items-start">
              {cell === i && (
                <motion.div
                  layoutId="update-set"
                  transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                  className="w-full rounded-lg bg-brand-green px-2.5 py-2 text-[11px] font-semibold leading-tight text-background"
                >
                  Update set
                  <span className="block font-normal opacity-80">Onboarding Tracker</span>
                </motion.div>
              )}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  (i === 0 && at >= 0) || (i === 1 && at >= 1) || (i === 2 && at >= 3) ? 'bg-brand-green' : 'bg-muted',
                )}
              />
              {(i === 0 && 'Built') || (i === 1 && (at >= 1 ? 'Validated' : 'Pending')) || (at >= 3 ? 'Live' : 'Pending')}
            </p>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'mt-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12.5px] font-medium transition-colors duration-500',
          at === 2 ? 'border-brand-green bg-brand-green/10' : 'border-border bg-card',
        )}
      >
        <ShieldCheck className={cn('h-4 w-4', at >= 2 ? 'text-brand-green' : 'text-muted-foreground')} />
        {at < 2 && 'Human checkpoint before production'}
        {at === 2 && 'Approval required to promote to production'}
        {at >= 3 && 'Approved and promoted. Monitoring adoption.'}
      </div>
    </Frame>
  );
}

export const STAGE_VISUALS = [DefineVisual, DesignVisual, TestVisual, DocumentVisual, DeployVisual] as const;
