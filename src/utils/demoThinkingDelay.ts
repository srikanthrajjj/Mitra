const DELAY_STORAGE_KEY = 'MITRA_THINKING_DELAY_MS';
const ENABLED_STORAGE_KEY = 'MITRA_THINKING_ENABLED';

/** Default demo pause before Mitra responds (ms). */
export const DEFAULT_DEMO_THINKING_MS = 3000;

/** Read configured thinking delay from localStorage, or return default. */
export function getThinkingDelayMs(): number {
  const stored = localStorage.getItem(DELAY_STORAGE_KEY);
  if (stored !== null) {
    const parsed = Number.parseInt(stored, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_DEMO_THINKING_MS;
}

/** Persist custom thinking delay for demo sessions. */
export function setThinkingDelayMs(ms: number): void {
  localStorage.setItem(DELAY_STORAGE_KEY, String(Math.max(0, ms)));
}

/** Thinking delay is on by default for demo flows. Set `MITRA_THINKING_ENABLED=false` to skip. */
export function isThinkingDelayEnabled(): boolean {
  return localStorage.getItem(ENABLED_STORAGE_KEY) !== 'false';
}

export function setThinkingDelayEnabled(enabled: boolean): void {
  localStorage.setItem(ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
}

/** Await the demo thinking pause before appending Mitra's response. */
export async function thinkingDelay(ms?: number): Promise<void> {
  if (!isThinkingDelayEnabled()) return;
  const delayMs = ms ?? getThinkingDelayMs();
  if (delayMs <= 0) return;
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}
