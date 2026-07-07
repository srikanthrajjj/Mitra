import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Star, MessageSquare, Plus, CornerDownLeft, X,
  Settings, Link2, Folder, LayoutGrid
} from 'lucide-react';
import { Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { UNTITLED_FOLDER_NAME, type ProjectFolder } from '../data/folders';
import { cn } from '@/lib/utils';

interface SearchDialogProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
  solutions: Solution[];
  folders: ProjectFolder[];
  onSelectSolution: (id: string) => void;
  onNewChat: (folderId?: string, initialMessage?: string) => string;
  onNavigate: (tab: string) => void;
  onToggleFavorite: (id: string) => void;
}

type FilterCategory = 'all' | 'itsm' | 'hr' | 'csm' | 'custom' | 'starred';

interface SearchResultItem {
  id: string;
  type: 'chat' | 'command';
  title: string;
  subtitle?: string;
  projectName?: string;
  icon: any;
  action: () => void;
  isStarred?: boolean;
  solId?: string;
}

function resolveProjectName(
  folderId: string | undefined,
  folders: ProjectFolder[],
): string | undefined {
  if (!folderId) return undefined;
  const folder = folders.find((f) => f.id === folderId);
  if (!folder || folder.name === UNTITLED_FOLDER_NAME) return undefined;
  return folder.name;
}

