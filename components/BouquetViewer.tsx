"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import gsap from "gsap";
import { BouquetStage } from "@/lib/three/stage";
import type { BouquetConfig } from "@/lib/three/types";
import { buildExtras, type ExtrasSpec } from "@/lib/three/gifts";
import { useIsMobile, useReducedMotion } from "@/hooks/useEnv";

export interface ViewerHandle {
  setView: (yaw: number, pitch?: number) => void;
  reset: () => void;
}

interface Props {
  config: BouquetConfig;
  className?: string;
  autoRotate?: boolean;
  fill?: number;
  mood?: number;
  bloom?: number;
  /** draw soft glow behind */
  label?: string;
  initialYaw?: number;
  /** teddies & balloons shown beside the bouquet */
  extras?: ExtrasSpec | null;
}

/**
 * A self-contained live 3D bouquet: drag to rotate (touch friendly — vertical
 * swipes still scroll the page), gentle auto-rotation, pauses off-screen.
 */
const BouquetViewer = forwardRef<ViewerHandle, Props>(function BouquetViewer(
  { config, className = "", autoRotate = true, fill = 0.8, mood = 0, bloom = 0.95, label, initialYaw = -0.3, extras = null },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<BouquetStage | null>(null);
  const configRef = useRef(config);
  const state = useRef({ dragging: false, vel: 0, auto: autoRotate, visible: true, yaw: initialYaw, pitch: 0 });
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState(false);

  state.current.auto = autoRotate && !reduced;
  configRef.current = config;

  const doReset = () => {
    const st = state.current;
    const o = { yaw: st.yaw, pitch: st.pitch };
    gsap.to(o, {
      yaw: initialYaw,
      pitch: 0,
      duration: 0.9,
      ease: "power3.inOut",
      onUpdate: () => {
        st.yaw = o.yaw;
        st.pitch = o.pitch;
      },
    });
    st.auto = autoRotate && !reduced;
    setMoved(false);
  };

  useImperativeHandle(ref, () => ({
    setView(yaw, pitch = 0) {
      const st = state.current;
      st.auto = false;
      const o = { yaw: st.yaw, pitch: st.pitch };
      gsap.to(o, {
        yaw,
        pitch,
        duration: 0.9,
        ease: "power3.inOut",
        onUpdate: () => {
          st.yaw = o.yaw;
          st.pitch = o.pitch;
        },
      });
    },
    reset: () => doReset(),
  }));

  useEffect(() => {
    const canvas = canvasRef.current!;
    let stage: BouquetStage;
    try {
      stage = new BouquetStage({ canvas, low: mobile, fill });
    } catch {
      setFailed(true);
      return;
    }
    stageRef.current = stage;
    stage.idle = !reduced;
    stage.pose.bloom = bloom;
    stage.pose.mood = mood;
    stage.setBouquet(configRef.current);
    stage.resize();

    const ro = new ResizeObserver(() => stage.resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (state.current.visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!state.current.visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = state.current;
      if (!st.dragging) {
        if (Math.abs(st.vel) > 0.0001) {
          st.yaw += st.vel;
          st.vel *= 0.94;
        } else if (st.auto) {
          st.yaw += dt * 0.28;
        }
      }
      stage.pose.rotY = st.yaw;
      stage.pose.rotX = st.pitch;
      stage.render(dt);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      stage.dispose();
      stageRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile, reduced]);

  // rebuild when the configuration changes
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    const id = window.setTimeout(() => s.setBouquet(config), 30);
    return () => clearTimeout(id);
  }, [config]);

  const extrasKey = extras && (extras.teddies.length || extras.balloons.length) ? JSON.stringify(extras) : "";
  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    if (!extrasKey) {
      s.setExtras(null);
      return;
    }
    const id = window.setTimeout(() => s.setExtras(buildExtras(JSON.parse(extrasKey) as ExtrasSpec, "preview")), 30);
    return () => clearTimeout(id);
  }, [extrasKey, mobile, reduced]);

  useEffect(() => {
    const s = stageRef.current;
    if (!s) return;
    s.pose.mood = mood;
    s.pose.bloom = bloom;
  }, [mood, bloom]);

  // pointer drag
  const onDown = (e: React.PointerEvent) => {
    const st = state.current;
    st.dragging = true;
    st.vel = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
    lastX.current = e.clientX;
    lastY.current = e.clientY;
  };
  const lastX = useRef(0);
  const lastY = useRef(0);
  const onMove = (e: React.PointerEvent) => {
    const st = state.current;
    if (!st.dragging) return;
    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    st.yaw += dx * 0.011;
    st.vel = dx * 0.0035;
    st.pitch = Math.max(-0.35, Math.min(0.7, st.pitch + dy * 0.004));
    if (!moved) setMoved(true);
  };
  const onUp = () => {
    state.current.dragging = false;
  };

  if (failed) {
    return (
      <div className={`grid place-items-center text-center text-sm text-ink-soft ${className}`}>
        3D preview isn’t supported on this device.
      </div>
    );
  }
  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label ?? "Interactive 3D bouquet. Drag to rotate."}
        className="h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") state.current.yaw -= 0.2;
          if (e.key === "ArrowRight") state.current.yaw += 0.2;
        }}
        tabIndex={0}
      />
      {moved && (
        <button
          type="button"
          onClick={doReset}
          className="chip absolute bottom-2 right-2 text-[0.7rem] uppercase tracking-[0.16em]"
        >
          Reset view
        </button>
      )}
    </div>
  );
});

export default BouquetViewer;
