import {
  RequirementsDocument,
  RequirementsSection,
  StakeholderReview,
  StakeholderSectionComment,
} from '../types';

export const REQUIREMENTS_SECTION_META: Array<{ id: string; title: string; order: number }> = [
  { id: 'project_objective', title: 'Project Name and Objective', order: 1 },
  { id: 'functional_requirements', title: 'Functional Requirements', order: 2 },
  { id: 'non_functional_requirements', title: 'Non-Functional Requirements', order: 3 },
  { id: 'out_of_scope', title: 'Out of Scope', order: 4 },
  { id: 'success_metrics', title: 'Success Metrics', order: 5 },
  { id: 'stakeholders', title: 'Key Stakeholders', order: 6 },
  { id: 'open_questions', title: 'Open Questions', order: 7 },
];

const SECTION_ALIASES: Record<string, string[]> = {
  project_objective: ['project name', 'objective', 'business objective', 'section 1', 'name'],
  functional_requirements: [
    'functional requirements',
    'functional requirement',
    'functional req',
    'features',
    'section 2',
  ],
  non_functional_requirements: [
    'non-functional',
    'non functional',
    'nfr',
    'performance',
    'security requirements',
    'section 3',
  ],
  out_of_scope: ['out of scope', 'scope exclusion', 'exclusions', 'section 4'],
  success_metrics: ['success metrics', 'metrics', 'kpi', 'success criteria', 'section 5'],
  stakeholders: ['stakeholders', 'key stakeholders', 'who', 'section 6'],
  open_questions: ['open questions', 'unclear', 'tbd', 'section 7'],
};

const JARGON_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bACL\b/gi, 'access rules'],
  [/\bACLs\b/gi, 'access rules'],
  [/\bscoped application\b/gi, 'dedicated app area'],
  [/\bServiceNow\b/gi, 'the platform'],
  [/\bHRSD\b/gi, 'HR service delivery'],
  [/\bsn_hr_core\b/gi, 'HR records'],
  [/\bsys_user\b/gi, 'user records'],
  [/\bupdate set\b/gi, 'deployment package'],
  [/\bCOE\b/gi, 'specialist team'],
  [/\bUAT\b/gi, 'user acceptance testing'],
  [/\bNFR\b/gi, 'quality expectations'],
  [/\bSLA\b/gi, 'response-time target'],
  [/\brole-based access\b/gi, 'permission by job role'],
  [/\bdata model\b/gi, 'data structure'],
  [/\bworkflow diagram\b/gi, 'process flow'],
  [/\brole matrix\b/gi, 'who can do what'],
  [/\bscript library\b/gi, 'automation rules'],
];

function truncateObjective(text: string, maxSentences = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, maxSentences).join(' ').trim() || text.slice(0, 240);
}

function extractPeopleRoles(answer: string): string {
  if (answer === 'TBD') return '• Business sponsor — to confirm\n• Process participants — to confirm';
  return answer
    .split(/[.;]\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `• ${s}`)
    .join('\n');
}

