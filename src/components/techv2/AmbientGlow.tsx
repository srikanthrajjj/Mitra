import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const GRID = 'color-mix(in srgb, var(--color-foreground) 6%, transparent)';

/**
 * Slow, quiet green light for a section background: a breathing core, two drifting lights and a
 * faint grid that fades out toward the edges. Spans the full viewport width behind its section.
 * Place it as the first child of a `relative` section; content above it needs `relative`.
 */
export function AmbientGlow({ intensity = 1, className }: { intensity?: number; className?: string }) {
  const reduce = useReducedMotion();
  const drift = (x: number, y: number, d: number) =>
    reduce
      ? {}
      : { animate: { x: [0, x, 0], y: [0, y, 0] }, transition: { duration: d, repeat: Infinity, ease: 'easeInOut' as const } };

  return (
    <div
      className={cn('pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden', className)}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${GRID} 1px, transparent 1px), linear-gradient(to bottom, ${GRID} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 55% 60% at 50% 50%, black, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 55% 60% at 50% 50%, black, transparent 78%)',
          opacity: Math.min(intensity, 1),
        }}
      />
      {/* breathing core */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green blur-[130px]"
        initial={{ opacity: 0.16 * intensity }}
        animate={reduce ? undefined : { opacity: [0.12 * intensity, 0.3 * intensity, 0.12 * intensity], scale: [1, 1.18, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* drifting lights */}
      <motion.div
        className="absolute left-[14%] top-[16%] h-[20rem] w-[20rem] rounded-full bg-brand-green blur-[110px]"
        style={{ opacity: 0.14 * intensity }}
        {...drift(80, 50, 15)}
      />
      <motion.div
        className="absolute bottom-[12%] right-[14%] h-[22rem] w-[22rem] rounded-full bg-brand-green blur-[120px]"
        style={{ opacity: 0.12 * intensity }}
        {...drift(-70, -40, 19)}
      />
    </div>
  );
}
