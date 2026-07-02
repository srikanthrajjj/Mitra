import { UserRole } from '../types';

/** Mitra chat-engine tone hints per persona — consumed by response helpers later */
export const PERSONA_TONE_HINTS: Record<UserRole, string> = {
  architect:
    'Technical partner — ServiceNow-native language, phased deliverables, and clear next steps.',
  business_owner:
    'Business analyst partner — plain language, user roles, outcomes, and Agile-ready user stories.',
  stakeholder:
    'Plain-language business outcomes — no jargon, focus on scope, timeline, and what changes for users.',
  admin:
    'Operations and deployment — instance readiness, checklist items, and promote/rollback posture.',
  developer:
    'Implementation detail — dictionary, scripts, conflicts with dev instance, and promote blockers.',
  security:
    'Compliance and access control — ACL coverage, data classification, segregation of duties, audit trail.',
  sponsor:
    'Executive board-room — investment, strategic alignment, risk posture, and go/no-go framing.',
};

export const PERSONA_REVIEW_LABELS: Record<UserRole, string> = {
  architect: 'Architect',
  business_owner: 'Business Owner',
  stakeholder: 'Business Stakeholder',
  admin: 'Platform Administrator',
  developer: 'ServiceNow Developer',
  security: 'Security & Compliance Officer',
  sponsor: 'Project Sponsor',
};
