import { USER_DISPLAY_NAME } from '../constants/user';
import { SKILL_CATEGORIES, type SkillCategory } from './skills';
import { loadSelectedInstanceId } from './serviceNowInstances';

export type SkillPublishStatus = 'draft' | 'published';

/** Managed skill record — maps to a ServiceNow custom table (u_mitra_skill). */
export interface ManagedSkill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  instructions: string;
  enabled: boolean;
  status: SkillPublishStatus;
  createdBy: string;
  updatedBy: string;
  instanceId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  /** Built-in catalog skills edited via overrides. */
  isBuiltin?: boolean;
}

/**
 * Version snapshot — maps to SN child table u_mitra_skill_version
 * (one row per save; parent = skill sys_id).
 */
export interface SkillVersion {
  id: string;
  skillId: string;
  version: number;
  name: string;
  description: string;
  category: SkillCategory;
  instructions: string;
  status: SkillPublishStatus;
  changedBy: string;
  changedAt: string;
  changeNote?: string;
}

export const MANAGED_SKILLS_KEY = 'mitra-managed-skills';
export const SKILL_VERSIONS_KEY = 'mitra-skill-versions';
/** Legacy key from SkillsView — migrated on first load. */
export const LEGACY_CUSTOM_SKILLS_KEY = 'mitra-custom-skills';

export const SKILL_STATUS_LABELS: Record<SkillPublishStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

function nowIso() {
  return new Date().toISOString();
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Migrate legacy CustomSkill[] shape into ManagedSkill[]. */
function migrateLegacyCustomSkills(): ManagedSkill[] {
  const legacy = readJson<Array<Partial<ManagedSkill> & { id: string; name: string }>>(
    LEGACY_CUSTOM_SKILLS_KEY,
    [],
  );
  if (!legacy.length) return [];
  const stamp = nowIso();
  return legacy.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    category: (s.category as SkillCategory) ?? 'Documentation',
    instructions: s.instructions ?? '',
    enabled: s.enabled ?? true,
    status: (s.status as SkillPublishStatus) ?? 'published',
    createdBy: s.createdBy ?? USER_DISPLAY_NAME,
    updatedBy: s.updatedBy ?? s.createdBy ?? USER_DISPLAY_NAME,
    instanceId: s.instanceId ?? loadSelectedInstanceId(),
    version: typeof s.version === 'number' ? s.version : 1,
    createdAt: s.createdAt ?? stamp,
    updatedAt: s.updatedAt ?? stamp,
    isBuiltin: false,
  }));
}

export function loadManagedSkills(): ManagedSkill[] {
  const existing = readJson<ManagedSkill[]>(MANAGED_SKILLS_KEY, []);
  if (existing.length) return existing;
  const migrated = migrateLegacyCustomSkills();
  if (migrated.length) {
    writeJson(MANAGED_SKILLS_KEY, migrated);
    // Seed v1 for each migrated skill
    const versions = migrated.map((s) => snapshotFromSkill(s, 'Migrated from legacy skills'));
    writeJson(SKILL_VERSIONS_KEY, versions);
  }
  return migrated;
}

export function saveManagedSkills(skills: ManagedSkill[]) {
  writeJson(MANAGED_SKILLS_KEY, skills);
}

export function loadSkillVersions(): SkillVersion[] {
  return readJson<SkillVersion[]>(SKILL_VERSIONS_KEY, []);
}

export function saveSkillVersions(versions: SkillVersion[]) {
  writeJson(SKILL_VERSIONS_KEY, versions);
}

export function getVersionsForSkill(skillId: string, all = loadSkillVersions()): SkillVersion[] {
  return all
    .filter((v) => v.skillId === skillId)
    .sort((a, b) => b.version - a.version);
}

export function snapshotFromSkill(skill: ManagedSkill, changeNote?: string): SkillVersion {
  return {
    id: `sv-${skill.id}-v${skill.version}-${Date.now()}`,
    skillId: skill.id,
    version: skill.version,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    instructions: skill.instructions,
    status: skill.status,
    changedBy: skill.updatedBy,
    changedAt: skill.updatedAt,
    changeNote,
  };
}

