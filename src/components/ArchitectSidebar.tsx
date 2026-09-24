import { useState, useEffect, useRef, type ComponentType, type ReactNode, type Ref } from 'react';
import {
  Archive,
  ArchiveRestore,
  ChevronRight,
  Folder,
  Plus,
  Star,
  MoreVertical,
  Share2,
  X,
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
  SparklesIcon as AnimatedSparklesIcon,
  ChevronDownIcon as AnimatedChevronDownIcon,
  BellIcon as AnimatedBellIcon,
} from '@animateicons/react/lucide';
import type { IconHandle } from '@animateicons/react';
import { ProjectFolder } from '../data/folders';
import { getCollaboratorsForSolution } from '../data/projectShares';
import { ArtifactStatus, ProjectCollaborator, Solution, Theme } from '../types';
import { SidebarGroup, SidebarGroupContent } from '@/src/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { isDarkTheme } from '../utils/theme';
import { assignTagTones } from '../utils/tagColors';
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
  onOpenFolder?: (folderId: string) => void;
  onRenameFolder: (folderId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRestoreFolder: (folderId: string) => void;
  onRenameSolution: (solutionId: string, name: string) => void;
  onDeleteSolution: (solutionId: string) => void;
  onMoveSolution?: (solutionId: string, folderId: string | undefined) => void;
  onUpdateTags: (solutionId: string, tags: string[]) => void;
  projectCollaborators?: ProjectCollaborator[];
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

/** Tags shown inline under a conversation name before collapsing into a +N. */
const MAX_INLINE_TAGS = 2;

/** Less-used destinations that sit under "More" in the nav, like Claude's sidebar. */
const MORE_NAV_TABS = ['skills', 'capabilities', 'favourites', 'analytics', 'announcements', 'feedback'];

export function ArchitectSidebar({
  theme,
  activeTab,
  folders,
  solutions,
  selectedSidebarId,
  focusedFolderId,
  onNavigate,
  onSelectSolution,
  onCreateFolder,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onRestoreFolder,
  renamingFolderId,
  onRenamingComplete,
  onNewChat,
  onToggleFavorite,
  onTogglePin,
  onOpenSearch,
  onRenameSolution,
  onDeleteSolution,
  onMoveSolution,
  onUpdateTags,
  projectCollaborators = [],
  generatingSolutionId = null,
}: ArchitectSidebarProps) {
  const isDark = isDarkTheme(theme);
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [tagDraftBySolution, setTagDraftBySolution] = useState<Record<string, string>>({});
  const [hoveredNavItemId, setHoveredNavItemId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [folderEditName, setFolderEditName] = useState('');
  const folderRenameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSolutionId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingSolutionId]);

  // A folder created from the + button arrives with renamingFolderId set, so it opens
  // straight into the rename input instead of sitting there as "untitled".
  useEffect(() => {
    if (folderRenameInputRef.current) {
      folderRenameInputRef.current.focus();
      folderRenameInputRef.current.select();
    }
  }, [editingFolderId, renamingFolderId]);

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const startFolderRename = (folder: ProjectFolder) => {
    setEditingFolderId(folder.id);
    setFolderEditName(folder.name);
  };

  const commitFolderRename = (folderId: string) => {
    onRenameFolder(folderId, folderEditName);
    setEditingFolderId(null);
    onRenamingComplete();
  };

  const cancelFolderRename = () => {
    setEditingFolderId(null);
    onRenamingComplete();
  };

  const commitRename = () => {
    if (editingSolutionId && onRenameSolution) {
      onRenameSolution(editingSolutionId, editName);
    }
    setEditingSolutionId(null);
  };

  const cancelRename = () => {
    setEditingSolutionId(null);
  };

  const allTags = Array.from(
    new Set(solutions.flatMap((s) => s.tags ?? [])),
  ).sort((a, b) => a.localeCompare(b));
  const tagTone = assignTagTones(allTags);

  const tagCounts = solutions.reduce<Record<string, number>>((acc, s) => {
    (s.tags ?? []).forEach((t) => {
      acc[t] = (acc[t] ?? 0) + 1;
    });
    return acc;
  }, {});

  const addTag = (sol: Solution, rawTag: string) => {
    const tag = rawTag.trim();
    if (!tag) return;
    const existing = sol.tags ?? [];
    if (existing.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setTagDraftBySolution((prev) => ({ ...prev, [sol.id]: '' }));
      return;
    }
    onUpdateTags(sol.id, [...existing, tag]);
    setTagDraftBySolution((prev) => ({ ...prev, [sol.id]: '' }));
  };

  const removeTag = (sol: Solution, tag: string) => {
    onUpdateTags(sol.id, (sol.tags ?? []).filter((t) => t !== tag));
  };

  const tagSuggestions = (sol: Solution) => {
    const draft = (tagDraftBySolution[sol.id] ?? '').trim().toLowerCase();
    if (!draft) return [];
    const existing = new Set((sol.tags ?? []).map((t) => t.toLowerCase()));
    return allTags.filter((t) => !existing.has(t.toLowerCase()) && t.toLowerCase().includes(draft));
  };

  const renderSolutionRow = (sol: Solution) => {
    const active = activeTab === 'projects' && selectedSidebarId === sol.id && sol.chatHistory.length > 0;
    const isEditing = editingSolutionId === sol.id;
    return (
      <div
        key={sol.id}
        onClick={isEditing ? undefined : () => {
          onSelectSolution(sol.id);
          onNavigate('projects');
        }}
        className={cn(
          'group flex w-full items-center justify-between gap-1.5 rounded-[10px] py-1.75 pl-2.5 pr-1.5 text-[13px] leading-tight font-normal transition-all duration-200 select-none',
          isEditing ? 'cursor-default' : 'cursor-pointer',
          active
            ? isDark
              ? 'bg-mitra-highlight text-brand-green'
              : 'bg-muted text-brand-green-deep'
            : isDark
              ? 'text-foreground hover:bg-sidebar-accent'
              : 'text-foreground hover:bg-accent/55 hover:text-brand-green-deep',
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
              "flex-1 min-w-0 px-1 py-0.5 rounded border outline-none text-[13px]",
              isDark
                ? 'bg-mitra-surface border-white/[0.06] text-foreground focus:border-brand-green/25'
                : 'bg-card border-border text-foreground focus:border-brand-green'
            )}
          />
        ) : (
          <>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-left">{sol.name}</span>
              </div>

              {sol.tags && sol.tags.length > 0 && (
                <div className="flex min-w-0 flex-wrap items-center gap-1">
                  {sol.tags.slice(0, MAX_INLINE_TAGS).map((tag) => {
                    const isActiveTag = activeTagFilter === tag;
                    const tone = tagTone(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        title={`Filter by ${tag}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTagFilter((current) => (current === tag ? null : tag));
                        }}
                        className={cn(
                          'inline-flex min-w-0 max-w-[7.5rem] shrink cursor-pointer items-center rounded-full px-1.5 py-0.5 text-[11px] font-normal leading-tight transition-colors',
                          tone.chip,
                          tone.hover,
                          isActiveTag && tone.selected,
                        )}
                      >
                        <span className="truncate">{tag}</span>
                      </button>
                    );
                  })}
                  {sol.tags.length > MAX_INLINE_TAGS && (
                    <span
                      title={sol.tags.join(', ')}
                      className="text-[11px] font-normal leading-tight text-foreground"
                    >
                      +{sol.tags.length - MAX_INLINE_TAGS}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-0.5 self-start">
              {getCollaboratorsForSolution(projectCollaborators, sol.id).length > 0 && (
                <span
                  title={`Shared with ${getCollaboratorsForSolution(projectCollaborators, sol.id)
                    .map((c) => c.name)
                    .join(', ')}`}
                  className="flex items-center p-0.5 text-brand-green-deep dark:text-brand-green"
                >
                  <Share2 className="h-3 w-3" />
                </span>
              )}

              {/* Favorite star */}
              <button
                type="button"
                title={sol.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={cn(
                  'p-0.5 rounded transition-all cursor-pointer',
                  sol.isFavorite
                    ? 'text-foreground opacity-100'
                    : 'text-foreground opacity-0 group-hover:opacity-100'
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
                      'p-0.5 rounded transition-all shrink-0 cursor-pointer text-foreground',
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
                    isDark ? 'dark bg-mitra-sidebar text-foreground' : 'light bg-card text-foreground',
                    'w-40'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground">
                      Move to folder
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      className={cn(
                        isDark ? 'dark bg-mitra-surface text-foreground' : 'light bg-card text-foreground',
                        'w-48'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {folders.length === 0 ? (
                        <div className="px-2 py-1.5 text-[12.5px] text-muted-foreground italic">
                          No folders available
                        </div>
                      ) : (
                        folders.filter((folder) => !folder.archived).map((folder) => (
                          <DropdownMenuItem
                            key={folder.id}
                            className={cn(
                              "cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground",
                              sol.folderId === folder.id && "font-semibold text-brand-green-deep dark:text-brand-green"
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
                            className="cursor-pointer text-[13.5px] py-1.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveSolution?.(sol.id, undefined);
                            }}
                          >
                            Remove from folder
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground">
                      Add Tag
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      className={cn(
                        isDark ? 'dark bg-mitra-surface text-foreground' : 'light bg-card text-foreground',
                        'w-56 p-2'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sol.tags && sol.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {sol.tags.map((tag) => (
                            <span
                              key={tag}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                tagTone(tag).chip,
                              )}
                            >
                              {tag}
                              <button
                                type="button"
                                title={`Remove ${tag}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTag(sol, tag);
                                }}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input
                        value={tagDraftBySolution[sol.id] ?? ''}
                        onChange={(e) =>
                          setTagDraftBySolution((prev) => ({ ...prev, [sol.id]: e.target.value }))
                        }
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(sol, tagDraftBySolution[sol.id] ?? '');
                          }
                        }}
                        placeholder="Add tag…"
                        className={cn(
                          'w-full rounded-md border px-2 py-1 text-[12px] outline-none',
                          isDark
                            ? 'border-white/[0.08] bg-mitra-input text-foreground placeholder:text-muted-foreground'
                            : 'border-border bg-card text-foreground placeholder:text-muted-foreground',
                        )}
                      />
                      {tagSuggestions(sol).length > 0 && (
                        <div
                          className={cn(
                            'mt-1 flex flex-col overflow-hidden rounded-md border',
                            isDark ? 'border-white/[0.08]' : 'border-border',
                          )}
                        >
                          {tagSuggestions(sol).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addTag(sol, tag);
                              }}
                              className="px-2 py-1 text-left text-[11.5px] text-foreground hover:bg-accent"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuItem
                    className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin?.(sol.id);
                    }}
                  >
                    {sol.isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSolutionId(sol.id);
                      setEditName(sol.name);
                    }}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-[13.5px] py-1.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
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
      id: 'capabilities',
      label: 'Capabilities',
      icon: AnimatedSparklesIcon,
      tab: 'capabilities',
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
      id: 'announcements',
      label: 'Announcements',
      icon: AnimatedBellIcon,
      tab: 'announcements',
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
    if (item.id === 'more') return moreOpen || MORE_NAV_TABS.includes(activeTab);
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

  const primaryNavItems = navItems.filter((item) => !MORE_NAV_TABS.includes(item.tab ?? ''));
  const moreNavItems = navItems.filter((item) => MORE_NAV_TABS.includes(item.tab ?? ''));
  // "More" opens a flyout menu beside the nav, like Claude's sidebar.
  const moreToggle: NavItemConfig = { id: 'more', label: 'More', icon: AnimatedChevronDownIcon };
  const visibleNavItems = [...primaryNavItems, moreToggle];

  const renderMoreMenu = (trigger: ReactNode) => (
    <DropdownMenu key="more" open={moreOpen} onOpenChange={setMoreOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={8} className={cn(theme, 'w-52')}>
        {moreNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => handleNavClick(item)}
              className={cn(
                'cursor-pointer gap-3 px-2.5 py-2 text-[13px]',
                isActive(item) && (isDark ? 'bg-mitra-highlight' : 'bg-muted'),
              )}
            >
              <Icon size={16} className="h-4 w-4 shrink-0" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const filterByTag = (list: Solution[]) =>
    activeTagFilter ? list.filter((sol) => sol.tags?.includes(activeTagFilter)) : list;

  const pinnedSolutions = filterByTag(solutions.filter((sol) => sol.isPinned));

  // Every project is listed, most recently active first, and each expands to its chats.
  const activeFolders = folders.filter((folder) => !folder.archived);
  const activeFolderIds = new Set(activeFolders.map((folder) => folder.id));
  // Filed means "filed somewhere the user can actually see". A chat pointing at an archived or
  // missing folder falls back to Recents rather than rendering nowhere at all.
  const isFiled = (sol: Solution) => !!sol.folderId && activeFolderIds.has(sol.folderId);
  // A chat in a project is listed under that project, so Recents stays the loose chats.
  // Without this, moving a chat into a folder changed nothing on screen.
  const recentSolutions = filterByTag(solutions.filter((sol) => !sol.isPinned && !isFiled(sol)));
  const folderActivity = (folder: ProjectFolder) =>
    Math.max(
      Date.parse(folder.updatedAt ?? '') || 0,
      ...solutions.filter((sol) => sol.folderId === folder.id).map((sol) => Date.parse(sol.createdAt) || 0),
    );
  const sortedFolders = [...activeFolders].sort((a, b) => folderActivity(b) - folderActivity(a));
  const archivedFolders = folders.filter((folder) => folder.archived);
  const solutionsInFolder = (folderId: string) =>
    filterByTag(solutions.filter((sol) => sol.folderId === folderId));

  return (
    <div className="mitra-sidebar-minimal flex min-h-0 flex-1 flex-col overflow-hidden" data-tour="sidebar">
      <SidebarGroup className="shrink-0 px-2 pt-3 pb-2">
        <SidebarGroupContent className="space-y-0.5">
{visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const navButton = (
              <button
                key={item.id}
                type="button"
                data-active={active ? 'true' : undefined}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredNavItemId(item.id)}
                onMouseLeave={() => setHoveredNavItemId((current) => (current === item.id ? null : current))}
                className={cn(
                  'architect-nav-item flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[15px] font-normal leading-none transition-all duration-200 cursor-pointer border-0',
                  active
                    ? isDark
                      ? 'architect-nav-item--active bg-mitra-highlight text-foreground'
                      : 'bg-muted text-foreground'
                    : isDark
                      ? 'text-foreground hover:bg-sidebar-accent'
                  : 'text-foreground hover:bg-accent/55',
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
                  <span className="architect-nav-badge ml-auto min-w-[1.25rem] rounded-md bg-muted px-1.5 py-0.5 text-center text-[11px] font-normal tabular-nums leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
            return item.id === 'more' ? renderMoreMenu(navButton) : navButton;
          })}
        </SidebarGroupContent>
      </SidebarGroup>


      {/* Recents and Pinned list direct render without folders */}
      <div className="relative mt-3 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 pb-2 scrollbar-thin">
        {/* Projects: every project, each expanding to the chats filed under it */}
        {(sortedFolders.length > 0 || archivedFolders.length > 0) && (
          <div className="flex flex-col shrink-0 space-y-0.5">
            <div className="mb-1 flex items-center justify-between px-2.5">
              <span className="text-[12px] font-normal tracking-wider text-foreground [font-variant-caps:all-small-caps]">
                Projects
              </span>
              <button
                type="button"
                onClick={() => onCreateFolder()}
                title="New project"
                aria-label="New project"
                className={cn(
                  'rounded-md p-0.5 text-foreground transition-colors',
                  isDark ? 'hover:bg-sidebar-accent' : 'hover:bg-accent/55',
                )}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {sortedFolders.map((folder) => {
              const folderEditing =
                editingFolderId === folder.id || renamingFolderId === folder.id;
              const folderActive =
                activeTab === 'projects' && !selectedSidebarId && focusedFolderId === folder.id;
              const expanded = expandedFolderIds.has(folder.id);
              const children = solutionsInFolder(folder.id);

              return (
                <div key={folder.id} className="flex flex-col space-y-0.5">
                  <div
                    onClick={
                      folderEditing
                        ? undefined
                        : () => {
                            // Opening a project also reveals its chats; collapsing is the chevron's job.
                            setExpandedFolderIds((prev) => new Set(prev).add(folder.id));
                            onOpenFolder?.(folder.id);
                          }
                    }
                    title={folderEditing ? undefined : folder.name}
                    className={cn(
                      'group flex w-full min-w-0 items-center gap-1 rounded-[10px] py-1.75 pl-1 pr-1.5 text-left text-[13px] leading-tight font-normal transition-all duration-200 select-none',
                      folderEditing ? 'cursor-default' : 'cursor-pointer',
                      folderActive
                        ? isDark
                          ? 'bg-mitra-highlight text-brand-green'
                          : 'bg-muted text-brand-green-deep'
                        : isDark
                          ? 'text-foreground hover:bg-sidebar-accent'
                          : 'text-foreground hover:bg-accent/55 hover:text-brand-green-deep',
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderExpanded(folder.id);
                      }}
                      aria-expanded={expanded}
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${folder.name}`}
                      className="shrink-0 cursor-pointer rounded p-0.5 text-foreground"
                    >
                      <ChevronRight
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          expanded && 'rotate-90',
                        )}
                      />
                    </button>

                    <Folder className="h-4 w-4 shrink-0" aria-hidden />

                    {folderEditing ? (
                      <input
                        ref={folderRenameInputRef}
                        value={folderEditName}
                        onChange={(e) => setFolderEditName(e.target.value)}
                        onBlur={() => commitFolderRename(folder.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitFolderRename(folder.id);
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelFolderRename();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          'min-w-0 flex-1 rounded border px-1 py-0.5 text-[13px] outline-none',
                          isDark
                            ? 'bg-mitra-surface border-white/[0.06] text-foreground focus:border-brand-green/25'
                            : 'bg-card border-border text-foreground focus:border-brand-green',
                        )}
                      />
                    ) : (
                      <>
                        <span className="flex-1 truncate">{folder.name}</span>

                        {children.length > 0 && (
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground group-hover:hidden">
                            {children.length}
                          </span>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              title="Project options"
                              aria-label={`Options for ${folder.name}`}
                              className={cn(
                                'shrink-0 cursor-pointer rounded p-0.5 text-foreground transition-all',
                                'opacity-0 group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100',
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={cn(
                              isDark ? 'dark bg-mitra-sidebar text-foreground' : 'light bg-card text-foreground',
                              'w-40',
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNewChat(folder.id);
                              }}
                            >
                              New chat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenFolder?.(folder.id);
                              }}
                            >
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                startFolderRename(folder);
                              }}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-[13.5px] py-1.5 focus:bg-accent focus:text-accent-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreateFolder();
                              }}
                            >
                              New project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className={isDark ? 'bg-mitra-surface' : 'bg-muted'} />
                            {/* Archive, not delete: App keeps the folder and its threads restorable. */}
                            <DropdownMenuItem
                              className="cursor-pointer text-[13.5px] py-1.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFolder(folder.id);
                              }}
                            >
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>

                  {expanded && (
                    <div
                      className={cn(
                        'ml-[1.1rem] flex flex-col space-y-0.5 border-l pl-1',
                        isDark ? 'border-white/[0.08]' : 'border-border',
                      )}
                    >
                      {children.length === 0 ? (
                        activeTagFilter ? (
                          <p className="px-2.5 py-1.5 text-[12.5px] text-muted-foreground">
                            {`No chats tagged "${activeTagFilter}"`}
                          </p>
                        ) : (
                          /* An empty project should offer the way out of being empty. */
                          <div className="flex flex-col gap-0.5 px-1.5 pb-1 pt-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNewChat(folder.id);
                              }}
                              className={cn(
                                'flex w-full items-center gap-1.5 rounded-[10px] px-1.5 py-1.5 text-left text-[12.5px] font-normal transition-colors',
                                isDark
                                  ? 'text-foreground hover:bg-sidebar-accent'
                                  : 'text-foreground hover:bg-accent/55 hover:text-brand-green-deep',
                              )}
                            >
                              <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              Create a chat
                            </button>
                            <p className="px-1.5 text-[11px] leading-snug text-muted-foreground">
                              or file an existing one here from its menu
                            </p>
                          </div>
                        )
                      ) : (
                        children.map((sol) => renderSolutionRow(sol))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {archivedFolders.length > 0 && (
              <div className="flex flex-col space-y-0.5 pt-1">
                <button
                  type="button"
                  onClick={() => setArchivedOpen((open) => !open)}
                  aria-expanded={archivedOpen}
                  className={cn(
                    'flex w-full items-center gap-1 rounded-[10px] py-1 pl-1 pr-1.5 text-left text-[12px] font-normal text-muted-foreground transition-colors',
                    isDark ? 'hover:bg-sidebar-accent' : 'hover:bg-accent/55',
                  )}
                >
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                      archivedOpen && 'rotate-90',
                    )}
                  />
                  <Archive className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="flex-1 truncate">Archived</span>
                  <span className="shrink-0 tabular-nums">{archivedFolders.length}</span>
                </button>

                {archivedOpen &&
                  archivedFolders.map((folder) => (
                    <div
                      key={folder.id}
                      title={folder.name}
                      className={cn(
                        'group flex w-full min-w-0 items-center gap-2 rounded-[10px] py-1.75 pl-[1.6rem] pr-1.5 text-left text-[13px] leading-tight font-normal text-muted-foreground transition-all duration-200',
                        isDark ? 'hover:bg-sidebar-accent' : 'hover:bg-accent/55',
                      )}
                    >
                      <span className="flex-1 truncate">{folder.name}</span>
                      <button
                        type="button"
                        onClick={() => onRestoreFolder(folder.id)}
                        title={`Restore ${folder.name}`}
                        aria-label={`Restore ${folder.name}`}
                        className={cn(
                          'shrink-0 cursor-pointer rounded p-0.5 text-foreground transition-all',
                          'opacity-0 group-hover:opacity-100 focus:opacity-100',
                        )}
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tags section — collapsible tag cloud, click a tag to filter Pinned/Recents below */}
        {allTags.length > 0 && (
          <div className="flex flex-col shrink-0 space-y-0.5">
            <button
              type="button"
              onClick={() => setTagsOpen((open) => !open)}
              className={cn(
                'mb-1 flex w-full items-center gap-1.5 px-2.5 text-[12px] font-normal tracking-wider [font-variant-caps:all-small-caps] transition-colors',
                'text-foreground',
              )}
              aria-expanded={tagsOpen}
            >
              <span>Tags</span>
              {activeTagFilter && (
                <span className={cn('normal-case tracking-normal [font-variant-caps:normal]', tagTone(activeTagFilter).text)}>· {activeTagFilter}</span>
              )}
            </button>
            {tagsOpen && (
              <div className="flex flex-wrap gap-1 px-2.5 pb-1">
                {allTags.map((tag) => {
                  const isActiveTag = activeTagFilter === tag;
                  const tone = tagTone(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTagFilter((current) => (current === tag ? null : tag))}
                      className={cn(
                        'inline-flex max-w-[7.5rem] items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-normal leading-tight transition-colors',
                        tone.chip,
                        tone.hover,
                        isActiveTag && tone.selected,
                      )}
                    >
                      <span className="truncate">{tag}</span>
                      <span className="tabular-nums">{tagCounts[tag]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pinned section */}
        {pinnedSolutions.length > 0 && (
          <div className="flex flex-col shrink-0 space-y-0.5">
            <button
              type="button"
              onClick={() => setPinnedOpen((open) => !open)}
              className={cn(
                'mb-1 flex w-full items-center gap-1.5 px-2.5 text-[12px] font-normal tracking-wider [font-variant-caps:all-small-caps] transition-colors',
                'text-foreground',
              )}
              aria-expanded={pinnedOpen}
            >
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
        <div className="flex flex-1 flex-col space-y-0.5">
          <button
            type="button"
            onClick={() => setRecentsOpen((open) => !open)}
            className={cn(
              'mb-1 flex w-full items-center gap-1.5 px-2.5 text-[12px] font-normal tracking-wider [font-variant-caps:all-small-caps] transition-colors',
              'text-foreground',
            )}
            aria-expanded={recentsOpen}
          >
            <span>Recents</span>
          </button>
          {recentsOpen ? (
            recentSolutions.length === 0 ? (
              <p
                className={cn(
                  'px-2.5 py-2 text-[12.5px] text-foreground',
                )}
              >
                {activeTagFilter ? `No chats tagged "${activeTagFilter}"` : 'No recent chats'}
              </p>
            ) : (
              recentSolutions.map((sol) => renderSolutionRow(sol))
            )
          ) : null}
        </div>
        </div>
        {isDark && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-b from-transparent to-mitra-sidebar"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
