# Mitra — Agent Guidelines

## Color System — MANDATORY

Only use these Tailwind classes for colors. **NEVER** use hardcoded hex values, `slate-*`, `zinc-*`, `emerald-*`, or any other raw color classes.

### Backgrounds
| Class | Usage |
|---|---|
| `bg-background` | Page/viewport background |
| `bg-card` | Card, panel, modal background |
| `bg-muted` | Subtle/muted backgrounds, chips, badges |
| `bg-mitra-surface` | Elevated surface (dropdowns, popovers) |
| `bg-mitra-input` | Input field backgrounds |
| `bg-mitra-sidebar` | Sidebar background |
| `bg-mitra-highlight` | Highlighted/active row background |
| `bg-brand-green` | Primary action button fill |
| `bg-brand-green/xx` | Primary action with opacity |

### Text
| Class | Usage |
|---|---|
| `text-foreground` | Primary text (headings, body, labels) |
| `text-muted-foreground` | Secondary/muted text (descriptions, placeholders) |
| `text-brand-green` | Primary accent text (active states, links) |
| `text-brand-green-hover` | Hover state for accent text |

### Borders
| Class | Usage |
|---|---|
| `border-border` | Default borders on cards, inputs, dividers |
| `border-mitra-border` | Surface borders (dropdowns, popovers) |

### Hover States
| Class | Usage |
|---|---|
| `hover:bg-accent` | Hover background for interactive elements |
| `hover:text-foreground` | Hover text for interactive elements |
| `hover:text-brand-green` | Hover for accent/primary elements |
| `hover:border-border` | Hover border for interactive elements |

### Shadows (allowed raw values)
Shadows may use raw `shadow-[...]` values — these are structural, not color-system.

### Dark / Light Switching

When dark and light modes need different tokens, use `isDark` ternaries with **only** the tokens above:

```tsx
className={cn(
  'rounded-xl border p-4',
  isDark
    ? 'bg-mitra-surface border-mitra-border text-foreground'
    : 'bg-card border-border text-foreground',
)}
```

If both branches resolve to the same token, collapse to a single class:

```tsx
// Before (redundant)
className={isDark ? 'text-foreground' : 'text-foreground'}
// After
className="text-foreground"
```

### Forbidden Patterns

- `bg-white`, `bg-black` → use `bg-background`, `bg-card`, `bg-muted`
- `text-slate-*`, `text-zinc-*` → use `text-foreground` or `text-muted-foreground`
- `bg-slate-*`, `bg-zinc-*` → use `bg-card`, `bg-muted`, `bg-mitra-surface`
- `border-slate-*`, `border-zinc-*` → use `border-border` or `border-mitra-border`
- `text-emerald-*`, `bg-emerald-*`, `border-emerald-*` → use `text-brand-green`, `bg-brand-green`, `border-border`
- Any hardcoded hex like `#ffffff`, `#f8fafc`, `#e2e8f0` → use CSS variable tokens

## Typography

| Element | Font | Class |
|---|---|---|
| H1, H2 | Manrope | `font-display` |
| H3, H4, Body | IBM Plex Sans | `font-sans` (default) |
| Code, Mono | IBM Plex Mono | `font-mono` |

## Component Library (`src/components/dev/`)

Copy-paste-ready components with live preview at `/dev`. Always use these instead of building from scratch.

| Component | Path | Usage |
|---|---|---|
| Chat Bubble | `src/components/dev/chat-bubble/` | User/assistant message layout with avatar |
| Todo Card | `src/components/dev/todo-card/` | Build-plan checklist in assistant messages |
| Streaming Text | `src/components/dev/streaming-text/` | Token reveal with breathing cursor |
| Entry Chips | `src/components/dev/entry-chips/` | Cold-start prompt chips for new conversations |
| Chat Loader | `src/components/dev/chat-loader/` | 4 thinking indicator variants (grid dots, typing dots, shimmer, glow pulse) |

### Usage Rules
- Always pass `isDark` prop using `isDarkTheme(theme)` from `src/utils/theme.ts`
- Portaled UI (modals, dropdowns) must be wrapped with `.light`, `.dark`, or `.blue` class
- Use CSS classes from component files, not custom inline styles

## Design System Docs (`styleguide/`)

Canonical source for all design decisions. Reference before building any new UI.

