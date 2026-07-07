import { useState, useRef, useEffect, type MouseEvent, type TouchEvent } from 'react';
import {
  FileStack,
  PanelRightClose,
  ChevronsLeft,
  MoreVertical,
  Share2,
  Eye,
  Copy,
  GitBranch,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  SolutionArtifact,
  StudioBuildStage,
  ArtifactStatus,
  DeveloperComment,
  Theme,
  PhaseProgress,
  AdminChecklistItem,
  BusinessOwnerSubmission,
  StakeholderReview,
  Solution,
} from '../types';
import { isDarkTheme } from '../utils/theme';
import { getArtifactsWithStatuses, getSolutionTitle } from '../data/solutionArtifacts';
import { ProjectStatusPanel } from './ProjectStatusPanel';
import { computeWorkflowSnapshot } from '../utils/projectStatusTracker';
import {
  ArtifactFormatBadge,
  ArtifactStatusBadge,
  ArtifactTypeIcon,
  BuildStageChip,
  ConflictBadge,
  hasArtifactConflict,
} from '../utils/artifactDisplay';
import { getArtifactRepositoryPath, sortArtifactsByStage } from '../utils/artifactFiling';
import { getRevealedArtifacts } from '../utils/artifactReveal';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  ARTIFACT_PANEL_MAX_WIDTH,
  ARTIFACT_PANEL_MIN_WIDTH,
  ARTIFACT_PANEL_COLLAPSED_WIDTH,
} from '../hooks/useResizablePanel';
import { PanelResizeHandle } from './PanelResizeHandle';

