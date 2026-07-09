import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  COMPOSER_MODES,
  ComposerModeId,
} from '../constants/composerModes';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

interface ComposerModeSelectProps {
  theme: Theme;
  value: ComposerModeId;
  onChange: (mode: ComposerModeId) => void;
  disabled?: boolean;
}

export function ComposerModeSelect({
  theme,
  value,
  onChange,
  disabled = false,
}: ComposerModeSelectProps) {
  const isDark = isDarkTheme(theme);
  const [open, setOpen] = useState(false);
  const current = COMPOSER_MODES.find((mode) => mode.id === value) ?? COMPOSER_MODES[0];

  const strokePill = (extra?: string) =>
    cn(
      'rounded-full border bg-transparent',
      isDark ? 'border-white/12' : 'border-slate-200/80',
      extra,
    );

  const openStroke = isDark ? 'border-brand-green/35' : 'border-emerald-300/80';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="inline-flex items-center bg-transparent p-0 transition-colors cursor-pointer"
          aria-label="Composer mode"
        >
          <span
            className={cn(
              strokePill(
                'inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium leading-none',
              ),
              open && openStroke,
              isDark ? 'text-slate-300' : 'text-slate-700',
            )}
          >
            <span>{current.label}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={6}
        className={cn(
          theme,
          'min-w-[5.25rem] rounded-xl border p-1 backdrop-blur-md',
          isDark
            ? 'border-white/[0.06] bg-zinc-900/95 text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
            : 'border-slate-200/60 bg-white/95 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
        )}
      >
        {COMPOSER_MODES.map((mode) => {
          const selected = value === mode.id;
          return (
            <DropdownMenuItem
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={cn(
                'cursor-pointer rounded-lg px-2.5 py-1.5 text-[11px] font-medium capitalize outline-none',
                selected
                  ? isDark
                    ? 'bg-brand-green/10 text-brand-green focus:bg-brand-green/10 focus:text-brand-green'
                    : 'bg-emerald-50 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700'
                  : isDark
                    ? 'text-slate-400 focus:bg-white/[0.06] focus:text-slate-200'
                    : 'text-slate-600 focus:bg-slate-50 focus:text-slate-900',
              )}
            >
              {mode.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
