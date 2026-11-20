import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { ArrowUp, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TECH_STAGES } from './techData';
import { TechOrb } from './TechOrb';

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

/** Phase shown as running for a given number of completed to-dos. */
function phaseFor(done: number, artifacts: number): number {
  if (artifacts >= ARTIFACTS.length) return 4;
  if (done >= 6) return 3;
  if (done >= 5) return 2;
  if (done >= 2) return 1;
  return 0;
}

/**
 * Scripted product demo: a prompt types itself, Mitra plans, checks off its build
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
  const energy = !sent ? (typing ? 1 : 0) : artifacts >= ARTIFACTS.length ? 0 : 2;

  return (
    <div
      ref={rootRef}
      className="relative grid h-[36rem] grid-cols-1 overflow-hidden bg-background text-foreground md:h-[34rem] md:grid-cols-[1fr_16rem]"
      aria-label="Animated demo of Mitra building a ServiceNow onboarding app"
      role="img"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(hsl(var(--foreground)/0.09)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden
      />

      {/* Orb: centred while idle, docks to the corner once the build starts */}
      <motion.div
        className="pointer-events-none absolute z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 md:h-72 md:w-72"
        initial={false}
        animate={sent ? { left: '2.4rem', top: '2.5rem', scale: 0.16, opacity: 0.95 } : { left: '50%', top: '32%', scale: 1, opacity: 1 }}
        style={{ marginLeft: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="absolute inset-0 rounded-full bg-brand-green/10 blur-3xl"
          aria-hidden
        />
        <TechOrb energy={energy} className="absolute inset-0" />
      </motion.div>

      {/* Chat column */}
      <div className="relative flex min-w-0 flex-col border-border md:border-r">
        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 border-b border-border px-5 py-3 pl-[4.2rem]"
            >
              <span className="font-display text-sm font-extrabold tracking-tight">Mitra</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-green">
                {artifacts >= ARTIFACTS.length ? 'Ready for review' : 'Building'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!sent && (
          <div className="relative z-0 flex flex-1 flex-col items-center justify-end px-5 pb-1 text-center md:px-8">
            <h3 className="mb-4 font-display text-2xl font-extrabold tracking-[-0.03em] md:text-3xl">
              What will you build?
            </h3>
          </div>
        )}

        {sent && (
          <div className="relative z-0 flex-1 space-y-4 overflow-hidden p-5 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="ml-auto w-fit max-w-[88%] rounded-2xl bg-muted px-4 py-2.5 text-[13px] leading-snug"
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
                  className="flex items-center gap-2 text-[13px] text-muted-foreground"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-green" />
                  Mitra is thinking…
                </motion.div>
              )}
            </AnimatePresence>

            {showPlan && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-border bg-card/90 p-4 backdrop-blur"
              >
                <p className="text-[13px] leading-snug text-muted-foreground">
                  I&apos;ll build your HR onboarding tracker: HRSD scope, catalog workflows, SLA timers, and
                  stakeholder-ready artifacts.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {TODOS.map((t, i) => {
                    const isDone = done > i;
                    const isActive = done === i;
                    return (
                      <motion.li
                        key={t}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-2.5 text-[12.5px] leading-snug"
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
              'mx-auto flex max-w-xl items-end gap-3 rounded-2xl border bg-mitra-input/90 px-4 py-3 backdrop-blur transition-all duration-300',
              typing
                ? 'border-brand-green/70 shadow-[0_0_0_4px_hsl(var(--ring)/0.14),0_0_40px_-8px_hsl(var(--ring)/0.5)]'
                : 'border-border',
            )}
          >
            <p className="min-h-[2.6rem] flex-1 text-left text-[13px] leading-snug">
              {typing ? (
                <>
                  {PROMPT.slice(0, typed)}
                  <span className="ml-px inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-brand-green" />
                </>
              ) : (
                <span className="text-muted-foreground">
                  {sent ? (artifacts >= ARTIFACTS.length ? 'Awaiting stakeholder approval…' : 'Mitra is working…') : 'Describe the solution you want to build…'}
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
      <aside className="relative z-0 hidden flex-col gap-5 overflow-hidden p-5 md:flex">
        <ol className="space-y-3">
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
                      'text-[13px] font-semibold leading-tight transition-colors',
                      state === 'idle' ? 'text-muted-foreground' : 'text-foreground',
                    )}
                  >
                    {s.title}
                  </div>
                  <div className="truncate text-[11px] leading-snug text-muted-foreground">{s.summary}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-border pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Artifacts</p>
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
                  <span className="truncate text-[11.5px] font-medium">{a.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-brand-green">
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