interface ArtifactCardsPanelProps {
  solutionId: string | null;
  statusOverrides: Record<string, ArtifactStatus>;
  dynamicArtifactsBySolution: Record<string, SolutionArtifact[]>;
  solutions: Solution[];
  selectedArtifactId: string | null;
  isGenerating: boolean;
  mitraTurnCount: number;
  conversationStarted: boolean;
  blueprintStage?: StudioBuildStage;
  phaseProgress?: PhaseProgress;
  developerComments?: DeveloperComment[];
  theme?: Theme;
  width: number;
  collapsed?: boolean;
  isResizing?: boolean;
  onResizeStart: (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => void;
  onToggleCollapse?: () => void;
  onSelectArtifact: (artifactId: string, solutionId: string) => void;
  onShareArtifact: (artifact: SolutionArtifact) => void;
  stakeholderReviews?: StakeholderReview[];
  businessOwnerSubmissions?: BusinessOwnerSubmission[];
  adminChecklist?: AdminChecklistItem[];
}

type PanelTab = 'artifacts' | 'status';

function formatUpdatedAt(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

function PanelTabBar({
  activeTab,
  artifactCount,
  isDark,
  onTabChange,
}: {
  activeTab: PanelTab;
  artifactCount: number;
  isDark: boolean;
  onTabChange: (tab: PanelTab) => void;
}) {
  const tabs: { id: PanelTab; label: string; icon: typeof FileStack; count?: number }[] = [
    { id: 'artifacts', label: 'Artifacts', icon: FileStack, count: artifactCount },
    { id: 'status', label: 'Status', icon: GitBranch },
  ];

  return (
    <div
      className="artifact-panel-tabs flex min-w-0 w-full gap-0.5 rounded-lg border border-border/60 p-0.5"
      role="tablist"
      aria-label="Artifact panel sections"
    >
      {tabs.map(({ id, label, icon: Icon, count }) => {
        const selected = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`artifact-panel-${id}`}
            id={`artifact-panel-tab-${id}`}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[10px] font-medium transition-colors',
              selected
                ? isDark
                  ? 'bg-white/[0.08] text-foreground shadow-sm'
                  : 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{label}</span>
            {count != null && count > 0 && (
              <span className="shrink-0 text-[9px] tabular-nums text-muted-foreground/70">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PanelHeader({
  count,
  isDark,
  activeTab,
  onTabChange,
  onCollapse,
}: {
  count: number;
  isDark: boolean;
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  onCollapse?: () => void;
}) {
  return (
    <div className="artifact-panel shrink-0 flex flex-col border-b border-border">
      {/* Top toolbar row matching 52px header line exactly */}
      <div className="flex min-w-0 h-[52px] items-center justify-between gap-1.5 pl-3 pr-3 w-full">
        <div className="min-w-0 flex-1">
          <PanelTabBar
          activeTab={activeTab}
          artifactCount={count}
          isDark={isDark}
          onTabChange={onTabChange}
        />
        </div>
        {onCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Collapse artifact panel"
                onClick={onCollapse}
              >
                <PanelRightClose className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Collapse panel</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function CollapsedArtifactStrip({
  newCount,
  onExpand,
}: {
  newCount: number;
  onExpand?: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center py-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Expand artifact panel"
            onClick={onExpand}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {newCount > 0 ? `Expand panel (${newCount} new)` : 'Expand application files'}
        </TooltipContent>
      </Tooltip>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-1">
        <div className="relative flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-muted/30">
          <FileStack className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
          {newCount > 0 && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold tabular-nums text-primary-foreground"
            >
              {newCount > 9 ? '9+' : newCount}
            </motion.span>
          )}
        </div>

        <span
          className="select-none text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 [writing-mode:vertical-rl] [text-orientation:mixed]"
          aria-hidden
        >
          Files
        </span>
      </div>
    </div>
  );
}

function EmptyArtifactsPlaceholder({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="artifact-panel flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <FileStack className="mb-2 h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
      <p className="artifact-row-title font-medium text-foreground/75">No artifacts yet</p>
      <p className="artifact-row-meta mt-1 max-w-[200px] leading-relaxed text-muted-foreground">
        {isGenerating
          ? 'Mitra is drafting your first deliverable…'
          : 'Chat with Mitra to generate Studio deliverables as your blueprint takes shape.'}
      </p>
    </div>
  );
}

interface DeliverableRowProps {
  artifact: SolutionArtifact;
  isActive: boolean;
  isDark: boolean;
  theme: Theme;
  hasConflict: boolean;
  onSelect: () => void;
  onShare: () => void;
}

function DeliverableRow({
  artifact,
  isActive,
  isDark,
  theme,
  hasConflict,
  onSelect,
  onShare,
}: DeliverableRowProps) {
  const canShare =
    artifact.status === 'draft' || artifact.status === 'approved' || artifact.status === 'pending';
  const repoPath = getArtifactRepositoryPath(artifact);
  const updatedLabel = formatUpdatedAt(artifact.updatedAt);
  const shareLabel =
    artifact.status === 'in_review' ? 'In review' : 'Send for approval';

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(repoPath);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        'sn-list-row group px-2 py-2',
        isActive && 'sn-list-row--active',
        hasConflict && !isActive && 'sn-list-row--conflict',
      )}
    >
      <div className="flex min-w-0 items-start gap-0.5">
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 overflow-hidden rounded-sm px-1 py-0.5 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <div className="flex min-w-0 items-start gap-2">
            <ArtifactTypeIcon
              type={artifact.type}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <p
                className="artifact-row-title truncate font-medium text-foreground"
                title={artifact.name}
              >
                {artifact.name}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-1">
                <ArtifactFormatBadge format={artifact.artifactFormat} isDark={isDark} />
                <ArtifactStatusBadge status={artifact.status} isDark={isDark} />
                <BuildStageChip stage={artifact.buildStage} isDark={isDark} />
                {hasConflict && <ConflictBadge isDark={isDark} />}
              </div>

              <p
                className="artifact-row-filing sn-mono mt-1 truncate text-muted-foreground/70"
                title={artifact.filingName}
              >
                {artifact.filingName}
              </p>

              <p className="artifact-row-meta sn-meta mt-1 truncate" title={repoPath}>
                {[
                  artifact.updatedBy ? `Updated by ${artifact.updatedBy}` : null,
                  artifact.version ? `v${artifact.version}` : null,
                  updatedLabel,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground',
                'opacity-60 group-hover:opacity-100 data-[state=open]:opacity-100',
              )}
              aria-label={`Actions for ${artifact.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="left"
            className={cn(
              theme,
              'w-48 p-1.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200',
              isDark
                ? 'bg-zinc-900/90 border-white/[0.08] text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.06)]',
            )}
          >
            <DropdownMenuItem
              disabled={!canShare}
              onClick={onShare}
              className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 focus:bg-brand-green/10 focus:text-brand-green transition-colors"
            >
              <Share2 className="h-4 w-4 opacity-70" />
              <span>{shareLabel}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onSelect}
              className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 focus:bg-brand-green/10 focus:text-brand-green transition-colors"
            >
              <Eye className="h-4 w-4 opacity-70" />
              <span>View details</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function ArtifactCardsPanel({
  solutionId,
  statusOverrides,
  dynamicArtifactsBySolution,
  solutions,
  selectedArtifactId,
  isGenerating,
  mitraTurnCount,
  conversationStarted,
  blueprintStage,
  phaseProgress,
  developerComments = [],
  theme = 'dark',
  width,
  collapsed = false,
  isResizing = false,
  onResizeStart,
  onToggleCollapse,
  onSelectArtifact,
  onShareArtifact,
  stakeholderReviews = [],
  businessOwnerSubmissions = [],
  adminChecklist = [],
}: ArtifactCardsPanelProps) {
  const isDark = isDarkTheme(theme);
  const reducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<PanelTab>('artifacts');

  const prevArtifactIdsRef = useRef<Set<string>>(new Set());
  const artifactIdsInitializedRef = useRef(false);
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  const collapsedSeenIdsRef = useRef<Set<string>>(new Set());
  const collapsedSeededRef = useRef(false);
  const [newWhileCollapsed, setNewWhileCollapsed] = useState(0);

  const shouldShow = Boolean(solutionId && conversationStarted && mitraTurnCount > 0);

  const solutionData = shouldShow
    ? getArtifactsWithStatuses(statusOverrides, dynamicArtifactsBySolution, solutions).find(
        (s) => s.solutionId === solutionId,
      )
    : undefined;
  const artifacts = solutionData?.artifacts ?? [];
  const solutionTitle = solutionId ? getSolutionTitle(solutionId, solutions) : '';
  const revealed = shouldShow
    ? getRevealedArtifacts(
        artifacts,
        mitraTurnCount,
        blueprintStage,
        phaseProgress,
        statusOverrides,
      )
    : [];
  const displayArtifacts = sortArtifactsByStage(revealed);
  const panelWidth = collapsed ? ARTIFACT_PANEL_COLLAPSED_WIDTH : width;
  const displayArtifactIds = displayArtifacts.map((artifact) => artifact.id).join(',');

  const activeSolution = solutionId ? solutions.find((s) => s.id === solutionId) ?? null : null;
  const workflowSnapshot = computeWorkflowSnapshot({
    solution: activeSolution,
    statusOverrides,
    dynamicArtifactsBySolution,
    solutions,
    stakeholderReviews,
    businessOwnerSubmissions,
    adminChecklist,
    developerComments,
  });

  useEffect(() => {
    if (!shouldShow) return;

    const currentIds = displayArtifactIds.split(',').filter(Boolean);

    if (!artifactIdsInitializedRef.current) {
      prevArtifactIdsRef.current = new Set(currentIds);
      artifactIdsInitializedRef.current = true;
      return;
    }

    const added = currentIds.filter((id) => !prevArtifactIdsRef.current.has(id));
    if (added.length > 0) {
      setNewlyAddedIds(new Set(added));
      const timer = window.setTimeout(() => setNewlyAddedIds(new Set()), reducedMotion ? 800 : 2000);
      prevArtifactIdsRef.current = new Set(currentIds);
      return () => window.clearTimeout(timer);
    }

    prevArtifactIdsRef.current = new Set(currentIds);
  }, [displayArtifactIds, reducedMotion, shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;

    const currentIds = new Set(displayArtifactIds.split(',').filter(Boolean));

    if (!collapsed) {
      collapsedSeenIdsRef.current = currentIds;
      collapsedSeededRef.current = true;
      setNewWhileCollapsed(0);
      return;
    }

    if (!collapsedSeededRef.current) {
      collapsedSeenIdsRef.current = currentIds;
      collapsedSeededRef.current = true;
      return;
    }

    let unseen = 0;
    for (const id of currentIds) {
      if (!collapsedSeenIdsRef.current.has(id)) unseen += 1;
    }

    if (unseen > 0) {
      setNewWhileCollapsed((count) => count + unseen);
      collapsedSeenIdsRef.current = currentIds;
    }
  }, [displayArtifactIds, collapsed, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const panelTransition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 36 };

  const cardEnter = reducedMotion
    ? { opacity: 1, x: 0 }
    : { opacity: 0, x: 8 };

  const cardAnimate = { opacity: 1, x: 0 };

  return (
    <motion.aside
      style={{ width: panelWidth, maxWidth: panelWidth }}
      className={cn(
        'artifact-panel relative box-border hidden shrink-0 overflow-hidden border-l xl:flex xl:min-h-0 xl:flex-col',
        isDark ? 'border-border bg-sidebar' : 'border-border bg-sidebar/80',
        isResizing && !collapsed && 'select-none',
      )}
      initial={reducedMotion ? false : { opacity: 0, x: 16 }}
      animate={{
        opacity: 1,
        x: 0,
        width: panelWidth,
        maxWidth: panelWidth,
      }}
      transition={panelTransition}
    >
      {!collapsed && (
        <PanelResizeHandle
          edge="left"
          isResizing={isResizing}
          onResizeStart={onResizeStart}
          ariaLabel="Resize artifact panel"
          valueNow={width}
          valueMin={ARTIFACT_PANEL_MIN_WIDTH}
          valueMax={ARTIFACT_PANEL_MAX_WIDTH}
          className="z-20"
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {collapsed ? (
          <motion.div
            key="collapsed"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="flex h-full min-h-0 flex-1 flex-col"
          >
            <CollapsedArtifactStrip
              newCount={newWhileCollapsed}
              onExpand={onToggleCollapse}
            />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            className="artifact-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
          >
            <PanelHeader
              count={displayArtifacts.length}
              isDark={isDark}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onCollapse={onToggleCollapse}
            />

            {activeTab === 'status' ? (
              <div
                id="artifact-panel-status"
                role="tabpanel"
                aria-labelledby="artifact-panel-tab-status"
                className="min-h-0 flex-1 overflow-hidden"
              >
                <ProjectStatusPanel
                  snapshot={workflowSnapshot}
                  solutionTitle={solutionTitle}
                  theme={theme}
                />
              </div>
            ) : (
              <div
                id="artifact-panel-artifacts"
                role="tabpanel"
                aria-labelledby="artifact-panel-tab-artifacts"
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                {isGenerating && (
                  <p className="artifact-row-meta shrink-0 border-b border-border/40 px-3.5 py-2 text-primary/75">
                    Generating next deliverable…
                  </p>
                )}

                {displayArtifacts.length === 0 ? (
                  <EmptyArtifactsPlaceholder isGenerating={isGenerating} />
                ) : (
                  <ScrollArea className="min-w-0 flex-1 overflow-x-hidden">
                    <div className="min-w-0 pr-1">
                      <AnimatePresence initial={false}>
                        {displayArtifacts.map((artifact, index) => {
                          const isActive = selectedArtifactId === artifact.id;
                          const hasConflict = hasArtifactConflict(artifact.id, developerComments);
                          const isNew = newlyAddedIds.has(artifact.id);

                          return (
                            <motion.div
                              key={artifact.id}
                              layout={!reducedMotion}
                              initial={cardEnter}
                              animate={cardAnimate}
                              transition={
                                reducedMotion
                                  ? { duration: 0 }
                                  : {
                                      type: 'spring',
                                      stiffness: 480,
                                      damping: 38,
                                      delay: index * 0.025,
                                    }
                              }
                              className={cn('min-w-0 overflow-hidden', isNew && 'artifact-card-new-highlight')}
                            >
                              <DeliverableRow
                                artifact={artifact}
                                isActive={isActive}
                                isDark={isDark}
                                theme={theme}
                                hasConflict={hasConflict}
                                onSelect={() => onSelectArtifact(artifact.id, artifact.solutionId)}
                                onShare={() => onShareArtifact(artifact)}
                              />
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
