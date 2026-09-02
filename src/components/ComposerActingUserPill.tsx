import { VenetianMask } from 'lucide-react';
import { useOrgSession } from '../contexts/OrgSessionContext';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

interface ComposerActingUserPillProps {
  theme: Theme;
}

/**
 * Amber heads-up in the composer showing which user the session is acting as
 * inside the active org. Only rendered while impersonating.
 */
export function ComposerActingUserPill({ theme }: ComposerActingUserPillProps) {
  const { impersonatedUser, activeOrg } = useOrgSession();
  const isDark = isDarkTheme(theme);

  if (!impersonatedUser) return null;

  return (
    <span
      className={cn(
        'inline-flex max-w-[15rem] items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        isDark
          ? 'bg-amber-400/15 text-amber-300'
          : 'bg-amber-100 text-amber-900',
      )}
      title={`${impersonatedUser.name} (${impersonatedUser.email}) is working in ${activeOrg.name}`}
    >
      <VenetianMask className="h-3 w-3 shrink-0" />
      <span className="truncate">Working as {impersonatedUser.name}</span>
    </span>
  );
}
