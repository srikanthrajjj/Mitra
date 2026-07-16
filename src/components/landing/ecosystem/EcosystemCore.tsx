import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

function SparkLine({ side, delay }: { side: 'left' | 'right'; delay: number }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <motion.div
      className="absolute top-1/2 z-40"
      style={{
        [side === 'left' ? 'left' : 'right']: '-40%',
        width: '40%',
        height: '2px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.1 }}
    >
      <motion.div
        className="absolute top-0 h-full rounded-full"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          delay,
          duration: 0.8,
          ease: 'easeInOut',
        }}
        style={{
          transformOrigin: side === 'left' ? 'right' : 'left',
          background: side === 'left'
            ? 'linear-gradient(to right, transparent, #8BEA3C)'
            : 'linear-gradient(to left, transparent, #8BEA3C)',
          [side === 'left' ? 'left' : 'right']: 0,
          width: '100%',
          boxShadow: '0 0 12px #8BEA3C, 0 0 24px rgba(139, 234, 60, 0.5)',
        }}
      />
    </motion.div>
  );
}

function SparkDot({ side, delay }: { side: 'left' | 'right'; delay: number }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <motion.div
      className="absolute top-1/2 z-40 -translate-y-1/2"
      style={{
        [side === 'left' ? 'left' : 'right']: '-2%',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.1 }}
    >
      <motion.div
        className="h-2 w-2 rounded-full bg-[#8BEA3C]"
        initial={{ x: 0, opacity: 0 }}
        animate={{
          x: side === 'left' ? [0, 100, 0] : [0, -100, 0],
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0],
        }}
        transition={{
          delay,
          duration: 1,
          ease: 'easeInOut',
        }}
        style={{
          boxShadow: '0 0 8px #8BEA3C, 0 0 16px rgba(139, 234, 60, 0.6)',
        }}
      />
    </motion.div>
  );
}

export function EcosystemCore() {
  const reduceMotion = useReducedMotion();
  const [sparkKey, setSparkKey] = useState(0);
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkKey((k) => k + 1);
      setIsLit(false);

      const lightTimer = setTimeout(() => {
        setIsLit(true);
        const resetTimer = setTimeout(() => setIsLit(false), 2000);
        return () => clearTimeout(resetTimer);
      }, 1200);

      return () => clearTimeout(lightTimer);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      <SparkLine key={`line-left-${sparkKey}`} side="left" delay={0.2} />
      <SparkLine key={`line-right-${sparkKey}`} side="right" delay={0.3} />
      <SparkDot key={`dot-left-${sparkKey}`} side="left" delay={0.1} />
      <SparkDot key={`dot-right-${sparkKey}`} side="right" delay={0.2} />

      <div className="eco-core-shell">
        <div className="eco-core-glass">
          <div
            className="eco-core-inner-glow transition-all duration-700"
            style={{
              background: isLit
                ? 'radial-gradient(circle at 50% 45%, rgba(139, 234, 60, 0.5) 0%, rgba(139, 234, 60, 0.2) 42%, transparent 72%)'
                : undefined,
              boxShadow: isLit ? '0 0 60px rgba(139, 234, 60, 0.4)' : undefined,
            }}
          />
          <div className="eco-core-highlight" />
          <motion.div
            className="eco-core-mark"
            animate={isLit ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="eco-core-text font-display text-[0.65rem] font-bold tracking-wider text-[#8BEA3C]">
              ILLUMINATE
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
