import type { MouseEvent, TouchEvent } from 'react';
import { cn } from '@/lib/utils';
import type { PanelResizeEdge } from '../hooks/useResizablePanel';

interface PanelResizeHandleProps {
  edge: PanelResizeEdge;
  isResizing?: boolean;
  onResizeStart: (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => void;
  ariaLabel: string;
  valueNow?: number;
  valueMin?: number;
  valueMax?: number;
  className?: string;
}

export function PanelResizeHandle({
  edge,
  isResizing = false,
  onResizeStart,
  ariaLabel,
  valueNow,
  valueMin,
  valueMax,
  className,
}: PanelResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuenow={valueNow}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      onMouseDown={onResizeStart}
      onTouchStart={onResizeStart}
      className={cn(
        'absolute top-0 z-30 h-full w-1.5 cursor-col-resize touch-none',
        'group/handle flex items-center justify-center',
        edge === 'right'
          ? 'right-0 translate-x-1/2'
          : 'left-0 -translate-x-1/2',
        className,
      )}
    >
      <div
        className={cn(
          'h-full w-px transition-colors',
          isResizing
            ? 'bg-primary'
            : 'bg-transparent group-hover/handle:bg-border group-active/handle:bg-primary/70',
        )}
      />
    </div>
  );
}