export function SearchDialog({
  theme,
  isOpen,
  onClose,
  solutions,
  folders,
  onSelectSolution,
  onNewChat,
  onNavigate,
  onToggleFavorite,
}: SearchDialogProps) {
  const isDark = isDarkTheme(theme);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCategory('all');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle escape & arrow keys globally when dialog is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build filtered items list
  const searchItems = useMemo(() => {
    const results: SearchResultItem[] = [];
    const normalizedQuery = query.trim().toLowerCase();

    // 1. Filter chat/solution threads
    const matchedSolutions = solutions.filter((sol) => {
      const projectName = resolveProjectName(sol.folderId, folders) ?? '';

      // Category filter matching
      if (category === 'starred' && !sol.isFavorite) return false;
      if (category !== 'all' && category !== 'starred') {
        const catLabel = sol.id.includes('itsm') || sol.name.toLowerCase().includes('itsm') || sol.name.toLowerCase().includes('incident') ? 'itsm' :
                         sol.id.includes('hr') || sol.name.toLowerCase().includes('hrsd') || sol.name.toLowerCase().includes('employee') ? 'hr' :
                         sol.id.includes('csm') || sol.name.toLowerCase().includes('customer') ? 'csm' : 'custom';
        if (catLabel !== category) return false;
      }

      // Query filter matching
      if (!normalizedQuery) return true;
      return (
        sol.name.toLowerCase().includes(normalizedQuery) ||
        sol.description.toLowerCase().includes(normalizedQuery) ||
        projectName.toLowerCase().includes(normalizedQuery)
      );
    });

    matchedSolutions.forEach((sol) => {
      const projectName = resolveProjectName(sol.folderId, folders);
      results.push({
        id: `chat-${sol.id}`,
        type: 'chat',
        title: sol.name,
        subtitle: sol.description,
        projectName,
        icon: MessageSquare,
        isStarred: sol.isFavorite,
        solId: sol.id,
        action: () => {
          onSelectSolution(sol.id);
          onNavigate('projects');
          onClose();
        }
      });
    });

    // 2. Command Palette items (only show when no query, or if matching query)
    const commands: { title: string; match: string; icon: any; action: () => void }[] = [
      { title: 'New Chat Thread', match: 'new chat thread create start', icon: Plus, action: () => { onNewChat(); onNavigate('projects'); onClose(); } },
      { title: 'View Connections Panel', match: 'go to view connections oauth integration instance status', icon: Link2, action: () => { onNavigate('connections'); onClose(); } },
      { title: 'Open Settings Configuration', match: 'go to view settings appearance theme high contrast audio', icon: Settings, action: () => { onNavigate('settings'); onClose(); } },
      { title: 'Show Favourites', match: 'go to view favorites starred bookmarked chats', icon: Star, action: () => { onNavigate('favourites'); onClose(); } },
      { title: 'Go to Projects Browser', match: 'go to view projects list solutions catalog templates', icon: Folder, action: () => { onSelectSolution(''); onNavigate('projects'); onClose(); } },
    ];

    commands.forEach((cmd, idx) => {
      if (!normalizedQuery || cmd.match.includes(normalizedQuery) || cmd.title.toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: `cmd-${idx}`,
          type: 'command',
          title: cmd.title,
          subtitle: 'System command',
          icon: cmd.icon,
          action: cmd.action
        });
      }
    });

    // 3. Dynamic Quick Actions based on query
    if (normalizedQuery && matchedSolutions.length === 0) {
      results.push({
        id: 'action-new-chat',
        type: 'command',
        title: `Start new chat for "${query}"`,
        subtitle: 'Mitra will guide you step by step',
        icon: Plus,
        action: () => {
          onNewChat(undefined, query);
          onClose();
        }
      });
    }

    return results;
  }, [solutions, folders, query, category, onSelectSolution, onNewChat, onNavigate, onClose]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (searchItems.length === 0) return 0;
      return Math.max(0, Math.min(prev, searchItems.length - 1));
    });
  }, [searchItems]);

  // Handle keyboard interaction on input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchItems.length) % searchItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      searchItems[selectedIndex]?.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-[12vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[65vh] animate-fade-in",
          isDark
            ? "bg-neutral-950 border-neutral-800 text-foreground"
            : "bg-white border-slate-200 text-slate-800"
        )}
      >
        {/* Top Input Bar */}
        <div className="flex items-center px-4 border-b border-border shrink-0">
          <Search className="h-4.5 w-4.5 text-muted-foreground/60 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search recent chats, configure templates, run commands..."
            className="w-full bg-transparent text-[14px] font-sans placeholder:text-muted-foreground/45 border-none outline-none py-4 pr-4 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors mr-2 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/40 px-1.5 font-mono text-[9px] font-medium text-muted-foreground/75 shrink-0 shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border shrink-0 overflow-x-auto select-none bg-muted/10">
          {(['all', 'itsm', 'hr', 'csm', 'custom', 'starred'] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSelectedIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-md uppercase tracking-wider transition-all cursor-pointer",
                category === cat
                  ? isDark
                    ? "bg-brand-green/12 text-brand-green border border-brand-green/20"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[150px]">
          {searchItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground/35 mb-2.5" />
              <p className="text-xs text-muted-foreground">No matches found for this search filter.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {searchItems.map((item, index) => {
                const ItemIcon = item.icon;
                const active = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={item.action}
                    className={cn(
                      "group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-all cursor-pointer select-none border border-transparent",
                      active
                        ? isDark
                          ? "bg-neutral-900 border-neutral-800 text-white"
                          : "bg-slate-100 border-slate-200 text-slate-900"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "p-1.5 rounded-lg shrink-0 border",
                        active
                          ? isDark
                            ? "bg-neutral-950 border-neutral-800 text-brand-green"
                            : "bg-white border-slate-300 text-emerald-600"
                          : "bg-muted/30 border-transparent text-muted-foreground/60"
                      )}>
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn(
                          "text-[13px] font-semibold truncate",
                          active
                            ? isDark
                              ? "text-white"
                              : "text-slate-900"
                            : isDark
                              ? "text-slate-300"
                              : "text-slate-700"
                        )}>
                          {item.title}
                        </div>
                        {(item.projectName || item.subtitle) && (
                          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10.5px] leading-normal">
                            {item.projectName && (
                              <span
                                className={cn(
                                  'inline-flex max-w-[9.5rem] shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                                  active
                                    ? isDark
                                      ? 'border-neutral-700 bg-neutral-800/80 text-slate-300'
                                      : 'border-slate-200 bg-white text-slate-600'
                                    : 'border-border/50 bg-muted/20 text-muted-foreground/90',
                                )}
                                title={item.projectName}
                              >
                                <Folder className="h-2.5 w-2.5 shrink-0 opacity-70" />
                                <span className="truncate">{item.projectName}</span>
                              </span>
                            )}
                            {item.projectName && item.subtitle && (
                              <span className="shrink-0 text-muted-foreground/30">·</span>
                            )}
                            {item.subtitle && (
                              <span className="truncate text-muted-foreground/75">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Star & shortcut Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.type === 'chat' && item.solId && (
                        <button
                          type="button"
                          title={item.isStarred ? 'Remove from favorites' : 'Add to favorites'}
                          className={cn(
                            "p-1 rounded transition-colors cursor-pointer",
                            item.isStarred
                              ? "text-emerald-500 hover:bg-muted/40"
                              : "text-muted-foreground/30 hover:text-emerald-500 hover:bg-muted/40 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.solId) onToggleFavorite(item.solId);
                          }}
                        >
                          <Star className={cn("h-3.5 w-3.5", item.isStarred && "fill-emerald-500 text-emerald-500")} />
                        </button>
                      )}
                      
                      {active && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard Navigation Muted Footer */}
        <div className="shrink-0 text-[10px] text-muted-foreground/60 border-t border-border px-4 py-2.5 flex justify-between bg-muted/20 select-none">
          <span>↑↓ to navigate · Enter to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
