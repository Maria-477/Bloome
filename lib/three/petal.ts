import * as THREE from "three";

/** Small deterministic random number generator so bouquets are reproducible. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface PetalSpec {
  width: number;
  length: number;
  /** where along the length the petal is widest (0..1) */
  peak?: number;
  /** tip roundness exponent: 2+ round, ~1.2 pointed */
  tipPow?: number;
  /** edges curl toward the flower centre */
  cup?: number;
  /** tip curls backwards (away from centre) */
  curl?: number;
  /** middle bulges outwards (tulip) */
  bulge?: number;
  /** central ridge (lily) */
  crease?: number;
  /** wavy edge (peony) */
  ruffle?: number;
  phase?: number;
  base: THREE.Color;
  tip: THREE.Color;
  throat?: THREE.Color;
  throatLen?: number;
  su?: number;
  sv?: number;
}

/**
 * One petal: base at the origin, growing along +Y, concave face toward -Z,
 * so a pivot rotation about X tilts it outwards. Colours are baked as a
 * base→tip gradient into vertex colours.
 */
export function petalGeometry(s: PetalSpec): THREE.BufferGeometry {
  const su = s.su ?? 8;
  const sv = s.sv ?? 12;
  const peak = s.peak ?? 0.62;
  const te = s.tipPow ?? 2.2;
  const phase = s.phase ?? 0;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();

  for (let j = 0; j <= sv; j++) {
    const v = j / sv;
    // fan-shaped outline: grows from the claw, widest at `peak`, rounded (or pointed) tip
    const prof =
      v < peak
        ? Math.pow(Math.sin((Math.PI / 2) * (v / peak)), 0.8)
        : Math.pow(Math.max(0, 1 - Math.pow((v - peak) / (1 - peak), te)), 1 / te);
    for (let i = 0; i <= su; i++) {
      const u = (i / su) * 2 - 1;
      const x = u * prof * s.width * 0.5;
      let y = v * s.length;
      let z = 0;
      if (s.cup) z -= s.cup * s.width * 0.5 * u * u * prof * 0.9;
      if (s.curl) {
        const k = Math.pow(v, 2.4);
        z += s.curl * s.length * k * 0.55;
        y -= s.curl * s.length * k * 0.22;
      }
      if (s.bulge) z += s.bulge * s.length * Math.sin(Math.PI * Math.min(1, v * 1.05));
      if (s.crease) z += s.crease * s.width * 0.22 * (1 - Math.abs(u)) * Math.sin(Math.PI * v);
      if (s.ruffle) {
        z +=
          s.ruffle * s.length * 0.22 * Math.sin(u * 4.2 + phase) * Math.sin(v * 5.2 + phase * 1.3) * v * v;
      }
      pos.push(x, y, z);

      const t = smooth(Math.pow(v, 0.85));
      c.copy(s.base).lerp(s.tip, t);
      if (s.throat && s.throatLen && v < s.throatLen) {
        c.lerp(s.throat, 1 - smooth(v / s.throatLen));
      }
      // luminous edge, slightly darker centre line gives soft depth
      const edge = Math.pow(Math.abs(u), 2.2) * prof * 0.1;
      c.r = Math.min(1, c.r + edge);
      c.g = Math.min(1, c.g + edge);
      c.b = Math.min(1, c.b + edge);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let j = 0; j < sv; j++) {
    for (let i = 0; i < su; i++) {
      const a = j * (su + 1) + i;
      const b = a + 1;
      const d = a + su + 1;
      const e = d + 1;
      idx.push(a, b, d, b, e, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Generic parametric surface used for leaves & paper. */
export function parametricSurface(
  nu: number,
  nv: number,
  fn: (u: number, v: number, out: THREE.Vector3, color: THREE.Color) => void,
  withColor = false,
) {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  const c = new THREE.Color(1, 1, 1);
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      fn(i / nu, j / nv, p, c);
      pos.push(p.x, p.y, p.z);
      if (withColor) col.push(c.r, c.g, c.b);
    }
  }
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i;
      const b = a + 1;
      const d = a + nu + 1;
      const e = d + 1;
      idx.push(a, d, b, b, d, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  if (withColor) g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A leaf with a folded mid-rib, pointing along +Y. */
export function leafGeometry(
  length: number,
  width: number,
  base: THREE.Color,
  tip: THREE.Color,
  round = 0.6,
) {
  const c1 = new THREE.Color();
  return parametricSurface(
    4,
    8,
    (uu, v, out, color) => {
      const u = uu * 2 - 1;
      const prof = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(v, 0.8))), round);
      const x = u * prof * width * 0.5;
      const y = v * length;
      const z = -Math.abs(u) * prof * width * 0.22 + Math.pow(v, 2) * length * 0.12;
      out.set(x, y, z);
      c1.copy(base).lerp(tip, v);
      c1.multiplyScalar(0.92 + 0.12 * (1 - Math.abs(u)));
      color.copy(c1);
    },
    true,
  );
}
