import { useEffect, useState } from 'react';
import MitraThinkingIndicator from '../../../MitraThinkingIndicator';
import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import {
  CHAT_LOADER_CSS,
  CHAT_LOADER_HTML,
  CHAT_LOADER_JS,
  CHAT_LOADER_REACT,
  CHAT_LOADER_STEPS,
} from './snippets';
import { Theme } from '../../../../types';
import { cn } from '@/lib/utils';
import './chat-loader.css';

function VanillaChatLoaderPreview({ theme }: { theme: 'dark' | 'light' }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFading(false);
  }, [theme]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((current) => Math.min(current + 1, CHAT_LOADER_STEPS.length - 1));
        setFading(false);
      }, 220);
    }, 1600);

    return () => window.clearInterval(intervalId);
  }, []);

  const progress = Math.min(100, Math.round(((index + 1) / CHAT_LOADER_STEPS.length) * 100));

  return (
    <div
      className={cn(
        'mitra-chat-loader',
        theme === 'dark' ? 'mitra-chat-loader--dark' : 'mitra-chat-loader--light',
      )}
      role="status"
      aria-live="polite"
      aria-label="Mitra is thinking"
    >
      <div className="mitra-chat-loader__body">
        <div className="mitra-chat-loader__row">
          <span className="mitra-chat-loader__pulse" aria-hidden="true">
            <span className="mitra-chat-loader__pulse-ring" />
            <span className="mitra-chat-loader__pulse-dot" />
          </span>
          <p
            className={cn(
              'mitra-chat-loader__phrase',
              !fading && 'mitra-chat-loader__phrase--enter',
              fading && 'mitra-chat-loader__phrase--fading',
            )}
          >
            {CHAT_LOADER_STEPS[index]}...
          </p>
        </div>
        <div className="mitra-chat-loader__track" aria-hidden="true">
          <div className="mitra-chat-loader__fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export function ChatLoaderShowcase({ theme }: { theme?: Theme }) {
  return (
    <DevShowcaseShell
      title="Chat Loader"
      description="Animated thinking indicator used while Mitra processes a request. Includes a pulsing status dot, cycling phrase, and progress bar."
      notes={
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Use <code className="rounded bg-muted px-1 font-mono text-xs">context=&quot;architect&quot;</code> in chat views.
          </li>
          <li>
            Vanilla CSS lives in{' '}
            <code className="rounded bg-muted px-1 font-mono text-xs">src/components/dev/components/chat-loader/chat-loader.css</code>.
          </li>
          {theme ? (
            <li>
              Current app theme: <span className="font-mono text-foreground">{theme}</span>
            </li>
          ) : null}
        </ul>
      }
      previews={[
        {
          label: 'Vanilla HTML + CSS',
          content: (previewTheme) => <VanillaChatLoaderPreview theme={previewTheme} />,
        },
        {
          label: 'React component (MitraThinkingIndicator)',
          content: (previewTheme) => (
            <MitraThinkingIndicator theme={previewTheme === 'dark' ? 'dark' : 'light'} context="architect" />
          ),
        },
      ]}
      snippets={{
        html: CHAT_LOADER_HTML,
        css: CHAT_LOADER_CSS,
        js: CHAT_LOADER_JS,
        react: CHAT_LOADER_REACT,
      }}
    />
  );
}
