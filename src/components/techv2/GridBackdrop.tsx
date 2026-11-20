import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const CELL = 64;
const GRID_LINE = 'hsl(var(--border) / 0.7)';
const GRID_LIT = 'color-mix(in srgb, var(--color-brand-green) 55%, transparent)';

const gridImage = (color: string) =>
  `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`;

/**
 * Hero grid: hairline cells, a few cells that light up and fade at random, and a green
 * copy of the grid revealed only under the cursor (set --mx / --my on this element's parent).
 */
export function GridBackdrop({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const lit = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        col: Math.floor(Math.random() * 22),
        row: Math.floor(Math.random() * 8),
        delay: (i * 0.55) % 6,
        duration: 3 + Math.random() * 2.5,
      })),
    [],
  );

  return (
    <div
      className={className}
      aria-hidden
      style={{
        maskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: gridImage(GRID_LINE), backgroundSize: `${CELL}px ${CELL}px` }}
      />
      {!reduce &&
        lit.map((c, i) => (
          <motion.div
            key={i}
            className="absolute bg-brand-green"
            style={{ left: c.col * CELL + 1, top: c.row * CELL + 1, width: CELL - 1, height: CELL - 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.16, 0] }}
            transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: gridImage(GRID_LIT),
          backgroundSize: `${CELL}px ${CELL}px`,
          maskImage: 'radial-gradient(260px circle at var(--mx, -400px) var(--my, -400px), black, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(260px circle at var(--mx, -400px) var(--my, -400px), black, transparent 75%)',
        }}
      />
    </div>
  );
}
