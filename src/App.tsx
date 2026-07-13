import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, Bell, HelpCircle, ChevronRight, X, ListFilter, Play, Check, 
  Trash2, RefreshCw, AlertCircle, FileCode, CheckCircle, ExternalLink, Settings, Users, Sun, Moon, Star
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import { cn } from '@/lib/utils';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import { TooltipProvider } from './components/ui/tooltip';
import ChatView from './components/ChatView';
import HomeView from './components/HomeView';
import ProjectNavigationPanel from './components/ProjectNavigationPanel';
import TemplatesView from './components/TemplatesView';
import ConnectionsView from './components/ConnectionsView';
import { SearchView } from './components/SearchView';
import { SearchDialog } from './components/SearchDialog';
import NewSolutionModal from './components/NewSolutionModal';
import ApiKeyModal from './components/ApiKeyModal';
import OnboardingTour from './components/OnboardingTour';
import LandingPage from './components/LandingPage';
import AlertDialog from './components/AlertDialog';
import SimulationAlertModal from './components/SimulationAlertModal';
import { enrichBlueprintStudio } from './utils/studioHelpers';
import VrBackground from './components/VrBackground';
import { Solution, Theme, ResolvedTheme, ServiceTemplate, ChatMessage, TableField, UserRole, ArtifactStatus, StakeholderReview, SolutionArtifact, AdminChecklistItem, DeveloperComment, DeveloperCommentSeverity, SharePermission, ProjectCollaborator, ProjectSharePermission, PhaseProgress, RequirementsDocument, StakeholderSectionComment, BusinessOwnerSubmission } from './types';
import { INITIAL_SOLUTIONS } from './data/solutions';
import { readUserRole, persistUserRole } from './constants/role';
import { ArtifactView } from './components/ArtifactView';
import { StakeholderReviewView } from './components/StakeholderReviewView';
import { SecurityReviewView } from './components/SecurityReviewView';
import { SponsorReviewView } from './components/SponsorReviewView';
import { ArtifactCardsPanel } from './components/ArtifactCardsPanel';
import { ShareArtifactModal } from './components/ShareArtifactModal';
import { ShareProjectModal } from './components/ShareProjectModal';
import { CenterToast, type CenterToastData } from './components/CenterToast';
import { DesignFeedbackWidget } from './components/DesignFeedbackWidget';
import { WhatsNewModal, readWhatsNewDismissed } from './components/WhatsNewModal';
import { GuestStakeholderView } from './components/GuestStakeholderView';
import { AdminPanelView } from './components/AdminPanelView';
import { DeveloperWorkspaceView } from './components/DeveloperWorkspaceView';
import { BusinessOwnerView } from './components/BusinessOwnerView';
import {
  buildExecutiveSummary,
  canRoleApproveReview,
  completeReview,
  createPendingHrSummaryReview,
  createShareReview,
  formatApprovalResponseUpdate,
  formatShareSnUpdate,
  getPersonaShareLabel,
  getRequiredApprover,
  HR_SUMMARY_ARTIFACT_ID,
  HR_SUMMARY_REVIEW_ID,
  HR_TICKETING_SOLUTION_ID,
  INITIAL_STAKEHOLDER_REVIEWS,
  inferReviewReviewerRole,
  isSendForApprovalAction,
  filterReviewsForRole,
  readAutoApprove,
  persistAutoApprove,
  recipientNameFromEmail,
  DEMO_AUTO_APPROVE_MS,
} from './utils/approvalFlow';
import { PERSONA_REVIEW_LABELS } from './constants/personaTone';
import { findArtifactWithStatuses, getSolutionTitle } from './data/solutionArtifacts';
import {
  DEVELOPER_SHARED_ARTIFACT_IDS,
  INITIAL_DEVELOPER_COMMENTS,
  seedChecklistForSolution,
} from './data/personaFlows';
import { parseGuestReviewFromHash, syncSolutionProjectStatus, findSolutionArtifacts, buildAdminChecklistApprovalPatch, syncPhaseProgressAfterApproval } from './utils/projectWorkflow';
import { persistWorkflowHandoff, seedHrTicketingWorkflowProgress } from './utils/projectStatusTracker';
import { buildDynamicArtifacts, isDynamicSolutionId } from './utils/dynamicSolutionArtifacts';
import { createInitialPhaseProgress } from './utils/phaseEngine';
import { syncPhaseAfterApproval } from './utils/phaseResponseEngine';
import {
  countMitraTurnsForThread,
  hasConversationStarted,
} from './utils/artifactReveal';
import {
  loadPersistedChecklist,
  loadPersistedDeveloperComments,
  loadPersistedReviews,
  persistChecklist,
  persistDeveloperComments,
  persistReviews,
  drainSnUpdates,
  enqueueSnUpdate,
  enqueuePhaseProgressSync,
  drainPhaseProgressSync,
  loadPersistedArtifactStatuses,
  persistArtifactStatuses,
  loadPersistedRequirementsDocuments,
  persistRequirementsDocuments,
} from './utils/personaStorage';
import {
  formatFlaggedSectionsForArchitect,
  lockRequirementsDocument,
  summarizeAcceptanceCriteria,
  toPlainLanguageSections,
  unlockRequirementsDocument,
  updateRequirementsSection,
} from './utils/requirementsDocument';
import { resolveGuestReview } from './utils/guestReviewAuth';
import { persistAuthMode, ARCHITECT_DISPLAY_NAME } from './constants/role';
import { extractHrsdProcessFromChat } from './utils/demoResponseEngine';
import {
  UNTITLED_FOLDER_NAME, UNTITLED_THREAD_NAME,
  threadTitleFromMessage, nextUntitledFolderName, SEED_PROJECT_FOLDERS,
} from './data/folders';
import type { ProjectFolder } from './data/folders';
import {
  getCollaboratorsForSolution,
  loadProjectCollaborators,
  persistProjectCollaborators,
} from './data/projectShares';
import { getInternalTeamMember } from './data/internalTeamMembers';
import { getMitraResponse } from './utils/aiResponseHelper';
import {
  approvalReceivedEvent,
  changesRequestedEvent,
  dispatchNotificationEvent,
  dispatchNotificationEvents,
  stakeholderArrivalEvent,
  type NotificationDispatch,
} from './utils/notificationRules';
import { getPhaseLabel, getPendingGateArtifacts } from './utils/phaseEngine';
import { isDemoMode } from './utils/demoMode';
import { getStreamCharsPerTick, getStreamFlushMs, getStreamTickMs } from './utils/chatTiming';
import { thinkingDelay } from './utils/demoThinkingDelay';
import { buildTodosForRequest, isBuildRequest, todosPresentationDelay } from './utils/buildTodos';
import { streamServiceNowChat } from './utils/chatStream';
import { condenseChoices, condenseResponse } from './utils/condenseResponse';
import {
  useResizablePanel,
  readArtifactPanelCollapsed,
  readLeftSidebarCollapsed,
  ARTIFACT_PANEL_COLLAPSED_KEY,
  ARTIFACT_PANEL_COLLAPSED_WIDTH,
  LEFT_SIDEBAR_COLLAPSED_KEY,
  LEFT_SIDEBAR_COLLAPSED_WIDTH,
  LEFT_SIDEBAR_PANEL_CONFIG,
  ARTIFACT_PANEL_CONFIG,
  LEFT_SIDEBAR_MIN_WIDTH,
  LEFT_SIDEBAR_MAX_WIDTH,
} from './hooks/useResizablePanel';
import { PanelResizeHandle } from './components/PanelResizeHandle';
import { StyleguideView } from './components/StyleguideView';
import { SettingsView } from './components/SettingsView';
import {
  isStyleguidePath,
  leaveStyleguideUrl,
  readStyleguideTabFromUrl,
} from './utils/styleguideRoute';
import {
  isDevSpecsPath,
  leaveDevSpecsUrl,
  readDevSpecsTabFromUrl,
} from './utils/devRoute';
import { DeveloperSpecsPanel } from './components/DeveloperSpecsPanel';
import {
  isLandingPath,
  leaveLandingUrl,
} from './utils/landingRoute';
import {
  readHighContrast,
  persistHighContrast,
  readFontSizeLevel,
  persistFontSizeLevel,
  readAmbientMusic,
  persistAmbientMusic,
} from './utils/settingsStorage';
import { useChatCompletionSound } from './utils/chatCompletionSound';
import {
  readThemePreference,
  resolveTheme,
  getSystemPrefersDark,
  isDarkTheme,
  THEME_STORAGE_KEY,
} from './utils/theme';
// @ts-ignore
import ambientMusic from './assets/leberch-ambient-electronics-524300.mp3';

declare global {
  interface Window {
    alert: (message?: any) => void;
  }
}

const CONNECTED_INSTANCES = [
  'https://dev12345.service-now.com',
  'https://test12345.service-now.com',
];

const V3_LOCKED_SOLUTION: Solution = {
  id: 'v3-locked-sol',
  name: '[v3 Beta] Integration Hub HubSpoke',
  description: 'A mock integration hub REST spoke for next week\'s release.',
  createdAt: '2026-06-30T14:30:00Z',
  active: false,
  blueprint: {
    id: 'v3-locked-blueprint',
    title: 'Integration Hub HubSpoke',
    description: 'A mock integration hub REST spoke for next week\'s release.',
    status: 'not_started',
    discoveredRequirements: [],
    architectureSteps: [],
    tables: []
  },
  chatHistory: [],
  folderId: undefined,
  phaseProgress: {
    solutionId: 'v3-locked-sol',
    currentPhase: 1,
    questionIndex: 0,
    artifactsGenerated: []
  }
};

