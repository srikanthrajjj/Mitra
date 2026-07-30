export type SignupPath = 'try' | 'admin';

export interface SignupDraft {
  path: SignupPath | null;
  firstQuestion: string;
  role: string;
  experience: string;
  interests: string[];
  companyName: string;
  industry: string;
  teamSize: string;
  instanceType: string;
  modules: string[];
  timeline: string;
  fullName: string;
  email: string;
}

export interface SignupProfile extends Omit<SignupDraft, 'path'> {
  path: SignupPath;
  completedAt: string;
}

export const SIGNUP_PROFILE_KEY = 'mitra_signup_profile';
export const SIGNUP_ORG_SEEDED_KEY = 'mitra_signup_org_seeded';

export function emptySignupDraft(): SignupDraft {
  return {
    path: null,
    firstQuestion: '',
    role: '',
    experience: '',
    interests: [],
    companyName: '',
    industry: '',
    teamSize: '',
    instanceType: '',
    modules: [],
    timeline: '',
    fullName: '',
    email: '',
  };
}

export function readSignupProfile(): SignupProfile | null {
  try {
    const raw = localStorage.getItem(SIGNUP_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignupProfile;
    if (!parsed?.path || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistSignupProfile(profile: SignupProfile): void {
  localStorage.setItem(SIGNUP_PROFILE_KEY, JSON.stringify(profile));
  localStorage.removeItem(SIGNUP_ORG_SEEDED_KEY);
}

export function clearSignupProfile(): void {
  localStorage.removeItem(SIGNUP_PROFILE_KEY);
  localStorage.removeItem(SIGNUP_ORG_SEEDED_KEY);
}

export function isSignupOrgSeeded(): boolean {
  return localStorage.getItem(SIGNUP_ORG_SEEDED_KEY) === 'true';
}

export function markSignupOrgSeeded(): void {
  localStorage.setItem(SIGNUP_ORG_SEEDED_KEY, 'true');
}

/** Map team-size choice to seat count for a draft org. */
export function seatsFromTeamSize(teamSize: string): number {
  switch (teamSize) {
    case '1-5':
      return 5;
    case '6-20':
      return 20;
    case '21-100':
      return 50;
    case '100+':
      return 100;
    default:
      return 5;
  }
}

export function slugFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return slug || 'workspace';
}
