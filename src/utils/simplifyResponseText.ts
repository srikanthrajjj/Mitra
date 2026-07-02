import { stripSimulationDisclaimer } from '../constants/simulation';

/** Light cleanup — keep substance, strip only legacy label/arrow formatting. */
export function simplifyResponseText(text: string): string {
  if (!text?.trim()) return text;

  text = stripSimulationDisclaimer(text);
  if (!text.trim()) return text;

  const lines = text.split('\n');
  const out: string[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      continue;
    }

    // Legacy label lines only — keep bullets, numbers, headers, tables
    const kv = trimmed.match(/^\*\*([^*]+)\*\*\s*[—\-]\s*(.+)$/);
    if (kv) {
      const key = kv[1].trim();
      const val = kv[2].trim();
      const skipKey = /^(status|stage|solution|sector|table|engine|change|workspace)$/i.test(key);
      out.push(skipKey ? val : `${key}: ${val}`);
      continue;
    }

    const next =
      trimmed.match(/^→\s*(.+)$/) ||
      trimmed.match(/^\*\*Next\*\*\s*[:\-—]?\s*(.+)$/i) ||
      trimmed.match(/^Next\s*[:\-—]\s*(.+)$/i);
    if (next) {
      out.push(next[1].trim());
      continue;
    }

    out.push(line);
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
