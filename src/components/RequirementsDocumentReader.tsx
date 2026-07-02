import { ReactNode } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { RequirementsSection, StakeholderSectionComment } from '../types';
import { parseSectionBody } from '../utils/requirementsDocument';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/lib/utils';

interface RequirementsDocumentReaderProps {
  sections: RequirementsSection[];
  canComment?: boolean;
  inlineComments?: StakeholderSectionComment[];
  commentPopoverSection?: RequirementsSection | null;
  sectionComment?: string;
  onOpenComment?: (section: RequirementsSection) => void;
  onCloseComment?: () => void;
  onSectionCommentChange?: (value: string) => void;
  onAddComment?: () => void;
}

function SectionBody({ body }: { body: string }) {
  const lines = parseSectionBody(body);
  const hasList = lines.some((l) => l.type === 'numbered' || l.type === 'bullet');

  if (!hasList) {
    return (
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
        {body}
      </p>
    );
  }

  const numbered = lines.filter((l) => l.type === 'numbered');
  const bullets = lines.filter((l) => l.type === 'bullet');
  const textLines = lines.filter((l) => l.type === 'text');

  return (
    <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
      {textLines.map((line, i) => (
        <p key={`t-${i}`}>{line.text}</p>
      ))}
      {numbered.length > 0 && (
        <ol className="list-none space-y-1.5 pl-0">
          {numbered.map((line, i) => (
            <li key={`n-${i}`} className="flex gap-2.5">
              <span className="shrink-0 font-medium tabular-nums text-foreground/70">{line.num}.</span>
              <span>{line.text}</span>
            </li>
          ))}
        </ol>
      )}
      {bullets.length > 0 && (
        <ul className="list-none space-y-1.5 pl-0">
          {bullets.map((line, i) => (
            <li key={`b-${i}`} className="flex gap-2.5">
              <span className="shrink-0 text-foreground/50">•</span>
              <span>{line.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RequirementsDocumentReader({
  sections,
  canComment = false,
  inlineComments = [],
  commentPopoverSection = null,
  sectionComment = '',
  onOpenComment,
  onCloseComment,
  onSectionCommentChange,
  onAddComment,
}: RequirementsDocumentReaderProps) {
  return (
    <div className="divide-y divide-border/40">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="group relative px-6 py-5 transition-colors hover:bg-muted/15"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
            {index + 1}. {section.title}
          </p>
          <SectionBody body={section.body} />

          {canComment && onOpenComment && (
            <button
              type="button"
              className="absolute right-4 top-4 hidden rounded-md border border-border/60 bg-background p-1.5 text-muted-foreground shadow-sm group-hover:flex hover:text-foreground"
              title="Add comment on section"
              onClick={() => onOpenComment(section)}
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
            </button>
          )}

          {commentPopoverSection?.id === section.id && canComment && onCloseComment && onAddComment && (
            <div className="absolute right-4 top-12 z-10 w-72 rounded-lg border border-border/60 bg-popover p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground">Comment on section</span>
                <button
                  type="button"
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  onClick={onCloseComment}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <Input
                value={sectionComment}
                onChange={(e) => onSectionCommentChange?.(e.target.value)}
                placeholder={`Note on ${section.title}…`}
                className="text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onAddComment();
                  if (e.key === 'Escape') onCloseComment();
                }}
              />
              <Button size="sm" className="mt-2 w-full" onClick={onAddComment}>
                Add comment
              </Button>
            </div>
          )}
        </div>
      ))}

      {inlineComments.length > 0 && (
        <div className="px-6 py-4">
          <div className="rounded-lg border border-border/60 bg-muted/25 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Your comments
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {inlineComments.map((c, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground/90">{c.sectionTitle}:</span> {c.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function RequirementsDocumentShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn('rounded-xl border border-border/60 bg-card/30', className)}>
      <header className="border-b border-border/40 px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </article>
  );
}
