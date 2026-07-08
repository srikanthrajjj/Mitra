import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import {
  THINKING_SNIPPETS_CSS,
  THINKING_SNIPPETS_HTML,
  THINKING_SNIPPETS_JS,
  THINKING_SNIPPETS_REACT,
} from './snippets';
import { Theme } from '../../../../types';
import {
  PhaseStreamThinking,
  TypingDotsThinking,
  ShimmerThinking,
  GlowPulseThinking,
} from './ThinkingVariations';
import './chat-loader.css';
import './thinking-variations.css';

const VARIATION_NOTES = [
  {
    name: 'Grid dots',
    source: '4×2 snake scan — forward then reverse (production)',
    use: 'Default in chat — one dot at a time, slow ping-pong through the grid.',
  },
  {
    name: 'Typing dots',
    source: 'Typing indicator (Slack, iMessage)',
    use: 'Short waits under ~3s before streaming starts.',
  },
  {
    name: 'Shimmer label',
    source: 'Living breadcrumb (background tasks)',
    use: 'Low-attention states — drafting, sorting, background sync.',
  },
  {
    name: 'Glow pulse',
    source: 'Single breathing orb (minimal calm)',
    use: 'Quietest option — one soft pulse, no grid or bouncing dots.',
  },
] as const;

export function ChatLoaderShowcase({ theme }: { theme?: Theme }) {
  return (
    <DevShowcaseShell
      title="Thinking Status"
      description='Four Mitra bot thinking indicators researched from 2025–2026 AI chat UX patterns. Each uses role="status" and aria-live="polite" for accessibility.'
      notes={
        <div className="space-y-4">
          <p>
            Patterns sourced from{' '}
            <span className="text-foreground">Smashing Magazine (AI transparency)</span>,{' '}
            <span className="text-foreground">uxpatterns.dev (AI loading states)</span>, and{' '}
            <span className="text-foreground">aiuxdesign.guide (typing &amp; streaming)</span>.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            {VARIATION_NOTES.map((item) => (
              <li key={item.name}>
                <strong className="text-foreground">{item.name}</strong> — {item.source}.{' '}
                <span className="text-muted-foreground">{item.use}</span>
              </li>
            ))}
            <li>
              Production component:{' '}
              <code className="rounded bg-muted px-1 font-mono text-xs">MitraThinkingIndicator</code>{' '}
              (maps to <em>Grid dots</em>).
            </li>
            {theme ? (
              <li>
                Current app theme: <span className="font-mono text-foreground">{theme}</span>
              </li>
            ) : null}
          </ul>
        </div>
      }
      previews={[
        {
          label: '1 · Grid dots',
          content: (previewTheme) => <PhaseStreamThinking theme={previewTheme} />,
        },
        {
          label: '2 · Typing dots',
          content: (previewTheme) => <TypingDotsThinking theme={previewTheme} />,
        },
        {
          label: '3 · Shimmer label',
          content: (previewTheme) => <ShimmerThinking theme={previewTheme} />,
        },
        {
          label: '4 · Glow pulse',
          content: (previewTheme) => <GlowPulseThinking theme={previewTheme} />,
        },
      ]}
      snippets={{
        html: THINKING_SNIPPETS_HTML,
        css: THINKING_SNIPPETS_CSS,
        js: THINKING_SNIPPETS_JS,
        react: THINKING_SNIPPETS_REACT,
      }}
    />
  );
}
