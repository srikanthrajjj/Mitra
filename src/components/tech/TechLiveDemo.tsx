import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { ArrowUp, Check, LayoutTemplate, Lightbulb, Loader2, Search, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TECH_STAGES } from './techData';

const PROMPT =
  'I want to build a scoped app for employee onboarding with table extensions and catalog items.';

const TODOS = [
  'Parse HR onboarding scope and map HRSD modules',
  'Draft user stories and catalog item structure',
  'Configure approval workflow and Flow Designer SLA timers',
  'Define table schema, forms, and assignment rules',
  'Generate ATF test suite and SLA dashboard widgets',
  'Package artifacts for stakeholder review',
] as const;

const ARTIFACTS = [
  { name: 'Requirements Document', type: 'DOC' },
  { name: 'Data Model', type: 'XML' },
  { name: 'Workflow Diagram', type: 'JSON' },
  { name: 'Role Matrix', type: 'XML' },
  { name: 'Script Library', type: 'JSON' },
  { name: 'Test Script', type: 'DOC' },
  { name: 'Deployment Checklist', type: 'DOC' },
] as const;

const START_OPTIONS = [
  { label: 'New application', hint: 'Describe a solution', icon: Lightbulb },
  { label: 'Industry template', hint: 'Start from a template', icon: LayoutTemplate },
  { label: 'Requirements to solution', hint: 'Import requirements', icon: Upload },
  { label: 'Analyse an existing app', hint: 'Improve what you have', icon: Search },
] as const;

/** Phase shown as running for a given number of completed to-dos. */
function phaseFor(done: number, artifacts: number): number {
  if (artifacts >= ARTIFACTS.length) return 4;
  if (done >= 6) return 3;
  if (done >= 5) return 2;
  if (done >= 2) return 1;
  return 0;
}

/**
 * Scripted product demo: a prompt types itself, IlluminAIte plans, checks off its build
 * plan, advances the five-phase tracker and produces artifacts, then loops.
 * Copy is taken from the real workspace. Static final state for reduced motion.
 */
