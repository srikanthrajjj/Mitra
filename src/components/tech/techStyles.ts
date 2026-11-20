/**
 * Flat background shade: the page background with a touch of brand green mixed in.
 * Use a small percent for dark sections and a larger one for light sections; the
 * `.dark` / `.light` class on the element decides which background it mixes with.
 */
export const tint = (percent: number) =>
  `color-mix(in srgb, var(--color-brand-green) ${percent}%, hsl(var(--background)))`;

/**
 * Subtle iOS-style glass: a translucent, blurred surface with a hairline border, a faint
 * top highlight and a soft shadow. Only theme tokens; the blur needs something behind it,
 * which the section ambience blobs provide.
 */
export const GLASS =
  'border border-foreground/10 bg-card/55 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.08),0_12px_40px_-20px_rgba(0,0,0,0.45)]';

/** Lighter glass for small chrome such as pills, chips and the nav. */
export const GLASS_CHROME =
  'border border-foreground/10 bg-background/40 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.08),0_8px_28px_-12px_rgba(0,0,0,0.5)]';

/** Soft ambient light behind glass, so the blur has something to refract. */
export const BLOB = 'pointer-events-none absolute rounded-full bg-brand-green/25 blur-3xl';
