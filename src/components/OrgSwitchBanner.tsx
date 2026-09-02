import { AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { DEMO_ORGANIZATIONS } from '../data/orgSettings';
import { useOrgSession } from '../contexts/OrgSessionContext';
import { cn } from '@/lib/utils';

interface OrgSwitchBannerProps {
  isDark: boolean;
  /** When true, another strip sits above — square off the top corners. */
  stacked?: boolean;
}

/**
 * Warning strip attached above the composer while the session is pointed at a
 * different organization than the home org, so work never lands in the wrong
 * org's instances by accident. Renders nothing when no switch is active.
 *
 * Amber accents, matching the ProdInstanceBanner geometry:
 * Light: fill #FFFAEB · border #F3D89A · icon #B4770E
 * Dark:  fill rgba(245,158,11,0.12) · border 30% · icon #F0BE5C
 */
export function OrgSwitchBanner({ isDark, stacked = false }: OrgSwitchBannerProps) {
  const { activeOrg, isOrgSwitched, setActiveOrgId } = useOrgSession();
  const homeOrg = DEMO_ORGANIZATIONS[0];

  if (!isOrgSwitched) return null;

  return (
    <div
      role="status"
      title={`Working in ${activeOrg.name} — switched from ${homeOrg.name}`}
      className={cn(
        'relative z-20 flex items-center gap-2 px-3.5 py-2 text-[12px]',
        stacked ? 'rounded-none border-b' : 'rounded-t-2xl rounded-b-none border-b',
        isDark
          ? 'border-[rgba(245,158,11,0.30)] bg-[rgba(245,158,11,0.12)]'
          : 'border-[#F3D89A] bg-[#FFFAEB]',
      )}
    >
      <AlertTriangle
        className={cn('h-3.5 w-3.5 shrink-0', isDark ? 'text-[#F0BE5C]' : 'text-[#B4770E]')}
        aria-hidden
      />
      <p className="flex min-w-0 items-center gap-1.5 leading-snug">
        <span className="shrink-0 font-semibold text-foreground">Working in a switched organization</span>
        <span
          className={cn('shrink-0 text-[10px]', isDark ? 'text-muted-foreground/70' : 'text-muted-foreground/50')}
          aria-hidden
        >
          ·
        </span>
        <span className={cn('min-w-0 truncate font-medium', isDark ? 'text-[#F0BE5C]' : 'text-[#B4770E]')}>
          {activeOrg.name}
        </span>
      </p>
      <button
        type="button"
        onClick={() => setActiveOrgId(homeOrg.id)}
        className={cn(
          'ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors',
          isDark
            ? 'text-[#F0BE5C] hover:bg-[rgba(245,158,11,0.18)]'
            : 'text-[#B4770E] hover:bg-[#F7EBCB]',
        )}
        title={`Switch back to ${homeOrg.name}`}
      >
        <ArrowRightLeft className="h-3 w-3 shrink-0" />
        Back to {homeOrg.name}
      </button>
    </div>
  );
}