### Foundations
- `styleguide/foundations/colors.md` — Color tokens, brand colors, theme switching
- `styleguide/foundations/elevation.md` — Layer stack, shadows, border radius
- `styleguide/foundations/spacing.md` — Panel sizes, gutters, layout constants
- `styleguide/foundations/typography.md` — Font stacks, sizes, weights

### Components
- `styleguide/components/buttons.md` — Button variants, `.btn-dark-primary`, accent utilities
- `styleguide/components/badges-chips.md` — Status dots, folder badges, phase chips
- `styleguide/components/cards-panels.md` — Artifact panel, settings, glass panels
- `styleguide/components/chat-composer.md` — Composer grid, welcome block, thinking indicator
- `styleguide/components/forms-inputs.md` — Settings rows, theme control, focus rings
- `styleguide/components/modals-toasts.md` — Modal patterns, z-index stack
- `styleguide/components/role-switcher.md` — Persona dropdown, storage key
- `styleguide/components/sidebar.md` — Sidebar chrome, nav items, collapsed state
- `styleguide/components/artifact-file-list.md` — File list rows, active states, preview

### Patterns
- `styleguide/patterns/dark-mode.md` — Theme resolution (Light, Dark, Blue, System)
- `styleguide/patterns/persona-views.md` — 7 role-specific layouts
- `styleguide/patterns/phase-badges.md` — PhaseChip, BuildStageChip
- `styleguide/patterns/servicenow-aesthetic.md` — Enterprise file-list patterns

### Copy-Paste
- `styleguide/copy-paste/component-checklist.md` — Pre-ship checklist
- `styleguide/copy-paste/snippets.css` — Reusable CSS from `src/index.css`

## Component Conventions

### File Lists (ServiceNow Aesthetic)
- Use `.sn-list-row` for all file-list rows
- Active row: green left border + accent fill
- Typography: `.artifact-row-title` (12px), `.artifact-row-meta` (10px), `.artifact-row-filing.sn-mono` (9px mono)

### Sidebar Navigation
- Use `.architect-nav-item` pattern for nav items
- Active: green left border + `bg-brand-green/10` (dark) or `bg-muted` (light)
- Badge: `.architect-nav-badge` with `bg-muted text-muted-foreground text-[10px]`

### Artifact Panels
- Use `.artifact-row-*` typography classes
- Panel: `.artifact-panel` with `font-size: 12px`, `line-height: 1.35`
- Preview: `.artifact-doc-preview-paper` for print-like styling

### Focus Rings
- Always use: `hsl(var(--ring) / 0.5)` green
- Avatar thinking: 0.5px green ring

### Default Font Size
- Level 3 = **14px** effective body
- Font size array: `[11, 12, 13, 14, 15, 16]`

## Elevation Rules

| Layer | Class | Usage |
|---|---|---|
| Canvas | `bg-light-canvas` / `bg-dark-canvas` | Main workspace background |
| Sidebar | `bg-sidebar` | Left sidebar |
| Card | `bg-card` | Cards, panels |
| Popover | `bg-popover` | Dropdowns, tooltips |
| Glass | `glass-panel-light` / `glass-panel-dark` | Elevated modals |
| HUD | `vr-glass-surface` | VR-style overlays |

### Shadows
| Class | Usage |
|---|---|
| `box-glow-green` | Subtle green glow on preview cards |
| `active-glow-dark` / `active-glow-light` | Selected choice cards |
| `accent-neon-glow` | `box-shadow: 0 0 12px rgba(0, 201, 160, 0.12)` |

## CTA Patterns — MANDATORY

### Primary CTA
```tsx
import { Button } from '@/src/components/ui/button';

<Button variant="cta" size="sm">Label</Button>
```
- Black text (`#030d0a`) on green background
- Hover: `bg-brand-green-hover`
- Active: `scale-[0.98]`

### Ghost CTA (`.btn-dark-primary`)
- Dark: gradient surface with white/0.06 border
- Light: white gradient with `#e2e8f0` border
- Hover: green border tint `rgba(50,215,75,0.35)`

### Rules
- **NEVER** use `bg-brand-green text-white` — always `variant="cta"`
- **NEVER** use hardcoded hex for button colors
- Use `variant="cta"` for all primary actions
- Use `variant="ghost"` or `variant="secondary"` for neutral actions

## Build & Verify

After any component change, run:
```bash
npm run lint
```
This runs `tsc --noEmit` and must pass before committing.
