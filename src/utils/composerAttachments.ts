export type ComposerAttachmentStatus = 'uploading' | 'ready' | 'error';

export interface ComposerAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  mimeType: string;
  /** Object URL for image thumbnails; revoke on remove */
  previewUrl: string | null;
  progress: number;
  status: ComposerAttachmentStatus;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(file: File | ComposerAttachment): boolean {
  const type = 'mimeType' in file ? file.mimeType : file.type;
  return type.startsWith('image/');
}

export function isPdfFile(file: File | ComposerAttachment): boolean {
  const type = 'mimeType' in file ? file.mimeType : file.type;
  const name = 'name' in file ? file.name : '';
  return type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
}

export function createComposerAttachment(file: File): ComposerAttachment {
  const isImage = file.type.startsWith('image/');
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    previewUrl: isImage ? URL.createObjectURL(file) : null,
    progress: 0,
    status: 'uploading',
  };
}

export function revokeAttachmentPreview(attachment: ComposerAttachment): void {
  if (attachment.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
}

/** Simulate upload progress to 100%, then mark ready. Returns cancel fn. */
export function simulateAttachmentUpload(
  attachmentId: string,
  onProgress: (id: string, progress: number) => void,
  onComplete: (id: string) => void,
): () => void {
  let progress = 0;
  let cancelled = false;
  const tick = () => {
    if (cancelled) return;
    // Fast start, slower finish — feels like a real upload
    const step = progress < 70 ? 8 + Math.random() * 12 : 2 + Math.random() * 6;
    progress = Math.min(100, progress + step);
    onProgress(attachmentId, Math.round(progress));
    if (progress >= 100) {
      onComplete(attachmentId);
      return;
    }
    timer = window.setTimeout(tick, 60 + Math.random() * 80);
  };
  let timer = window.setTimeout(tick, 40);
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}