function extractRulesAsRequirements(answer: string): string[] {
  if (answer === 'TBD') return [];
  return answer
    .split(/[.;]\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractConstraints(answer: string): {
  nfr: string[];
  outOfScope: string[];
  openQuestions: string[];
} {
  if (answer === 'TBD') {
    return {
      nfr: ['Compliance and integration boundaries — to confirm with stakeholder'],
      outOfScope: [],
      openQuestions: ['Regulatory, security, and technical boundaries not yet specified'],
    };
  }
  const nfr: string[] = [];
  const outOfScope: string[] = [];
  const openQuestions: string[] = [];

  if (/must not|cannot|should not|out of scope|exclude/i.test(answer)) {
    outOfScope.push(answer);
  }
  if (/integrat|comply|regulat|security|gdpr|hipaa|sox|pci/i.test(answer)) {
    nfr.push(answer);
  }
  if (/tbd|unclear|confirm|not sure|unknown/i.test(answer)) {
    openQuestions.push(answer);
  }
  if (nfr.length === 0) nfr.push(answer);
  return { nfr, outOfScope, openQuestions };
}

/** Split Q3 (people + rules + constraints) into doc inputs — demo fallbacks when sparse. */
function parseWorkflowContextAnswer(answer: string): {
  people: string;
  rules: string;
  constraints: string;
} {
  if (answer === 'TBD') {
    return {
      people:
        'Request submitters, process owners who triage and assign work, and approvers for exceptions or spend thresholds',
      rules:
        'Category-based routing with manager approval above defined thresholds; escalate when SLA is at risk',
      constraints:
        'Must integrate with existing identity and HR records; confidential fields restricted by role; no changes to core platform modules outside the dedicated app area',
    };
  }

  const segments = answer
    .split(/(?:\n+|;\s+|(?<=\.)\s+)/)
    .map((s) => s.trim())
    .filter(Boolean);

  const ruleSegments = segments.filter((s) =>
    /approv|threshold|escalat|routing rule|condition|category|sign.?off|delegat/i.test(s),
  );
  const constraintSegments = segments.filter((s) =>
    /integrat|comply|regulat|security|gdpr|hipaa|sox|pci|must not|cannot|boundary|restrict/i.test(s),
  );
  const peopleSegments = segments.filter(
    (s) => !ruleSegments.includes(s) && !constraintSegments.includes(s),
  );

  return {
    people: peopleSegments.length > 0 ? peopleSegments.join('. ') : answer,
    rules: ruleSegments.length > 0 ? ruleSegments.join('. ') : 'TBD',
    constraints: constraintSegments.length > 0 ? constraintSegments.join('. ') : 'TBD',
  };
}

export function buildRequirementsSections(
  projectName: string,
  userMessages: string[],
): RequirementsSection[] {
  const opening = userMessages[0] ?? 'TBD';
  const manualProcess = userMessages[1] ?? 'TBD';
  const workflowContext = userMessages[2] ?? 'TBD';
  const { people, rules, constraints } = parseWorkflowContextAnswer(workflowContext);

  const objective = truncateObjective(opening);
  const ruleLines = extractRulesAsRequirements(rules);
  const { nfr, outOfScope, openQuestions } = extractConstraints(constraints);

  const functionalLines = [
    manualProcess !== 'TBD'
      ? `1. Replace manual steps: ${manualProcess.slice(0, 160)}${manualProcess.length > 160 ? '…' : ''}`
      : '1. Capture and route requests through a dedicated application area',
    '2. Guided intake replacing manual handoffs identified in discovery',
    '3. Assignment and notification when a new request is submitted',
    '4. Status tracking and audit trail on the primary case/request object',
    '5. Role-appropriate views for submitters vs. processors',
    ...ruleLines.map((r, i) => `${6 + i}. Apply rule: ${r}`),
  ];

  const stakeholderBody = [
    extractPeopleRoles(people),
    '• Business Stakeholder — Requirements Document sign-off (Phase 1 gate)',
  ].join('\n');

  const outOfScopeBody = [
    '• Data structure, process flow, access rules, and automation design (Phase 2 — after Requirements approval)',
    '• Core platform upgrades outside the dedicated app area',
    '• Legacy system decommission unless explicitly added later',
    ...outOfScope.map((s) => `• ${s}`),
  ].join('\n');

  const openQuestionsBody =
    openQuestions.length > 0
      ? openQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
      : workflowContext === 'TBD' || rules === 'TBD'
        ? '1. Confirm stakeholder roles and approval thresholds with business owner'
        : '_No open items flagged — review with stakeholder at sign-off._';

  return [
    {
      id: 'project_objective',
      title: 'Project Name and Objective',
      body: `**${projectName}** — ${objective}`,
    },
    {
      id: 'functional_requirements',
      title: 'Functional Requirements',
      body: functionalLines.join('\n'),
    },
    {
      id: 'non_functional_requirements',
      title: 'Non-Functional Requirements',
      body: [
        '• Performance: Responsive form load and list views under expected daily volume',
        '• Security: Permission by job role; confidential fields restricted to authorized roles',
        '• Access: Aligned to organizational identity and access policies',
        ...nfr.map((s) => `• ${s}`),
      ].join('\n'),
    },
    {
      id: 'out_of_scope',
      title: 'Out of Scope',
      body: outOfScopeBody,
    },
    {
      id: 'success_metrics',
      title: 'Success Metrics',
      body: [
        '• Reduce manual handoffs described in discovery by measurable volume or time',
        '• Authorized users complete intake without workarounds',
        '• Business Stakeholder confirms requirements match stated objectives at sign-off',
      ].join('\n'),
    },
    {
      id: 'stakeholders',
      title: 'Key Stakeholders',
      body: stakeholderBody,
    },
    {
      id: 'open_questions',
      title: 'Open Questions',
      body: openQuestionsBody,
    },
  ];
}

export function summarizeAcceptanceCriteria(sections: RequirementsSection[]): string {
  const section = sections.find((s) => s.id === 'success_metrics');
  if (!section?.body) return 'Review success metrics in the Requirements Document.';
  const lines = section.body
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean);
  return lines.slice(0, 3).join(' · ') || section.body.slice(0, 160);
}

export function sectionsToMarkdown(sections: RequirementsSection[], projectName?: string): string {
  const header = projectName
    ? `# Requirements Document — ${projectName}`
    : '# Requirements Document';
  const body = [...sections]
    .sort((a, b) => {
      const ao = REQUIREMENTS_SECTION_META.find((m) => m.id === a.id)?.order ?? 99;
      const bo = REQUIREMENTS_SECTION_META.find((m) => m.id === b.id)?.order ?? 99;
      return ao - bo;
    })
    .map((s, i) => `## ${i + 1}. ${s.title}\n\n${s.body}`)
    .join('\n\n');
  return `${header}\n\n${body}\n\n_Generated from Phase 1 Discovery — Solution Design artifacts require Business Stakeholder approval of this document._`;
}

export function stripJargon(text: string): string {
  let out = text;
  for (const [pattern, replacement] of JARGON_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function toPlainLanguageSections(sections: RequirementsSection[]): RequirementsSection[] {
  return sections.map((s) => ({
    ...s,
    body: stripJargon(s.body),
  }));
}

export function toPlainLanguageSummary(sections: RequirementsSection[]): string {
  return toPlainLanguageSections(sections)
    .map((s) => `${s.title}\n${s.body}`)
    .join('\n\n');
}

export function createRequirementsDocument(
  artifactId: string,
  solutionId: string,
  projectName: string,
  userMessages: string[],
): RequirementsDocument {
  return {
    artifactId,
    solutionId,
    sections: buildRequirementsSections(projectName, userMessages),
    version: '1.0',
    locked: false,
    updatedAt: new Date().toISOString(),
  };
}

export function detectSectionUpdateIntent(prompt: string): string[] {
  const t = prompt.toLowerCase();
  const matched = new Set<string>();

  for (const [sectionId, aliases] of Object.entries(SECTION_ALIASES)) {
    for (const alias of aliases) {
      if (t.includes(alias)) {
        matched.add(sectionId);
      }
    }
  }

  const numbered = t.match(/section\s+(\d+)/g);
  if (numbered) {
    for (const m of numbered) {
      const num = parseInt(m.replace(/\D/g, ''), 10);
      const meta = REQUIREMENTS_SECTION_META.find((s) => s.order === num);
      if (meta) matched.add(meta.id);
    }
  }

  return [...matched];
}

export function isRequirementsSectionUpdatePrompt(prompt: string): boolean {
  const t = prompt.toLowerCase();
  if (detectSectionUpdateIntent(prompt).length > 0) return true;
  return (
    /update|change|revise|edit|adjust|rewrite|modify|regenerate|fix/.test(t) &&
    /requirement|section|objective|stakeholder|metric|scope|functional|non-functional|acceptance/.test(t)
  );
}

function patchFunctionalRequirements(body: string, feedback: string): string {
  const lines = body.split('\n').filter(Boolean);
  const addition = `• ${feedback.trim()} (updated per architect feedback)`;
  if (lines.some((l) => l.includes(feedback.slice(0, 40)))) return body;
  return [...lines, addition].join('\n');
}

function patchBulletSection(body: string, feedback: string): string {
  const addition = `• ${feedback.trim()} (updated per architect feedback)`;
  if (body.includes(feedback.slice(0, 40))) return body;
  return body ? `${body}\n${addition}` : addition;
}

function patchTextSection(body: string, feedback: string): string {
  if (body.includes(feedback.slice(0, 40))) return body;
  return `${body}\n\n${feedback.trim()} (updated per architect feedback)`;
}

export function regenerateRequirementsSections(
  doc: RequirementsDocument,
  sectionIds: string[],
  userFeedback: string,
  userMessages: string[] = [],
): RequirementsDocument {
  if (doc.locked) return doc;

  const ids = sectionIds.length > 0 ? sectionIds : detectSectionUpdateIntent(userFeedback);
  if (ids.length === 0) return doc;

  const fresh = buildRequirementsSections(
    doc.sections.find((s) => s.id === 'project_objective')?.body?.replace(/^\*\*[^*]+\*\*\s*—\s*/, '') ?? 'Project',
    userMessages,
  );

  const nextSections = doc.sections.map((section) => {
    if (!ids.includes(section.id)) return section;

    let body = section.body;
    switch (section.id) {
      case 'functional_requirements':
        body = patchFunctionalRequirements(section.body, userFeedback);
        break;
      case 'non_functional_requirements':
      case 'stakeholders':
      case 'out_of_scope':
      case 'open_questions':
        body = patchBulletSection(section.body, userFeedback);
        break;
      case 'project_objective':
      case 'success_metrics':
        body = patchTextSection(section.body, userFeedback);
        break;
      default:
        body = patchTextSection(section.body, userFeedback);
    }

    if (userFeedback.length > 80 && /replace|rewrite|start over/i.test(userFeedback)) {
      const freshSection = fresh.find((s) => s.id === section.id);
      if (freshSection) body = freshSection.body;
    }

    return { ...section, body };
  });

  const [major, minor] = doc.version.split('.').map((n) => parseInt(n, 10) || 0);
  const nextMinor = minor + 1;

  return {
    ...doc,
    sections: nextSections,
    version: `${major}.${nextMinor}`,
    updatedAt: new Date().toISOString(),
  };
}

export function updateRequirementsSection(
  doc: RequirementsDocument,
  sectionId: string,
  body: string,
): RequirementsDocument {
  if (doc.locked) return doc;
  const [major, minor] = doc.version.split('.').map((n) => parseInt(n, 10) || 0);
  return {
    ...doc,
    sections: doc.sections.map((s) => (s.id === sectionId ? { ...s, body } : s)),
    version: `${major}.${minor + 1}`,
    updatedAt: new Date().toISOString(),
  };
}

export function lockRequirementsDocument(doc: RequirementsDocument): RequirementsDocument {
  return { ...doc, locked: true, updatedAt: new Date().toISOString() };
}

export function unlockRequirementsDocument(doc: RequirementsDocument): RequirementsDocument {
  return { ...doc, locked: false, updatedAt: new Date().toISOString() };
}

export function formatSectionRegenerationMessage(
  sectionIds: string[],
  sections: RequirementsSection[],
): string {
  const titles = sectionIds
    .map((id) => sections.find((s) => s.id === id)?.title ?? id)
    .filter(Boolean);
  if (titles.length === 0) return 'Updated the requested sections in the Requirements Document.';
  if (titles.length === 1) {
    return `Updated **${titles[0]}** only — the rest of the Requirements Document is unchanged. Review the artifact panel and share again when ready.`;
  }
  return `Updated **${titles.join('**, **')}** — other sections unchanged. Review the artifact panel and share again when ready.`;
}

export function parseStakeholderSectionComments(raw?: string): StakeholderSectionComment[] {
  if (!raw?.trim()) return [];
  return raw.split(';').map((part) => {
    const idx = part.indexOf(':');
    if (idx === -1) {
      return { sectionId: 'general', sectionTitle: 'General', text: part.trim() };
    }
    const sectionTitle = part.slice(0, idx).trim();
    const meta = REQUIREMENTS_SECTION_META.find(
      (m) => m.title.toLowerCase() === sectionTitle.toLowerCase(),
    );
    return {
      sectionId: meta?.id ?? sectionTitle.toLowerCase().replace(/\s+/g, '_'),
      sectionTitle,
      text: part.slice(idx + 1).trim(),
    };
  }).filter((c) => c.text);
}

export function formatFlaggedSectionsForArchitect(comments: StakeholderSectionComment[]): string {
  if (comments.length === 0) return 'Please revise the Requirements Document and resubmit.';
  const lines = comments.map(
    (c) => `- **${c.sectionTitle}:** ${c.text}`,
  );
  return [
    '**Stakeholder flagged these sections:**',
    '',
    ...lines,
    '',
    'Tell me what to change in each section — I will regenerate **only the affected sections**, not the whole document.',
  ].join('\n');
}

export function getSectionTitle(sectionId: string): string {
  return REQUIREMENTS_SECTION_META.find((m) => m.id === sectionId)?.title ?? sectionId;
}

export function isRequirementsReview(review: StakeholderReview): boolean {
  const name = review.artifactName.toLowerCase();
  return name.includes('requirement') || !!review.guestSections?.length;
}

export function sortRequirementsSections(sections: RequirementsSection[]): RequirementsSection[] {
  return [...sections].sort((a, b) => {
    const ao = REQUIREMENTS_SECTION_META.find((m) => m.id === a.id)?.order ?? 99;
    const bo = REQUIREMENTS_SECTION_META.find((m) => m.id === b.id)?.order ?? 99;
    return ao - bo;
  });
}

function slugifyTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function matchSectionId(title: string): string {
  const normalized = title.replace(/^\d+\.\s*/, '').trim().toLowerCase();
  const meta = REQUIREMENTS_SECTION_META.find(
    (m) => m.title.toLowerCase() === normalized || m.id === slugifyTitle(normalized),
  );
  if (meta) return meta.id;
  for (const [sectionId, aliases] of Object.entries(SECTION_ALIASES)) {
    if (aliases.some((a) => normalized.includes(a))) return sectionId;
  }
  return slugifyTitle(normalized) || 'section';
}

/** Parse plain-text or lightweight markdown blocks into requirement sections */
export function parseRequirementsText(text: string): RequirementsSection[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const markdownBlocks = trimmed.split(/\n(?=##\s)/);
  if (markdownBlocks.length > 1 || /^##\s/m.test(trimmed)) {
    return markdownBlocks
      .map((block) => {
        const lines = block.trim().split('\n');
        const header = lines[0]?.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim() ?? 'Section';
        const body = lines.slice(1).join('\n').trim();
        return { id: matchSectionId(header), title: header, body };
      })
      .filter((s) => s.body || s.title !== 'Section');
  }

  const blocks = trimmed.split(/\n\n+/);
  const sections: RequirementsSection[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length === 0) continue;
    const first = lines[0].trim();
    if (first.startsWith('#')) continue;

    const knownTitle = REQUIREMENTS_SECTION_META.find(
      (m) => m.title.toLowerCase() === first.toLowerCase(),
    );
    if (knownTitle || (lines.length > 1 && first.length < 80 && !/^\d+\./.test(first))) {
      sections.push({
        id: knownTitle?.id ?? matchSectionId(first),
        title: knownTitle?.title ?? first,
        body: lines.slice(1).join('\n').trim() || first,
      });
      continue;
    }

    sections.push({
      id: `block_${sections.length}`,
      title: 'Overview',
      body: block.trim(),
    });
  }

  if (sections.length === 1 && sections[0].title === 'Overview' && sections[0].body.includes('\n')) {
    const [firstLine, ...rest] = sections[0].body.split('\n');
    if (firstLine.length < 80) {
      return [{ id: matchSectionId(firstLine), title: firstLine, body: rest.join('\n').trim() }];
    }
  }

  return sections;
}

export function resolveReviewSections(
  review: StakeholderReview,
  requirementsDoc?: RequirementsDocument,
): RequirementsSection[] {
  if (review.guestSections?.length) {
    return sortRequirementsSections(toPlainLanguageSections(review.guestSections));
  }
  if (requirementsDoc?.sections.length) {
    return sortRequirementsSections(toPlainLanguageSections(requirementsDoc.sections));
  }
  if (isRequirementsReview(review) && review.summaryText) {
    const parsed = parseRequirementsText(review.summaryText);
    if (parsed.length) {
      return sortRequirementsSections(toPlainLanguageSections(parsed));
    }
  }
  return [];
}

export type SectionBodyLine =
  | { type: 'numbered'; num: number; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'text'; text: string };

export function parseSectionBody(body: string): SectionBodyLine[] {
  const lines = body.split('\n').filter((l) => l.trim());
  return lines.map((line) => {
    const numbered = line.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      return { type: 'numbered' as const, num: parseInt(numbered[1], 10), text: numbered[2].trim() };
    }
    const bullet = line.match(/^[•\-\*]\s+(.*)$/);
    if (bullet) {
      return { type: 'bullet' as const, text: bullet[1].trim() };
    }
    return { type: 'text' as const, text: line.trim() };
  });
}
