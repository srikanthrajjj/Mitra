export { getThinkingDelayMs, thinkingDelay } from './demoThinkingDelay';

/** Interval between local simulated stream ticks. */
export function getStreamTickMs(): number {
  return 22;
}

/** Characters revealed per local stream tick — smaller steps feel smoother with SmoothStreamingText. */
export function getStreamCharsPerTick(textLength: number): number {
  if (textLength > 3000) return 5;
  if (textLength > 1200) return 3;
  return 2;
}

/** Throttle live API chunks before flushing to React state. */
export function getStreamFlushMs(): number {
  return 36;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
