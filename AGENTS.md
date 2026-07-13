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

## Build & Verify

After any component change, run:
```bash
npm run lint
```
This runs `tsc --noEmit` and must pass before committing.
