export interface InternalTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

/** Teammates already provisioned on this ServiceNow instance / org. */
export const INTERNAL_TEAM_MEMBERS: InternalTeamMember[] = [
  {
    id: 'tm-priya',
    name: 'Priya Nair',
    email: 'priya.nair@acme.com',
    role: 'HR Business Analyst',
    department: 'Human Resources',
  },
  {
    id: 'tm-marcus',
    name: 'Marcus Chen',
    email: 'marcus.chen@acme.com',
    role: 'ServiceNow Developer',
    department: 'Platform Engineering',
  },
  {
    id: 'tm-anika',
    name: 'Anika Desai',
    email: 'anika.desai@acme.com',
    role: 'Solution Architect',
    department: 'Enterprise Architecture',
  },
  {
    id: 'tm-jordan',
    name: 'Jordan Lee',
    email: 'jordan.lee@acme.com',
    role: 'QA Lead',
    department: 'Quality Assurance',
  },
  {
    id: 'tm-srikanth',
    name: 'Srikanth Sharma',
    email: 'srikanth.sharma@acme.com',
    role: 'Engagement Lead',
    department: 'Delivery',
  },
  {
    id: 'tm-elena',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@acme.com',
    role: 'Process Owner',
    department: 'Operations',
  },
];

export function getInternalTeamMember(memberId: string): InternalTeamMember | undefined {
  return INTERNAL_TEAM_MEMBERS.find((member) => member.id === memberId);
}

export function getAvailableTeamMembers(
  collaborators: { email: string }[],
  ownerEmail?: string,
): InternalTeamMember[] {
  const blocked = new Set(
    [
      ownerEmail?.toLowerCase(),
      ...collaborators.map((collaborator) => collaborator.email.toLowerCase()),
    ].filter(Boolean) as string[],
  );

  return INTERNAL_TEAM_MEMBERS.filter((member) => !blocked.has(member.email.toLowerCase()));
}
