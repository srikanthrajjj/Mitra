const SIGNUP_SEGMENTS = new Set(['signup', 'sign-up']);

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  return trimmed.toLowerCase();
}

export function isSignupPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (SIGNUP_SEGMENTS.has(normalized.replace(/^\//, ''))) return true;
  return [...SIGNUP_SEGMENTS].some((segment) => normalized.endsWith(`/${segment}`));
}

export function navigateToSignupUrl(): void {
  const base = import.meta.env.BASE_URL || '/';
  const signupPath = base.endsWith('/') ? `${base}signup` : `${base}/signup`;
  if (!isSignupPath(window.location.pathname)) {
    window.history.pushState(null, '', signupPath);
  }
}

export function leaveSignupUrl(): void {
  if (isSignupPath(window.location.pathname)) {
    const base = import.meta.env.BASE_URL || '/';
    window.history.replaceState(null, '', base);
  }
}
