import { ChatMessage, UserRole } from '../types';

export interface PhaseChatContext {
  currentPhase: number;
  phaseLabel: string;
  questionIndex: number;
  userRole: UserRole;
  pendingGateCount: number;
}

interface StreamChatParams {
  prompt: string;
  chatHistory: ChatMessage[];
  currentSolutionName: string;
  model: string;
  apiKey?: string;
  phaseContext?: PhaseChatContext;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}

export async function streamServiceNowChat({
  prompt,
  chatHistory,
  currentSolutionName,
  model,
  apiKey,
  phaseContext,
  onChunk,
  onDone,
  onError,
  signal,
}: StreamChatParams): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-use-local-only': 'false',
  };
  if (apiKey?.trim()) {
    headers['x-gemini-api-key'] = apiKey.trim();
  }

  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, chatHistory, currentSolutionName, model, phaseContext }),
    signal,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.details || `Stream failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming is not supported in this browser.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = JSON.parse(line.slice(6)) as {
          text?: string;
          done?: boolean;
          error?: string;
        };

        if (payload.error) {
          throw new Error(payload.error);
        }
        if (payload.text) {
          onChunk(payload.text);
        }
        if (payload.done) {
          onDone();
          return;
        }
      }
    }
    onDone();
  } catch (err) {
    if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) return;
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
