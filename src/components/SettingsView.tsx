import { Fragment, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  X,
  Settings,
  Compass,
  FileText,
  Bell,
  ClipboardCheck,
  Code,
  Terminal,
  GitMerge,
  Server,
  Users,
  Plug,
  Shield,
  Lock,
  ScrollText,
  CheckCircle,
  BarChart3,
  Cloud,
  ShieldCheck,
  Minus,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { Theme, UserRole } from '../types';
import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { SelectNative } from '@/src/components/ui/select-native';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import {
  readApprovalReminderFrequency,
  persistApprovalReminderFrequency,
  readAuditLogRetention,
  persistAuditLogRetention,
  readAutoScrollToConflicts,
  persistAutoScrollToConflicts,
  readBudgetThreshold,
  persistBudgetThreshold,
  readConflictNotifications,
  persistConflictNotifications,
  readDataClassificationDefault,
  persistDataClassificationDefault,
  readDefaultSolutionScope,
  persistDefaultSolutionScope,
  readDevExportFormat,
  persistDevExportFormat,
  readEmailNotifications,
  persistEmailNotifications,
  readEnvironment,
  persistEnvironment,
  readExecutiveSummaryFormat,
  persistExecutiveSummaryFormat,
  readExportFormatDefault,
  persistExportFormatDefault,
  readGuestLinkExpiry,
  persistGuestLinkExpiry,
  readInstanceUrl,
  persistInstanceUrl,
  readNotifyOnArtifactReady,
  persistNotifyOnArtifactReady,
  readNotifyOnReviewComplete,
  persistNotifyOnReviewComplete,
  readOrgWideNotifications,
  persistOrgWideNotifications,
  readPlainLanguageDefault,
  persistPlainLanguageDefault,
  readRoleMatrixSync,
  persistRoleMatrixSync,
  readScopedAppPrefix,
  persistScopedAppPrefix,
  readSecurityReviewRequired,
  persistSecurityReviewRequired,
  readShareApprovalDefault,
  persistShareApprovalDefault,
  readChatCompletionSound,
  persistChatCompletionSound,
  readXmlSyntaxTheme,
  persistXmlSyntaxTheme,
  FONT_SIZE_PX,
} from '../utils/settingsStorage';

export type SettingsCategoryId =
  | 'general'
  | 'discovery'
  | 'artifacts'
  | 'reviews'
  | 'submissions'
  | 'workspace'
  | 'configuration'
  | 'users-roles'
  | 'notifications'
  | 'integrations'
  | 'compliance'
  | 'gates'
  | 'approvals'
  | 'servicenow-instance'
  | 'servicenow-dev-instance'
  | 'conflicts'
  | 'security'
  | 'audit'
  | 'reporting';

interface CategoryDef {
  id: SettingsCategoryId;
  label: string;
  icon: LucideIcon;
}

export const PERSONA_SETTINGS_CATEGORIES: Record<UserRole, CategoryDef[]> = {
  architect: [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'servicenow-instance', label: 'ServiceNow Instance', icon: Cloud },
    { id: 'discovery', label: 'Discovery', icon: Compass },
    { id: 'artifacts', label: 'Artifacts', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ],
  business_owner: [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ],
  stakeholder: [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'reviews', label: 'Reviews', icon: ClipboardCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ],
  developer: [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'workspace', label: 'Workspace', icon: Code },
    { id: 'servicenow-dev-instance', label: 'ServiceNow Dev Instance', icon: Terminal },
    { id: 'conflicts', label: 'Conflicts', icon: GitMerge },
  ],
  admin: [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'configuration', label: 'Configuration', icon: Server },
    { id: 'users-roles', label: 'Users & Roles', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ],
  security: [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'gates', label: 'Access Gates', icon: Lock },
    { id: 'audit', label: 'Audit', icon: ScrollText },
  ],
  sponsor: [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'reporting', label: 'Reporting', icon: BarChart3 },
  ],
};

interface SettingRowProps {
  id: string;
  label: string;
  description: string;
  children: ReactNode;
}

