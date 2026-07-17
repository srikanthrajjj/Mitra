const PREFIX = 'mitra_settings_';

function readString(key: string, fallback: string): string {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function persistString(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    /* ignore */
  }
}

function readBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(PREFIX + key);
    if (v === null) return fallback;
    return v === 'true';
  } catch {
    return fallback;
  }
}

function persistBool(key: string, value: boolean): void {
  persistString(key, String(value));
}

/** Architect — Discovery */
export type SolutionScope = 'department' | 'enterprise' | 'scoped-app';
export function readDefaultSolutionScope(): SolutionScope {
  const v = readString('default_solution_scope', 'scoped-app');
  return v === 'department' || v === 'enterprise' || v === 'scoped-app' ? v : 'scoped-app';
}
export function persistDefaultSolutionScope(v: SolutionScope): void {
  persistString('default_solution_scope', v);
}

export function readNotifyOnReviewComplete(): boolean {
  return readBool('notify_review_complete', true);
}
export function persistNotifyOnReviewComplete(v: boolean): void {
  persistBool('notify_review_complete', v);
}

export function readNotifyOnArtifactReady(): boolean {
  return readBool('notify_artifact_ready', true);
}
export function persistNotifyOnArtifactReady(v: boolean): void {
  persistBool('notify_artifact_ready', v);
}

/** Architect — Artifacts */
export type ExportFormat = 'pdf' | 'markdown' | 'docx';
export function readExportFormatDefault(): ExportFormat {
  const v = readString('export_format_default', 'markdown');
  return v === 'pdf' || v === 'markdown' || v === 'docx' ? v : 'markdown';
}
export function persistExportFormatDefault(v: ExportFormat): void {
  persistString('export_format_default', v);
}

export type ShareApprovalDefault = 'manual' | 'auto-demo';
export function readShareApprovalDefault(): ShareApprovalDefault {
  const v = readString('share_approval_default', 'manual');
  return v === 'manual' || v === 'auto-demo' ? v : 'manual';
}
export function persistShareApprovalDefault(v: ShareApprovalDefault): void {
  persistString('share_approval_default', v);
}

/** Stakeholder */
export function readEmailNotifications(): boolean {
  return readBool('email_notifications', true);
}
export function persistEmailNotifications(v: boolean): void {
  persistBool('email_notifications', v);
}

export function readPlainLanguageDefault(): boolean {
  return readBool('plain_language_default', true);
}
export function persistPlainLanguageDefault(v: boolean): void {
  persistBool('plain_language_default', v);
}

export type ReminderFrequency = 'daily' | 'weekly' | 'never';
export function readApprovalReminderFrequency(): ReminderFrequency {
  const v = readString('approval_reminder_frequency', 'weekly');
  return v === 'daily' || v === 'weekly' || v === 'never' ? v : 'weekly';
}
export function persistApprovalReminderFrequency(v: ReminderFrequency): void {
  persistString('approval_reminder_frequency', v);
}

/** Developer */
export function readConflictNotifications(): boolean {
  return readBool('conflict_notifications', true);
}
export function persistConflictNotifications(v: boolean): void {
  persistBool('conflict_notifications', v);
}

export type XmlSyntaxTheme = 'servicenow' | 'monokai' | 'github';
export function readXmlSyntaxTheme(): XmlSyntaxTheme {
  const v = readString('xml_syntax_theme', 'servicenow');
  return v === 'servicenow' || v === 'monokai' || v === 'github' ? v : 'servicenow';
}
export function persistXmlSyntaxTheme(v: XmlSyntaxTheme): void {
  persistString('xml_syntax_theme', v);
}

export type DevExportFormat = 'xml' | 'json';
export function readDevExportFormat(): DevExportFormat {
  const v = readString('dev_export_format', 'xml');
  return v === 'xml' || v === 'json' ? v : 'xml';
}
export function persistDevExportFormat(v: DevExportFormat): void {
  persistString('dev_export_format', v);
}

export function readAutoScrollToConflicts(): boolean {
  return readBool('auto_scroll_conflicts', true);
}
export function persistAutoScrollToConflicts(v: boolean): void {
  persistBool('auto_scroll_conflicts', v);
}

/** Admin — Configuration */
export function readInstanceUrl(): string {
  return readString('instance_url', 'https://dev12345.service-now.com');
}
export function persistInstanceUrl(v: string): void {
  persistString('instance_url', v);
}

export function readScopedAppPrefix(): string {
  return readString('scoped_app_prefix', 'x_mitra_hr_ticketing');
}
export function persistScopedAppPrefix(v: string): void {
  persistString('scoped_app_prefix', v);
}

