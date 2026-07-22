import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ConversationIndicatorStatus,
  conversationStatusLabel,
} from '../utils/conversationStatus';

interface ConversationStatusDotProps {
  status: ConversationIndicatorStatus;
  className?: string;
}

const GRID_DOT_COUNT = 8;
const GRID_DOT_INTERVAL_MS = 260;

/** Fixed slot so titles stay aligned whether idle or animating. */
const STATUS_SLOT = 'inline-flex h-[12px] w-[22px] shrink-0 items-center justify-center';

function useSnakeDotIndex(enabled: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let index = 0;
    let direction = 1;

    const intervalId = window.setInterval(() => {
      if (index === GRID_DOT_COUNT - 1) direction = -1;
      else if (index === 0) direction = 1;

      index += direction;
      setActiveIndex(index);
    }, GRID_DOT_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enabled]);

  return activeIndex;
}

function GridDotsAnimation({ className }: { className?: string }) {
  const activeIndex = useSnakeDotIndex(true);

  return (
    <span
      className={cn('grid grid-cols-4 gap-[2px]', className)}
      style={{ gridTemplateRows: 'repeat(2, 3.5px)' }}
      aria-hidden
    >
      {Array.from({ length: GRID_DOT_COUNT }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-[3.5px] w-[3.5px] rounded-full transition-all duration-200 ease-in-out',
            i === activeIndex
              ? 'scale-[1.15] bg-brand-green opacity-100'
              : 'scale-[0.82] bg-brand-green opacity-[0.18]',
          )}
        />
      ))}
    </span>
  );
}

export function ConversationStatusDot({ status, className }: ConversationStatusDotProps) {
  const label = conversationStatusLabel[status];

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className={cn(STATUS_SLOT, className)}
    >
      {status === 'active' ? (
        <GridDotsAnimation />
      ) : (
        <span
          className={cn(
            'inline-block h-[5px] w-[5px] rounded-full',
            status === 'failed' && 'bg-destructive',
            status === 'awaiting' && 'bg-amber-400',
            status === 'idle' && 'bg-muted-foreground/40',
          )}
        />
      )}
    </span>
  );
}
