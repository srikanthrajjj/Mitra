import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { InternalTeamMember } from '../data/internalTeamMembers';
import { DEMO_ORGANIZATIONS, Organization } from '../data/orgSettings';

interface OrgSessionValue {
  impersonatedUser: InternalTeamMember | null;
  setImpersonatedUser: (user: InternalTeamMember | null) => void;
  activeOrgId: string;
  setActiveOrgId: (orgId: string) => void;
  activeOrg: Organization;
  isOrgSwitched: boolean;
}

const OrgSessionContext = createContext<OrgSessionValue | null>(null);

export function OrgSessionProvider({ children }: { children: ReactNode }) {
  const [impersonatedUser, setImpersonatedUser] = useState<InternalTeamMember | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string>(DEMO_ORGANIZATIONS[0].id);

  const value = useMemo<OrgSessionValue>(() => ({
    impersonatedUser,
    setImpersonatedUser,
    activeOrgId,
    setActiveOrgId,
    activeOrg: DEMO_ORGANIZATIONS.find((org) => org.id === activeOrgId) ?? DEMO_ORGANIZATIONS[0],
    isOrgSwitched: activeOrgId !== DEMO_ORGANIZATIONS[0].id,
  }), [impersonatedUser, activeOrgId]);

  return <OrgSessionContext.Provider value={value}>{children}</OrgSessionContext.Provider>;
}

export function useOrgSession(): OrgSessionValue {
  const context = useContext(OrgSessionContext);
  if (!context) {
    throw new Error('useOrgSession must be used within an OrgSessionProvider');
  }
  return context;
}
