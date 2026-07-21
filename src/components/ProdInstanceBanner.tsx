import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProdInstanceBannerProps {
  isDark: boolean;
  instanceName: string;
  hostname?: string;
  /** When true, flush-attached to the composer below (default). */
  attached?: boolean;
}

/**
 * Status/warning strip that sits flush above the composer —
 * top corners more rounded than bottom so it merges into the input.
 */
export function ProdInstanceBanner({
  isDark,
  instanceName,
  hostname,
  attached = true,
}: ProdInstanceBannerProps) {
  const title = hostname
    ? `Working with production instance · ${instanceName} (${hostname})`
    : `Working with production instance · ${instanceName}`;

  return (
    <div
      role="status"
      title={title}
      className={cn(
        'relative z-20 flex items-center gap-2 px-3.5 py-2 text-[12px]',
        attached
          ? 'rounded-t-2xl rounded-b-none border-b'
          : 'mb-2 rounded-xl border',
        isDark
          ? 'border-white/[0.06] bg-[#1a1814]'
          : 'border-amber-200/60 bg-[#f3eee4]',
      )}
    >
      <AlertTriangle
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          isDark ? 'text-amber-400/75' : 'text-amber-600/80',
        )}
        aria-hidden
      />
      <p className="min-w-0 truncate leading-none">
        <span
          className={cn(
            'font-semibold',
            isDark ? 'text-white' : 'text-foreground',
          )}
        >
          Working with production instance
        </span>
        <span
          className={cn(
            'mx-1.5 inline-block translate-y-[-0.5px] text-[10px]',
            isDark ? 'text-white/30' : 'text-muted-foreground/50',
          )}
          aria-hidden
        >
          ·
        </span>
        <span className="font-medium text-brand-green">{instanceName}</span>
      </p>
    </div>
  );
}
