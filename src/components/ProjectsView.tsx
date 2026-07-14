import { useMemo, useRef, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  FolderOpen,
  LayoutGrid,
  List,
  ExternalLink,
  FileText,
  GitBranch,
  MessageSquare,
  Clock,
  X,
  Sparkles,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';
import { Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/ui/button';

type Filter = 'all' | 'mine' | 'shared' | 'organisational';
type ViewMode = 'list' | 'grid';

interface ProjectsViewProps {
  theme: Theme;
  solutions: Solution[];
  activeSolutionId?: string;
  onSelectSolution: (solutionId: string) => void;
  onNewProject: () => void;
  onStartConversation: (solutionId: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  not_started: { label: 'Not started', dot: 'bg-muted-foreground/40' },
  discovering: { label: 'Discovering', dot: 'bg-amber-400/70' },
  designing: { label: 'Designing', dot: 'bg-amber-400/70' },
  generating: { label: 'Generating', dot: 'bg-brand-green/70' },
  completed: { label: 'Completed', dot: 'bg-brand-green' },
};

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  mine: 'Mine',
  shared: 'Shared',
  organisational: 'Organisational',
};

function getStats(sol: Solution) {
  return {
    requirements: sol.blueprint.discoveredRequirements?.length ?? 0,
    architecture: sol.blueprint.architectureSteps?.length ?? 0,
    messages: sol.chatHistory.filter((m) => m.sender === 'user').length,
  };
}

function getLastUpdated(sol: Solution): string {
  const last = sol.chatHistory[sol.chatHistory.length - 1];
  const raw = last?.timestamp || sol.createdAt;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return sol.timeLabel || String(raw);
}

function MetaItem({ icon: Icon, value, label }: { icon: typeof FileText; value: number; label: string }) {
  return (
    <span className="flex items-center gap-1 text-muted-foreground" title={`${value} ${label}`}>
      <Icon className="h-3 w-3 shrink-0 opacity-70" />
      <span className="tabular-nums">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

/* ─── Project Detail View ─── */

function ProjectDetailView({
  solution,
  theme,
  onBack,
  onStartConversation,
}: {
  solution: Solution;
  theme: Theme;
  onBack: () => void;
  onStartConversation: (id: string) => void;
}) {
  const isDark = isDarkTheme(theme);
  const status = STATUS_CONFIG[solution.blueprint.status ?? 'not_started'] ?? STATUS_CONFIG.not_started;
  const stats = getStats(solution);
  const hasConversation = solution.chatHistory.length > 0;

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pt-8 md:px-8 lg:px-12 pb-4">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'mb-4 flex items-center gap-1.5 text-xs font-medium transition-colors',
              isDark ? 'text-white/50 hover:text-white/80' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </button>

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {solution.name}
              </h1>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
            </div>
            {solution.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {solution.description}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-[11px]">
            <MetaItem icon={FileText} value={stats.requirements} label="requirements" />
            <MetaItem icon={GitBranch} value={stats.architecture} label="architecture steps" />
            <MetaItem icon={MessageSquare} value={stats.messages} label="messages" />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 opacity-70" />
              Updated {getLastUpdated(solution)}
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'border-b transition-opacity duration-200 opacity-100',
          'border-border',
        )}
      />

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-8 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          {!hasConversation ? (
            /* Empty state — no conversations yet */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className={cn(
                  'mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border',
                  isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-muted border-border',
                )}
              >
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mb-1.5 text-base font-semibold text-foreground">
                No conversations yet
              </h2>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Start your first conversation to begin designing your solution with Mitra.
              </p>
              <Button
                variant="cta"
                type="button"
                onClick={() => onStartConversation(solution.id)}
                className="px-5 py-2.5 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Start Conversation
              </Button>
            </div>
          ) : (
            /* Has conversations — show conversation thread */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Conversations
                </h3>
                <Button
                  variant="cta"
                  type="button"
                  size="sm"
                  onClick={() => onStartConversation(solution.id)}
                  className="px-3 py-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Conversation
                </Button>
              </div>

              {/* Single conversation thread card */}
              <button
                type="button"
                onClick={() => onStartConversation(solution.id)}
                className={cn(
                  'group flex items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:shadow-md cursor-pointer',
                  isDark
                    ? 'bg-card hover:bg-white/[0.03] border-border hover:border-brand-green/30'
                    : 'bg-card hover:bg-accent border-border hover:border-brand-green/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-brand-green shrink-0" />
                    <p className="truncate text-sm font-semibold text-foreground">
                      Main Conversation
                    </p>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    {solution.chatHistory.length} messages
                    {stats.messages > 0 && ` · ${stats.messages} from you`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                    <Clock className="h-3 w-3 opacity-70" />
                    {getLastUpdated(solution)}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ProjectsView ─── */

export default function ProjectsView({
  theme,
  solutions,
  activeSolutionId: _activeSolutionId,
  onSelectSolution: _onSelectSolution,
  onNewProject,
  onStartConversation,
}: ProjectsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setHasScrolled(scrollRef.current.scrollTop > 0);
    }
  }, []);

  const filtered = useMemo(() => {
    let list = solutions;

    if (filter !== 'all') {
      list = list.filter((s) => {
        if (filter === 'mine') return !s.folderId;
        if (filter === 'shared') return !!s.folderId;
        if (filter === 'organisational') return s.projectStatus === 'deployed';
        return true;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }

    return list;
  }, [solutions, search, filter]);

  const hasAnyProjects = solutions.length > 0;

  const viewingProject = viewingProjectId
    ? solutions.find((s) => s.id === viewingProjectId) ?? null
    : null;

  const clearFilters = () => {
    setSearch('');
    setFilter('all');
  };

  /* If viewing a specific project, show detail view */
  if (viewingProject) {
    return (
      <ProjectDetailView
        solution={viewingProject}
        theme={theme}
        onBack={() => setViewingProjectId(null)}
        onStartConversation={onStartConversation}
      />
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      {/* Sticky header — full width */}
      <div className="shrink-0">
        <div className="px-4 pt-8 md:px-8 lg:px-12 pb-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Projects
              </h1>
              <Button
                variant="cta"
                type="button"
                onClick={onNewProject}
                className="px-4 py-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>

            {/* Search + View toggle */}
            <div className="relative mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all',
                    isDark
                      ? 'border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/40 focus:border-white/[0.15]'
                      : 'border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-border',
                  )}
                />
              </div>
              <div className={cn(
                'flex rounded-lg border p-0.5',
                isDark ? 'border-white/[0.08] bg-white/[0.03]' : 'border-border bg-muted',
              )}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded-md p-1.5 transition-all',
                    viewMode === 'list'
                      ? isDark ? 'bg-white/[0.1] text-white' : 'bg-card text-foreground shadow-sm'
                      : isDark ? 'text-white/40 hover:text-white/60' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded-md p-1.5 transition-all',
                    viewMode === 'grid'
                      ? isDark ? 'bg-white/[0.1] text-white' : 'bg-card text-foreground shadow-sm'
                      : isDark ? 'text-white/40 hover:text-white/60' : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2">
              {(['all', 'mine', 'shared', 'organisational'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
                    filter === f
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isDark
                        ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10] hover:text-white/80'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'border-b transition-opacity duration-200',
            hasScrolled ? 'border-border opacity-100' : 'border-transparent opacity-0',
          )}
        />
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-8 md:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          {/* Case 1: No projects at all */}
          {!hasAnyProjects ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className={cn(
                  'mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border',
                  isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-muted border-border',
                )}
              >
                <FolderOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mb-1.5 text-base font-semibold text-foreground">
                No projects yet
              </h2>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Projects let you collaborate with Mitra to design, build, and deploy ServiceNow applications from a single idea.
              </p>
              <Button
                variant="cta"
                type="button"
                onClick={onNewProject}
                className="px-5 py-2.5 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Create your first project
              </Button>
            </div>
          ) : /* Case 2: Has projects but search/filter yielded nothing */
          filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className={cn(
                  'mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border',
                  isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-muted border-border',
                )}
              >
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mb-1.5 text-base font-semibold text-foreground">
                No matching projects
              </h2>
              <p className="mb-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                No projects match your current filters. Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="secondary"
                type="button"
                onClick={clearFilters}
                className="gap-1.5 px-4 py-2 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            /* List view */
            <div className="flex flex-col gap-2">
              {filtered.map((sol) => {
                const stats = getStats(sol);
                const status = STATUS_CONFIG[sol.blueprint.status ?? 'not_started'] ?? STATUS_CONFIG.not_started;
                const hasConversation = sol.chatHistory.length > 0;
                return (
                  <button
                    key={sol.id}
                    type="button"
                    onClick={() => setViewingProjectId(sol.id)}
                    className={cn(
                      'group relative flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 hover:shadow-md cursor-pointer',
                      isDark
                        ? 'bg-card hover:bg-white/[0.03] border-border hover:border-brand-green/30'
                        : 'bg-card hover:bg-accent border-border hover:border-brand-green/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {sol.name}
                        </p>
                        <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                          <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-muted-foreground leading-relaxed">
                        {sol.description || 'No description'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                        <MetaItem icon={FileText} value={stats.requirements} label="reqs" />
                        <MetaItem icon={GitBranch} value={stats.architecture} label="steps" />
                        <MetaItem icon={MessageSquare} value={stats.messages} label="msgs" />
                        {!hasConversation && (
                          <span className="text-[10px] italic text-muted-foreground/60">
                            No conversations yet
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                        <Clock className="h-3 w-3 opacity-70" />
                        {getLastUpdated(sol)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Grid / Card view */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((sol) => {
                const stats = getStats(sol);
                const status = STATUS_CONFIG[sol.blueprint.status ?? 'not_started'] ?? STATUS_CONFIG.not_started;
                const hasConversation = sol.chatHistory.length > 0;
                return (
                  <div
                    key={sol.id}
                    onClick={() => setViewingProjectId(sol.id)}
                    className={cn(
                      'group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer',
                      isDark
                        ? 'bg-card hover:bg-white/[0.03] border-border hover:border-brand-green/30'
                        : 'bg-card hover:bg-accent border-border hover:border-brand-green/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="text-sm font-semibold truncate flex-1 text-foreground">
                            {sol.name}
                          </h3>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                        {sol.description || 'No description'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                          {status.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <FileText className="h-3 w-3 opacity-70" />
                          <span className="tabular-nums">{stats.requirements}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <GitBranch className="h-3 w-3 opacity-70" />
                          <span className="tabular-nums">{stats.architecture}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MessageSquare className="h-3 w-3 opacity-70" />
                          <span className="tabular-nums">{stats.messages}</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                        <Clock className="h-3 w-3 opacity-70" />
                        Updated {getLastUpdated(sol)}
                      </span>
                      {!hasConversation && (
                        <span className="text-[10px] italic text-muted-foreground/60">
                          No conversations
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
