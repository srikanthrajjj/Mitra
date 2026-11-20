import { useEffect, useRef } from 'react';
import { Camera, Geometry, Program, Renderer, Mesh, Transform } from 'ogl';

const vertex = /* glsl */ `
attribute vec3 position;
attribute float aSeed;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uEnergy;
uniform float uSize;
varying float vDepth;
varying float vSeed;

void main() {
  float theta = atan(position.z, position.x);
  float wob = sin(theta * 3.0 + uTime * (0.7 + uEnergy * 1.6) + aSeed * 6.2831);
  wob += 0.5 * sin(theta * 7.0 - uTime * (1.1 + uEnergy) + aSeed * 12.0);
  vec3 dir = normalize(vec3(position.x, 0.0, position.z));
  vec3 p = position + dir * wob * (0.035 + uEnergy * 0.045);
  p.y += sin(theta * 2.0 + uTime * 0.9 + aSeed * 3.0) * (0.05 + uEnergy * 0.05);

  float a = uTime * (0.18 + uEnergy * 0.35);
  float ca = cos(a), sa = sin(a);
  p = vec3(ca * p.x + sa * p.z, p.y, -sa * p.x + ca * p.z);
  float tilt = 0.9;
  float ct = cos(tilt), st = sin(tilt);
  p = vec3(p.x, ct * p.y - st * p.z, st * p.y + ct * p.z);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = clamp(0.5 - mv.z * 0.0 + p.z * 0.45, 0.15, 1.0);
  vSeed = aSeed;
  gl_PointSize = uSize * (1.0 + uEnergy * 0.25) * (0.75 + vDepth * 0.6);
  gl_Position = projectionMatrix * mv;
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
varying float vDepth;
varying float vSeed;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.05, d);
  float a = soft * vDepth * (0.55 + 0.45 * vSeed);
  gl_FragColor = vec4(uColor * (0.7 + vDepth * 0.6), a);
}
`;

function brandColor(host: HTMLElement): [number, number, number] {
  const probe = document.createElement('span');
  probe.className = 'text-brand-green';
  probe.style.display = 'none';
  host.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)?.map(Number) ?? [79, 207, 54];
  host.removeChild(probe);
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

interface TechOrbProps {
  /** 0 idle, 1 typing, 2 working. Eased internally. */
  energy: number;
  className?: string;
  /** Point size in CSS px. */
  pointSize?: number;
}

/** Particle ring rendered with WebGL; reacts to the demo state through `energy`. */
export function TechOrb({ energy, className, pointSize = 5 }: TechOrbProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const energyRef = useRef(energy);
  energyRef.current = energy;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    host.appendChild(gl.canvas);
    gl.canvas.style.cssText = 'width:100%;height:100%;display:block';

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 4.2);

    const COUNT = 3200;
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i += 1) {
      const t = (i / COUNT) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 0.16;
      const r = 1 + spread + (Math.random() - 0.5) * 0.04;
      positions[i * 3] = Math.cos(t) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      positions[i * 3 + 2] = Math.sin(t) * r;
      seeds[i] = Math.random();
    }
    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      aSeed: { size: 1, data: seeds },
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0 },
        uSize: { value: pointSize * renderer.dpr },
        uColor: { value: brandColor(host) },
      },
    });
    program.blendFunc = { src: gl.SRC_ALPHA, dst: gl.ONE };
    const scene = new Transform();
    const points = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    points.setParent(scene);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let raf = 0;
    let visible = true;
    let e = 0;
    const start = performance.now();
    const frame = (now: number) => {
      e += (energyRef.current - e) * 0.05;
      program.uniforms.uEnergy.value = e;
      program.uniforms.uTime.value = (now - start) / 1000;
      renderer.render({ scene, camera });
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
      host.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className={className} aria-hidden />;
}
