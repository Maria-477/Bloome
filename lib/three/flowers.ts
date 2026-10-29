import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { petalGeometry, mulberry32, smooth, clamp01, lerp } from "./petal";
import type { FlowerKind } from "./types";

export interface Bloom {
  kind: FlowerKind;
  group: THREE.Group;
  /** approximate radius of the open head (before scaling) */
  radius: number;
  setBloom: (b: number) => void;
}

interface PetalRef {
  pivot: THREE.Object3D;
  closed: number;
  open: number;
  delay: number;
}

interface RingSpec {
  n: number;
  r0: number;
  h0: number;
  len: number;
  wid: number;
  tc: number;
  to: number;
  cup: number;
  curl?: number;
  ruffle?: number;
  bulge?: number;
  crease?: number;
  offset: number;
  peak?: number;
  tipPow?: number;
  /** 0 = use base colour, 1 = use tip colour */
  shade: number;
}

export interface FlowerMaterials {
  petal: THREE.MeshPhysicalMaterial;
  solid: THREE.MeshStandardMaterial;
  center: THREE.MeshStandardMaterial;
  green: THREE.MeshStandardMaterial;
}

const col = (hex: string) => new THREE.Color(hex);

function jitterColor(c: THREE.Color, rng: () => number, amt = 0.035) {
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  return new THREE.Color().setHSL(
    (hsl.h + (rng() - 0.5) * amt * 0.6 + 1) % 1,
    clamp01(hsl.s + (rng() - 0.5) * amt * 2),
    clamp01(hsl.l + (rng() - 0.5) * amt * 2),
  );
}

function buildRings(
  kind: FlowerKind,
  rings: RingSpec[],
  baseHex: string,
  tipHex: string,
  rng: () => number,
  mats: FlowerMaterials,
  lowQuality: boolean,
): { group: THREE.Group; petals: PetalRef[] } {
  const group = new THREE.Group();
  const petals: PetalRef[] = [];
  const base = col(baseHex);
  const tip = col(tipHex);
  const L = rings.length;

  rings.forEach((r, ri) => {
    const n = lowQuality && r.n > 6 ? Math.ceil(r.n * 0.75) : r.n;
    for (let k = 0; k < n; k++) {
      const a = r.offset + (k / n) * Math.PI * 2 + (rng() - 0.5) * 0.28;
      // inner petals use deeper colours, outer ones the lighter tip colour
      const shade = r.shade;
      const b = base.clone().lerp(tip, shade * 0.55);
      const t = tip.clone().lerp(base, (1 - shade) * 0.25);
      const geo = petalGeometry({
        width: r.wid * (0.92 + rng() * 0.16),
        length: r.len * (0.94 + rng() * 0.12),
        peak: r.peak ?? 0.62,
        tipPow: r.tipPow ?? 2.2,
        cup: r.cup,
        curl: r.curl,
        ruffle: r.ruffle,
        bulge: r.bulge,
        crease: r.crease,
        phase: rng() * 6.28,
        base: jitterColor(b, rng),
        tip: jitterColor(t, rng),
        throat: kind === "lily" ? col("#c9d98a") : undefined,
        throatLen: kind === "lily" ? 0.28 : undefined,
        su: lowQuality ? 5 : 8,
        sv: lowQuality ? 8 : 12,
      });
      const ringG = new THREE.Group();
      ringG.rotation.y = a;
      const pivot = new THREE.Group();
      pivot.position.set(0, r.h0, r.r0);
      const mesh = new THREE.Mesh(geo, mats.petal);
      pivot.add(mesh);
      ringG.add(pivot);
      group.add(ringG);
      const jt = (rng() - 0.5) * 0.12;
      petals.push({
        pivot,
        closed: r.tc + jt * 0.4,
        open: r.to + jt,
        delay: 0.55 * (1 - ri / Math.max(1, L - 1)) * (0.7 + rng() * 0.3),
      });
    }
  });
  return { group, petals };
}

function finish(
  kind: FlowerKind,
  group: THREE.Group,
  petals: PetalRef[],
  radius: number,
): Bloom {
  const setBloom = (b: number) => {
    for (const p of petals) {
      const t = smooth(clamp01((b - p.delay) / (1 - p.delay)));
      p.pivot.rotation.x = lerp(p.closed, p.open, t);
    }
    group.scale.setScalar(0.74 + 0.26 * smooth(b));
  };
  return { kind, group, radius, setBloom };
}

/** small green calyx at the base of the flower head */
function calyx(mats: FlowerMaterials, r = 0.07, h = 0.09) {
  const g = new THREE.SphereGeometry(r, 12, 8);
  g.scale(1, h / r, 1);
  const m = new THREE.Mesh(g, mats.green);
  m.position.y = -h * 0.35;
  return m;
}

