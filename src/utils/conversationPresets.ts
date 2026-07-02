import {
  ArtifactStatus,
  ChatMessage,
  DeveloperComment,
  GateApprover,
  PhaseProgress,
  ProjectPhase,
  SolutionArtifact,
  StakeholderReview,
  UserRole,
} from '../types';
import { PERSONA_TONE_HINTS } from '../constants/personaTone';
import { DemoResponse } from './demoResponseEngine';
import {
  artifactEffectiveStatus,
  createInitialPhaseProgress,
  getApproverRoleLabel,
  getPendingGateArtifacts,
  getPhaseDefinition,
  getPhaseLabel,
  PHASE_DEFINITIONS,
  resolveArtifactId,
} from './phaseEngine';
import { PhaseEngineContext } from './phaseResponseEngine';
import {
  artifactGeneratedEvent,
  complianceRejectionEvent,
  NotificationEvent,
} from './notificationRules';
import {
  formatArtifactHeader,
  formatConversationalStatus,
  formatNumberedSection,
} from './outputFormat';
import { enrichBlueprintStudio } from './studioHelpers';

export interface ConversationPresetContext extends PhaseEngineContext {
  prompt: string;
  chatHistory: ChatMessage[];
  developerComments?: DeveloperComment[];
  stakeholderReviews?: StakeholderReview[];
}

function personaTone(role: UserRole | undefined): string {
  if (!role) return '';
  return PERSONA_TONE_HINTS[role];
}

function gateWaitLabel(sentAt?: string, phaseStartedAt?: string): string {
  const ref = sentAt ?? phaseStartedAt;
  if (!ref) return 'pending';
  const hours = Math.max(1, Math.round((Date.now() - new Date(ref).getTime()) / 3_600_000));
  if (hours < 24) return `${hours}h waiting`;
  const days = Math.round(hours / 24);
  return `${days}d waiting`;
}

function mapPersonaToGate(text: string): GateApprover | null {
  const t = text.toLowerCase();
  if (/stakeholder|business|sponsor/.test(t)) return 'stakeholder';
  if (/developer|dev\b/.test(t)) return 'developer';
  if (/security|compliance/.test(t)) return 'security';
  if (/admin|platform/.test(t)) return 'admin';
  return null;
}

function findArtifactByNameHint(
  hint: string,
  solutionId: string,
  artifacts: SolutionArtifact[],
): { defIndex: number; phase: ProjectPhase; artDef: (typeof PHASE_DEFINITIONS)[0]['artifacts'][0] } | null {
  const norm = hint.toLowerCase().replace(/[_-]/g, ' ');
  for (const phaseDef of PHASE_DEFINITIONS) {
    for (let i = 0; i < phaseDef.artifacts.length; i++) {
      const art = phaseDef.artifacts[i];
      const hay = `${art.name} ${art.type} ${art.filingNameSuffix}`.toLowerCase();
      if (hay.includes(norm) || norm.split(/\s+/).every((w) => w.length > 2 && hay.includes(w))) {
        return { defIndex: i, phase: phaseDef.phase, artDef: art };
      }
    }
  }
  const byFile = artifacts.find((a) => a.filingName.toLowerCase().includes(norm));
  if (byFile) {
    for (const phaseDef of PHASE_DEFINITIONS) {
      const idx = phaseDef.artifacts.findIndex((a) => a.type === byFile.type);
      if (idx >= 0) return { defIndex: idx, phase: phaseDef.phase, artDef: phaseDef.artifacts[idx] };
    }
  }
  return null;
}

function allGatesGreen(
  solutionId: string,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): boolean {
  for (const phaseDef of PHASE_DEFINITIONS) {
    for (const artDef of phaseDef.artifacts) {
      const id = resolveArtifactId(solutionId, artDef.type, artifacts);
      const status = artifactEffectiveStatus(id, artifacts, statusOverrides);
      if (status !== 'approved') return false;
    }
  }
  return true;
}

