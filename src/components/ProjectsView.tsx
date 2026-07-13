import { useMemo, useState } from 'react';
import { Search, Plus, FolderOpen, LayoutGrid, List, ExternalLink } from 'lucide-react';
import { Solution, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'mine' | 'shared' | 'organisational';
type ViewMode = 'list' | 'grid';

interface ProjectsViewProps {
  theme: Theme;
  solutions: Solution[];
  activeSolutionId?: string;
  onSelectSolution: (solutionId: string) => void;
  onNewProject: () => void;
}

export default function ProjectsView({
  theme,
  solutions,
  activeSolutionId,
  onSelectSolution,
  onNewProject,
}: ProjectsViewProps) {
  const isDark = isDarkTheme(theme);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filtered = useMemo(() => {
    let list = solutions;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [solutions, search]);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
            Projects
          </h1>
          <button
            type="button"
            onClick={onNewProject}
            className="btn-cta cursor-pointer flex items-center gap-2 px-4 py-2 text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Search + View toggle */}
        <div className="relative mb-6 flex items-center gap-3">
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
                  : isDark ? 'text-white/40 hover:text-white/60' : 'text-muted-foreground hover:text-muted-foreground',
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
                  : isDark ? 'text-white/40 hover:text-white/60' : 'text-muted-foreground hover:text-muted-foreground',
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex gap-2">
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
              {f === 'all' ? 'All' : f === 'mine' ? 'Mine' : f === 'shared' ? 'Shared' : 'Organisational'}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className={cn(
                'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl',
                isDark ? 'bg-white/[0.06]' : 'bg-muted',
              )}
            >
              <FolderOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className={`mb-1 text-sm font-medium ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
              No projects yet
            </p>
            <p className={`mb-5 text-xs ${isDark ? 'text-white/40' : 'text-muted-foreground'}`}>
              Create your first project to get started.
            </p>
            <button
              type="button"
              onClick={onNewProject}
              className="btn-cta cursor-pointer flex items-center gap-2 px-5 py-2.5 text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List view */
          <div className="flex flex-col gap-2">
            {filtered.map((sol) => {
              const isActive = sol.id === activeSolutionId;
              return (
                <button
                  key={sol.id}
                  type="button"
                  onClick={() => onSelectSolution(sol.id)}
                  className={cn(
                    'group relative flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 hover:shadow-md cursor-pointer',
                    isActive
                      ? isDark
                        ? 'border-primary/30 bg-primary/[0.06]'
                        : 'border-border bg-muted'
                      : isDark
                        ? 'bg-card hover:bg-neutral-900/60 border-border text-foreground hover:border-brand-green/30'
                        : 'bg-card hover:bg-accent border-border text-foreground hover:border-brand-green/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
                      {sol.name}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground leading-relaxed">
                      {sol.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`whitespace-nowrap text-[10px] font-medium ${isDark ? 'text-white/35' : 'text-muted-foreground'}`}>
                      {sol.timeLabel || sol.createdAt}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Grid / Card view */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sol) => {
              const isActive = sol.id === activeSolutionId;
              return (
                <div
                  key={sol.id}
                  onClick={() => onSelectSolution(sol.id)}
                  className={cn(
                    'group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer',
                    isActive
                      ? isDark
                        ? 'border-primary/30 bg-primary/[0.06]'
                        : 'border-border bg-muted'
                      : isDark
                        ? 'bg-card hover:bg-neutral-900/60 border-border text-foreground hover:border-brand-green/30'
                        : 'bg-card hover:bg-accent border-border text-foreground hover:border-brand-green/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={cn(
                        'text-sm font-semibold truncate flex-1',
                        isDark ? 'text-white' : 'text-foreground',
                      )}>
                        {sol.name}
                      </h3>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                      {sol.description || 'No description'}
                    </p>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-4 font-medium">
                    {sol.timeLabel || sol.createdAt}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
