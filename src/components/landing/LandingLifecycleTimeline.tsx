import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const STAGE_MS = 1800;

const REQUEST_TEXT = 'Create an Employee Onboarding Portal';

const JOURNEY_STEPS = [
  'Understanding your business',
  'Generating personas',
  'Creating user stories',
  'Creating ServiceNow application',
  'Building workflows',
  'Validating configuration',
  'Ready for deployment',
] as const;

const PREVIEW_STATES = [
  'Empty workspace',
  'Wireframe',
  'Application layout',
  'Service Portal',
  'Deployment ready',
] as const;

function getPreviewStage(activeStep: number) {
  if (activeStep <= 0) return 0;
  if (activeStep <= 2) return 1;
  if (activeStep <= 4) return 2;
  if (activeStep === 5) return 3;
  return 4;
}

function AnimatedCheckIcon({ active }: { active: boolean }) {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="overflow-visible"
      initial={false}
      animate={{ opacity: active ? 1 : 0.5, scale: active ? 1 : 0.96 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.path
        d="M3 7.2L5.7 10L11 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

function AnimatedStatusIcon({ active }: { active: boolean }) {
  return (
    <motion.div
      className="relative h-4 w-4 text-[#8BEA3C]"
      initial={false}
      animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 1.8, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute inset-0">
        <motion.circle
          cx="8"
          cy="8"
          r="6.25"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={false}
          animate={{ opacity: active ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          d="M4.8 8.1L7.1 10.4L11.3 6.1"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: active ? 1 : 0.2 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
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
    if (!inView || reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % JOURNEY_STEPS.length);
    }, STAGE_MS);
    return () => clearInterval(id);
  }, [inView, reduceMotion]);

  const previewStage = getPreviewStage(activeStep);
  const typingText = useMemo(() => {
    if (activeStep === 0) return `${REQUEST_TEXT.slice(0, 28)}...`;
    return REQUEST_TEXT;
  }, [activeStep]);

  return (
    <div ref={containerRef} className="mt-14">
      <div className="overflow-hidden rounded-[12px] border border-white/8 bg-white/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-b border-white/6 p-6 md:p-8 lg:border-b-0 lg:border-r lg:border-r-white/6">
            <div className="rounded-[10px] border border-white/6 bg-white/[0.02] px-4 py-3 text-left text-sm text-white/88 md:text-base">
              <span>{typingText}</span>
              <motion.span
                className="ml-1 inline-block h-[1.1em] w-px translate-y-0.5 bg-[#8BEA3C]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <div className="mt-8 space-y-2">
              {JOURNEY_STEPS.map((label, index) => {
                const isComplete = index < activeStep;
                const isCurrent = index === activeStep;
                const isVisible = index <= activeStep;

                return (
                  <motion.div
                    key={label}
                    initial={false}
                    animate={{
                      opacity: isVisible ? 1 : 0.18,
                      y: isVisible ? 0 : 8,
                      scale: isCurrent ? 1 : 0.985,
                      filter: isVisible ? 'blur(0px)' : 'blur(2px)',
                    }}
                    transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                    className="flex items-center gap-3 py-1"
                  >
                    <motion.div
                      initial={false}
                      animate={
                        isComplete
                          ? { scale: 1, opacity: 1 }
                          : isCurrent && !reduceMotion
                            ? { scale: [1, 1.06, 1], opacity: [0.75, 1, 0.75] }
                            : { scale: 1, opacity: 0.5 }
                      }
                      transition={{
                        duration: 1.8,
                        repeat: isCurrent && !reduceMotion ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                        isComplete
                          ? 'border-[#8BEA3C]/50 bg-[#8BEA3C]/14 text-[#8BEA3C]'
                          : isCurrent
                            ? 'border-[#8BEA3C]/35 bg-[#8BEA3C]/8 text-[#8BEA3C]'
                            : 'border-white/10 bg-white/[0.03] text-white/25',
                      )}
                    >
                      {isComplete ? <AnimatedCheckIcon active={isComplete} /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </motion.div>

                    <div className="min-w-0 text-left">
                      <div
                        className={cn(
                          'text-sm',
                          isComplete ? 'text-white/82' : isCurrent ? 'text-white' : 'text-white/30',
                        )}
                      >
                        {label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <motion.div
              initial={false}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
              className="rounded-[10px] border border-white/6 bg-white/[0.02] p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-sm text-white/85">ServiceNow preview</div>
                  <div className="mt-1 text-xs text-white/35">{PREVIEW_STATES[previewStage]}</div>
                </div>
                {previewStage === 4 && (
                  <motion.div
                    animate={!reduceMotion ? { opacity: [0.75, 1, 0.75] } : {}}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="rounded-full border border-[#8BEA3C]/30 bg-[#8BEA3C]/10 px-2.5 py-1 text-[11px] text-[#8BEA3C]"
                  >
                    Ready
                  </motion.div>
                )}
              </div>

              <div className="rounded-[10px] border border-white/6 bg-[#0b0d10] p-4">
                <motion.div
                  initial={false}
                  animate={{
                    opacity: previewStage >= 1 ? 1 : 0.25,
                    y: previewStage >= 1 ? 0 : 8,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                  className="h-18 rounded-[10px] border border-white/5 bg-white/[0.03]"
                />

                <motion.div
                  initial={false}
                  animate={{
                    opacity: previewStage >= 2 ? 1 : 0,
                    y: previewStage >= 2 ? 0 : 8,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                  className="mt-3 grid grid-cols-2 gap-3"
                >
                  <div className="h-12 rounded-[10px] border border-white/5 bg-white/[0.025]" />
                  <div className="h-12 rounded-[10px] border border-white/5 bg-white/[0.025]" />
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{
                    opacity: previewStage >= 3 ? 1 : 0,
                    y: previewStage >= 3 ? 0 : 8,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                  className="mt-3 rounded-[10px] border border-white/5 bg-white/[0.025] px-3 py-4"
                >
                  <div className="text-sm text-white/78">Employee Onboarding Portal</div>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{
                    opacity: previewStage >= 4 ? 1 : 0,
                    y: previewStage >= 4 ? 0 : 8,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
                  className="mt-3"
                >
                  <motion.div
                    animate={
                      previewStage >= 4 && !reduceMotion
                        ? { boxShadow: ['0 0 0 rgba(139,234,60,0)', '0 0 14px rgba(139,234,60,0.14)', '0 0 0 rgba(139,234,60,0)'] }
                        : {}
                    }
                    transition={{ duration: 2.6, repeat: previewStage >= 4 ? Infinity : 0, ease: 'easeInOut' }}
                    className="flex items-center justify-between rounded-[10px] border border-[#8BEA3C]/20 bg-[#8BEA3C]/8 px-3 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-white/88">
                      <AnimatedStatusIcon active={previewStage >= 4} />
                      Deployment ready
                    </div>
                    <div className="text-xs text-[#8BEA3C]">Deploy</div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingLifecycleTimeline() {
  return <AIImplementationJourney />;
}
