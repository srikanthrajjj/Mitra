import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ComposerAttachment,
  createComposerAttachment,
  revokeAttachmentPreview,
  simulateAttachmentUpload,
} from '../utils/composerAttachments';

export function useComposerAttachments() {
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const cancelFnsRef = useRef<Map<string, () => void>>(new Map());

  const clearUploads = useCallback(() => {
    cancelFnsRef.current.forEach((cancel) => cancel());
    cancelFnsRef.current.clear();
  }, []);

  const clearAttachments = useCallback(() => {
    clearUploads();
    setAttachments((prev) => {
      prev.forEach(revokeAttachmentPreview);
      return [];
    });
  }, [clearUploads]);

  useEffect(() => () => clearAttachments(), [clearAttachments]);

  const removeAttachment = useCallback((id: string) => {
    const cancel = cancelFnsRef.current.get(id);
    cancel?.();
    cancelFnsRef.current.delete(id);
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) revokeAttachmentPreview(target);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const created = list.map(createComposerAttachment);
    setAttachments((prev) => [...prev, ...created]);

    created.forEach((attachment) => {
      const cancel = simulateAttachmentUpload(
        attachment.id,
        (id, progress) => {
          setAttachments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, progress } : a)),
          );
        },
        (id) => {
          cancelFnsRef.current.delete(id);
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, progress: 100, status: 'ready' } : a,
            ),
          );
        },
      );
      cancelFnsRef.current.set(attachment.id, cancel);
    });
  }, []);

  const hasUploading = attachments.some((a) => a.status === 'uploading');

  return {
    attachments,
    addFiles,
    removeAttachment,
    clearAttachments,
    hasUploading,
  };
}
