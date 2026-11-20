import { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from 'motion/react';

/** How strongly each section washes the page with brand green (percent). Hero stays untinted. */
const SECTION_WASH: Record<string, number> = {
  hero: 0,
  demo: 9,
  statement: 4,
  product: 7,
  capabilities: 5,
  usecases: 8,
  outcomes: 7,
  trust: 10,
  start: 8,
};

const SECTION_IDS = Object.keys(SECTION_WASH);

/**
 * Scroll-driven theme: a fixed, click-through wash of brand green that eases to a new strength
 * as each section crosses the middle of the screen, plus a soft light that travels down the
 * page with the scroll position. It sits above the content as a transparent layer, so cards,
 * grids and text all pick up the shift together and nothing has to know about it.
 */
export function ScrollTheme() {
  const [wash, setWash] = useState(0);

  useEffect(() => {
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const active = SECTION_IDS.filter((id) => seen.get(id)).pop();
        if (active !== undefined) setWash(SECTION_WASH[active]);
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 24, restDelta: 0.001 });
  const lightY = useTransform(smooth, [0, 1], [18, 82]);
  const lightX = useTransform(smooth, [0, 0.5, 1], [28, 72, 38]);
  const light = useMotionTemplate`radial-gradient(ellipse 70% 55% at ${lightX}% ${lightY}%, color-mix(in srgb, var(--color-brand-green) 13%, transparent), transparent 70%)`;

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden>
      <div
        className="absolute inset-0 transition-[background-color] duration-[1400ms] ease-out"
        style={{ backgroundColor: `color-mix(in srgb, var(--color-brand-green) ${wash}%, transparent)` }}
      />
      <motion.div className="absolute inset-0" style={{ backgroundImage: light }} />
    </div>
  );
}
