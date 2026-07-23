import { Cloud, Cpu, Hand, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MitraLogo } from '../MitraLogo';

const STEPS = [
  { label: 'Business Intent', icon: Lightbulb },
  { label: 'Mitra AI Development', icon: Cpu },
  { label: 'Human-in-Control', icon: Hand },
  { label: 'Deployed Enterprise Solutions', icon: Cloud },
] as const;

/** Hero right panel — “From Intent to Deployment” workflow graphic (IlluminAIte reference). */
export function LandingIntentToDeploy({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'landing-v3-intent-panel relative overflow-hidden rounded-2xl border border-white/[0.08] md:rounded-[1.35rem]',
        className,
      )}
    >
      {/* Soft panel glow only — never on text */}
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(41,255,29,0.18),transparent_70%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-64 rounded-full bg-[radial-gradient(circle,rgba(0,242,254,0.12),transparent_70%)] blur-2xl"
        aria-hidden
      />
      <div className="landing-v3-intent-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="relative z-10 flex h-full min-h-[320px] flex-col px-5 py-6 sm:min-h-[380px] sm:px-7 sm:py-8 md:min-h-[420px]">
        <h3 className="text-center font-display text-lg font-semibold tracking-tight text-white sm:text-xl md:text-[1.35rem]">
          From Intent to Deployment
        </h3>

        <div className="relative mt-8 flex flex-1 flex-col justify-center sm:mt-10">
          {/* Connecting wave */}
          <svg
            className="pointer-events-none absolute left-[6%] right-[6%] top-[38%] hidden h-16 w-[88%] sm:block"
            viewBox="0 0 400 64"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 40 C 70 8, 130 56, 200 32 S 330 8, 392 36"
              stroke="url(#intent-wave)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="landing-v3-intent-wave"
            />
            <defs>
              <linearGradient id="intent-wave" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#29FF1D" stopOpacity="0.35" />
                <stop offset="0.45" stopColor="#00F2FE" stopOpacity="0.95" />
                <stop offset="1" stopColor="#29FF1D" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
            {STEPS.map(({ label, icon: Icon }, i) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    'landing-v3-intent-card relative flex h-14 w-14 items-center justify-center rounded-xl border sm:h-16 sm:w-16',
                    i === 1 || i === 3 ? 'landing-v3-intent-card--hot' : '',
                  )}
                >
                  <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.5} />
                </div>
                <p className="mt-3 max-w-[7.5rem] text-[11px] font-medium leading-snug text-white/90 sm:text-xs">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <MitraLogo className="h-4 w-auto opacity-90" />
          <span className="text-[11px] font-semibold tracking-wide text-white/70">Mitra AI</span>
        </div>
      </div>
    </div>
  );
}
