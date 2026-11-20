import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Check,
  ClipboardList,
  Cog,
  Database,
  FileText,
  LayoutTemplate,
  Lightbulb,
  Rocket,
  Search,
  ShieldCheck,
  Upload,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INPUTS: { label: string; icon: LucideIcon }[] = [
  { label: 'New application', icon: Lightbulb },
  { label: 'Industry template', icon: LayoutTemplate },
  { label: 'Requirements to solution', icon: Upload },
  { label: 'Analyse an existing app', icon: Search },
];

const CONTEXT = ['ServiceNow patterns', 'CMDB', 'Industry playbooks'] as const;

interface Step {
  id: string;
  label: string;
  text: string;
  icon: LucideIcon;
  /** Environment the work sits in while this step runs. */
  env: 0 | 1 | 2;
  gate?: boolean;
}

const STEPS: Step[] = [
  { id: 'define', label: 'Requirements agent', text: 'Turns workshop conversations into user stories and acceptance criteria.', icon: ClipboardList, env: 0 },
  { id: 'build', label: 'Build agent', text: 'Configures tables, flows, catalog items and integrations.', icon: Cog, env: 0 },
  { id: 'test', label: 'Test agent', text: 'Runs Automated Test Framework coverage before anything moves on.', icon: Workflow, env: 1 },
  { id: 'docs', label: 'Documentation agent', text: 'Writes training material and release notes from what was built.', icon: FileText, env: 1 },
  { id: 'gate', label: 'Human checkpoint', text: 'A person approves before anything is promoted. Nothing ships on its own.', icon: ShieldCheck, env: 1, gate: true },
  { id: 'deploy', label: 'Deployment agent', text: 'Promotes update sets through governed environments and monitors adoption.', icon: Rocket, env: 2 },
];

const ENVS = ['Development', 'Test', 'Production'] as const;
const STEP_MS = 2600;

/** Short vertical link between layers with a travelling dot. */
function Link({ label }: { label: string }) {
  return (
    <div className="relative mx-auto flex h-14 flex-col items-center" aria-hidden>
      <div className="relative h-full w-px bg-border">
        <span className="tech-drop absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-green" />
      </div>
      <span className="absolute left-1/2 top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/**
 * Orchestrator, drawn as three stacked layers: ways to start, the orchestrator (shared
 * context plus the agent sequence with a human checkpoint), and the customer's own
 * environments. The active step advances on a timer and on click.
 */
export function TechArchitecture() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((v) => (v + 1) % STEPS.length), STEP_MS);
    return () => clearInterval(id);
  }, [inView, paused]);

  const step = STEPS[active];

  return (
    <section id="architecture" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Architecture</p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.1rem,5vw,3.75rem)] font-extrabold leading-[1.03] tracking-[-0.04em]">
          One orchestrator. Specialised agents. Your instance.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The orchestrator keeps context shared across stages, routes work to the right agent, and pauses for human
          approval before anything is promoted.
        </p>

        <div ref={ref} className="mt-12">
          {/* Layer 1: start */}
          <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {INPUTS.map((inp) => {
              const Icon = inp.icon;
              return (
                <li key={inp.label} className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-3 text-[13px] font-medium">
                  <Icon className="h-4 w-4 shrink-0 text-brand-green" />
                  <span className="min-w-0 leading-tight">{inp.label}</span>
                </li>
              );
            })}
          </ul>

          <Link label="Goal in" />

          {/* Layer 2: orchestrator */}
          <div
            className="rounded-3xl border border-border bg-card p-4 md:p-6"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
                </span>
                <p className="font-display text-lg font-extrabold tracking-tight">IlluminAIte orchestrator</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-brand-green" />
                <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Shared context</span>
                {CONTEXT.map((c) => (
                  <span key={c} className="rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <ol className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const on = i === active;
                const done = i < active;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={on ? 'step' : undefined}
                      className={cn(
                        'relative flex h-full w-full flex-col overflow-hidden rounded-2xl border p-3.5 text-left outline-none transition-colors duration-300',
                        s.gate && 'border-dashed',
                        on ? 'border-brand-green bg-background' : 'border-border bg-background/40 hover:border-foreground/30',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300',
                          on ? 'bg-brand-green text-background' : done ? 'bg-muted text-brand-green' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                      </span>
                      <span className={cn('mt-3 text-[13px] font-bold leading-tight', !on && !done && 'text-muted-foreground')}>
                        {s.label}
                      </span>
                      <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {on ? (s.gate ? 'Awaiting' : 'Working') : done ? 'Done' : 'Queued'}
                      </span>
                      {on && (
                        <motion.span
                          key={`bar-${active}`}
                          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-green"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: paused ? 0 : 1 }}
                          transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            <motion.p
              key={step.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 rounded-xl bg-muted px-4 py-3 text-[14px] leading-relaxed"
            >
              <span className="font-bold">{step.label}.</span> <span className="text-muted-foreground">{step.text}</span>
            </motion.p>
          </div>

          <Link label="Promoted through" />

          {/* Layer 3: your instance */}
          <div className="rounded-3xl border border-border p-4 md:p-5">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your ServiceNow instance</p>
            <ul className="grid grid-cols-3 gap-2.5">
              {ENVS.map((env, i) => {
                const on = step.env === i;
                return (
                  <li
                    key={env}
                    className={cn(
                      'rounded-xl border px-3.5 py-3 transition-colors duration-500',
                      on ? 'border-brand-green bg-card' : 'border-border',
                    )}
                  >
                    <p className="text-[13px] font-semibold">{env}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      <span className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-500', on ? 'animate-pulse bg-brand-green' : 'bg-muted')} />
                      {on ? (step.gate && i === 1 ? 'Held for approval' : 'Active') : 'Idle'}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .tech-drop { top: 0; animation: tech-drop 2.4s ease-in-out infinite; }
        @keyframes tech-drop { 0% { top: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .tech-drop { animation: none; opacity: 0; } }
      `}</style>
    </section>
  );
}
