import {
  ArtifactStatus,
  ChatMessage,
  DeveloperComment,
  PhaseProgress,
  ProjectPhase,
  RequirementsDocument,
  SolutionArtifact,
  SolutionBlueprint,
  StakeholderReview,
  UserRole,
} from '../types';
import { enrichBlueprintStudio } from './studioHelpers';
import {
  buildDeploymentChecklistPreview,
  buildExecutiveSummaryPreview,
  buildRequirementsDocumentPreview,
  buildRfpPackagePreview,
  buildTestScriptPreview,
  createInitialPhaseProgress,
  deriveCurrentPhase,
  getApproverRoleLabel,
  getPendingGateArtifacts,
  getPhaseDefinition,
  getPhaseLabel,
  artifactEffectiveStatus,
  isFuturePhaseTopic,
  isPhase2DesignTopic,
  personaDepthHint,
  PHASE_DEFINITIONS,
  resolveArtifactId,
  ARCHITECT_OPENING_QUESTION,
} from './phaseEngine';
import { formatSnRecordUpdate, isSendForApprovalAction } from './approvalFlow';
import { tryConversationPreset, tryFailureStateHandler } from './conversationPresets';
import { artifactGeneratedEvent } from './notificationRules';
import { formatArtifactHeader, formatConversationalStatus, formatNumberedSection } from './outputFormat';
import { DemoResponse } from './demoResponseEngine';
import { DISCOVERY_APP_SUGGESTIONS } from '../constants/discoverySuggestions';
import {
  createRequirementsDocument,
  detectSectionUpdateIntent,
  formatSectionRegenerationMessage,
  isRequirementsSectionUpdatePrompt,
  regenerateRequirementsSections,
  sectionsToMarkdown,
} from './requirementsDocument';

export { DISCOVERY_APP_SUGGESTIONS };

const REQUIREMENTS_GENERATION_LINE =
  'I have enough to generate your Requirements Document. Generating now.';

function briefDiscoveryAck(questionIndex: number, lastAnswer: string): string {
  const snippet = lastAnswer.trim().slice(0, 48);
  if (questionIndex === 0) {
    return snippet.length > 12 ? `Got it — that helps frame the scope.` : 'Got it.';
  }
  if (questionIndex === 1) return 'Understood — that clarifies the current process.';
  return 'Clear.';
}

export interface PhaseEngineContext {
  solutionId: string;
  solutionName: string;
  phaseProgress?: PhaseProgress;
  artifacts: SolutionArtifact[];
  statusOverrides: Record<string, ArtifactStatus>;
  userRole?: UserRole;
  developerComments?: DeveloperComment[];
  stakeholderReviews?: StakeholderReview[];
  requirementsDocument?: RequirementsDocument;
}

function getUserMessages(chatHistory: ChatMessage[], currentPrompt: string): string[] {
  return chatHistory
    .filter((m) => m.sender === 'user')
    .map((m) => m.text.trim())
    .filter(Boolean)
    .concat(currentPrompt.trim() ? [currentPrompt.trim()] : [])
    .filter((t, i, arr) => i === arr.length - 1 || arr.indexOf(t) === i);
}

function isRfpExportConfirmation(prompt: string): boolean {
  return /confirm.*(sent|rfp)|rfp.*(sent|exported)|export.*confirm|mark.*sent/i.test(prompt);
}

function isUatSignOffConfirmation(prompt: string): boolean {
  return /uat.*(sign|approv)|sign.?off.*uat|stakeholder.*sign|confirm.*uat/i.test(prompt);
}

function nextArtifactInPhase(
  phase: ProjectPhase,
  solutionId: string,
  phaseProgress: PhaseProgress,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): { defIndex: number; artifactId: string } | null {
  const def = getPhaseDefinition(phase);
  for (let i = 0; i < def.artifacts.length; i++) {
    const artDef = def.artifacts[i];
    const artifactId = resolveArtifactId(solutionId, artDef.type, artifacts);
    const status = artifactEffectiveStatus(artifactId, artifacts, statusOverrides);
    if (status === 'approved') continue;
    const generated = phaseProgress.artifactsGenerated.includes(artifactId) || status !== 'not_started';
    if (!generated) {
      return { defIndex: i, artifactId };
    }
    return { defIndex: i, artifactId };
  }
  return null;
}