export function createManagedSkill(input: {
  name: string;
  description: string;
  category: SkillCategory;
  instructions: string;
  enabled?: boolean;
  status?: SkillPublishStatus;
  instanceId?: string;
  changeNote?: string;
}): { skill: ManagedSkill; version: SkillVersion } {
  const stamp = nowIso();
  const skill: ManagedSkill = {
    id: `skill-${Date.now()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category,
    instructions: input.instructions.trim(),
    enabled: input.enabled ?? true,
    status: input.status ?? 'draft',
    createdBy: USER_DISPLAY_NAME,
    updatedBy: USER_DISPLAY_NAME,
    instanceId: input.instanceId ?? loadSelectedInstanceId(),
    version: 1,
    createdAt: stamp,
    updatedAt: stamp,
  };
  return { skill, version: snapshotFromSkill(skill, input.changeNote ?? 'Created') };
}

export function applySkillUpdate(
  current: ManagedSkill,
  patch: Partial<Pick<ManagedSkill, 'name' | 'description' | 'category' | 'instructions' | 'enabled' | 'status' | 'instanceId'>>,
  changeNote?: string,
): { skill: ManagedSkill; version: SkillVersion } {
  const stamp = nowIso();
  const skill: ManagedSkill = {
    ...current,
    ...patch,
    name: (patch.name ?? current.name).trim(),
    description: (patch.description ?? current.description).trim(),
    instructions: (patch.instructions ?? current.instructions).trim(),
    updatedBy: USER_DISPLAY_NAME,
    updatedAt: stamp,
    version: current.version + 1,
  };
  return { skill, version: snapshotFromSkill(skill, changeNote ?? 'Updated') };
}

export function restoreFromVersion(
  current: ManagedSkill,
  version: SkillVersion,
): { skill: ManagedSkill; version: SkillVersion } {
  return applySkillUpdate(
    current,
    {
      name: version.name,
      description: version.description,
      category: version.category,
      instructions: version.instructions,
      status: version.status,
    },
    `Restored from v${version.version}`,
  );
}

export interface SkillFieldDiff {
  field: 'name' | 'description' | 'category' | 'instructions' | 'status';
  label: string;
  before: string;
  after: string;
  changed: boolean;
}

export function diffSkillVersions(a: SkillVersion | ManagedSkill, b: SkillVersion | ManagedSkill): SkillFieldDiff[] {
  const fields: Array<{ field: SkillFieldDiff['field']; label: string }> = [
    { field: 'name', label: 'Name' },
    { field: 'description', label: 'Description' },
    { field: 'category', label: 'Category' },
    { field: 'status', label: 'Status' },
    { field: 'instructions', label: 'Instructions' },
  ];
  return fields.map(({ field, label }) => {
    const before = String(a[field] ?? '');
    const after = String(b[field] ?? '');
    return { field, label, before, after, changed: before !== after };
  });
}

export function formatSkillDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/**
 * Prototype plain-language → skill draft.
 * In ServiceNow this becomes a Flow / LLM action writing to u_mitra_skill as Draft.
 */
export function generateSkillFromPlainLanguage(prompt: string): {
  name: string;
  description: string;
  category: SkillCategory;
  instructions: string;
} {
  const text = prompt.trim().replace(/\s+/g, ' ');
  const lower = text.toLowerCase();

  let category: SkillCategory = 'Documentation';
  if (/(test|qa|uat|regress)/.test(lower)) category = 'Testing';
  else if (/(script|code|api|client script|business rule|flow designer)/.test(lower)) category = 'Development';
  else if (/(design|workflow|architecture|ux|ui|portal)/.test(lower)) category = 'Design';
  else if (/(brd|story|doc|requirement|runbook)/.test(lower)) category = 'Documentation';

  const firstSentence = text.split(/[.!?]/)[0]?.trim() || text;
  const nameBase = firstSentence.length > 56 ? `${firstSentence.slice(0, 53)}…` : firstSentence;
  const name = nameBase
    .replace(/^(please |can you |i want to |i need |help me |create |build |make )/i, '')
    .replace(/^\w/, (c) => c.toUpperCase()) || 'New Mitra Skill';

  const description =
    text.length > 140 ? `${text.slice(0, 137)}…` : text || 'Skill drafted by Mitra from plain language.';

  const instructions = [
    `You are Mitra executing the skill "${name}".`,
    '',
    'Goal:',
    text,
    '',
    'When run:',
    '1. Clarify any missing ServiceNow context (instance, table, module).',
    '2. Produce structured, actionable ServiceNow-ready output.',
    '3. Call out assumptions, risks, and next steps.',
    '4. Prefer platform-native patterns (Flow Designer, ACLs, Update Sets) over custom workarounds.',
    '',
    `Category focus: ${category}.`,
    `Stay within UNICEF / enterprise ServiceNow delivery standards.`,
  ].join('\n');

  return { name, description, category, instructions };
}

export { SKILL_CATEGORIES };