export type Environment = 'dev' | 'test' | 'prod';
export function readEnvironment(): Environment {
  const v = readString('environment', 'dev');
  return v === 'dev' || v === 'test' || v === 'prod' ? v : 'dev';
}
export function persistEnvironment(v: Environment): void {
  persistString('environment', v);
}

export function readRoleMatrixSync(): boolean {
  return readBool('role_matrix_sync', true);
}
export function persistRoleMatrixSync(v: boolean): void {
  persistBool('role_matrix_sync', v);
}

export type GuestLinkExpiry = '24h' | '7d' | '30d';
export function readGuestLinkExpiry(): GuestLinkExpiry {
  const v = readString('guest_link_expiry', '7d');
  return v === '24h' || v === '7d' || v === '30d' ? v : '7d';
}
export function persistGuestLinkExpiry(v: GuestLinkExpiry): void {
  persistString('guest_link_expiry', v);
}

export function readOrgWideNotifications(): boolean {
  return readBool('org_wide_notifications', true);
}
export function persistOrgWideNotifications(v: boolean): void {
  persistBool('org_wide_notifications', v);
}

/** Security */
export type DataClassification = 'internal' | 'confidential' | 'restricted';
export function readDataClassificationDefault(): DataClassification {
  const v = readString('data_classification_default', 'internal');
  return v === 'internal' || v === 'confidential' || v === 'restricted' ? v : 'internal';
}
export function persistDataClassificationDefault(v: DataClassification): void {
  persistString('data_classification_default', v);
}

export type AuditRetention = '90d' | '180d' | '1y';
export function readAuditLogRetention(): AuditRetention {
  const v = readString('audit_log_retention', '180d');
  return v === '90d' || v === '180d' || v === '1y' ? v : '180d';
}
export function persistAuditLogRetention(v: AuditRetention): void {
  persistString('audit_log_retention', v);
}

export function readSecurityReviewRequired(): boolean {
  return readBool('security_review_required', true);
}
export function persistSecurityReviewRequired(v: boolean): void {
  persistBool('security_review_required', v);
}

/** Sponsor */
export function readBudgetThreshold(): string {
  return readString('budget_threshold', '50000');
}
export function persistBudgetThreshold(v: string): void {
  persistString('budget_threshold', v);
}

export type ExecutiveSummaryFormat = 'brief' | 'detailed' | 'slides';
export function readExecutiveSummaryFormat(): ExecutiveSummaryFormat {
  const v = readString('executive_summary_format', 'brief');
  return v === 'brief' || v === 'detailed' || v === 'slides' ? v : 'brief';
}
export function persistExecutiveSummaryFormat(v: ExecutiveSummaryFormat): void {
  persistString('executive_summary_format', v);
}

/** Global appearance — shared across personas */
const LEGACY_FONT_SIZE_KEY = 'MITRA_FONT_SIZE_LEVEL';
/** Index into FONT_SIZE_PX; 3 → 14px */
const DEFAULT_FONT_SIZE_LEVEL = 3;

export function readHighContrast(): boolean {
  return readBool('high_contrast', false);
}
export function persistHighContrast(v: boolean): void {
  persistBool('high_contrast', v);
}

export function readFontSizeLevel(): number {
  try {
    const legacy = localStorage.getItem(LEGACY_FONT_SIZE_KEY);
    if (legacy !== null) {
      const parsed = Number(legacy);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5) return parsed;
    }
    const v = localStorage.getItem(PREFIX + 'font_size_level');
    if (v !== null) {
      const parsed = Number(v);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5) return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_FONT_SIZE_LEVEL;
}

export function persistFontSizeLevel(level: number): void {
  const clamped = Math.max(0, Math.min(5, level));
  persistString('font_size_level', String(clamped));
  try {
    localStorage.setItem(LEGACY_FONT_SIZE_KEY, String(clamped));
  } catch {
    /* ignore */
  }
}

export function readAmbientMusic(): boolean {
  return readBool('ambient_music', false);
}
export function persistAmbientMusic(v: boolean): void {
  persistBool('ambient_music', v);
}

export function readChatCompletionSound(): boolean {
  return readBool('chat_completion_sound', false);
}
export function persistChatCompletionSound(v: boolean): void {
  persistBool('chat_completion_sound', v);
}

export function readTaskCompleteNotification(): boolean {
  return readBool('task_complete_notification', false);
}
export function persistTaskCompleteNotification(v: boolean): void {
  persistBool('task_complete_notification', v);
}

export const FONT_SIZE_PX = [11, 12, 13, 14, 15, 16] as const;
