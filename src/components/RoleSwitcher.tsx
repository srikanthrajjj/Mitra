import type { ReactNode } from 'react';
import { UserCog, Users, ChevronDown, Shield, Code2, ShieldCheck, Briefcase, Building2 } from 'lucide-react';
import { Theme, UserRole } from '../types';
import { isDarkTheme } from '../utils/theme';
import { ROLE_LABELS } from '../constants/role';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface RoleSwitcherProps {
  theme: Theme;
  role: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  iconOnly?: boolean;
}

const ROLE_ICONS: Record<UserRole, ReactNode> = {
  architect: <UserCog className="h-3 w-3" />,
  business_owner: <Building2 className="h-3 w-3" />,
  stakeholder: <Users className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  developer: <Code2 className="h-3 w-3" />,
  security: <ShieldCheck className="h-3 w-3" />,
  sponsor: <Briefcase className="h-3 w-3" />,
};

const DEMO_ROLES: UserRole[] = ['business_owner', 'architect', 'stakeholder', 'developer', 'admin', 'security', 'sponsor'];

export function RoleSwitcher({ theme, role, onChange, disabled, iconOnly }: RoleSwitcherProps) {
  const isDark = isDarkTheme(theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={iconOnly ? 'icon' : 'sm'}
          disabled={disabled}
          className={cn(
            iconOnly
              ? 'h-7 w-7 text-muted-foreground hover:text-foreground'
              : 'h-6 gap-1 px-1.5 text-[10px] font-normal text-muted-foreground hover:text-foreground',
          )}
          aria-label={`Switch role (${ROLE_LABELS[role]})`}
        >
          {ROLE_ICONS[role]}
          {!iconOnly && (
            <>
              {ROLE_LABELS[role]}
              <ChevronDown className="h-2.5 w-2.5 opacity-40" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(theme, 'w-40 text-xs')}>
        {DEMO_ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => onChange(r)}
            className={cn('text-xs', role === r && 'bg-accent/50')}
          >
            {ROLE_ICONS[r]}
            {ROLE_LABELS[r]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
