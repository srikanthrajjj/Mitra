export function isStyleguidePath(pathname: string): boolean {
  return pathname === '/styleguide' || pathname.endsWith('/styleguide');
}

export function readStyleguideTabFromUrl(): 'styleguide' | null {
  if (typeof window === 'undefined') return null;
  const { pathname, hash } = window.location;
  if (isStyleguidePath(pathname)) return 'styleguide';
  if (hash === '#styleguide') return 'styleguide';
  return null;
}

export function navigateToStyleguideUrl(): void {
  if (!isStyleguidePath(window.location.pathname)) {
    window.history.pushState(null, '', '/styleguide');
  }
}

export function leaveStyleguideUrl(): void {
  if (isStyleguidePath(window.location.pathname)) {
    const base = import.meta.env.BASE_URL || '/';
    window.history.replaceState(null, '', base);
  }
}
