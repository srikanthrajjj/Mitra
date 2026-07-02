import { MitraLogo } from '../../../MitraLogo';
import { DevShowcaseShell } from '../../shared/DevShowcaseShell';
import { CHAT_BUBBLE_CSS, CHAT_BUBBLE_HTML, CHAT_BUBBLE_REACT } from './snippets';
import { cn } from '@/lib/utils';
import './chat-bubble.css';

function VanillaChatPreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="mitra-chat-message mitra-chat-message--user">
        <div className={cn('mitra-chat-avatar', isDark ? 'mitra-chat-avatar--user-dark' : 'mitra-chat-avatar--user-light')}>
          SR
        </div>
        <div className="mitra-chat-bubble-wrap">
          <div className={cn('mitra-chat-bubble', isDark ? 'mitra-chat-bubble--user-dark' : 'mitra-chat-bubble--user-light')}>
            I want to build a ServiceNow application for HR ticketing.
          </div>
        </div>
      </div>

      <div className="mitra-chat-message mitra-chat-message--assistant">
        <div className="mitra-chat-avatar mitra-chat-avatar--assistant">
          <MitraLogo className="h-5 w-5 opacity-90" />
        </div>
        <div className="mitra-chat-bubble-wrap">
          <div className={cn('mitra-chat-bubble', isDark ? 'mitra-chat-bubble--assistant-dark' : 'mitra-chat-bubble--assistant-light')}>
            Got it — that helps frame the scope.
          </div>
        </div>
      </div>
    </div>
  );
}

function ReactChatPreview({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="group relative ml-auto flex max-w-3xl flex-row-reverse gap-4 chat-message-entry">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
            isDark
              ? 'border border-white/[0.08] bg-mitra-surface text-brand-green'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700',
          )}
        >
          SR
        </div>
        <div className="max-w-[85%]">
          <div
            className={cn(
              'break-words font-medium',
              isDark
                ? 'rounded-2xl border border-white/[0.08] bg-mitra-highlight/80 px-4 py-3 text-slate-50'
                : 'rounded-[20px] rounded-tr-[4px] border border-emerald-200/60 bg-emerald-50 px-5 py-3 text-slate-900',
            )}
          >
            I want to build a ServiceNow application for HR ticketing.
          </div>
        </div>
      </div>

      <div className="group relative mr-auto flex max-w-3xl gap-4 chat-message-entry">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-transparent">
          <MitraLogo className="h-5.5 w-5.5 opacity-90" />
        </div>
        <div className="max-w-[85%]">
          <div className={cn('break-words', isDark ? 'text-slate-200' : 'text-slate-800')}>
            Got it — that helps frame the scope.
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatBubbleShowcase() {
  return (
    <DevShowcaseShell
      title="Chat Bubble"
      description="Message row layout from ChatView: user bubbles are right-aligned with initials avatar; Mitra responses are left-aligned with logo avatar and flat text."
      previews={[
        {
          label: 'Vanilla HTML + CSS',
          content: (theme) => <VanillaChatPreview theme={theme} />,
        },
        {
          label: 'React markup (ChatView classes)',
          content: (theme) => <ReactChatPreview theme={theme} />,
        },
      ]}
      snippets={{ html: CHAT_BUBBLE_HTML, css: CHAT_BUBBLE_CSS, react: CHAT_BUBBLE_REACT }}
    />
  );
}
