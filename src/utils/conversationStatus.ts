import { ChatMessage, Solution } from '../types';

export type ConversationIndicatorStatus = 'active' | 'failed' | 'awaiting' | 'idle';

export interface ConversationStatusOptions {
  generatingSolutionId?: string | null;
}

function lastMitraMessage(history: ChatMessage[]): ChatMessage | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].sender === 'mitra') return history[i];
  }
  return undefined;
}

function isErrorResponse(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('build failed') ||
    lower.includes('generation failed') ||
    lower.includes('something went wrong') ||
    lower.startsWith('error:')
  );
}

function isBuildInProgress(solution: Solution, generatingSolutionId?: string | null): boolean {
  if (solution.isLoading) return true;
  if (generatingSolutionId && solution.id === generatingSolutionId) return true;
  return false;
}

function hasFailedGeneration(solution: Solution): boolean {
  if (solution.isLoading) return false;
  if (solution.generationError) return true;
  const lastMitra = lastMitraMessage(solution.chatHistory);
  if (!lastMitra) return false;
  if (lastMitra.text.trim() && isErrorResponse(lastMitra.text)) return true;
  const hasContent =
    lastMitra.text.trim().length > 0 ||
    (lastMitra.choices?.length ?? 0) > 0 ||
    (lastMitra.todos?.length ?? 0) > 0;
  return !hasContent && solution.chatHistory.some((m) => m.sender === 'user');
}

function isAwaitingUserResponse(solution: Solution): boolean {
  if (solution.isLoading) return false;
  const lastMitra = lastMitraMessage(solution.chatHistory);
  if (!lastMitra) return false;
  if (lastMitra.choices?.length && !lastMitra.selectedChoice) return true;
  return false;
}

export function deriveConversationStatus(
  solution: Solution,
  options: ConversationStatusOptions = {},
): ConversationIndicatorStatus {
  if (solution.chatHistory.length === 0) return 'idle';
  if (isBuildInProgress(solution, options.generatingSolutionId)) return 'active';
  if (hasFailedGeneration(solution)) return 'failed';
  if (isAwaitingUserResponse(solution)) return 'awaiting';
  if (solution.projectStatus === 'building') return 'active';
  if (solution.projectStatus === 'in_review') return 'awaiting';
  return 'idle';
}

export const conversationStatusLabel: Record<ConversationIndicatorStatus, string> = {
  active: 'Active',
  failed: 'Failed',
  awaiting: 'Awaiting response',
  idle: 'Ready',
};
