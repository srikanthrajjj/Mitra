import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  MessageSquare,
} from 'lucide-react';
import { ProjectFolder } from '../data/folders';
import { getArtifactsWithStatuses } from '../data/solutionArtifacts';
import {
  ArtifactStatus,
  Solution,
  SolutionArtifact,
  Theme,
  UserRole,
} from '../types';
import { isDarkTheme } from '../utils/theme';
import {
  ArtifactStatusBadge,
  ARTIFACT_LUCIDE,
} from '../utils/artifactDisplay';
import { FolderStatusBadge } from './FolderStatusBadge';
import {
  deriveFolderStatus,
  deriveSolutionFolderStatus,
  getRecentSolutions,
  getScopedAppLabel,
} from '../utils/folderStatus';
import { cn } from '@/lib/utils';
import { ProjectFolderBrowser } from './ProjectFolderBrowser';

interface ProjectNavigationPanelProps {
  theme: Theme;
  userRole: UserRole;
  folders: ProjectFolder[];
  solutions: Solution[];
  activeSolutionId?: string;
  statusOverrides?: Record<string, ArtifactStatus>;
  dynamicArtifactsBySolution?: Record<string, SolutionArtifact[]>;
  onSelectSolution: (solutionId: string) => void;
  onSelectArtifact?: (artifactId: string, solutionId: string) => void;
  compact?: boolean;
  variant?: 'table' | 'browser' | 'full';
}

function formatUpdatedLabel(sol: Solution, folder?: ProjectFolder): string {
  if (sol.timeLabel) return sol.timeLabel;
  if (sol.createdAt) return sol.createdAt;
  if (folder?.updatedAt) {
    try {
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
        new Date(folder.updatedAt),
      );
    } catch {
      return folder.updatedAt;
    }
  }
  return 'Recently updated';
}

