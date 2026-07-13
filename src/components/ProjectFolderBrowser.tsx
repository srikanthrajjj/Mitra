import { useCallback, useMemo, useState } from 'react';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  LayoutGrid,
  List,
  MessageSquare,
  Share2,
  Users,
} from 'lucide-react';
import { ProjectFolder } from '../data/folders';
import { getArtifactsWithStatuses } from '../data/solutionArtifacts';
import {
  ArtifactStatus,
  ProjectCollaborator,
  Solution,
  SolutionArtifact,
  Theme,
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
  getScopedAppLabel,
} from '../utils/folderStatus';
import { cn } from '@/lib/utils';

type BrowserLevel =
  | { kind: 'root' }
  | { kind: 'folder'; folderId: string }
  | { kind: 'project'; folderId: string; solutionId: string };

type ViewMode = 'grid' | 'list';

export interface ProjectFolderBrowserProps {
  theme: Theme;
  folders: ProjectFolder[];
  solutions: Solution[];
  activeSolutionId?: string;
  statusOverrides?: Record<string, ArtifactStatus>;
  dynamicArtifactsBySolution?: Record<string, SolutionArtifact[]>;
  projectCollaborators?: ProjectCollaborator[];
  onSelectSolution: (solutionId: string) => void;
  onSelectArtifact?: (artifactId: string, solutionId: string) => void;
  onShareProject?: (solutionId: string) => void;
}

function formatDateLabel(value?: string, fallback = 'Recently updated'): string {
  if (!value) return fallback;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return value;
  }
}

function formatSolutionDate(sol: Solution, folder?: ProjectFolder): string {
  if (sol.timeLabel) return sol.timeLabel;
  if (sol.createdAt) return sol.createdAt;
  return formatDateLabel(folder?.updatedAt);
}

function fileExtensionLabel(artifact: SolutionArtifact): string {
  if (artifact.artifactFormat) return artifact.artifactFormat;
  const name = artifact.filingName || artifact.name;
  const ext = name.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
}

function extensionColorClass(ext: string, isDark: boolean): string {
  const key = ext.toLowerCase();
  if (key === 'doc' || key === 'docx') {
    return isDark ? 'text-sky-400 bg-sky-500/15' : 'text-sky-700 bg-sky-50';
  }
  if (key === 'pdf') {
    return isDark ? 'text-red-400 bg-red-500/15' : 'text-red-700 bg-red-50';
  }
  if (key === 'xml') {
    return isDark ? 'text-orange-400 bg-orange-500/15' : 'text-orange-700 bg-orange-50';
  }
  if (key === 'json' || key === 'js') {
    return isDark ? 'text-emerald-400 bg-emerald-500/15' : 'text-emerald-700 bg-emerald-50';
  }
  return isDark ? 'text-muted-foreground bg-muted/40' : 'text-muted-foreground bg-muted';
}

