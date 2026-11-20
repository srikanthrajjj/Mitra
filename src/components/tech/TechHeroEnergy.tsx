import { useEffect, useRef } from 'react';

type RGB = [number, number, number];

interface Pulse {
  path: { x: number; y: number }[];
  dx: number;
  dy: number;
  speed: number;
  tail: number;
}

interface Bolt {
  pts: { x: number; y: number }[];
  branch: { x: number; y: number }[];
  born: number;
  life: number;
}

function probe(host: HTMLElement, className: string): RGB {
  const el = document.createElement('span');
  el.className = className;
  el.style.display = 'none';
  host.appendChild(el);
  const rgb = getComputedStyle(el).color.match(/[\d.]+/g)?.map(Number) ?? [79, 207, 54];
  host.removeChild(el);
  return [rgb[0], rgb[1], rgb[2]];
}

/** Jagged lightning polyline by midpoint displacement. */
function bolt(x0: number, y0: number, x1: number, y1: number, rough: number): { x: number; y: number }[] {
  let pts = [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
  ];
  let off = rough;
  for (let i = 0; i < 6; i += 1) {
    const next: { x: number; y: number }[] = [];
    for (let j = 0; j < pts.length - 1; j += 1) {
      const a = pts[j];
      const b = pts[j + 1];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const o = (Math.random() - 0.5) * off;
      next.push(a, { x: mx + (-dy / len) * o, y: my + (dx / len) * o });
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    off *= 0.55;
  }
  return pts;
}

/**
 * Electric background: a faint circuit grid with current pulses racing along its lines
 * (they sometimes turn at junctions), occasional lightning strikes, and extra sparks near
 * the cursor. Canvas 2D, additive glow, paused off-screen, a still grid for reduced motion.
 */
export function TechHeroEnergy({ className }: { className?: string }) {
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
    const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cell = 72;
    const grid = document.createElement('canvas');
    const gridHot = document.createElement('canvas');
    const pulses: Pulse[] = [];
    const bolts: Bolt[] = [];
    const mouse = { x: -9999, y: -9999, active: false, lastSpawn: 0 };

    const drawGrid = (target: HTMLCanvasElement, alpha: number, color: RGB) => {
      target.width = Math.round(w * dpr);
      target.height = Math.round(h * dpr);
      const g = target.getContext('2d');
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.strokeStyle = rgba(color, alpha);
      g.lineWidth = 1;
      g.beginPath();
      for (let x = 0; x <= w; x += cell) {
        g.moveTo(x + 0.5, 0);
        g.lineTo(x + 0.5, h);
      }
      for (let y = 0; y <= h; y += cell) {
        g.moveTo(0, y + 0.5);
        g.lineTo(w, y + 0.5);
      }
      g.stroke();
      // junction dots
      g.fillStyle = rgba(color, alpha * 2.2);
      for (let x = 0; x <= w; x += cell) for (let y = 0; y <= h; y += cell) g.fillRect(x - 1, y - 1, 3, 3);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      cell = w < 640 ? 52 : 72;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      drawGrid(grid, 0.055, fg);
      drawGrid(gridHot, 0.3, green);
    };

    const spawnPulse = (nearX?: number, nearY?: number) => {
      const cols = Math.floor(w / cell);
      const rows = Math.floor(h / cell);
      let gx = Math.floor(Math.random() * (cols + 1)) * cell;
      let gy = Math.floor(Math.random() * (rows + 1)) * cell;
      if (nearX !== undefined && nearY !== undefined) {
        gx = Math.round(nearX / cell) * cell;
        gy = Math.round(nearY / cell) * cell;
      }
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      const [dx, dy] = dirs[Math.floor(Math.random() * 4)];
      pulses.push({
        path: [{ x: gx, y: gy }],
        dx,
        dy,
        speed: 170 + Math.random() * 230,
        tail: 110 + Math.random() * 190,
      });
    };

    const spawnBolt = (now: number) => {
      const x0 = w * (0.12 + Math.random() * 0.76);
      const x1 = w * (0.3 + Math.random() * 0.4);
      const y1 = h * (0.5 + Math.random() * 0.3);
      const pts = bolt(x0, -10, x1, y1, Math.min(w, 900) * 0.2);
      const k = Math.floor(pts.length * (0.3 + Math.random() * 0.4));
      const s = pts[k];
      const side = Math.random() < 0.5 ? -1 : 1;
      const branch = bolt(s.x, s.y, s.x + side * (80 + Math.random() * 160), s.y + 90 + Math.random() * 120, 70);
      bolts.push({ pts, branch, born: now, life: 340 });
    };

    const stepPulse = (p: Pulse, dt: number) => {
      let remaining = p.speed * dt;
      const head = p.path[p.path.length - 1];
      let x = head.x;
      let y = head.y;
      while (remaining > 0) {
        const toNode =
          p.dx !== 0
            ? p.dx > 0
              ? Math.ceil((x + 0.001) / cell) * cell - x
              : x - Math.floor((x - 0.001) / cell) * cell
            : p.dy > 0
              ? Math.ceil((y + 0.001) / cell) * cell - y
              : y - Math.floor((y - 0.001) / cell) * cell;
        const move = Math.min(remaining, toNode);
        x += p.dx * move;
        y += p.dy * move;
        remaining -= move;
        if (move >= toNode - 0.001) {
          p.path.push({ x, y });
          if (Math.random() < 0.28) {
            const sign = Math.random() < 0.5 ? -1 : 1;
            const ndx = p.dy !== 0 ? sign : 0;
            const ndy = p.dx !== 0 ? sign : 0;
            p.dx = ndx;
            p.dy = ndy;
          }
        }
      }
      p.path[p.path.length - 1] = { x, y };
      // trim the path to the tail length
      let len = 0;
      for (let i = p.path.length - 1; i > 0; i -= 1) {
        len += Math.hypot(p.path[i].x - p.path[i - 1].x, p.path[i].y - p.path[i - 1].y);
        if (len > p.tail) {
          p.path.splice(0, i - 1);
          break;
        }
      }
    };

    const drawPulse = (p: Pulse) => {
      const pts = p.path;
      let dist = 0;
      for (let i = pts.length - 1; i > 0; i -= 1) {
        const a = pts[i];
        const b = pts[i - 1];
        const seg = Math.hypot(a.x - b.x, a.y - b.y);
        const t0 = Math.max(0, 1 - dist / p.tail);
        const t1 = Math.max(0, 1 - (dist + seg) / p.tail);
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, rgba(green, 0.85 * t0));
        grad.addColorStop(1, rgba(green, 0.85 * t1));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        dist += seg;
      }
      const hd = pts[pts.length - 1];
      const glow = ctx.createRadialGradient(hd.x, hd.y, 0, hd.x, hd.y, 16);
      glow.addColorStop(0, rgba(green, 0.9));
      glow.addColorStop(1, rgba(green, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(hd.x - 16, hd.y - 16, 32, 32);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillRect(hd.x - 1.5, hd.y - 1.5, 3, 3);
    };

    const drawBolt = (b: Bolt, now: number) => {
      const t = (now - b.born) / b.life;
      if (t >= 1) return false;
      const flick = [1, 0.25, 0.95, 0.35, 0.7, 0.15][Math.min(5, Math.floor(t * 6))];
      const stroke = (pts: { x: number; y: number }[], k: number) => {
        for (const [lw, a, col] of [
          [9, 0.1, green],
          [4, 0.3, green],
          [1.6, 0.95, [235, 255, 235] as RGB],
        ] as const) {
          ctx.strokeStyle = rgba(col as RGB, a * flick * k);
          ctx.lineWidth = lw * (k < 1 ? 0.7 : 1);
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.stroke();
        }
      };
      stroke(b.pts, 1);
      stroke(b.branch, 0.6);
      const end = b.pts[b.pts.length - 1];
      const flash = ctx.createRadialGradient(end.x, end.y, 0, end.x, end.y, 120);
      flash.addColorStop(0, rgba(green, 0.28 * flick));
      flash.addColorStop(1, rgba(green, 0));
      ctx.fillStyle = flash;
      ctx.fillRect(end.x - 120, end.y - 120, 240, 240);
      return true;
    };

    let raf = 0;
    let visible = false;
    let last = performance.now();
    let nextBolt = last + 1800;
    let nextPulse = last;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(grid, 0, 0, w, h);
      if (mouse.active) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 210, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(gridHot, 0, 0, w, h);
        ctx.restore();
      }

      if (now > nextPulse && pulses.length < 18) {
        spawnPulse();
        nextPulse = now + 160 + Math.random() * 260;
      }
      if (mouse.active && now - mouse.lastSpawn > 150 && pulses.length < 26) {
        spawnPulse(mouse.x + (Math.random() - 0.5) * 220, mouse.y + (Math.random() - 0.5) * 220);
        mouse.lastSpawn = now;
      }
      if (now > nextBolt) {
        spawnBolt(now);
        nextBolt = now + 2600 + Math.random() * 3200;
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const p = pulses[i];
        stepPulse(p, dt);
        drawPulse(p);
        const hd = p.path[p.path.length - 1];
        if (hd.x < -cell || hd.x > w + cell || hd.y < -cell || hd.y > h + cell) pulses.splice(i, 1);
      }
      for (let i = bolts.length - 1; i >= 0; i -= 1) if (!drawBolt(bolts[i], now)) bolts.splice(i, 1);
      ctx.globalCompositeOperation = 'source-over';

      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(grid, 0, 0, w, h);
      }
    });
    ro.observe(host);
    resize();
    if (reduced) ctx.drawImage(grid, 0, 0, w, h);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(host);

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={hostRef} className={className} aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
