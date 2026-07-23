import React, { useState, useEffect, useRef } from 'react';
import {
  Folder, ChevronDown, Plus, Pencil, Trash2, Lock, Archive,
} from 'lucide-react';
import { ArtifactStatus, Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { ProjectFolder } from '../data/folders';
import {
  FolderSortMode,
  sortProjectFolders,
  sortSolutionsInFolder,
} from '../utils/folderSort';
import { deriveFolderStatus } from '../utils/folderStatus';
import { FolderStatusBadge } from './FolderStatusBadge';
import { ConversationStatusDot } from './ConversationStatusDot';
import { deriveConversationStatus } from '../utils/conversationStatus';
import CustomFolder from './ui/Folder';

interface ProjectFolderListProps {
  theme: Theme;
  solutions: Solution[];
  folders: ProjectFolder[];
  searchQuery: string;
  sortMode?: FolderSortMode;
  activeSolutionId?: string;
  focusedFolderId?: string;
  variant: 'sidebar' | 'page';
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (folderId: string) => void;
  onSelectSolution: (solutionId: string) => void;
  onNewThreadInFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameSolution?: (solutionId: string, name: string) => void;
  onDeleteSolution?: (solutionId: string) => void;
  renamingFolderId?: string | null;
  onRenamingComplete?: () => void;
  statusOverrides?: Record<string, ArtifactStatus>;
  generatingSolutionId?: string | null;
}

function ThreadDotsIcon() {
  return (
    <span className="w-4 h-4 flex flex-col items-center justify-center shrink-0 text-muted-foreground">
      <span className="w-[3px] h-[3px] rounded-full bg-current mb-[2px]" />
      <span className="flex gap-[2px]">
        <span className="w-[3px] h-[3px] rounded-full bg-current" />
        <span className="w-[3px] h-[3px] rounded-full bg-current" />
      </span>
    </span>
  );
}

function RowActionButton({
  title,
  onClick,
  isDark,
  danger = false,
  children,
}: {
  title: string;
  onClick: () => void;
  isDark: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
        danger
            ? isDark
            ? 'text-muted-foreground hover:text-red-400 hover:bg-red-500/10'
            : 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
            : isDark
            ? 'text-muted-foreground hover:text-illuminate-text hover:bg-mitra-highlight'
            : 'text-muted-foreground hover:text-brand-green hover:bg-accent'
      }`}
    >
      {children}
    </button>
  );
}

function HoverRowActions({
  isDark,
  onRename,
  onDelete,
  onArchive,
  editing,
}: {
  isDark: boolean;
  onRename: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  editing?: boolean;
}) {
  if (editing) return null;

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
      <RowActionButton title="Rename" onClick={onRename} isDark={isDark}>
        <Pencil className="w-3 h-3" />
      </RowActionButton>
      {onArchive && (
        <RowActionButton title="Archive" onClick={onArchive} isDark={isDark}>
          <Archive className="w-3 h-3" />
        </RowActionButton>
      )}
      {onDelete && (
        <RowActionButton title="Delete" onClick={onDelete} isDark={isDark} danger>
          <Trash2 className="w-3 h-3" />
        </RowActionButton>
      )}
    </div>
  );
}

export default function ProjectFolderList({
  theme,
  solutions,
  folders,
  searchQuery,
  sortMode = 'default',
  activeSolutionId,
  focusedFolderId = '',
  variant,
  expandedFolders,
  onToggleFolder,
  onSelectSolution,
  onNewThreadInFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameSolution,
  onDeleteSolution,
  renamingFolderId,
  onRenamingComplete,
  statusOverrides = {},
  generatingSolutionId = null,
}: ProjectFolderListProps) {
  const isDark = isDarkTheme(theme);
  const isPage = variant === 'page';
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!renamingFolderId) return;
    const folder = folders.find((f) => f.id === renamingFolderId);
    if (!folder) return;
    setEditingFolderId(renamingFolderId);
    setEditName(folder.name);
    onRenamingComplete?.();
  }, [renamingFolderId, folders, onRenamingComplete]);

  useEffect(() => {
    if ((!editingFolderId && !editingSolutionId) || !renameInputRef.current) return;
    renameInputRef.current.focus();
    if (editingFolderId === renamingFolderId) {
      renameInputRef.current.select();
    }
  }, [editingFolderId, editingSolutionId, renamingFolderId]);

  const startEditingFolder = (folderId: string, currentName: string) => {
    setEditingSolutionId(null);
    setEditingFolderId(folderId);
    setEditName(currentName);
  };

  const startEditingSolution = (solutionId: string, currentName: string) => {
    setEditingFolderId(null);
    setEditingSolutionId(solutionId);
    setEditName(currentName);
  };

  const commitRename = () => {
    if (editingFolderId && onRenameFolder) {
      onRenameFolder(editingFolderId, editName);
    } else if (editingSolutionId && onRenameSolution) {
      onRenameSolution(editingSolutionId, editName);
    }
    setEditingFolderId(null);
    setEditingSolutionId(null);
  };

  const cancelRename = () => {
    setEditingFolderId(null);
    setEditingSolutionId(null);
    onRenamingComplete?.();
  };

  const filteredSolutions = solutions.filter(
    (sol) =>
      sol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFolderSolutions = (folderId: string) => {
    const items = filteredSolutions.filter((sol) => sol.folderId === folderId);
    return sortSolutionsInFolder(items, solutions, sortMode);
  };

  const orderedFolders = sortProjectFolders(folders, solutions, sortMode);

  const visibleFolders = orderedFolders.filter((folder) => {
    if (folder.archived) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      getFolderSolutions(folder.id).length > 0 ||
      folder.name.toLowerCase().includes(q)
    );
  });

  const renderRenameInput = (textSize: string) => (
    <input
      ref={renameInputRef}
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      onBlur={commitRename}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitRename();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelRename();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      className={`flex-1 min-w-0 font-medium px-1 py-0.5 rounded border outline-none ${textSize} ${
        isDark
          ? 'bg-mitra-input border-white/[0.06] text-illuminate-text focus:border-brand-green/25'
          : 'bg-card border-border text-foreground focus:border-brand-green'
      }`}
    />
  );

  const renderThreadRow = (sol: Solution, textSize: string) => {
    const isSelected = activeSolutionId === sol.id;
    const isEditing = editingSolutionId === sol.id;
    const conversationStatus = deriveConversationStatus(sol, { generatingSolutionId });

    return (
      <div
        key={sol.id}
        className={`group w-full flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${
          isSelected
            ? isDark
              ? 'text-illuminate-text bg-mitra-highlight/90 border-l-2 border-l-brand-green pl-[calc(0.5rem-2px)]'
              : 'text-brand-green bg-muted border-l-2 border-l-brand-green pl-[calc(0.5rem-2px)]'
            : isDark
              ? 'text-muted-foreground hover:text-foreground border-l-2 border-l-transparent'
              : 'text-muted-foreground hover:text-foreground border-l-2 border-l-transparent'
        }`}
      >
        {isEditing ? (
          <div className="flex-1 min-w-0">{renderRenameInput(textSize)}</div>
        ) : (
          <button
            type="button"
            onClick={() => onSelectSolution(sol.id)}
            className="flex-1 flex items-center gap-2 min-w-0 text-left cursor-pointer"
          >
            {sol.id === 'v3-locked-sol' ? (
              <Lock className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
            ) : (
              <ThreadDotsIcon />
            )}
            <ConversationStatusDot status={conversationStatus} />
            <span className={`truncate leading-tight ${textSize} ${sol.id === 'v3-locked-sol' ? 'text-amber-500/80 font-semibold' : ''}`}>{sol.name}</span>
          </button>
        )}
        {sol.id !== 'v3-locked-sol' && (
          <HoverRowActions
            isDark={isDark}
            editing={isEditing}
            onRename={() => startEditingSolution(sol.id, sol.name)}
            onDelete={() => onDeleteSolution?.(sol.id)}
          />
        )}
      </div>
    );
  };

  if (visibleFolders.length === 0) {
    if (!searchQuery) return null;
    return (
      <div className={`text-center py-8 ${isPage ? 'py-16' : 'py-5'}`}>
        <span className={`text-[12px] font-semibold ${isDark ? 'text-illuminate-muted/60' : 'text-muted-foreground'}`}>
          No matches found
        </span>
      </div>
    );
  }

  if (!isPage) {
    return (
      <div className="space-y-1">
        {visibleFolders.map((folder) => {
          const folderSolutions = getFolderSolutions(folder.id);
          const isExpanded = expandedFolders[folder.id] ?? true;
          const hasSelectedThread = !!activeSolutionId &&
            folderSolutions.some((s) => s.id === activeSolutionId);
          const isActiveFolder =
            !hasSelectedThread &&
            focusedFolderId === folder.id &&
            folderSolutions.length === 0;
          const isEditingFolder = editingFolderId === folder.id;

          return (
            <div key={folder.id}>
              <div
                className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
                  isActiveFolder
                    ? isDark
                      ? 'bg-mitra-highlight text-illuminate-text'
                      : 'bg-muted text-foreground'
                    : isDark
                      ? 'text-muted-foreground hover:bg-mitra-highlight/50 hover:text-illuminate-text'
                      : 'text-muted-foreground hover:bg-accent/60'
                }`}
              >
                <CustomFolder size={0.16} color={isDark ? '#4FCF36' : '#047857'} open={isExpanded} className="shrink-0" />
                <div className="flex-1 flex items-center gap-1 min-w-0">
                  {isEditingFolder ? (
                    renderRenameInput('text-[12.5px]')
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleFolder(folder.id)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEditingFolder(folder.id, folder.name);
                      }}
                      className="flex-1 flex items-center gap-1 min-w-0 text-left cursor-pointer"
                    >
                      <span className="flex-1 min-w-0 truncate text-[12.5px] font-medium leading-tight">{folder.name}</span>
                      <ChevronDown
                        className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                          isExpanded ? '' : '-rotate-90'
                        } ${isDark ? 'text-muted-foreground' : 'text-brand-green'}`}
                      />
                    </button>
                  )}
                </div>
                <HoverRowActions
                  isDark={isDark}
                  editing={isEditingFolder}
                  onRename={() => startEditingFolder(folder.id, folder.name)}
                  onArchive={() => onDeleteFolder(folder.id)}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewThreadInFolder?.(folder.id);
                  }}
                  className={`p-0.5 rounded transition-colors cursor-pointer shrink-0 ${
                    isDark
                      ? 'text-muted-foreground hover:text-illuminate-text hover:bg-mitra-highlight'
                      : 'text-brand-green hover:text-brand-green hover:bg-accent'
                  }`}
                  title="New thread"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {isExpanded && folderSolutions.length > 0 && (
                <div className="mt-1 space-y-0.5 pl-1">
                  {folderSolutions.map((sol) => renderThreadRow(sol, 'text-[12px]'))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleFolders.map((folder) => {
        const folderSolutions = getFolderSolutions(folder.id);
        const isExpanded = expandedFolders[folder.id] ?? true;
        const hasSelectedThread = !!activeSolutionId &&
          folderSolutions.some((s) => s.id === activeSolutionId);
        const isActiveFolder =
          !hasSelectedThread &&
          focusedFolderId === folder.id &&
          folderSolutions.length === 0;
        const isEditingFolder = editingFolderId === folder.id;
        const folderStatus = deriveFolderStatus(folder, solutions, statusOverrides);

        return (
          <div
            key={folder.id}
            className={`rounded-lg border overflow-hidden ${
              isDark
                ? isActiveFolder ? 'border-white/[0.06] bg-mitra-surface/60' : 'border-white/[0.04] bg-transparent'
                : isActiveFolder ? 'border-border bg-card'                       : 'border-border/50 bg-transparent'
            }`}
          >
            <div
              className={`group flex items-center gap-1.5 px-3 py-2.5 ${
                isActiveFolder
                  ? isDark ? 'bg-mitra-highlight text-illuminate-text' : 'bg-muted text-foreground'
                   : isDark ? 'text-muted-foreground hover:bg-mitra-highlight/35' : 'text-muted-foreground hover:bg-accent/60'
              }`}
            >
              <CustomFolder size={0.16} color={isDark ? '#4FCF36' : '#047857'} open={isExpanded} className="shrink-0" />
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                {isEditingFolder ? (
                  <div className="min-w-0 flex-1">{renderRenameInput('text-[13px]')}</div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleFolder(folder.id)}
                    className="flex flex-1 items-center gap-1.5 min-w-0 text-left cursor-pointer"
                  >
                    <span className="truncate text-[13px] font-medium">{folder.name}</span>
                    <FolderStatusBadge status={folderStatus} isDark={isDark} variant="inline" />
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                        isExpanded ? '' : '-rotate-90'
                      }`}
                    />
                  </button>
                )}
              </div>
              <span className={`text-[11px] font-medium mr-1 ${isDark ? 'text-muted-foreground' : 'text-brand-green'}`}>
                {folderSolutions.length}
              </span>
              <HoverRowActions
                isDark={isDark}
                editing={isEditingFolder}
                onRename={() => startEditingFolder(folder.id, folder.name)}
                onArchive={() => onDeleteFolder(folder.id)}
              />
              <button
                type="button"
                onClick={() => onNewThreadInFolder?.(folder.id)}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isDark ? 'text-muted-foreground hover:text-illuminate-text' : 'text-brand-green hover:text-brand-green'
                }`}
                title="New thread"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isExpanded && (
              <div className="px-2 py-1.5">
                {folderSolutions.length === 0 ? (
                  <div className="py-2 px-3">
                    <span className={`text-[11px] italic ${isDark ? 'text-illuminate-muted/50' : 'text-muted-foreground'}`}>
                      Empty folder
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {folderSolutions.map((sol) => renderThreadRow(sol, 'text-[13px]'))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
