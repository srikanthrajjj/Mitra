import { AdminChecklistItem, DeveloperComment, StakeholderReview, ArtifactStatus } from '../types';

const REVIEWS_KEY = 'mitra_stakeholder_reviews';
const DEV_COMMENTS_KEY = 'mitra_developer_comments';
const CHECKLIST_KEY = 'mitra_admin_checklist';
const ARTIFACT_STATUS_KEY = 'mitra_artifact_status_overrides';

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadPersistedReviews(fallback: StakeholderReview[]): StakeholderReview[] {
  const saved = readJson<StakeholderReview[]>(REVIEWS_KEY);
  return saved?.length ? saved : fallback;
}

export function persistReviews(reviews: StakeholderReview[]): void {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  for (const review of reviews) {
    localStorage.setItem(reviewStorageKey(review.id), JSON.stringify(review));
  }
}

function reviewStorageKey(reviewId: string): string {
  return `mitra_review_${reviewId}`;
}

export function loadReviewById(reviewId: string): StakeholderReview | null {
  const saved = readJson<StakeholderReview>(reviewStorageKey(reviewId));
  if (saved) return saved;
  const all = readJson<StakeholderReview[]>(REVIEWS_KEY);
  return all?.find((r) => r.id === reviewId) ?? null;
}

const SN_QUEUE_KEY = 'mitra_pending_sn_updates';
const PHASE_SYNC_KEY = 'mitra_pending_phase_sync';

export interface PendingSnUpdate {
  solutionId: string;
  text: string;
}

export interface PendingPhaseSync {
  solutionId: string;
  phaseProgress: import('../types').PhaseProgress;
}

export function enqueueSnUpdate(solutionId: string, text: string): void {
  const queue = readJson<PendingSnUpdate[]>(SN_QUEUE_KEY) ?? [];
  queue.push({ solutionId, text });
  localStorage.setItem(SN_QUEUE_KEY, JSON.stringify(queue));
}

export function drainSnUpdates(): PendingSnUpdate[] {
  const queue = readJson<PendingSnUpdate[]>(SN_QUEUE_KEY) ?? [];
  if (queue.length > 0) localStorage.removeItem(SN_QUEUE_KEY);
  return queue;
}

export function enqueuePhaseProgressSync(
  solutionId: string,
  phaseProgress: import('../types').PhaseProgress,
): void {
  localStorage.setItem(
    PHASE_SYNC_KEY,
    JSON.stringify({ solutionId, phaseProgress } satisfies PendingPhaseSync),
  );
}

export function drainPhaseProgressSync(): PendingPhaseSync | null {
  const pending = readJson<PendingPhaseSync>(PHASE_SYNC_KEY);
  if (pending) localStorage.removeItem(PHASE_SYNC_KEY);
  return pending;
}

export function loadPersistedArtifactStatuses(): Record<string, ArtifactStatus> {
  return readJson<Record<string, ArtifactStatus>>(ARTIFACT_STATUS_KEY) ?? {};
}

export function persistArtifactStatuses(overrides: Record<string, ArtifactStatus>): void {
  localStorage.setItem(ARTIFACT_STATUS_KEY, JSON.stringify(overrides));
}

export function loadPersistedDeveloperComments(fallback: DeveloperComment[]): DeveloperComment[] {
  const saved = readJson<DeveloperComment[]>(DEV_COMMENTS_KEY);
  return saved?.length ? saved : fallback;
}

export function persistDeveloperComments(comments: DeveloperComment[]): void {
  localStorage.setItem(DEV_COMMENTS_KEY, JSON.stringify(comments));
}

export function loadPersistedChecklist(fallback: AdminChecklistItem[]): AdminChecklistItem[] {
  const saved = readJson<AdminChecklistItem[]>(CHECKLIST_KEY);
  return saved?.length ? saved : fallback;
}

export function persistChecklist(checklist: AdminChecklistItem[]): void {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist));
}

const REQUIREMENTS_DOCS_KEY = 'mitra_requirements_documents';

export function loadPersistedRequirementsDocuments(): Record<string, import('../types').RequirementsDocument> {
  return readJson<Record<string, import('../types').RequirementsDocument>>(REQUIREMENTS_DOCS_KEY) ?? {};
}

export function persistRequirementsDocuments(docs: Record<string, import('../types').RequirementsDocument>): void {
  localStorage.setItem(REQUIREMENTS_DOCS_KEY, JSON.stringify(docs));
}
