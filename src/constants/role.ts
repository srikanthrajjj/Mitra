import { UserRole } from '../types';

export const USER_ROLE_KEY = 'MITRA_USER_ROLE';
export const AUTH_MODE_KEY = 'mitra_auth_mode';

export type AuthMode = 'signed-in' | 'guest';

const VALID_ROLES: UserRole[] = ['architect', 'business_owner', 'stakeholder', 'admin', 'developer', 'security', 'sponsor'];

export function readUserRole(): UserRole {
  const saved = localStorage.getItem(USER_ROLE_KEY);
  if (saved && VALID_ROLES.includes(saved as UserRole)) {
    return saved as UserRole;
  }
  return 'architect';
}

export function persistUserRole(role: UserRole): void {
  localStorage.setItem(USER_ROLE_KEY, role);
}

export function readAuthMode(): AuthMode {
  return localStorage.getItem(AUTH_MODE_KEY) === 'guest' ? 'guest' : 'signed-in';
}

export function persistAuthMode(mode: AuthMode): void {
  localStorage.setItem(AUTH_MODE_KEY, mode);
}

export const ROLE_LABELS: Record<UserRole, string> = {
  architect: 'Architect',
  business_owner: 'Business Owner',
  stakeholder: 'Stakeholder',
  admin: 'Admin',
  developer: 'Developer',
  security: 'Security',
  sponsor: 'Sponsor',
};

/** Shown under the user name in the sidebar profile footer */
export const ROLE_PROFILE_SUBTITLES: Record<UserRole, string> = {
  architect: 'Solution Architect',
  business_owner: 'Business Owner',
  stakeholder: 'Business Stakeholder',
  admin: 'Platform Administrator',
  developer: 'ServiceNow Developer',
  security: 'Security & Compliance Officer',
  sponsor: 'Project Sponsor',
};

export const ARCHITECT_DISPLAY_NAME = 'Srikanth Sharma';
