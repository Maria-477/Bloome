import * as THREE from "three";
import type { BalloonModel, ToyModel } from "@/data/catalog";

export interface ExtrasObject {
  group: THREE.Group;
  tick: (t: number) => void;
  dispose: () => void;
}

export interface ExtrasSpec {
  teddies: { model: ToyModel; scale: number }[];
  balloons: { model: BalloonModel; text?: string }[];
}

const col = (h: string) => new THREE.Color(h);

/* ------------------------------------------------------------------ *
 *  TEDDY BEAR — built from soft spheres. Origin = bottom of the feet.
 * ------------------------------------------------------------------ */
function buildTeddy(m: ToyModel, scale: number, track: (d: { dispose: () => void }) => void) {
  const g = new THREE.Group();
  const fur = new THREE.MeshPhysicalMaterial({
    color: m.fur,
    roughness: 0.95,
    sheen: 1,
    sheenRoughness: 0.85,
    sheenColor: col(m.fur).lerp(col("#ffffff"), 0.55),
  });
  const belly = new THREE.MeshPhysicalMaterial({
    color: m.belly,
    roughness: 0.95,
    sheen: 1,
    sheenRoughness: 0.85,
    sheenColor: col(m.belly).lerp(col("#ffffff"), 0.5),
  });
  const dark = new THREE.MeshStandardMaterial({ color: "#241915", roughness: 0.3 });
  const satin = new THREE.MeshPhysicalMaterial({
    color: m.bow ?? "#c23a52",
    roughness: 0.35,
    sheen: 1,
    sheenColor: col(m.bow ?? "#c23a52").lerp(col("#ffffff"), 0.5),
    clearcoat: 0.4,
    side: THREE.DoubleSide,
  });
  [fur, belly, dark, satin].forEach(track);

  const sph = (r: number, mat: THREE.Material, p: [number, number, number], s: [number, number, number] = [1, 1, 1], seg = 28) => {
    const geo = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75));
    track(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...p);
    mesh.scale.set(...s);
    g.add(mesh);
    return mesh;
  };

  sph(0.42, fur, [0, 0.46, 0], [1, 1.08, 0.94]); // body
  sph(0.3, belly, [0, 0.45, 0.3], [1, 1.1, 0.42]); // belly patch
  sph(0.34, fur, [0, 1.06, 0.03]); // head
  // ears
  if (m.bunny) {
    for (const s of [-1, 1]) {
      const ear = sph(0.095, fur, [s * 0.13, 1.56, -0.02], [1, 3.4, 0.7]);
      ear.rotation.z = -s * 0.16;
      const inn = sph(0.055, satin, [s * 0.135, 1.56, 0.03], [1, 3.1, 0.5]);
      inn.rotation.z = -s * 0.16;
    }
  } else {
    for (const s of [-1, 1]) {
      sph(0.125, fur, [s * 0.25, 1.33, 0]);
      sph(0.07, belly, [s * 0.25, 1.33, 0.07], [1, 1, 0.5]);
    }
  }
  sph(0.14, belly, [0, 0.99, 0.29], [1, 0.82, 0.85]); // muzzle
  sph(0.045, dark, [0, 1.04, 0.41], [1.25, 0.8, 0.9], 14); // nose
  for (const s of [-1, 1]) sph(0.038, dark, [s * 0.125, 1.12, 0.3], [1, 1.15, 0.8], 12); // eyes
  // arms
  for (const s of [-1, 1]) {
    const arm = sph(0.12, fur, [s * 0.43, 0.62, 0.1], [1, 1.9, 1]);
    arm.rotation.z = s * 0.7;
    arm.rotation.x = -0.35;
  }
  // legs + pads
  for (const s of [-1, 1]) {
    sph(0.17, fur, [s * 0.25, 0.15, 0.2], [1, 0.95, 1.35]);
    sph(0.085, belly, [s * 0.25, 0.14, 0.42], [1, 0.9, 0.5], 14);
  }
  // neck ribbon + bow
  const neck = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 8, 28), satin);
  track(neck.geometry);
  neck.rotation.x = Math.PI / 2;
  neck.position.set(0, 0.77, 0.02);
  g.add(neck);
  for (const s of [-1, 1]) {
    const lobe = sph(0.075, satin, [s * 0.09, 0.76, 0.27], [1.3, 0.8, 0.5], 14);
    lobe.rotation.z = s * 0.3;
  }
  sph(0.04, satin, [0, 0.76, 0.28], [1, 1, 0.8], 12);

  if (m.heart) {
    const sh = new THREE.Shape();
    sh.moveTo(0, -0.16);
    sh.bezierCurveTo(-0.05, -0.1, -0.2, -0.02, -0.2, 0.08);
    sh.bezierCurveTo(-0.2, 0.17, -0.12, 0.2, -0.06, 0.18);
    sh.bezierCurveTo(-0.03, 0.17, 0, 0.14, 0, 0.12);
    sh.bezierCurveTo(0, 0.14, 0.03, 0.17, 0.06, 0.18);
    sh.bezierCurveTo(0.12, 0.2, 0.2, 0.17, 0.2, 0.08);
    sh.bezierCurveTo(0.2, -0.02, 0.05, -0.1, 0, -0.16);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.05, bevelSegments: 5, curveSegments: 14 });
    track(geo);
    const heart = new THREE.Mesh(geo, satin);
    heart.position.set(0, 0.45, 0.52);
    heart.rotation.z = 0.12;
    g.add(heart);
  }
  g.scale.setScalar(scale);
  return g;
}

