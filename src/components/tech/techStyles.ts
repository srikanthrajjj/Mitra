/** Dotted grid texture tinted with the current foreground. Flat, no gradients. */
export const DOT_GRID =
  '[background-image:radial-gradient(hsl(var(--foreground)/0.10)_1px,transparent_1px)] [background-size:22px_22px]';

/**
 * Flat background shade: the page background with a touch of brand green mixed in.
 * Use a small percent for dark sections and a larger one for light sections; the
 * `.dark` / `.light` class on the element decides which background it mixes with.
 */
export const tint = (percent: number) =>
  `color-mix(in srgb, var(--color-brand-green) ${percent}%, hsl(var(--background)))`;
