/** Canonical tokens from src/index.css */

export type ThemeId = 'dark' | 'blue';

export interface HslToken {
  hsl: string;
  hex: string;
  utility?: string;
}

export interface ThemeTokenSet {
  background: HslToken;
  foreground: HslToken;
  card: HslToken;
  popover: HslToken;
  primary: HslToken;
  secondary: HslToken;
  muted: HslToken;
  mutedForeground: HslToken;
  accent: HslToken;
  border: HslToken;
  input: HslToken;
  ring: HslToken;
  sidebar: HslToken;
  sidebarForeground: HslToken;
  sidebarBorder: HslToken;
}

export const THEME_TOKENS: Record<ThemeId, ThemeTokenSet> = {
  dark: {
    background: { hsl: '210 18% 8%', hex: '#111417', utility: 'bg-background' },
    foreground: { hsl: '210 15% 92%', hex: '#e8eaed', utility: 'text-foreground' },
    card: { hsl: '210 16% 13%', hex: '#1d2227', utility: 'bg-card' },
    popover: { hsl: '210 15% 16%', hex: '#232a30', utility: 'bg-popover' },
    primary: { hsl: '135 66% 52%', hex: '#32d74b', utility: 'bg-primary' },
    secondary: { hsl: '210 14% 16%', hex: '#232a30', utility: 'bg-secondary' },
    muted: { hsl: '210 14% 16%', hex: '#232a30', utility: 'bg-muted' },
    mutedForeground: { hsl: '210 10% 58%', hex: '#8b939a', utility: 'text-muted-foreground' },
    accent: { hsl: '210 14% 18%', hex: '#282f36', utility: 'bg-accent' },
    border: { hsl: '210 12% 24%', hex: '#3a4249', utility: 'border-border' },
    input: { hsl: '210 14% 14%', hex: '#1f252a', utility: 'border-input' },
    ring: { hsl: '135 66% 52%', hex: '#32d74b', utility: 'ring-ring' },
    sidebar: { hsl: '210 16% 11%', hex: '#181c20', utility: 'bg-sidebar' },
    sidebarForeground: { hsl: '210 15% 92%', hex: '#e8eaed', utility: 'text-sidebar-foreground' },
    sidebarBorder: { hsl: '210 12% 22%', hex: '#333a41', utility: 'border-sidebar-border' },
  },
  blue: {
    background: { hsl: '216 25% 7%', hex: '#0d1017', utility: 'bg-background' },
    foreground: { hsl: '210 18% 92%', hex: '#e6e9ec', utility: 'text-foreground' },
    card: { hsl: '218 26% 15%', hex: '#1c2333', utility: 'bg-card' },
    popover: { hsl: '218 24% 13%', hex: '#191f2c', utility: 'bg-popover' },
    primary: { hsl: '135 66% 52%', hex: '#32d74b', utility: 'bg-primary' },
    secondary: { hsl: '218 22% 14%', hex: '#1b212e', utility: 'bg-secondary' },
    muted: { hsl: '218 22% 14%', hex: '#1b212e', utility: 'bg-muted' },
    mutedForeground: { hsl: '215 14% 58%', hex: '#8891a0', utility: 'text-muted-foreground' },
    accent: { hsl: '218 24% 16%', hex: '#1f2636', utility: 'bg-accent' },
    border: { hsl: '215 28% 26%', hex: '#334155', utility: 'border-border' },
    input: { hsl: '218 24% 12%', hex: '#171d29', utility: 'border-input' },
    ring: { hsl: '135 66% 52%', hex: '#32d74b', utility: 'ring-ring' },
    sidebar: { hsl: '215 22% 11%', hex: '#161b22', utility: 'bg-sidebar' },
    sidebarForeground: { hsl: '210 18% 92%', hex: '#e6e9ec', utility: 'text-sidebar-foreground' },
    sidebarBorder: { hsl: '215 32% 24%', hex: '#2a3448', utility: 'border-sidebar-border' },
  },
};

export const MITRA_HEX_SURFACES = {
  brandGreen: { hex: '#32d74b' },
  vrCyan: { hex: '#00c9a0' },
  mitraBg: { dark: '#06080a', blue: '#0e1117' },
  lightCanvas: { hex: '#fafafa' },
} as const;

export const LANDING_TOKENS = {
  heroBg: '#06080a',
  accent: '#32d74b',
  cyan: '#00c9a0',
  purple: '#7c3aed',
} as const;

export const SEMANTIC_TOKEN_ROWS = [
  { key: 'background' as const, label: '--background' },
  { key: 'foreground' as const, label: '--foreground' },
  { key: 'sidebar' as const, label: '--sidebar' },
  { key: 'card' as const, label: '--card' },
  { key: 'primary' as const, label: '--primary' },
  { key: 'border' as const, label: '--border' },
  { key: 'mutedForeground' as const, label: '--muted-foreground' },
  { key: 'ring' as const, label: '--ring' },
] as const;