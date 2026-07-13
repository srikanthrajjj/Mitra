import { useEffect, useState } from 'react';
import { CircleArrowRight, CircleDashed, CheckCircle2, ListTodo } from 'lucide-react';
import type { MitraTodoItem, MitraTodoStatus } from '../types';
import { cn } from '@/lib/utils';

export type { MitraTodoItem, MitraTodoStatus };

interface MitraTodosProps {
  items: MitraTodoItem[];
  summary?: string;
  /** When true, advances active → complete and pending → active on an interval. */
  animate?: boolean;
  stepMs?: number;
  isDark?: boolean;
  className?: string;
}

const LIGHT_TODO_COLORS = {
  summary: 'rgba(71, 85, 105, 0.95)',
  title: 'rgba(15, 23, 42, 0.88)',
  count: 'rgba(100, 116, 139, 0.9)',
  itemDefault: 'rgba(100, 116, 139, 0.95)',
  itemActive: 'rgba(15, 23, 42, 0.92)',
  itemComplete: 'rgba(100, 116, 139, 0.7)',
  textDecoration: 'rgba(100, 116, 139, 0.4)',
} as const;

function TodoStatusIcon({ status, isDark }: { status: MitraTodoStatus; isDark: boolean }) {
  if (status === 'complete') {
    return (
      <CheckCircle2
        className={cn('h-4 w-4 shrink-0', isDark ? 'text-emerald-400/80' : 'text-emerald-600')}
        strokeWidth={1.75}
        aria-hidden="true"
      />
    );
  }
  if (status === 'active') {
    return (
      <CircleArrowRight
        className={cn('h-4 w-4 shrink-0', 'text-foreground')}
        strokeWidth={1.75}
        aria-hidden="true"
      />
    );
  }
  return (
    <CircleDashed
      className={cn('h-4 w-4 shrink-0', 'text-muted-foreground')}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}

function todoItemColor(status: MitraTodoStatus, isDark: boolean): string | undefined {
  if (isDark) return undefined;
  if (status === 'active') return LIGHT_TODO_COLORS.itemActive;
  if (status === 'complete') return LIGHT_TODO_COLORS.itemComplete;
  return LIGHT_TODO_COLORS.itemDefault;
}

export function MitraTodos({
  items,
  summary,
  animate = false,
  stepMs = 900,
  isDark = true,
  className,
}: MitraTodosProps) {
  const [displayItems, setDisplayItems] = useState(items);

  useEffect(() => {
    setDisplayItems(items);
  }, [items]);

  useEffect(() => {
    if (!animate) return;

    const activeIndex = displayItems.findIndex((item) => item.status === 'active');
    if (activeIndex === -1) return;

    const timer = window.setTimeout(() => {
      setDisplayItems((prev) => {
        const idx = prev.findIndex((item) => item.status === 'active');
        if (idx === -1) return prev;

        return prev.map((item, i) => {
          if (i < idx) return { ...item, status: 'complete' as const };
          if (i === idx) return { ...item, status: 'complete' as const };
          if (i === idx + 1) return { ...item, status: 'active' as const };
          return item;
        });
      });
    }, stepMs);

    return () => window.clearTimeout(timer);
  }, [animate, displayItems, stepMs]);

  const pendingCount = displayItems.filter((item) => item.status !== 'complete').length;

  return (
    <div
      className={cn('mitra-todos', !isDark && 'mitra-todos--light', className)}
      role="list"
      aria-label="To-dos"
    >
      {summary && (
        <p
          className="mitra-todos__summary"
          style={isDark ? undefined : { color: LIGHT_TODO_COLORS.summary }}
        >
          {summary}
        </p>
      )}
      <div
        className="mitra-todos__header"
        style={isDark ? undefined : { borderBottomColor: 'rgba(15, 23, 42, 0.08)' }}
      >
        <ListTodo
          className={cn('h-4 w-4 shrink-0', 'text-muted-foreground')}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span
          className="mitra-todos__title"
          style={isDark ? undefined : { color: LIGHT_TODO_COLORS.title }}
        >
          To-dos
        </span>
        <span
          className="mitra-todos__count"
          style={isDark ? undefined : { color: LIGHT_TODO_COLORS.count }}
        >
          {pendingCount}
        </span>
      </div>
      <ul className="mitra-todos__list">
        {displayItems.map((item) => (
          <li
            key={item.id}
            className={cn(
              'mitra-todos__item',
              item.status === 'active' && 'mitra-todos__item--active',
              item.status === 'complete' && 'mitra-todos__item--complete',
            )}
            style={{
              color: todoItemColor(item.status, isDark),
              ...(item.status === 'complete' && !isDark
                ? { textDecoration: 'line-through', textDecorationColor: LIGHT_TODO_COLORS.textDecoration }
                : {}),
            }}
          >
            <TodoStatusIcon status={item.status} isDark={isDark} />
            <span className="mitra-todos__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
