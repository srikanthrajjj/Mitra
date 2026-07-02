export const SIMULATION_INPUT_NOTE = 'Messages are simulated';

/** Shown in the first-visit modal and aria labels */
export const SIMULATION_BANNER = SIMULATION_INPUT_NOTE;

const DISCLAIMER_PATTERN =
  /\n?>?\s*Simulated preview[^\n]*\n?|\n?>?\s*Note:\s*Chat responses are simulated[^\n]*\n?/gi;

/** Strip legacy per-message disclaimers from stored chat text */
export function stripSimulationDisclaimer(text: string): string {
  return text?.replace(DISCLAIMER_PATTERN, '').replace(/\n{3,}/g, '\n\n').trim() ?? '';
}
