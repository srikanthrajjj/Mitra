import { ChatMessage, PhaseProgress, SolutionArtifact, UserRole, ArtifactStatus, DeveloperComment, StakeholderReview, RequirementsDocument } from '../types';
import { getDemoResponse } from './demoResponseEngine';

export interface MitraResponseContext {
  solutionId?: string;
  phaseProgress?: PhaseProgress;
  artifacts?: SolutionArtifact[];
  statusOverrides?: Record<string, ArtifactStatus>;
  userRole?: UserRole;
  developerComments?: DeveloperComment[];
  stakeholderReviews?: StakeholderReview[];
  requirementsDocument?: RequirementsDocument;
}

/** Demo/simulated architect responses — 7-phase, one question per turn. */
export function getMitraResponse(
  prompt: string,
  currentSolutionName: string,
  chatHistory: ChatMessage[],
  context?: MitraResponseContext,
) {
  return getDemoResponse(prompt, currentSolutionName, chatHistory, context);
}
