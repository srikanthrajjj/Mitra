import React from 'react';
import { SIMULATION_INPUT_NOTE } from '../constants/simulation';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface SimulationComposerStackProps {
  theme: Theme;
  /** Classes for the front input card (border, glow, bg handled by parent) */
  cardClassName?: string;
  inputId?: string;
  children: React.ReactNode;
}

/**
 * Stacks a subtle notice card behind the composer — top corners peek above the input.
 */
export default function SimulationComposerStack({
  theme,
  cardClassName = '',
  inputId,
  children,
}: SimulationComposerStackProps) {
  const isDark = isDarkTheme(theme);

  // Clean up cardClassName to remove borders and glow classes since we are providing a premium animated gradient border
  const cleanCardClassName = cardClassName
    .split(' ')
    .filter(
      (c) =>
        c !== 'border' &&
        !c.startsWith('border-') &&
        !c.startsWith('hover:border-') &&
        !c.startsWith('focus-within:') &&
        !c.startsWith('ring-') &&
        c !== 'input-active-glow' &&
        c !== 'input-invite-glow'
    )
    .join(' ');

  return (
    <div className="relative w-full">
      {/* Back layer — slightly narrower; rounded top corners peek above the input */}
      <div
        role="note"
        aria-label={SIMULATION_INPUT_NOTE}
        className={`absolute z-0 left-2.5 right-2.5 top-0 rounded-t-2xl border border-b-0 px-3 pt-[6px] pb-5 text-center pointer-events-none transition-all duration-300 ${
          isDark
            ? 'bg-[#16140e]/90 border-amber-900/20 shadow-[0_-1px_0_rgba(251,191,36,0.06)_inset]'
            : 'bg-[#f5f0e6]/95 border-amber-200/35 shadow-[0_-1px_0_rgba(255,255,255,0.5)_inset]'
        }`}
      >
        <span
          className={`text-[10px] font-normal tracking-[0.02em] ${
            isDark ? 'text-amber-600/45' : 'text-amber-700/55'
          }`}
        >
          Messages are simulated
        </span>
      </div>

      {/* Front layer — input composer overlaps the notice card with animated gradient stroke */}
      <div
        id={inputId}
        className={`relative z-10 mt-3 rounded-2xl p-[1.5px] bg-gradient-to-r from-emerald-500/30 via-teal-400/30 to-indigo-500/30 hover:from-emerald-500/60 hover:via-teal-400/60 hover:to-indigo-500/60 focus-within:from-emerald-500/90 focus-within:via-teal-500/90 focus-within:to-indigo-500/90 animate-gradient-stroke shadow-md transition-all duration-300`}
      >
        <div className={`rounded-[14px] overflow-hidden ${cleanCardClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

