const DEMO_MODE_KEY = 'USE_LOCAL_ONLY';

/** Demo/simulated responses are on by default (Netlify, offline, and guided demos). */
export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) !== 'false';
}

export function setDemoMode(enabled: boolean): void {
  localStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
}
