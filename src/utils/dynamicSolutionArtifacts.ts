import { SolutionArtifact } from '../types';
import { PHASE_DEFINITIONS, artifactTypeSuffix } from './phaseEngine';

const slug = (solutionId: string) => solutionId.replace(/[^a-z0-9]/gi, '').slice(-8) || 'sol';

/** Progressive phase-scoped deliverables for architect cold-start solutions. */
export function buildDynamicArtifacts(solutionId: string, _title: string): SolutionArtifact[] {
  const s = slug(solutionId);
  const now = new Date().toISOString();
  const artifacts: SolutionArtifact[] = [];

  for (const phaseDef of PHASE_DEFINITIONS) {
    for (const artDef of phaseDef.artifacts) {
      const suffix = artifactTypeSuffix(artDef.type);
      artifacts.push({
        id: `${solutionId}-${suffix}`,
        solutionId,
        type: artDef.type,
        name: artDef.name,
        filingName: `${artDef.filingNameSuffix.replace(/\.(doc|xml|json|js)$/, '')}_${s}${artDef.filingNameSuffix.match(/\.\w+$/)?.[0] ?? '.doc'}`,
        status: 'not_started',
        artifactFormat: artDef.artifactFormat,
        buildStage: artDef.buildStage,
        phase: phaseDef.phase,
        version: '0.1',
        updatedBy: 'Mitra AI',
        updatedAt: now,
      });
    }
  }

  return artifacts;
}

export function isDynamicSolutionId(solutionId: string): boolean {
  return /^sol-(guided|custom|tpl)-/.test(solutionId);
}

/** All architect conversations use the 7-phase engine. */
export function usesPhaseEngine(_solutionId: string): boolean {
  return true;
}
