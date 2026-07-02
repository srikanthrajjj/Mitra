import { useEffect, useState } from 'react';
import { SmoothStreamingText } from '../../../SmoothStreamingText';
import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import {
  STREAMING_TEXT_CSS,
  STREAMING_TEXT_HTML,
  STREAMING_TEXT_JS,
  STREAMING_TEXT_REACT,
} from './snippets';
import { cn } from '@/lib/utils';
import './streaming-text.css';

const SAMPLE = 'Got it — that helps frame the scope. What is the application scope — which modules or features must be in the first release?';

function StreamingCursor({ isDark }: { isDark: boolean }) {
  return (
    <span
      className={cn('stream-cursor', isDark ? 'stream-cursor--dark' : 'stream-cursor--light')}
      aria-hidden
    />
  );
}

function VanillaStreamingPreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState('');

  useEffect(() => {
    setVisible('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(SAMPLE.slice(0, index));
      if (index >= SAMPLE.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [theme]);

  return (
    <div className={cn('chat-response-text max-w-md text-left', isDark ? 'chat-response-text--dark' : 'chat-response-text--light')}>
      <div className="stream-smooth-text stream-smooth-text--active">
        <span className="stream-smooth-text__body">{visible}</span>
        {visible.length < SAMPLE.length ? <StreamingCursor isDark={isDark} /> : null}
      </div>
    </div>
  );
}

export function StreamingTextShowcase() {
  const [stream, setStream] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setStream((value) => !value), 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <DevShowcaseShell
      title="Streaming Text"
      description="Smooth token reveal used while assistant responses stream in ChatView. Pairs stream-smooth-text classes with a breathing cursor."
      previews={[
        {
          label: 'Vanilla HTML + CSS',
          content: (theme) => <VanillaStreamingPreview theme={theme} />,
        },
        {
          label: 'React component (SmoothStreamingText)',
          content: (theme) => (
            <div className={cn('max-w-md text-left', theme === 'dark' ? 'text-slate-200' : 'text-slate-800')}>
              <SmoothStreamingText
                text={SAMPLE}
                isStreaming={stream}
                className="chat-response-text"
                cursor={<StreamingCursor isDark={theme === 'dark'} />}
              />
            </div>
          ),
        },
      ]}
      snippets={{
        html: STREAMING_TEXT_HTML,
        css: STREAMING_TEXT_CSS,
        js: STREAMING_TEXT_JS,
        react: STREAMING_TEXT_REACT,
      }}
    />
  );
}
