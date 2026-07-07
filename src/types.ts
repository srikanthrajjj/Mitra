export type Theme = 'light' | 'dark' | 'blue' | 'system';
export type ResolvedTheme = Exclude<Theme, 'system'>;

export type UserRole = 'architect' | 'business_owner' | 'stakeholder' | 'admin' | 'developer' | 'security' | 'sponsor';

export type ProjectStatus = 'building' | 'in_review' | 'ready_to_deploy' | 'deployed';

/** Persona-owned pipeline step in the project status stepper */
export type WorkflowStepId =
  | 'business_owner'
  | 'architect'
  | 'stakeholder'
  | 'developer'
  | 'admin_security';

export type WorkflowStepStatus = 'complete' | 'active' | 'pending' | 'blocked';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  personaRole: UserRole;
  description: string;
  activeDescription: string;
  status: WorkflowStepStatus;
}

export interface WorkflowSnapshot {
  steps: WorkflowStep[];
  activeStepId: WorkflowStepId;
  headline: string;
}

/** Folder / project lifecycle badge shown in sidebar and project navigation */
export type FolderStatus =
  | 'draft'
  | 'in_review'
  | 'accepted'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export type SharePermission = 'view' | 'comment' | 'approve';

export type ArtifactType =
  | 'requirements_doc'
  | 'user_stories'
  | 'process_flow'
  | 'data_model'
  | 'workflow'
  | 'role_matrix'
  | 'script_library'
  | 'executive_summary'
  | 'rfp_package'
  | 'test_script'
  | 'deployment_checklist';

/** Agile/Jira-ready user story generated from business requirements */
export interface UserStory {
  id: string;
  role: string;
  action: string;
  value: string;
  /** Full formatted story: "As a [role], I want [action], so that [value]" */
  formatted: string;
  status: 'draft' | 'ready';
  priority?: 'high' | 'medium' | 'low';
  epic?: string;
}

/** Uploaded requirements document for Business Owner submissions */
export interface BusinessOwnerRequirementsUpload {
  id: string;
  fileName: string;
  content: string;
  uploadedAt: string;
}

/** Process flow diagram attachment */
export interface BusinessOwnerProcessFlow {
  id: string;
  name: string;
  description: string;
  attachedAt: string;
  isSample?: boolean;
}

/** Business Owner submission bundle shown in sidebar and artifacts panel */
export interface BusinessOwnerSubmission {
  id: string;
  title: string;
  status: 'draft' | 'submitted';
  requirements?: BusinessOwnerRequirementsUpload;
  userStories: UserStory[];
  processFlow?: BusinessOwnerProcessFlow;
  updatedAt: string;
}

export type ProjectPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type GateApprover =
  | 'stakeholder'
  | 'developer'
  | 'security'
  | 'admin'
  | 'sponsor'
  | 'qa'
  | 'architect';

export interface PhaseGate {
  approver: GateApprover;
  label: string;
  /** Phase 4: advance when architect confirms export/sent — no reviewer approval */
  exportOnly?: boolean;
}

export interface PhaseArtifactDefinition {
  type: ArtifactType;
  name: string;
  filingNameSuffix: string;
  artifactFormat: ArtifactFormat;
  buildStage: StudioBuildStage;
  gate: PhaseGate;
  schemaFields: string[];
}

export interface PhaseProgress {
  solutionId: string;
  currentPhase: ProjectPhase;
  /** Index of next question to ask within currentPhase (0-based) */
  questionIndex: number;
  /** Artifact IDs generated and ready for review */
  artifactsGenerated: string[];
  phaseStartedAt?: string;
  /** Phase 4: architect confirmed RFP package was exported and sent */
  rfpExportConfirmed?: boolean;
  /** Phase 6: stakeholder UAT sign-off on living test script */
  uatSignOffComplete?: boolean;
}

export type ArtifactStatus =
  | 'approved'
  | 'in_review'
  | 'pending'
  | 'draft'
  | 'not_started';

export interface ShareInvite {
  id: string;
  artifactId: string;
  solutionId: string;
  artifactName: string;
  solutionTitle: string;
  email: string;
  permission: SharePermission;
  guestToken: string;
  sentAt: string;
  senderName: string;
  reviewId: string;
}

export interface AdminChecklistItem {
  id: string;
  solutionId: string;
  label: string;
  description: string;
  dependsOn: string[];
  completed: boolean;
  order: number;
}

export type DeveloperCommentSeverity = 'blocker' | 'major' | 'minor';

export interface DeveloperComment {
  id: string;
  artifactId: string;
  solutionId: string;
  section: string;
  text: string;
  author: string;
  createdAt: string;
  resolved: boolean;
  /** Line or section anchor for dev review UI */
  lineRef?: string;
  severity?: DeveloperCommentSeverity;
}

export type ArtifactFormat = 'DOC' | 'HTML' | 'PDF' | 'WORD' | 'XML' | 'JSON';

