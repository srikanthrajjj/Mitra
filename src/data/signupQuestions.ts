export const SIGNUP_ROLES = [
  { value: 'architect', label: 'Architect' },
  { value: 'developer', label: 'Developer' },
  { value: 'ba', label: 'Business Analyst' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
] as const;

export const SIGNUP_EXPERIENCE = [
  { value: 'new', label: 'New to ServiceNow' },
  { value: '1-3', label: '1–3 years' },
  { value: '3+', label: '3+ years' },
] as const;

export const SIGNUP_MODULES = [
  { value: 'hrsd', label: 'HRSD' },
  { value: 'itsm', label: 'ITSM' },
  { value: 'itam', label: 'ITAM' },
  { value: 'csm', label: 'CSM' },
  { value: 'other', label: 'Other' },
] as const;

export const SIGNUP_INDUSTRIES = [
  'Financial Services',
  'Technology',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Public Sector',
  'Telecommunications',
  'Other',
] as const;

export const SIGNUP_TEAM_SIZES = [
  { value: '1-5', label: '1–5 people' },
  { value: '6-20', label: '6–20 people' },
  { value: '21-100', label: '21–100 people' },
  { value: '100+', label: '100+ people' },
] as const;

export const SIGNUP_INSTANCE_TYPES = [
  { value: 'pdi', label: 'Personal Dev Instance' },
  { value: 'subprod', label: 'Sub-prod / non-prod' },
  { value: 'enterprise', label: 'Enterprise production' },
  { value: 'none', label: 'None yet' },
] as const;

export const SIGNUP_TIMELINES = [
  { value: 'evaluating', label: 'Still evaluating' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'year', label: 'This year' },
] as const;
