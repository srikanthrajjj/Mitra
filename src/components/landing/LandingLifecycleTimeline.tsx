import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Rocket, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_MS = 1600;

const REQUEST_TEXT = 'Create an Employee Onboarding Portal';

/** Compact 4-step journey — keeps panel near laptop viewport height */
const JOURNEY_STEPS = [
  'Understanding your business',
  'Creating user stories',
  'Building workflows',
  'Ready for deployment',
] as const;

const PREVIEW_STATES = [
  'Wireframe',
  'Application layout',
  'Service Portal',
  'Deployment ready',
] as const;

function getPreviewStage(activeStep: number) {
  return Math.min(activeStep, PREVIEW_STATES.length - 1);
}

export function AIImplementationJourney() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setActiveStep(JOURNEY_STEPS.length - 1);
      return;
    }

    if (activeStep >= JOURNEY_STEPS.length - 1) return;

    const id = window.setTimeout(() => {
      setActiveStep((current) => Math.min(current + 1, JOURNEY_STEPS.length - 1));
    }, STAGE_MS);

    return () => window.clearTimeout(id);
  }, [inView, reduceMotion, activeStep]);

  const previewStage = getPreviewStage(activeStep);
  const isComplete = activeStep >= JOURNEY_STEPS.length - 1;
  const progress = ((activeStep + 1) / JOURNEY_STEPS.length) * 100;
  const typingText = useMemo(() => {
    if (activeStep === 0 && !isComplete) return `${REQUEST_TEXT.slice(0, 28)}…`;
    return REQUEST_TEXT;
  }, [activeStep, isComplete]);

  return (
    <div ref={containerRef} className="mt-8 md:mt-10">
      <div className="overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.4)] ring-1 ring-[var(--landing-accent)]/15 md:max-h-[min(580px,74vh)] md:rounded-[1.5rem]">
        <div className="grid lg:grid-cols-2 lg:items-stretch lg:max-h-[min(580px,74vh)]">
          {/* Left — prompt + journey */}
          <div className="flex flex-col border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:border-white/10 lg:overflow-y-auto">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--landing-accent)]/15 text-[var(--landing-accent)]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--landing-accent)]">
                Live build stream
              </p>
            </div>

            <div className="rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-left">
              <p className="font-display text-base font-bold leading-snug tracking-tight text-white md:text-lg">
                <span>{typingText}</span>
                {!isComplete && (
                  <motion.span
                    className="ml-1 inline-block h-[1.05em] w-[2px] translate-y-0.5 bg-[var(--landing-accent)]"
                    animate={{ opacity: [1, 0.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </p>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-white/65">Build progress</p>
                <p className="font-display text-xs font-bold tabular-nums text-[var(--landing-accent)]">
                  {Math.round(progress)}%
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-[var(--landing-accent)]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              {JOURNEY_STEPS.map((label, index) => {
                const isComplete = index < activeStep;
                const isCurrent = index === activeStep;
                const isVisible = index <= activeStep;

                return (
                  <motion.div
                    key={label}
                    initial={false}
                    animate={{
                      opacity: isVisible ? 1 : 0.22,
                      y: isVisible ? 0 : 6,
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-2.5 py-2',
                      isCurrent && 'bg-[var(--landing-accent)]/10 ring-1 ring-[var(--landing-accent)]/25',
                      isComplete && 'bg-white/[0.03]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2',
                        isComplete
                          ? 'border-[var(--landing-accent)] bg-[var(--landing-accent)] text-[#051824]'
                          : isCurrent
                            ? 'border-[var(--landing-accent)] bg-[var(--landing-accent)]/20 text-[var(--landing-accent)]'
                            : 'border-white/15 bg-white/[0.04] text-white/30',
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-bold tabular-nums">{index + 1}</span>
                      )}
                    </div>

                    <p
                      className={cn(
                        'min-w-0 text-left text-sm leading-snug md:text-[15px]',
                        isComplete && 'font-semibold text-white/90',
                        isCurrent && 'font-bold text-white',
                        !isComplete && !isCurrent && 'font-medium text-white/35',
                      )}
                    >
                      {label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right — compact full-bleed preview */}
          <div className="relative flex min-h-[280px] flex-col bg-[#04141c] lg:min-h-0 lg:max-h-[min(580px,74vh)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(26,175,0,0.12),transparent_60%)]"
              aria-hidden
            />

            <div className="relative flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-2.5 md:px-5">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </div>
              <div className="ml-2 flex-1 truncate rounded-md bg-white/[0.06] px-2.5 py-1 text-left text-[11px] font-medium text-white/45">
                instance.service-now.com / portal
              </div>
              {previewStage === 3 && (
                <span className="shrink-0 rounded-full bg-[var(--landing-accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#051824]">
                  Ready
                </span>
              )}
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col p-4 md:p-5">
              <div className="mb-3 flex items-end justify-between gap-2">
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--landing-accent)]">
                    ServiceNow preview
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold tracking-tight text-white md:text-xl">
                    {previewStage >= 2 ? 'Employee Onboarding Portal' : 'Building your app…'}
                  </p>
                  <p className="text-xs font-medium text-white/50">{PREVIEW_STATES[previewStage]}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-white/55">
                  {previewStage + 1}/{PREVIEW_STATES.length}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/12 bg-[#061a22]">
                <motion.div
                  initial={false}
                  animate={{ opacity: previewStage >= 0 ? 1 : 0.25 }}
                  className="flex items-center justify-between border-b border-white/10 bg-white/[0.05] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-[var(--landing-accent)]/80" />
                    <div className="h-2 w-20 rounded-full bg-white/25" />
                  </div>
                  <div className="hidden gap-1.5 sm:flex">
                    <div className="h-1.5 w-10 rounded-full bg-white/15" />
                    <div className="h-1.5 w-10 rounded-full bg-white/15" />
                  </div>
                </motion.div>

                <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3 md:p-4">
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex min-h-[4.5rem] flex-col justify-end rounded-lg border border-white/10 bg-gradient-to-br from-[var(--landing-accent)]/25 via-white/[0.06] to-transparent p-3 md:min-h-[5.25rem] md:p-4"
                  >
                    <p className="font-display text-sm font-bold text-white md:text-base">
                      {previewStage >= 2 ? 'Start your first day' : 'Portal hero'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/50 md:text-xs">
                      {previewStage >= 2
                        ? 'Laptop, accounts, and benefits in one flow.'
                        : 'Layout forming as Mitra builds…'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={false}
                    animate={{ opacity: previewStage >= 1 ? 1 : 0.2 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {['New hire tasks', 'Manager approvals'].map((title) => (
                      <div
                        key={title}
                        className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5 md:p-3"
                      >
                        <div className="mb-2 h-6 w-6 rounded-md bg-[var(--landing-accent)]/20" />
                        <p className="text-xs font-bold text-white md:text-sm">{title}</p>
                        <div className="mt-2 space-y-1.5">
                          <div className="h-1.5 w-full rounded-full bg-white/10" />
                          <div className="h-1.5 w-2/3 rounded-full bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  {previewStage >= 2 && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2.5">
                      <div className="text-left">
                        <p className="text-xs font-bold text-white md:text-sm">Employee Onboarding Portal</p>
                        <p className="text-[10px] text-white/45">HRSD · Catalog · Flow</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                        Open
                      </span>
                    </div>
                  )}
                </div>

                {previewStage >= 3 && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--landing-accent)]/30 bg-[var(--landing-accent)] px-4 py-2.5 md:py-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-[#051824]">
                      <Check className="h-4 w-4 stroke-[3]" />
                      Deployment ready
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#051824]/20 px-3 py-1 text-xs font-bold text-[#051824]">
                      Deploy
                      <Rocket className="h-3.5 w-3.5" />
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingLifecycleTimeline() {
  return <AIImplementationJourney />;
}
