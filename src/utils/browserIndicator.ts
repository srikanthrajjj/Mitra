const DEFAULT_TITLE = 'Mitra';
const THINKING_DOTS = '\u2022\u2022\u2022'; // ••• thinking dots
const GREEN_DOT = '\u25CF'; // ●

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
    // In progress: thinking dots favicon
    document.title = DEFAULT_TITLE;
    link.href = createThinkingDotsFavicon();
  } else {
    // Complete: green dot favicon for 3 seconds
    document.title = DEFAULT_TITLE;
    link.href = createGreenDotFavicon();

    completionTimer = setTimeout(() => {
      link.href = originalFaviconHref!;
      completionTimer = null;
    }, 3000);
  }
}

function createThinkingDotsFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Three green dots like the design system thinking indicator
  const dotRadius = 4;
  const dotY = 16;
  const positions = [9, 16, 23];

  positions.forEach((x, i) => {
    ctx.beginPath();
    ctx.arc(x, dotY, dotRadius, 0, Math.PI * 2);
    const opacity = 0.4 + (i * 0.3);
    ctx.fillStyle = `rgba(50, 215, 75, ${opacity})`;
    ctx.fill();
  });

  return canvas.toDataURL('image/png');
}
