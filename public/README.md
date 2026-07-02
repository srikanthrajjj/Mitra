# Public assets

| File | Purpose |
|------|---------|
| `logo.png` | Sidebar fallback logo |
| `mitra-logo.png` | Primary static Mitra mark |
| `mitra-logo-static.png` | Alias of `mitra-logo.png` |
| `favicon.png` | Browser tab icon (64×64) |

The app imports logo assets from `src/assets/` in components; `public/` copies are used at deploy time. Animation is CSS-driven via `MitraLogo` (`animated` prop), not a GIF.
