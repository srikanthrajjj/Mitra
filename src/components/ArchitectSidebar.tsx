import { useState, useEffect, useRef } from 'react';
import {
  Folder,
  Link2,
  Plus,
  Star,
  Search,
  MessageSquare,
  MoreVertical,
  type LucideIcon,
} from 'lucide-react';
import { ConversationStatusDot } from './ConversationStatusDot';
import { deriveConversationStatus } from '../utils/conversationStatus';
import { ProjectFolder } from '../data/folders';
import { ArtifactStatus, Solution, Theme } from '../types';
import { SidebarGroup, SidebarGroupContent } from '@/src/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { isDarkTheme } from '../utils/theme';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';

interface ArchitectSidebarProps {
  theme: Theme;
  activeTab: string;
  folders: ProjectFolder[];
  solutions: Solution[];
  selectedSidebarId: string;
  focusedFolderId: string;
  renamingFolderId: string | null;
  onNavigate: (tab: string) => void;
  onSelectSolution: (solutionId: string) => void;
  onCreateFolder: () => string;
  onRenameFolder: (folderId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameSolution: (solutionId: string, name: string) => void;
  onDeleteSolution: (solutionId: string) => void;
  onMoveSolution?: (solutionId: string, folderId: string | undefined) => void;
  onNewChat: (folderId?: string) => string;
  onRenamingComplete: () => void;
  statusOverrides?: Record<string, ArtifactStatus>;
  onToggleFavorite: (id: string) => void;
  onOpenSearch?: () => void;
  generatingSolutionId?: string | null;
}

type NavItemConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  tab?: string;
  action?: () => void;
  badge?: number;
  iconFilled?: boolean;
};

