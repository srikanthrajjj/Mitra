import { cn } from '@/lib/utils';
import type { LandingDesign } from './LandingDesignContext';

interface LandingDesignSwitcherProps {
  landingDesign: LandingDesign;
  setLandingDesign: (v: LandingDesign) => void;
  /** `nav` = compact pill in primary nav; `fixed` = bottom-left fallback */
  variant?: 'nav' | 'fixed';
  className?: string;
}

const DESIGNS: LandingDesign[] = ['v1', 'v2', 'v3'];

/** Compact V1 | V2 | V3 landing design toggle. Persists via parent → localStorage. */
export function LandingDesignSwitcher({
  landingDesign,
  setLandingDesign,
  variant = 'nav',
  className,
}: LandingDesignSwitcherProps) {
  const pill = (
    <div
      className={cn(
        'flex items-center rounded-full border border-white/15 bg-white/[0.06] p-0.5',
        variant === 'fixed' && 'border-white/20 bg-black/70 shadow-lg backdrop-blur-md',
        className,
      )}
      role="group"
      aria-label="Landing design version"
    >
      {DESIGNS.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setLandingDesign(v)}
          className={cn(
            'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all',
            landingDesign === v
              ? 'bg-[var(--landing-accent,#62d84e)] text-[var(--landing-accent-deep,#032d42)]'
              : 'text-white/50 hover:text-white/85',
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );

  if (variant === 'fixed') {
    return (
      <div className="pointer-events-none fixed bottom-4 left-4 z-[120]">
        <div className="pointer-events-auto">{pill}</div>
      </div>
    );
  }

  return pill;
}
