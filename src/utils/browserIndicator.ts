const DEFAULT_TITLE = 'Mitra';

let originalFaviconHref: string | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;

function getFaviconLink(): HTMLLinkElement | null {
  return document.querySelector('link[rel="icon"]');
}

function createTransparentFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  return canvas.toDataURL('image/png');
}

export function setRunningIndicator(isRunning: boolean) {
  const link = getFaviconLink();
  if (!link) return;

  if (!originalFaviconHref) {
    originalFaviconHref = link.href;
  }

  if (completionTimer) {
    clearTimeout(completionTimer);
    completionTimer = null;
  }

  if (isRunning) {
    document.title = DEFAULT_TITLE;
    link.href = createTransparentFavicon();
  } else {
    document.title = DEFAULT_TITLE;
    link.href = originalFaviconHref!;

    completionTimer = setTimeout(() => {
      completionTimer = null;
    }, 3000);
  }
}
