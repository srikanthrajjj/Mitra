import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Domain-warped flow field rendered as thin luminous contour lines.
const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform vec3 uColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.02 + 7.3;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 1.5;
  float t = uTime * 0.05;

  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.2;
  float md = length(p - m);
  p += (p - m) * 0.18 * exp(-md * 2.2);

  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 1.2));
  float f = fbm(p + 3.0 * r);

  float bands = abs(fract(f * 9.0) - 0.5);
  float line = smoothstep(0.022, 0.0, bands - 0.008);

  float vignette = smoothstep(1.25, 0.15, length(uv - vec2(0.5, 0.45)));
  float glow = smoothstep(0.9, 0.0, md) * 0.35;
  // Keep the text column calm: fade the field toward the left and bottom.
  float textMask = mix(0.18, 1.0, smoothstep(0.25, 0.85, uv.x));
  float a = (line * 0.42 + glow * line) * vignette * textMask;

  gl_FragColor = vec4(uColor * a, a);
}
`;

function readBrandColor(el: HTMLElement): [number, number, number] {
  const probe = document.createElement('span');
  probe.className = 'text-brand-green';
  probe.style.display = 'none';
  el.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)?.map(Number) ?? [79, 207, 54];
  el.removeChild(probe);
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

export function TechHeroField({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, dpr: Math.min(window.devicePixelRatio, 1.5) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    host.appendChild(gl.canvas);
    gl.canvas.style.cssText = 'width:100%;height:100%;display:block';

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0.5, 0.5] },
        uColor: { value: readBrandColor(host) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const target = [0.5, 0.5];
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      target[0] = (e.clientX - rect.left) / rect.width;
      target[1] = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const frame = (now: number) => {
      const mouse = program.uniforms.uMouse.value as number[];
      mouse[0] += (target[0] - mouse[0]) * 0.06;
      mouse[1] += (target[1] - mouse[1]) * 0.06;
      program.uniforms.uTime.value = (now - start) / 1000;
      renderer.render({ scene: mesh });
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };
    frame(performance.now());

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    });
    io.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      host.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden />;
}
