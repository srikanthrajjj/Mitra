import type { ResolvedTheme, Theme } from '../types';

export const THEME_STORAGE_KEY = 'MITRA_THEME';

export function readThemePreference(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'blue' || saved === 'system') {
    return saved;
  }
  return 'dark';
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** System dark maps to blue for a distinct IDE-style look; system light uses light. */
export function resolveTheme(preference: Theme, systemDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemDark ? 'blue' : 'light';
  return preference;
}

export function isDarkTheme(theme: ResolvedTheme | Theme): boolean {
  if (theme === 'system') return getSystemPrefersDark();
  return theme !== 'light';
}

export function portalThemeClass(theme: ResolvedTheme): ResolvedTheme {
  return theme;
}
