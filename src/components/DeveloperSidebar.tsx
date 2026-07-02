import { AlertTriangle, Code2, FileCode, FolderTree } from 'lucide-react';
import { DeveloperComment } from '../types';
import { findArtifactWithStatuses, getSolutionTitle } from '../data/solutionArtifacts';
import { DEVELOPER_FILE_TREE, DEVELOPER_SHARED_ARTIFACT_IDS } from '../data/personaFlows';
import { HR_TICKETING_SOLUTION_ID } from '../utils/approvalFlow';
import { getSolutionScope } from '../utils/artifactFiling';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/src/components/ui/sidebar';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeveloperSidebarProps {
  activeTab: string;
  onOpenWorkspace: () => void;
  comments?: DeveloperComment[];
}

export function DeveloperSidebar({
  activeTab,
  onOpenWorkspace,
  comments = [],
}: DeveloperSidebarProps) {
  const openConflicts = comments.filter((c) => !c.resolved).length;
  const solutionTitle = getSolutionTitle(HR_TICKETING_SOLUTION_ID);
  const scope = getSolutionScope(HR_TICKETING_SOLUTION_ID);
  const fileTree = DEVELOPER_FILE_TREE[HR_TICKETING_SOLUTION_ID] ?? [];

  return (
    <div className="flex flex-col gap-1 px-2 py-3">
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground/60">
          Developer workspace
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-1 space-y-0.5 px-1">
          <button
            type="button"
            onClick={onOpenWorkspace}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-colors',
              activeTab === 'developer'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/40',
            )}
          >
            <FileCode className="h-4 w-4" />
            <span className="flex-1 text-left">Shared artifacts</span>
            {openConflicts > 0 && (
              <Badge
                variant="outline"
                className="h-5 border-amber-500/40 bg-amber-500/10 px-1.5 text-[9px] text-amber-400"
              >
                {openConflicts}
              </Badge>
            )}
          </button>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-2">
        <SidebarGroupLabel className="px-2 text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground/60">
          Scoped app
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-1 px-2">
          <p className="truncate font-mono text-[10px] text-foreground/80">x_mitra_{scope}</p>
          <p className="truncate text-[10px] text-muted-foreground">{solutionTitle}</p>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-2">
        <SidebarGroupLabel className="flex items-center gap-1.5 px-2 text-[10px] font-normal uppercase tracking-[0.12em] text-muted-foreground/60">
          <FolderTree className="h-3 w-3" />
          Artifact browser
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-1 space-y-2 px-2">
          {fileTree.map(({ category, artifactIds }) => (
            <div key={category}>
              <p className="text-[10px] font-medium text-muted-foreground">{category}</p>
              <ul className="mt-0.5 space-y-0.5 border-l border-border/40 pl-2">
                {artifactIds.map((id) => {
                  const artifact = findArtifactWithStatuses(id);
                  if (!artifact) return null;
                  const hasConflict = comments.some((c) => c.artifactId === id && !c.resolved);
                  const isShared = DEVELOPER_SHARED_ARTIFACT_IDS.includes(id);
                  if (!isShared) return null;
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-1 truncate font-mono text-[9px] text-muted-foreground/80"
                    >
                      {hasConflict ? (
                        <AlertTriangle className="h-2.5 w-2.5 shrink-0 text-amber-400" />
                      ) : (
                        <span className="h-2.5 w-2.5 shrink-0" />
                      )}
                      {artifact.filingName}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto px-3">
        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground">
          <Code2 className="h-3.5 w-3.5 shrink-0" />
          Read-only · XML/JSON export · line-level review
        </div>
      </div>
    </div>
  );
}
