import React, { useState, useMemo } from 'react';
import {
  Search, X, Folder, FolderPlus, Plus, ChevronRight,
  MessageSquare, MoreHorizontal, ArrowLeft,
} from 'lucide-react';
import { Solution, Theme } from '../types';
import { ConversationStatusDot } from './ConversationStatusDot';
import { deriveConversationStatus } from '../utils/conversationStatus';
import { isDarkTheme } from '../utils/theme';
import { ProjectFolder, getSolutionFolderId } from '../data/folders';

interface ProjectsViewProps {
  theme: Theme;
  folders: ProjectFolder[];
  solutions: Solution[];
  activeSolutionId: string;
  onSelectSolution: (solutionId: string) => void;
  onCreateFolder: () => void;
  onNewChat: (folderId?: string) => void;
  generatingSolutionId?: string | null;
}

export default function ProjectsView({
  theme,
  folders,
  solutions,
  activeSolutionId,
  onSelectSolution,
  onCreateFolder,
  onNewChat,
  generatingSolutionId = null,
}: ProjectsViewProps) {
  const isDark = isDarkTheme(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const filteredSolutions = useMemo(
    () =>
      solutions.filter(
        (sol) =>
          sol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sol.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [solutions, searchQuery]
  );

  const getFolderSolutions = (folderId: string) =>
    filteredSolutions.filter(
      (sol) =>
        sol.folderId === folderId
    );

  const currentFolder = currentFolderId
    ? folders.find((f) => f.id === currentFolderId)
    : null;

  const folderContents = currentFolderId ? getFolderSolutions(currentFolderId) : [];

  const visibleFolders = folders.filter((folder) => {
    if (!searchQuery) return true;
    const items = getFolderSolutions(folder.id);
    return items.length > 0 || folder.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSearchQuery('');
  };

  const goToRoot = () => {
    setCurrentFolderId(null);
    setSearchQuery('');
  };

  const handleSelectThread = (solutionId: string) => {
    const sol = solutions.find((s) => s.id === solutionId);
    if (sol) {
      setCurrentFolderId(getSolutionFolderId(sol.folderId));
    }
    onSelectSolution(solutionId);
  };

  const rowHover = isDark ? 'hover:bg-mitra-highlight/70' : 'hover:bg-emerald-50/80';
  const divider = isDark ? 'border-white/[0.06]' : 'border-slate-200';

  return (
    <div
      className={`w-[300px] xl:w-[340px] shrink-0 flex flex-col h-full border-r overflow-hidden ${
        isDark ? 'bg-mitra-sidebar border-white/[0.06]' : 'bg-white border-slate-200'
      }`}
    >
      {/* Toolbar */}
      <div className={`shrink-0 px-4 py-4 border-b ${divider}`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            {currentFolder ? (
              <>
                <button
                  onClick={goToRoot}
                  className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                    isDark ? 'text-slate-400 hover:text-white hover:bg-mitra-highlight' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <nav className="flex items-center gap-0.5 text-[12px] min-w-0">
                  <button
                    onClick={goToRoot}
                    className={`truncate cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Folders
                  </button>
                  <ChevronRight className={`w-3 h-3 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentFolder?.name}
                  </span>
                </nav>
              </>
            ) : (
              <h2 className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Folders
              </h2>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={onCreateFolder}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isDark ? 'text-slate-500 hover:text-slate-200 hover:bg-mitra-highlight' : 'text-slate-400 hover:bg-slate-100'
              }`}
              title="New folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNewChat(currentFolderId)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? 'text-brand-green bg-brand-green/15 hover:bg-brand-green/25'
                  : 'text-[#030d0a] bg-brand-green hover:bg-brand-green-hover'
              }`}
              title="New thread"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-8 py-1.5 rounded-md text-[12px] outline-none border ${
              isDark
                ? 'bg-mitra-input border-white/[0.06] text-illuminate-text placeholder:text-illuminate-muted'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
            }`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer">
              <X className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>
          )}
        </div>
      </div>

      {/* Column header */}
      <div className={`shrink-0 px-4 py-2 border-b ${divider}`}>
        <div className={`text-[10px] font-semibold uppercase tracking-wide ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {currentFolder ? 'Threads' : 'Name'}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {!currentFolder ? (
          visibleFolders.length === 0 ? (
            <div className={`py-12 text-center text-[12px] px-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No folders found
            </div>
          ) : (
            <div className={`divide-y ${divider}`}>
              {visibleFolders.map((folder) => {
                const items = getFolderSolutions(folder.id);
                return (
                  <button
                    key={folder.id}
                    onClick={() => openFolder(folder.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors cursor-pointer group ${rowHover}`}
                  >
                    <Folder className={`w-4 h-4 shrink-0 ${isDark ? 'text-brand-green/80' : 'text-emerald-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`truncate text-[12.5px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {folder.name}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {items.length} {items.length === 1 ? 'thread' : 'threads'}
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </button>
                );
              })}
            </div>
          )
        ) : folderContents.length === 0 ? (
          <div className={`py-12 text-center px-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <p className="text-[12px] mb-2">Empty folder</p>
            <button
              onClick={() => onNewChat(currentFolderId)}
              className={`text-[11px] cursor-pointer ${isDark ? 'text-brand-green' : 'text-emerald-600'}`}
            >
              + New thread
            </button>
          </div>
        ) : (
          <div className={`divide-y ${divider}`}>
            {folderContents.map((sol) => {
              const isSelected = activeSolutionId === sol.id;
              const conversationStatus = deriveConversationStatus(sol, { generatingSolutionId });
              return (
                <button
                  key={sol.id}
                  onClick={() => handleSelectThread(sol.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors cursor-pointer group ${
                    isSelected
                      ? isDark ? 'bg-mitra-highlight border-l-2 border-l-brand-green' : 'bg-emerald-50 border-l-2 border-l-brand-green'
                      : rowHover
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`truncate text-[12.5px] font-medium flex items-center gap-1.5 ${
                      isSelected
                        ? isDark ? 'text-white' : 'text-slate-900'
                        : isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <ConversationStatusDot status={conversationStatus} />
                      <span className="truncate">{sol.name}</span>
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {sol.timeLabel || sol.createdAt}
                    </div>
                  </div>
                  <MoreHorizontal className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
