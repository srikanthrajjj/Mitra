const LANDING_SEGMENTS = new Set(['landing', 'landingpage']);

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  return trimmed.toLowerCase();
}

export function isLandingPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (LANDING_SEGMENTS.has(normalized.replace(/^\//, ''))) return true;
  return [...LANDING_SEGMENTS].some((segment) => normalized.endsWith(`/${segment}`));
}

export function navigateToLandingUrl(): void {
  const base = import.meta.env.BASE_URL || '/';
  const landingPath = base.endsWith('/') ? `${base}landing` : `${base}/landing`;
  if (!isLandingPath(window.location.pathname)) {
    window.history.pushState(null, '', landingPath);
  }
}

export function leaveLandingUrl(): void {
  if (isLandingPath(window.location.pathname)) {
    const base = import.meta.env.BASE_URL || '/';
    window.history.replaceState(null, '', base);
  }
}
