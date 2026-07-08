import { ArrowUp, Lightbulb, MessageSquare, Upload } from 'lucide-react';
import { Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import MitraThinkingIndicator from './MitraThinkingIndicator';
import { MitraLogo } from './MitraLogo';

export type BusinessOwnerEntryMode = 'upload' | 'chat';

interface ChatBubble {
  id: string;
  sender: 'user' | 'mitra';
  text: string;
  thoughtDurationMs?: number;
}

function formatThoughtDuration(durationMs?: number) {
  const seconds = Math.max(1, Math.round((durationMs ?? 4000) / 1000));
  return `Thought for ${seconds}s`;
}

interface BusinessOwnerEntryTabsProps {
  mode: BusinessOwnerEntryMode;
  onModeChange: (mode: BusinessOwnerEntryMode) => void;
  disabled?: boolean;
}

export function BusinessOwnerEntryTabs({
  mode,
  onModeChange,
  disabled,
}: BusinessOwnerEntryTabsProps) {
  return (
    <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange('upload')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
          mode === 'upload'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <Upload className="h-3 w-3" />
        Upload
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange('chat')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
          mode === 'chat'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <MessageSquare className="h-3 w-3" />
        Chat with Mitra
      </button>
    </div>
  );
}

function parseBold(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

interface BusinessOwnerChatThreadProps {
  theme: Theme;
  messages: ChatBubble[];
  isTyping: boolean;
}

export function BusinessOwnerChatThread({
  theme,
  messages,
  isTyping,
}: BusinessOwnerChatThreadProps) {
  const isDark = isDarkTheme(theme);

  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn('flex gap-3', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
        >
          <div className="flex max-w-[85%] flex-col items-start">
            {msg.sender === 'mitra' && (
              <div
                className={cn(
                  'mb-1 inline-flex items-center gap-1.5 pl-1 text-[11px]',
                  isDark ? 'text-slate-500' : 'text-slate-500',
                )}
              >
                <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                <span>{formatThoughtDuration(msg.thoughtDurationMs)}</span>
              </div>
            )}
            <div
              className={cn(
                'w-full rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : isDark
                    ? 'bg-card/80 text-foreground border border-border/50'
                    : 'bg-white text-foreground border border-slate-200 shadow-sm',
              )}
            >
              {msg.sender === 'mitra' ? parseBold(msg.text) : msg.text}
            </div>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-transparent animate-avatar-thinking">
            <MitraLogo animated className="h-5 w-5 opacity-90" />
          </div>
          <MitraThinkingIndicator theme={theme} context="businessOwner" compact />
        </div>
      )}
    </>
  );
}

interface BusinessOwnerChatComposerProps {
  theme: Theme;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  footerLabel?: string;
}

export function BusinessOwnerChatComposer({
  theme,
  value,
  onChange,
  onSend,
  placeholder = 'Reply to Mitra…',
  disabled,
  footerLabel,
}: BusinessOwnerChatComposerProps) {
  const isDark = isDarkTheme(theme);

  return (
    <div className="shrink-0 border-t border-border px-4 py-3 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border px-3 py-2',
            isDark ? 'border-border/60 bg-card/40' : 'border-slate-200 bg-white shadow-sm',
          )}
        >
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0 rounded-xl"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        {footerLabel && (
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">{footerLabel}</p>
        )}
      </div>
    </div>
  );
}
