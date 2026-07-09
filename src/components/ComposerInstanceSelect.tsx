import { useState } from 'react';
import { Check, Plus, Server } from 'lucide-react';
import {
  SERVICE_NOW_INSTANCES,
  ServiceNowInstance,
  instanceHostname,
} from '../data/serviceNowInstances';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

interface ComposerInstanceSelectProps {
  theme: Theme;
  instances?: ServiceNowInstance[];
  value: string;
  onChange: (instanceId: string) => void;
  disabled?: boolean;
}

export function ComposerInstanceSelect({
  theme,
  instances = SERVICE_NOW_INSTANCES,
  value,
  onChange,
  disabled = false,
}: ComposerInstanceSelectProps) {
  const isDark = isDarkTheme(theme);
  const [open, setOpen] = useState(false);
  const selected = instances.find((instance) => instance.id === value);

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
          className="inline-flex max-w-[13rem] items-center gap-1 bg-transparent p-0 transition-colors cursor-pointer"
          title={
            selected
              ? `${selected.name} (${selected.tag}) · ${instanceHostname(selected.url)}`
              : 'Select ServiceNow instance'
          }
          aria-label={
            selected
              ? `ServiceNow instance: ${selected.name}`
              : 'Select ServiceNow instance'
          }
        >
          <span
            className={cn(
              strokePill('inline-flex h-6 w-6 items-center justify-center'),
              open && openStroke,
              isDark ? 'text-slate-400' : 'text-slate-500',
            )}
          >
            <Plus
              className={cn(
                'h-3.5 w-3.5 shrink-0 transition-transform duration-250',
                open && 'rotate-45 text-brand-green',
              )}
            />
          </span>
          {selected ? (
            <span
              className={cn(
                strokePill(
                  'max-w-[7.5rem] truncate px-2 py-0.5 text-[10px] font-medium leading-none',
                ),
                open && openStroke,
                isDark ? 'text-slate-300' : 'text-slate-700',
              )}
            >
              {selected.name}
            </span>
          ) : (
            <span
              className={cn(
                strokePill('px-2 py-0.5 text-[10px] font-medium leading-none'),
                open && openStroke,
                isDark ? 'text-slate-400' : 'text-slate-500',
              )}
            >
              Instance
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className={cn(
          theme,
          'w-64 rounded-xl border p-1 backdrop-blur-md',
          isDark
            ? 'border-white/[0.06] bg-zinc-900/95 text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
            : 'border-slate-200/60 bg-white/95 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
        )}
      >
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          ServiceNow instance
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={isDark ? 'bg-white/[0.06]' : 'bg-slate-100'} />
        {instances.map((instance) => {
          const isSelected = value === instance.id;
          return (
            <DropdownMenuItem
              key={instance.id}
              disabled={!instance.active}
              onClick={() => {
                onChange(instance.id);
                setOpen(false);
              }}
              className={cn(
                'cursor-pointer rounded-lg px-2.5 py-2 outline-none',
                isSelected
                  ? isDark
                    ? 'bg-brand-green/10 focus:bg-brand-green/10'
                    : 'bg-emerald-50 focus:bg-emerald-50'
                  : isDark
                    ? 'focus:bg-white/[0.06]'
                    : 'focus:bg-slate-50',
                !instance.active && 'opacity-50',
              )}
            >
              <Server
                className={cn(
                  'mr-2 h-4 w-4 shrink-0',
                  isSelected
                    ? 'text-brand-green'
                    : isDark
                      ? 'text-slate-500'
                      : 'text-slate-400',
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-medium">{instance.name}</span>
                  <span
                    className={cn(
                      strokePill('shrink-0 px-1.5 py-px text-[9px] font-semibold uppercase'),
                      isSelected && openStroke,
                      isDark ? 'text-slate-400' : 'text-slate-500',
                    )}
                  >
                    {instance.tag}
                  </span>
                </div>
                <p className="truncate text-[10px] text-muted-foreground">
                  {instanceHostname(instance.url)}
                </p>
              </div>
              <Check
                className={cn(
                  'ml-2 h-3.5 w-3.5 shrink-0',
                  isSelected ? 'text-brand-green opacity-100' : 'opacity-0',
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
