/* eslint-disable @next/next/no-img-element -- images are runtime-rendered data URLs */
"use client";

import { useEffect, useRef, useState } from "react";
import { snapshotBalloon, snapshotBloom, snapshotBouquet, snapshotToy } from "@/lib/three/snapshot";
import type { BalloonModel, ToyModel } from "@/data/catalog";
import type { BouquetConfig, FlowerKind, PaletteId } from "@/lib/three/types";

function useSnap(key: string, make: () => Promise<string>, enabled = true) {
  const [src, setSrc] = useState<string | null>(null);
  const [near, setNear] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  // only start the (WebGL) render once the image is close to the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el || near || !enabled) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "700px 400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, src, enabled]);

  useEffect(() => {
    if (!near || !enabled) return;
    let alive = true;
    make()
      .then((s) => alive && setSrc(s))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, near, enabled]);
  return { src, ref };
}

const fade = (loaded: boolean) =>
  `transition-all duration-700 ease-out ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`;

export function BouquetPhoto({
  config,
  yaw = -0.25,
  pitch = 0,
  className = "",
  alt,
  w = 520,
  h = 660,
  enabled = true,
}: {
  config: BouquetConfig;
  yaw?: number;
  pitch?: number;
  className?: string;
  alt: string;
  w?: number;
  h?: number;
  enabled?: boolean;
}) {
  const { src, ref } = useSnap(`${JSON.stringify(config)}|${yaw}|${pitch}`, () => snapshotBouquet(config, { yaw, pitch, w, h }), enabled);
  return src ? (
    <img src={src} alt={alt} draggable={false} className={`${className} ${fade(true)}`} />
  ) : (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`${className} ${fade(false)}`} aria-hidden />
  );
}

export function BloomPhoto({
  kind,
  palette,
  className = "",
  alt,
  size = 520,
  tilt = 0.9,
}: {
  kind: FlowerKind;
  palette: PaletteId;
  className?: string;
  alt: string;
  size?: number;
  tilt?: number;
}) {
  const { src, ref } = useSnap(`${kind}|${palette}|${tilt}`, () => snapshotBloom(kind, palette, { w: size, h: size, tilt }));
  return src ? (
    <img src={src} alt={alt} draggable={false} className={`${className} ${fade(true)}`} />
  ) : (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`${className} ${fade(false)}`} aria-hidden />
  );
}

export function ToyPhoto({ id, model, scale, className = "", alt, size = 400 }: { id: string; model: ToyModel; scale: number; className?: string; alt: string; size?: number }) {
  const { src, ref } = useSnap(`toy|${id}|${scale}`, () => snapshotToy(id, model, scale, size));
  return src ? (
    <img src={src} alt={alt} draggable={false} className={`${className} ${fade(true)}`} />
  ) : (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`${className} ${fade(false)}`} aria-hidden />
  );
}

export function BalloonPhoto({ id, model, text, className = "", alt, size = 400 }: { id: string; model: BalloonModel; text?: string; className?: string; alt: string; size?: number }) {
  const { src, ref } = useSnap(`bl|${id}|${text ?? ""}|${model.color}|${model.shape}`, () => snapshotBalloon(id, model, text, size));
  return src ? (
    <img src={src} alt={alt} draggable={false} className={`${className} ${fade(true)}`} />
  ) : (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`${className} ${fade(false)}`} aria-hidden />
  );
}
