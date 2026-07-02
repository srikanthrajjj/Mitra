import { BusinessOwnerRequirementsUpload, UserStory } from '../types';
import { SAMPLE_USER_STORIES } from '../data/businessOwnerSamples';

export interface BAAnswers {
  userRole: string;
  desiredAction: string;
  businessValue: string;
}

function formatUserStory(role: string, action: string, value: string): string {
  const normalizedRole = role.trim().replace(/^(a|an)\s+/i, '');
  const article = /^[aeiou]/i.test(normalizedRole) ? 'an' : 'a';
  return `As ${article} ${normalizedRole}, I want ${action.replace(/^to\s+/i, '')}, so that ${value.replace(/^so that\s+/i, '')}.`;
}

function buildStory(role: string, action: string, value: string, index: number): UserStory {
  const formatted = formatUserStory(role, action, value);
  return {
    id: `us-generated-${Date.now()}-${index}`,
    role: role.trim(),
    action: action.trim(),
    value: value.trim(),
    formatted,
    status: 'draft',
    priority: 'medium',
    epic: 'Custom Requirements',
  };
}

/** Generate demo user stories from BA answers plus seeded stories from requirements */
export function generateUserStories(
  _requirements: BusinessOwnerRequirementsUpload,
  answers: BAAnswers,
): UserStory[] {
  const customStory = buildStory(answers.userRole, answers.desiredAction, answers.businessValue, 0);

  const seeded = SAMPLE_USER_STORIES.map((story) => ({
    ...story,
    id: `${story.id}-${Date.now()}`,
    status: 'draft' as const,
  }));

  return [customStory, ...seeded.slice(0, 4)];
}

/** Count requirement themes for Mitra intro message */
export function summarizeRequirements(requirements: BusinessOwnerRequirementsUpload): string {
  const lines = requirements.content.split('\n').filter((l) => l.trim().length > 0);
  const sectionCount = lines.filter((l) => l.startsWith('#')).length;
  const tableRows = (requirements.content.match(/\|/g) ?? []).length;
  return `${requirements.fileName} — ${sectionCount || 'multiple'} sections, ${tableRows > 0 ? 'includes user role matrix' : 'narrative requirements'}`;
}
