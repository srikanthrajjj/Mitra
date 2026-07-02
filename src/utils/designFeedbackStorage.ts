export const DESIGN_FEEDBACK_STORAGE_KEY = 'mitra_design_feedback';

export interface DesignFeedbackEntry {
  id: string;
  text: string;
  submittedAt: string;
  activeTab?: string;
  userRole?: string;
}

export function readFeedbackEntries(): DesignFeedbackEntry[] {
  try {
    const raw = localStorage.getItem(DESIGN_FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as DesignFeedbackEntry[]) : [];
  } catch {
    return [];
  }
}

export function persistFeedbackEntry(entry: DesignFeedbackEntry): void {
  try {
    const existing = readFeedbackEntries();
    localStorage.setItem(DESIGN_FEEDBACK_STORAGE_KEY, JSON.stringify([entry, ...existing]));
  } catch {
    /* ignore storage errors */
  }
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
