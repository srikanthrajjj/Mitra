import { cn } from '@/lib/utils';
import { GLOW_BOTTOM } from './techStyles';

type Theme = 'light' | 'dark';

interface TechThemeBridgeProps {
  from: Theme;
  to: Theme;
  className?: string;
}

/**
 * Seam between two themed sections. The top matches the section above, the bottom the
 * section below, with a green glow at the join so the page reads as one continuous
 * white-to-dark journey rather than a hard cut.
 */
export function TechThemeBridge({ from, to, className }: TechThemeBridgeProps) {
  return (
    <div aria-hidden className={cn(from, 'relative h-52 bg-background md:h-80', className)}>
      {/* Deep-green belly keeps the blend from passing through flat grey */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--color-brand-green-deep)_55%,transparent)_42%,color-mix(in_srgb,var(--color-brand-green)_38%,transparent)_74%,transparent)]" />
      <div className={cn(to, 'absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-45% to-background')} />
      <div className={cn('absolute inset-0 opacity-70', GLOW_BOTTOM)} />
    </div>
  );
}
