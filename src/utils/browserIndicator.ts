const DEFAULT_TITLE = 'Mitra';
const RUNNING_PREFIX = '\u25CF '; // green dot
const COMPLETED_CHECK = '\u2713 '; // checkmark

let originalFaviconHref: string | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;
let blinkInterval: ReturnType<typeof setInterval> | null = null;
let blinkVisible = true;

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

function createCheckmarkFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#32d74b';
  ctx.fill();

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

function createTransparentFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  return canvas.toDataURL('image/png');
}

function startBlinking() {
  const link = getFaviconLink();
  if (!link) return;

  stopBlinking();
  const greenDot = createGreenDotFavicon();
  const transparent = createTransparentFavicon();

  blinkInterval = setInterval(() => {
    link.href = blinkVisible ? greenDot : transparent;
    blinkVisible = !blinkVisible;
  }, 800);
}

function stopBlinking() {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
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
    // In progress: blinking green dot + title
    document.title = `${RUNNING_PREFIX}${DEFAULT_TITLE}`;
    startBlinking();
  } else {
    // Complete: stop blinking, hide favicon, checkmark in title
    stopBlinking();
    document.title = `${COMPLETED_CHECK}${DEFAULT_TITLE}`;
    link.href = createTransparentFavicon();

    completionTimer = setTimeout(() => {
      document.title = DEFAULT_TITLE;
      link.href = originalFaviconHref!;
      completionTimer = null;
    }, 3000);
  }
}
