const TECH_SEGMENTS = new Set(['technology', 'tech']);

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  return trimmed.toLowerCase();
}

export function isTechPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (TECH_SEGMENTS.has(normalized.replace(/^\//, ''))) return true;
  return [...TECH_SEGMENTS].some((segment) => normalized.endsWith(`/${segment}`));
}