export function ArchitectSidebar({
  theme,
  activeTab,
  folders,
  solutions,
  selectedSidebarId,
  onNavigate,
  onSelectSolution,
  onNewChat,
  onToggleFavorite,
  onOpenSearch,
  onRenameSolution,
  onDeleteSolution,
  onMoveSolution,
  generatingSolutionId = null,
}: ArchitectSidebarProps) {
  const isDark = isDarkTheme(theme);
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSolutionId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingSolutionId]);

  const commitRename = () => {
    if (editingSolutionId && onRenameSolution) {
      onRenameSolution(editingSolutionId, editName);
    }
    setEditingSolutionId(null);
  };

  const cancelRename = () => {
    setEditingSolutionId(null);
  };
  const projectCount = solutions.length; // Badge count of projects/solutions in the system

  const navItems: NavItemConfig[] = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      action: onOpenSearch,
    },
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: Plus,
      action: () => {
        onNewChat();
        onNavigate('projects');
      },
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Folder,
      tab: 'projects',
    },
    { id: 'connections', label: 'Connections', icon: Link2, tab: 'connections' },
    {
      id: 'favourites',
      label: 'Favourites',
      icon: Star,
      tab: 'favourites',
      iconFilled: true,
    },
  ];

  const isActive = (item: NavItemConfig) => {
    if (item.id === 'new-chat') {
      if (!selectedSidebarId) return false;
      const activeSolution = solutions.find(s => s.id === selectedSidebarId);
      const isNewChat = activeTab === 'projects' && (!activeSolution || activeSolution.chatHistory.length === 0);
      return isNewChat;
    }
    if (item.id === 'projects') {
      return activeTab === 'projects' && !selectedSidebarId;
    }
    if (item.tab) return activeTab === item.tab;
    return false;
  };

  const handleNavClick = (item: NavItemConfig) => {
    if (item.action) {
      item.action();
      return;
    }
    // Clicking 'projects' also clears active chat thread selection to show project list browser
    if (item.id === 'projects') {
      onSelectSolution('');
    }
    if (item.tab) onNavigate(item.tab);
  };

  return (
    <div className="mitra-sidebar-minimal flex min-h-0 flex-1 flex-col overflow-hidden">
      <SidebarGroup className="shrink-0 px-2 py-3">
        <SidebarGroupContent className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={cn(
                  'architect-nav-item flex w-full items-center gap-3 rounded-r-lg px-3 py-2.5 text-[13px] font-medium leading-none transition-all duration-200 cursor-pointer border-l-2',
                  active
                    ? isDark
                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-emerald-500'
                      : 'bg-emerald-50 text-emerald-700 font-semibold border-emerald-500'
                    : isDark
                      ? 'text-slate-400 border-transparent hover:bg-emerald-500/5 hover:text-emerald-400'
                      : 'text-slate-600 border-transparent hover:bg-emerald-50/55 hover:text-emerald-700',
                )}
              >
                <Icon
                  className={cn(
                    'h-[16px] w-[16px] shrink-0 stroke-[1.8]',
                    item.iconFilled && active && 'fill-current',
                  )}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="architect-nav-badge ml-auto min-w-[1.25rem] rounded-md bg-muted px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Recents list direct render without folders */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2">
        <div className="text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-3 mb-2 mt-2">
          Recents
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 pb-3">
          {solutions.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/50 px-3 py-2">
              No recent chats
            </p>
          ) : (
            solutions.map((sol) => {
              const active = activeTab === 'projects' && selectedSidebarId === sol.id && sol.chatHistory.length > 0;
              const isEditing = editingSolutionId === sol.id;
              const conversationStatus = deriveConversationStatus(sol, { generatingSolutionId });
              return (
                <div
                  key={sol.id}
                  onClick={isEditing ? undefined : () => {
                    onSelectSolution(sol.id);
                    onNavigate('projects');
                  }}
                  className={cn(
                    'group flex w-full items-center justify-between gap-2 rounded-r-lg px-3 py-2.5 text-[12.5px] leading-tight font-medium transition-all duration-200 select-none border-l-2',
                    isEditing ? 'cursor-default' : 'cursor-pointer',
                    active
                      ? isDark
                        ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-emerald-500'
                        : 'bg-emerald-50 text-emerald-700 font-semibold border-emerald-500'
                      : isDark
                        ? 'text-slate-400 border-transparent hover:bg-emerald-500/5 hover:text-emerald-400'
                        : 'text-slate-600 border-transparent hover:bg-emerald-50/55 hover:text-emerald-700',
                  )}
                >
                  {isEditing ? (
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
                      className={cn(
                        "flex-1 min-w-0 font-medium px-1 py-0.5 rounded border outline-none text-[12px]",
                        isDark
                          ? 'bg-zinc-800 border-white/[0.06] text-zinc-100 focus:border-brand-green/25'
                          : 'bg-white border-emerald-200 text-slate-800 focus:border-brand-green'
                      )}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <ConversationStatusDot status={conversationStatus} />
                        <span className="truncate text-left">{sol.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-0.5 shrink-0">
                        {/* Favorite star */}
                        <button
                          type="button"
                          title={sol.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          className={cn(
                            'p-0.5 rounded transition-all cursor-pointer',
                            sol.isFavorite
                              ? 'text-muted-foreground/50 opacity-100'
                              : 'text-muted-foreground/25 hover:text-muted-foreground/50 opacity-0 group-hover:opacity-100'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(sol.id);
                          }}
                        >
                          <Star className={cn('h-3 w-3', sol.isFavorite && 'fill-current')} />
                        </button>

                        {/* Options menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              title="Options"
                              className={cn(
                                'p-0.5 rounded transition-all shrink-0 cursor-pointer text-muted-foreground/35 hover:text-foreground',
                                'opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100 md:opacity-0'
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={cn(
                              isDark ? 'dark bg-zinc-900 border-zinc-800 text-zinc-100' : 'light bg-white border-slate-200 text-slate-900',
                              'w-40'
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="cursor-pointer text-[12.5px] py-1.5 focus:bg-accent focus:text-accent-foreground">
                                Move to project
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent
                                className={cn(
                                  isDark ? 'dark bg-zinc-900 border-zinc-800 text-zinc-100' : 'light bg-white border-slate-200 text-slate-900',
                                  'w-48'
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {folders.length === 0 ? (
                                  <div className="px-2 py-1.5 text-[11px] text-muted-foreground italic">
                                    No projects available
                                  </div>
                                ) : (
                                  folders.map((folder) => (
                                    <DropdownMenuItem
                                      key={folder.id}
                                      className={cn(
                                        "cursor-pointer text-[12.5px] py-1.5 focus:bg-accent focus:text-accent-foreground",
                                        sol.folderId === folder.id && "font-semibold text-emerald-500"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveSolution?.(sol.id, folder.id);
                                      }}
                                    >
                                      <span className="truncate">{folder.name}</span>
                                    </DropdownMenuItem>
                                  ))
                                )}
                                {sol.folderId && (
                                  <>
                                    <DropdownMenuSeparator className={isDark ? 'bg-zinc-800' : 'bg-slate-100'} />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-[12.5px] py-1.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveSolution?.(sol.id, undefined);
                                      }}
                                    >
                                      Remove from project
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                              className="cursor-pointer text-[12.5px] py-1.5 focus:bg-accent focus:text-accent-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSolutionId(sol.id);
                                setEditName(sol.name);
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-[12.5px] py-1.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSolution?.(sol.id);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
