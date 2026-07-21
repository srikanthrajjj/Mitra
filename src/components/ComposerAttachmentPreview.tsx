import { FileText, FileSpreadsheet, File, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ComposerAttachment,
  formatFileSize,
  isImageFile,
  isPdfFile,
} from '../utils/composerAttachments';

interface ComposerAttachmentPreviewProps {
  isDark: boolean;
  attachments: ComposerAttachment[];
  onRemove: (id: string) => void;
}

function FileTypeIcon({ attachment }: { attachment: ComposerAttachment }) {
  const className = 'h-5 w-5 text-brand-green';
  if (isPdfFile(attachment)) return <FileText className={className} />;
  const ext = attachment.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
    return <FileSpreadsheet className={className} />;
  }
  return <File className={className} />;
}

function AttachmentThumb({ attachment }: { attachment: ComposerAttachment }) {
  if (isImageFile(attachment) && attachment.previewUrl) {
    return (
      <img
        src={attachment.previewUrl}
        alt=""
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-muted px-1">
      <FileTypeIcon attachment={attachment} />
      <span className="max-w-full truncate text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
        {isPdfFile(attachment) ? 'PDF' : attachment.name.split('.').pop() || 'FILE'}
      </span>
    </div>
  );
}

export function ComposerAttachmentPreview({
  isDark,
  attachments,
  onRemove,
}: ComposerAttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2 px-1">
      {attachments.map((attachment) => {
        const uploading = attachment.status === 'uploading';
        return (
          <div
            key={attachment.id}
            className={cn(
              'group relative flex w-[148px] flex-col overflow-hidden rounded-xl border',
              isDark ? 'border-mitra-border bg-mitra-surface' : 'border-border bg-card',
            )}
          >
            <div className="relative h-[72px] w-full overflow-hidden border-b border-border">
              <AttachmentThumb attachment={attachment} />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-green" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(attachment.id)}
                className={cn(
                  'absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border transition-opacity',
                  isDark
                    ? 'border-mitra-border bg-mitra-surface text-foreground opacity-90 hover:bg-muted'
                    : 'border-border bg-card text-foreground opacity-90 hover:bg-muted',
                  'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
                )}
                title="Remove attachment"
                aria-label={`Remove ${attachment.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 px-2 py-1.5">
              <p className="truncate text-[11px] font-medium text-foreground" title={attachment.name}>
                {attachment.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {uploading ? `Uploading… ${attachment.progress}%` : formatFileSize(attachment.size)}
              </p>
              <div
                className={cn(
                  'h-1 w-full overflow-hidden rounded-full',
                  isDark ? 'bg-muted' : 'bg-muted',
                )}
                role="progressbar"
                aria-valuenow={attachment.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Upload progress for ${attachment.name}`}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-150 ease-out',
                    attachment.status === 'error' ? 'bg-destructive' : 'bg-brand-green',
                    attachment.status === 'ready' && 'opacity-70',
                  )}
                  style={{ width: `${attachment.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
