import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface DevCodeBlockProps {
  code: string;
  label?: string;
  language?: string;
}

export function DevCodeBlock({ code, label, language }: DevCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="min-w-0 text-xs font-medium text-muted-foreground">
          {label ?? 'Snippet'}
          {language ? <span className="ml-2 font-mono text-[10px] text-muted-foreground/70">{language}</span> : null}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-brand-green" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
