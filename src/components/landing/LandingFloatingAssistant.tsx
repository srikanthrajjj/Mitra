import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MitraLogo } from '../MitraLogo';

const QUICK_PROMPTS = [
  'How does Mitra implement ServiceNow faster?',
  'Can I connect my PDI for a trial?',
  'What industries do you support?',
];

interface LandingFloatingAssistantProps {
  onGetDemo: () => void;
}

export function LandingFloatingAssistant({ onGetDemo }: LandingFloatingAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  return (
    <div className="landing-floating-assistant pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div
          className="landing-floating-assistant-panel pointer-events-auto w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-white/12 bg-[#091d2b] shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
          role="dialog"
          aria-label="IlluminAIte assistant"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <MitraLogo className="h-6 w-6" />
              <div>
                <p className="text-sm font-bold text-white">Ask IlluminAIte</p>
                <p className="text-[11px] font-medium text-white/60">ServiceNow implementation help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 px-4 py-4">
            <p className="text-sm font-semibold leading-relaxed text-white">
              Hi — I can help with demos, trials, and how Mitra delivers ServiceNow outcomes.
            </p>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-xs font-semibold text-white transition-colors hover:border-[#1aaf00]/40 hover:bg-white/[0.06]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/35 focus:outline-none"
              />
              <button
                type="button"
                onClick={onGetDemo}
                className="rounded-lg bg-[#1aaf00] p-2 text-[#091d2b] transition-opacity hover:opacity-90"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-auto flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onGetDemo}
          className="rounded-full border border-white/25 bg-[#103b31]/90 px-5 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-[#103b31]"
        >
          Get a demo
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
            open
              ? 'bg-white text-[#091d2b]'
              : 'bg-[#1aaf00] text-[#091d2b] hover:opacity-95',
          )}
          aria-label={open ? 'Close chat' : 'Open chat assistant'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}