export function ProjectFolderBrowser({
  theme,
  folders,
  solutions,
  activeSolutionId,
  statusOverrides = {},
  dynamicArtifactsBySolution = {},
  projectCollaborators = [],
  onSelectSolution,
  onSelectArtifact,
  onShareProject,
}: ProjectFolderBrowserProps) {
  const isDark = isDarkTheme(theme);
  const [path, setPath] = useState<BrowserLevel>({ kind: 'root' });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const artifactRows = useMemo(
    () => getArtifactsWithStatuses(statusOverrides, dynamicArtifactsBySolution, solutions),
    [statusOverrides, dynamicArtifactsBySolution, solutions],
  );

  const visibleFolders = useMemo(
    () =>
      folders.filter((folder) =>
        solutions.some((s) => s.folderId === folder.id),
      ),
    [folders, solutions],
  );

  const currentFolder =
    path.kind !== 'root' ? folders.find((f) => f.id === path.folderId) : undefined;

  const currentSolution =
    path.kind === 'project'
      ? solutions.find((s) => s.id === path.solutionId)
      : undefined;

  const folderProjects = useMemo(() => {
    if (path.kind === 'root') return [];
    const folderId = path.kind === 'folder' ? path.folderId : path.folderId;
    return solutions.filter((s) => s.folderId === folderId);
  }, [path, solutions]);

  const projectArtifacts = useMemo(() => {
    if (path.kind !== 'project') return [];
    return artifactRows.find((r) => r.solutionId === path.solutionId)?.artifacts ?? [];
  }, [path, artifactRows]);

  const navigateToRoot = useCallback(() => setPath({ kind: 'root' }), []);
  const navigateToFolder = useCallback(
    (folderId: string) => setPath({ kind: 'folder', folderId }),
    [],
  );
  const navigateToProject = useCallback(
    (folderId: string, solutionId: string) =>
      setPath({ kind: 'project', folderId, solutionId }),
    [],
  );

  const handleOpenProjectChat = (solutionId: string) => {
    onSelectSolution(solutionId);
  };

  const handleOpenArtifact = (artifactId: string, solutionId: string) => {
    onSelectArtifact?.(artifactId, solutionId);
  };

  const breadcrumb = (
    <nav className="box-breadcrumb flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
      <button
        type="button"
        onClick={navigateToRoot}
        className={cn(
          'shrink-0 rounded px-1 py-0.5 transition-colors',
          path.kind === 'root'
            ? 'font-medium text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Projects
      </button>
      {currentFolder && (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          <button
            type="button"
            onClick={() => navigateToFolder(currentFolder.id)}
            className={cn(
              'max-w-[200px] truncate rounded px-1 py-0.5 transition-colors',
              path.kind === 'folder'
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {currentFolder.name}
          </button>
        </>
      )}
      {currentSolution && path.kind === 'project' && (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          <span className="max-w-[220px] truncate font-medium text-foreground">
            {currentSolution.blueprint.title || currentSolution.name}
          </span>
        </>
      )}
    </nav>
  );

  const viewToggle = (
    <div className="box-view-toggle flex shrink-0 items-center rounded-lg border p-0.5">
      <button
        type="button"
        onClick={() => setViewMode('grid')}
        className={cn(
          'rounded-md p-1.5 transition-colors',
          viewMode === 'grid'
            ? isDark
              ? 'bg-muted/60 text-foreground'
              : 'bg-emerald-50 text-emerald-800'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="Grid view"
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setViewMode('list')}
        className={cn(
          'rounded-md p-1.5 transition-colors',
          viewMode === 'list'
            ? isDark
              ? 'bg-muted/60 text-foreground'
              : 'bg-emerald-50 text-emerald-800'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-label="List view"
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );

  const renderFolderTile = (
    key: string,
    name: string,
    itemCount: number,
    status: Parameters<typeof FolderStatusBadge>[0]['status'],
    onClick: () => void,
    onDoubleClick?: () => void,
    subtitle?: string,
  ) => {
    const isList = viewMode === 'list';
    return (
      <button
        key={key}
        type="button"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={cn(
          'box-folder-tile group text-left transition-all',
          isList ? 'box-folder-tile--list' : 'box-folder-tile--grid',
          isDark
            ? 'border-white/[0.06] bg-card/40 hover:border-white/[0.12] hover:bg-card/70'
            : 'border-border bg-card hover:border-emerald-200 hover:bg-emerald-50/40',
        )}
      >
        <div
          className={cn(
            'box-folder-tile__icon-wrap',
            isDark ? 'text-primary/85' : 'text-emerald-600',
          )}
        >
          {isList ? (
            <Folder className="h-5 w-5 shrink-0" />
          ) : (
            <FolderOpen className="h-9 w-9" strokeWidth={1.25} />
          )}
        </div>
        <div className="box-folder-tile__body min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate text-[13px] font-medium text-foreground">{name}</span>
            <FolderStatusBadge status={status} isDark={isDark} variant="inline" />
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
            {subtitle ? ` · ${subtitle}` : ''}
          </p>
        </div>
      </button>
    );
  };

  const renderProjectTile = (sol: Solution) => {
    const status = deriveSolutionFolderStatus(
      sol,
      statusOverrides,
      dynamicArtifactsBySolution,
      solutions,
    );
    const artifacts =
      artifactRows.find((r) => r.solutionId === sol.id)?.artifacts ?? [];
    const folderId = sol.folderId ?? '';
    const isSelected = activeSolutionId === sol.id;
    const isList = viewMode === 'list';

    return (
      <button
        key={sol.id}
        type="button"
        onClick={() => navigateToProject(folderId, sol.id)}
        onDoubleClick={() => handleOpenProjectChat(sol.id)}
        className={cn(
          'box-folder-tile group text-left transition-all',
          isList ? 'box-folder-tile--list' : 'box-folder-tile--grid',
          isSelected
            ? isDark
              ? 'border-primary/35 bg-primary/8'
              : 'border-emerald-300 bg-emerald-50/80'
            : isDark
              ? 'border-white/[0.06] bg-card/40 hover:border-white/[0.12] hover:bg-card/70'
              : 'border-border bg-card hover:border-emerald-200 hover:bg-emerald-50/40',
        )}
        title="Click to browse files · Double-click to open chat"
      >
        <div
          className={cn(
            'box-folder-tile__icon-wrap',
            isDark ? 'text-primary/85' : 'text-emerald-600',
          )}
        >
          {isList ? (
            <Folder className="h-5 w-5 shrink-0" />
          ) : (
            <FolderOpen className="h-9 w-9" strokeWidth={1.25} />
          )}
        </div>
        <div className="box-folder-tile__body min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate text-[13px] font-medium text-foreground">
              {sol.blueprint.title || sol.name}
            </span>
            <FolderStatusBadge status={status} isDark={isDark} variant="inline" />
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {artifacts.length} {artifacts.length === 1 ? 'file' : 'files'} ·{' '}
            {formatSolutionDate(sol, currentFolder)}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
            {getScopedAppLabel(sol)}
          </p>
        </div>
      </button>
    );
  };

  const renderChatTile = () => {
    if (!currentSolution || path.kind !== 'project') return null;
    const isList = viewMode === 'list';
    return (
      <button
        type="button"
        onClick={() => handleOpenProjectChat(currentSolution.id)}
        className={cn(
          'box-file-tile group text-left transition-all',
          isList ? 'box-file-tile--list' : 'box-file-tile--grid',
          isDark
            ? 'border-primary/25 bg-primary/5 hover:border-primary/40 hover:bg-primary/10'
            : 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50',
        )}
      >
        <div
          className={cn(
            'box-file-tile__icon-wrap',
            isDark ? 'text-primary' : 'text-emerald-600',
          )}
        >
          <MessageSquare className={isList ? 'h-5 w-5' : 'h-8 w-8'} strokeWidth={1.25} />
        </div>
        <div className="box-file-tile__body min-w-0 flex-1">
          <span className="truncate text-[13px] font-medium text-foreground">
            Conversation
          </span>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            Open project chat thread
          </p>
        </div>
      </button>
    );
  };

  const renderFileTile = (artifact: SolutionArtifact) => {
    const Icon = ARTIFACT_LUCIDE[artifact.type];
    const ext = fileExtensionLabel(artifact);
    const isList = viewMode === 'list';
    const displayName = artifact.filingName || artifact.name;

    return (
      <button
        key={artifact.id}
        type="button"
        onClick={() => handleOpenArtifact(artifact.id, artifact.solutionId)}
        className={cn(
          'box-file-tile group text-left transition-all',
          isList ? 'box-file-tile--list' : 'box-file-tile--grid',
          isDark
            ? 'border-white/[0.06] bg-card/40 hover:border-white/[0.12] hover:bg-card/70'
            : 'border-border bg-card hover:border-emerald-200 hover:bg-emerald-50/40',
        )}
      >
        <div className="box-file-tile__icon-wrap relative">
          <Icon
            className={cn(isList ? 'h-5 w-5' : 'h-8 w-8', 'text-muted-foreground')}
            strokeWidth={1.25}
          />
          {!isList && (
            <span
              className={cn(
                'absolute -bottom-1 -right-1 rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide',
                extensionColorClass(ext, isDark),
              )}
            >
              {ext}
            </span>
          )}
        </div>
        <div className="box-file-tile__body min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="truncate text-[13px] font-medium text-foreground">
              {displayName}
            </span>
            <ArtifactStatusBadge status={artifact.status} isDark={isDark} className="shrink-0" />
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {isList && `${ext} · `}
            Modified {formatDateLabel(artifact.updatedAt)}
          </p>
        </div>
      </button>
    );
  };

  const renderContent = () => {
    if (path.kind === 'root') {
      if (visibleFolders.length === 0) {
        return (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No project folders yet. Start a conversation from the dashboard to create one.
          </p>
        );
      }
      return (
        <div className={cn(viewMode === 'grid' ? 'box-folder-grid' : 'box-folder-list')}>
          {visibleFolders.map((folder) => {
            const items = solutions.filter((s) => s.folderId === folder.id);
            const status = deriveFolderStatus(
              folder,
              solutions,
              statusOverrides,
              dynamicArtifactsBySolution,
            );
            return renderFolderTile(
              folder.id,
              folder.name,
              items.length,
              status,
              () => navigateToFolder(folder.id),
              undefined,
              formatDateLabel(folder.updatedAt),
            );
          })}
        </div>
      );
    }

    if (path.kind === 'folder') {
      if (folderProjects.length === 0) {
        return (
          <p className="py-16 text-center text-sm text-muted-foreground">
            This folder is empty.
          </p>
        );
      }
      return (
        <div className={cn(viewMode === 'grid' ? 'box-folder-grid' : 'box-folder-list')}>
          {folderProjects.map((sol) => renderProjectTile(sol))}
        </div>
      );
    }

    // project level
    return (
      <div className={cn(viewMode === 'grid' ? 'box-folder-grid' : 'box-folder-list')}>
        {renderChatTile()}
        {projectArtifacts.map((artifact) => renderFileTile(artifact))}
        {projectArtifacts.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No artifact files yet. Open the conversation to generate deliverables.
          </p>
        )}
      </div>
    );
  };

  const itemCountLabel = (() => {
    if (path.kind === 'root') return `${visibleFolders.length} folders`;
    if (path.kind === 'folder') return `${folderProjects.length} projects`;
    return `${projectArtifacts.length + 1} items`;
  })();

  const shareableSolutionId =
    path.kind === 'project' ? path.solutionId : undefined;
  const shareableSolution = shareableSolutionId
    ? solutions.find((s) => s.id === shareableSolutionId)
    : undefined;
  const collaboratorCount = shareableSolutionId
    ? projectCollaborators.filter((c) => c.solutionId === shareableSolutionId).length
    : 0;

  return (
    <div className="box-folder-browser flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {breadcrumb}
        <div className="flex items-center gap-3">
          {shareableSolution && onShareProject && (
            <button
              type="button"
              onClick={() => onShareProject(shareableSolution.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                isDark
                  ? 'border-white/[0.08] text-slate-300 hover:border-brand-green/30 hover:bg-brand-green/10 hover:text-white'
                  : 'border-border text-muted-foreground hover:border-border hover:bg-accent hover:text-brand-green',
              )}
              title="Share project"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
              {collaboratorCount > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[10px]',
                    isDark ? 'bg-muted text-slate-300' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Users className="h-2.5 w-2.5" />
                  {collaboratorCount}
                </span>
              )}
            </button>
          )}
          <span className="text-xs text-muted-foreground">{itemCountLabel}</span>
          {viewToggle}
        </div>
      </div>

      <div className="py-2">
        {renderContent()}
      </div>

      {path.kind === 'project' && (
        <p className="text-[11px] text-muted-foreground/70">
          Tip: double-click a project folder to jump straight to chat.
        </p>
      )}
    </div>
  );
}

export default ProjectFolderBrowser;
