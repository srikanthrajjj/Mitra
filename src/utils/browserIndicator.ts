const DEFAULT_TITLE = 'Mitra';

let originalFaviconHref: string | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;
let notificationsEnabled = false;

function getFaviconLink(): HTMLLinkElement | null {
  return document.querySelector('link[rel="icon"]');
}

function createTransparentFavicon(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  return canvas.toDataURL('image/png');
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

function sendCompletionNotification() {
  if (!notificationsEnabled) return;
  if (Notification.permission !== 'granted') return;

  new Notification('Mitra', {
    body: 'Task completed! Click to view.',
    icon: '/favicon.png',
  });
}

export function setNotificationsEnabled(enabled: boolean) {
  notificationsEnabled = enabled;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
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
    link.href = createGreenDotFavicon();
    sendCompletionNotification();

    completionTimer = setTimeout(() => {
      link.href = originalFaviconHref!;
      completionTimer = null;
    }, 3000);
  }
}
