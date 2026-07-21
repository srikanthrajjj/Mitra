import React from 'react';
import { SIMULATION_INPUT_NOTE } from '../constants/simulation';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

interface SimulationComposerStackProps {
  theme: Theme;
  /** Classes for the inner input card (background, layout — not border stroke) */
  cardClassName?: string;
  inputId?: string;
  dataTour?: string;
  /** Focused or has content — stronger active stroke */
  isActive?: boolean;
  /** Flush status/warning strip rendered above the input inside the same card */
  attachedHeader?: React.ReactNode;
  children: React.ReactNode;
}

function cleanCardClassName(cardClassName: string): string {
  return cardClassName
    .split(' ')
    .filter(
      (c) =>
        c !== 'border' &&
        !c.startsWith('border-') &&
        !c.startsWith('hover:border-') &&
        !c.startsWith('focus-within:') &&
        !c.startsWith('ring-') &&
        !c.startsWith('hover:ring-') &&
        !c.startsWith('scale-') &&
        c !== 'input-active-glow' &&
        c !== 'input-invite-glow' &&
        !c.endsWith('.light'),
    )
    .join(' ');
}

/**
 * Stacks a subtle notice card behind the composer — top corners peek above the input.
 * Optional attachedHeader sits flush on top of the input card (e.g. prod warning).
 */
export default function SimulationComposerStack({
  theme,
  cardClassName = '',
  inputId,
  dataTour = 'composer',
  isActive = false,
  attachedHeader,
  children,
}: SimulationComposerStackProps) {
  const isDark = isDarkTheme(theme);
  const innerClassName = cleanCardClassName(cardClassName);
  const hasAttachedHeader = Boolean(attachedHeader);

  return (
    <div className="relative w-full">
      <div
        role="note"
        aria-label={SIMULATION_INPUT_NOTE}
        className={cn(
          'pointer-events-none absolute top-0 right-2.5 left-2.5 z-0 rounded-t-2xl border border-b-0 px-3 pt-[6px] pb-5 text-center transition-colors duration-200',
          isDark
            ? 'border-amber-900/20 bg-[#16140e]/90'
            : 'border-amber-200/35 bg-[#f5f0e6]/95',
        )}
      >
        <span
          className={cn(
            'text-[10px] font-normal tracking-[0.02em]',
            isDark ? 'text-amber-600/45' : 'text-amber-700/55',
          )}
        >
          Messages are simulated
        </span>
      </div>

      <div
        id={inputId}
        data-tour={dataTour}
        className={cn(
          'relative z-10 mt-3 overflow-hidden rounded-2xl border bg-transparent transition-colors duration-200',
          isDark ? 'border-white/10' : 'border-slate-200/90',
          !isActive && (isDark ? 'hover:border-white/22' : 'hover:border-slate-300'),
          isActive && (isDark ? 'border-brand-green/45' : 'border-emerald-400/70'),
        )}
      >
        {hasAttachedHeader && attachedHeader}

        <div
          className={cn(
            'overflow-hidden',
            hasAttachedHeader ? 'rounded-b-[15px] rounded-t-none' : 'rounded-[15px]',
            innerClassName,
            isDark
              ? 'shadow-[0_10px_30px_-18px_rgba(0,0,0,0.55)]'
              : 'shadow-[0_10px_28px_-18px_rgba(15,23,42,0.14)]',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
