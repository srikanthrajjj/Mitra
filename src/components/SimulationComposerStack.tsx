import React from 'react';
import { SIMULATION_INPUT_NOTE } from '../constants/simulation';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';

interface SimulationComposerStackProps {
  theme: Theme;
  /** Classes for the front input card (border, glow, bg handled by parent) */
  cardClassName?: string;
  inputId?: string;
  dataTour?: string;
  children: React.ReactNode;
}

/**
 * Stacks a subtle notice card behind the composer — top corners peek above the input.
 */
export default function SimulationComposerStack({
  theme,
  cardClassName = '',
  inputId,
  dataTour = 'composer',
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

      {/* Front layer — subtle idle stroke; gradient intensifies on hover/focus */}
      <div
        id={inputId}
        data-tour={dataTour}
        className={`relative z-10 mt-3 rounded-2xl p-px transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-r from-white/[0.07] via-white/[0.05] to-white/[0.07] hover:from-emerald-500/20 hover:via-white/[0.08] hover:to-indigo-500/18 focus-within:p-[1.5px] focus-within:from-emerald-500/75 focus-within:via-teal-500/60 focus-within:to-indigo-500/70 focus-within:animate-gradient-stroke focus-within:shadow-md'
            : 'bg-gradient-to-r from-slate-300/50 via-slate-200/40 to-slate-300/50 hover:from-emerald-400/25 hover:via-slate-200/50 hover:to-indigo-400/20 focus-within:p-[1.5px] focus-within:from-emerald-500/70 focus-within:via-teal-400/55 focus-within:to-indigo-500/65 focus-within:animate-gradient-stroke focus-within:shadow-md'
        }`}
      >
        <div
          className={`rounded-[14px] overflow-hidden shadow-[0_8px_24px_-14px_rgba(15,23,42,0.16),0_2px_8px_rgba(15,23,42,0.05)] ${cleanCardClassName} ${
            isDark
              ? 'shadow-[0_10px_30px_-18px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.04)_inset]'
              : 'shadow-[0_10px_28px_-18px_rgba(15,23,42,0.14),0_1px_0_rgba(255,255,255,0.9)_inset]'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

