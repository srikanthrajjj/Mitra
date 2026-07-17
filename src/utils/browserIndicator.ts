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

function createCompleteFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Green rounded square background (like Mitra logo style)
  const radius = 8;
  ctx.beginPath();
  ctx.roundRect(2, 2, 28, 28, radius);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();

  // Inner green shape
  ctx.beginPath();
  ctx.roundRect(5, 5, 22, 22, 6);
  const gradient = ctx.createLinearGradient(5, 5, 27, 27);
  gradient.addColorStop(0, '#32d74b');
  gradient.addColorStop(1, '#28a745');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Blue notification dot
  ctx.beginPath();
  ctx.arc(24, 8, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#007bff';
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
    document.title = DEFAULT_TITLE;
    link.href = createTransparentFavicon();
  } else {
    document.title = DEFAULT_TITLE;
    link.href = createCompleteFavicon();

    completionTimer = setTimeout(() => {
      link.href = originalFaviconHref!;
      completionTimer = null;
    }, 3000);
  }
}