export interface SolutionArtifact {
  id: string;
  solutionId: string;
  type: ArtifactType;
  /** Human-readable deliverable title */
  name: string;
  /** ServiceNow Studio filing name (e.g. data_model_u_hrsd_case.xml) */
  filingName: string;
  status: ArtifactStatus;
  /** File format badge shown on artifact cards */
  artifactFormat: ArtifactFormat;
  /** ServiceNow Studio phase this artifact belongs to */
  buildStage: StudioBuildStage;
  /** Mitra 7-phase lifecycle phase (1–7) */
  phase?: ProjectPhase;
  /** Semantic version of this deliverable */
  version?: string;
  /** Who last updated this artifact in the demo */
  updatedBy?: string;
  updatedAt?: string;
  /** Mitra turn count (completed responses) before this artifact appears */
  revealAfterTurn?: number;
}

export type StakeholderReviewStatus = 'awaiting' | 'approved' | 'changes_requested';

/** Editable block within a Phase 1 Requirements Document */
export interface RequirementsSection {
  id: string;
  title: string;
  body: string;
}

export interface RequirementsDocument {
  artifactId: string;
  solutionId: string;
  sections: RequirementsSection[];
  version: string;
  locked: boolean;
  updatedAt: string;
}

/** Stakeholder inline comment anchored to a requirements section */
export interface StakeholderSectionComment {
  sectionId: string;
  sectionTitle: string;
  text: string;
}

export interface StakeholderReview {
  id: string;
  solutionId: string;
  artifactId: string;
  solutionTitle: string;
  artifactName: string;
  status: StakeholderReviewStatus;
  completedLabel?: string;
  summaryText?: string;
  sentAt?: string;
  stakeholderComments?: string;
  /** Section-scoped comments from guest review (requirements doc) */
  sectionComments?: StakeholderSectionComment[];
  /** Plain-language sections shown in guest preview */
  guestSections?: RequirementsSection[];
  /** Persona queue this review belongs to */
  reviewerRole?: UserRole;
  /** Architect who shared the artifact (shown in guest notifications) */
  senderName?: string;
  recipientEmail?: string;
  permission?: SharePermission;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mitra';
  text: string;
  timestamp: Date;
  status?: 'sending' | 'sent';
  codeSample?: string;
  mermaidChart?: string;
  choices?: string[];
  selectedChoice?: string;
  isTriage?: boolean;
  /** ServiceNow-style workflow / record update */
  snUpdate?: boolean;
  /** Build-plan todos shown after thinking (demo / architect chat) */
  todos?: MitraTodoItem[];
  todoSummary?: string;
}

export type MitraTodoStatus = 'pending' | 'active' | 'complete';

export interface MitraTodoItem {
  id: string;
  label: string;
  status: MitraTodoStatus;
}

export interface TableField {
  name: string;
  type: string;
  label: string;
  reference?: string;
  mandatory?: boolean;
}

export interface ServiceNowTable {
  name: string;
  label: string;
  extendsTable?: string;
  fields: TableField[];
}

export type StudioBuildStage =
  | 'scope'
  | 'tables'
  | 'forms'
  | 'scripts'
  | 'rules'
  | 'update_set'
  | 'published';

export interface ScopedApp {
  name: string;
  scope: string;
  version: string;
  vendor: string;
  sysId: string;
  shortDescription: string;
}

export interface ApplicationModule {
  title: string;
  table: string;
  order: number;
  roles: string[];
}

export interface UpdateSetItem {
  type: 'Table' | 'Field' | 'Client Script' | 'Business Rule' | 'Module' | 'ACL';
  name: string;
  table?: string;
  state: 'In Progress' | 'Committed';
}

export interface UpdateSet {
  name: string;
  state: 'in progress' | 'complete';
  items: UpdateSetItem[];
}

export interface SolutionBlueprint {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'discovering' | 'designing' | 'generating' | 'completed';
  buildStage?: StudioBuildStage;
  scopedApp?: ScopedApp;
  applicationMenu?: ApplicationModule[];
  updateSet?: UpdateSet;
  discoveredRequirements: string[];
  architectureSteps: string[];
  tables: ServiceNowTable[];
  clientScripts?: Array<{
    name: string;
    table: string;
    type: 'onLoad' | 'onChange' | 'onSubmit';
    script: string;
    description: string;
  }>;
  businessRules?: Array<{
    name: string;
    table: string;
    when: 'before' | 'after' | 'async';
    insert: boolean;
    update: boolean;
    script: string;
    description: string;
  }>;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  active: boolean;
  blueprint: SolutionBlueprint;
  chatHistory: ChatMessage[];
  guidedStep?: number;
  guidedData?: {
    buildGoal?: string;
    industry?: string;
    appType?: string;
  };
  folderId?: string;
  timeLabel?: string;
  projectStatus?: ProjectStatus;
  /** 7-phase architect workflow progress */
  phaseProgress?: PhaseProgress;
  isBranch?: boolean;
  isLoading?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  /** Set when the last generation attempt failed without a usable response */
  generationError?: boolean;
}

export interface ServiceTemplate {
  id: string;
  title: string;
  category: 'Programs' | 'Fundraising' | 'Volunteers' | 'Grants' | 'Operations';
  description: string;
  popularity: number;
  tablesCount: number;
  tags: string[];
}

export interface InstanceConnection {
  url: string;
  clientId: string;
  clientSecret: string;
  username: string;
  isConnected: boolean;
  lastTested?: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  badgeColor: string;
}

