import { useState } from 'react';
import { Check, Plus, Server, Zap } from 'lucide-react';
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
  onCreateConnection?: () => void;
  disabled?: boolean;
  isConnected?: boolean;
}

export function ComposerInstanceSelect({
  theme,
  instances = SERVICE_NOW_INSTANCES,
  value,
  onChange,
  onCreateConnection,
  disabled = false,
  isConnected = true,
}: ComposerInstanceSelectProps) {
  const isDark = isDarkTheme(theme);
  const [open, setOpen] = useState(false);
  const selected = instances.find((instance) => instance.id === value);

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
              'text-muted-foreground',
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
            <>
              <span
                className={cn(
                  strokePill(
                    'max-w-[9rem] truncate px-2 py-0.5 text-[10px] font-medium leading-none',
                  ),
                  open && openStroke,
                  'text-foreground',
                )}
              >
                <span className="inline-flex items-center gap-1">
                  <Zap
                    className={cn(
                      'h-3 w-3 shrink-0 transition-all duration-300',
                      isConnected && 'text-brand-green drop-shadow-[0_0_4px_rgba(50,215,75,0.6)]',
                    )}
                    fill={isConnected ? 'currentColor' : 'none'}
                  />
                  {selected.name}
                </span>
              </span>
            </>
          ) : (
            <span
              className={cn(
                strokePill('px-2 py-0.5 text-[10px] font-medium leading-none'),
                open && openStroke,
                'text-muted-foreground',
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
          'border-mitra-border bg-mitra-surface/95 text-foreground',
          isDark
            ? 'shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
            : 'shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
        )}
      >
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          ServiceNow instance
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-mitra-border/30" />
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
                    : 'bg-muted focus:bg-muted'
                  : 'focus:bg-mitra-surface',
                !instance.active && 'opacity-50',
              )}
            >
              <Server
                className={cn(
                  'mr-2 h-4 w-4 shrink-0',
                  isSelected
                    ? 'text-brand-green'
                    : 'text-muted-foreground',
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Zap
                    className={cn(
                      'h-3 w-3 shrink-0',
                      isSelected
                        ? 'text-brand-green'
                        : 'text-muted-foreground',
                    )}
                    fill={isSelected ? 'currentColor' : 'none'}
                  />
                  <span className="truncate text-xs font-medium">{instance.name}</span>
                  <span
                    className={cn(
                      strokePill('shrink-0 px-1.5 py-px text-[9px] font-semibold uppercase'),
                      isSelected && openStroke,
              'text-muted-foreground',
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
        {onCreateConnection && (
          <>
            <DropdownMenuSeparator className="bg-mitra-border/30" />
            <DropdownMenuItem
              onClick={() => {
                setOpen(false);
                onCreateConnection();
              }}
              className={cn(
                'cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium outline-none',
                isDark
                  ? 'text-brand-green focus:bg-brand-green/10 focus:text-brand-green'
                  : 'text-brand-green focus:bg-muted focus:text-brand-green',
              )}
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Create connection
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
