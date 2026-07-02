import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EcosystemModuleConfig } from './ecosystemLayout';

interface EcosystemModuleChipProps {
  module: EcosystemModuleConfig;
  isActive: boolean;
  isDimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function EcosystemModuleChip({
  module,
  isActive,
  isDimmed,
  onHoverStart,
  onHoverEnd,
  onFocus,
  onBlur,
}: EcosystemModuleChipProps) {
  const reduceMotion = useReducedMotion();
  const Icon = module.icon;

  return (
    <motion.div
      className={cn('transition-opacity duration-700 ease-out', isDimmed && 'opacity-[0.35]')}
      animate={
        reduceMotion || isActive
          ? undefined
          : { y: [0, -2, 0, 1.5, 0] }
      }
      transition={{
        duration: 5 + (module.scale % 1) * 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.button
        type="button"
        className="eco-chip group relative border-0 bg-transparent p-0 outline-none"
        animate={{ scale: isActive ? module.scale * 1.14 : module.scale }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={module.name}
      >
        <div
          className={cn(
            'eco-chip-glass flex items-center gap-2 px-3 py-2 transition-shadow duration-500 md:gap-2.5 md:px-3.5 md:py-2.5',
            isActive && 'eco-chip-glass--active',
          )}
        >
          <span
            className={cn(
              'eco-chip-icon flex h-6 w-6 shrink-0 items-center justify-center rounded-full md:h-7 md:w-7',
              isActive && 'eco-chip-icon--active',
            )}
          >
            <Icon className="h-3 w-3 md:h-3.5 md:w-3.5" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="whitespace-nowrap text-[10px] font-medium tracking-wide text-white/70 md:text-[11px]">
            {module.name}
          </span>
        </div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              role="tooltip"
              className="eco-tooltip absolute bottom-[calc(100%+14px)] left-1/2 z-50 w-[11.5rem] -translate-x-1/2 px-4 py-3.5 text-left"
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <ul className="space-y-1.5">
                {module.capabilities.map((cap) => (
                  <li key={cap} className="text-[11px] leading-snug text-white/60">
                    {cap}
                  </li>
                ))}
              </ul>
              <a
                href="#platform"
                className="eco-tooltip-link mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#8BEA3C]/90 transition-colors hover:text-[#8BEA3C]"
                onClick={(e) => e.stopPropagation()}
              >
                Learn More
                <ArrowRight className="h-3 w-3" aria-hidden />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
