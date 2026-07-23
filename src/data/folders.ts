import { FolderStatus } from '../types';

export interface ProjectFolder {
  id: string;
  name: string;
  /** Demo seed status; derived from child solutions when omitted */
  status?: FolderStatus;
  updatedAt?: string;
  /** Soft-removed from active lists; not permanently deleted */
  archived?: boolean;
}

export const PROJECT_FOLDERS: ProjectFolder[] = [];

/** Default folders seeded on first load with varied lifecycle statuses */
export const SEED_PROJECT_FOLDERS: ProjectFolder[] = [
  {
    id: 'mitra-ai-architect',
    name: 'Mitra AI Architect',
    status: 'in_review',
    updatedAt: '2026-06-13T08:30:00Z',
  },
  {
    id: 'remix-travel',
    name: 'Remix Travel',
    status: 'accepted',
    updatedAt: '2026-06-10T14:00:00Z',
  },
  {
    id: 'backup-vpro',
    name: 'Backup VPro',
    status: 'draft',
    updatedAt: '2026-04-01T10:00:00Z',
  },
];
export const UNTITLED_FOLDER_NAME = 'untitled';
export const UNTITLED_THREAD_NAME = 'Untitled';

export function getSolutionFolderId(folderId?: string): string {
  return folderId ?? '';
}

export function isUntitledThreadName(name: string): boolean {
  return (
    name === UNTITLED_THREAD_NAME ||
    name === 'Custom ServiceNow Workspace' ||
    name === 'New Custom Solution'
  );
}

export function threadTitleFromMessage(text: string): string {
  const firstLine = text.trim().split('\n')[0].trim();
  if (!firstLine) return UNTITLED_THREAD_NAME;
  return firstLine.length > 36 ? `${firstLine.substring(0, 36)}...` : firstLine;
}

export function nextUntitledFolderName(existing: ProjectFolder[]): string {
  if (!existing.some((f) => f.name === UNTITLED_FOLDER_NAME)) {
    return UNTITLED_FOLDER_NAME;
  }
  let index = 2;
  while (existing.some((f) => f.name === `${UNTITLED_FOLDER_NAME} ${index}`)) {
    index += 1;
  }
  return `${UNTITLED_FOLDER_NAME} ${index}`;
}
