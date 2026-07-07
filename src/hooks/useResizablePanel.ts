import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';

export type PanelResizeEdge = 'left' | 'right';

export interface PanelResizeConfig {
  storageKey: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  edge: PanelResizeEdge;
  /** Reserve space for other panels + minimum center column when computing max width */
  reservedWidth?: number;
}

export const LEFT_SIDEBAR_WIDTH_KEY = 'mitra_left_sidebar_width';
export const LEFT_SIDEBAR_COLLAPSED_KEY = 'mitra_left_sidebar_collapsed';
export const LEFT_SIDEBAR_COLLAPSED_WIDTH = 48;
export const LEFT_SIDEBAR_DEFAULT_WIDTH = 256;
export const LEFT_SIDEBAR_MIN_WIDTH = 200;
export const LEFT_SIDEBAR_MAX_WIDTH = 400;

export const ARTIFACT_PANEL_WIDTH_KEY = 'mitra_artifact_panel_width';
export const ARTIFACT_PANEL_COLLAPSED_KEY = 'mitra_artifact_panel_collapsed';
export const ARTIFACT_PANEL_COLLAPSED_WIDTH = 44;
export const ARTIFACT_PANEL_DEFAULT_WIDTH = 360;
export const ARTIFACT_PANEL_MIN_WIDTH = 320;
export const ARTIFACT_PANEL_MAX_WIDTH = 500;

const MIN_CENTER_COLUMN_WIDTH = 320;

export const LEFT_SIDEBAR_PANEL_CONFIG: PanelResizeConfig = {
  storageKey: LEFT_SIDEBAR_WIDTH_KEY,
  defaultWidth: LEFT_SIDEBAR_DEFAULT_WIDTH,
  minWidth: LEFT_SIDEBAR_MIN_WIDTH,
  maxWidth: LEFT_SIDEBAR_MAX_WIDTH,
  edge: 'right',
  reservedWidth: ARTIFACT_PANEL_MIN_WIDTH + MIN_CENTER_COLUMN_WIDTH,
};

export const ARTIFACT_PANEL_CONFIG: PanelResizeConfig = {
  storageKey: ARTIFACT_PANEL_WIDTH_KEY,
  defaultWidth: ARTIFACT_PANEL_DEFAULT_WIDTH,
  minWidth: ARTIFACT_PANEL_MIN_WIDTH,
  maxWidth: ARTIFACT_PANEL_MAX_WIDTH,
  edge: 'left',
  reservedWidth: LEFT_SIDEBAR_MIN_WIDTH + MIN_CENTER_COLUMN_WIDTH,
};

function getViewportMax(config: PanelResizeConfig, companionWidth = 0): number {
  if (typeof window === 'undefined') return config.maxWidth;
  const reserved = config.reservedWidth ?? MIN_CENTER_COLUMN_WIDTH;
  const viewportCap = Math.floor(window.innerWidth * (config.edge === 'right' ? 0.35 : 0.45));
  const available = Math.max(
    config.minWidth,
    window.innerWidth - reserved - companionWidth,
  );
  return Math.min(config.maxWidth, viewportCap, available);
}

export function clampPanelWidth(
  width: number,
  config: PanelResizeConfig,
  companionWidth = 0,
): number {
  const max = getViewportMax(config, companionWidth);
  return Math.min(max, Math.max(config.minWidth, width));
}

export function clampLeftSidebarWidth(width: number, companionWidth = 0): number {
  return clampPanelWidth(width, LEFT_SIDEBAR_PANEL_CONFIG, companionWidth);
}

export function clampArtifactPanelWidth(width: number, companionWidth = 0): number {
  return clampPanelWidth(width, ARTIFACT_PANEL_CONFIG, companionWidth);
}

export function readArtifactPanelCollapsed(): boolean {
  try {
    return localStorage.getItem(ARTIFACT_PANEL_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function readLeftSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(LEFT_SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function readStoredWidth(config: PanelResizeConfig, companionWidth = 0): number {
  try {
    const raw = localStorage.getItem(config.storageKey);
    if (raw !== null) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return clampPanelWidth(parsed, config, companionWidth);
    }
  } catch {
    /* ignore storage errors */
  }
  return config.defaultWidth;
}

export function useResizablePanel(
  config: PanelResizeConfig = ARTIFACT_PANEL_CONFIG,
  companionWidth = 0,
) {
  const companionRef = useRef(companionWidth);
  companionRef.current = companionWidth;

  const [width, setWidth] = useState(() => readStoredWidth(config, companionWidth));
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const widthRef = useRef(width);

  widthRef.current = width;

  const clamp = useCallback(
    (value: number) => clampPanelWidth(value, config, companionRef.current),
    [config],
  );

  const persistWidth = useCallback(
    (nextWidth: number) => {
      try {
        localStorage.setItem(config.storageKey, String(nextWidth));
      } catch {
        /* ignore storage errors */
      }
    },
    [config.storageKey],
  );

  const startResize = useCallback((clientX: number) => {
    dragRef.current = { startX: clientX, startWidth: widthRef.current };
    setIsResizing(true);
  }, []);

  useEffect(() => {
    setWidth((current) => clamp(current));
  }, [companionWidth, clamp]);

  useEffect(() => {
    if (!isResizing) return;

    const onMove = (clientX: number) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta =
        config.edge === 'right' ? clientX - drag.startX : drag.startX - clientX;
      setWidth(clamp(drag.startWidth + delta));
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      onMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) onMove(e.touches[0].clientX);
    };

    const onEnd = () => {
      setIsResizing(false);
      dragRef.current = null;
      persistWidth(widthRef.current);
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [isResizing, config.edge, clamp, persistWidth]);

  useEffect(() => {
    const onWindowResize = () => {
      setWidth((current) => clamp(current));
    };
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, [clamp]);

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      startResize(clientX);
    },
    [startResize],
  );

  return { width, isResizing, handleResizeStart, setWidth };
}
