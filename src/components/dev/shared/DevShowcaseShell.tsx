import { useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DevCodeBlock } from './DevCodeBlock';

export interface DevSnippetSet {
  html: string;
  css: string;
  js?: string;
  react: string;
}

interface DevShowcaseShellProps {
  title: string;
  description: string;
  notes?: ReactNode;
  previews: Array<{ label: string; content: (theme: 'dark' | 'light') => ReactNode }>;
  snippets: DevSnippetSet;
}

export function DevShowcaseShell({
  title,
  description,
  notes,
  previews,
  snippets,
}: DevShowcaseShellProps) {
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPreviewTheme('dark')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            previewTheme === 'dark'
              ? 'border-brand-green/30 bg-brand-green/10 text-brand-green'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <Moon className="h-3.5 w-3.5" />
          Dark preview
        </button>
        <button
          type="button"
          onClick={() => setPreviewTheme('light')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            previewTheme === 'light'
              ? 'border-brand-green/30 bg-brand-green/10 text-brand-green'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          <Sun className="h-3.5 w-3.5" />
          Light preview
        </button>
      </div>

      <div className={cn('grid gap-4', previews.length > 1 ? 'lg:grid-cols-2' : 'max-w-2xl')}>
        {previews.map((preview) => (
          <div key={preview.label} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
              {preview.label}
            </div>
            <div
              className={cn(
                'flex min-h-[140px] items-center justify-center p-8',
                previewTheme === 'dark' ? 'bg-[#0b1018]' : 'bg-slate-50',
              )}
            >
              {preview.content(previewTheme)}
            </div>
          </div>
        ))}
      </div>

      {notes ? <div className="space-y-2 text-sm text-muted-foreground">{notes}</div> : null}

      <div className="space-y-4">
        <DevCodeBlock label="HTML" language="html" code={snippets.html} />
        <DevCodeBlock label="CSS" language="css" code={snippets.css} />
        {snippets.js ? <DevCodeBlock label="JavaScript" language="javascript" code={snippets.js} /> : null}
        <DevCodeBlock label="React" language="tsx" code={snippets.react} />
      </div>
    </div>
  );
}