function listOpenBlockers(
  solutionId: string,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
  phaseProgress: PhaseProgress,
): string[] {
  const rows: string[] = [];
  for (let p = 1; p <= 7; p++) {
    const phase = p as ProjectPhase;
    const pending = getPendingGateArtifacts(phase, solutionId, artifacts, statusOverrides, phaseProgress);
    for (const item of pending) {
      rows.push(
        `${item.name} (${getApproverRoleLabel(item.gate.approver)}) — ${item.status.replace('_', ' ')}`,
      );
    }
  }
  return rows;
}

function pendingActionsForRole(
  role: UserRole,
  ctx: ConversationPresetContext,
  progress: PhaseProgress,
): string[] {
  const actions: string[] = [];
  const gateRole: GateApprover | null =
    role === 'stakeholder' || role === 'sponsor'
      ? 'stakeholder'
      : role === 'developer'
        ? 'developer'
        : role === 'security'
          ? 'security'
          : role === 'admin'
            ? 'admin'
            : null;

  if (gateRole) {
    for (let p = 1; p <= 7; p++) {
      const phase = p as ProjectPhase;
      const pending = getPendingGateArtifacts(
        phase,
        ctx.solutionId,
        ctx.artifacts,
        ctx.statusOverrides,
        progress,
      );
      for (const item of pending) {
        if (item.gate.approver === gateRole || (gateRole === 'stakeholder' && item.gate.approver === 'sponsor')) {
          actions.push(`Review **${item.name}** (${item.status.replace('_', ' ')})`);
        }
      }
    }
  }

  const reviews = ctx.stakeholderReviews?.filter(
    (r) => r.solutionId === ctx.solutionId && r.status === 'awaiting',
  );
  if (reviews?.length && (role === 'stakeholder' || role === 'sponsor')) {
    for (const r of reviews) {
      actions.push(`Respond to **${r.artifactName}** shared for your approval`);
    }
  }

  if (role === 'developer') {
    const open = (ctx.developerComments ?? []).filter((c) => !c.resolved && c.solutionId === ctx.solutionId);
    if (open.length) actions.push(`Resolve ${open.length} flagged conflict(s) in dev review`);
  }

  if (role === 'admin') {
    if (allGatesGreen(ctx.solutionId, ctx.artifacts, ctx.statusOverrides)) {
      actions.push('All gates green — schedule deployment when the instance is ready');
    } else {
      actions.push('Monitor checklist — deployment blocked until all gates clear');
    }
  }

  if (role === 'architect') {
    const blockers = listOpenBlockers(ctx.solutionId, ctx.artifacts, ctx.statusOverrides, progress);
    if (blockers.length) actions.push(`Chase approvals: ${blockers.slice(0, 2).join('; ')}`);
    else actions.push('Advance to the next phase question or generate the next artifact');
  }

  return actions;
}

function countRejections(reviews: StakeholderReview[] | undefined, solutionId: string): number {
  return (reviews ?? []).filter(
    (r) => r.solutionId === solutionId && r.status === 'changes_requested',
  ).length;
}