function SettingRow({ id, label, description, children }: SettingRowProps) {
  return (
    <div
      id={id}
      className="settings-row flex items-center justify-between gap-6 py-4"
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <label htmlFor={`${id}-control`} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div id={`${id}-control`} className="settings-row-control flex w-44 shrink-0 items-center justify-end sm:w-48">
        {children}
      </div>
    </div>
  );
}

function TextSizeStepper({
  level,
  onChange,
}: {
  level: number;
  onChange: (level: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-input bg-background px-1 py-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Decrease text size"
        disabled={level <= 0}
        onClick={() => onChange(Math.max(0, level - 1))}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-7 text-center text-xs font-mono tabular-nums text-foreground">
        {FONT_SIZE_PX[level]}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Increase text size"
        disabled={level >= 5}
        onClick={() => onChange(Math.min(5, level + 1))}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

interface SettingsViewProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userRole: UserRole;
  autoApprove: boolean;
  onAutoApproveChange: (value: boolean) => void;
  highContrast: boolean;
  onHighContrastChange: (value: boolean) => void;
  fontSizeLevel: number;
  onFontSizeLevelChange: (level: number) => void;
  ambientMusic: boolean;
  onAmbientMusicChange: (value: boolean) => void;
  onClose: () => void;
}

export function SettingsView({
  theme,
  setTheme,
  userRole,
  autoApprove,
  onAutoApproveChange,
  highContrast,
  onHighContrastChange,
  fontSizeLevel,
  onFontSizeLevelChange,
  ambientMusic,
  onAmbientMusicChange,
  onClose,
}: SettingsViewProps) {
  const categories = PERSONA_SETTINGS_CATEGORIES[userRole];
  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId>(categories[0]?.id ?? 'general');
  const [searchQuery, setSearchQuery] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const [defaultSolutionScope, setDefaultSolutionScope] = useState(readDefaultSolutionScope);
  const [notifyReviewComplete, setNotifyReviewComplete] = useState(readNotifyOnReviewComplete);
  const [notifyArtifactReady, setNotifyArtifactReady] = useState(readNotifyOnArtifactReady);
  const [exportFormatDefault, setExportFormatDefault] = useState(readExportFormatDefault);
  const [shareApprovalDefault, setShareApprovalDefault] = useState(readShareApprovalDefault);
  const [emailNotifications, setEmailNotifications] = useState(readEmailNotifications);
  const [plainLanguageDefault, setPlainLanguageDefault] = useState(readPlainLanguageDefault);
  const [approvalReminderFrequency, setApprovalReminderFrequency] = useState(readApprovalReminderFrequency);
  const [conflictNotifications, setConflictNotifications] = useState(readConflictNotifications);
  const [xmlSyntaxTheme, setXmlSyntaxTheme] = useState(readXmlSyntaxTheme);
  const [devExportFormat, setDevExportFormat] = useState(readDevExportFormat);
  const [autoScrollConflicts, setAutoScrollConflicts] = useState(readAutoScrollToConflicts);
  const [instanceUrl, setInstanceUrl] = useState(readInstanceUrl);
  const [scopedAppPrefix, setScopedAppPrefix] = useState(readScopedAppPrefix);
  const [environment, setEnvironment] = useState(readEnvironment);
  const [roleMatrixSync, setRoleMatrixSync] = useState(readRoleMatrixSync);
  const [guestLinkExpiry, setGuestLinkExpiry] = useState(readGuestLinkExpiry);
  const [orgWideNotifications, setOrgWideNotifications] = useState(readOrgWideNotifications);
  const [dataClassification, setDataClassification] = useState(readDataClassificationDefault);
  const [auditLogRetention, setAuditLogRetention] = useState(readAuditLogRetention);
  const [securityReviewRequired, setSecurityReviewRequired] = useState(readSecurityReviewRequired);
  const [budgetThreshold, setBudgetThreshold] = useState(readBudgetThreshold);
  const [executiveSummaryFormat, setExecutiveSummaryFormat] = useState(readExecutiveSummaryFormat);
  const [chatCompletionSound, setChatCompletionSound] = useState(readChatCompletionSound);

  useEffect(() => {
    const first = PERSONA_SETTINGS_CATEGORIES[userRole][0]?.id ?? 'general';
    setActiveCategory(first);
    setSearchQuery('');
  }, [userRole]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const matchesSearch = (label: string, description: string, keywords = '') => {
    if (!normalizedSearch) return true;
    const haystack = `${label} ${description} ${keywords}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  };

  const visibleCategories = useMemo(() => {
    if (!normalizedSearch) return categories;
    return categories.filter((cat) => categoryHasMatches(cat.id, userRole, normalizedSearch));
  }, [categories, normalizedSearch, userRole]);

  useEffect(() => {
    if (visibleCategories.length > 0 && !visibleCategories.some((c) => c.id === activeCategory)) {
      setActiveCategory(visibleCategories[0].id);
    }
  }, [visibleCategories, activeCategory]);

  function renderCategoryPanel(categoryId: SettingsCategoryId): ReactNode {
    const rows: ReactNode[] = [];

    const add = (label: string, description: string, control: ReactNode, keywords = '') => {
      if (matchesSearch(label, description, keywords)) {
        rows.push(
          <Fragment key={label}>
            <SettingRow
              id={`setting-${label.replace(/\s+/g, '-').toLowerCase()}`}
              label={label}
              description={description}
            >
              {control}
            </SettingRow>
          </Fragment>,
        );
      }
    };

    if (categoryId === 'general') {
      add(
        'Appearance',
        'Choose how Mitra looks on your device. Select a single theme, or sync with your system.',
        <SelectNative
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          aria-label="Appearance"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="blue">Blue</option>
          <option value="system">System</option>
        </SelectNative>,
        'theme color mode dark light blue system',
      );
      add(
        'High contrast',
        'Increase contrast between text, borders, and backgrounds for improved readability.',
        <Switch checked={highContrast} onCheckedChange={onHighContrastChange} />,
        'accessibility contrast',
      );
      add(
        'Text size',
        'Adjust the base font size across chat, sidebars, and artifact panels.',
        <TextSizeStepper level={fontSizeLevel} onChange={onFontSizeLevelChange} />,
        'font typography scale',
      );
      if (userRole === 'architect') {
        add(
          'Auto-approve reviews',
          'Automatically approve stakeholder reviews in demo mode after sharing artifacts.',
          <Switch checked={autoApprove} onCheckedChange={onAutoApproveChange} />,
          'demo approval workflow',
        );
      }
      add(
        'Ambient music',
        'Play subtle background audio while you work in the Mitra workspace (demo).',
        <Switch checked={ambientMusic} onCheckedChange={onAmbientMusicChange} />,
        'audio sound background',
      );
      add(
        'Completion sound',
        'Play a subtle chime when Mitra finishes responding in chat.',
        <Switch
          checked={chatCompletionSound}
          onCheckedChange={(v) => {
            setChatCompletionSound(v);
            persistChatCompletionSound(v);
          }}
        />,
        'audio sound chat notification vr accessibility',
      );
    }

    if (categoryId === 'servicenow-instance' && userRole === 'architect') {
      add(
        'Connected instance',
        'Primary ServiceNow instance linked to your architect workspace.',
        <Input
          value={instanceUrl}
          onChange={(e) => setInstanceUrl(e.target.value)}
          onBlur={() => persistInstanceUrl(instanceUrl)}
          className="w-[280px] font-mono text-xs"
          placeholder="https://instance.service-now.com"
        />,
        'url connection',
      );
      if (matchesSearch('Connection status', 'OAuth health for the linked instance.', 'oauth connected')) {
        rows.push(
          <div key="architect-connection" className="settings-row flex items-center justify-between gap-6 py-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium text-foreground">Connection status</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                OAuth health for the linked instance.
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
            >
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          </div>,
        );
      }
    }

    if (categoryId === 'discovery' && userRole === 'architect') {
      add(
        'Default solution scope',
        'Pre-select scope when starting a new discovery conversation.',
        <SelectNative
          value={defaultSolutionScope}
          onChange={(e) => {
            const v = e.target.value as typeof defaultSolutionScope;
            setDefaultSolutionScope(v);
            persistDefaultSolutionScope(v);
          }}
        >
          <option value="scoped-app">Scoped application</option>
          <option value="department">Department</option>
          <option value="enterprise">Enterprise</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'artifacts' && userRole === 'architect') {
      add(
        'Default export format',
        'Preferred format when downloading artifacts from the artifact panel.',
        <SelectNative
          value={exportFormatDefault}
          onChange={(e) => {
            const v = e.target.value as typeof exportFormatDefault;
            setExportFormatDefault(v);
            persistExportFormatDefault(v);
          }}
        >
          <option value="markdown">Markdown</option>
          <option value="pdf">PDF</option>
          <option value="docx">Word (.docx)</option>
        </SelectNative>,
      );
      add(
        'Share approval default',
        'Default behavior when sharing artifacts for stakeholder sign-off.',
        <SelectNative
          value={shareApprovalDefault}
          onChange={(e) => {
            const v = e.target.value as typeof shareApprovalDefault;
            setShareApprovalDefault(v);
            persistShareApprovalDefault(v);
          }}
        >
          <option value="manual">Manual approval</option>
          <option value="auto-demo">Auto-approve (demo)</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'notifications' && userRole === 'architect') {
      add(
        'Review completion alerts',
        'Notify when a stakeholder completes or requests changes on a shared review.',
        <Switch
          checked={notifyReviewComplete}
          onCheckedChange={(v) => {
            setNotifyReviewComplete(v);
            persistNotifyOnReviewComplete(v);
          }}
        />,
      );
      add(
        'Artifact ready alerts',
        'Notify when Mitra finishes generating a new artifact in the active thread.',
        <Switch
          checked={notifyArtifactReady}
          onCheckedChange={(v) => {
            setNotifyArtifactReady(v);
            persistNotifyOnArtifactReady(v);
          }}
        />,
      );
    }

    if (categoryId === 'reviews' && userRole === 'stakeholder') {
      add(
        'Plain-language view',
        'Open requirements documents in simplified language by default.',
        <Switch
          checked={plainLanguageDefault}
          onCheckedChange={(v) => {
            setPlainLanguageDefault(v);
            persistPlainLanguageDefault(v);
          }}
        />,
      );
      add(
        'Approval reminder frequency',
        'How often to remind you about pending reviews in your queue.',
        <SelectNative
          value={approvalReminderFrequency}
          onChange={(e) => {
            const v = e.target.value as typeof approvalReminderFrequency;
            setApprovalReminderFrequency(v);
            persistApprovalReminderFrequency(v);
          }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="never">Never</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'notifications' && userRole === 'stakeholder') {
      add(
        'Email notifications',
        'Receive email when artifacts are shared for your review or when architects respond to comments.',
        <Switch
          checked={emailNotifications}
          onCheckedChange={(v) => {
            setEmailNotifications(v);
            persistEmailNotifications(v);
          }}
        />,
      );
    }

    if (categoryId === 'submissions' && userRole === 'business_owner') {
      add(
        'User story export format',
        'Default format when exporting draft user stories to Agile tools.',
        <SelectNative
          value="jira"
          onChange={() => {}}
        >
          <option value="jira">Jira (Atlassian)</option>
          <option value="agile">ServiceNow Agile Development</option>
          <option value="csv">CSV export</option>
        </SelectNative>,
        'jira agile export csv',
      );
      add(
        'Auto-notify architect',
        'Notify the Solution Architect when a submission is complete with user stories and process flows.',
        <Switch checked onCheckedChange={() => {}} />,
        'architect pickup notification',
      );
    }

    if (categoryId === 'notifications' && userRole === 'business_owner') {
      add(
        'Submission status alerts',
        'Notify when your requirements submission is picked up or reviewed by the architect.',
        <Switch checked onCheckedChange={() => {}} />,
        'email status architect review',
      );
    }

    if (categoryId === 'workspace' && userRole === 'developer') {
      add(
        'XML viewer theme',
        'Color theme for XML and script source previews in the developer workspace.',
        <SelectNative
          value={xmlSyntaxTheme}
          onChange={(e) => {
            const v = e.target.value as typeof xmlSyntaxTheme;
            setXmlSyntaxTheme(v);
            persistXmlSyntaxTheme(v);
          }}
        >
          <option value="servicenow">ServiceNow</option>
          <option value="monokai">Monokai</option>
          <option value="github">GitHub Light</option>
        </SelectNative>,
      );
      add(
        'Export default',
        'Default format when exporting scoped application updates.',
        <SelectNative
          value={devExportFormat}
          onChange={(e) => {
            const v = e.target.value as typeof devExportFormat;
            setDevExportFormat(v);
            persistDevExportFormat(v);
          }}
        >
          <option value="xml">Update set (XML)</option>
          <option value="json">JSON manifest</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'servicenow-dev-instance' && userRole === 'developer') {
      add(
        'Dev instance URL',
        'ServiceNow development instance used for update-set testing and conflict resolution.',
        <Input
          value="https://dev12345.service-now.com"
          readOnly
          className="w-[280px] font-mono text-xs text-muted-foreground"
        />,
        'development sandbox',
      );
      if (matchesSearch('Dev credentials', 'OAuth token status for the developer sandbox.', 'oauth token')) {
        rows.push(
          <div key="dev-credentials" className="settings-row flex items-center justify-between gap-6 py-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium text-foreground">Dev credentials</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                OAuth token status for the developer sandbox.
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
            >
              <CheckCircle2 className="h-3 w-3" />
              Valid
            </Badge>
          </div>,
        );
      }
    }

    if (categoryId === 'conflicts' && userRole === 'developer') {
      add(
        'Conflict notifications',
        'Show in-app alerts when new merge conflicts or flagged sections appear in the workspace.',
        <Switch
          checked={conflictNotifications}
          onCheckedChange={(v) => {
            setConflictNotifications(v);
            persistConflictNotifications(v);
          }}
        />,
      );
      add(
        'Auto-scroll to conflicts',
        'Jump to the first open conflict when opening an artifact with unresolved flags.',
        <Switch
          checked={autoScrollConflicts}
          onCheckedChange={(v) => {
            setAutoScrollConflicts(v);
            persistAutoScrollToConflicts(v);
          }}
        />,
      );
    }

    if (categoryId === 'configuration' && userRole === 'admin') {
      add(
        'Instance URL',
        'Primary ServiceNow instance URL for this Mitra deployment.',
        <Input
          value={instanceUrl}
          onChange={(e) => setInstanceUrl(e.target.value)}
          onBlur={() => persistInstanceUrl(instanceUrl)}
          className="w-[280px] font-mono text-xs"
          placeholder="https://instance.service-now.com"
        />,
      );
      add(
        'Scoped app prefix',
        'Namespace prefix for scoped applications deployed through Mitra.',
        <Input
          value={scopedAppPrefix}
          onChange={(e) => setScopedAppPrefix(e.target.value)}
          onBlur={() => persistScopedAppPrefix(scopedAppPrefix)}
          className="w-[280px] font-mono text-xs"
          placeholder="x_mitra_app"
        />,
      );
      add(
        'Environment',
        'Target environment for deployments and integration callbacks.',
        <SelectNative
          value={environment}
          onChange={(e) => {
            const v = e.target.value as typeof environment;
            setEnvironment(v);
            persistEnvironment(v);
          }}
        >
          <option value="dev">Development</option>
          <option value="test">Test</option>
          <option value="prod">Production</option>
        </SelectNative>,
      );
      if (matchesSearch('MID server status', 'Health of the integration MID server for outbound calls.', 'mid integration')) {
        rows.push(
          <div key="mid-server" className="settings-row flex items-center justify-between gap-6 py-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium text-foreground">MID server status</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Health of the integration MID server for outbound calls.
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
            >
              <CheckCircle2 className="h-3 w-3" />
              Up
            </Badge>
          </div>,
        );
      }
    }

    if (categoryId === 'users-roles' && userRole === 'admin') {
      add(
        'Role matrix sync',
        'Keep persona role assignments synchronized with ServiceNow group membership.',
        <Switch
          checked={roleMatrixSync}
          onCheckedChange={(v) => {
            setRoleMatrixSync(v);
            persistRoleMatrixSync(v);
          }}
        />,
      );
      add(
        'Guest link expiry',
        'Default expiration for stakeholder guest review links.',
        <SelectNative
          value={guestLinkExpiry}
          onChange={(e) => {
            const v = e.target.value as typeof guestLinkExpiry;
            setGuestLinkExpiry(v);
            persistGuestLinkExpiry(v);
          }}
        >
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'notifications' && userRole === 'admin') {
      add(
        'Org-wide notification rules',
        'Apply platform notification templates to all solutions in this instance.',
        <Switch
          checked={orgWideNotifications}
          onCheckedChange={(v) => {
            setOrgWideNotifications(v);
            persistOrgWideNotifications(v);
          }}
        />,
      );
    }

    if (categoryId === 'integrations' && userRole === 'admin') {
      if (matchesSearch('ServiceNow connection', 'OAuth connection status for the linked instance.', 'integration oauth')) {
        rows.push(
          <div key="servicenow-connection" className="settings-row flex items-center justify-between gap-6 py-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium text-foreground">ServiceNow connection</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                OAuth connection status for the linked instance.
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
            >
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          </div>,
        );
      }
      if (matchesSearch('Update set pipeline', 'Automated push of approved artifacts to the target instance.', 'ci cd deploy')) {
        rows.push(
          <div key="update-set-pipeline" className="settings-row flex items-center justify-between gap-6 py-4">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium text-foreground">Update set pipeline</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Automated push of approved artifacts to the target instance.
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 gap-1 text-muted-foreground">
              <XCircle className="h-3 w-3" />
              Not configured
            </Badge>
          </div>,
        );
      }
    }

    if (categoryId === 'security' && userRole === 'admin') {
      add(
        'Security review before promote',
        'Require Security Officer sign-off before artifacts move to production.',
        <Switch
          checked={securityReviewRequired}
          onCheckedChange={(v) => {
            setSecurityReviewRequired(v);
            persistSecurityReviewRequired(v);
          }}
        />,
      );
      add(
        'Default data classification',
        'Classification applied to new artifacts unless overridden per solution.',
        <SelectNative
          value={dataClassification}
          onChange={(e) => {
            const v = e.target.value as typeof dataClassification;
            setDataClassification(v);
            persistDataClassificationDefault(v);
          }}
        >
          <option value="internal">Internal</option>
          <option value="confidential">Confidential</option>
          <option value="restricted">Restricted</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'compliance' && userRole === 'security') {
      add(
        'Default data classification',
        'Classification applied to new artifacts unless overridden per solution.',
        <SelectNative
          value={dataClassification}
          onChange={(e) => {
            const v = e.target.value as typeof dataClassification;
            setDataClassification(v);
            persistDataClassificationDefault(v);
          }}
        >
          <option value="internal">Internal</option>
          <option value="confidential">Confidential</option>
          <option value="restricted">Restricted</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'gates' && userRole === 'security') {
      add(
        'Security review before promote',
        'Require Security Officer sign-off before artifacts move to production.',
        <Switch
          checked={securityReviewRequired}
          onCheckedChange={(v) => {
            setSecurityReviewRequired(v);
            persistSecurityReviewRequired(v);
          }}
        />,
      );
    }

    if (categoryId === 'audit' && userRole === 'security') {
      add(
        'Audit log retention',
        'How long Mitra retains persona activity and approval audit events.',
        <SelectNative
          value={auditLogRetention}
          onChange={(e) => {
            const v = e.target.value as typeof auditLogRetention;
            setAuditLogRetention(v);
            persistAuditLogRetention(v);
          }}
        >
          <option value="90d">90 days</option>
          <option value="180d">180 days</option>
          <option value="1y">1 year</option>
        </SelectNative>,
      );
    }

    if (categoryId === 'approvals' && userRole === 'sponsor') {
      add(
        'Budget approval threshold',
        'Solutions above this amount (USD) require executive sponsor approval.',
        <Input
          type="number"
          min={0}
          value={budgetThreshold}
          onChange={(e) => setBudgetThreshold(e.target.value)}
          onBlur={() => persistBudgetThreshold(budgetThreshold)}
          className="w-[140px] font-mono text-xs"
        />,
        'budget cost dollar',
      );
    }

    if (categoryId === 'reporting' && userRole === 'sponsor') {
      add(
        'Executive summary format',
        'Default layout when Mitra generates sponsor briefing documents.',
        <SelectNative
          value={executiveSummaryFormat}
          onChange={(e) => {
            const v = e.target.value as typeof executiveSummaryFormat;
            setExecutiveSummaryFormat(v);
            persistExecutiveSummaryFormat(v);
          }}
        >
          <option value="brief">Brief (1 page)</option>
          <option value="detailed">Detailed report</option>
          <option value="slides">Slide deck outline</option>
        </SelectNative>,
      );
      add(
        'Reporting cadence',
        'How often Mitra sends portfolio status updates to your inbox.',
        <SelectNative defaultValue="weekly">
          <option value="daily">Daily digest</option>
          <option value="weekly">Weekly summary</option>
          <option value="monthly">Monthly executive report</option>
        </SelectNative>,
        'email schedule digest',
      );
    }

    if (rows.length === 0) {
      return (
        <p className="py-8 text-sm text-muted-foreground">
          No settings match &ldquo;{searchQuery.trim()}&rdquo;.
        </p>
      );
    }
    return rows;
  }

  const activeLabel = categories.find((c) => c.id === activeCategory)?.label ?? 'Settings';

  return (
    <div className="settings-page flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-6">
      <div ref={panelRef} className="settings-panel relative flex h-[min(720px,calc(100vh-2rem))] w-full max-w-4xl overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="settings-close absolute right-4 top-4 z-10 h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
          aria-label="Close settings"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <aside className="settings-nav flex w-[220px] shrink-0 flex-col border-r border-border/60 pt-12">
          <div className="shrink-0 px-3 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings…"
                className="h-8 border-transparent bg-transparent pl-8 text-xs shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
            {visibleCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    activeCategory === cat.id
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="settings-content min-h-0 min-w-0 flex-1 overflow-y-auto pt-12">
          <div className="px-8 pb-8">
            <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">{activeLabel}</h2>
            <div className="settings-rows">{renderCategoryPanel(activeCategory)}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

const CATEGORY_SEARCH_TERMS: Record<UserRole, Partial<Record<SettingsCategoryId, string>>> = {
  architect: {
    general: 'appearance theme high contrast text size auto-approve ambient music completion sound',
    'servicenow-instance': 'instance url connection oauth servicenow',
    discovery: 'solution scope notification',
    artifacts: 'export share approval format download',
    notifications: 'review artifact alert notify',
  },
  business_owner: {
    general: 'appearance theme high contrast text size ambient music completion sound',
    submissions: 'upload requirements user stories export jira agile',
    notifications: 'architect pickup notify email',
  },
  stakeholder: {
    general: 'appearance theme high contrast text size ambient music completion sound',
    reviews: 'plain language reminder approval frequency',
    notifications: 'email notify',
  },
  developer: {
    general: 'appearance theme high contrast text size ambient music completion sound',
    workspace: 'xml syntax export theme',
    'servicenow-dev-instance': 'dev instance url credentials oauth',
    conflicts: 'conflict notifications scroll merge flags',
  },
  admin: {
    general: 'appearance theme high contrast text size ambient music completion sound',
    configuration: 'instance url scoped app prefix environment mid server dev test prod',
    'users-roles': 'role matrix sync guest link expiry',
    notifications: 'org-wide notification rules',
    integrations: 'servicenow connection oauth pipeline update set',
    security: 'security review data classification promote',
  },
  security: {
    general: 'appearance theme high contrast text size ambient music completion sound',
    compliance: 'data classification',
    gates: 'security review promote production access',
    audit: 'audit log retention events',
  },
  sponsor: {
    general: 'appearance theme high contrast text size ambient music completion sound',
    approvals: 'budget threshold dollar',
    reporting: 'executive summary format cadence digest',
  },
};

function categoryHasMatches(
  categoryId: SettingsCategoryId,
  role: UserRole,
  query: string,
): boolean {
  const terms = CATEGORY_SEARCH_TERMS[role][categoryId] ?? '';
  return terms.toLowerCase().includes(query) || categoryId.includes(query);
}

export default SettingsView;
