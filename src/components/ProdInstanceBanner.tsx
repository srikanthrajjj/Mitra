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
 *
 * Subtle orange → reddish warning accents (not alarm-red):
 * Light: fill #FFF5F2 · border #F0C4B4 · icon #C45C3E
 * Dark:  fill rgba(196,92,62,0.12) · border 30% · icon #E8A090
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
          ? 'border-[rgba(196,92,62,0.30)] bg-[rgba(196,92,62,0.12)]'
          : 'border-[#F0C4B4] bg-[#FFF5F2]',
      )}
    >
      <AlertTriangle
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          isDark ? 'text-[#E8A090]' : 'text-[#C45C3E]',
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