/* ------------------------------------------------------------------ *
 *  BALLOON — puffy foil heart / round latex, optional printed text.
 *  Origin = the knot; the balloon floats above, the string hangs below.
 * ------------------------------------------------------------------ */
function textTexture(text: string, color: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  const words = text.trim().split(/\s+/).filter(Boolean);
  // wrap into at most 3 lines
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length > 9 && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  const L = lines.slice(0, 3);
  const size = L.length === 1 ? 92 : L.length === 2 ? 84 : 68;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${size}px "Jost Variable", "Jost", system-ui, sans-serif`;
  const lh = size * 1.12;
  const y0 = c.height / 2 - ((L.length - 1) * lh) / 2;
  L.forEach((l, i) => ctx.fillText(l, c.width / 2, y0 + i * lh, 470));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function heartGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.55);
  s.bezierCurveTo(-0.15, -0.4, -0.62, -0.1, -0.62, 0.22);
  s.bezierCurveTo(-0.62, 0.52, -0.36, 0.62, -0.18, 0.58);
  s.bezierCurveTo(-0.08, 0.56, 0, 0.5, 0, 0.4);
  s.bezierCurveTo(0, 0.5, 0.08, 0.56, 0.18, 0.58);
  s.bezierCurveTo(0.36, 0.62, 0.62, 0.52, 0.62, 0.22);
  s.bezierCurveTo(0.62, -0.1, 0.15, -0.4, 0, -0.55);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.13, bevelThickness: 0.14, bevelSegments: 8, curveSegments: 24 });
  g.translate(0, 0, -0.06);
  return g;
}

function singleBalloon(
  shape: "heart" | "round",
  color: string,
  metal: boolean,
  text: string | undefined,
  textColor: string,
  track: (d: { dispose: () => void }) => void,
) {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    metalness: metal ? 0.85 : 0.05,
    roughness: metal ? 0.22 : 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: metal ? 1.6 : 1,
  });
  track(mat);
  let geo: THREE.BufferGeometry;
  let cy: number;
  let front: number;
  if (shape === "heart") {
    geo = heartGeometry();
    cy = 0.78;
    front = 0.26;
  } else {
    geo = new THREE.SphereGeometry(0.52, 36, 28);
    cy = 0.74;
    front = 0.52;
  }
  track(geo);
  const body = new THREE.Mesh(geo, mat);
  body.position.y = cy;
  if (shape === "round") body.scale.set(1, 1.16, 1);
  g.add(body);

  // knot
  const knotGeo = new THREE.ConeGeometry(0.05, 0.1, 12);
  track(knotGeo);
  const knot = new THREE.Mesh(knotGeo, mat);
  knot.rotation.x = Math.PI;
  knot.position.y = shape === "heart" ? 0.2 : 0.1;
  g.add(knot);

  // string
  const stringMat = new THREE.MeshStandardMaterial({ color: "#f3eee6", roughness: 0.6 });
  track(stringMat);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.12, 0),
    new THREE.Vector3(0.05, -0.4, 0.02),
    new THREE.Vector3(-0.04, -0.9, 0.03),
    new THREE.Vector3(0.05, -1.4, 0.0),
  ]);
  const sg = new THREE.TubeGeometry(curve, 24, 0.008, 4, false);
  track(sg);
  g.add(new THREE.Mesh(sg, stringMat));

  if (text && text.trim()) {
    const tex = textTexture(text, textColor);
    const pm = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
    track(pm);
    track(tex);
    const pg = new THREE.PlaneGeometry(shape === "heart" ? 0.86 : 0.82, shape === "heart" ? 0.54 : 0.51);
    track(pg);
    const plane = new THREE.Mesh(pg, pm);
    plane.position.set(0, cy + (shape === "heart" ? 0.08 : 0.04), front + 0.01);
    g.add(plane);
  }
  return g;
}

function buildBalloonGroup(m: BalloonModel, text: string | undefined, track: (d: { dispose: () => void }) => void) {
  const g = new THREE.Group();
  if (m.bundle) {
    const offs: [number, number, number, number][] = [
      [-0.5, 0.1, 0.0, 0.18],
      [0.45, 0.25, -0.1, -0.15],
      [0.0, 0.62, 0.15, 0.05],
    ];
    m.bundle.forEach((c, i) => {
      const b = singleBalloon("round", c, false, undefined, "#fff", track);
      b.position.set(offs[i][0], offs[i][1], offs[i][2]);
      b.rotation.z = offs[i][3];
      b.scale.setScalar(0.78);
      g.add(b);
    });
  } else {
    g.add(singleBalloon(m.shape, m.color, !!m.metal, text ?? m.text, m.textColor ?? "#ffffff", track));
  }
  return g;
}

/* ------------------------------------------------------------------ *
 *  Compose the extras around a bouquet (or on their own for catalogue shots).
 * ------------------------------------------------------------------ */
export function buildExtras(spec: ExtrasSpec, layout: "preview" | "single" = "preview"): ExtrasObject {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = (d: { dispose: () => void }) => disposables.push(d);
  const sway: { obj: THREE.Object3D; phase: number; base: number }[] = [];

  if (layout === "single") {
    if (spec.teddies[0]) {
      const t = buildTeddy(spec.teddies[0].model, 1, track);
      t.rotation.y = -0.35;
      group.add(t);
      group.position.y = -0.7 * Math.min(1.1, spec.teddies[0].scale) - 0.05;
      const s = Math.min(1.25, spec.teddies[0].scale);
      group.scale.setScalar(s * 0.95);
      group.position.y = -0.75 * s;
    } else if (spec.balloons[0]) {
      const b = buildBalloonGroup(spec.balloons[0].model, spec.balloons[0].text, track);
      b.rotation.y = -0.3;
      group.add(b);
      group.position.y = -0.62;
    }
  } else {
    const floor = -1.38;
    const tPos: [number, number, number, number][] = [
      [1.45, floor, 0.55, -0.55],
      [-1.5, floor, 0.5, 0.55],
    ];
    spec.teddies.slice(0, 2).forEach((t, i) => {
      const s = Math.min(1.1, Math.max(0.78, t.scale));
      const mesh = buildTeddy(t.model, s, track);
      mesh.position.set(tPos[i][0], tPos[i][1], tPos[i][2]);
      mesh.rotation.y = tPos[i][3];
      group.add(mesh);
    });
    const bPos: [number, number, number][] = [
      [-1.45, 0.25, -0.15],
      [1.5, 0.55, -0.35],
      [-0.2, 0.9, -1.0],
    ];
    spec.balloons.slice(0, 3).forEach((b, i) => {
      const mesh = buildBalloonGroup(b.model, b.text, track);
      mesh.position.set(...bPos[i]);
      mesh.scale.setScalar(0.92);
      group.add(mesh);
      sway.push({ obj: mesh, phase: i * 1.7, base: bPos[i][1] });
    });
  }

  return {
    group,
    tick: (t) => {
      for (const s of sway) {
        s.obj.position.y = s.base + Math.sin(t * 0.8 + s.phase) * 0.05;
        s.obj.rotation.z = Math.sin(t * 0.6 + s.phase) * 0.05;
      }
    },
    dispose: () => {
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) m.geometry.dispose();
      });
      disposables.forEach((d) => d.dispose());
    },
  };
}
