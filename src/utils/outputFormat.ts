import { ArtifactStatus } from '../types';

const STATUS_LABELS: Record<ArtifactStatus, string> = {
  not_started: 'Draft',
  draft: 'Draft',
  pending: 'Draft',
  in_review: 'In Review',
  approved: 'Approved',
};

export function formatArtifactStatusLabel(
  status: ArtifactStatus,
  locked = false,
): string {
  if (locked) return 'Locked';
  return STATUS_LABELS[status] ?? 'Draft';
}

export function formatArtifactHeader(params: {
  name: string;
  version?: string;
  updatedAt?: string;
  status: ArtifactStatus;
  locked?: boolean;
}): string {
  const date = params.updatedAt
    ? new Date(params.updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  const version = params.version ?? 'v1.0';
  const statusLabel = formatArtifactStatusLabel(params.status, params.locked);

  return [
    `## ${params.name}`,
    '',
    `**Version:** ${version} · **Date:** ${date} · **Status:** ${statusLabel}`,
    '',
  ].join('\n');
}

export function formatNumberedSection(title: string, items: string[]): string {
  const body = items.map((item, i) => `${i + 1}. ${item}`).join('\n');
  return [`### ${title}`, '', body, ''].join('\n');
}

/** Conversational status replies: ≤4 sentences, one question max, action-oriented ending. */
export function formatConversationalStatus(lines: string[], closingQuestion?: string): string {
  const trimmed = lines.filter(Boolean).slice(0, 4);
  if (closingQuestion) {
    trimmed.push(closingQuestion);
  }
  return trimmed.join(' ');
}
