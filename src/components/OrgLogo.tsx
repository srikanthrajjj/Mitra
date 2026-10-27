import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Organization } from '../data/orgSettings';

interface OrgLogoProps {
  org: Pick<Organization, 'name' | 'logoInitials' | 'logoUrl'>;
  /** Tailwind size classes, e.g. "h-7 w-7". */
  className?: string;
  /** Initials size; the default suits a 28px mark. */
  textClassName?: string;
}

/**
 * The organisation's mark. Renders the uploaded logo when there is one and falls back to the
 * org's initials on a tinted square otherwise — so every org has a mark from day one, and a
 * logo that fails to load degrades to the same fallback rather than an empty box.
 */
export function OrgLogo({ org, className, textClassName }: OrgLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = org.logoUrl?.trim();

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={`${org.name} logo`}
        onError={() => setFailed(true)}
        className={cn('shrink-0 rounded-md object-contain', className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      title={org.name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-brand-green/12 font-display font-semibold uppercase text-brand-green-deep dark:text-brand-green',
        className,
        textClassName ?? 'text-[10px]',
      )}
    >
      {org.logoInitials}
    </span>
  );
}

export default OrgLogo;
