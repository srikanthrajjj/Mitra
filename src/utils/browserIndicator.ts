const DEFAULT_TITLE = 'Mitra';
const COMPLETED_CHECK = '\u2713 '; // checkmark character

let originalFaviconHref: string | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;

function getFaviconLink(): HTMLLinkElement | null {
  return document.querySelector('link[rel="icon"]');
}

function createCheckmarkFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Green circle background
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#32d74b';
  ctx.fill();

  // White checkmark
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(10, 16);
  ctx.lineTo(14, 20);
  ctx.lineTo(22, 12);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

export function setRunningIndicator(isRunning: boolean) {
  const link = getFaviconLink();
  if (!link) return;

  if (!originalFaviconHref) {
    originalFaviconHref = link.href;
  }

  // Clear any pending completion timer
  if (completionTimer) {
    clearTimeout(completionTimer);
    completionTimer = null;
  }

  if (isRunning) {
    // Running state: show spinning indicator
    document.title = `${DEFAULT_TITLE}`;
    link.href = originalFaviconHref;
  } else {
    // Completed: show checkmark for 3 seconds
    document.title = `${COMPLETED_CHECK}${DEFAULT_TITLE}`;
    link.href = createCheckmarkFavicon();

    completionTimer = setTimeout(() => {
      document.title = DEFAULT_TITLE;
      link.href = originalFaviconHref!;
      completionTimer = null;
    }, 3000);
  }
}
