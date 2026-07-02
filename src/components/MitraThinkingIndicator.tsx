import { useEffect, useState } from 'react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

export type MitraThinkingContext = 'default' | 'architect' | 'businessOwner';

const THINKING_STEPS: Record<MitraThinkingContext, readonly string[]> = {
  default: [
    'Reviewing requirements',
    'Analyzing dependencies',
    'Structuring parameters',
    'Validating SLA rules',
    'Compiling blueprint',
  ],
  architect: [
    'Parsing functional rules',
    'Checking API schemas',
    'Mapping scope tables',
    'Checking best practices',
    'Assembling blueprint',
  ],
  businessOwner: [
    'Ingesting requirements',
    'Structuring user stories',
    'Defining criteria',
    'Verifying outcomes',
    'Compiling backlog',
  ],
};

interface MitraThinkingIndicatorProps {
  theme: Theme;
  context?: MitraThinkingContext;
  compact?: boolean;
  className?: string;
}

export default function MitraThinkingIndicator({
  theme,
  context = 'default',
  compact = false,
  className,
}: MitraThinkingIndicatorProps) {
  const isDark = isDarkTheme(theme);
  const steps = THINKING_STEPS[context];
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFading(false);
  }, [context]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((current) => (current < steps.length - 1 ? current + 1 : current));
        setFading(false);
      }, 220);
    }, 1600);

    return () => window.clearInterval(intervalId);
  }, [steps.length]);

  const currentPhrase = steps[index];
  const progressPercent = Math.min(100, Math.round(((index + 1) / steps.length) * 100));

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border font-sans select-none backdrop-blur-md transition-all duration-300 w-full',
        isDark 
          ? 'bg-slate-950/40 border-emerald-500/10 text-slate-400 shadow-[0_0_20px_rgba(16,185,129,0.03)]' 
          : 'bg-emerald-50/20 border-emerald-200/40 text-slate-500 shadow-[0_0_15px_rgba(16,185,129,0.01)]',
        compact ? 'p-2 max-w-[190px]' : 'p-2.5 max-w-[240px]',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="space-y-2">
        {/* Row with pulsing indicator and small step text */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500/90" />
          </span>
          <p
            className={cn(
              'text-[10px] font-mono leading-none truncate transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              fading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0',
            )}
          >
            {currentPhrase}...
          </p>
        </div>

        {/* Small subtle progress bar */}
        <div className="relative w-full h-0.5 rounded-full bg-emerald-500/10 overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-emerald-500/90 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