function isVagueInput(prompt: string, role?: UserRole): boolean {
  const t = prompt.trim().toLowerCase();
  if (/\b(deploy|project status|what'?s blocking|generate|share with|new solution|start project|show conflicts|explain this|what do i need)\b/i.test(t)) {
    return false;
  }
  if (role === 'security' && /\breject\b/i.test(t)) return false;
  if (t.length < 8) return true;
  return /^(help|fix|build|do it|something|anything|idk|not sure|maybe)\b/.test(t) &&
    !/\b(hrsd|onboard|vendor|table|script|deploy|artifact|phase|approve|share|generate)\b/.test(t);
}

function isSkipPhaseIntent(prompt: string): boolean {
  return /\b(skip|jump|move on|next phase|skip phase|bypass)\b/i.test(prompt);
}

function hasConflictingPersonaSignals(
  chatHistory: ChatMessage[],
  reviews: StakeholderReview[] | undefined,
  solutionId: string,
): boolean {
  const recentUser = chatHistory
    .filter((m) => m.sender === 'user')
    .slice(-4)
    .map((m) => m.text.toLowerCase());
  const approved = recentUser.some((t) => /\b(approve|approved|sign off|looks good)\b/.test(t));
  const rejected = recentUser.some((t) => /\b(reject|changes|revise|not approved)\b/.test(t));
  if (approved && rejected) return true;
  const openChanges = (reviews ?? []).some(
    (r) => r.solutionId === solutionId && r.status === 'changes_requested',
  );
  const freshApprove = recentUser.some((t) => /\bapprove\b/.test(t));
  return openChanges && freshApprove;
}

export function tryFailureStateHandler(ctx: ConversationPresetContext): DemoResponse | null {
  const progress = ctx.phaseProgress ?? createInitialPhaseProgress(ctx.solutionId);
  const rejections = countRejections(ctx.stakeholderReviews, ctx.solutionId);

  if (rejections >= 3) {
    return {
      text: formatConversationalStatus(
        [
          `This artifact has been sent back **${rejections} times** — that signals a recurring alignment issue.`,
          'I flagged it for the Architect; a short working session with the reviewer may resolve it faster than another revision cycle.',
        ],
        'Should I schedule a direct conversation with the stakeholder?',
      ),
      isTriage: false,
      choices: ['Contact stakeholder directly', 'Show revision history', 'Continue current phase'],
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if (hasConflictingPersonaSignals(ctx.chatHistory, ctx.stakeholderReviews, ctx.solutionId)) {
    return {
      text: formatConversationalStatus(
        [
          'I detected conflicting signals — an approval phrase alongside open change requests.',
          'Progress is paused until the Architect reconciles reviewer feedback.',
        ],
        'Switch to Architect role to resolve, or ask me to summarize the conflict?',
      ),
      isTriage: false,
      choices: ['Summarize conflict', 'Route to Architect', 'Show pending gates'],
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if (isSkipPhaseIntent(ctx.prompt)) {
    const pending = getPendingGateArtifacts(
      progress.currentPhase,
      ctx.solutionId,
      ctx.artifacts,
      ctx.statusOverrides,
      progress,
    );
    const gateList =
      pending.length > 0
        ? pending.map((p) => `**${p.name}** needs ${getApproverRoleLabel(p.gate.approver)}`).join('; ')
        : 'artifact approvals in this phase';
    return {
      text: formatConversationalStatus(
        [
          `We cannot skip **${getPhaseLabel(progress.currentPhase)}** until gates clear — ${gateList}.`,
          'I can notify the assigned reviewer to chase approval.',
        ],
        'Want me to send a reminder to the reviewer?',
      ),
      isTriage: false,
      choices: ['Chase approval', 'Show phase status', 'Continue current phase'],
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if (isVagueInput(ctx.prompt, ctx.userRole) && ctx.userRole !== 'admin') {
    const phaseDef = getPhaseDefinition(progress.currentPhase);
    const q = phaseDef.questions[progress.questionIndex]?.text;
    const clarify =
      q ??
      'What specific outcome do you need — a new artifact, approval status, or the next phase question?';
    return {
      text: formatConversationalStatus(
        [`Your request was a bit broad for me to produce an artifact safely.`],
        clarify,
      ),
      isTriage: false,
      choices: ['Show phase status', 'Project status', 'Continue current phase'],
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  return null;
}

export function tryConversationPreset(ctx: ConversationPresetContext): DemoResponse | null {
  const norm = ctx.prompt.trim().toLowerCase();
  const progress = ctx.phaseProgress ?? createInitialPhaseProgress(ctx.solutionId);
  const role = ctx.userRole ?? 'architect';
  const tone = personaTone(role);

  if (/\b(what do i need to do|what should i do|my action items|pending for me)\b/i.test(norm)) {
    const actions = pendingActionsForRole(role, ctx, progress);
    const list =
      actions.length > 0
        ? actions.map((a, i) => `${i + 1}. ${a}`).join('\n')
        : '_Nothing pending on your queue right now._';
    return {
      text: [
        `**Your pending actions** (${role})`,
        '',
        list,
        tone ? `\n_${tone}_` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if ((role === 'stakeholder' || role === 'sponsor') && /\b(explain this|explain it|what does this mean)\b/i.test(norm)) {
    const pending = getPendingGateArtifacts(
      progress.currentPhase,
      ctx.solutionId,
      ctx.artifacts,
      ctx.statusOverrides,
      progress,
    );
    const focus = pending[0]?.name ?? 'the current deliverable';
    return {
      text: formatConversationalStatus([
        `**${focus}** summarizes what we plan to build and how work will flow day to day.`,
        'It covers scope, timeline, and expected outcomes — no technical configuration detail.',
        'Your approval confirms the business direction before build starts.',
      ]),
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if (role === 'developer' && /\b(show conflicts|list conflicts|flagged comments)\b/i.test(norm)) {
    const open = (ctx.developerComments ?? []).filter(
      (c) => !c.resolved && c.solutionId === ctx.solutionId,
    );
    if (!open.length) {
      return {
        text: formatConversationalStatus(
          ['No open dev conflicts on this solution.'],
          'Want to review the data model or script library instead?',
        ),
        isTriage: false,
        blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
        phaseProgress: progress,
      };
    }
    const rows = open
      .map(
        (c, i) =>
          `${i + 1}. **${c.section}**${c.lineRef ? ` (${c.lineRef})` : ''} — ${c.severity ?? 'major'}: ${c.text}`,
      )
      .join('\n');
    return {
      text: [`**Flagged conflicts**`, '', rows].join('\n'),
      isTriage: false,
      choices: ['Mark resolved', 'Contact Architect', 'Show phase status'],
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if (role === 'security' && /\breject\b/i.test(norm)) {
    const justificationMatch = ctx.prompt.match(/\breject(?:ion)?:?\s*(.+)/i);
    const justification = justificationMatch?.[1]?.trim();
    const pending = getPendingGateArtifacts(
      progress.currentPhase,
      ctx.solutionId,
      ctx.artifacts,
      ctx.statusOverrides,
      progress,
    );
    const target = pending.find((p) => p.gate.approver === 'security') ?? pending[0];
    if (!justification || justification.length < 12) {
      return {
        text: formatConversationalStatus(
          [
            'Compliance rejection requires a written justification before I block progress.',
          ],
          'What policy or control gap are you rejecting — ACL coverage, data classification, or segregation of duties?',
        ),
        isTriage: false,
        blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
        phaseProgress: progress,
      };
    }
    const artifactName = target?.name ?? 'Role & Permission Matrix';
    const notifications: NotificationEvent[] = [
      complianceRejectionEvent(artifactName, ctx.solutionName, justification),
    ];
    return {
      text: formatConversationalStatus([
        `**${artifactName}** is **rejected** for compliance — ${justification}`,
        'Phase progress is blocked until the Architect revises ACLs and resubmits for Security review.',
      ]),
      isTriage: false,
      notifications,
      blockPhase: true,
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if (role === 'admin' && /\bdeploy\b/i.test(norm)) {
    const blockers = listOpenBlockers(ctx.solutionId, ctx.artifacts, ctx.statusOverrides, progress);
    if (blockers.length) {
      return {
        text: [
          '**Deployment blocked** — gates not green:',
          '',
          ...blockers.map((b, i) => `${i + 1}. ${b}`),
          '',
          'Complete outstanding approvals before promote.',
        ].join('\n'),
        isTriage: false,
        choices: ['Show checklist', 'Notify Architect', 'Show phase status'],
        blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
        phaseProgress: progress,
      };
    }
    return {
      text: formatConversationalStatus(
        ['All gates are green — instance checklist and deployment package are ready.'],
        'Confirm target instance URL and deployment window to proceed?',
      ),
      isTriage: false,
      choices: ['Open deployment checklist', 'Notify team', 'Show phase status'],
      blueprint: stepToBlueprint(ctx.solutionName, 6),
      phaseProgress: progress,
    };
  }

  if (role !== 'architect') return null;

  if (/\b(new solution|start project|start over)\b/i.test(norm)) {
    const fresh = createInitialPhaseProgress(ctx.solutionId);
    const q = getPhaseDefinition(1).questions[0].text;
    return {
      text: formatConversationalStatus(
        [`Starting fresh at **${getPhaseLabel(1)}**.`],
        q,
      ),
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, 1),
      phaseProgress: fresh,
    };
  }

  if (/\b(what'?s blocking|what is blocking|blockers?)\b/i.test(norm)) {
    const rows: string[] = [];
    for (let p = 1; p <= 7; p++) {
      const phase = p as ProjectPhase;
      const pending = getPendingGateArtifacts(
        phase,
        ctx.solutionId,
        ctx.artifacts,
        ctx.statusOverrides,
        progress,
      );
      for (const item of pending) {
        const review = ctx.stakeholderReviews?.find(
          (r) => r.artifactId === item.artifactId && r.status === 'awaiting',
        );
        rows.push(
          `| ${item.name} | ${getApproverRoleLabel(item.gate.approver)} | ${item.status.replace('_', ' ')} | ${gateWaitLabel(review?.sentAt, progress.phaseStartedAt)} |`,
        );
      }
    }
    const table =
      rows.length > 0
        ? ['| Artifact | Reviewer | Status | Wait |', '|----------|----------|--------|------|', ...rows].join('\n')
        : '_No open gates — ready to advance or deploy._';
    return {
      text: [`**Open gates**`, '', table].join('\n'),
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  if (/\bproject status\b/i.test(norm)) {
    const phaseDef = getPhaseDefinition(progress.currentPhase);
    const pending = getPendingGateArtifacts(
      progress.currentPhase,
      ctx.solutionId,
      ctx.artifacts,
      ctx.statusOverrides,
      progress,
    );
    const artifactLines = ctx.artifacts.map((a) => {
      const st = artifactEffectiveStatus(a.id, ctx.artifacts, ctx.statusOverrides);
      return `${a.name}: ${st.replace('_', ' ')}`;
    });
    const next =
      pending[0] != null
        ? `Chase **${pending[0].name}** (${getApproverRoleLabel(pending[0].gate.approver)})`
        : phaseDef.questions[progress.questionIndex]?.text ?? 'Advance to next phase';
    return {
      text: formatConversationalStatus([
        `**Phase:** ${getPhaseLabel(progress.currentPhase)} — questions ${progress.questionIndex}/${phaseDef.questions.length}.`,
        `**Artifacts:** ${artifactLines.slice(0, 4).join('; ') || 'none generated yet'}.`,
        `**Pending approvals:** ${pending.length || 'none'}.`,
        `**Next action:** ${next}.`,
      ]),
      isTriage: false,
      choices: ['Show blocking gates', 'Generate next artifact', 'Share for approval'],
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  const generateMatch = ctx.prompt.match(/\bgenerate\s+(.+)/i);
  if (generateMatch) {
    const hint = generateMatch[1].trim();
    const found = findArtifactByNameHint(hint, ctx.solutionId, ctx.artifacts);
    if (!found) {
      return {
        text: formatConversationalStatus(
          [`I couldn't match **${hint}** to a phase artifact.`],
          'Try requirements document, data model, executive summary, or deployment package?',
        ),
        isTriage: false,
        blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
        phaseProgress: progress,
      };
    }
    if (found.phase > progress.currentPhase) {
      return {
        text: formatConversationalStatus(
          [
            `**${found.artDef.name}** belongs to **${getPhaseLabel(found.phase)}** — we're still in **${getPhaseLabel(progress.currentPhase)}**.`,
          ],
          'Finish current phase gates first, or ask what\'s blocking?',
        ),
        isTriage: false,
        choices: ["What's blocking?", 'Show phase status', 'Continue current phase'],
        blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
        phaseProgress: progress,
      };
    }
    const phaseDef = getPhaseDefinition(found.phase);
    if (found.phase === progress.currentPhase && progress.questionIndex < phaseDef.questions.length) {
      const remaining = phaseDef.questions.length - progress.questionIndex;
      return {
        text: formatConversationalStatus(
          [
            `**${found.artDef.name}** needs **${remaining}** discovery answer(s) before generation.`,
          ],
          phaseDef.questions[progress.questionIndex].text,
        ),
        isTriage: false,
        blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
        phaseProgress: progress,
      };
    }
    const artifactId = resolveArtifactId(ctx.solutionId, found.artDef.type, ctx.artifacts);
    const status = artifactEffectiveStatus(artifactId, ctx.artifacts, ctx.statusOverrides);
    const header = formatArtifactHeader({
      name: found.artDef.name,
      status,
      version: 'v1.0',
    });
    const schemaSection = formatNumberedSection(
      'Required schema',
      found.artDef.schemaFields,
    );
    const notifications: NotificationEvent[] = [
      artifactGeneratedEvent(
        found.artDef.name,
        artifactId,
        found.artDef.gate.approver,
        ctx.solutionName,
      ),
    ];
    return {
      text: [
        header,
        schemaSection,
        `Gate: **${found.artDef.gate.label}** (${getApproverRoleLabel(found.artDef.gate.approver)})`,
        '',
        `Share for **${getApproverRoleLabel(found.artDef.gate.approver)}** approval when ready.`,
      ].join('\n'),
      isTriage: false,
      choices: ['Share for approval', 'Save as draft', 'Show artifact in panel'],
      blueprint: stepToBlueprint(ctx.solutionName, found.phase, 'designing'),
      phaseProgress: {
        ...progress,
        artifactsGenerated: progress.artifactsGenerated.includes(artifactId)
          ? progress.artifactsGenerated
          : [...progress.artifactsGenerated, artifactId],
      },
      generatedArtifactId: artifactId,
      notifications,
    };
  }

  const shareMatch = ctx.prompt.match(/\bshare with\s+(.+)/i);
  if (shareMatch) {
    const persona = mapPersonaToGate(shareMatch[1]);
    const pending = getPendingGateArtifacts(
      progress.currentPhase,
      ctx.solutionId,
      ctx.artifacts,
      ctx.statusOverrides,
      progress,
    );
    const target =
      pending[0] ??
      (ctx.artifacts.length
        ? {
            artifactId: ctx.artifacts[ctx.artifacts.length - 1].id,
            name: ctx.artifacts[ctx.artifacts.length - 1].name,
            gate: { approver: 'stakeholder' as GateApprover, label: 'Business approval' },
            status: artifactEffectiveStatus(
              ctx.artifacts[ctx.artifacts.length - 1].id,
              ctx.artifacts,
              ctx.statusOverrides,
            ),
            generated: true,
          }
        : null);
    if (!target || !persona) {
      return {
        text: formatConversationalStatus(
          ['Name the artifact and persona — e.g. share with stakeholder for approval.'],
          'Which artifact should I route, and to stakeholder, developer, security, or admin?',
        ),
        isTriage: false,
        blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
        phaseProgress: progress,
      };
    }
    const permission = persona === 'stakeholder' || persona === 'sponsor' ? 'approve' : 'comment';
    return {
      text: formatConversationalStatus([
        `Confirming **${target.name}** → **${getApproverRoleLabel(persona)}** with **${permission}** permission.`,
        'Notification sent; artifact status set to In Review.',
      ]),
      isTriage: false,
      notifications: [
        artifactGeneratedEvent(target.name, target.artifactId, persona, ctx.solutionName),
      ],
      artifactStatusUpdate: { artifactId: target.artifactId, status: 'in_review' },
      blueprint: stepToBlueprint(ctx.solutionName, progress.currentPhase),
      phaseProgress: progress,
    };
  }

  return null;
}

function stepToBlueprint(
  title: string,
  phase: ProjectPhase,
  status: DemoResponse['blueprint']['status'] = 'discovering',
): DemoResponse['blueprint'] {
  const def = getPhaseDefinition(phase);
  return enrichBlueprintStudio({
    id: `bp-preset-${Date.now()}`,
    title,
    description: getPhaseLabel(phase),
    status,
    buildStage: def.studioStages[0] ?? 'scope',
    discoveredRequirements: [],
    architectureSteps: [getPhaseLabel(phase)],
    tables: [],
  });
}