function allPhaseArtifactsApproved(
  phase: ProjectPhase,
  solutionId: string,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
  phaseProgress: PhaseProgress,
): boolean {
  if (phase === 4) return phaseProgress.rfpExportConfirmed === true;
  if (phase === 6) {
    return (
      phaseProgress.uatSignOffComplete === true ||
      artifactEffectiveStatus(resolveArtifactId(solutionId, 'test_script', artifacts), artifacts, statusOverrides) ===
        'approved'
    );
  }

  const def = getPhaseDefinition(phase);
  return def.artifacts.every((artDef) => {
    const id = resolveArtifactId(solutionId, artDef.type, artifacts);
    return artifactEffectiveStatus(id, artifacts, statusOverrides) === 'approved';
  });
}

function buildArtifactGenerationMessage(
  projectName: string,
  phase: ProjectPhase,
  artDef: (typeof PHASE_DEFINITIONS)[0]['artifacts'][0],
  artifactId: string,
  userMessages: string[],
  status: ArtifactStatus = 'draft',
): string {
  let preview = '';

  if (artDef.type === 'requirements_doc') {
    preview = buildRequirementsDocumentPreview(projectName, userMessages);
  } else if (artDef.type === 'executive_summary') {
    preview = buildExecutiveSummaryPreview(projectName, userMessages);
  } else if (artDef.type === 'data_model') {
    preview = `\`\`\`xml
<table name="u_${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_case" extends="task">
  <element name="u_category" type="choice" mandatory="true"/>
  <element name="u_assignee" type="reference" reference="sys_user"/>
</table>\`\`\``;
  } else if (artDef.type === 'workflow') {
    preview = 'Intake → Triage → Assignment → Resolution → Closure';
  } else if (artDef.type === 'role_matrix') {
    preview = '| Role | Create | Read | Update | Delete |\n| Agent | ✓ | ✓ | ✓ | — |';
  } else if (artDef.type === 'script_library') {
    preview = 'Client scripts (onLoad) + Business rules (before insert) stubs packaged for dev review.';
  } else if (artDef.type === 'rfp_package') {
    preview = buildRfpPackagePreview(projectName, userMessages);
  } else if (artDef.type === 'test_script') {
    preview = buildTestScriptPreview(projectName, userMessages);
  } else if (artDef.type === 'deployment_checklist') {
    preview = buildDeploymentChecklistPreview(projectName, userMessages);
  }

  const gateNote = artDef.gate.exportOnly
    ? 'Export the package, then confirm you have sent it to vendors to advance.'
    : formatConversationalStatus(
        [],
        `Share for **${getApproverRoleLabel(artDef.gate.approver)}** approval?`,
      );

  return [
    formatArtifactHeader({ name: artDef.name, status, version: 'v1.0' }),
    formatNumberedSection('Required schema', artDef.schemaFields),
    preview ? `### Preview\n\n${preview}\n` : '',
    `### Approval gate\n\n1. **${artDef.gate.label}** — ${getApproverRoleLabel(artDef.gate.approver)}`,
    '',
    gateNote,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildUatLivingTestScriptMessage(
  solutionId: string,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): string {
  const testScriptId = resolveArtifactId(solutionId, 'test_script', artifacts);
  const status = artifactEffectiveStatus(testScriptId, artifacts, statusOverrides);

  return [
    '**Phase 6 — UAT** — Living Test Script',
    '',
    'No new artifact is generated in UAT. We continue with the **Test Script** from Build — updated as scenarios are executed and defects are resolved.',
    '',
    `Current status: **${status.replace('_', ' ')}**`,
    '',
    '**Gate:** Stakeholder UAT sign-off required before Deploy.',
    '',
    'When UAT is complete, confirm stakeholder sign-off or route the living test script for approval.',
  ].join('\n');
}

function buildGateBlockMessage(
  currentPhase: ProjectPhase,
  pending: ReturnType<typeof getPendingGateArtifacts>,
): string {
  const rows = pending
    .map((p) => `| ${p.name} | ${p.status.replace('_', ' ')} | ${p.gate.label} |`)
    .join('\n');
  return [
    `**Phase gate — ${getPhaseLabel(currentPhase)}**`,
    '',
    'We cannot advance until these gates are complete:',
    '',
    '| Artifact | Status | Required approval |',
    '|----------|--------|-------------------|',
    rows,
    '',
    'Complete the outstanding gate, then we will continue.',
  ].join('\n');
}

function stepToBlueprint(
  title: string,
  phase: ProjectPhase,
  status: SolutionBlueprint['status'] = 'discovering',
): SolutionBlueprint {
  const def = getPhaseDefinition(phase);
  return enrichBlueprintStudio({
    id: `bp-phase-${Date.now()}`,
    title,
    description: getPhaseLabel(phase),
    status,
    buildStage: def.studioStages[0] ?? 'scope',
    discoveredRequirements: [],
    architectureSteps: [getPhaseLabel(phase)],
    tables: [],
  });
}

export function getPhaseEngineResponse(
  prompt: string,
  chatHistory: ChatMessage[],
  ctx: PhaseEngineContext,
): DemoResponse {
  const presetCtx = { ...ctx, prompt, chatHistory };

  const preset = tryConversationPreset(presetCtx);
  if (preset) return preset;

  const failure = tryFailureStateHandler(presetCtx);
  if (failure) return failure;

  const userMessages = getUserMessages(chatHistory, prompt);
  const progress = ctx.phaseProgress ?? createInitialPhaseProgress(ctx.solutionId);
  let currentPhase = progress.currentPhase;
  const phaseDef = getPhaseDefinition(currentPhase);
  const personaNote = personaDepthHint(ctx.userRole, currentPhase);
  const questionsComplete = progress.questionIndex >= phaseDef.questions.length;

  if (userMessages.length === 0) {
    return {
      text: ARCHITECT_OPENING_QUESTION,
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, 1),
      phaseProgress: progress,
    };
  }

  if (isFuturePhaseTopic(prompt, currentPhase)) {
    const designDrift = currentPhase === 1 && isPhase2DesignTopic(prompt);
    return {
      text: [
        designDrift
          ? `We're still in **${getPhaseLabel(1)}** — requirements come before solution design.`
          : `We're in **${getPhaseLabel(currentPhase)}** — that topic belongs to a later phase.`,
        '',
        designDrift
          ? 'I will produce the **Requirements Document** only. Data model, workflow, role matrix, and scripts are **Phase 2** — unlocked after a Business Stakeholder approves requirements.'
          : 'Let\'s finish the current phase artifacts and gates first.',
        designDrift && !questionsComplete
          ? `Next discovery question: ${phaseDef.questions[Math.min(progress.questionIndex, phaseDef.questions.length - 1)]?.text ?? 'Continue answering discovery questions.'}`
          : '',
        personaNote,
      ]
        .filter(Boolean)
        .join('\n'),
      isTriage: false,
      choices: designDrift
        ? ['Continue discovery questions', 'Show phase status']
        : ['Continue current phase', 'Show phase status'],
      blueprint: stepToBlueprint(ctx.solutionName, currentPhase),
      phaseProgress: progress,
    };
  }

  const reqArtifactId = resolveArtifactId(ctx.solutionId, 'requirements_doc', ctx.artifacts);
  const reqGenerated =
    progress.artifactsGenerated.includes(reqArtifactId) ||
    artifactEffectiveStatus(reqArtifactId, ctx.artifacts, ctx.statusOverrides) !== 'not_started';
  const reqStatus = artifactEffectiveStatus(reqArtifactId, ctx.artifacts, ctx.statusOverrides);

  if (
    currentPhase === 1 &&
    reqGenerated &&
    reqStatus !== 'approved' &&
    reqStatus !== 'in_review' &&
    ctx.requirementsDocument &&
    !ctx.requirementsDocument.locked &&
    isRequirementsSectionUpdatePrompt(prompt)
  ) {
    const sectionIds = detectSectionUpdateIntent(prompt);
    const updatedDoc = regenerateRequirementsSections(
      ctx.requirementsDocument,
      sectionIds,
      prompt,
      userMessages,
    );
    const patchedIds =
      sectionIds.length > 0 ? sectionIds : detectSectionUpdateIntent(prompt);
    const preview = sectionsToMarkdown(updatedDoc.sections, ctx.solutionName);

    return {
      text: [
        formatSectionRegenerationMessage(patchedIds, updatedDoc.sections),
        '',
        '### Updated preview',
        '',
        preview,
      ].join('\n'),
      isTriage: false,
      choices: ['Share for approval', 'Edit another section', 'Show artifact in panel'],
      blueprint: stepToBlueprint(ctx.solutionName, currentPhase, 'designing'),
      phaseProgress: progress,
      requirementsDocumentUpdate: updatedDoc,
    };
  }

  if (/show phase status|phase status|where are we/i.test(prompt)) {
    const pending = getPendingGateArtifacts(
      currentPhase,
      ctx.solutionId,
      ctx.artifacts,
      ctx.statusOverrides,
      progress,
    );
    const pendingText =
      pending.length > 0
        ? pending.map((p) => `- **${p.name}**: ${p.status} → needs ${p.gate.label}`).join('\n')
        : '_All gates in this phase are cleared._';

    return {
      text: [
        `**Current phase:** ${getPhaseLabel(currentPhase)}`,
        '',
        `Questions answered: ${progress.questionIndex} / ${phaseDef.questions.length}`,
        '',
        '**Pending gates:**',
        pendingText,
        personaNote,
      ]
        .filter(Boolean)
        .join('\n'),
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, currentPhase),
      phaseProgress: progress,
    };
  }

  let updatedProgress = { ...progress };

  if (!questionsComplete) {
    const q = phaseDef.questions[progress.questionIndex];
    const lastAnswer = userMessages[userMessages.length - 1] ?? '';
    const ack = briefDiscoveryAck(progress.questionIndex, lastAnswer);

    updatedProgress = {
      ...progress,
      questionIndex: progress.questionIndex + 1,
    };

    return {
      text: [ack, '', q.text, personaNote].filter(Boolean).join('\n'),
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, currentPhase, 'discovering'),
      phaseProgress: updatedProgress,
    };
  }

  if (currentPhase === 6 && !updatedProgress.uatSignOffComplete) {
    const testScriptId = resolveArtifactId(ctx.solutionId, 'test_script', ctx.artifacts);
    const testStatus = artifactEffectiveStatus(testScriptId, ctx.artifacts, ctx.statusOverrides);

    if (isUatSignOffConfirmation(prompt) || (isSendForApprovalAction(prompt) && testStatus !== 'approved')) {
      if (testStatus !== 'approved') {
        const snText = formatSnRecordUpdate({
          table: 'u_mitra_artifact_approval',
          record: 'Living Test Script — UAT sign-off',
          fromState: testStatus === 'in_review' ? 'In Review' : 'Draft',
          toState: 'Approved',
          updatedBy: 'Stakeholder',
          assignmentGroup: 'Business Stakeholder',
          comments: 'UAT sign-off recorded on living test script.',
        });
        return {
          text: [snText, '', '**UAT sign-off recorded.** Stakeholder approved the living test script — ready to advance to Deploy.'].join(
            '\n',
          ),
          isTriage: false,
          choices: ['Advance to Deploy', 'Show phase status'],
          blueprint: stepToBlueprint(ctx.solutionName, 6),
          phaseProgress: { ...updatedProgress, uatSignOffComplete: true },
          artifactStatusUpdate: { artifactId: testScriptId, status: 'approved' as ArtifactStatus },
        };
      }

      return {
        text: [
          '**UAT sign-off confirmed.** The living test script is approved — we can advance to **Phase 7 — Deploy**.',
        ].join('\n'),
        isTriage: false,
        blueprint: stepToBlueprint(ctx.solutionName, 6),
        phaseProgress: { ...updatedProgress, uatSignOffComplete: true },
      };
    }

    if (!allPhaseArtifactsApproved(currentPhase, ctx.solutionId, ctx.artifacts, ctx.statusOverrides, updatedProgress)) {
      return {
        text: buildUatLivingTestScriptMessage(ctx.solutionId, ctx.artifacts, ctx.statusOverrides),
        isTriage: false,
        choices: ['Share for UAT sign-off', 'Confirm UAT sign-off', 'Show phase status'],
        blueprint: stepToBlueprint(ctx.solutionName, 6),
        phaseProgress: updatedProgress,
      };
    }
  }

  const pendingArtifact = nextArtifactInPhase(
    currentPhase,
    ctx.solutionId,
    updatedProgress,
    ctx.artifacts,
    ctx.statusOverrides,
  );

  if (pendingArtifact) {
    const artDef = phaseDef.artifacts[pendingArtifact.defIndex];
    const status = artifactEffectiveStatus(
      pendingArtifact.artifactId,
      ctx.artifacts,
      ctx.statusOverrides,
    );
    const alreadyGenerated = updatedProgress.artifactsGenerated.includes(pendingArtifact.artifactId);

    if (!alreadyGenerated) {
      updatedProgress = {
        ...updatedProgress,
        artifactsGenerated: [...updatedProgress.artifactsGenerated, pendingArtifact.artifactId],
      };

      const choices = artDef.gate.exportOnly
        ? ['Export RFP package', 'Confirm RFP sent', 'Show artifact in panel']
        : artDef.type === 'requirements_doc'
          ? ['Share for approval', 'Show artifact in panel']
          : ['Share for approval', 'Save as draft', 'Show artifact in panel'];

      const generationText =
        artDef.type === 'requirements_doc'
          ? REQUIREMENTS_GENERATION_LINE
          : buildArtifactGenerationMessage(
              ctx.solutionName,
              currentPhase,
              artDef,
              pendingArtifact.artifactId,
              userMessages,
              'draft',
            );

      return {
        text: generationText,
        isTriage: false,
        choices,
        blueprint: stepToBlueprint(ctx.solutionName, currentPhase, 'designing'),
        phaseProgress: updatedProgress,
        generatedArtifactId: pendingArtifact.artifactId,
        requirementsDocumentUpdate:
          artDef.type === 'requirements_doc'
            ? createRequirementsDocument(
                pendingArtifact.artifactId,
                ctx.solutionId,
                ctx.solutionName,
                userMessages,
              )
            : undefined,
        notifications: artDef.gate.exportOnly
          ? undefined
          : [
              artifactGeneratedEvent(
                artDef.name,
                pendingArtifact.artifactId,
                artDef.gate.approver,
                ctx.solutionName,
              ),
            ],
      };
    }

    if (currentPhase === 4 && artDef.gate.exportOnly && !updatedProgress.rfpExportConfirmed) {
      if (isRfpExportConfirmation(prompt)) {
        return {
          text: [
            '**RFP Package exported and sent.** Architect confirmation recorded — gate cleared for Vendor/RFP.',
            '',
            'We can advance to **Phase 5 — Build** once you are ready.',
          ].join('\n'),
          isTriage: false,
          choices: ['Advance to Build', 'Show phase status'],
          blueprint: stepToBlueprint(ctx.solutionName, 4),
          phaseProgress: { ...updatedProgress, rfpExportConfirmed: true },
        };
      }

      return {
        text: [
          `**${artDef.name}** is ready for export. Download and send to vendors, then confirm when sent.`,
          '',
          'This phase is **export-only** — no reviewer approval is required.',
        ].join('\n'),
        isTriage: false,
        choices: ['Export RFP package', 'Confirm RFP sent', 'Show artifact in panel'],
        blueprint: stepToBlueprint(ctx.solutionName, 4),
        phaseProgress: updatedProgress,
      };
    }

    if (status === 'in_review') {
      return {
        text: [
          `**${artDef.name}** is **In Review** — awaiting ${getApproverRoleLabel(artDef.gate.approver)} approval.`,
          '',
          'Switch to the reviewer persona to approve, or wait for their response. We cannot advance until this gate clears.',
        ].join('\n'),
        isTriage: false,
        choices: ['Check approval status', 'Continue current phase'],
        blueprint: stepToBlueprint(ctx.solutionName, currentPhase),
        phaseProgress: updatedProgress,
      };
    }

    if (status === 'draft' || status === 'pending') {
      if (isSendForApprovalAction(prompt)) {
        const snText = formatSnRecordUpdate({
          table: 'u_mitra_artifact_approval',
          record: `\`${artDef.filingNameSuffix}\` — ${ctx.solutionName}`,
          fromState: 'Draft',
          toState: 'In Review',
          updatedBy: 'Architect',
          assignmentGroup: getApproverRoleLabel(artDef.gate.approver),
          comments: `${artDef.name} routed for ${artDef.gate.label}.`,
        });
        return {
          text: [
            snText,
            '',
            `**${artDef.name}** is now **In Review**. Share link sent to ${getApproverRoleLabel(artDef.gate.approver)}.`,
          ].join('\n'),
          isTriage: false,
          choices: ['Check approval status', 'View artifact panel'],
          blueprint: stepToBlueprint(ctx.solutionName, currentPhase),
          phaseProgress: updatedProgress,
          artifactStatusUpdate: { artifactId: pendingArtifact.artifactId, status: 'in_review' as ArtifactStatus },
        };
      }

      return {
        text: [
          `**${artDef.name}** is in **Draft**. Route it for ${getApproverRoleLabel(artDef.gate.approver)} approval to clear this gate.`,
          personaNote,
        ]
          .filter(Boolean)
          .join('\n'),
        isTriage: false,
        choices:
          artDef.type === 'requirements_doc'
            ? ['Share for approval', 'Show artifact in panel']
            : ['Share for approval', 'Save as draft'],
        blueprint: stepToBlueprint(ctx.solutionName, currentPhase),
        phaseProgress: updatedProgress,
      };
    }
  }

  if (allPhaseArtifactsApproved(currentPhase, ctx.solutionId, ctx.artifacts, ctx.statusOverrides, updatedProgress)) {
    if (currentPhase >= 7) {
      return {
        text: [
          '**All 7 phases complete.** Your solution blueprint is approved through Deploy.',
          '',
          'Artifacts are filed and ready for production. Ask me to refine any deliverable or export the full package.',
        ].join('\n'),
        isTriage: false,
        choices: ['Export full package', 'Refine deployment checklist', 'Start new solution'],
        blueprint: stepToBlueprint(ctx.solutionName, 7, 'completed'),
        phaseProgress: updatedProgress,
      };
    }

    const nextPhase = (currentPhase + 1) as ProjectPhase;
    const nextDef = getPhaseDefinition(nextPhase);
    updatedProgress = {
      ...updatedProgress,
      currentPhase: nextPhase,
      questionIndex: 0,
      phaseStartedAt: new Date().toISOString(),
    };

    return {
      text: [
        `**Gate cleared** — advancing to **${getPhaseLabel(nextPhase)}**.`,
        '',
        nextPhase === 2
          ? 'Requirements approved. Ready to begin solution design. First — which ServiceNow application scope will this live in?'
          : nextDef.questions[0].text,
        personaNote,
      ]
        .filter(Boolean)
        .join('\n'),
      isTriage: false,
      blueprint: stepToBlueprint(ctx.solutionName, nextPhase),
      phaseProgress: updatedProgress,
    };
  }

  const pending = getPendingGateArtifacts(
    currentPhase,
    ctx.solutionId,
    ctx.artifacts,
    ctx.statusOverrides,
    updatedProgress,
  );

  return {
    text: buildGateBlockMessage(currentPhase, pending),
    isTriage: false,
    choices: ['Share for approval', 'Show phase status'],
    blueprint: stepToBlueprint(ctx.solutionName, currentPhase),
    phaseProgress: updatedProgress,
  };
}

export function syncPhaseAfterApproval(
  phaseProgress: PhaseProgress,
  artifacts: SolutionArtifact[],
  statusOverrides: Record<string, ArtifactStatus>,
): PhaseProgress {
  const phase = deriveCurrentPhase(phaseProgress, artifacts, statusOverrides);
  if (phase !== phaseProgress.currentPhase) {
    return {
      ...phaseProgress,
      currentPhase: phase,
      questionIndex: 0,
      phaseStartedAt: new Date().toISOString(),
    };
  }
  return phaseProgress;
}
