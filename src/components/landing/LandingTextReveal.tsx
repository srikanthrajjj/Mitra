import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

interface LandingTextRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before first child animates */
  delay?: number;
  /** Stagger between direct children */
  stagger?: number;
}

/** Subtle fade + rise for text blocks as they enter the viewport */
export function LandingTextReveal({
  children,
  className,
  delay = 0,
  stagger = 0.08,
}: LandingTextRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35, margin: '0px 0px -6% 0px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
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
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[Tag];

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: EASE },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
