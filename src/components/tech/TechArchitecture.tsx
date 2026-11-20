import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import {
  ClipboardList,
  Cog,
  Database,
  FileText,
  Lightbulb,
  Rocket,
  Search,
  ShieldCheck,
  Upload,
  Workflow,
  LayoutTemplate,
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
  agent: string;
  text: string;
  icon: LucideIcon;
  /** Environment highlighted while this step runs. */
  env: 0 | 1 | 2;
  gate?: boolean;
}

const STEPS: Step[] = [
  {
    id: 'define',
    label: 'Define',
    agent: 'Requirements agent',
    text: 'Turns workshop conversations into user stories, acceptance criteria and scope boundaries.',
    icon: ClipboardList,
    env: 0,
  },
  {
    id: 'build',
    label: 'Build',
    agent: 'Build agent',
    text: 'Configures tables, flows, catalog items and integrations to your standards.',
    icon: Cog,
    env: 0,
  },
  {
    id: 'test',
    label: 'Test',
    agent: 'Test agent',
    text: 'Runs Automated Test Framework coverage before anything moves on.',
    icon: Workflow,
    env: 1,
  },
  {
    id: 'docs',
    label: 'Document',
    agent: 'Documentation agent',
    text: 'Writes training material and release notes from what was actually built.',
    icon: FileText,
    env: 1,
  },
  {
    id: 'gate',
    label: 'Approve',
    agent: 'Human checkpoint',
    text: 'A person reviews and approves before anything is promoted. Nothing ships on its own.',
    icon: ShieldCheck,
    env: 1,
    gate: true,
  },
  {
    id: 'deploy',
    label: 'Deploy',
    agent: 'Deployment agent',
    text: 'Promotes update sets through governed environments and monitors adoption.',
    icon: Rocket,
    env: 2,
  },
];

const ENVS = ['Development', 'Test', 'Production'] as const;

function Connector() {
  return (
    <div
      className="relative mx-auto h-10 w-px shrink-0 bg-border lg:mx-0 lg:h-px lg:w-14 lg:self-center"
      aria-hidden
    >
      <span className="tech-flow absolute h-1.5 w-1.5 rounded-full bg-brand-green" />
    </div>
  );
}

/**
 * Orchestrator diagram: starting points feed the orchestrator, which holds shared context
 * and routes work through each agent with a human checkpoint, then promotes through the
 * customer's own environments. The active step advances automatically and on click.
 */
export function TechArchitecture() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((v) => (v + 1) % STEPS.length), 2600);
    return () => clearInterval(id);
  }, [inView, paused]);

  const step = STEPS[active];

  return (
    <section id="architecture" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-green">Architecture</p>
        <h2 className="mt-4 max-w-4xl font-display text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] md:text-6xl">
          One orchestrator. Specialised agents. Your instance.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          The orchestrator keeps context shared across stages, routes work to the right agent, and pauses for human
          approval before anything is promoted.
        </p>

        <div ref={ref} className="mt-14 flex flex-col lg:flex-row lg:items-stretch">
          {/* Inputs */}
          <div className="lg:w-56 lg:shrink-0">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Start from</p>
            <ul className="space-y-2.5">
              {INPUTS.map((inp) => {
                const Icon = inp.icon;
                return (
                  <li
                    key={inp.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-[13px] font-medium"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand-green" />
                    {inp.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <Connector />

          {/* Orchestrator */}
          <div
            className="min-w-0 flex-1 rounded-3xl border border-border bg-card p-5 md:p-7"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
                <p className="font-display text-lg font-extrabold tracking-tight">IlluminAIte orchestrator</p>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={step.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-[11px] text-brand-green"
                >
                  {step.gate ? 'Waiting for approval' : `Routing to ${step.agent.toLowerCase()}`}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Shared context */}
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
              <Database className="h-4 w-4 text-brand-green" />
              <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Shared context
              </span>
              {CONTEXT.map((c) => (
                <span key={c} className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium">
                  {c}
                </span>
              ))}
            </div>

            {/* Agent track */}
            <div className="relative mt-8">
              <div className="absolute left-[8.33%] right-[8.33%] top-5 h-px bg-border" aria-hidden />
              <div
                className="absolute left-[8.33%] top-5 h-px bg-brand-green transition-[width] duration-700 ease-out"
                style={{ width: `${(active / (STEPS.length - 1)) * 83.34}%` }}
                aria-hidden
              />
              <ol className="relative grid grid-cols-6">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const on = i === active;
                  const done = i < active;
                  return (
                    <li key={s.id} className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        aria-current={on ? 'step' : undefined}
                        aria-label={s.agent}
                        className="group flex flex-col items-center gap-2 outline-none"
                      >
                        <span
                          className={cn(
                            'flex h-10 w-10 items-center justify-center border bg-card transition-all duration-500',
                            s.gate ? 'rounded-xl border-dashed' : 'rounded-full',
                            on && 'scale-110 border-brand-green bg-brand-green text-background shadow-[0_0_0_6px_hsl(var(--ring)/0.18)]',
                            done && 'border-brand-green text-brand-green',
                            !on && !done && 'border-border text-muted-foreground group-hover:text-foreground',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span
                          className={cn(
                            'text-center text-[11px] font-semibold leading-tight transition-colors',
                            on ? 'text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {s.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Active step */}
            <div className="mt-7 min-h-[6.5rem] rounded-2xl bg-muted p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-display text-base font-bold">{step.agent}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{step.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <Connector />

          {/* Environments */}
          <div className="lg:w-56 lg:shrink-0">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Your ServiceNow instance
            </p>
            <ul className="space-y-2.5">
              {ENVS.map((env, i) => {
                const on = step.env === i;
                return (
                  <li
                    key={env}
                    className={cn(
                      'flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition-colors duration-500',
                      on ? 'border-brand-green' : 'border-border',
                    )}
                  >
                    <span className="text-[13px] font-medium">{env}</span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition-colors duration-500',
                          on ? 'animate-pulse bg-brand-green' : 'bg-muted',
                        )}
                      />
                      {on ? (step.gate && i === 1 ? 'Held' : 'Active') : 'Idle'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .tech-flow { left: 50%; top: 0; transform: translateX(-50%); animation: tech-flow-y 2.4s ease-in-out infinite; }
        @keyframes tech-flow-y { 0% { top: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @media (min-width: 1024px) {
          .tech-flow { top: 50%; left: 0; transform: translateY(-50%); animation-name: tech-flow-x; }
          @keyframes tech-flow-x { 0% { left: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
        }
        @media (prefers-reduced-motion: reduce) { .tech-flow { animation: none; opacity: 0; } }
      `}</style>
    </section>
  );
}
