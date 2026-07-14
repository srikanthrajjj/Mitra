import {
  Key, ChevronDown, LogOut, Settings, HelpCircle,
  PanelLeftClose, ChevronsRight, Folder, Sun, Moon, Code
} from 'lucide-react';
import { ResolvedTheme, UserRole, StakeholderReview, Solution, BusinessOwnerSubmission, Theme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { filterReviewsForRole } from '../utils/approvalFlow';
import { ProjectFolder } from '../data/folders';
import { USER_DISPLAY_NAME, USER_INITIALS } from '../constants/user';
import { ROLE_PROFILE_SUBTITLES } from '../constants/role';
import { RoleSwitcher } from './RoleSwitcher';
import { ArchitectSidebar } from './ArchitectSidebar';
import { StakeholderSidebar } from './StakeholderSidebar';
import { SecuritySidebar } from './SecuritySidebar';
import { SponsorSidebar } from './SponsorSidebar';
import { AdminSidebar } from './AdminSidebar';
import { DeveloperSidebar } from './DeveloperSidebar';
import { BusinessOwnerSidebar } from './BusinessOwnerSidebar';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Button } from '@/src/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MitraLogo, useNavLogoPulse } from './MitraLogo';

interface SidebarProps {
  version?: 'v2' | 'v3';
  setVersion?: (v: 'v2' | 'v3') => void;
  theme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onOpenSearch?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSolutionModal: () => void;
  onOpenApiKeyModal: () => void;
  onOpenTour: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSelectStakeholderReview: (reviewId: string) => void;
  onSelectSecurityReview?: (reviewId: string) => void;
  onSelectSponsorReview?: (reviewId: string) => void;
  selectedReviewId?: string | null;
  onContactArchitect: () => void;
  stakeholderReviews: StakeholderReview[];
  solutions: Solution[];
  folders: ProjectFolder[];
  selectedSidebarId: string;
  focusedFolderId: string;
  renamingFolderId: string | null;
  onSelectSolution: (solutionId: string) => void;
  onCreateFolder: () => string;
  onRenameFolder: (folderId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameSolution: (solutionId: string, name: string) => void;
  onDeleteSolution: (solutionId: string) => void;
  onMoveSolution?: (solutionId: string, folderId: string | undefined) => void;
  onNewChat: (folderId?: string) => string;
  onRenamingComplete: () => void;
  statusOverrides?: Record<string, import('../types').ArtifactStatus>;
  developerComments?: import('../types').DeveloperComment[];
  businessOwnerSubmissions?: BusinessOwnerSubmission[];
  selectedBusinessOwnerSubmissionId?: string | null;
  onSelectBusinessOwnerSubmission?: (submissionId: string) => void;
  onBusinessOwnerNewUpload?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  devModeEnabled?: boolean;
  onToggleDevMode?: () => void;
  generatingSolutionId?: string | null;
}

export default function Sidebar({
  version = 'v2',
  setVersion,
  theme,
  setTheme,
  onToggleFavorite,
  onTogglePin,
  onOpenSearch,
  activeTab,
  setActiveTab,
  onOpenNewSolutionModal,
  onOpenApiKeyModal,
  onOpenTour,
  userRole,
  onRoleChange,
  onSelectStakeholderReview,
  onSelectSecurityReview,
  onSelectSponsorReview,
  selectedReviewId = null,
  onContactArchitect,
  stakeholderReviews,
  solutions,
  folders,
  selectedSidebarId,
  focusedFolderId,
  renamingFolderId,
  onSelectSolution,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameSolution,
  onDeleteSolution,
  onMoveSolution,
  onNewChat,
  onRenamingComplete,
  statusOverrides = {},
  developerComments = [],
  businessOwnerSubmissions = [],
  selectedBusinessOwnerSubmissionId = null,
  onSelectBusinessOwnerSubmission,
  onBusinessOwnerNewUpload,
  collapsed = false,
  onToggleCollapse,
  devModeEnabled = false,
  onToggleDevMode,
  generatingSolutionId = null,
}: SidebarProps) {
  const isDark = isDarkTheme(theme);
  const navLogoAnimated = useNavLogoPulse();

  return (
    <ShadcnSidebar collapsible="none" className="h-full w-full border-r border-sidebar-border">
      {collapsed ? (
        <>
          <SidebarHeader className="flex flex-col items-center gap-2 border-b border-sidebar-border px-1 py-3">
            <MitraLogo animated={navLogoAnimated} className="h-7 w-7 opacity-90" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Expand navigation sidebar"
                  onClick={onToggleCollapse}
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
            <RoleSwitcher theme={theme} role={userRole} onChange={onRoleChange} iconOnly />
          </SidebarHeader>

          <SidebarContent className="flex min-h-0 flex-1 flex-col items-center gap-1 px-1 py-2">
            {userRole === 'architect' && folders.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label={`${folders.length} project folders`}
                    onClick={onToggleCollapse}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-semibold leading-none text-primary-foreground">
                      {folders.length}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {folders.length} folder{folders.length === 1 ? '' : 's'} — expand sidebar to browse
                </TooltipContent>
              </Tooltip>
            )}
          </SidebarContent>

          <SidebarFooter className="flex flex-col items-center gap-1.5 border-t border-sidebar-border p-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle theme</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Account menu"
                      data-tour="profile"
                    >
                      <Avatar className="h-7 w-7 rounded-md">
                        <AvatarFallback className="rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                          {USER_INITIALS}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="end"
                    className={cn(
                      theme,
                      'w-56 p-1.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200',
                      isDark
                        ? 'bg-mitra-surface/90 border-mitra-border text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                        : 'bg-card/90 border-border text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
                    )}
                  >
                    <DropdownMenuLabel className="text-xs font-semibold px-2.5 py-1.5 text-muted-foreground/80">Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDark ? 'bg-mitra-border/40' : 'bg-muted'} />
                    <DropdownMenuItem
                      onClick={() => setActiveTab('settings')}
                      className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 focus:bg-brand-green/10 focus:text-brand-green transition-colors"
                    >
                      <Settings className="h-4 w-4 opacity-70" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onOpenTour}
                      className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 focus:bg-brand-green/10 focus:text-brand-green transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 opacity-70" />
                      <span>Restart guide tour</span>
                    </DropdownMenuItem>

<DropdownMenuSeparator className={isDark ? 'bg-mitra-border/40' : 'bg-muted'} />
                    <DropdownMenuItem
                      className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors"
                    >
                      <LogOut className="h-4 w-4 opacity-80" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{USER_DISPLAY_NAME}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </SidebarFooter>
        </>
      ) : (
        <>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3 shrink-0 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <MitraLogo animated={navLogoAnimated} className="h-7 w-7 opacity-90" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="truncate text-[15px] font-semibold tracking-tight text-sidebar-foreground/90">
                  Mitra
                </span>
                {version === 'v3' && (
                  <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[#4FCF36] border border-emerald-500/20 animate-pulse font-mono leading-none">
                    v3 Beta
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <RoleSwitcher theme={theme} role={userRole} onChange={onRoleChange} />
            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    aria-label="Collapse navigation sidebar"
                    onClick={onToggleCollapse}
                  >
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse sidebar</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        
      </SidebarHeader>

      <SidebarContent className="min-h-0 gap-0 overflow-hidden">
        {userRole === 'business_owner' && (
          <BusinessOwnerSidebar
            submissions={businessOwnerSubmissions}
            selectedSubmissionId={selectedBusinessOwnerSubmissionId}
            onNewUpload={() => onBusinessOwnerNewUpload?.()}
            onSelectSubmission={(s) => onSelectBusinessOwnerSubmission?.(s.id)}
          />
        )}
        {userRole === 'architect' && (
          <ArchitectSidebar
            theme={theme}
            activeTab={activeTab}
            folders={folders}
            solutions={solutions}
            selectedSidebarId={selectedSidebarId}
            focusedFolderId={focusedFolderId}
            renamingFolderId={renamingFolderId}
            onNavigate={setActiveTab}
            onSelectSolution={onSelectSolution}
            onCreateFolder={onCreateFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onRenameSolution={onRenameSolution}
            onDeleteSolution={onDeleteSolution}
            onMoveSolution={onMoveSolution}
            onNewChat={onNewChat}
            onRenamingComplete={onRenamingComplete}
            statusOverrides={statusOverrides}
            onToggleFavorite={onToggleFavorite}
            onTogglePin={onTogglePin}
            onOpenSearch={onOpenSearch}
            generatingSolutionId={generatingSolutionId}
          />
        )}
        {userRole === 'stakeholder' && (
          <StakeholderSidebar
            reviews={filterReviewsForRole(stakeholderReviews, 'stakeholder')}
            selectedReviewId={selectedReviewId}
            onContactArchitect={onContactArchitect}
            onSelectReview={(review) => onSelectStakeholderReview(review.id)}
          />
        )}
        {userRole === 'security' && (
          <SecuritySidebar
            reviews={filterReviewsForRole(stakeholderReviews, 'security')}
            selectedReviewId={selectedReviewId}
            onContactArchitect={onContactArchitect}
            onSelectReview={(review) => onSelectSecurityReview?.(review.id)}
          />
        )}
        {userRole === 'sponsor' && (
          <SponsorSidebar
            reviews={filterReviewsForRole(stakeholderReviews, 'sponsor')}
            selectedReviewId={selectedReviewId}
            onContactArchitect={onContactArchitect}
            onSelectReview={(review) => onSelectSponsorReview?.(review.id)}
          />
        )}
        {userRole === 'admin' && (
          <AdminSidebar
            activeTab={activeTab}
            onOpenPanel={() => setActiveTab('admin-panel')}
            onOpenConnections={() => setActiveTab('connections')}
          />
        )}
        {userRole === 'developer' && (
          <DeveloperSidebar
            activeTab={activeTab}
            onOpenWorkspace={() => setActiveTab('developer')}
            comments={developerComments}
          />
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-tour="profile"
              className="mx-0.5 my-0 w-[calc(100%-0.25rem)] rounded-lg px-2 py-1.5 flex items-center gap-2 text-left transition-colors hover:bg-sidebar-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              aria-label="Account menu"
            >
              <Avatar className="h-7 w-7 rounded-full shrink-0">
                <AvatarFallback className="rounded-full bg-brand-green/10 text-brand-green font-semibold text-[9px]">
                  {userRole === 'architect' ? 'RC' : USER_INITIALS}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold text-foreground">
                  {userRole === 'architect' ? 'Ravi Chaurasia' : USER_DISPLAY_NAME}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {userRole === 'architect' ? 'Technical Consultant' : ROLE_PROFILE_SUBTITLES[userRole]}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className={cn(
              theme,
              'w-56 p-1.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200',
              isDark
                ? 'bg-mitra-surface/90 border-mitra-border text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                : 'bg-card/90 border-border text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
            )}
          >
            <DropdownMenuLabel className="text-xs font-semibold px-2.5 py-1.5 text-muted-foreground/80">Account</DropdownMenuLabel>
            <DropdownMenuSeparator className={isDark ? 'bg-mitra-border/40' : 'bg-muted'} />
            <DropdownMenuItem
              onClick={() => setActiveTab('settings')}
              className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 focus:bg-brand-green/10 focus:text-brand-green transition-colors"
            >
              <Settings className="h-4 w-4 opacity-70" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenTour}
              className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 focus:bg-brand-green/10 focus:text-brand-green transition-colors"
            >
              <HelpCircle className="h-4 w-4 opacity-70" />
              <span>Restart guide tour</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className={isDark ? 'bg-mitra-border/40' : 'bg-muted'} />
            <DropdownMenuItem
              className="cursor-pointer text-[13px] rounded-lg px-2.5 py-2 gap-2.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors"
            >
              <LogOut className="h-4 w-4 opacity-80" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
        </>
      )}
    </ShadcnSidebar>
  );
}
