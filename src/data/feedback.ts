export type FeedbackType = 'bug' | 'improvement' | 'other';
export type FeedbackPriority = 'critical' | 'high' | 'medium' | 'low';
export type FeedbackStatus = 'open' | 'reviewing' | 'resolved';

export interface FeedbackEntry {
  id: string;
  message: string;
  type: FeedbackType;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  submittedBy: string;
  submittedAt: string;
}

export const FEEDBACK_STORAGE_KEY = 'mitra_user_feedback';

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: 'Bug',
  improvement: 'Improvement',
  other: 'Other',
};

export const FEEDBACK_PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: 'Open',
  reviewing: 'In review',
  resolved: 'Resolved',
};

export const FEEDBACK_TYPES: FeedbackType[] = ['bug', 'improvement', 'other'];
export const FEEDBACK_PRIORITIES: FeedbackPriority[] = ['critical', 'high', 'medium', 'low'];

const SEED_FEEDBACK: FeedbackEntry[] = [
  {
    id: 'fb-seed-1',
    message: 'Composer loses focus after switching ServiceNow instance mid-conversation.',
    type: 'bug',
    priority: 'high',
    status: 'open',
    submittedBy: 'Alex Rivera',
    submittedAt: '2026-07-18T14:22:00.000Z',
  },
  {
    id: 'fb-seed-2',
    message: 'Add a way to pin frequently used skills to the top of the Skills list.',
    type: 'improvement',
    priority: 'medium',
    status: 'reviewing',
    submittedBy: 'Jordan Lee',
    submittedAt: '2026-07-16T09:05:00.000Z',
  },
  {
    id: 'fb-seed-3',
    message: 'Production instance banner is easy to miss on light theme — consider stronger contrast.',
    type: 'bug',
    priority: 'critical',
    status: 'open',
    submittedBy: 'Sam Okonkwo',
    submittedAt: '2026-07-20T11:40:00.000Z',
  },
  {
    id: 'fb-seed-4',
    message: 'Export chat history as PDF for stakeholder reviews.',
    type: 'improvement',
    priority: 'low',
    status: 'resolved',
    submittedBy: 'Priya Shah',
    submittedAt: '2026-07-10T16:18:00.000Z',
  },
  {
    id: 'fb-seed-5',
    message: 'Unclear what “Other” category means on Connections tags — docs would help.',
    type: 'other',
    priority: 'low',
    status: 'resolved',
    submittedBy: 'Casey Nguyen',
    submittedAt: '2026-07-08T08:50:00.000Z',
  },
];

const PRIORITY_RANK: Record<FeedbackPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function readFeedbackEntries(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(SEED_FEEDBACK));
      return [...SEED_FEEDBACK];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...SEED_FEEDBACK];
    return parsed as FeedbackEntry[];
  } catch {
    return [...SEED_FEEDBACK];
  }
}

export function writeFeedbackEntries(entries: FeedbackEntry[]): void {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore storage errors */
  }
}

export function persistFeedbackEntry(entry: FeedbackEntry): FeedbackEntry[] {
  const next = [entry, ...readFeedbackEntries()];
  writeFeedbackEntries(next);
  return next;
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus): FeedbackEntry[] {
  const next = readFeedbackEntries().map((entry) =>
    entry.id === id ? { ...entry, status } : entry,
  );
  writeFeedbackEntries(next);
  return next;
}

export function sortFeedbackByPriority(entries: FeedbackEntry[]): FeedbackEntry[] {
  return [...entries].sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
}

export function formatFeedbackDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
