import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bot, FileText, Package, Sparkles, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MitraLogo } from '../MitraLogo';

const MITRA_SAMPLE_PROMPTS = [
  'Build an HR onboarding tracker on ServiceNow…',
  'Design a change request workflow with SLAs…',
  'Generate user stories for an ITSM portal…',
  'Create catalog items for laptop provisioning…',
  'Draft ATF tests for incident management…',
  'Map a CSM case routing flow with approvals…',
] as const;

function LandingMitraPromptFlip() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % MITRA_SAMPLE_PROMPTS.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const prompt = MITRA_SAMPLE_PROMPTS[index];

  if (reduceMotion) {
    return (
      <span className="block min-w-0 flex-1 truncate text-sm text-[#6b7280]">
        {prompt}
      </span>
    );
  }

  return (
    <span
      className="landing-mitra-prompt-flip relative block h-5 min-w-0 flex-1 overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={prompt}
          initial={{ opacity: 0, y: 12, rotateX: 72 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -12, rotateX: -72 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="landing-mitra-prompt-flip-line absolute inset-0 truncate text-sm text-[#6b7280]"
        >
          {prompt}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface LandingMitraProductFrameProps {
  className?: string;
  variant?: 'hero' | 'showcase';
}

/** ServiceNow-style bordered product frame with light Mitra UI + floating depth cards */
export function LandingMitraProductFrame({
  className,
  variant = 'hero',
}: LandingMitraProductFrameProps) {
  const tall = variant === 'hero';

  return (
    <div className={cn('landing-mitra-frame relative mx-auto w-full max-w-5xl overflow-visible', className)}>
      {/* Soft ambient glow behind frame */}
      <div
        className="pointer-events-none absolute inset-[-8%] rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(98,216,78,0.18)_0%,rgba(0,163,186,0.1)_35%,transparent_70%)] blur-2xl"
        aria-hidden
      />

      {/* Main bordered product shell */}
      <div
        className={cn(
          'landing-mitra-frame-shell relative overflow-hidden border-[3px] border-[#1a1f24] bg-[#f3f5f7]',
          tall ? 'min-h-[420px] md:min-h-[520px]' : 'min-h-[360px] md:min-h-[440px]',
        )}
      >
        {/* Top chrome */}
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-white/80 px-5 py-3.5 md:px-7">
          <div className="flex items-center gap-2.5">
            <MitraLogo className="h-5 w-auto" />
            <span className="text-[13px] font-semibold tracking-tight text-[#1d1d1d]">Mitra</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#62d84e]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1fad3a] sm:inline">
              Live
            </span>
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-black/10" />
              <span className="h-2 w-2 rounded-full bg-black/10" />
              <span className="h-2 w-2 rounded-full bg-black/10" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="relative px-5 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
          <h3 className="landing-mitra-frame-title text-center font-display text-2xl font-bold tracking-tight text-[#121417] md:text-[2rem]">
            Welcome back
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-center text-sm text-[#5b6570]">
            Your AI architect for ServiceNow — from design to deployment.
          </p>

          {/* Glowing composer */}
          <div className="relative mx-auto mt-7 max-w-xl">
            <div
              className="pointer-events-none absolute inset-[-10px] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(98,216,78,0.55),rgba(0,163,186,0.45),rgba(124,58,237,0.4),rgba(98,216,78,0.55))] opacity-70 blur-md"
              aria-hidden
            />
            <div className="relative flex items-center gap-3 rounded-full border border-black/[0.08] bg-white px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
              <Sparkles className="h-4 w-4 shrink-0 text-[#62d84e]" />
              <LandingMitraPromptFlip />
              <span className="ml-auto shrink-0 rounded-full bg-[#62d84e] px-3 py-1 text-[11px] font-semibold text-[#032d42]">
                Send
              </span>
            </div>
          </div>

          {/* Inner dashboard cards */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a93a0]">
                Build plan
              </p>
              <ul className="mt-3 space-y-2">
                {['User stories', 'Catalog item', 'Flow + SLA'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-[#374151]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#62d84e]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a93a0]">
                Artifacts
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { icon: FileText, label: 'Requirements.md' },
                  { icon: Workflow, label: 'Flow Designer' },
                  { icon: Package, label: 'Update set' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-[#374151]">
                    <Icon className="h-3.5 w-3.5 text-[#00a3ba]" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a93a0]">
                Delivery
              </p>
              <p className="mt-3 font-display text-3xl font-bold text-[#62d84e]">92%</p>
              <p className="mt-1 text-xs text-[#6b7280]">Ready for go-live review</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div className="h-full w-[92%] rounded-full bg-[#62d84e]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating depth cards — overlap frame edges like ServiceNow */}
      <div className="landing-mitra-float landing-mitra-float--tl absolute -left-2 top-16 z-20 w-[min(220px,42%)] sm:-left-6 sm:top-20 md:-left-10">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a93a0]">
            Context engine
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#062d42] text-[10px] font-bold text-white">
              HR
            </span>
            <div className="h-px w-6 bg-gradient-to-r from-[#62d84e] to-transparent" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#62d84e]/40 bg-[#62d84e]/10">
              <Bot className="h-3.5 w-3.5 text-[#1fad3a]" />
            </span>
            <div className="h-px w-6 bg-gradient-to-l from-[#00a3ba] to-transparent" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2f6] text-[9px] font-bold text-[#374151]">
              SN
            </span>
          </div>
          <p className="mt-2.5 text-[11px] leading-snug text-[#5b6570]">
            Grounded in your instance + industry patterns
          </p>
        </div>
      </div>

      <div className="landing-mitra-float landing-mitra-float--tr absolute -right-1 top-28 z-20 sm:-right-4 sm:top-32 md:-right-8">
        <div className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-2 shadow-[0_14px_32px_rgba(0,0,0,0.2)]">
          <span className="text-[11px] font-semibold text-[#1d1d1d]">AI Monitoring</span>
          <span className="flex -space-x-1.5">
            <span className="h-5 w-5 rounded-full bg-[#62d84e]" />
            <span className="h-5 w-5 rounded-full bg-[#00a3ba]" />
            <span className="h-5 w-5 rounded-full bg-[#7c3aed]" />
          </span>
        </div>
      </div>

      <div className="landing-mitra-float landing-mitra-float--br absolute -bottom-4 -right-1 z-20 w-[min(240px,48%)] sm:-bottom-6 sm:-right-4 md:-right-8">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#032d42] text-[#62d84e]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-[#1d1d1d]">Mitra Specialist</p>
                <span className="rounded-full bg-[#62d84e]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1fad3a]">
                  Added
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-[#5b6570]">
                Routes stories → flows → ATF with human-in-control checkpoints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
