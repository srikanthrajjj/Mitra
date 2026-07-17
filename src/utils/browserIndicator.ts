const DEFAULT_TITLE = 'Mitra';

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
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#32d74b';
  ctx.fill();

  return canvas.toDataURL('image/png');
}

function createThinkingFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const dotRadius = 4;
  const dotY = 16;
  const positions = [9, 16, 23];

  positions.forEach((x, i) => {
    ctx.beginPath();
    ctx.arc(x, dotY, dotRadius, 0, Math.PI * 2);
    const opacity = blinkVisible ? (0.4 + (i * 0.2)) : (0.8 - (i * 0.2));
    ctx.fillStyle = `rgba(50, 215, 75, ${opacity})`;
    ctx.fill();
  });

  return canvas.toDataURL('image/png');
}

function startThinking() {
  const link = getFaviconLink();
  if (!link) return;

  stopThinking();

  blinkInterval = setInterval(() => {
    link.href = createThinkingFavicon();
    blinkVisible = !blinkVisible;
  }, 500);
}

function stopThinking() {
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
    document.title = DEFAULT_TITLE;
    startThinking();
  } else {
    stopThinking();
    document.title = DEFAULT_TITLE;
    link.href = createGreenDotFavicon();

    completionTimer = setTimeout(() => {
      link.href = originalFaviconHref!;
      completionTimer = null;
    }, 3000);
  }
}