function ProjectsTable({
  theme,
  folders,
  solutions,
  activeSolutionId,
  statusOverrides,
  dynamicArtifactsBySolution,
  onSelectSolution,
}: {
  theme: Theme;
  folders: ProjectFolder[];
  solutions: Solution[];
  activeSolutionId?: string;
  statusOverrides: Record<string, ArtifactStatus>;
  dynamicArtifactsBySolution: Record<string, SolutionArtifact[]>;
  onSelectSolution: (solutionId: string) => void;
}) {
  const isDark = isDarkTheme(theme);
  const sortedProjects = useMemo(() => getRecentSolutions(solutions, solutions.length), [solutions]);

  if (sortedProjects.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No projects yet. Start a conversation from the dashboard to create one.
      </p>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border',
        isDark ? 'border-white/[0.06] bg-card/30' : 'border-border bg-card',
      )}
    >
      <div className="overflow-x-auto">
        <table className="projects-table w-full min-w-[520px] text-left text-[13px]">
          <thead>
            <tr
              className={cn(
                'border-b text-[10px] font-semibold uppercase tracking-wide',
                isDark ? 'border-white/[0.06] text-muted-foreground' : 'border-border text-muted-foreground',
              )}
            >
              <th className="px-4 py-2.5 font-semibold">Project</th>
              <th className="px-4 py-2.5 font-semibold">Folder</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Last updated</th>
              <th className="px-4 py-2.5 font-semibold">Scoped app</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((sol) => {
              const folder = folders.find((f) => f.id === sol.folderId);
              const status = deriveSolutionFolderStatus(
                sol,
                statusOverrides,
                dynamicArtifactsBySolution,
                solutions,
              );
              const isSelected = activeSolutionId === sol.id;

              return (
                <tr
                  key={sol.id}
                  onClick={() => onSelectSolution(sol.id)}
                  className={cn(
                    'projects-table-row cursor-pointer border-b transition-colors last:border-b-0',
                    isDark ? 'border-white/[0.04]' : 'border-border/60',
                    isSelected
                      ? isDark
                        ? 'bg-primary/8'
                        : 'bg-emerald-50/80'
                      : isDark
                        ? 'hover:bg-muted/30'
                        : 'hover:bg-emerald-50/50',
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {sol.blueprint.title || sol.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{folder?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <FolderStatusBadge status={status} isDark={isDark} variant="inline" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatUpdatedLabel(sol, folder)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[180px]">
                    {getScopedAppLabel(sol)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProjectNavigationPanel({
  theme,
  userRole,
  folders,
  solutions,
  activeSolutionId,
  statusOverrides = {},
  dynamicArtifactsBySolution = {},
  onSelectSolution,
  onSelectArtifact,
  compact = false,
  variant = 'full',
}: ProjectNavigationPanelProps) {
  const isDark = isDarkTheme(theme);
  const showArtifactTree = userRole === 'architect';
  const recentProjects = useMemo(() => getRecentSolutions(solutions, 5), [solutions]);
  const [selectedTreeSolutionId, setSelectedTreeSolutionId] = useState<string>(
    () => activeSolutionId || recentProjects[0]?.id || '',
  );
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(folders.map((f) => [f.id, true])),
  );
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeSolutionId) {
      setSelectedTreeSolutionId(activeSolutionId);
      const sol = solutions.find((s) => s.id === activeSolutionId);
      if (sol?.folderId) {
        setExpandedFolders((prev) => ({ ...prev, [sol.folderId!]: true }));
        setExpandedThreads((prev) => ({ ...prev, [activeSolutionId]: true }));
      }
    }
  }, [activeSolutionId, solutions]);

  useEffect(() => {
    setExpandedFolders((prev) => {
      const next = { ...prev };
      folders.forEach((f) => {
        if (next[f.id] === undefined) next[f.id] = true;
      });
      return next;
    });
  }, [folders]);

  const artifactRows = useMemo(
    () => getArtifactsWithStatuses(statusOverrides, dynamicArtifactsBySolution, solutions),
    [statusOverrides, dynamicArtifactsBySolution, solutions],
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const toggleThread = (solutionId: string) => {
    setExpandedThreads((prev) => ({ ...prev, [solutionId]: !prev[solutionId] }));
  };

  const handleSelectProject = (solutionId: string) => {
    setSelectedTreeSolutionId(solutionId);
    onSelectSolution(solutionId);
  };

  const treeSolution = solutions.find((s) => s.id === selectedTreeSolutionId) ?? recentProjects[0];

  if (variant === 'browser') {
    return (
      <ProjectFolderBrowser
        theme={theme}
        folders={folders}
        solutions={solutions}
        activeSolutionId={activeSolutionId}
        statusOverrides={statusOverrides}
        dynamicArtifactsBySolution={dynamicArtifactsBySolution}
        onSelectSolution={onSelectSolution}
        onSelectArtifact={onSelectArtifact}
      />
    );
  }

  if (variant === 'table') {
    return (
      <ProjectsTable
        theme={theme}
        folders={folders}
        solutions={solutions}
        activeSolutionId={activeSolutionId}
        statusOverrides={statusOverrides}
        dynamicArtifactsBySolution={dynamicArtifactsBySolution}
        onSelectSolution={onSelectSolution}
      />
    );
  }

  return (
    <div className={cn('space-y-6', compact && 'space-y-4')}>
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent projects
          </h2>
          <span className="text-[10px] text-muted-foreground/70">{recentProjects.length} active</span>
        </div>
        <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
          {recentProjects.map((sol) => {
            const folder = folders.find((f) => f.id === sol.folderId);
            const status = deriveSolutionFolderStatus(
              sol,
              statusOverrides,
              dynamicArtifactsBySolution,
              solutions,
            );
            const isSelected = activeSolutionId === sol.id || selectedTreeSolutionId === sol.id;
            return (
              <button
                key={sol.id}
                type="button"
                onClick={() => handleSelectProject(sol.id)}
                className={cn(
                  'group rounded-lg border px-3 py-2.5 text-left transition-colors',
                  isSelected
                    ? isDark
                      ? 'border-primary/35 bg-primary/8'
                      : 'border-emerald-300 bg-emerald-50/80'
                    : isDark
                      ? 'border-white/[0.06] bg-card/40 hover:border-white/[0.12] hover:bg-card/70'
                      : 'border-border bg-card hover:border-emerald-200 hover:bg-emerald-50/40',
                )}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {sol.blueprint.title || sol.name}
                  </span>
                  <FolderStatusBadge status={status} isDark={isDark} variant="inline" />
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {getScopedAppLabel(sol)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  {formatUpdatedLabel(sol, folder)}
                  {folder ? ` · ${folder.name}` : ''}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Application files
          </h2>
          {treeSolution && (
            <span className="truncate text-[10px] text-muted-foreground/70">
              {treeSolution.blueprint.title || treeSolution.name}
            </span>
          )}
        </div>

        <div
          className={cn(
            'rounded-lg border text-[12px]',
            isDark ? 'border-white/[0.06] bg-card/30' : 'border-border bg-card',
          )}
        >
          <div
            className={cn(
              'border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wide',
              isDark ? 'border-white/[0.06] text-muted-foreground' : 'border-border text-muted-foreground',
            )}
          >
            ServiceNow scoped application tree
          </div>

          <div className="max-h-[min(360px,42vh)] overflow-y-auto p-2">
            {folders.map((folder) => {
              const folderSolutions = solutions.filter((s) => s.folderId === folder.id);
              if (folderSolutions.length === 0) return null;
              const folderExpanded = expandedFolders[folder.id] ?? true;
              const folderStatus = deriveFolderStatus(
                folder,
                solutions,
                statusOverrides,
                dynamicArtifactsBySolution,
              );

              return (
                <div key={folder.id} className="mb-0.5">
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className={cn(
                      'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors',
                      isDark ? 'hover:bg-muted/40' : 'hover:bg-emerald-50/60',
                    )}
                  >
                    {folderExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <Folder className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {folder.name}
                    </span>
                    <FolderStatusBadge status={folderStatus} isDark={isDark} variant="inline" />
                  </button>

                  {folderExpanded && (
                    <div className="ml-3 border-l border-border/60 pl-1">
                      {folderSolutions.map((sol) => {
                        const threadExpanded = expandedThreads[sol.id] ?? sol.id === selectedTreeSolutionId;
                        const solStatus = deriveSolutionFolderStatus(
                          sol,
                          statusOverrides,
                          dynamicArtifactsBySolution,
                          solutions,
                        );
                        const artifacts =
                          artifactRows.find((r) => r.solutionId === sol.id)?.artifacts ?? [];
                        const isThreadSelected = selectedTreeSolutionId === sol.id;

                        return (
                          <div key={sol.id}>
                            <div
                              className={cn(
                                'flex items-center gap-0.5 rounded-md',
                                isThreadSelected && (isDark ? 'bg-muted/35' : 'bg-emerald-50/70'),
                              )}
                            >
                              {showArtifactTree && artifacts.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => toggleThread(sol.id)}
                                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                                  aria-label={threadExpanded ? 'Collapse thread' : 'Expand thread'}
                                >
                                  {threadExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </button>
                              ) : (
                                <span className="w-5 shrink-0" />
                              )}
                              <button
                                type="button"
                                onClick={() => handleSelectProject(sol.id)}
                                className={cn(
                                  'flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1.5 text-left transition-colors',
                                  isDark ? 'hover:bg-muted/40' : 'hover:bg-emerald-50/60',
                                )}
                              >
                                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="min-w-0 flex-1 truncate text-foreground">
                                  {sol.name}
                                </span>
                                <FolderStatusBadge status={solStatus} isDark={isDark} variant="inline" />
                              </button>
                            </div>

                            {showArtifactTree && threadExpanded && artifacts.length > 0 && (
                              <div className="ml-6 border-l border-border/50 pl-1">
                                {artifacts.map((artifact) => {
                                  const Icon = ARTIFACT_LUCIDE[artifact.type];
                                  return (
                                    <button
                                      key={artifact.id}
                                      type="button"
                                      onClick={() => {
                                        handleSelectProject(sol.id);
                                        onSelectArtifact?.(artifact.id, sol.id);
                                      }}
                                      className={cn(
                                        'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors',
                                        isDark ? 'hover:bg-muted/35' : 'hover:bg-emerald-50/50',
                                      )}
                                    >
                                      <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      <span className="min-w-0 flex-1 truncate text-[11px] text-foreground/90">
                                        {artifact.filingName || artifact.name}
                                      </span>
                                      <ArtifactStatusBadge
                                        status={artifact.status}
                                        isDark={isDark}
                                        className="shrink-0"
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!showArtifactTree && (
          <p className="mt-2 text-[10px] text-muted-foreground/70">
            Switch to Architect role to expand artifact files under each thread.
          </p>
        )}
      </section>
    </div>
  );
}

export default ProjectNavigationPanel;
