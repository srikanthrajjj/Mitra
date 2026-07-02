import { ProjectFolder } from '../data/folders';
import { Solution } from '../types';

export type FolderSortMode = 'default' | 'name-asc' | 'name-desc' | 'recent';

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

function folderRecencyRank(folderId: string, solutions: Solution[]): number {
  const idx = solutions.findIndex((s) => s.folderId === folderId);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

export function sortProjectFolders(
  folders: ProjectFolder[],
  solutions: Solution[],
  mode: FolderSortMode,
): ProjectFolder[] {
  if (mode === 'default') return folders;
  const sorted = [...folders];
  if (mode === 'name-asc') {
    return sorted.sort((a, b) => collator.compare(a.name, b.name));
  }
  if (mode === 'name-desc') {
    return sorted.sort((a, b) => collator.compare(b.name, a.name));
  }
  return sorted.sort(
    (a, b) => folderRecencyRank(a.id, solutions) - folderRecencyRank(b.id, solutions),
  );
}

export function sortSolutionsInFolder(
  items: Solution[],
  allSolutions: Solution[],
  mode: FolderSortMode,
): Solution[] {
  if (mode === 'default') return items;
  const sorted = [...items];
  if (mode === 'name-asc') {
    return sorted.sort((a, b) => collator.compare(a.name, b.name));
  }
  if (mode === 'name-desc') {
    return sorted.sort((a, b) => collator.compare(b.name, a.name));
  }
  return sorted.sort(
    (a, b) =>
      allSolutions.findIndex((s) => s.id === a.id) - allSolutions.findIndex((s) => s.id === b.id),
  );
}

export function nextFolderSortMode(mode: FolderSortMode): FolderSortMode {
  const order: FolderSortMode[] = ['default', 'name-asc', 'name-desc', 'recent'];
  const idx = order.indexOf(mode);
  return order[(idx + 1) % order.length];
}

export function folderSortLabel(mode: FolderSortMode): string {
  switch (mode) {
    case 'name-asc':
      return 'A → Z';
    case 'name-desc':
      return 'Z → A';
    case 'recent':
      return 'Recent';
    default:
      return 'Default';
  }
}
