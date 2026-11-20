import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** Resolve a theme colour (as rgb triplet) by probing a token-classed element. */
function probe(host: HTMLElement, className: string): [number, number, number] {
  const el = document.createElement('span');
  el.className = className;
  el.style.display = 'none';
  host.appendChild(el);
  const rgb = getComputedStyle(el).color.match(/[\d.]+/g)?.map(Number) ?? [255, 255, 255];
  host.removeChild(el);
  return [rgb[0], rgb[1], rgb[2]];
}

/**
 * Agent network: drifting nodes link to their neighbours, the cursor bends the mesh,
 * and a "lifecycle wave" sweeps left to right lighting nodes as it passes (Define to
 * Deploy). Canvas 2D, DPR capped, paused off-screen, static frame for reduced motion.
 */
export function TechAgentMesh({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const green = probe(host, 'text-brand-green');
    const fg = probe(host, 'text-foreground');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const LINK = 150;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(26, Math.min(90, Math.round((w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.2 + Math.random() * 1.6,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      // Wave position: sweeps across, then rests briefly before repeating.
      const cycle = 7000;
      const phase = (t % cycle) / cycle;
      const waveX = phase < 0.8 ? (phase / 0.8) * (w + 360) - 180 : -9999;

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
          if (mouse.active) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < 170 && d > 0.1) {
              const f = (1 - d / 170) * 0.9;
              n.x += (dx / d) * f;
              n.y += (dy / d) * f;
            }
          }
        }
      }

      const lit = (x: number) => Math.max(0, 1 - Math.abs(x - waveX) / 180);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK) continue;
          const base = (1 - d / LINK) * 0.22;
          const glow = Math.max(lit(a.x), lit(b.x));
          const mix = glow > 0.05 ? green : fg;
          ctx.strokeStyle = `rgba(${mix[0]},${mix[1]},${mix[2]},${base + glow * 0.55 * (1 - d / LINK)})`;
          ctx.lineWidth = glow > 0.05 ? 1.1 : 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        if (mouse.active) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < 190) {
            ctx.strokeStyle = `rgba(${green[0]},${green[1]},${green[2]},${(1 - d / 190) * 0.7})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const g = lit(n.x);
        const col = g > 0.05 ? green : fg;
        const alpha = 0.35 + g * 0.65;
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + g * 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (g > 0.4) {
          ctx.strokeStyle = `rgba(${green[0]},${green[1]},${green[2]},${(g - 0.4) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 5 + g * 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    let raf = 0;
    let visible = false;
    const frame = (t: number) => {
      draw(t);
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    ro.observe(host);
    resize();
    draw(0);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    });
    io.observe(host);

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={hostRef} className={className} aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
