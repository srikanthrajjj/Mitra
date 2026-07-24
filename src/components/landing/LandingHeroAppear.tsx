import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';

const APPEAR_SELECTOR = '[data-landing-hero-appear]';
const APPEAR_Y = 20;
const APPEAR_DURATION = 0.62;
const APPEAR_STAGGER = 0.12;
const APPEAR_EASE = 'power2.out';
const VISUAL_EASE = 'power3.out';
const VISUAL_SCALE = 0.985;

/**
 * Mount-time entrance for the V1 hero (not ScrollTrigger).
 * Targets `[data-landing-hero-appear]` in document order:
 * title → subtitle → visual → cta.
 */
export function useLandingHeroAppear(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    if (!enabled) return;

    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const beats = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(APPEAR_SELECTOR),
    );
    if (beats.length === 0) return;

    if (prefersReduced) {
      gsap.set(beats, { clearProps: 'opacity,visibility,transform' });
      return;
    }

    const ctx = gsap.context(() => {
      // Hide first, then tween in — avoids flash + gsap.from traps
      beats.forEach((el) => {
        const isVisual = el.getAttribute('data-landing-hero-appear') === 'visual';
        gsap.set(el, {
          opacity: 0,
          y: APPEAR_Y,
          ...(isVisual ? { scale: VISUAL_SCALE, transformOrigin: '50% 50%' } : {}),
        });
      });

      const tl = gsap.timeline({
        defaults: {
          duration: APPEAR_DURATION,
          ease: APPEAR_EASE,
          overwrite: 'auto',
        },
      });

      beats.forEach((el, i) => {
        const isVisual = el.getAttribute('data-landing-hero-appear') === 'visual';
        tl.to(
          el,
          {
            opacity: 1,
            y: 0,
            ...(isVisual
              ? { scale: 1, duration: 0.72, ease: VISUAL_EASE }
              : {}),
          },
          // First beat after a short settle; later beats overlap from prior start
          i === 0 ? 0.06 : `<${APPEAR_STAGGER}`,
        );
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [enabled, rootRef]);
}