function yellowCluster(rng: () => number, n: number, spread: number, size: number, y: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.IcosahedronGeometry(size * (0.7 + rng() * 0.6), 0);
    const a = rng() * Math.PI * 2;
    const rr = Math.sqrt(rng()) * spread;
    g.translate(Math.cos(a) * rr, y + rng() * size, Math.sin(a) * rr);
    parts.push(g);
  }
  return mergeGeometries(parts)!;
}

export function buildRose(
  base: string,
  tip: string,
  rng: () => number,
  mats: FlowerMaterials,
  low: boolean,
): Bloom {
  const rings: RingSpec[] = [
    { n: 3, r0: 0.01, h0: 0.02, len: 0.16, wid: 0.17, tc: 0.0, to: 0.14, cup: 1.7, offset: 0.0, shade: 0.0, peak: 0.68 },
    { n: 4, r0: 0.025, h0: 0.02, len: 0.2, wid: 0.21, tc: 0.05, to: 0.28, cup: 1.5, offset: 0.7, shade: 0.08, peak: 0.68 },
    { n: 5, r0: 0.045, h0: 0.015, len: 0.25, wid: 0.25, tc: 0.1, to: 0.44, cup: 1.3, offset: 0.3, shade: 0.2, peak: 0.68 },
    { n: 6, r0: 0.07, h0: 0.01, len: 0.29, wid: 0.28, tc: 0.17, to: 0.62, cup: 1.15, curl: 0.1, offset: 0.9, shade: 0.4, peak: 0.7 },
    { n: 7, r0: 0.1, h0: 0.0, len: 0.33, wid: 0.31, tc: 0.27, to: 0.8, cup: 1.0, curl: 0.2, offset: 0.1, shade: 0.65, peak: 0.7 },
    { n: 8, r0: 0.125, h0: -0.005, len: 0.36, wid: 0.33, tc: 0.38, to: 0.98, cup: 0.9, curl: 0.32, offset: 0.55, shade: 0.9, peak: 0.7 },
  ];
  const { group, petals } = buildRings("rose", rings, base, tip, rng, mats, low);
  group.add(calyx(mats, 0.08, 0.1));
  return finish("rose", group, petals, 0.34);
}

export function buildPeony(
  base: string,
  tip: string,
  rng: () => number,
  mats: FlowerMaterials,
  low: boolean,
): Bloom {
  const rings: RingSpec[] = [
    { n: 5, r0: 0.02, h0: 0.03, len: 0.18, wid: 0.18, tc: 0.03, to: 0.2, cup: 1.4, ruffle: 0.35, offset: 0, shade: 0.0, tipPow: 2.6 },
    { n: 6, r0: 0.04, h0: 0.025, len: 0.23, wid: 0.23, tc: 0.08, to: 0.36, cup: 1.25, ruffle: 0.4, offset: 0.5, shade: 0.1, tipPow: 2.6 },
    { n: 8, r0: 0.065, h0: 0.02, len: 0.28, wid: 0.27, tc: 0.15, to: 0.55, cup: 1.1, ruffle: 0.45, offset: 0.2, shade: 0.3, tipPow: 2.6 },
    { n: 9, r0: 0.09, h0: 0.01, len: 0.33, wid: 0.3, tc: 0.25, to: 0.74, cup: 1.0, ruffle: 0.5, curl: 0.08, offset: 0.8, shade: 0.55, tipPow: 2.6 },
    { n: 10, r0: 0.115, h0: 0.0, len: 0.37, wid: 0.33, tc: 0.36, to: 0.92, cup: 0.9, ruffle: 0.5, curl: 0.14, offset: 0.35, shade: 0.8, tipPow: 2.6 },
    { n: 9, r0: 0.14, h0: -0.01, len: 0.4, wid: 0.36, tc: 0.48, to: 1.08, cup: 0.8, ruffle: 0.45, curl: 0.22, offset: 0.1, shade: 1.0, tipPow: 2.6 },
  ];
  const { group, petals } = buildRings("peony", rings, base, tip, rng, mats, low);
  const core = new THREE.Mesh(yellowCluster(rng, 16, 0.07, 0.014, 0.1), mats.center);
  group.add(core);
  group.add(calyx(mats, 0.1, 0.1));
  return finish("peony", group, petals, 0.44);
}