export default function App() {
  const [themePreference, setThemePreference] = useState<Theme>(readThemePreference);
  const [systemDark, setSystemDark] = useState(getSystemPrefersDark);
  const resolvedTheme: ResolvedTheme = resolveTheme(themePreference, systemDark);
  const [highContrast, setHighContrastState] = useState<boolean>(readHighContrast);
  const [appVersion, setAppVersion] = useState<'v2' | 'v3'>('v2');

  const [fontSizeLevel, setFontSizeLevelState] = useState<number>(readFontSizeLevel);
  const [ambientMusicEnabled, setAmbientMusicEnabledState] = useState<boolean>(readAmbientMusic);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const [devModeEnabled, setDevModeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mitra_dev_mode') === 'true';
  });


  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light', 'blue');
    document.documentElement.classList.add(resolvedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [themePreference, resolvedTheme]);

  const setHighContrast = useCallback((value: boolean) => {
    setHighContrastState(value);
    persistHighContrast(value);
  }, []);

  const setFontSizeLevel = useCallback((level: number) => {
    const clamped = Math.max(0, Math.min(5, level));
    setFontSizeLevelState(clamped);
    persistFontSizeLevel(clamped);
  }, []);

  const setAmbientMusicEnabled = useCallback((value: boolean) => {
    setAmbientMusicEnabledState(value);
    persistAmbientMusic(value);
  }, []);

  useEffect(() => {
    const audio = ambientAudioRef.current;
    if (!audio) return;
    audio.volume = 0.08;
    if (ambientMusicEnabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [ambientMusicEnabled]);
  const [activeTab, setActiveTabState] = useState<string>(() => readStyleguideTabFromUrl() ?? readDevSpecsTabFromUrl() ?? 'dashboard');
  const preStyleguideTabRef = useRef<string>('dashboard');
  const preSettingsTabRef = useRef<string>('dashboard');
  const preDevSpecsTabRef = useRef<string>('dashboard');

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState((prev) => {
      if (tab === 'styleguide' && prev !== 'styleguide') {
        preStyleguideTabRef.current = prev;
      }
      if (tab === 'settings' && prev !== 'settings') {
        preSettingsTabRef.current = prev;
      }
      if (tab === 'dev-specs' && prev !== 'dev-specs') {
        preDevSpecsTabRef.current = prev;
      }
      return tab;
    });
    if (tab !== 'styleguide') {
      leaveStyleguideUrl();
    }
    if (tab !== 'dev-specs') {
      leaveDevSpecsUrl();
    }
  }, []);

  const handleLeaveStyleguide = useCallback(() => {
    setActiveTab(preStyleguideTabRef.current || 'dashboard');
  }, [setActiveTab]);

  const handleCloseSettings = useCallback(() => {
    setActiveTab(preSettingsTabRef.current || 'dashboard');
  }, [setActiveTab]);

  const handleLeaveDevSpecs = useCallback(() => {
    setActiveTab(preDevSpecsTabRef.current || 'dashboard');
  }, [setActiveTab]);

  const handleToggleDevMode = useCallback(() => {
    setDevModeEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('mitra_dev_mode', String(next));
      if (next) {
        setActiveTab('styleguide');
      } else {
        if (activeTab === 'styleguide') {
          handleLeaveStyleguide();
        }
      }
      return next;
    });
  }, [activeTab, handleLeaveStyleguide, setActiveTab]);



  const [userRole, setUserRole] = useState<UserRole>(() => readUserRole());
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [businessOwnerSubmissions, setBusinessOwnerSubmissions] = useState<BusinessOwnerSubmission[]>([]);
  const [selectedBusinessOwnerSubmissionId, setSelectedBusinessOwnerSubmissionId] = useState<string | null>(null);
  const [stakeholderReviews, setStakeholderReviews] = useState<StakeholderReview[]>(() =>
    loadPersistedReviews(INITIAL_STAKEHOLDER_REVIEWS),
  );
  const [artifactStatusOverrides, setArtifactStatusOverrides] = useState<Record<string, ArtifactStatus>>(
    () => loadPersistedArtifactStatuses(),
  );
  const [dynamicArtifactsBySolution, setDynamicArtifactsBySolution] = useState<
    Record<string, SolutionArtifact[]>
  >({});
  const [shareArtifactTarget, setShareArtifactTarget] = useState<SolutionArtifact | null>(null);
  const [shareProjectTargetId, setShareProjectTargetId] = useState<string | null>(null);
  const [projectCollaborators, setProjectCollaborators] = useState<ProjectCollaborator[]>(() =>
    loadProjectCollaborators(),
  );
  const [createConnectionNonce, setCreateConnectionNonce] = useState(0);
  const [lastShareReviewId, setLastShareReviewId] = useState<string | null>(null);
  const [guestReviewId, setGuestReviewId] = useState<string | null>(() => parseGuestReviewFromHash());
  const [adminChecklist, setAdminChecklist] = useState<AdminChecklistItem[]>(() =>
    loadPersistedChecklist(seedChecklistForSolution(HR_TICKETING_SOLUTION_ID)),
  );
  const [developerComments, setDeveloperComments] = useState<DeveloperComment[]>(() =>
    loadPersistedDeveloperComments(INITIAL_DEVELOPER_COMMENTS),
  );
  const [requirementsDocuments, setRequirementsDocuments] = useState<Record<string, RequirementsDocument>>(
    () => loadPersistedRequirementsDocuments(),
  );

  const [adminSelectedSolutionId, setAdminSelectedSolutionId] = useState<string | null>(HR_TICKETING_SOLUTION_ID);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const visibleSolutions = appVersion === 'v3' ? [...solutions, V3_LOCKED_SOLUTION] : solutions;

  const handleToggleFavorite = useCallback((solutionId: string) => {
    setSolutions((prev) =>
      prev.map((sol) =>
        sol.id === solutionId ? { ...sol, isFavorite: !sol.isFavorite } : sol
      )
    );
  }, []);

  const handleTogglePin = useCallback((solutionId: string) => {
    setSolutions((prev) =>
      prev.map((sol) =>
        sol.id === solutionId ? { ...sol, isPinned: !sol.isPinned } : sol
      )
    );
  }, []);

  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [activeSolutionId, setActiveSolutionId] = useState<string>('');
  const [selectedSidebarId, setSelectedSidebarId] = useState<string>('');
  /** Empty folder awaiting first thread — only this folder row highlights (no thread selected). */
  const [focusedFolderId, setFocusedFolderId] = useState<string>('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState<boolean>(false);
  const [generatingSolutionId, setGeneratingSolutionId] = useState<string | null>(null);
  const [artifactPanelCollapsed, setArtifactPanelCollapsed] = useState(readArtifactPanelCollapsed);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(readLeftSidebarCollapsed);
  const [autoApprove, setAutoApprove] = useState(readAutoApprove);
  const [isServerConnected, setIsServerConnected] = useState(
    () => (typeof navigator !== 'undefined' ? navigator.onLine : true),
  );

  const handleToggleArtifactPanelCollapse = useCallback(() => {
    setArtifactPanelCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ARTIFACT_PANEL_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  const handleToggleLeftSidebarCollapse = useCallback(() => {
    setLeftSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LEFT_SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  const handleAutoApproveChange = useCallback((value: boolean) => {
    setAutoApprove(value);
    persistAutoApprove(value);
  }, []);

  useEffect(() => {
    const syncConnectionState = () => setIsServerConnected(navigator.onLine);

    window.addEventListener('online', syncConnectionState);
    window.addEventListener('offline', syncConnectionState);

    return () => {
      window.removeEventListener('online', syncConnectionState);
      window.removeEventListener('offline', syncConnectionState);
    };
  }, []);

  type GenerationSession = {
    cancelled: boolean;
    abortController: AbortController;
    timers: Set<ReturnType<typeof setTimeout>>;
    targetSolutionId: string;
    aiMessageId: string;
  };

  const generationRef = useRef<GenerationSession | null>(null);

  const stopGeneration = useCallback(() => {
    const session = generationRef.current;
    if (!session) return;

    session.cancelled = true;
    session.abortController.abort();
    for (const timer of session.timers) clearTimeout(timer);
    session.timers.clear();

    setSolutions((prev) =>
      prev.map((sol) => {
        if (sol.id !== session.targetSolutionId) return sol;
        const chatHistory = sol.chatHistory
          .map((m) => {
            if (m.id !== session.aiMessageId) return m;
            const condensed = condenseResponse(m.text);
            return condensed ? { ...m, text: condensed } : m;
          })
          .filter((m) => m.id !== session.aiMessageId || m.text.trim().length > 0);
        return { ...sol, isLoading: false, chatHistory };
      }),
    );

    setIsGeneratingMessage(false);
    setGeneratingSolutionId(null);
    generationRef.current = null;
  }, []);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  const handleTourPrepareStep = useCallback((step: import('./constants/onboardingTour').OnboardingTourStep) => {
    if (step.requiresExpandedSidebar) {
      setLeftSidebarCollapsed(false);
      try {
        localStorage.setItem(LEFT_SIDEBAR_COLLAPSED_KEY, 'false');
      } catch {
        /* ignore storage errors */
      }
    }
    if (step.requiredTab) {
      setActiveTab(step.requiredTab);
    }
  }, [setActiveTab]);

  const handleOpenTour = useCallback(() => {
    setActiveTab('dashboard');
    setLeftSidebarCollapsed(false);
    try {
      localStorage.setItem(LEFT_SIDEBAR_COLLAPSED_KEY, 'false');
    } catch {
      /* ignore storage errors */
    }
    setIsTourOpen(true);
  }, [setActiveTab]);
  const [whatsNewOpen, setWhatsNewOpen] = useState<boolean>(false);
  const DEFAULT_MODEL = 'gemini-2.5-flash';
  const [welcomeComplete, setWelcomeComplete] = useState<boolean>(() => {
    if (parseGuestReviewFromHash()) return true;
    return localStorage.getItem('mitra_welcome_complete') === 'true';
  });
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    if (parseGuestReviewFromHash()) return false;
    if (isLandingPath(window.location.pathname)) return true;
    if (localStorage.getItem('mitra_welcome_complete') === 'true') return false;
    return localStorage.getItem('mitra_landing_seen') !== 'true';
  });
  const [simulationAlertOpen, setSimulationAlertOpen] = useState<boolean>(() => {
    if (localStorage.getItem('mitra_welcome_complete') !== 'true') return false;
    return localStorage.getItem('mitra_sim_ack') !== 'true';
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'info' | 'warning' | 'danger';
    onConfirm: () => void;
  } | null>(null);

  const activeSolution = solutions.find(s => s.id === activeSolutionId) || null;

  useChatCompletionSound(
    isGeneratingMessage,
    activeSolution?.chatHistory ?? [],
  );

  const mitraTurnCount = activeSolution
    ? countMitraTurnsForThread(activeSolution.chatHistory)
    : 0;
  const conversationStarted = activeSolution
    ? hasConversationStarted(activeSolution.chatHistory)
    : false;
  const showArtifactPanel =
    activeTab === 'projects' &&
    Boolean(activeSolutionId && conversationStarted && mitraTurnCount > 0);

  const [artifactLayoutWidth, setArtifactLayoutWidth] = useState(0);

  const {
    width: leftSidebarWidth,
    isResizing: isLeftSidebarResizing,
    handleResizeStart: handleLeftSidebarResizeStart,
  } = useResizablePanel(LEFT_SIDEBAR_PANEL_CONFIG, artifactLayoutWidth);

  const effectiveLeftSidebarWidth = leftSidebarCollapsed
    ? LEFT_SIDEBAR_COLLAPSED_WIDTH
    : leftSidebarWidth;

  const {
    width: artifactPanelWidth,
    isResizing: isArtifactPanelResizing,
    handleResizeStart: handleArtifactPanelResizeStart,
  } = useResizablePanel(ARTIFACT_PANEL_CONFIG, effectiveLeftSidebarWidth);

  useEffect(() => {
    const next = showArtifactPanel
      ? artifactPanelCollapsed
        ? ARTIFACT_PANEL_COLLAPSED_WIDTH
        : artifactPanelWidth
      : 0;
    setArtifactLayoutWidth((prev) => (prev === next ? prev : next));
  }, [showArtifactPanel, artifactPanelCollapsed, artifactPanelWidth]);

  const registerDynamicArtifacts = useCallback((solutionId: string, title: string) => {
    if (!isDynamicSolutionId(solutionId)) return;
    setDynamicArtifactsBySolution((prev) => {
      if (prev[solutionId]) return prev;
      return { ...prev, [solutionId]: buildDynamicArtifacts(solutionId, title) };
    });
  }, []);

  const dismissLanding = () => {
    localStorage.setItem('mitra_landing_seen', 'true');
    setShowLanding(false);
    leaveLandingUrl();
  };

  const enterWorkspace = (mode: 'signed-in' | 'guest' = 'guest') => {
    dismissLanding();
    completeWelcome(mode);
  };

  const completeWelcome = (mode: 'signed-in' | 'guest') => {
    localStorage.setItem('mitra_welcome_complete', 'true');
    localStorage.setItem('mitra_auth_mode', mode);
    setWelcomeComplete(true);
    if (localStorage.getItem('mitra_sim_ack') !== 'true') {
      setSimulationAlertOpen(true);
    }
    if (localStorage.getItem('mitra_tour_completed') !== 'true') {
      setActiveTab('dashboard');
      setLeftSidebarCollapsed(false);
      setIsTourOpen(true);
    }
    // WhatsNew modal removed
  };

  const dismissSimulationAlert = () => {
    localStorage.setItem('mitra_sim_ack', 'true');
    setSimulationAlertOpen(false);
  };

  useEffect(() => {
    // WhatsNew modal removed
  }, [welcomeComplete]);

  useEffect(() => {
    const onHash = () => setGuestReviewId(parseGuestReviewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (isStyleguidePath(window.location.pathname)) {
        setActiveTabState('styleguide');
      }
      if (isDevSpecsPath(window.location.pathname)) {
        setActiveTabState('dev-specs');
      }
      if (isLandingPath(window.location.pathname) && !parseGuestReviewFromHash()) {
        setShowLanding(true);
      } else if (
        !isLandingPath(window.location.pathname) &&
        localStorage.getItem('mitra_welcome_complete') === 'true'
      ) {
        setShowLanding(false);
      }
    };
    window.addEventListener('popstate', syncTabFromUrl);
    return () => window.removeEventListener('popstate', syncTabFromUrl);
  }, []);

  useEffect(() => {
    if (!welcomeComplete) return;
    if (adminChecklist.length === 0) {
      setAdminChecklist(seedChecklistForSolution(HR_TICKETING_SOLUTION_ID));
    }
  }, [welcomeComplete, adminChecklist.length]);

  useEffect(() => {
    persistReviews(stakeholderReviews);
  }, [stakeholderReviews]);

  useEffect(() => {
    persistArtifactStatuses(artifactStatusOverrides);
  }, [artifactStatusOverrides]);

  useEffect(() => {
    persistRequirementsDocuments(requirementsDocuments);
  }, [requirementsDocuments]);

  useEffect(() => {
    persistDeveloperComments(developerComments);
  }, [developerComments]);

  useEffect(() => {
    if (adminChecklist.length > 0) persistChecklist(adminChecklist);
  }, [adminChecklist]);

  useEffect(() => {
    if (!welcomeComplete) return;
    const completed = localStorage.getItem('mitra_tour_completed');
    if (completed !== 'true') {
      setActiveTab('dashboard');
      setLeftSidebarCollapsed(false);
      setIsTourOpen(true);
    }
  }, [welcomeComplete]);

  useEffect(() => {
    setSolutions((prev) => {
      const next = syncSolutionProjectStatus(prev, artifactStatusOverrides);
      const changed = next.some((sol, i) => sol.projectStatus !== prev[i]?.projectStatus);
      return changed ? next : prev;
    });
  }, [artifactStatusOverrides]);

  useEffect(() => {
    if (!welcomeComplete || solutions.length > 0) return;
    const stored = localStorage.getItem('mitra_solutions');
    if (stored) {
      try {
        setSolutions(JSON.parse(stored));
        setFolders(SEED_PROJECT_FOLDERS);
        return;
      } catch (e) {
        // ignore
      }
    }
    const seeded = seedHrTicketingWorkflowProgress(
      INITIAL_SOLUTIONS.map((sol) => ({
        ...sol,
        active: false,
      })),
    );
    setSolutions(seeded);
    setFolders(SEED_PROJECT_FOLDERS);
  }, [welcomeComplete, solutions.length]);

  useEffect(() => {
    if (solutions.length > 0) {
      localStorage.setItem('mitra_solutions', JSON.stringify(solutions));
    }
  }, [solutions]);

  useEffect(() => {
    persistProjectCollaborators(projectCollaborators);
  }, [projectCollaborators]);

  
  // Header Interactive Panels
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; read: boolean }>>([
    { id: '1', text: 'HR Ticketing integration successfully validated in Dev instance', time: 'Just now', read: false },
    { id: '2', text: 'Mitra generated custom Business Rule scripts for Asset Recovery flow', time: '3 hours ago', read: false },
    { id: '3', text: 'Standard SLA timers refreshed for task mappings', time: '1 day ago', read: true },
  ]);
  const [centerToast, setCenterToast] = useState<CenterToastData | null>(null);



  // React on changes to sync actively selected solutions array
  const handleSelectSolution = (id: string) => {
    if (id === 'v3-locked-sol') {
      setConfirmDialog({
        title: 'v3 Release Preview',
        message: 'This IntegrationHub REST Spoke solution is currently locked and will release next week in v3. Use the toggle in the sidebar header to switch back to v2.',
        confirmLabel: 'Got it',
        onConfirm: () => setConfirmDialog(null),
        variant: 'info'
      });
      return;
    }
    setFocusedFolderId('');
    setSelectedArtifactId(null);
    setSelectedReviewId(null);
    setSolutions(prev => prev.map(sol => ({
      ...sol,
      active: sol.id === id
    })));
    setActiveSolutionId(id);
    setSelectedSidebarId(id);
    setActiveTab('projects');
  };

  const handleRoleChange = (role: UserRole) => {
    persistUserRole(role);
    setUserRole(role);
    setSelectedArtifactId(null);
    setSelectedReviewId(null);
    setGuestReviewId(null);
    window.location.hash = '';
    const personaTabs = ['business-owner', 'stakeholder-review', 'security-review', 'sponsor-review', 'admin-panel', 'developer'] as const;
    if (activeTab === 'settings') {
      if (role === 'developer') {
        pushNotification('Data Model and Script Library for HR Ticketing System are available');
      }
      return;
    }
    if (role === 'business_owner') {
      setActiveTab('business-owner');
    } else if (role === 'stakeholder') {
      const pending = filterReviewsForRole(stakeholderReviews, 'stakeholder').find((r) => r.status === 'awaiting');
      if (pending) {
        setSelectedReviewId(pending.id);
        const reqDoc = requirementsDocuments[pending.artifactId];
        const acceptanceSummary = reqDoc
          ? summarizeAcceptanceCriteria(reqDoc.sections)
          : 'Review acceptance criteria in the Requirements Document.';
        dispatchNotificationEvent(
          stakeholderArrivalEvent({
            artifactName: pending.artifactName,
            solutionTitle: pending.solutionTitle,
            acceptanceCriteriaSummary: acceptanceSummary,
            approversSummary: 'CTO · Delivery Manager · IT Manager · Business Stakeholder',
          }),
          getNotificationDispatch(),
        );
      } else {
        const activeArtifacts = activeSolutionId
          ? findSolutionArtifacts(
              activeSolutionId,
              artifactStatusOverrides,
              dynamicArtifactsBySolution,
              solutions,
            )
          : [];
        const reqArtifact = activeArtifacts.find((a) => a.type === 'requirements_doc');
        const reqStatus = reqArtifact
          ? artifactStatusOverrides[reqArtifact.id] ?? reqArtifact.status
          : undefined;
        if (
          reqArtifact &&
          (reqStatus === 'draft' || reqStatus === 'in_review' || reqStatus === 'pending')
        ) {
          const reqDoc = requirementsDocuments[reqArtifact.id];
          dispatchNotificationEvent(
            stakeholderArrivalEvent({
              artifactName: reqArtifact.name,
              solutionTitle: getSolutionTitle(reqArtifact.solutionId, solutions),
              acceptanceCriteriaSummary: reqDoc
                ? summarizeAcceptanceCriteria(reqDoc.sections)
                : 'Requirements Document awaiting Business Stakeholder sign-off.',
              approversSummary: 'CTO · Delivery Manager · IT Manager · Business Stakeholder',
            }),
            getNotificationDispatch(),
          );
        }
      }
      setActiveTab('stakeholder-review');
    } else if (role === 'security') {
      const pending = filterReviewsForRole(stakeholderReviews, 'security').find((r) => r.status === 'awaiting');
      if (pending) setSelectedReviewId(pending.id);
      setActiveTab('security-review');
    } else if (role === 'sponsor') {
      const pending = filterReviewsForRole(stakeholderReviews, 'sponsor').find((r) => r.status === 'awaiting');
      if (pending) setSelectedReviewId(pending.id);
      setActiveTab('sponsor-review');
    } else if (role === 'admin') {
      setAdminSelectedSolutionId(HR_TICKETING_SOLUTION_ID);
      setActiveTab('admin-panel');
    } else if (role === 'developer') {
      setActiveTab('developer');
      pushNotification('Data Model and Script Library for HR Ticketing System are available');
    } else if (personaTabs.includes(activeTab as (typeof personaTabs)[number])) {
      setActiveTab('dashboard');
    }
  };

  const handleSelectArtifact = (artifactId: string, solutionId: string) => {
    const existing = solutions.find((s) => s.id === solutionId);
    if (existing) {
      handleSelectSolution(solutionId);
    } else {
      setActiveSolutionId(solutionId);
      setSelectedSidebarId(solutionId);
    }
    setSelectedArtifactId(artifactId);
    setSelectedReviewId(null);
    setActiveTab('artifact');
  };

  const handleArtifactPanelSelect = (artifactId: string, solutionId: string) => {
    const existing = solutions.find((s) => s.id === solutionId);
    if (existing) {
      handleSelectSolution(solutionId);
    } else {
      setActiveSolutionId(solutionId);
      setSelectedSidebarId(solutionId);
    }
    setSelectedArtifactId(artifactId);
    setSelectedReviewId(null);
  };

  const handleCreateArtifact = () => {
    if (!activeSolutionId) return;
    setActiveTab('projects');
    handleSendMessage('Generate the next deliverable for this solution.');
  };

  const handleOpenArtifactInChat = (artifact: SolutionArtifact) => {
    handleSelectSolution(artifact.solutionId);
    setActiveTab('projects');
    handleSendMessage(`Refine \`${artifact.filingName}\` (${artifact.name}) for this solution.`);
  };

  const pushNotification = (text: string) => {
    setNotifications((prev) => [
      { id: `n-${Date.now()}`, text, time: 'Just now', read: false },
      ...prev,
    ]);
  };

  const showCenterToast = useCallback((message: string, title?: string) => {
    setCenterToast({ id: `toast-${Date.now()}`, message, title });
  }, []);

  const dismissCenterToast = useCallback(() => {
    setCenterToast(null);
  }, []);

  const getNotificationDispatch = useCallback(
    (): NotificationDispatch => ({
      pushNotification,
      showCenterToast,
    }),
    [showCenterToast],
  );

  const handleMarkArtifactReady = (artifact: SolutionArtifact) => {
    setArtifactStatusOverrides((prev) => ({ ...prev, [artifact.id]: 'pending' }));
    showCenterToast(
      `\`${artifact.filingName}\` is ready for stakeholder review.`,
      'Artifact marked ready',
    );
    pushNotification(`\`${artifact.filingName}\` marked ready for review`);
  };

  const handleSelectStakeholderReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setSelectedArtifactId(null);
    setActiveTab('stakeholder-review');
  };

  const handleSelectSecurityReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setSelectedArtifactId(null);
    setActiveTab('security-review');
  };

  const handleSelectSponsorReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setSelectedArtifactId(null);
    setActiveTab('sponsor-review');
  };

  const handleContactArchitect = () => {
    setConfirmDialog({
      title: 'Contact your Architect',
      message: 'Reach out to your Mitra architect at architect@company.com or via your organization’s ServiceNow project channel.',
      confirmLabel: 'Got it',
      onConfirm: () => setConfirmDialog(null),
    });
  };

  const injectSnUpdateToSolution = useCallback((solutionId: string, text: string, choices?: string[]) => {
    const msg: ChatMessage = {
      id: `msg-sn-${Date.now()}`,
      sender: 'mitra',
      text,
      timestamp: new Date(),
      snUpdate: text.includes('## Record updated'),
      choices: choices ?? ['What did stakeholder respond?', 'View artifact panel', 'Continue building'],
    };
    setSolutions((prev) =>
      prev.map((sol) =>
        sol.id === solutionId
          ? { ...sol, chatHistory: [...sol.chatHistory, msg] }
          : sol,
      ),
    );
  }, []);

  const sendPlanToStakeholder = useCallback((processLabel = 'Employee Onboarding') => {
    const summaryText = buildExecutiveSummary(processLabel);
    const pendingReview = createPendingHrSummaryReview(summaryText);

    setStakeholderReviews((prev) => {
      const without = prev.filter((r) => r.id !== HR_SUMMARY_REVIEW_ID);
      return [pendingReview, ...without];
    });
    setArtifactStatusOverrides((prev) => ({
      ...prev,
      [HR_SUMMARY_ARTIFACT_ID]: 'in_review',
    }));
    setSelectedReviewId(HR_SUMMARY_REVIEW_ID);
    pushNotification('Executive Summary sent to project sponsor for approval');
  }, []);

  const applyArtifactApproval = useCallback((
    review: StakeholderReview,
    outcome: 'approved' | 'changes_requested',
    comments?: string,
    reviewerName?: string,
    sectionComments?: StakeholderSectionComment[],
  ) => {
    const artifact = findArtifactWithStatuses(
      review.artifactId,
      artifactStatusOverrides,
      dynamicArtifactsBySolution,
      solutions,
    );
    const isRequirementsDoc = artifact?.type === 'requirements_doc';
    const reviewerRole = inferReviewReviewerRole(review, artifact);
    if (!guestReviewId && !canRoleApproveReview(userRole, review, artifact)) {
      showCenterToast(
        `Only ${getPersonaShareLabel(reviewerRole)} can approve ${review.artifactName}.`,
        'Approval blocked',
      );
      return;
    }

    const persona = reviewerName ?? PERSONA_REVIEW_LABELS[reviewerRole];
    if (outcome === 'approved') {
      const nextStatuses = { ...artifactStatusOverrides, [review.artifactId]: 'approved' as ArtifactStatus };
      const sol = solutions.find((s) => s.id === review.solutionId);
      const artifacts = findSolutionArtifacts(
        review.solutionId,
        nextStatuses,
        dynamicArtifactsBySolution,
        solutions,
      );
      const syncedProgress =
        sol?.phaseProgress && isRequirementsDoc
          ? syncPhaseAfterApproval(sol.phaseProgress, artifacts, nextStatuses)
          : undefined;

      setArtifactStatusOverrides((o) => {
        const next = { ...o, [review.artifactId]: 'approved' as ArtifactStatus };
        setSolutions((prev) =>
          prev.map((solEntry) => {
            if (solEntry.id !== review.solutionId || !solEntry.phaseProgress) return solEntry;
            const arts = findSolutionArtifacts(
              solEntry.id,
              next,
              dynamicArtifactsBySolution,
              prev,
            );
            const synced = syncPhaseAfterApproval(solEntry.phaseProgress, arts, next);
            return synced === solEntry.phaseProgress ? solEntry : { ...solEntry, phaseProgress: synced };
          }),
        );
        return next;
      });
      if (isRequirementsDoc && requirementsDocuments[review.artifactId]) {
        setRequirementsDocuments((prev) => ({
          ...prev,
          [review.artifactId]: lockRequirementsDocument(prev[review.artifactId]),
        }));
      }
      const snText = formatApprovalResponseUpdate({
        record: `${review.artifactName} — ${review.solutionTitle}`,
        outcome: 'approved',
        reviewerRole,
        comments,
      });
      if (guestReviewId) {
        enqueueSnUpdate(review.solutionId, snText);
        if (isRequirementsDoc && syncedProgress) {
          enqueuePhaseProgressSync(review.solutionId, syncedProgress);
        }
      } else {
        injectSnUpdateToSolution(review.solutionId, snText);
      }
      if (isRequirementsDoc) {
        const phase2Prompt =
          'Requirements approved. Ready to begin solution design. First — which ServiceNow application scope will this live in?';
        const phase2Choices = ['Answer scope question', 'Show phase status', 'View Requirements Document'];
        if (guestReviewId) {
          enqueueSnUpdate(review.solutionId, phase2Prompt);
        } else {
          injectSnUpdateToSolution(review.solutionId, phase2Prompt, phase2Choices);
        }
      }
      pushNotification(`${review.artifactName} approved by ${persona}`);
      dispatchNotificationEvents(
        [approvalReceivedEvent(review.artifactName, review.solutionTitle, persona)],
        getNotificationDispatch(),
      );
    } else {
      setArtifactStatusOverrides((o) => ({ ...o, [review.artifactId]: 'draft' }));
      if (isRequirementsDoc && requirementsDocuments[review.artifactId]) {
        setRequirementsDocuments((prev) => ({
          ...prev,
          [review.artifactId]: unlockRequirementsDocument(prev[review.artifactId]),
        }));
      }
      const flagged =
        sectionComments && sectionComments.length > 0
          ? formatFlaggedSectionsForArchitect(sectionComments)
          : formatFlaggedSectionsForArchitect([]);
      const snText = formatApprovalResponseUpdate({
        record: `${review.artifactName} — ${review.solutionTitle}`,
        outcome: 'changes_requested',
        reviewerRole,
        comments: comments ?? 'Please revise and resubmit.',
      });
      if (guestReviewId) {
        enqueueSnUpdate(review.solutionId, snText);
        enqueueSnUpdate(review.solutionId, flagged);
      } else {
        injectSnUpdateToSolution(review.solutionId, snText);
        if (isRequirementsDoc) {
          injectSnUpdateToSolution(review.solutionId, flagged, [
            'Update functional requirements',
            'Share for approval',
            'Show artifact in panel',
          ]);
        }
      }
      dispatchNotificationEvents(
        [
          changesRequestedEvent(
            review.artifactName,
            review.solutionTitle,
            comments ?? 'Please revise and resubmit.',
          ),
        ],
        getNotificationDispatch(),
      );
      pushNotification(`Changes requested on ${review.artifactName}`);
    }
    if (!guestReviewId) {
      queueMicrotask(() => {
        setUserRole('architect');
        persistUserRole('architect');
        setActiveTab('projects');
        setActiveSolutionId(review.solutionId);
        setSelectedSidebarId(review.solutionId);
      });
    }
  }, [guestReviewId, injectSnUpdateToSolution, dynamicArtifactsBySolution, getNotificationDispatch, userRole, artifactStatusOverrides, solutions, showCenterToast, requirementsDocuments]);

  const approveStakeholderReview = useCallback((reviewId: string, comments?: string, sectionComments?: StakeholderSectionComment[]) => {
    setStakeholderReviews((prev) => {
      const review = prev.find((r) => r.id === reviewId);
      if (review) applyArtifactApproval(review, 'approved', comments, undefined, sectionComments);
      return prev.map((r) =>
        r.id === reviewId
          ? {
              ...completeReview(r, 'approved', comments ?? 'Approved as-is. Proceed to build phase.'),
              sectionComments,
            }
          : r,
      );
    });
  }, [applyArtifactApproval]);

  const requestStakeholderChanges = useCallback((reviewId: string, comments?: string, sectionComments?: StakeholderSectionComment[]) => {
    setStakeholderReviews((prev) => {
      const review = prev.find((r) => r.id === reviewId);
      if (review) applyArtifactApproval(review, 'changes_requested', comments, undefined, sectionComments);
      return prev.map((r) =>
        r.id === reviewId
          ? {
              ...completeReview(r, 'changes_requested', comments ?? 'Please revise scope and timeline section.'),
              sectionComments,
            }
          : r,
      );
    });
  }, [applyArtifactApproval]);

  const approveSecurityReview = useCallback((reviewId: string, justification?: string) => {
    setStakeholderReviews((prev) => {
      const review = prev.find((r) => r.id === reviewId);
      if (review) {
        applyArtifactApproval(
          review,
          'approved',
          justification ?? 'ACL coverage and segregation of duties validated.',
          PERSONA_REVIEW_LABELS.security,
        );
      }
      return prev.map((r) =>
        r.id === reviewId
          ? completeReview(r, 'approved', justification ?? 'ACL coverage and segregation of duties validated.')
          : r,
      );
    });
  }, [applyArtifactApproval]);

  const rejectSecurityReview = useCallback((reviewId: string, justification: string) => {
    setStakeholderReviews((prev) => {
      const review = prev.find((r) => r.id === reviewId);
      if (review) {
        applyArtifactApproval(review, 'changes_requested', justification, PERSONA_REVIEW_LABELS.security);
      }
      return prev.map((r) =>
        r.id === reviewId ? completeReview(r, 'changes_requested', justification) : r,
      );
    });
  }, [applyArtifactApproval]);

  const approveSponsorReview = useCallback((reviewId: string, comments?: string) => {
    setStakeholderReviews((prev) => {
      const review = prev.find((r) => r.id === reviewId);
      const note = comments ?? 'Investment authorized — proceed to build phase.';
      if (review) {
        applyArtifactApproval(review, 'approved', note, PERSONA_REVIEW_LABELS.sponsor);
      }
      return prev.map((r) =>
        r.id === reviewId ? completeReview(r, 'approved', note) : r,
      );
    });
  }, [applyArtifactApproval]);

  const requestSponsorChanges = useCallback((reviewId: string, comments?: string) => {
    setStakeholderReviews((prev) => {
      const review = prev.find((r) => r.id === reviewId);
      const note = comments ?? 'Executive summary requires revision before investment approval.';
      if (review) {
        applyArtifactApproval(review, 'changes_requested', note, PERSONA_REVIEW_LABELS.sponsor);
      }
      return prev.map((r) =>
        r.id === reviewId ? completeReview(r, 'changes_requested', note) : r,
      );
    });
  }, [applyArtifactApproval]);

  const flushPendingSnUpdates = useCallback(() => {
    for (const item of drainSnUpdates()) {
      injectSnUpdateToSolution(item.solutionId, item.text);
    }
    const phaseSync = drainPhaseProgressSync();
    if (phaseSync) {
      setSolutions((prev) =>
        prev.map((sol) =>
          sol.id === phaseSync.solutionId
            ? { ...sol, phaseProgress: phaseSync.phaseProgress }
            : sol,
        ),
      );
    }
  }, [injectSnUpdateToSolution]);

  useEffect(() => {
    if (guestReviewId) return;
    flushPendingSnUpdates();
  }, [flushPendingSnUpdates, guestReviewId]);

  useEffect(() => {
    if (guestReviewId) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mitra_stakeholder_reviews' && e.newValue) {
        try {
          setStakeholderReviews(JSON.parse(e.newValue) as StakeholderReview[]);
        } catch {
          /* ignore malformed payload */
        }
      }
      if (e.key === 'mitra_artifact_status_overrides' && e.newValue) {
        try {
          setArtifactStatusOverrides(JSON.parse(e.newValue) as Record<string, ArtifactStatus>);
        } catch {
          /* ignore malformed payload */
        }
      }
      if (e.key === 'mitra_pending_sn_updates') {
        flushPendingSnUpdates();
      }
      if (e.key === 'mitra_pending_phase_sync') {
        flushPendingSnUpdates();
      }
      if (e.key === 'mitra_admin_checklist' && e.newValue) {
        try {
          setAdminChecklist(JSON.parse(e.newValue) as AdminChecklistItem[]);
        } catch {
          /* ignore malformed payload */
        }
      }
      if (e.key === 'mitra_developer_comments' && e.newValue) {
        try {
          setDeveloperComments(JSON.parse(e.newValue) as DeveloperComment[]);
        } catch {
          /* ignore malformed payload */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [flushPendingSnUpdates, guestReviewId]);

  const handleShareArtifact = (artifact: SolutionArtifact) => {
    setShareArtifactTarget(artifact);
    setLastShareReviewId(null);
  };

  const handleShareProject = useCallback((solutionId: string) => {
    setShareProjectTargetId(solutionId);
  }, []);

  const handleOpenCreateConnection = useCallback(() => {
    setCreateConnectionNonce((nonce) => nonce + 1);
    setActiveTab('connections');
  }, [setActiveTab]);

  const handleInviteProjectCollaborator = useCallback(
    ({ memberId, permission }: { memberId: string; permission: ProjectSharePermission }) => {
      if (!shareProjectTargetId) return;
      const solution = solutions.find((s) => s.id === shareProjectTargetId);
      const member = getInternalTeamMember(memberId);
      if (!solution || !member) return;

      const collaborator: ProjectCollaborator = {
        id: `collab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        solutionId: shareProjectTargetId,
        email: member.email,
        name: member.name,
        permission,
        invitedAt: new Date().toISOString(),
        invitedBy: ARCHITECT_DISPLAY_NAME,
        status: 'active',
      };

      setProjectCollaborators((prev) => [...prev, collaborator]);
      showCenterToast(
        `${member.name} now has ${permission} access.`,
        `Shared ${solution.blueprint.title || solution.name}`,
      );
      pushNotification(
        `${ARCHITECT_DISPLAY_NAME} shared ${solution.blueprint.title || solution.name} with ${member.name}`,
      );
    },
    [shareProjectTargetId, solutions],
  );

  const handleRemoveProjectCollaborator = useCallback(
    (collaboratorId: string) => {
      const removed = projectCollaborators.find((c) => c.id === collaboratorId);
      setProjectCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
      if (removed) {
        showCenterToast(
          `${removed.email} no longer has access to this project.`,
          'Collaborator removed',
        );
      }
    },
    [projectCollaborators],
  );

  const handleUpdateRequirementsSection = useCallback(
    (artifactId: string, sectionId: string, body: string) => {
      setRequirementsDocuments((prev) => {
        const doc = prev[artifactId];
        if (!doc || doc.locked) return prev;
        return { ...prev, [artifactId]: updateRequirementsSection(doc, sectionId, body) };
      });
    },
    [],
  );

  const executeShareArtifact = ({
    email,
    permission,
    autoApprove: shareAutoApprove,
  }: {
    email: string;
    permission: SharePermission;
    autoApprove?: boolean;
  }) => {
    if (!shareArtifactTarget) return;
    const solutionTitle = getSolutionTitle(shareArtifactTarget.solutionId, solutions);
    const history = solutions.find((s) => s.id === shareArtifactTarget.solutionId)?.chatHistory ?? [];
    const reqDoc = requirementsDocuments[shareArtifactTarget.id];
    const plainSections = reqDoc ? toPlainLanguageSections(reqDoc.sections) : undefined;
    const summaryText =
      shareArtifactTarget.id === HR_SUMMARY_ARTIFACT_ID
        ? buildExecutiveSummary(extractHrsdProcessFromChat(history))
        : shareArtifactTarget.type === 'requirements_doc' && plainSections
          ? plainSections.map((s) => `${s.title}\n${s.body}`).join('\n\n')
          : `Review ${shareArtifactTarget.name} for ${solutionTitle}.`;

    const reviewerRole = getRequiredApprover(shareArtifactTarget);
    const recipientName = recipientNameFromEmail(email);

    const review = createShareReview({
      artifactId: shareArtifactTarget.id,
      artifactName: shareArtifactTarget.name,
      solutionId: shareArtifactTarget.solutionId,
      solutionTitle,
      summaryText,
      guestSections: plainSections,
      email,
      permission,
      senderName: ARCHITECT_DISPLAY_NAME,
      reviewerRole,
    });

    setLastShareReviewId(review.id);
    setStakeholderReviews((prev) => [review, ...prev]);
    setArtifactStatusOverrides((prev) => ({
      ...prev,
      [shareArtifactTarget.id]: 'in_review',
    }));

    const snText = formatShareSnUpdate({
      artifactName: shareArtifactTarget.name,
      solutionTitle,
      email,
      permission,
      senderName: ARCHITECT_DISPLAY_NAME,
      reviewerRole,
    });
    injectSnUpdateToSolution(shareArtifactTarget.solutionId, snText);

    if (shareArtifactTarget.type === 'requirements_doc') {
      injectSnUpdateToSolution(
        shareArtifactTarget.solutionId,
        `Requirements Document sent to ${recipientName} for approval. I'll notify you when they respond. While you wait — do you want to explore the data model based on current requirements?`,
        ['Explore data model', 'Wait for approval', 'Show phase status'],
      );
    }

    showCenterToast(
      `Guest review link sent to ${email}. Status updated to In Review.`,
      `Shared ${shareArtifactTarget.name} with ${getPersonaShareLabel(reviewerRole)}`,
    );
    pushNotification(
      `${ARCHITECT_DISPLAY_NAME} routed ${shareArtifactTarget.name} to ${getPersonaShareLabel(reviewerRole)} (${email})`,
    );

    const shouldAutoApprove = shareAutoApprove ?? autoApprove;
    if (shouldAutoApprove) {
      window.setTimeout(() => {
        approveStakeholderReview(review.id, 'Approved as-is. Proceed to solution design.');
        showCenterToast(
          `${shareArtifactTarget.name} approved by ${recipientName}.`,
          'Requirements approved',
        );
      }, DEMO_AUTO_APPROVE_MS);
    }
  };

  const handlePreviewGuest = (reviewId: string) => {
    persistAuthMode('guest');
    localStorage.setItem('mitra_welcome_complete', 'true');
    setGuestReviewId(reviewId);
    setShareArtifactTarget(null);
    window.location.hash = `guest-review=${reviewId}`;
  };

  const handleMarkChecklistComplete = (itemId: string) => {
    setAdminChecklist((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, completed: true } : item));
      const solutionId = next.find((i) => i.id === itemId)?.solutionId ?? HR_TICKETING_SOLUTION_ID;
      const approvalPatch = buildAdminChecklistApprovalPatch(next, solutionId);
      if (approvalPatch) {
        setArtifactStatusOverrides((statuses) => {
          const merged = { ...statuses, ...approvalPatch };
          setSolutions((sols) =>
            sols.map((sol) => {
              if (sol.id !== solutionId || !sol.phaseProgress) return sol;
              const artifacts = findSolutionArtifacts(
                sol.id,
                merged,
                dynamicArtifactsBySolution,
                sols,
              );
              const synced = syncPhaseProgressAfterApproval(sol, artifacts, merged);
              return synced ? { ...sol, phaseProgress: synced } : sol;
            }),
          );
          return merged;
        });
        pushNotification('Deployment checklist complete — Phase 7 gate cleared');
        showCenterToast('All deployment steps complete. Ready to deploy.', 'Admin gate cleared');
      }
      return next;
    });
  };

  const completeDeveloperArtifactReview = useCallback((
    artifactId: string,
    outcome: 'approved' | 'changes_requested',
    comments?: string,
  ) => {
    const artifact = findArtifactWithStatuses(
      artifactId,
      artifactStatusOverrides,
      dynamicArtifactsBySolution,
      solutions,
    );
    if (!artifact || userRole !== 'developer') return;

    const matchingReview = stakeholderReviews.find(
      (r) => r.artifactId === artifactId && r.status === 'awaiting',
    );

    if (matchingReview) {
      if (outcome === 'approved') {
        approveStakeholderReview(matchingReview.id, comments);
      } else {
        requestStakeholderChanges(matchingReview.id, comments);
      }
      return;
    }

    const syntheticReview: StakeholderReview = {
      id: `rev-dev-${artifactId}-${Date.now()}`,
      solutionId: artifact.solutionId,
      artifactId,
      solutionTitle: getSolutionTitle(artifact.solutionId, solutions),
      artifactName: artifact.name,
      status: 'awaiting',
      reviewerRole: 'developer',
    };
    applyArtifactApproval(syntheticReview, outcome, comments, PERSONA_REVIEW_LABELS.developer);
    setStakeholderReviews((prev) => [
      completeReview(
        syntheticReview,
        outcome === 'approved' ? 'approved' : 'changes_requested',
        comments,
      ),
      ...prev,
    ]);
  }, [
    artifactStatusOverrides,
    dynamicArtifactsBySolution,
    solutions,
    userRole,
    stakeholderReviews,
    approveStakeholderReview,
    requestStakeholderChanges,
    applyArtifactApproval,
  ]);

  const handleDeveloperApproveArtifact = useCallback((artifactId: string, comments?: string) => {
    completeDeveloperArtifactReview(artifactId, 'approved', comments);
  }, [completeDeveloperArtifactReview]);

  const handleDeveloperRequestArtifactChanges = useCallback((artifactId: string, comments?: string) => {
    completeDeveloperArtifactReview(artifactId, 'changes_requested', comments);
  }, [completeDeveloperArtifactReview]);

  const handleDeploy = (solutionId: string, instanceUrl: string) => {
    setSolutions((prev) =>
      prev.map((sol) =>
        sol.id === solutionId ? { ...sol, projectStatus: 'deployed' } : sol,
      ),
    );
    pushNotification(`Deployed to ${instanceUrl} — blueprint locked. Team notified.`);
  };

  const handleDeveloperComment = (params: {
    artifactId: string;
    section: string;
    text: string;
    lineRef?: string;
    severity?: DeveloperCommentSeverity;
  }) => {
    const artifact = findArtifactWithStatuses(
      params.artifactId,
      artifactStatusOverrides,
      dynamicArtifactsBySolution,
      solutions,
    );
    const comment: DeveloperComment = {
      id: `dev-c-${Date.now()}`,
      artifactId: params.artifactId,
      solutionId: HR_TICKETING_SOLUTION_ID,
      section: params.section,
      lineRef: params.lineRef,
      severity: params.severity ?? 'major',
      text: params.text,
      author: 'ServiceNow Developer',
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    setDeveloperComments((prev) => [comment, ...prev]);
    const filingRef = artifact?.filingName ?? params.artifactId;
    const anchor = params.lineRef ? `${params.lineRef} · ` : '';
    pushNotification(`Developer flagged conflict on \`${filingRef}\` — architect notified`);
    if (activeSolutionId === HR_TICKETING_SOLUTION_ID) {
      injectSnUpdateToSolution(
        HR_TICKETING_SOLUTION_ID,
        `## Record updated\n\n**Developer review** on \`${filingRef}\`\n\n| Field | Value |\n|-------|-------|\n| **Anchor** | ${anchor}${params.section} |\n| **Severity** | ${(params.severity ?? 'major').toUpperCase()} |\n| **Comment** | ${params.text} |\n\nAdjust in chat and re-export the updated deliverable.`,
      );
    }
  };

  const handleResolveDeveloperComment = (commentId: string) => {
    setDeveloperComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c)),
    );
    pushNotification('Dev conflict marked resolved');
  };

  const handleChoiceSelect = (messageId: string, choice: string) => {
    setSolutions(prev => prev.map(sol => {
      if (sol.id === activeSolutionId) {
        return {
          ...sol,
          chatHistory: sol.chatHistory.map(m => {
            if (m.id === messageId) {
              return { ...m, selectedChoice: choice };
            }
            return m;
          })
        };
      }
      return sol;
    }));

    if (/switch to stakeholder/i.test(choice)) {
      handleRoleChange('stakeholder');
      return;
    }
    if (/send for stakeholder approval|share for approval/i.test(choice)) {
      const targetId = activeSolutionId;
      if (targetId) {
        const artifacts = findSolutionArtifacts(
          targetId,
          artifactStatusOverrides,
          dynamicArtifactsBySolution,
          solutions,
        );
        const reqArtifact =
          artifacts.find((a) => a.type === 'requirements_doc') ??
          artifacts.find((a) => artifactStatusOverrides[a.id] === 'draft' || a.status === 'draft');
        if (reqArtifact) {
          handleShareArtifact(reqArtifact);
          return;
        }
      }
    }
    if (/view executive summary|open executive summary/i.test(choice)) {
      handleSelectArtifact(HR_SUMMARY_ARTIFACT_ID, HR_TICKETING_SOLUTION_ID);
      return;
    }

    handleSendMessage(choice);
  };

  const handleSendMessage = (
    text: string,
    solutionIdOverride?: string,
    solutionSnapshot?: Solution
  ) => {
    const targetSol =
      solutionSnapshot ??
      (solutionIdOverride
        ? solutions.find((s) => s.id === solutionIdOverride)
        : activeSolution);
    if (!text.trim() || !targetSol) return;

    stopGeneration();

    // Create user message
    const newUserMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    const targetSolutionId = targetSol.id;
    const targetSolutionName = targetSol.name;
    const targetChatHistory = targetSol.chatHistory;
    const isFirstUserMessage = !targetChatHistory.some((m) => m.sender === 'user');
    const aiMessageId = `msg-ai-${Date.now()}`;
    const generationStartedAt = Date.now();

    const pendingAiMessage: ChatMessage = {
      id: aiMessageId,
      sender: 'mitra',
      text: '',
      timestamp: new Date(),
    };

    const session: GenerationSession = {
      cancelled: false,
      abortController: new AbortController(),
      timers: new Set(),
      targetSolutionId,
      aiMessageId,
    };
    generationRef.current = session;

    if (isFirstUserMessage && isDynamicSolutionId(targetSolutionId)) {
      const artifactTitle =
        getSolutionTitle(targetSolutionId, solutions) !== 'Solution'
          ? getSolutionTitle(targetSolutionId, solutions)
          : targetSolutionName;
      registerDynamicArtifacts(targetSolutionId, artifactTitle);
    }

    if (isFirstUserMessage && !targetSol.phaseProgress) {
      setSolutions((prev) =>
        prev.map((sol) =>
          sol.id === targetSolutionId
            ? { ...sol, phaseProgress: createInitialPhaseProgress(targetSolutionId) }
            : sol,
        ),
      );
    }

    const scheduleTimer = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        session.timers.delete(id);
        if (session.cancelled) return;
        fn();
      }, ms);
      session.timers.add(id);
    };

    const isCancelled = () => session.cancelled;

    const presentBuildTodos = async (userText: string): Promise<void> => {
      if (!isBuildRequest(userText)) return;
      const { summary, items } = buildTodosForRequest(userText);
      setSolutions((prev) =>
        prev.map((sol) => {
          if (sol.id !== targetSolutionId) return sol;
          return {
            ...sol,
            chatHistory: sol.chatHistory.map((m) =>
              m.id === aiMessageId ? { ...m, todos: items, todoSummary: summary } : m,
            ),
          };
        }),
      );
      await todosPresentationDelay(items.length);
    };

    const advanceBlueprintStatus = (
      status: Solution['blueprint']['status'],
      completedMitraCount: number,
    ): Solution['blueprint']['status'] => {
      if (completedMitraCount >= 5) return 'completed';
      if (status === 'not_started') return 'discovering';
      if (status === 'discovering') return 'designing';
      if (status === 'designing') return 'generating';
      return status;
    };

    const finalizeResponse = (blueprintPatch?: Partial<Solution['blueprint']>, phasePatch?: Partial<PhaseProgress>) => {
      if (isCancelled()) return;
      setSolutions((prev) =>
        prev.map((sol) => {
          if (sol.id !== targetSolutionId) return sol;
          const completedMitraCount = sol.chatHistory.filter(
            (m) => m.sender === 'mitra' && m.text.trim().length > 0,
          ).length;
          const baseProgress = sol.phaseProgress ?? createInitialPhaseProgress(targetSolutionId);
          const chatHistory = sol.chatHistory.map((m) =>
            m.id === aiMessageId
              ? {
                  ...m,
                  text: condenseResponse(m.text),
                  choices: condenseChoices(m.choices),
                  thoughtDurationMs: Date.now() - generationStartedAt,
                }
              : m,
          );
          const aiMessage = chatHistory.find((m) => m.id === aiMessageId);
          const hasResponseContent =
            Boolean(aiMessage?.text.trim()) ||
            (aiMessage?.choices?.length ?? 0) > 0 ||
            (aiMessage?.todos?.length ?? 0) > 0;
          return {
            ...sol,
            isLoading: false,
            generationError: !hasResponseContent,
            chatHistory,
            phaseProgress: phasePatch ? { ...baseProgress, ...phasePatch } : sol.phaseProgress ?? baseProgress,
            blueprint: enrichBlueprintStudio({
              ...sol.blueprint,
              ...blueprintPatch,
              status: advanceBlueprintStatus(sol.blueprint.status, completedMitraCount),
            }),
          };
        }),
      );
      setIsGeneratingMessage(false);
      setGeneratingSolutionId(null);
      generationRef.current = null;
    };

    const pumpLocalText = (
      finalText: string,
      extras?: Pick<ChatMessage, 'choices' | 'isTriage' | 'codeSample' | 'snUpdate'>,
      blueprintPatch?: Partial<Solution['blueprint']>,
      phasePatch?: PhaseProgress,
    ) => {
      const condensedText = condenseResponse(finalText);
      const isSnUpdate = extras?.snUpdate ?? condensedText.includes('## Record updated');
      const condensedExtras = extras
        ? { ...extras, choices: condenseChoices(extras.choices), snUpdate: isSnUpdate }
        : isSnUpdate
          ? { snUpdate: true }
          : undefined;

      if (condensedExtras) {
        setSolutions((prev) =>
          prev.map((sol) => {
            if (sol.id !== targetSolutionId) return sol;
            return {
              ...sol,
              chatHistory: sol.chatHistory.map((m) =>
                m.id === aiMessageId ? { ...m, ...condensedExtras } : m,
              ),
            };
          }),
        );
      }

      let charIndex = 0;
      const charsPerTick = getStreamCharsPerTick(condensedText.length);

      const tick = () => {
        if (isCancelled()) return;
        if (charIndex < condensedText.length) {
          charIndex = Math.min(charIndex + charsPerTick, condensedText.length);
          const snapshot = condensedText.slice(0, charIndex);
          setSolutions((prev) =>
            prev.map((sol) => {
              if (sol.id !== targetSolutionId) return sol;
              return {
                ...sol,
                chatHistory: sol.chatHistory.map((m) =>
                  m.id === aiMessageId ? { ...m, text: snapshot } : m,
                ),
              };
            }),
          );
          scheduleTimer(tick, getStreamTickMs());
          return;
        }
        finalizeResponse(blueprintPatch, phasePatch);
      };

      tick();
    };

    // User message + empty Mitra placeholder appear together immediately
    setSolutions((prev) =>
      prev.map((sol) => {
        if (sol.id !== targetSolutionId) return sol;
        const isFirstUserMessage = !sol.chatHistory.some((m) => m.sender === 'user');
        const seededTitle = getSolutionTitle(sol.id, solutions);
        const updatedName = isFirstUserMessage
          ? seededTitle !== 'Solution'
            ? seededTitle
            : threadTitleFromMessage(text)
          : sol.name;
        return {
          ...sol,
          name: updatedName,
          isLoading: true,
          generationError: false,
          blueprint: {
            ...sol.blueprint,
            title: updatedName,
            status: sol.blueprint.status === 'not_started' ? 'discovering' : sol.blueprint.status,
          },
          chatHistory: [...sol.chatHistory, newUserMessage, pendingAiMessage],
        };
      }),
    );

    setIsGeneratingMessage(true);
    setGeneratingSolutionId(targetSolutionId);
    setActiveTab('projects');
    setSelectedSidebarId(targetSolutionId);

    const solSnapshot = solutionSnapshot ?? targetSol;
    const chatPhaseProgress =
      solSnapshot.phaseProgress ?? createInitialPhaseProgress(targetSolutionId);
    const chatSolutionArtifacts = findSolutionArtifacts(
      targetSolutionId,
      artifactStatusOverrides,
      dynamicArtifactsBySolution,
      solutions,
    );
    const chatPhaseContext = solSnapshot.phaseProgress
      ? {
          currentPhase: solSnapshot.phaseProgress.currentPhase,
          phaseLabel: getPhaseLabel(solSnapshot.phaseProgress.currentPhase),
          questionIndex: solSnapshot.phaseProgress.questionIndex,
          userRole,
          pendingGateCount: getPendingGateArtifacts(
            solSnapshot.phaseProgress.currentPhase,
            targetSolutionId,
            chatSolutionArtifacts,
            artifactStatusOverrides,
            solSnapshot.phaseProgress,
          ).length,
        }
      : undefined;

    const runLocalFallback = async () => {
      await thinkingDelay();
      if (isCancelled()) return;
      await presentBuildTodos(text);
      if (isCancelled()) return;
      const historyWithUser = [...targetChatHistory, newUserMessage];
      const displayName =
        getSolutionTitle(targetSolutionId, solutions) !== 'Solution'
          ? getSolutionTitle(targetSolutionId, solutions)
          : targetSolutionName;
      const phaseProgress = chatPhaseProgress;
      const solutionArtifacts = chatSolutionArtifacts;
      const reqArtifact = solutionArtifacts.find((a) => a.type === 'requirements_doc');
      const requirementsDocument = reqArtifact ? requirementsDocuments[reqArtifact.id] : undefined;
      const localData = getMitraResponse(text, displayName, historyWithUser, {
        solutionId: targetSolutionId,
        phaseProgress,
        artifacts: solutionArtifacts,
        statusOverrides: artifactStatusOverrides,
        userRole,
        developerComments,
        stakeholderReviews,
        requirementsDocument,
      });

      dispatchNotificationEvents(localData.notifications, getNotificationDispatch());

      if (localData.generatedArtifactId) {
        setArtifactStatusOverrides((prev) => ({
          ...prev,
          [localData.generatedArtifactId!]: 'draft',
        }));
        if (isDynamicSolutionId(targetSolutionId)) {
          setDynamicArtifactsBySolution((prev) => {
            const list = prev[targetSolutionId] ?? solutionArtifacts;
            return {
              ...prev,
              [targetSolutionId]: list.map((a) =>
                a.id === localData.generatedArtifactId
                  ? { ...a, status: 'draft' as ArtifactStatus, updatedAt: new Date().toISOString() }
                  : a,
              ),
            };
          });
        }
      }

      if (localData.artifactStatusUpdate) {
        setArtifactStatusOverrides((prev) => ({
          ...prev,
          [localData.artifactStatusUpdate!.artifactId]: localData.artifactStatusUpdate!.status,
        }));
      }

      if (localData.requirementsDocumentUpdate) {
        setRequirementsDocuments((prev) => ({
          ...prev,
          [localData.requirementsDocumentUpdate!.artifactId]: localData.requirementsDocumentUpdate!,
        }));
      }

      if (isSendForApprovalAction(text) && !localData.artifactStatusUpdate) {
        sendPlanToStakeholder(extractHrsdProcessFromChat(historyWithUser));
      }

      const clientCode = localData.blueprint?.clientScripts?.[0]?.script;
      const serverCode = localData.blueprint?.businessRules?.[0]?.script;
      pumpLocalText(
        localData.text,
        {
          choices: localData.choices,
          isTriage: localData.isTriage,
          codeSample: clientCode || serverCode,
          snUpdate: localData.text.includes('## Record updated'),
        },
        localData.blueprint,
        localData.phaseProgress,
      );
    };

    const runGeneration = async () => {
      const useLocalOnly = isDemoMode();

      if (useLocalOnly) {
        await runLocalFallback();
        return;
      }

      let chunkBuffer = '';
      let flushTimer: ReturnType<typeof setTimeout> | null = null;

      const flushChunks = () => {
        flushTimer = null;
        if (isCancelled() || !chunkBuffer) return;
        const pending = chunkBuffer;
        chunkBuffer = '';
        setSolutions((prev) =>
          prev.map((sol) => {
            if (sol.id !== targetSolutionId) return sol;
            return {
              ...sol,
              chatHistory: sol.chatHistory.map((m) =>
                m.id === aiMessageId ? { ...m, text: m.text + pending } : m,
              ),
            };
          }),
        );
      };

      const queueChunk = (chunk: string) => {
        if (isCancelled()) return;
        chunkBuffer += chunk;
        if (flushTimer) return;
        const timerId = setTimeout(() => {
          session.timers.delete(timerId);
          flushTimer = null;
          flushChunks();
        }, getStreamFlushMs());
        flushTimer = timerId;
        session.timers.add(timerId);
      };

      try {
        await thinkingDelay();
        if (isCancelled()) return;
        await presentBuildTodos(text);
        if (isCancelled()) return;

        await streamServiceNowChat({
          prompt: text,
          chatHistory: [...targetChatHistory, newUserMessage],
          currentSolutionName: targetSolutionName,
          model: DEFAULT_MODEL,
          apiKey: localStorage.getItem('GEMINI_API_KEY') || undefined,
          signal: session.abortController.signal,
          phaseContext: chatPhaseContext,
          onChunk: queueChunk,
          onDone: () => {
            if (isCancelled()) return;
            if (flushTimer) {
              clearTimeout(flushTimer);
              session.timers.delete(flushTimer);
              flushTimer = null;
            }
            flushChunks();
            finalizeResponse();
          },
          onError: (err) => {
            if (isCancelled() || err.name === 'AbortError') return;
            console.warn('Live stream failed, using local fallback:', err.message);
            setSolutions((prev) =>
              prev.map((sol) => {
                if (sol.id !== targetSolutionId) return sol;
                return {
                  ...sol,
                  chatHistory: sol.chatHistory.map((m) =>
                    m.id === aiMessageId ? { ...m, text: '' } : m,
                  ),
                };
              }),
            );
            void runLocalFallback();
          },
        });
      } catch (err: unknown) {
        if (isCancelled() || (err instanceof Error && err.name === 'AbortError')) return;
        console.warn('Chat stream request failed:', err);
        setSolutions((prev) =>
          prev.map((sol) => {
            if (sol.id !== targetSolutionId) return sol;
            return {
              ...sol,
              chatHistory: sol.chatHistory.map((m) =>
                m.id === aiMessageId ? { ...m, text: '' } : m,
              ),
            };
          }),
        );
        await runLocalFallback();
      }
    };

    void runGeneration();
  };

  const createFolderAtTop = (): string => {
    const folderId = `folder-untitled-${Date.now()}`;
    setFolders((prev) => {
      const name = nextUntitledFolderName(prev);
      return [{ id: folderId, name }, ...prev];
    });
    return folderId;
  };

  // Create a brand new workspace
  const handleCreateSolution = (data: {
    name: string;
    category: 'ITSM' | 'HR' | 'CSM' | 'Custom';
    extendsTable: string;
    description: string;
  }) => {
    const newId = `sol-custom-${Math.random().toString(36).substr(2, 9)}`;
    const newFolderId = createFolderAtTop();

    const initialAiMessage: ChatMessage = {
      id: `initial-ai-${Date.now()}`,
      sender: 'mitra',
      text: `Hello! I have created your new solution space: **${data.name}** specializing in the **${data.category}** framework.\n\nSince this solution extends the standard **${data.extendsTable}** dictionary table, it automatically inherits OOTB states and SLA counters.\n\nDescribe your target attributes, form fields, or automated routes and I'll draft the architecture!`,
      timestamp: new Date()
    };

    const newSolution: Solution = {
      id: newId,
      name: data.name,
      description: data.description,
      createdAt: 'Just now',
      active: true,
      folderId: newFolderId,
      blueprint: enrichBlueprintStudio({
        id: `bp-${newId}`,
        title: data.name,
        description: data.description,
        status: 'not_started',
        discoveredRequirements: [],
        architectureSteps: [
          `Extend standard base definition: ${data.extendsTable}`,
          'Configure form and list views',
        ],
        tables: [
          {
            name: `u_${data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            label: data.name,
            extendsTable: data.extendsTable !== 'none' ? data.extendsTable : undefined,
            fields: [
              { name: 'u_status', type: 'Choice', label: 'Processing Status' },
            ],
          },
        ],
      }),
      chatHistory: [initialAiMessage]
    };

    setSolutions(prev => [
      newSolution,
      ...prev.map(sol => ({ ...sol, active: false }))
    ]);
    setFocusedFolderId('');
    setActiveSolutionId(newId);
    setSelectedSidebarId(newId);
    setActiveTab('projects');
  };

  // Instantiate from template catalog
  const handleUseTemplate = (template: ServiceTemplate) => {
    const customId = `sol-tpl-${template.id}-${Date.now()}`;
    const newFolderId = createFolderAtTop();

    // Map template table mockups recursively
    const tableName = `u_${template.id.replace(/-/g, '_')}_record`;
    const initialAiMessage: ChatMessage = {
      id: `msg-tpl-ai-${Date.now()}`,
      sender: 'mitra',
      text: `## Template loaded — ${template.title}

**Category** — ${template.category}
**Tables in pack** — ${template.tablesCount}
**Starter table** — \`${tableName}\` extending \`task\`

Pick a step below and I'll continue building — data model, scripts, and update-set packaging.`,
      timestamp: new Date(),
      isTriage: true,
      choices: ['Extend the data model', 'Add client script', 'Configure form layout'],
    };

    const newSolution: Solution = {
      id: customId,
      name: template.title,
      description: template.description,
      createdAt: 'Just now',
      active: true,
      folderId: newFolderId,
      blueprint: enrichBlueprintStudio({
        id: `bp-tpl-${template.id}`,
        title: template.title,
        description: template.description,
        status: 'not_started',
        discoveredRequirements: [
          `Configure program workflow for: ${template.title}`,
        ],
        architectureSteps: [
          'Define core program tables',
          'Configure routing rules',
        ],
        tables: [
          {
            name: `u_${template.id.replace(/-/g, '_')}_record`,
            label: template.title,
            extendsTable: 'task',
            fields: [
              { name: 'u_priority_tag', type: 'Choice', label: 'Priority Assignment' },
              { name: 'u_operator', type: 'Reference', label: 'Registered Agent', reference: 'sys_user' },
            ],
          },
        ],
        clientScripts: [{
          name: 'Form initialization',
          table: `u_${template.id.replace(/-/g, '_')}_record`,
          type: 'onLoad',
          description: 'Sets default values on new records',
          script: 'function onLoad() {\n  g_form.addInfoMessage("Template record ready.");\n}',
        }],
      }),
      chatHistory: [initialAiMessage]
    };

    setSolutions(prev => [
      newSolution,
      ...prev.map(sol => ({ ...sol, active: false }))
    ]);
    setFocusedFolderId('');
    setActiveSolutionId(customId);
    setSelectedSidebarId(customId);
    setActiveTab('projects');
  };

  const handleCreateFolder = (): string => {
    const folderId = createFolderAtTop();
    setFocusedFolderId(folderId);
    setActiveSolutionId('');
    setSelectedSidebarId('');
    setSolutions((prev) => prev.map((sol) => ({ ...sol, active: false })));
    setActiveTab('projects');
    return folderId;
  };

  const handleRenameFolder = (folderId: string, name: string) => {
    const trimmed = name.trim() || UNTITLED_FOLDER_NAME;
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f))
    );
    setRenamingFolderId(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folderThreads = solutions.filter((s) => s.folderId === folderId);
    const message =
      folderThreads.length > 0
        ? `Delete "${folders.find((f) => f.id === folderId)?.name ?? 'folder'}" and ${folderThreads.length} thread(s)?`
        : `Delete folder "${folders.find((f) => f.id === folderId)?.name ?? 'folder'}"?`;
    setConfirmDialog({
      title: 'Delete folder?',
      message,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        setSolutions((prev) => prev.filter((s) => s.folderId !== folderId));
        if (focusedFolderId === folderId) setFocusedFolderId('');
        if (folderThreads.some((s) => s.id === activeSolutionId)) {
          setActiveSolutionId('');
          setSelectedSidebarId('');
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleRenameSolution = (solutionId: string, name: string) => {
    const trimmed = name.trim() || UNTITLED_THREAD_NAME;
    setSolutions((prev) =>
      prev.map((s) =>
        s.id === solutionId
          ? { ...s, name: trimmed, blueprint: { ...s.blueprint, title: trimmed } }
          : s,
      ),
    );
  };

  const handleMoveSolution = useCallback((solutionId: string, folderId: string | undefined) => {
    setSolutions((prev) =>
      prev.map((s) =>
        s.id === solutionId ? { ...s, folderId: folderId || undefined } : s
      )
    );
  }, []);

  const handleDeleteSolution = (solutionId: string) => {
    const target = solutions.find((s) => s.id === solutionId);
    if (!target) return;
    setConfirmDialog({
      title: 'Delete thread?',
      message: `Delete "${target.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        const remaining = solutions.filter((s) => s.id !== solutionId);
        setSolutions(remaining);

        if (activeSolutionId === solutionId) {
          const sibling = remaining.find((s) => s.folderId === target.folderId);
          if (sibling) {
            handleSelectSolution(sibling.id);
          } else {
            setActiveSolutionId('');
            setSelectedSidebarId('');
            setFocusedFolderId(target.folderId);
          }
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleNewChat = (folderId?: string, initialMessage?: string): string => {
    const targetFolderId = folderId ?? createFolderAtTop();
    const guidedId = `sol-guided-${Date.now()}`;
    const threadName = initialMessage
      ? threadTitleFromMessage(initialMessage)
      : UNTITLED_THREAD_NAME;

    const newSolution: Solution = {
      id: guidedId,
      name: threadName,
      description: 'New solution',
      createdAt: 'Just now',
      active: true,
      folderId: targetFolderId,
      blueprint: enrichBlueprintStudio({
        id: `bp-${guidedId}`,
        title: threadName,
        description: 'Scoped ServiceNow application',
        status: initialMessage ? 'discovering' : 'not_started',
        discoveredRequirements: [],
        architectureSteps: ['Create scoped application'],
        tables: [],
      }),
      chatHistory: [],
      phaseProgress: createInitialPhaseProgress(guidedId),
    };

    setSolutions((prev) => [
      newSolution,
      ...prev.map((sol) => ({ ...sol, active: false })),
    ]);
    setFocusedFolderId('');
    setActiveSolutionId(guidedId);
    setSelectedSidebarId(guidedId);
    setSelectedArtifactId(null);
    setActiveTab('projects');

    if (initialMessage?.trim()) {
      queueMicrotask(() =>
        handleSendMessage(initialMessage, guidedId, newSolution),
      );
    }

    return guidedId;
  };

  /** Cold-start entry: empty solution, no prior chat, entry-mode chips in ChatView. */
  const handleNewSolution = () => {
    handleNewChat(undefined);
  };

  // Focus input from home view prompt cards
  const handleHomeAction = (actionType: 'describe' | 'template' | 'import' | 'analyze') => {
    if (actionType === 'template') {
      setActiveTab('templates');
      return;
    }
    handleNewSolution();
  };

  // Notification methods
  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (
    (showLanding || !welcomeComplete || isLandingPath(window.location.pathname)) &&
    !guestReviewId
  ) {
    return (
      <LandingPage
        version={appVersion}
        setVersion={setAppVersion}
        onGetStarted={() => enterWorkspace('guest')}
        onSignIn={() => enterWorkspace('signed-in')}
      />
    );
  }

  if (guestReviewId) {
    const guestReview = resolveGuestReview(guestReviewId, stakeholderReviews);
    if (guestReview) {
      const guestRole = inferReviewReviewerRole(
        guestReview,
        findArtifactWithStatuses(guestReview.artifactId, artifactStatusOverrides, dynamicArtifactsBySolution, solutions),
      );
      const otherPending = stakeholderReviews.filter(
        (r) =>
          r.status === 'awaiting' &&
          r.id !== guestReview.id &&
          inferReviewReviewerRole(r) === guestRole,
      );
      const guestApprove = (
        reviewId: string,
        comments?: string,
        sectionComments?: StakeholderSectionComment[],
      ) => {
        if (guestRole === 'security') approveSecurityReview(reviewId, comments);
        else if (guestRole === 'sponsor') approveSponsorReview(reviewId);
        else approveStakeholderReview(reviewId, comments, sectionComments);
      };
      const guestReject = (
        reviewId: string,
        comments?: string,
        sectionComments?: StakeholderSectionComment[],
      ) => {
        if (guestRole === 'security') rejectSecurityReview(reviewId, comments ?? 'ACL revision required.');
        else if (guestRole === 'sponsor') requestSponsorChanges(reviewId, comments);
        else requestStakeholderChanges(reviewId, comments, sectionComments);
      };
      return (
        <div className={`${resolvedTheme} min-h-screen bg-background text-foreground`}>
          <GuestStakeholderView
            review={guestReview}
            otherPendingReviews={otherPending}
            onApprove={guestApprove}
            onRequestChanges={guestReject}
          />
        </div>
      );
    }
    return (
      <div className={`${resolvedTheme} flex min-h-screen items-center justify-center bg-background p-8 text-center text-foreground`}>
        <div className="max-w-md space-y-3">
          <h1 className="text-lg font-semibold">Review link unavailable</h1>
          <p className="text-sm text-muted-foreground">
            This guest link is invalid or expired. Ask your architect to reshare the artifact.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <SidebarProvider
      style={{ '--sidebar-width': `${effectiveLeftSidebarWidth}px` } as React.CSSProperties}
    >
    <div className={`h-screen w-full flex relative ${
      `${resolvedTheme} bg-background text-foreground`
    } ${highContrast ? 'high-contrast' : ''} ${fontSizeLevel > 0 ? `font-size-level-${fontSizeLevel}` : ''} font-sans overflow-hidden`}>
      <div
        className={`relative shrink-0 ${isLeftSidebarResizing ? 'select-none' : ''}`}
        style={{ width: effectiveLeftSidebarWidth }}
      >
        <Sidebar
          version={appVersion}
          setVersion={setAppVersion}
          theme={resolvedTheme}
          setTheme={setThemePreference}
          onToggleFavorite={handleToggleFavorite}
          onTogglePin={handleTogglePin}
          onOpenSearch={() => setIsSearchOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          devModeEnabled={devModeEnabled}
          onToggleDevMode={handleToggleDevMode}
          onOpenNewSolutionModal={handleNewSolution}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenTour={handleOpenTour}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          onSelectStakeholderReview={handleSelectStakeholderReview}
          onSelectSecurityReview={handleSelectSecurityReview}
          onSelectSponsorReview={handleSelectSponsorReview}
          selectedReviewId={selectedReviewId}
          onContactArchitect={handleContactArchitect}
          stakeholderReviews={stakeholderReviews}
          solutions={visibleSolutions}
          folders={folders}
          selectedSidebarId={selectedSidebarId}
          focusedFolderId={focusedFolderId}
          renamingFolderId={renamingFolderId}
          onSelectSolution={handleSelectSolution}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameSolution={handleRenameSolution}
          onDeleteSolution={handleDeleteSolution}
          onMoveSolution={handleMoveSolution}
          onNewChat={handleNewChat}
          onRenamingComplete={() => setRenamingFolderId(null)}
          statusOverrides={artifactStatusOverrides}
          developerComments={developerComments}
          businessOwnerSubmissions={businessOwnerSubmissions}
          selectedBusinessOwnerSubmissionId={selectedBusinessOwnerSubmissionId}
          onSelectBusinessOwnerSubmission={(id) => {
            setSelectedBusinessOwnerSubmissionId(id);
            setActiveTab('business-owner');
          }}
          onBusinessOwnerNewUpload={() => {
            setSelectedBusinessOwnerSubmissionId(null);
            setActiveTab('business-owner');
          }}
          collapsed={leftSidebarCollapsed}
          onToggleCollapse={handleToggleLeftSidebarCollapse}
          generatingSolutionId={generatingSolutionId}
        />
        {!leftSidebarCollapsed && (
          <PanelResizeHandle
            edge="right"
            isResizing={isLeftSidebarResizing}
            onResizeStart={handleLeftSidebarResizeStart}
            ariaLabel="Resize navigation sidebar"
            valueNow={leftSidebarWidth}
            valueMin={LEFT_SIDEBAR_MIN_WIDTH}
            valueMax={LEFT_SIDEBAR_MAX_WIDTH}
          />
        )}
      </div>

      <SidebarInset className="overflow-hidden">
        {isDarkTheme(resolvedTheme) && <VrBackground />}

        <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
          {activeTab === 'search' && (
            <SearchView
              theme={resolvedTheme}
              solutions={visibleSolutions}
              folders={folders}
              onSelectSolution={(solId) => {
                handleSelectSolution(solId);
                setActiveTab('projects');
              }}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              theme={themePreference}
              setTheme={setThemePreference}
              userRole={userRole}
              autoApprove={autoApprove}
              onAutoApproveChange={handleAutoApproveChange}
              highContrast={highContrast}
              onHighContrastChange={setHighContrast}
              fontSizeLevel={fontSizeLevel}
              onFontSizeLevelChange={setFontSizeLevel}
              ambientMusic={ambientMusicEnabled}
              onAmbientMusicChange={setAmbientMusicEnabled}
              onClose={handleCloseSettings}
            />
          )}

          {activeTab === 'dashboard' && (
            <HomeView
              appVersion={appVersion}
              theme={resolvedTheme}
              onSelectAction={handleHomeAction}
              onSendMessage={(text) => {
                if (!text.trim()) return;
                handleNewChat(undefined, text);
              }}
              isServerConnected={isServerConnected}
              onCreateConnection={handleOpenCreateConnection}
            />
          )}

          {activeTab === 'artifact' && selectedArtifactId && (() => {
            const artifact = findArtifactWithStatuses(
              selectedArtifactId,
              artifactStatusOverrides,
              dynamicArtifactsBySolution,
              solutions,
            );
            return artifact ? (
              <ArtifactView
                artifact={artifact}
                requirementsDocument={requirementsDocuments[artifact.id]}
                onUpdateRequirementsSection={(sectionId, body) =>
                  handleUpdateRequirementsSection(artifact.id, sectionId, body)
                }
                onShare={handleShareArtifact}
                theme={resolvedTheme}
              />
            ) : null;
          })()}

          {activeTab === 'business-owner' && (
            <div key={selectedBusinessOwnerSubmissionId ?? 'new'} className="contents">
              <BusinessOwnerView
              theme={resolvedTheme}
              submission={
                selectedBusinessOwnerSubmissionId
                  ? businessOwnerSubmissions.find((s) => s.id === selectedBusinessOwnerSubmissionId) ?? null
                  : null
              }
              onSubmissionChange={(submission) => {
                setBusinessOwnerSubmissions((prev) => {
                  const idx = prev.findIndex((s) => s.id === submission.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = submission;
                    return next;
                  }
                  return [...prev, submission];
                });
                setSelectedBusinessOwnerSubmissionId(submission.id);
                if (submission.status === 'submitted') {
                  persistWorkflowHandoff(HR_TICKETING_SOLUTION_ID);
                }
              }}
              onNewSubmission={() => {
                setSelectedBusinessOwnerSubmissionId(null);
              }}
            />
            </div>
          )}

          {activeTab === 'stakeholder-review' && (() => {
            const roleReviews = filterReviewsForRole(stakeholderReviews, 'stakeholder');
            const review = roleReviews.find((r) => r.id === selectedReviewId)
              ?? roleReviews.find((r) => r.status === 'awaiting')
              ?? roleReviews[0];
            return review ? (
              <StakeholderReviewView
                review={review}
                requirementsDocument={requirementsDocuments[review.artifactId]}
                onApprove={approveStakeholderReview}
                onRequestChanges={requestStakeholderChanges}
              />
            ) : null;
          })()}

          {activeTab === 'security-review' && (() => {
            const roleReviews = filterReviewsForRole(stakeholderReviews, 'security');
            const review = roleReviews.find((r) => r.id === selectedReviewId)
              ?? roleReviews.find((r) => r.status === 'awaiting')
              ?? roleReviews[0];
            return review ? (
              <SecurityReviewView
                review={review}
                onApprove={approveSecurityReview}
                onRequestChanges={rejectSecurityReview}
              />
            ) : null;
          })()}

          {activeTab === 'sponsor-review' && (() => {
            const roleReviews = filterReviewsForRole(stakeholderReviews, 'sponsor');
            const review = roleReviews.find((r) => r.id === selectedReviewId)
              ?? roleReviews.find((r) => r.status === 'awaiting')
              ?? roleReviews[0];
            return review ? (
              <SponsorReviewView
                review={review}
                onApprove={approveSponsorReview}
                onRequestChanges={requestSponsorChanges}
              />
            ) : null;
          })()}

          {activeTab === 'projects' && (
            <div className="flex min-h-0 min-w-0 w-full flex-1 overflow-hidden">
              {!activeSolution ? (
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
                  <div className="mx-auto w-full max-w-5xl">
                    <ProjectNavigationPanel
                      theme={resolvedTheme}
                      userRole={userRole}
                      folders={folders}
                      solutions={visibleSolutions}
                      activeSolutionId={activeSolutionId}
                      statusOverrides={artifactStatusOverrides}
                      dynamicArtifactsBySolution={dynamicArtifactsBySolution}
                      projectCollaborators={projectCollaborators}
                      onSelectSolution={handleSelectSolution}
                      onSelectArtifact={handleArtifactPanelSelect}
                      onShareProject={handleShareProject}
                      variant="browser"
                    />
                  </div>
                </div>
              ) : (
                <>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <ChatView
                  appVersion={appVersion}
                  theme={resolvedTheme}
                  activeSolution={activeSolution}
                  onSendMessage={(text) => {
                    if (!text.trim()) return;
                    if (!activeSolution) {
                      handleNewChat(focusedFolderId || undefined, text);
                    } else {
                      handleSendMessage(text);
                    }
                  }}
                  isGeneratingMessage={isGeneratingMessage}
                  onStopGeneration={stopGeneration}
                  onChoiceSelect={handleChoiceSelect}
                  onNavigate={setActiveTab}
                  onCreateConnection={handleOpenCreateConnection}
                  onShareProject={() => handleShareProject(activeSolutionId)}
                  projectCollaboratorCount={getCollaboratorsForSolution(projectCollaborators, activeSolutionId).length}
                  isServerConnected={isServerConnected}
                />
              </div>
              <ArtifactCardsPanel
                solutionId={activeSolutionId || null}
                statusOverrides={artifactStatusOverrides}
                dynamicArtifactsBySolution={dynamicArtifactsBySolution}
                solutions={visibleSolutions}
                selectedArtifactId={selectedArtifactId}
                isGenerating={isGeneratingMessage}
                mitraTurnCount={mitraTurnCount}
                conversationStarted={conversationStarted}
                blueprintStage={activeSolution?.blueprint.buildStage}
                phaseProgress={activeSolution?.phaseProgress}
                developerComments={developerComments}
                theme={resolvedTheme}
                width={artifactPanelWidth}
                collapsed={artifactPanelCollapsed}
                isResizing={isArtifactPanelResizing}
                onResizeStart={handleArtifactPanelResizeStart}
                onToggleCollapse={handleToggleArtifactPanelCollapse}
                onSelectArtifact={handleArtifactPanelSelect}
                onShareArtifact={handleShareArtifact}
                stakeholderReviews={stakeholderReviews}
                businessOwnerSubmissions={businessOwnerSubmissions}
                adminChecklist={adminChecklist}
              />
                </>
              )}
            </div>
          )}

          {activeTab === 'admin-panel' && (
            <AdminPanelView
              theme={resolvedTheme}
              solutions={visibleSolutions}
              checklist={adminChecklist}
              selectedSolutionId={adminSelectedSolutionId}
              connectedInstances={CONNECTED_INSTANCES}
              onSelectSolution={setAdminSelectedSolutionId}
              onMarkChecklistComplete={handleMarkChecklistComplete}
              onDeploy={handleDeploy}
            />
          )}

          {activeTab === 'developer' && (
            <DeveloperWorkspaceView
              solutionId={HR_TICKETING_SOLUTION_ID}
              artifactIds={DEVELOPER_SHARED_ARTIFACT_IDS}
              statusOverrides={artifactStatusOverrides}
              comments={developerComments}
              onAddComment={handleDeveloperComment}
              onResolveComment={handleResolveDeveloperComment}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              theme={resolvedTheme}
              onUseTemplate={handleUseTemplate}
            />
          )}

          {activeTab === 'connections' && (
            <ConnectionsView 
              theme={resolvedTheme}
              createConnectionNonce={createConnectionNonce}
            />
          )}

          {activeTab === 'styleguide' && (
            <StyleguideView theme={resolvedTheme} activeSolution={activeSolution} onBack={handleLeaveStyleguide} />
          )}

          {activeTab === 'dev-specs' && (
            <div className="flex flex-1 min-h-0 overflow-hidden">
              <DeveloperSpecsPanel
                isOpen
                onClose={handleLeaveDevSpecs}
                activeSolution={activeSolution}
                theme={resolvedTheme}
              />
            </div>
          )}

          {activeTab === 'favourites' && (() => {
            const favoriteSolutions = visibleSolutions.filter((s) => s.isFavorite);
            return favoriteSolutions.length > 0 ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-6 py-8 md:px-8 bg-transparent">
                <div className="mx-auto w-full max-w-6xl">
                  <h1 className={cn(
                    "text-2xl font-display font-semibold tracking-tight mb-6",
                    isDarkTheme(resolvedTheme) ? "text-white" : "text-slate-900"
                  )}>
                    Favorites
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {favoriteSolutions.map((sol) => (
                      <div
                        key={sol.id}
                        onClick={() => {
                          handleSelectSolution(sol.id);
                          setActiveTab('projects');
                        }}
                        className={cn(
                          "group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer",
                          isDarkTheme(resolvedTheme)
                            ? "bg-card hover:bg-neutral-900/60 border-border text-foreground hover:border-brand-green/30"
                            : "bg-white hover:bg-slate-50/50 border-slate-200 text-slate-800 hover:border-emerald-500/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                        )}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className={cn(
                              "text-sm font-semibold truncate flex-1",
                              isDarkTheme(resolvedTheme) ? "text-white" : "text-slate-900"
                            )}>
                              {sol.name}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                title="Open chat"
                                className={cn(
                                  "p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSolution(sol.id);
                                  setActiveTab('projects');
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Unfavorite"
                                className="p-1 rounded hover:bg-muted/40 transition-colors text-emerald-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(sol.id);
                                }}
                              >
                                <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 animate-pulse-fast" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[12px] text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                            {sol.description}
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-4 font-medium">
                          {sol.timeLabel || sol.createdAt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${
                  isDarkTheme(resolvedTheme) ? 'bg-neutral-900 border-neutral-800 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-500'
                }`}>
                  <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
                </div>
                <h2 className={`text-xl font-display font-bold mb-2 ${isDarkTheme(resolvedTheme) ? 'text-white' : 'text-slate-900'}`}>
                  No Favourites Added Yet
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Bookmark or star your most frequently used blueprints, configurations, or custom incident templates to access them quickly here.
                </p>
              </div>
            );
          })()}
        </div>
      </SidebarInset>

      {/* modal block */}
      <SearchDialog
        theme={resolvedTheme}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        solutions={visibleSolutions}
        folders={folders}
        onSelectSolution={handleSelectSolution}
        onNewChat={handleNewChat}
        onNavigate={setActiveTab}
        onToggleFavorite={handleToggleFavorite}
      />

      <NewSolutionModal 
        theme={resolvedTheme}
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreateSolution={handleCreateSolution}
      />

      <ShareArtifactModal
        theme={resolvedTheme}
        isOpen={!!shareArtifactTarget}
        artifact={shareArtifactTarget}
        solutionTitle={shareArtifactTarget ? getSolutionTitle(shareArtifactTarget.solutionId, solutions) : ''}
        onClose={() => {
          setShareArtifactTarget(null);
          setLastShareReviewId(null);
        }}
        onShare={executeShareArtifact}
        onPreviewGuest={handlePreviewGuest}
        pendingReviewId={lastShareReviewId}
        defaultAutoApprove={autoApprove}
      />

      <ShareProjectModal
        theme={resolvedTheme}
        isOpen={!!shareProjectTargetId}
        solution={
          shareProjectTargetId
            ? visibleSolutions.find((s) => s.id === shareProjectTargetId) ?? null
            : null
        }
        collaborators={
          shareProjectTargetId
            ? getCollaboratorsForSolution(projectCollaborators, shareProjectTargetId)
            : []
        }
        onClose={() => setShareProjectTargetId(null)}
        onAddMember={handleInviteProjectCollaborator}
        onRemove={handleRemoveProjectCollaborator}
      />

      <ApiKeyModal
        theme={resolvedTheme}
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={(key) => {
          localStorage.setItem('GEMINI_API_KEY', key.trim());
        }}
        onRemove={() => {
          localStorage.removeItem('GEMINI_API_KEY');
        }}
      />
      <OnboardingTour
        theme={resolvedTheme}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onPrepareStep={handleTourPrepareStep}
      />

      <SimulationAlertModal
        theme={resolvedTheme}
        isOpen={simulationAlertOpen}
        onDismiss={dismissSimulationAlert}
      />

      <AlertDialog
        theme={resolvedTheme}
        isOpen={confirmDialog !== null}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant}
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />

      <CenterToast
        theme={resolvedTheme}
        toast={centerToast}
        onDismiss={dismissCenterToast}
      />

      <DesignFeedbackWidget
        theme={resolvedTheme}
        setTheme={setThemePreference}
        activeTab={activeTab}
        userRole={userRole}
        onSubmitted={showCenterToast}
        onOpenDevSpecs={() => setActiveTab('dev-specs')}
      />




      <audio
        ref={ambientAudioRef}
        src={ambientMusic}
        loop
        preload="auto"
        className="hidden"
        aria-hidden
      />

    </div>
    </SidebarProvider>
    </TooltipProvider>
  );
}
