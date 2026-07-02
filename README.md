# Mitra AI Architect

Persona-based ServiceNow solution design workspace — discovery chat, artifact generation, multi-role review, and deployment gates.

## Run locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Set `GEMINI_API_KEY` in `.env.local` (free key at [Google AI Studio](https://aistudio.google.com/apikey)).
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Opens at **http://localhost:3001/test/** by default.

### Dev configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `MITRA_PORT` / `PORT` | `3001` | Dev server port (avoids conflict with apps on 3000) |
| `MITRA_DEV_BASE` | `/test/` | SPA base path in development |
| `GEMINI_API_KEY` | — | Gemini API for live LLM responses |

## Personas

| Role | Primary experience |
|------|-------------------|
| **Business Owner** | Upload or chat with Mitra → user stories & process flow |
| **Architect** | 3-question discovery → artifacts panel, workflow stepper, Projects browser |
| **Stakeholder** | Artifact review & approval |
| **Developer** | Technical review of shared artifacts |
| **Admin** | Deployment checklist & instance promotion |
| **Security** | Security/compliance review |
| **Sponsor** | Executive sign-off |

Switch roles via the role switcher in the left sidebar header.

## Key features (shipped)

- **Architect discovery** — 3 focused questions, then Requirements Document generation
- **Artifact panel** — Artifacts \| Status tabs, resizable/collapsible right sidebar, workflow stepper
- **Projects browser** — Box-style folder tree always visible in architect sidebar
- **Settings** — ChatGPT-style layout; Light / Dark / Blue / System themes (default **Light**, **14px** font)
- **Mitra thinking** — Rotating status phrases with ~3s delay before responses; animated logo while thinking
- **Mitra logo** — Static PNG by default; GIF on thinking and brief nav pulse every 4 minutes
- **Design feedback** — Floating widget; Admin role can view recent submissions
- **What's New** — Six-item welcome modal after sign-in (dismissible via localStorage)

**Not in current build:** full-screen Developer Workspace 3-column layout, 5-question discovery flow, Search in architect nav, folder status badges in sidebar.

## Design system

- In-app: open **Styleguide** from the account menu (or `/styleguide` route)
- Markdown reference: [`styleguide/`](./styleguide/README.md)
- Tokens & utilities: [`src/index.css`](./src/index.css)

## Build & deploy

```bash
npm run build          # Production build (base `/`)
npm run build:test     # Dev-feature build (base `/test/`)
npm run build:netlify  # Dual deploy: stable at `/`, latest at `/test/`
```

| Target | Details |
|--------|---------|
| **GitHub** | [Mitra-ai](https://github.com/srikanthrajjj/Mitra-ai) repository |
| **Netlify** | `mitra-v2` (stable `/`), `mitraaibot` (development `/test/`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Express + Vite dev server on port 3001 |
| `npm run lint` | `tsc --noEmit` type check |
| `npm start` | Run production server from `dist/` |