export function buildTulip(
  base: string,
  tip: string,
  rng: () => number,
  mats: FlowerMaterials,
  low: boolean,
): Bloom {
  const rings: RingSpec[] = [
    { n: 3, r0: 0.045, h0: 0.0, len: 0.46, wid: 0.27, tc: 0.0, to: 0.26, cup: 1.0, bulge: 0.15, offset: 0.52, shade: 0.1, peak: 0.52, tipPow: 1.9 },
    { n: 3, r0: 0.05, h0: 0.0, len: 0.5, wid: 0.3, tc: 0.02, to: 0.4, cup: 0.9, bulge: 0.17, curl: 0.05, offset: 0.0, shade: 0.8, peak: 0.52, tipPow: 1.9 },
  ];
  const { group, petals } = buildRings("tulip", rings, base, tip, rng, mats, low);
  group.add(calyx(mats, 0.06, 0.08));
  return finish("tulip", group, petals, 0.24);
}

export function buildLily(
  base: string,
  tip: string,
  rng: () => number,
  mats: FlowerMaterials,
  low: boolean,
): Bloom {
  const rings: RingSpec[] = [
    { n: 3, r0: 0.02, h0: 0.0, len: 0.62, wid: 0.2, tc: 0.08, to: 0.95, cup: 0.5, curl: 0.55, crease: 1.0, offset: 0.52, shade: 0.4, peak: 0.5, tipPow: 1.25 },
    { n: 3, r0: 0.025, h0: 0.0, len: 0.66, wid: 0.27, tc: 0.12, to: 1.08, cup: 0.5, curl: 0.6, crease: 1.0, offset: 0.0, shade: 0.9, peak: 0.5, tipPow: 1.25 },
  ];
  const { group, petals } = buildRings("lily", rings, base, tip, rng, mats, low);
  // stamens
  const parts: THREE.BufferGeometry[] = [];
  const anthers: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(a) * 0.05, 0.2, Math.sin(a) * 0.05),
      new THREE.Vector3(Math.cos(a) * 0.14, 0.38, Math.sin(a) * 0.14),
    ]);
    parts.push(new THREE.TubeGeometry(curve, 8, 0.006, 4, false));
    const an = new THREE.SphereGeometry(0.02, 8, 6);
    an.scale(0.7, 1.9, 0.7);
    an.translate(Math.cos(a) * 0.14, 0.4, Math.sin(a) * 0.14);
    anthers.push(an);
  }
  const fil = new THREE.Mesh(mergeGeometries(parts)!, mats.green);
  const ant = new THREE.Mesh(mergeGeometries(anthers)!, new THREE.MeshStandardMaterial({ color: "#b5651d", roughness: 0.7 }));
  group.add(fil, ant);
  group.add(calyx(mats, 0.05, 0.08));
  return finish("lily", group, petals, 0.42);
}

export function buildWild(
  base: string,
  tip: string,
  rng: () => number,
  mats: FlowerMaterials,
  low: boolean,
): Bloom {
  const n = low ? 9 : 12 + Math.floor(rng() * 4);
  const rings: RingSpec[] = [
    { n, r0: 0.025, h0: 0.0, len: 0.17, wid: 0.065, tc: 0.5, to: 1.38, cup: 0.3, offset: rng() * 3, shade: 0.5, peak: 0.55, tipPow: 2.0 },
    { n: Math.ceil(n * 0.7), r0: 0.02, h0: 0.01, len: 0.14, wid: 0.06, tc: 0.45, to: 1.2, cup: 0.3, offset: rng() * 3, shade: 0.1, peak: 0.55, tipPow: 2.0 },
  ];
  const { group, petals } = buildRings("wild", rings, base, tip, rng, mats, low);
  const cg = new THREE.SphereGeometry(0.04, 10, 8);
  cg.scale(1, 0.55, 1);
  const centre = new THREE.Mesh(cg, mats.center);
  centre.position.y = 0.02;
  group.add(centre);
  return finish("wild", group, petals, 0.19);
}

export function buildFlower(
  kind: FlowerKind,
  base: string,
  tip: string,
  seed: number,
  mats: FlowerMaterials,
  low: boolean,
): Bloom {
  const rng = mulberry32(seed);
  switch (kind) {
    case "rose":
      return buildRose(base, tip, rng, mats, low);
    case "peony":
      return buildPeony(base, tip, rng, mats, low);
    case "tulip":
      return buildTulip(base, tip, rng, mats, low);
    case "lily":
      return buildLily(base, tip, rng, mats, low);
    default:
      return buildWild(base, tip, rng, mats, low);
  }
}

export function createFlowerMaterials(): FlowerMaterials {
  return {
    petal: new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.6,
      metalness: 0,
      sheen: 0.9,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color("#fff1ee"),
      side: THREE.DoubleSide,
    }),
    solid: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8 }),
    center: new THREE.MeshStandardMaterial({ color: "#e7b43a", roughness: 0.75 }),
    green: new THREE.MeshStandardMaterial({ color: "#5d7d4b", roughness: 0.7 }),
  };
}
