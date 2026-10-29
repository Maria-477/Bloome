import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { mulberry32, leafGeometry, parametricSurface, smooth } from "./petal";
import { buildFlower, createFlowerMaterials, type Bloom } from "./flowers";
import { PALETTES, WRAPS, RIBBONS, FLOWER_LABEL } from "./palettes";
import type { BouquetConfig, FlowerKind } from "./types";

export interface Anchor {
  id: string;
  label: string;
  note: string;
  object: THREE.Object3D;
}

export interface BouquetObject {
  group: THREE.Group;
  setBloom: (b: number) => void;
  anchors: Anchor[];
  dispose: () => void;
}

export const SIZE_COUNT = { petite: 9, classic: 14, grand: 21 } as const;
const SIZE_SCALE = { petite: 0.84, classic: 1, grand: 1.16 } as const;

/** radius of the wrapping cone at height y */
export const coneRadius = (y: number) => 0.1 + 0.95 * Math.pow(Math.max(0, (y + 1.25) / 1.7), 1.3);

const KIND_NOTE: Record<FlowerKind, string> = {
  rose: "love & romance",
  peony: "joy & prosperity",
  tulip: "new beginnings",
  lily: "elegance & remembrance",
  wild: "freedom & spontaneity",
};

interface Slot {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  ring: number; // 0 centre … 1 rim
}

function layout(style: BouquetConfig["style"], n: number, rng: () => number): Slot[] {
  const cfg = {
    classic: { R: 1.0, Hc: 1.05, Hd: 0.7, jit: 0.07, up: 0.0 },
    dome: { R: 1.0, Hc: 0.95, Hd: 0.5, jit: 0.04, up: 0.35 },
    wild: { R: 1.2, Hc: 1.1, Hd: 0.65, jit: 0.22, up: 0.0 },
  }[style];
  const slots: Slot[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const rr = Math.sqrt(t);
    const ang = i * 2.399963 + rng() * 0.35;
    const r = rr * cfg.R * (0.96 + rng() * 0.08);
    const x = Math.sin(ang) * r;
    const z = Math.cos(ang) * r;
    const y = cfg.Hc - rr * rr * cfg.Hd + (rng() - 0.5) * cfg.jit * 2;
    // outward-leaning surface normal of the dome
    const slope = (2 * rr * cfg.Hd) / cfg.R;
    const dir = new THREE.Vector3(Math.sin(ang) * slope, 1, Math.cos(ang) * slope);
    dir.x += (rng() - 0.5) * cfg.jit * 3;
    dir.z += (rng() - 0.5) * cfg.jit * 3;
    dir.y += cfg.up;
    dir.normalize();
    slots.push({ pos: new THREE.Vector3(x, y, z), dir, ring: rr });
  }
  return slots;
}

function paperSheet(
  centerAngle: number,
  span: number,
  top: number,
  offset: number,
  seed: number,
  material: THREE.Material,
) {
  const y0 = -1.25;
  const g = parametricSurface(40, 22, (uu, v, out) => {
    const a = centerAngle + (uu - 0.5) * span;
    let y = y0 + v * (top - y0);
    const rim = Math.pow(v, 3);
    y += rim * (0.16 * Math.sin(a * 3 + seed) + 0.07 * Math.sin(a * 7 + seed * 2));
    // rim tapers towards the ends of the arc so sheets feel hand-folded
    const edge = Math.abs(uu - 0.5) * 2;
    y -= rim * Math.pow(edge, 3) * 0.28;
    let r = coneRadius(y) + offset;
    r *= 1 + 0.03 * Math.sin(a * 9 + v * 6 + seed) + 0.018 * Math.sin(a * 17 + v * 11);
    r *= 1 + 0.13 * smooth((v - 0.86) / 0.14);
    out.set(Math.sin(a) * r, y, Math.cos(a) * r);
  });
  const m = new THREE.Mesh(g, material);
  return m;
}

