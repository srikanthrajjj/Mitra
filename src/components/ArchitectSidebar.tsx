import { useState, useEffect, useRef, type ComponentType, type Ref } from 'react';
import {
  Star,
  MoreVertical,
  ChevronDown,
} from 'lucide-react';
import {
  SearchIcon as AnimatedSearchIcon,
  PlusIcon as AnimatedPlusIcon,
  FolderIcon as AnimatedFolderIcon,
  LinkIcon as AnimatedLinkIcon,
  StarIcon as AnimatedStarIcon,
  ZapIcon as AnimatedZapIcon,
  ChartLineIcon as AnimatedChartLineIcon,
  MessageCircleIcon as AnimatedMessageCircleIcon,
} from '@animateicons/react/lucide';
import type { IconHandle } from '@animateicons/react';
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
  onTogglePin?: (id: string) => void;
  onOpenSearch?: () => void;
  generatingSolutionId?: string | null;
}

type NavItemConfig = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string; size?: number; ref?: Ref<IconHandle> }>;
  tab?: string;
  action?: () => void;
  badge?: number;
};

function AnimatedSidebarNavIcon({
  Icon,
  className,
  animate,
}: {
  Icon: ComponentType<{ className?: string; size?: number; ref?: Ref<IconHandle> }>;
  className?: string;
  animate: boolean;
}) {
  const iconRef = useRef<IconHandle>(null);

  useEffect(() => {
    if (animate) {
      iconRef.current?.startAnimation?.();
      return;
    }

    iconRef.current?.stopAnimation?.();
  }, [animate]);

  return <Icon ref={iconRef} size={16} className={className} />;
}

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
  onTogglePin,
  onOpenSearch,
  onRenameSolution,
  onDeleteSolution,
  onMoveSolution,
  generatingSolutionId = null,
}: ArchitectSidebarProps) {
  const isDark = isDarkTheme(theme);
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [hoveredNavItemId, setHoveredNavItemId] = useState<string | null>(null);
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

  const renderSolutionRow = (sol: Solution) => {
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
          'group flex w-full items-center justify-between gap-2 rounded-r-lg px-3 py-1.75 text-[11.25px] leading-tight font-normal transition-all duration-200 select-none border-l-2',
          isEditing ? 'cursor-default' : 'cursor-pointer',
          active
            ? isDark
              ? 'bg-brand-green/10 text-brand-green border-brand-green'
              : 'bg-muted text-brand-green border-brand-green'
            : isDark
              ? 'text-foreground/90 border-transparent hover:bg-brand-green/5 hover:text-brand-green'
              : 'text-foreground/90 border-transparent hover:bg-accent/55 hover:text-brand-green',
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
              "flex-1 min-w-0 px-1 py-0.5 rounded border outline-none text-[11.25px]",
              isDark
                ? 'bg-mitra-surface border-white/[0.06] text-foreground focus:border-brand-green/25'
                : 'bg-card border-border text-foreground focus:border-brand-green'
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
                    isDark ? 'dark bg-mitra-sidebar border-mitra-border text-foreground' : 'light bg-card border-mitra-border text-foreground',
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
                        isDark ? 'dark bg-mitra-surface border-mitra-border text-foreground' : 'light bg-card border-mitra-border text-foreground',
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
                              sol.folderId === folder.id && "font-semibold text-brand-green"
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
                          <DropdownMenuSeparator className={isDark ? 'bg-mitra-surface' : 'bg-muted'} />
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
                      onTogglePin?.(sol.id);
                    }}
                  >
                    {sol.isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>

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
  };

  const navItems: NavItemConfig[] = [
    {
      id: 'search',
      label: 'Search',
      icon: AnimatedSearchIcon,
      action: onOpenSearch,
    },
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: AnimatedPlusIcon,
      action: () => {
        onNewChat();
        onNavigate('projects');
      },
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: AnimatedFolderIcon,
      tab: 'projects',
    },
    { id: 'connections', label: 'Connections', icon: AnimatedLinkIcon, tab: 'connections' },
    {
      id: 'skills',
      label: 'Skills',
      icon: AnimatedZapIcon,
      tab: 'skills',
    },
    {
      id: 'favourites',
      label: 'Favourites',
      icon: AnimatedStarIcon,
      tab: 'favourites',
    },
    {
      id: 'analytics',
      label: 'Mitra Insights',
      icon: AnimatedChartLineIcon,
      tab: 'analytics',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: AnimatedMessageCircleIcon,
      tab: 'feedback',
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

  const pinnedSolutions = solutions.filter((sol) => sol.isPinned);
  const recentSolutions = solutions.filter((sol) => !sol.isPinned);

  return (
    <div className="mitra-sidebar-minimal flex min-h-0 flex-1 flex-col overflow-hidden" data-tour="sidebar">
      <SidebarGroup className="shrink-0 px-2 pt-3 pb-2">
        <SidebarGroupContent className="space-y-0.5">
{navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredNavItemId(item.id)}
                onMouseLeave={() => setHoveredNavItemId((current) => (current === item.id ? null : current))}
                className={cn(
                  'architect-nav-item flex w-full items-center gap-3 rounded-r-lg px-3 py-2.5 text-[13px] font-medium leading-none transition-all duration-200 cursor-pointer border-l-2',
                  active
                    ? isDark
                      ? 'bg-brand-green/10 text-brand-green font-semibold border-brand-green'
                      : 'bg-muted text-brand-green font-semibold border-brand-green'
                    : isDark
                      ? 'text-foreground/90 border-transparent hover:bg-brand-green/5 hover:text-brand-green'
                  : 'text-foreground/90 border-transparent hover:bg-accent/55 hover:text-brand-green',
                )}
              >
                <AnimatedSidebarNavIcon
                  Icon={Icon}
                  animate={hoveredNavItemId === item.id}
                  className={cn(
                    'h-[16px] w-[16px] shrink-0 stroke-[1.8]',
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

      <div className="mx-3 h-px shrink-0 bg-border/60 dark:bg-white/[0.06]" />

      {/* Recents and Pinned list direct render without folders */}
      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 scrollbar-thin">
        {/* Pinned section */}
        {pinnedSolutions.length > 0 && (
          <div className="flex flex-col shrink-0 space-y-0.5 pb-1">
            <button
              type="button"
              onClick={() => setPinnedOpen((open) => !open)}
              className="mb-1 flex w-full items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 transition-colors hover:text-foreground/80"
              aria-expanded={pinnedOpen}
            >
              <ChevronDown
                className={cn(
                  'h-3 w-3 shrink-0 transition-transform duration-200',
                  !pinnedOpen && '-rotate-90',
                )}
              />
              <span>Pinned</span>
            </button>
            {pinnedOpen ? (
              <>
                {pinnedSolutions.map((sol) => renderSolutionRow(sol))}
              </>
            ) : null}
          </div>
        )}

        {/* Recents section */}
        <div className="flex flex-col flex-1 space-y-0.5 pb-2">
          {pinnedSolutions.length > 0 && (
            <div className="mx-3 mb-2 mt-1 h-px shrink-0 bg-border/50 dark:bg-white/[0.05]" />
          )}
          <button
            type="button"
            onClick={() => setRecentsOpen((open) => !open)}
            className="mb-1 mt-1 flex w-full items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 transition-colors hover:text-foreground/80"
            aria-expanded={recentsOpen}
          >
            <ChevronDown
              className={cn(
                'h-3 w-3 shrink-0 transition-transform duration-200',
                !recentsOpen && '-rotate-90',
              )}
            />
            <span>Recents</span>
          </button>
          {recentsOpen ? (
            recentSolutions.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-muted-foreground/50">
                No recent chats
              </p>
            ) : (
              recentSolutions.map((sol) => renderSolutionRow(sol))
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
