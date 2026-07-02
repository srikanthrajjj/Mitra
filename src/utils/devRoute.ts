export function isDevSpecsPath(pathname: string): boolean {
  return pathname === '/dev' || pathname.endsWith('/dev');
}

export function readDevSpecsTabFromUrl(): 'dev-specs' | null {
  if (typeof window === 'undefined') return null;
  const { pathname } = window.location;
  if (isDevSpecsPath(pathname)) return 'dev-specs';
  return null;
}

export function navigateToDevSpecsUrl(): void {
  if (!isDevSpecsPath(window.location.pathname)) {
    window.history.pushState(null, '', '/dev');
  }
}

export function leaveDevSpecsUrl(): void {
  if (isDevSpecsPath(window.location.pathname)) {
    const base = import.meta.env.BASE_URL || '/';
    window.history.replaceState(null, '', base);
  }
}