function leafPlacement(
  geo: THREE.BufferGeometry,
  pos: THREE.Vector3,
  yaw: number,
  tilt: number,
  roll = 0,
) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, yaw, roll, "YXZ"));
  m.compose(pos, q, new THREE.Vector3(1, 1, 1));
  geo.applyMatrix4(m);
  return geo;
}

export function buildBouquet(config: BouquetConfig, low = false): BouquetObject {
  const rng = mulberry32(config.seed * 9973 + 17);
  const palette = PALETTES[config.palette];
  const wrap = WRAPS[config.wrap];
  const ribbon = RIBBONS[config.ribbon];

  const root = new THREE.Group();
  const holder = new THREE.Group(); // scaled by size
  root.add(holder);
  holder.scale.setScalar(SIZE_SCALE[config.size]);
  holder.position.y = config.presentation && config.presentation !== "wrapped" ? -0.42 : -0.1;

  const mats = createFlowerMaterials();
  const disposables: { dispose: () => void }[] = [mats.petal, mats.solid, mats.center, mats.green];
  const blooms: Bloom[] = [];
  const anchors: Anchor[] = [];

  // ---------- decide which flower goes where ----------
  const kinds: FlowerKind[] = config.flowers.length ? config.flowers : ["rose"];
  const hasWild = kinds.includes("wild");
  const mains = kinds.filter((k) => k !== "wild");
  const onlyWild = mains.length === 0;
  const pres = config.presentation ?? "wrapped";
  const vessel = pres !== "wrapped";
  const YB = vessel ? -0.5 : -1.25; // where stems end
  const total = Math.round((config.stems ?? SIZE_COUNT[config.size]) * (onlyWild ? 1.55 : 1));
  const slots = layout(config.style, total, rng);

  // wildflowers live on the outer rim, big blooms near the centre
  const order = slots.map((s, i) => ({ s, i })).sort((a, b) => a.s.ring - b.s.ring);
  const assigned: FlowerKind[] = new Array(total);
  const wildCount = onlyWild ? total : hasWild ? Math.max(2, Math.round(total * 0.3)) : 0;
  order.forEach(({ i }, rank) => {
    if (rank >= total - wildCount) assigned[i] = "wild";
  });
  let m = 0;
  const weights = mains.map((_, i) => 1 + (mains.length - i) * 0.6);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const quota = weights.map((w) => (w / wsum) * (total - wildCount));
  const used = mains.map(() => 0);
  order.forEach(({ i }) => {
    if (assigned[i]) return;
    // pick the main kind with the largest remaining quota
    let best = 0;
    let bestV = -Infinity;
    mains.forEach((_, k) => {
      const v = quota[k] - used[k] + rng() * 0.6;
      if (v > bestV) {
        bestV = v;
        best = k;
      }
    });
    used[best]++;
    assigned[i] = mains[best];
    m++;
  });

  // ---------- flower heads + stems ----------
  const stemGeos: THREE.BufferGeometry[] = [];
  const headScale: Record<FlowerKind, number> = { rose: 1.12, peony: 1.02, tulip: 1.3, lily: 1.2, wild: 1.3 };
  const seen = new Set<FlowerKind>();

  slots.forEach((slot, i) => {
    const kind = assigned[i];
    const [base, tip] = palette[kind];
    const bloom = buildFlower(kind, base, tip, config.seed * 131 + i * 17 + 3, mats, low);
    const g = bloom.group;
    g.position.copy(slot.pos);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), slot.dir);
    g.rotateY(rng() * 6.28);
    const s = headScale[kind] * (0.9 + rng() * 0.2) * (config.style === "dome" ? 1.08 : 1);
    g.userData.baseScale = s;
    holder.add(g);
    blooms.push(bloom);

    if (!seen.has(kind) && slot.ring < 0.95) {
      seen.add(kind);
      anchors.push({
        id: `a-${kind}`,
        label: FLOWER_LABEL[kind],
        note: KIND_NOTE[kind],
        object: g,
      });
    }

    const baseP = slot.pos.clone().addScaledVector(slot.dir, -0.2);
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(slot.pos.x * 0.04, YB, slot.pos.z * 0.04),
        new THREE.Vector3(slot.pos.x * 0.12, YB * 0.45, slot.pos.z * 0.12),
        new THREE.Vector3(slot.pos.x * 0.42, 0.15, slot.pos.z * 0.42),
        baseP,
      ],
      false,
      "centripetal",
    );
    stemGeos.push(new THREE.TubeGeometry(curve, 14, kind === "tulip" ? 0.028 : 0.024, 5, false));
  });

  // ---------- greenery: broad leaves ----------
  const leafMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
  disposables.push(leafMat);
  const leafGeos: THREE.BufferGeometry[] = [];
  const nLeaf = config.size === "petite" ? 8 : config.size === "classic" ? 11 : 15;
  const gBase = new THREE.Color("#3f6b3f");
  const gTip = new THREE.Color("#7fa56a");
  for (let i = 0; i < nLeaf; i++) {
    const ang = (i / nLeaf) * Math.PI * 2 + rng() * 0.3;
    const rad = 0.55 + rng() * 0.4;
    const y = 0.12 + rng() * 0.3;
    const len = 0.7 + rng() * 0.35;
    const geo = leafGeometry(len, 0.3 + rng() * 0.12, gBase.clone().offsetHSL(0, 0, rng() * 0.05), gTip.clone().offsetHSL(0, 0, rng() * 0.06));
    leafPlacement(
      geo,
      new THREE.Vector3(Math.sin(ang) * rad, y, Math.cos(ang) * rad),
      ang,
      0.9 + rng() * 0.35,
      (rng() - 0.5) * 0.5,
    );
    leafGeos.push(geo);
    stemGeos.push(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, YB + 0.05, 0),
          new THREE.Vector3(Math.sin(ang) * rad * 0.3, YB * 0.35, Math.cos(ang) * rad * 0.3),
          new THREE.Vector3(Math.sin(ang) * rad, y, Math.cos(ang) * rad),
        ]),
        8,
        0.018,
        4,
        false,
      ),
    );
  }

  // ---------- eucalyptus sprigs ----------
  const nEuc = config.style === "wild" ? 7 : config.size === "petite" ? 3 : 5;
  const eucBase = new THREE.Color("#7f9a86");
  const eucTip = new THREE.Color("#b8cbb8");
  for (let i = 0; i < nEuc; i++) {
    const ang = (i / nEuc) * Math.PI * 2 + 0.5 + rng() * 0.6;
    const rad = 1.05 + rng() * 0.3;
    const top = new THREE.Vector3(Math.sin(ang) * rad, 0.5 + rng() * 0.55, Math.cos(ang) * rad);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, YB + 0.05, 0),
      new THREE.Vector3(top.x * 0.3, YB * 0.25, top.z * 0.3),
      top,
    ]);
    stemGeos.push(new THREE.TubeGeometry(curve, 10, 0.012, 4, false));
    for (let k = 0; k < 9; k++) {
      const t = 0.42 + (k / 9) * 0.58;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const side = k % 2 ? 1 : -1;
      const sz = 0.2 - (k / 9) * 0.08;
      const lg = leafGeometry(sz, sz * 0.85, eucBase, eucTip, 0.5);
      // orient the leaf: grow sideways from the stem
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(tan.x + side * 0.9, tan.y * 0.6 + 0.2, tan.z + side * 0.2).normalize(),
      );
      const mt = new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1));
      lg.applyMatrix4(mt);
      leafGeos.push(lg);
    }
    if (i === 0) {
      const marker = new THREE.Object3D();
      marker.position.copy(top);
      holder.add(marker);
      anchors.push({ id: "a-leaf", label: "Silver Eucalyptus", note: "calm & renewal", object: marker });
    }
  }

  // ---------- baby's breath filler ----------
  const fillGeos: THREE.BufferGeometry[] = [];
  const nFill = config.style === "dome" ? 0 : config.style === "wild" ? 9 : 6;
  for (let i = 0; i < nFill; i++) {
    const ang = rng() * Math.PI * 2;
    const rad = 0.55 + rng() * 0.75;
    const top = new THREE.Vector3(Math.sin(ang) * rad, 0.75 + rng() * 0.7, Math.cos(ang) * rad);
    stemGeos.push(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, YB + 0.05, 0),
          new THREE.Vector3(top.x * 0.3, YB * 0.2, top.z * 0.3),
          top,
        ]),
        8,
        0.008,
        3,
        false,
      ),
    );
    const cnt = low ? 10 : 22;
    for (let k = 0; k < cnt; k++) {
      const s = new THREE.IcosahedronGeometry(0.022 + rng() * 0.016, 0);
      const o = new THREE.Vector3((rng() - 0.5) * 0.4, (rng() - 0.3) * 0.28, (rng() - 0.5) * 0.4);
      s.translate(top.x + o.x, top.y + o.y, top.z + o.z);
      fillGeos.push(s);
    }
  }

  // merge static parts into single draw calls
  const stemMat = new THREE.MeshStandardMaterial({ color: "#59794a", roughness: 0.75 });
  const fillMat = new THREE.MeshStandardMaterial({ color: "#fbf9f4", roughness: 0.6 });
  disposables.push(stemMat, fillMat);
  const stems = new THREE.Mesh(mergeGeometries(stemGeos)!, stemMat);
  holder.add(stems);
  if (leafGeos.length) holder.add(new THREE.Mesh(mergeGeometries(leafGeos)!, leafMat));
  if (fillGeos.length) holder.add(new THREE.Mesh(mergeGeometries(fillGeos)!, fillMat));

  if (vessel) {
    buildVessel(pres, config, holder, disposables, anchors);
  } else {
    // ---------- wrapping paper ----------
    const paperOuter = new THREE.MeshStandardMaterial({
      color: wrap.outer,
      emissive: wrap.outer,
      emissiveIntensity: 0.2,
      roughness: 0.88,
      side: THREE.DoubleSide,
    });
    const paperInner = new THREE.MeshStandardMaterial({
      color: wrap.inner,
      emissive: wrap.inner,
      emissiveIntensity: 0.24,
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    disposables.push(paperOuter, paperInner);
    holder.add(paperSheet(Math.PI, Math.PI * 1.35, 0.7, 0.0, 1.3, paperInner));
    holder.add(paperSheet(0, Math.PI * 2, 0.04, 0.012, 0.4, paperOuter));
    holder.add(paperSheet(0.95, Math.PI * 1.05, 0.3, 0.034, 2.2, paperOuter));
    holder.add(paperSheet(-0.95, Math.PI * 1.05, 0.38, 0.05, 3.7, paperInner));

    // ---------- ribbon ----------
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: ribbon.color,
      roughness: 0.32,
      sheen: 1,
      sheenColor: new THREE.Color(ribbon.color).lerp(new THREE.Color("#ffffff"), 0.5),
      sheenRoughness: 0.3,
      clearcoat: 0.4,
      clearcoatRoughness: 0.35,
      side: THREE.DoubleSide,
    });
    disposables.push(ribbonMat);
    if (config.ribbonStyle !== "none") {
      const yR = -0.42;
      const rr = coneRadius(yR) + 0.07;
      const bandH = config.ribbonStyle === "band" ? 0.2 : 0.11;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(rr + 0.012, rr, bandH, 56, 1, true), ribbonMat);
      band.position.y = yR;
      holder.add(band);
      const front = new THREE.Group();
      front.position.set(0, yR, rr + 0.02);
      holder.add(front);

      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), ribbonMat);
      knot.scale.set(1, 0.9, 0.75);
      front.add(knot);

      if (config.ribbonStyle === "bow") {
        const makeLoop = (side: number) => {
          const sh = new THREE.Shape();
          sh.absellipse(side * 0.2, 0.02, 0.2, 0.125, 0, Math.PI * 2, false, 0);
          const hole = new THREE.Path();
          hole.absellipse(side * 0.2, 0.02, 0.13, 0.058, 0, Math.PI * 2, true, 0);
          sh.holes.push(hole);
          const g = new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 20 });
          const mesh = new THREE.Mesh(g, ribbonMat);
          mesh.rotation.z = side * 0.28;
          mesh.rotation.y = -side * 0.35;
          mesh.position.z = 0.02;
          return mesh;
        };
        front.add(makeLoop(1), makeLoop(-1));
        // tails draped over the cone
        for (const side of [-1, 1]) {
          const sh = new THREE.Shape();
          sh.moveTo(-0.045, 0);
          sh.lineTo(0.045, 0);
          sh.lineTo(0.06, -0.34);
          sh.lineTo(0, -0.28);
          sh.lineTo(-0.06, -0.34);
          sh.closePath();
          const tg = new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: false });
          tg.rotateZ(side * 0.3);
          tg.translate(side * 0.05, -0.02, 0);
          const p = tg.attributes.position;
          for (let k = 0; k < p.count; k++) {
            const x = p.getX(k);
            const yy = p.getY(k) + yR;
            const wrapped = Math.sqrt(Math.max(0.0004, coneRadius(yy) ** 2 - x * x)) + 0.08;
            p.setZ(k, p.getZ(k) + wrapped - (rr + 0.02));
          }
          tg.computeVertexNormals();
          front.add(new THREE.Mesh(tg, ribbonMat));
        }
      } else {
        const tag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.03), ribbonMat);
        front.add(tag);
      }
      anchors.push({ id: "a-ribbon", label: "Silk Ribbon", note: "hand-tied", object: front });
    }


  }

  // ---------- API ----------
  const setBloom = (b: number) => {
    blooms.forEach((bl) => {
      bl.setBloom(b);
      const s = bl.group.userData.baseScale as number;
      bl.group.scale.multiplyScalar(s);
    });
  };
  setBloom(0.9);

  const dispose = () => {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.geometry.dispose();
    });
    disposables.forEach((d) => d.dispose());
    // the anther material is created per-lily
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.material && !Array.isArray(mesh.material)) {
        const mm = mesh.material as THREE.Material;
        if (!disposables.includes(mm)) mm.dispose();
      }
    });
  };

  void m;
  return { group: root, setBloom, anchors, dispose };
}

