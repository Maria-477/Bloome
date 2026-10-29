import { BouquetStage } from "./stage";
import type { BouquetConfig, FlowerKind, PaletteId } from "./types";
import { DEFAULT_POSE } from "./types";

/**
 * Renders bouquets / single blooms with the same 3D engine into transparent
 * images (used for product cards, flower stories and the garden interlude).
 * One shared offscreen WebGL context, results cached, jobs run one at a time.
 */
let stage: BouquetStage | null = null;
let chain: Promise<unknown> = Promise.resolve();
const cache = new Map<string, Promise<string>>();

function getStage() {
  if (!stage) {
    const canvas = document.createElement("canvas");
    stage = new BouquetStage({ canvas, low: false, maxDpr: 1, fill: 0.9, preserveDrawingBuffer: true });
    stage.idle = false;
  }
  return stage;
}

const tick = () => new Promise<void>((r) => setTimeout(r, 16));

function job<T>(fn: () => T | Promise<T>): Promise<T> {
  const p = chain.then(async () => {
    await tick();
    return await fn();
  });
  chain = p.catch(() => undefined);
  return p;
}

export function snapshotBouquet(
  config: BouquetConfig,
  opts: { yaw?: number; pitch?: number; w?: number; h?: number; bloom?: number } = {},
): Promise<string> {
  const { yaw = -0.25, pitch = 0, w = 560, h = 720, bloom = 0.92 } = opts;
  const key = `b:${JSON.stringify(config)}:${yaw}:${pitch}:${w}x${h}:${bloom}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = job(() => {
    const s = getStage();
    s.fill = 0.9;
    Object.assign(s.pose, DEFAULT_POSE, { rotY: yaw, rotX: pitch, bloom });
    s.setBouquet(config);
    s.resize(w, h);
    s.render(0);
    return s.canvas.toDataURL("image/webp", 0.92);
  });
  cache.set(key, p);
  return p;
}

/** a single flower head, shot from slightly above */
export function snapshotBloom(
  kind: FlowerKind,
  palette: PaletteId,
  opts: { w?: number; h?: number; tilt?: number; bloom?: number } = {},
): Promise<string> {
  const { w = 520, h = 520, tilt = 0.9, bloom = 1 } = opts;
  const key = `f:${kind}:${palette}:${w}x${h}:${tilt}:${bloom}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = job(() => {
    const s = getStage();
    s.fill = 0.9;
    Object.assign(s.pose, DEFAULT_POSE, { rotY: 0.5, rotX: tilt - 0.2, bloom, scale: 1.55, y: 0.02 });
    s.setSingleBloom(kind, palette);
    s.resize(w, h);
    s.render(0);
    return s.canvas.toDataURL("image/webp", 0.92);
  });
  cache.set(key, p);
  return p;
}

import { buildExtras } from "./gifts";
import type { BalloonModel, ToyModel } from "@/data/catalog";

const emptyObject = (stage: BouquetStage) => {
  stage.setObject({ group: new (stage.scene.constructor as new () => never)(), setBloom() {}, anchors: [], dispose() {} });
};

/** a single teddy / soft toy, for catalogue cards */
export function snapshotToy(key: string, model: ToyModel, scale: number, size = 440): Promise<string> {
  const ck = `t:${key}:${size}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const p = job(() => {
    const s = getStage();
    Object.assign(s.pose, DEFAULT_POSE, { rotY: 0, rotX: 0.08, scale: 2.05, y: 0.02 });
    s.fill = 0.9;
    emptyObject(s);
    s.setExtras(buildExtras({ teddies: [{ model, scale }], balloons: [] }, "single"));
    s.resize(size, size);
    s.render(0);
    const url = s.canvas.toDataURL("image/webp", 0.92);
    s.setExtras(null);
    return url;
  });
  cache.set(ck, p);
  return p;
}

/** a single balloon (optionally with printed text), for catalogue cards & the personalise preview */
export function snapshotBalloon(key: string, model: BalloonModel, text: string | undefined, size = 440): Promise<string> {
  const ck = `bl:${key}:${text ?? ""}:${model.shape}:${model.color}:${size}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const p = job(async () => {
    try {
      await (document as unknown as { fonts: { load: (s: string) => Promise<unknown> } }).fonts.load('600 40px "Jost Variable"');
    } catch {
      /* fall back to the system font */
    }
    const s = getStage();
    Object.assign(s.pose, DEFAULT_POSE, { rotY: -0.15, rotX: 0, scale: model.bundle ? 1.55 : 1.9, y: model.bundle ? -0.04 : -0.03 });
    s.fill = 0.9;
    emptyObject(s);
    s.setExtras(buildExtras({ teddies: [], balloons: [{ model, text }] }, "single"));
    s.resize(size, size);
    s.render(0);
    const url = s.canvas.toDataURL("image/webp", 0.92);
    s.setExtras(null);
    return url;
  });
  cache.set(ck, p);
  return p;
}
