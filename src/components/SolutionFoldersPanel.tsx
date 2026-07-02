import { useEffect, useRef, useState } from 'react';
import { ArrowUpDown, FolderPlus, Search, X } from 'lucide-react';
import { ProjectFolder } from '../data/folders';
import { ArtifactStatus, Solution, Theme } from '../types';
import ProjectFolderList from './ProjectFolderList';
import {
  FolderSortMode,
  folderSortLabel,
  nextFolderSortMode,
} from '../utils/folderSort';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/src/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/src/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SolutionFoldersPanelProps {
  theme: Theme;
  folders: ProjectFolder[];
  solutions: Solution[];
  activeSolutionId?: string;
  focusedFolderId?: string;
  renamingFolderId?: string | null;
  onSelectSolution: (solutionId: string) => void;
  onCreateFolder: () => string;
  onRenameFolder: (folderId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameSolution: (solutionId: string, name: string) => void;
  onDeleteSolution: (solutionId: string) => void;
  onNewThreadInFolder: (folderId: string) => void;
  onRenamingComplete: () => void;
  statusOverrides?: Record<string, ArtifactStatus>;
}

export function SolutionFoldersPanel({
  theme,
  folders,
  solutions,
  activeSolutionId,
  focusedFolderId = '',
  renamingFolderId,
  onSelectSolution,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameSolution,
  onDeleteSolution,
  onNewThreadInFolder,
  onRenamingComplete,
  statusOverrides = {},
}: SolutionFoldersPanelProps) {
  const [folderSearchOpen, setFolderSearchOpen] = useState(false);
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<FolderSortMode>('default');
  const folderSearchRef = useRef<HTMLInputElement>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(folders.map((f) => [f.id, true])),
  );

  useEffect(() => {
    setExpandedFolders((prev) => {
      const next = { ...prev };
      folders.forEach((f) => {
        if (next[f.id] === undefined) next[f.id] = true;
      });
      return next;
    });
  }, [folders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateFolder = () => {
    const newFolderId = onCreateFolder();
    setExpandedFolders((prev) => ({ ...prev, [newFolderId]: true }));
  };

  const handleSelectSolution = (solutionId: string) => {
    const sol = solutions.find((s) => s.id === solutionId);
    if (sol?.folderId) {
      setExpandedFolders((prev) => ({ ...prev, [sol.folderId]: true }));
    }
    onSelectSolution(solutionId);
  };

  const handleNewThreadInFolder = (folderId: string) => {
    onNewThreadInFolder(folderId);
    setExpandedFolders((prev) => ({ ...prev, [folderId]: true }));
  };

  return (
    <SidebarGroup className="mt-2 flex min-h-0 flex-1 flex-col px-1 py-0">
      <div className="flex items-center justify-between px-3 pb-0.5">
        <SidebarGroupLabel className="sidebar-section-label px-0">
          Folders
        </SidebarGroupLabel>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-6 w-6 text-muted-foreground/70 hover:text-foreground',
                  folderSearchOpen && 'bg-sidebar-accent text-sidebar-foreground',
                )}
                onClick={() => {
                  setFolderSearchOpen((open) => {
                    const next = !open;
                    if (next) {
                      queueMicrotask(() => folderSearchRef.current?.focus());
                    } else {
                      setFolderSearchQuery('');
                    }
                    return next;
                  });
                }}
                aria-label="Search folders"
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Search folders</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'h-6 w-6 text-muted-foreground/70 hover:text-foreground',
                  sortMode !== 'default' && 'bg-sidebar-accent text-sidebar-foreground',
                )}
                onClick={() => setSortMode((m) => nextFolderSortMode(m))}
                aria-label={`Sort: ${folderSortLabel(sortMode)}`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sort: {folderSortLabel(sortMode)}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground/70 hover:text-foreground"
                onClick={handleCreateFolder}
                aria-label="New folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">New folder</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {folderSearchOpen && (
        <div className="relative px-3 pb-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            ref={folderSearchRef}
            type="search"
            placeholder="Search folders…"
            value={folderSearchQuery}
            onChange={(e) => setFolderSearchQuery(e.target.value)}
            className="h-7 border-transparent bg-muted/30 pl-7 pr-7 text-[11px] placeholder:text-muted-foreground/50 focus-visible:bg-muted/50"
          />
          {folderSearchQuery && (
            <button
              type="button"
              onClick={() => setFolderSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      <SidebarGroupContent className="min-h-0 flex-1 overflow-y-auto px-2 pb-1 pt-0">
        {folders.length === 0 && !folderSearchQuery ? (
          <p className="px-2 py-2 text-[11px] leading-tight text-muted-foreground/70">
            No folders yet. Create one to organize chat threads.
          </p>
        ) : (
          <ProjectFolderList
            theme={theme}
            solutions={solutions}
            folders={folders}
            searchQuery={folderSearchQuery}
            sortMode={sortMode}
            activeSolutionId={activeSolutionId}
            focusedFolderId={focusedFolderId}
            variant="sidebar"
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            onSelectSolution={handleSelectSolution}
            onNewThreadInFolder={handleNewThreadInFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onRenameSolution={onRenameSolution}
            onDeleteSolution={onDeleteSolution}
            renamingFolderId={renamingFolderId}
            onRenamingComplete={onRenamingComplete}
            statusOverrides={statusOverrides}
          />
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
