import { useEffect, type RefObject } from 'react';
import Lenis from 'lenis';

/** Height of the sticky header (nav bar plus announcement bar). Anchor jumps stop just below it. */
const HEADER = 105;

/**
 * Inertial smooth scrolling for the v2 page, plus smooth in-page anchor jumps. Native scroll
 * position is still what moves, so position-based effects (useScroll, sticky) keep working.
 * Skipped entirely for visitors who prefer reduced motion.
 */
export function useSmoothScrollV2(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -HEADER, duration: 1.5 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}

/**
 * Eases any `[data-reveal]` element into place the first time it scrolls into view. The hidden
 * state and transition live in the root's class list, so elements only need the attribute
 * (and optionally a transition-delay for staggering). Everything shows immediately when the
 * visitor prefers reduced motion.
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const item of items) item.setAttribute('data-in', '');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );
    for (const item of items) io.observe(item);
    return () => io.disconnect();
  }, [root]);
}
