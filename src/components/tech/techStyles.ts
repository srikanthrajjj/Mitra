/**
 * Flat background shade: the page background with a touch of brand green mixed in.
 * Use a small percent for dark sections and a larger one for light sections; the
 * `.dark` / `.light` class on the element decides which background it mixes with.
 */
export const tint = (percent: number) =>
  `color-mix(in srgb, var(--color-brand-green) ${percent}%, hsl(var(--background)))`;

/**
 * Apple-style glass, with no drop shadows. Depth comes from the material itself: a lighter
 * translucent fill, heavy backdrop blur with boosted saturation and brightness (vibrancy),
 * and a thin luminous edge (a 1px inset highlight along the top, a faint hairline border).
 * Dark sections use the foreground token as the tint, light sections use the card (white)
 * token. The blur needs colour behind it, which the section ambience blobs provide.
 */
export const GLASS_DARK =
  'border border-foreground/[0.13] bg-foreground/[0.06] backdrop-blur-[30px] backdrop-saturate-[1.8] backdrop-brightness-[1.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]';

export const GLASS_LIGHT =
  'border border-card/80 bg-card/50 backdrop-blur-[30px] backdrop-saturate-[1.8] backdrop-brightness-[1.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]';

/** Soft ambient light behind glass, so the blur has something to refract. */
export const BLOB = 'pointer-events-none absolute rounded-full bg-brand-green/25 blur-3xl';
