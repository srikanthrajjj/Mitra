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
      'rounded-full border bg-transparent border-mitra-border',
      extra,
    );

  const openStroke = isDark ? 'border-brand-green/35' : 'border-brand-green/80';

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
              'text-foreground',
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
          'border-mitra-border bg-mitra-surface/95 text-foreground',
          isDark
            ? 'shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
            : 'shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
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
                    : 'bg-muted text-brand-green focus:bg-muted focus:text-brand-green'
                  : 'text-muted-foreground focus:bg-mitra-surface focus:text-foreground',
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
