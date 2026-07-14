import { useEffect, useState } from 'react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

export type MitraThinkingContext = 'default' | 'architect' | 'businessOwner';

/** Kept for dev snippets / future status copy — not shown in the simple grid UI */
export const THINKING_STEPS: Record<MitraThinkingContext, readonly string[]> = {
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

const GRID_DOT_COUNT = 8;
const GRID_DOT_INTERVAL_MS = 260;

function useSnakeDotIndex() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let index = 0;
    let direction = 1;

    const intervalId = window.setInterval(() => {
      if (index === GRID_DOT_COUNT - 1) direction = -1;
      else if (index === 0) direction = 1;

      index += direction;
      setActiveIndex(index);
    }, GRID_DOT_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return activeIndex;
}

interface MitraThinkingIndicatorProps {
  theme: Theme;
  context?: MitraThinkingContext;
  compact?: boolean;
  className?: string;
}

export default function MitraThinkingIndicator({
  theme,
  context: _context = 'default',
  compact = false,
  className,
}: MitraThinkingIndicatorProps) {
  const isDark = isDarkTheme(theme);
  const activeIndex = useSnakeDotIndex();
  const label = compact ? 'Thinking…' : 'Thinking about your request';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 select-none font-sans',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className="grid shrink-0 grid-cols-4 gap-[3px]"
        style={{ gridTemplateRows: 'repeat(2, 5px)' }}
        aria-hidden="true"
      >
        {Array.from({ length: GRID_DOT_COUNT }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-[5px] w-[5px] rounded-full transition-all duration-200 ease-in-out',
              i === activeIndex
                ? cn(
                    'scale-[1.15] opacity-100',
                    isDark ? 'bg-brand-green shadow-[0_0_6px_rgba(79,207,54,0.45)]' : 'bg-brand-green shadow-[0_0_6px_rgba(25,175,0,0.35)]',
                  )
                : cn(
                    'scale-[0.82] opacity-[0.18]',
                    isDark ? 'bg-white' : 'bg-foreground',
                  ),
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          'text-[13px] font-normal leading-none',
          compact ? 'text-[12px]' : 'text-[13px]',
          isDark ? 'text-foreground' : 'text-foreground',
        )}
      >
        {label}
      </span>
    </div>
  );
}
