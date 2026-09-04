import { useState, useEffect, useRef, type ComponentType, type Ref } from 'react';
import {
  Star,
  MoreVertical,
  ChevronDown,
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
} from '@animateicons/react/lucide';
import type { IconHandle } from '@animateicons/react';
import { ConversationStatusDot } from './ConversationStatusDot';
import { deriveConversationStatus } from '../utils/conversationStatus';
import { ProjectFolder } from '../data/folders';
import { getCollaboratorsForSolution } from '../data/projectShares';
import { ArtifactStatus, ProjectCollaborator, Solution, Theme } from '../types';
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

/** Tag-cloud pill size tier — more usages, larger text. */
function tagSizeClass(count: number): string {
  if (count >= 4) return 'text-[12px]';
  if (count >= 2) return 'text-[10.5px]';
  return 'text-[9.5px]';
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
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [tagDraftBySolution, setTagDraftBySolution] = useState<Record<string, string>>({});
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

  const allTags = Array.from(
    new Set(solutions.flatMap((s) => s.tags ?? [])),
  ).sort((a, b) => a.localeCompare(b));

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
    const conversationStatus = deriveConversationStatus(sol, { generatingSolutionId });
    return (
      <div
        key={sol.id}
        onClick={isEditing ? undefined : () => {
          onSelectSolution(sol.id);
          onNavigate('projects');
        }}
        className={cn(
          'group flex w-full items-center justify-between gap-1.5 rounded-[10px] py-1.75 pl-2.5 pr-1.5 text-[11.25px] leading-tight font-normal transition-all duration-200 select-none',
          isEditing ? 'cursor-default' : 'cursor-pointer',
          active
            ? isDark
              ? 'bg-mitra-highlight text-brand-green'
              : 'bg-muted text-brand-green'
            : isDark
              ? 'text-foreground hover:bg-sidebar-accent hover:text-foreground'
              : 'text-foreground/90 hover:bg-accent/55 hover:text-brand-green',
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
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <ConversationStatusDot status={conversationStatus} />
                <span className="truncate text-left">{sol.name}</span>
              </div>

              {sol.tags && sol.tags.length > 0 && (
                <div className="flex min-w-0 flex-wrap items-center gap-1 pl-[13px]">
                  {sol.tags.slice(0, MAX_INLINE_TAGS).map((tag) => {
                    const isActiveTag = activeTagFilter === tag;
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
                          'inline-flex min-w-0 max-w-[7.5rem] shrink cursor-pointer items-center rounded-full border px-1.5 py-px text-[9.5px] font-medium leading-tight transition-colors',
                          isActiveTag
                            ? 'border-brand-green/30 bg-brand-green/15 text-brand-green'
                            : isDark
                              ? 'border-white/[0.07] bg-mitra-surface text-muted-foreground hover:text-foreground'
                              : 'border-border/70 bg-muted text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <span className="truncate">{tag}</span>
                      </button>
                    );
                  })}
                  {sol.tags.length > MAX_INLINE_TAGS && (
                    <span
                      title={sol.tags.join(', ')}
                      className="text-[9.5px] font-medium leading-tight text-muted-foreground/70"
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
                  className="flex items-center p-0.5 text-brand-green/70"
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
                    isDark ? 'dark bg-mitra-sidebar text-foreground' : 'light bg-card text-foreground',
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
                        isDark ? 'dark bg-mitra-surface text-foreground' : 'light bg-card text-foreground',
                        'w-48'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {folders.length === 0 ? (
                        <div className="px-2 py-1.5 text-[11px] text-muted-foreground italic">
                          No projects available
                        </div>
                      ) : (
                        folders.filter((folder) => !folder.archived).map((folder) => (
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

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer text-[12.5px] py-1.5 focus:bg-accent focus:text-accent-foreground">
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
                                isDark ? 'bg-mitra-highlight text-foreground' : 'bg-muted text-foreground',
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

  const filterByTag = (list: Solution[]) =>
    activeTagFilter ? list.filter((sol) => sol.tags?.includes(activeTagFilter)) : list;

  const pinnedSolutions = filterByTag(solutions.filter((sol) => sol.isPinned));
  const recentSolutions = filterByTag(solutions.filter((sol) => !sol.isPinned));

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
                data-active={active ? 'true' : undefined}
                onClick={() => handleNavClick(item)}
                onMouseEnter={() => setHoveredNavItemId(item.id)}
                onMouseLeave={() => setHoveredNavItemId((current) => (current === item.id ? null : current))}
                className={cn(
                  'architect-nav-item flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium leading-none transition-all duration-200 cursor-pointer border-0',
                  active
                    ? isDark
                      ? 'architect-nav-item--active bg-mitra-highlight text-foreground font-semibold'
                      : 'bg-muted text-foreground font-semibold'
                    : isDark
                      ? 'text-foreground/90 hover:bg-sidebar-accent hover:text-foreground'
                  : 'text-foreground/90 hover:bg-accent/55 hover:text-foreground',
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
      <div className="relative mt-3 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1 pb-2 scrollbar-thin">
        {/* Tags section — collapsible tag cloud, click a tag to filter Pinned/Recents below */}
        {allTags.length > 0 && (
          <div className="flex flex-col shrink-0 space-y-0.5 pb-1">
            <button
              type="button"
              onClick={() => setTagsOpen((open) => !open)}
              className={cn(
                'mb-1 flex w-full items-center gap-1.5 px-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
                isDark
                  ? 'text-illuminate-muted hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-expanded={tagsOpen}
            >
              <span className="inline-flex h-[12px] w-[22px] shrink-0 items-center justify-center">
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-200',
                    !tagsOpen && '-rotate-90',
                  )}
                />
              </span>
              <span>Tags</span>
              {activeTagFilter && (
                <span className="normal-case tracking-normal text-brand-green">· {activeTagFilter}</span>
              )}
            </button>
            {tagsOpen && (
              <div className="flex flex-wrap gap-1.5 px-1.5 pb-1">
                {allTags.map((tag) => {
                  const isActiveTag = activeTagFilter === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTagFilter((current) => (current === tag ? null : tag))}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium leading-tight transition-colors',
                        tagSizeClass(tagCounts[tag]),
                        isActiveTag
                          ? 'bg-brand-green/15 text-brand-green'
                          : isDark
                            ? 'bg-mitra-surface text-muted-foreground hover:text-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {tag}
                      <span className="opacity-60">{tagCounts[tag]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pinned section */}
        {pinnedSolutions.length > 0 && (
          <div className="flex flex-col shrink-0 space-y-0.5 pb-1">
            <button
              type="button"
              onClick={() => setPinnedOpen((open) => !open)}
              className={cn(
                'mb-1 flex w-full items-center gap-1.5 px-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
                isDark
                  ? 'text-illuminate-muted hover:text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-expanded={pinnedOpen}
            >
              <span className="inline-flex h-[12px] w-[22px] shrink-0 items-center justify-center">
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-200',
                    !pinnedOpen && '-rotate-90',
                  )}
                />
              </span>
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
          {pinnedSolutions.length > 0 && (
            <div className="mx-1.5 mb-2 mt-1 h-px shrink-0 bg-border/50 dark:bg-white/[0.05]" />
          )}
          <button
            type="button"
            onClick={() => setRecentsOpen((open) => !open)}
            className={cn(
              'mb-1 mt-1 flex w-full items-center gap-1.5 px-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
              isDark
                ? 'text-illuminate-muted hover:text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-expanded={recentsOpen}
          >
            <span className="inline-flex h-[12px] w-[22px] shrink-0 items-center justify-center">
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  !recentsOpen && '-rotate-90',
                )}
              />
            </span>
            <span>Recents</span>
          </button>
            {recentsOpen ? (
            recentSolutions.length === 0 ? (
              <p className={cn(
                'px-1.5 py-2 text-[11px]',
                isDark ? 'text-illuminate-muted' : 'text-muted-foreground',
              )}>
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
