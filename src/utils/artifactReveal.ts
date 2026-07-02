import { ChatMessage, PhaseProgress, SolutionArtifact, StudioBuildStage } from '../types';
import { artifactEffectiveStatus } from './phaseEngine';

/** True once the user has sent at least one message in this thread. */
export function hasConversationStarted(chatHistory: ChatMessage[]): boolean {
  return chatHistory.some((m) => m.sender === 'user');
}

/** Completed Mitra replies after the first user message in this thread. */
export function countMitraTurnsForThread(chatHistory: ChatMessage[]): number {
  const firstUserIdx = chatHistory.findIndex((m) => m.sender === 'user');
  if (firstUserIdx === -1) return 0;
  return chatHistory
    .slice(firstUserIdx)
    .filter((m) => m.sender === 'mitra' && m.text.trim().length > 0)
    .length;
}

export function getRevealedArtifacts(
  artifacts: SolutionArtifact[],
  mitraTurnCount: number,
  _blueprintStage?: StudioBuildStage,
  phaseProgress?: PhaseProgress,
  statusOverrides: Record<string, import('../types').ArtifactStatus> = {},
): SolutionArtifact[] {
  if (mitraTurnCount === 0) return [];

  if (phaseProgress) {
    // Phase 1: progressive reveal — Requirements Document only until phase advances
    if (phaseProgress.currentPhase === 1) {
      return artifacts.filter((artifact) => {
        if (artifact.type !== 'requirements_doc') return false;
        if (phaseProgress.artifactsGenerated.includes(artifact.id)) return true;
        const status = artifactEffectiveStatus(artifact.id, artifacts, statusOverrides);
        return status !== 'not_started';
      });
    }

    return artifacts.filter((artifact) => {
      if (phaseProgress.artifactsGenerated.includes(artifact.id)) return true;
      const status = artifactEffectiveStatus(artifact.id, artifacts, statusOverrides);
      if (status !== 'not_started') return true;
      if (artifact.phase !== undefined && artifact.phase < phaseProgress.currentPhase) {
        return true;
      }
      // Phase 6 UAT: reveal living test script from Build without regenerating
      if (
        phaseProgress.currentPhase === 6 &&
        artifact.type === 'test_script' &&
        phaseProgress.questionIndex > 0
      ) {
        return true;
      }
      return false;
    });
  }

  return artifacts.filter((artifact) => {
    const turnThreshold = artifact.revealAfterTurn ?? 1;
    return mitraTurnCount >= turnThreshold;
  });
}
