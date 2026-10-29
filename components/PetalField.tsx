"use client";

import { useEffect, useRef } from "react";
import { petalStore } from "@/lib/petalStore";
import { useIsMobile, useReducedMotion } from "@/hooks/useEnv";

const COLORS = ["#f4b6c2", "#f9d3da", "#e98fa4", "#fde7df", "#f7c9a8", "#ffffff", "#d9b3e0", "#f2a7b5"];

function makeSprite(color: string, blur = 0) {
  const c = document.createElement("canvas");
  c.width = 72;
  c.height = 92;
  const g = c.getContext("2d")!;
  if (blur) g.filter = `blur(${blur}px)`;
  g.translate(4, 4);
  const grad = g.createLinearGradient(32, 82, 32, 0);
  grad.addColorStop(0, shade(color, -0.22));
  grad.addColorStop(0.45, color);
  grad.addColorStop(1, shade(color, 0.22));
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(32, 82);
  g.bezierCurveTo(4, 64, -6, 20, 30, 2);
  g.bezierCurveTo(36, 0, 40, 1, 44, 4);
  g.bezierCurveTo(70, 22, 66, 62, 32, 82);
  g.fill();
  g.filter = "none";
  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(32, 76);
  g.quadraticCurveTo(33, 40, 33, 10);
  g.stroke();
  return c;
}
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(Math.min(255, Math.max(0, amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

interface P {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  flip: number;
  vf: number;
  ci: number;
  ph: number;
  life: number; // <0 = permanent
}

interface Props {
  /** "front" is drawn above content, "back" lives behind a bouquet */
  count?: number;
  mobileCount?: number;
  className?: string;
  opacity?: number;
  /** keep petals away from the middle where text sits */
  avoidCentre?: boolean;
  respondToScroll?: boolean;
}

export default function PetalField({
  count = 24,
  mobileCount = 10,
  className = "",
  opacity = 1,
  avoidCentre = false,
  respondToScroll = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const parent = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const n = mobile ? mobileCount : count;
    const sprites = COLORS.map((c) => makeSprite(c));
    const soft = COLORS.map((c) => makeSprite(c, 2.2));
    let W = 1;
    let H = 1;
    let dpr = 1;
    const resize = () => {
      const r = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const spawnX = () => {
      let x = Math.random() * W;
      if (avoidCentre && Math.random() < 0.6) {
        x = Math.random() < 0.5 ? Math.random() * W * 0.28 : W - Math.random() * W * 0.28;
      }
      return x;
    };
    const make = (initial: boolean): P => {
      const z = 0.2 + Math.pow(Math.random(), 1.4) * 0.8;
      return {
        x: spawnX(),
        y: initial ? Math.random() * H : -60 - Math.random() * 200,
        z,
        vx: (Math.random() - 0.4) * 12,
        vy: 0,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 1.6,
        flip: Math.random() * 6.28,
        vf: 0.8 + Math.random() * 2.2,
        ci: Math.floor(Math.random() * COLORS.length),
        ph: Math.random() * 6.28,
        life: -1,
      };
    };
    const ps: P[] = Array.from({ length: n }, () => make(true));

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(parent);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const rect = canvas.getBoundingClientRect();
      const mx = petalStore.mouseX - rect.left;
      const my = petalStore.mouseY - rect.top;
      const sv = respondToScroll ? petalStore.scrollV : 0;
      const sw = petalStore.swirl;

      // spawn queued bursts (from the blooming scene)
      while (petalStore.burstQueue.length) {
        const b = petalStore.burstQueue.shift()!;
        for (let i = 0; i < b.n && ps.length < n + 34; i++) {
          const p = make(false);
          const a = Math.random() * Math.PI * 2;
          const sp = 80 + Math.random() * 240;
          p.x = b.x * W;
          p.y = b.y * H;
          p.z = 0.5 + Math.random() * 0.5;
          p.vx = Math.cos(a) * sp;
          p.vy = Math.sin(a) * sp - 60;
          p.life = 5 + Math.random() * 3;
          ps.push(p);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        const gust = Math.sin(t * 0.35 + p.y * 0.004) * 22 + Math.sin(t * 0.9 + p.ph) * 10;
        const targetVx = (gust + 12) * p.z;
        const fall = (26 + 70 * p.z) * (1 + Math.min(2.2, Math.abs(sv) / 900));
        p.vx += (targetVx - p.vx) * Math.min(1, dt * 0.9);
        p.vy += (fall - p.vy) * Math.min(1, dt * 0.8);

        if (sw > 0.01) {
          const dx = p.x - petalStore.cx * W;
          const dy = p.y - petalStore.cy * H;
          const d = Math.hypot(dx, dy) + 40;
          const k = (sw * 520) / d;
          p.vx += (-dy / d) * k * dt * 60;
          p.vy += (dx / d) * k * dt * 60;
          // gently pull inward so petals keep circling
          p.vx -= (dx / d) * sw * 14 * dt * 60;
          p.vy -= (dy / d) * sw * 8 * dt * 60;
        }
        // cursor: a soft push
        const ddx = p.x - mx;
        const ddy = p.y - my;
        const dd = Math.hypot(ddx, ddy);
        if (dd < 130) {
          const f = (1 - dd / 130) * 420 * p.z;
          p.vx += (ddx / (dd + 1)) * f * dt;
          p.vy += (ddy / (dd + 1)) * f * dt;
        }

        p.x += p.vx * dt;
        p.y += (p.vy - sv * 0.32 * p.z) * dt;
        p.rot += p.vr * dt + p.vx * 0.0015 * dt;
        p.flip += p.vf * dt;

        if (p.life > 0) {
          p.life -= dt;
          if (p.life <= 0) {
            ps.splice(i, 1);
            continue;
          }
        }
        if (p.y > H + 70 || p.y < -400 || p.x < -80 || p.x > W + 80) {
          if (p.life > 0) {
            ps.splice(i, 1);
            continue;
          }
          const q = make(false);
          Object.assign(p, q);
          if (sv < -200) p.y = H + 40;
        }

        const fy = 0.2 + 0.8 * Math.abs(Math.cos(p.flip));
        const s = (0.2 + 0.5 * p.z) * (p.life > 0 ? 0.9 : 1) * (mobile ? 0.85 : 1);
        const cr = Math.cos(p.rot) * s;
        const sr = Math.sin(p.rot) * s;
        const fade = p.life > 0 ? Math.min(1, p.life / 1.5) : 1;
        ctx.globalAlpha = (0.38 + 0.5 * p.z) * fade * opacity;
        ctx.setTransform(dpr * cr, dpr * sr, -dpr * sr * fy, dpr * cr * fy, dpr * p.x, dpr * p.y);
        const img = p.z > 0.85 ? soft[p.ci] : sprites[p.ci];
        ctx.drawImage(img, -36, -46);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [count, mobileCount, mobile, reduced, avoidCentre, opacity, respondToScroll]);

  if (reduced) return null;
  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
