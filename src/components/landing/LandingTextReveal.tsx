import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const LINE_Y = 36;
const LINE_DURATION = 0.72;
const LINE_EASE = 'power2.out';
const LINE_SELECTOR = '[data-landing-text-line]';

interface LandingTextRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before first child animates */
  delay?: number;
  /** Stagger between direct children (title → body) */
  stagger?: number;
}

/** Nearest ancestor that actually scrolls, else the viewport. */
function resolveScroller(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.documentElement) {
    const { overflowY, overflow } = getComputedStyle(node);
    const canY =
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay' ||
      overflow === 'auto' ||
      overflow === 'scroll';
    if (canY && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

/**
 * Viewport-triggered fade-up for section copy (GSAP + ScrollTrigger).
 * Wrap each line/block in LandingTextLine — do not nest inside LandingScrollReveal.
 */
export function LandingTextReveal({
  children,
  className,
  delay = 0.02,
  stagger = 0.12,
}: LandingTextRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const lines = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(LINE_SELECTOR),
    );
    if (lines.length === 0) return;

    if (prefersReduced) {
      gsap.set(lines, { clearProps: 'opacity,visibility,transform' });
      return;
    }

    const scroller = resolveScroller(root);
    const stScroller = scroller === window ? undefined : scroller;

    const ctx = gsap.context(() => {
      // Hide first, then tween in — avoids gsap.from + ScrollTrigger immediateRender traps
      gsap.set(lines, { opacity: 0, y: LINE_Y });

      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: LINE_DURATION,
        ease: LINE_EASE,
        delay,
        stagger,
        overwrite: 'auto',
        scrollTrigger: {
          trigger: root,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
          ...(stScroller ? { scroller: stScroller } : {}),
        },
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(() => {
      refresh();
      // Second pass after layout/fonts settle (hero images, fixed bg, etc.)
      requestAnimationFrame(refresh);
    });
    window.addEventListener('load', refresh);
    const fontsReady = document.fonts?.ready?.then(refresh);

    // Failsafe: never leave mid-page copy stuck at opacity 0 if ST mis-measured
    const failsafe = window.setTimeout(() => {
      const rect = root.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (!inView) return;
      lines.forEach((line) => {
        if (getComputedStyle(line).opacity === '0') {
          gsap.to(line, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: LINE_EASE,
            overwrite: 'auto',
          });
        }
      });
    }, 1800);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', refresh);
      window.clearTimeout(failsafe);
      void fontsReady;
      ctx.revert();
    };
  }, [delay, stagger]);

  return (
    <div ref={rootRef} className={cn(className)}>
      {children}
    </div>
  );
}

interface LandingTextLineProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'p' | 'h2' | 'h3' | 'span';
}

export function LandingTextLine({
  children,
  className,
  as: Tag = 'div',
}: LandingTextLineProps) {
  return (
    <Tag className={className} data-landing-text-line="">
      {children}
    </Tag>
  );
}