export function TechLiveDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const [typed, setTyped] = useState(0);
  const [sent, setSent] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [done, setDone] = useState(0);
  const [artifacts, setArtifacts] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(PROMPT.length);
      setSent(true);
      setShowPlan(true);
      setDone(TODOS.length);
      setArtifacts(ARTIFACTS.length);
      return;
    }

    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (cancelled ? reject(new Error('cancelled')) : resolve()), ms),
      );

    const run = async () => {
      try {
        for (;;) {
          setTyped(0);
          setSent(false);
          setThinking(false);
          setShowPlan(false);
          setDone(0);
          setArtifacts(0);
          await wait(700);
          for (let i = 1; i <= PROMPT.length; i += 1) {
            setTyped(i);
            await wait(PROMPT[i - 1] === ' ' ? 46 : 24);
          }
          await wait(550);
          setSent(true);
          setTyped(0);
          setThinking(true);
          await wait(1300);
          setThinking(false);
          setShowPlan(true);
          for (let i = 1; i <= TODOS.length; i += 1) {
            await wait(850);
            setDone(i);
          }
          await wait(400);
          for (let i = 1; i <= ARTIFACTS.length; i += 1) {
            setArtifacts(i);
            await wait(300);
          }
          await wait(4200);
        }
      } catch {
        /* cancelled */
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  const phase = phaseFor(done, artifacts);
  const typing = typed > 0 && !sent;

  return (
    <div
      ref={rootRef}
      className="relative grid h-[clamp(32rem,82dvh,46rem)] grid-cols-1 overflow-hidden text-foreground lg:grid-cols-[1fr_20rem]"
      aria-label="Animated demo of IlluminAIte building a ServiceNow onboarding app"
      role="img"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(hsl(var(--foreground)/0.09)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden
      />

      {/* Chat column */}
      <div className="relative flex min-w-0 flex-col border-border lg:border-r">
        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 border-b border-border px-5 py-2.5"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
              </span>
              <span className="font-display text-base font-extrabold tracking-tight">IlluminAIte</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-green">
                {artifacts >= ARTIFACTS.length ? 'Ready for review' : 'Building'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!sent && (
          <div className="relative z-0 flex flex-1 flex-col items-center justify-center px-5 pb-2 text-center md:px-8">
            <h3 className="font-display text-3xl font-extrabold tracking-[-0.035em] md:text-5xl">What will you build?</h3>
            <p className="mt-3 max-w-md text-[15px] text-muted-foreground">
              Describe it in plain language, or start from one of these.
            </p>
            <ul className="mt-7 grid w-full max-w-2xl grid-cols-2 gap-3">
              {START_OPTIONS.map((o, i) => {
                const Icon = o.icon;
                return (
                  <motion.li
                    key={o.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
                    className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/50 px-4 py-3.5 text-left backdrop-blur-xl shadow-[inset_0_1px_0_hsl(var(--foreground)/0.07)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-brand-green">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold">{o.label}</span>
                      <span className="block truncate text-[12px] text-muted-foreground">{o.hint}</span>
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        )}

        {sent && (
          <div className="relative z-0 flex-1 space-y-4 overflow-hidden p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="ml-auto w-fit max-w-[88%] rounded-2xl bg-muted px-4 py-2.5 text-[15px] leading-snug"
            >
              {PROMPT}
            </motion.div>

            <AnimatePresence>
              {thinking && (
                <motion.div
                  key="think"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-[15px] text-muted-foreground"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-green" />
                  IlluminAIte is thinking…
                </motion.div>
              )}
            </AnimatePresence>

            {showPlan && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-foreground/10 bg-card/55 p-5 backdrop-blur-xl shadow-[inset_0_1px_0_hsl(var(--foreground)/0.07)]"
              >
                <p className="text-[15px] leading-snug text-muted-foreground">
                  I&apos;ll build your HR onboarding tracker: HRSD scope, catalog workflows, SLA timers, and
                  stakeholder-ready artifacts.
                </p>
                <ul className="mt-3 space-y-2">
                  {TODOS.map((t, i) => {
                    const isDone = done > i;
                    const isActive = done === i;
                    return (
                      <motion.li
                        key={t}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-2.5 text-[14.5px] leading-snug"
                      >
                        <span
                          className={cn(
                            'mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                            isDone ? 'border-brand-green bg-brand-green text-background' : 'border-border',
                            isActive && 'border-brand-green',
                          )}
                        >
                          {isDone && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                          {isActive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />}
                        </span>
                        <span
                          className={cn(
                            'transition-colors duration-300',
                            isDone ? 'text-muted-foreground line-through' : 'text-foreground',
                          )}
                        >
                          {t}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </div>
        )}

        {/* Composer */}
        <div className="relative z-20 px-4 pb-4 pt-2 md:px-6 md:pb-5">
          <div
            className={cn(
              'mx-auto flex max-w-2xl items-end gap-3 rounded-2xl border bg-mitra-input/90 px-4 py-3 backdrop-blur transition-all duration-300',
              typing
                ? 'border-brand-green/70 shadow-[0_0_0_4px_hsl(var(--ring)/0.14),0_0_40px_-8px_hsl(var(--ring)/0.5)]'
                : 'border-border',
            )}
          >
            <p className="min-h-[3.4rem] flex-1 text-left text-[15px] leading-snug">
              {typing ? (
                <>
                  {PROMPT.slice(0, typed)}
                  <span className="ml-px inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-brand-green" />
                </>
              ) : (
                <span className="text-muted-foreground">
                  {sent ? (artifacts >= ARTIFACTS.length ? 'Awaiting stakeholder approval…' : 'IlluminAIte is working…') : 'Describe the solution you want to build…'}
                </span>
              )}
            </p>
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                typed === PROMPT.length ? 'bg-brand-green text-background' : 'bg-muted text-muted-foreground',
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Status + artifacts column */}
      <aside className="relative z-0 hidden flex-col gap-5 overflow-hidden p-5 lg:flex">
        <ol className="space-y-3.5">
          {TECH_STAGES.map((s, i) => {
            const state = !sent ? 'idle' : i < phase ? 'done' : i === phase ? 'running' : 'idle';
            return (
              <li key={s.num} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                    state === 'done' && 'border-brand-green bg-brand-green text-background',
                    state === 'running' && 'border-brand-green',
                    state === 'idle' && 'border-border',
                  )}
                >
                  {state === 'done' && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                  {state === 'running' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />}
                </span>
                <div className="min-w-0">
                  <div
                    className={cn(
                      'text-[15px] font-semibold leading-tight transition-colors',
                      state === 'idle' ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {s.title}
                  </div>
                  <div className="truncate text-[12.5px] leading-snug text-muted-foreground">{s.summary}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-border pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Artifacts</p>
          <ul className="mt-3 space-y-1.5">
            <AnimatePresence>
              {ARTIFACTS.slice(0, artifacts).map((a) => (
                <motion.li
                  key={a.name}
                  initial={{ opacity: 0, x: 12, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5"
                >
                  <span className="truncate text-[13px] font-medium">{a.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-brand-green">
                    {a.type}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </aside>
    </div>
  );
}
