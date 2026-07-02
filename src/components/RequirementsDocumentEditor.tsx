import { useState } from 'react';
import { Lock, Pencil } from 'lucide-react';
import { RequirementsDocument, RequirementsSection } from '../types';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';

interface RequirementsDocumentEditorProps {
  document: RequirementsDocument;
  compact?: boolean;
  onUpdateSection?: (sectionId: string, body: string) => void;
}

export function RequirementsDocumentEditor({
  document,
  compact = false,
  onUpdateSection,
}: RequirementsDocumentEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState('');

  const startEdit = (section: RequirementsSection) => {
    if (document.locked || !onUpdateSection) return;
    setEditingId(section.id);
    setDraftBody(section.body);
  };

  const saveEdit = () => {
    if (!editingId || !onUpdateSection) return;
    onUpdateSection(editingId, draftBody.trim());
    setEditingId(null);
    setDraftBody('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftBody('');
  };

  return (
    <div className={cn('space-y-2', compact ? 'text-[10px]' : 'text-sm')}>
      <div className="flex items-center justify-between gap-2">
        <p className={cn('font-medium text-foreground/90', compact ? 'text-[11px]' : 'text-sm')}>
          Requirements Document
        </p>
        <span className="text-[10px] text-muted-foreground">
          v{document.version}
          {document.locked && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-500">
              <Lock className="h-3 w-3" />
              Approved
            </span>
          )}
        </span>
      </div>

      <div className="space-y-1.5">
        {document.sections.map((section, index) => (
          <div
            key={section.id}
            className={cn(
              'rounded-lg border border-border/50 bg-muted/15 px-3 py-2.5',
              !document.locked && onUpdateSection && 'group hover:border-border/80',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={cn('font-medium text-foreground', compact ? 'text-[10px]' : 'text-xs')}>
                {index + 1}. {section.title}
              </p>
              {!document.locked && onUpdateSection && editingId !== section.id && (
                <button
                  type="button"
                  className="hidden shrink-0 rounded p-1 text-muted-foreground group-hover:inline-flex hover:text-foreground"
                  title="Edit section"
                  onClick={() => startEdit(section)}
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>

            {editingId === section.id ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  rows={compact ? 4 : 6}
                  className={cn(
                    'w-full resize-y rounded-md border border-border bg-background px-2 py-1.5 font-mono leading-relaxed text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    compact ? 'text-[10px]' : 'text-xs',
                  )}
                />
                <div className="flex gap-2">
                  <Button type="button" size="sm" className="h-7 text-[10px]" onClick={saveEdit}>
                    Save section
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px]"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className={cn(
                  'mt-1 whitespace-pre-line leading-relaxed text-muted-foreground',
                  compact ? 'text-[10px]' : 'text-xs',
                )}
              >
                {section.body}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
