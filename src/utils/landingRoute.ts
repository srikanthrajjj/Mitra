export function isLandingPath(pathname: string): boolean {
  return pathname === '/landing' || pathname.endsWith('/landing');
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