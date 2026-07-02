import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function EcosystemCore() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="eco-core z-50"
      animate={
        reduceMotion
          ? undefined
          : {
              scale: [1, 1.02, 1],
              y: [0, -3, 0],
            }
      }
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden
    >
      <div className="eco-core-shell">
        <div className="eco-core-glass">
          <div className="eco-core-inner-glow" />
          <div className="eco-core-highlight" />
          <div className="eco-core-mark" aria-hidden>
            <Sparkles className="eco-core-mark-icon" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
