/**
 * Shared green-gradient recipes. All colours come from theme tokens
 * (`--color-brand-green*`), never raw hex. Sections set an explicit `light` or `dark`
 * class, so accent shades are chosen per section instead of with `dark:` variants.
 */

/** Soft green glow rising from the bottom edge. */
export const GLOW_BOTTOM =
  'bg-[radial-gradient(ellipse_75%_65%_at_50%_100%,color-mix(in_srgb,var(--color-brand-green)_38%,transparent),transparent)]';

/** Soft green glow falling from the top edge. */
export const GLOW_TOP =
  'bg-[radial-gradient(ellipse_75%_60%_at_50%_0%,color-mix(in_srgb,var(--color-brand-green)_26%,transparent),transparent)]';

/** Round blurred orb used for parallax blobs. */
export const ORB =
  'bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-green)_34%,transparent),transparent_68%)]';

/** Gradient headline text on dark surfaces. */
export const GRADIENT_TEXT_ON_DARK =
  'bg-gradient-to-r from-brand-green via-brand-green-hover to-brand-green bg-clip-text text-transparent';

/** Gradient headline text on light surfaces (deeper greens keep contrast). */
export const GRADIENT_TEXT_ON_LIGHT =
  'bg-gradient-to-r from-brand-green-deep via-brand-green to-brand-green-deep bg-clip-text text-transparent';

/** Dotted grid texture tinted with the current foreground. */
export const DOT_GRID =
  '[background-image:radial-gradient(hsl(var(--foreground)/0.09)_1px,transparent_1px)] [background-size:22px_22px]';
