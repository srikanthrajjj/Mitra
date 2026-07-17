const DEFAULT_TITLE = 'Mitra';

let originalFaviconHref: string | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;

function getFaviconLink(): HTMLLinkElement | null {
  return document.querySelector('link[rel="icon"]');
}

function createGreenDotFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#32d74b';
  ctx.fill();

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
    document.title = `${DEFAULT_TITLE}`;
    link.href = originalFaviconHref;
  } else {
    document.title = `${DEFAULT_TITLE}`;
    link.href = createGreenDotFavicon();

    completionTimer = setTimeout(() => {
      document.title = DEFAULT_TITLE;
      link.href = originalFaviconHref!;
      completionTimer = null;
    }, 3000);
  }
}