/** One flower head on a short stem — used for close-up “flowers with meaning” shots. */
export function buildSingleBloom(
  kind: FlowerKind,
  paletteId: BouquetConfig["palette"],
  seed = 5,
  low = false,
): BouquetObject {
  const palette = PALETTES[paletteId];
  const mats = createFlowerMaterials();
  const root = new THREE.Group();
  const [base, tip] = palette[kind];
  const bloom = buildFlower(kind, base, tip, seed, mats, low);
  const lean = new THREE.Group();
  lean.add(bloom.group);
  root.add(lean);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.036, 1.6, 8),
    mats.green,
  );
  stem.position.y = -0.82;
  lean.add(stem);
  const setBloom = (b: number) => {
    bloom.setBloom(b);
    bloom.group.scale.multiplyScalar(1.6);
  };
  setBloom(1);
  return {
    group: root,
    setBloom,
    anchors: [],
    dispose: () => {
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mm = mesh.material as THREE.Material;
          mm.dispose();
        }
      });
      mats.petal.dispose();
    },
  };
}


/** A box or basket that holds the arrangement, with green floral foam on top. */
function buildVessel(
  kind: "box" | "basket",
  config: BouquetConfig,
  holder: THREE.Group,
  disposables: { dispose: () => void }[],
  anchors: Anchor[],
) {
  const wrap = WRAPS[config.wrap];
  const ribbon = RIBBONS[config.ribbon];
  const H = 0.9;
  const rTop = kind === "box" ? 1.0 : 1.08;
  const rBot = kind === "box" ? 0.94 : 0.8;
  const y0 = -0.95;
  const wallColor = kind === "box" ? wrap.outer : "#b98a55";
  const wall = new THREE.MeshStandardMaterial({
    color: wallColor,
    emissive: wallColor,
    emissiveIntensity: kind === "box" ? 0.18 : 0.12,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const inner = new THREE.MeshStandardMaterial({ color: kind === "box" ? wrap.inner : "#8a6238", roughness: 0.9, side: THREE.DoubleSide });
  const foamMat = new THREE.MeshStandardMaterial({ color: "#7aa56a", roughness: 1 });
  disposables.push(wall, inner, foamMat);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, H, 56, 1, true), wall);
  body.position.y = y0 + H / 2;
  holder.add(body);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(rBot, 40), inner);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = y0 + 0.01;
  holder.add(floor);
  // lip
  const lip = new THREE.Mesh(new THREE.TorusGeometry(rTop, 0.045, 8, 64), kind === "box" ? inner : wall);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = y0 + H;
  holder.add(lip);
  // floral foam, slightly below the rim, with a rough top
  const foam = new THREE.Mesh(new THREE.CylinderGeometry(rTop - 0.06, rTop - 0.06, 0.1, 40), foamMat);
  foam.position.y = y0 + H - 0.05;
  holder.add(foam);

  if (kind === "basket") {
    // woven bands
    const bandMat = new THREE.MeshStandardMaterial({ color: "#8a6238", roughness: 0.95 });
    disposables.push(bandMat);
    for (let i = 0; i < 9; i++) {
      const t = (i + 0.5) / 9;
      const r = rBot + (rTop - rBot) * t + 0.012;
      const band = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 6, 60), bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = y0 + t * H;
      holder.add(band);
    }
    // handle
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(rTop * 0.98, 0.04, 8, 48, Math.PI),
      wall,
    );
    handle.rotation.set(0, 0, 0);
    handle.scale.set(1, 1.28, 1);
    handle.position.y = y0 + H;
    handle.rotation.y = 0.35;
    holder.add(handle);
  }

  if (config.ribbonStyle !== "none") {
    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: ribbon.color,
      roughness: 0.32,
      sheen: 1,
      sheenColor: new THREE.Color(ribbon.color).lerp(new THREE.Color("#ffffff"), 0.5),
      clearcoat: 0.4,
      side: THREE.DoubleSide,
    });
    disposables.push(ribbonMat);
    const yR = y0 + H * 0.5;
    const rr = rBot + (rTop - rBot) * 0.5 + 0.03;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(rr + 0.01, rr, config.ribbonStyle === "band" ? 0.2 : 0.11, 56, 1, true), ribbonMat);
    band.position.y = yR;
    holder.add(band);
    if (config.ribbonStyle === "bow") {
      const front = new THREE.Group();
      front.position.set(0, yR, rr + 0.03);
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), ribbonMat);
      knot.scale.set(1, 0.9, 0.75);
      front.add(knot);
      for (const side of [-1, 1]) {
        const sh = new THREE.Shape();
        sh.absellipse(side * 0.2, 0.02, 0.2, 0.125, 0, Math.PI * 2, false, 0);
        const hole = new THREE.Path();
        hole.absellipse(side * 0.2, 0.02, 0.13, 0.058, 0, Math.PI * 2, true, 0);
        sh.holes.push(hole);
        const g = new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 20 });
        const m = new THREE.Mesh(g, ribbonMat);
        m.rotation.z = side * 0.28;
        m.rotation.y = -side * 0.35;
        m.position.z = 0.02;
        front.add(m);
      }
      holder.add(front);
      anchors.push({ id: "a-ribbon", label: "Silk Ribbon", note: "hand-tied", object: front });
    }
  }
}
