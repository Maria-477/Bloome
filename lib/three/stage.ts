import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildBouquet, buildSingleBloom, type BouquetObject } from "./bouquet";
import type { ExtrasObject } from "./gifts";
import { DEFAULT_POSE, type BouquetConfig, type FlowerKind, type PaletteId, type Pose } from "./types";

export interface StageOptions {
  canvas: HTMLCanvasElement;
  /** reduce geometry & pixel ratio for phones */
  low?: boolean;
  maxDpr?: number;
  /** fraction of the viewport height the bouquet fills at scale 1 */
  fill?: number;
  preserveDrawingBuffer?: boolean;
}

const KEY_DAY = new THREE.Color("#fff3e4");
const KEY_GOLD = new THREE.Color("#ffd49a");
const RIM_DAY = new THREE.Color("#ffd3de");
const RIM_GOLD = new THREE.Color("#ffab5e");
const SKY_DAY = new THREE.Color("#fff7f0");
const SKY_GOLD = new THREE.Color("#ffe4b8");
const GROUND_DAY = new THREE.Color("#f2c9cf");
const GROUND_GOLD = new THREE.Color("#8a5a35");

/**
 * Owns a WebGL renderer + camera + lights and a single bouquet.
 * The caller drives `pose` and calls `render()` (usually from a ticker).
 */
export class BouquetStage {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  readonly pose: Pose = { ...DEFAULT_POSE };
  /** manual rotation added by dragging */
  userYaw = 0;
  userPitch = 0;
  /** gentle idle sway (disabled for reduced-motion) */
  idle = true;
  bouquet: BouquetObject | null = null;
  extras: ExtrasObject | null = null;
  private extraSpan = 1;
  width = 1;
  height = 1;

  private holder = new THREE.Group();
  private key = new THREE.DirectionalLight("#fff3e4", 1.9);
  private rim = new THREE.DirectionalLight("#ffd3de", 1.3);
  private hemi = new THREE.HemisphereLight("#fff7f0", "#f2c9cf", 1.0);
  private glow = new THREE.PointLight("#ffcf8a", 0, 12, 2);
  private envTex: THREE.Texture;
  private low: boolean;
  fill: number;
  private dist = 10;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private disposed = false;
  private time = 0;

  constructor(opts: StageOptions) {
    this.canvas = opts.canvas;
    this.low = !!opts.low;
    this.fill = opts.fill ?? 0.74;
    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: !!opts.preserveDrawingBuffer,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr ?? (this.low ? 1.5 : 2)));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setClearColor(0x000000, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = new RoomEnvironment();
    this.envTex = pmrem.fromScene(env, 0.04).texture;
    env.dispose();
    pmrem.dispose();
    this.scene.environment = this.envTex;
    this.scene.environmentIntensity = 0.32;

    this.key.position.set(3.2, 5.2, 4.5);
    this.rim.position.set(-4.5, 2.5, -3.5);
    this.glow.position.set(0, 1.2, 2.2);
    this.scene.add(this.hemi, this.key, this.rim, this.glow, this.holder);
    this.camera.position.set(0, 0, this.dist);
  }

  setBouquet(config: BouquetConfig) {
    if (this.bouquet) {
      this.holder.remove(this.bouquet.group);
      this.bouquet.dispose();
    }
    this.bouquet = buildBouquet(config, this.low);
    this.holder.add(this.bouquet.group);
    this.bouquet.setBloom(this.pose.bloom);
    this.lastBloom = this.pose.bloom;
  }

  /** Show teddies / balloons next to the bouquet (null to clear). */
  setExtras(e: ExtrasObject | null) {
    if (this.extras) {
      this.holder.remove(this.extras.group);
      this.extras.dispose();
    }
    this.extras = e;
    if (e) this.holder.add(e.group);
    this.extraSpan = e ? 1.75 : 1;
    this.resize();
  }

  /** Replace everything with a custom object (catalogue shots). */
  setObject(obj: BouquetObject) {
    if (this.bouquet) {
      this.holder.remove(this.bouquet.group);
      this.bouquet.dispose();
    }
    this.bouquet = obj;
    this.holder.add(obj.group);
  }

  setSingleBloom(kind: FlowerKind, palette: PaletteId, seed = 5) {
    if (this.bouquet) {
      this.holder.remove(this.bouquet.group);
      this.bouquet.dispose();
    }
    this.bouquet = buildSingleBloom(kind, palette, seed, this.low);
    this.holder.add(this.bouquet.group);
    this.bouquet.setBloom(this.pose.bloom);
    this.lastBloom = this.pose.bloom;
  }

  private lastBloom = -1;

  resize(w?: number, h?: number) {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(w ?? rect.width));
    const height = Math.max(1, Math.round(h ?? rect.height));
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // distance so the bouquet (≈3.9 tall, ≈2.9 wide) fits comfortably
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const fitH = (3.3 * (this.extras ? 1.08 : 1)) / this.fill / 2 / t;
    const fitW = (2.9 * this.extraSpan) / 0.92 / 2 / t / this.camera.aspect;
    this.dist = Math.max(fitH, fitW);
    this.camera.position.z = this.dist;
    this.camera.updateProjectionMatrix();
  }

  setPointer(nx: number, ny: number) {
    this.mouse.tx = nx;
    this.mouse.ty = ny;
  }

  /** project an anchor into canvas CSS pixels */
  project(obj: THREE.Object3D): { x: number; y: number; facing: number } {
    const v = new THREE.Vector3();
    obj.getWorldPosition(v);
    const facing = v.z - this.holder.position.z; // >0 : toward the camera
    v.project(this.camera);
    return { x: (v.x * 0.5 + 0.5) * this.width, y: (-v.y * 0.5 + 0.5) * this.height, facing };
  }

  render(dt = 0.016) {
    if (this.disposed) return;
    this.time += dt;
    const p = this.pose;
    const visH = 2 * this.dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const visW = visH * this.camera.aspect;

    this.extras?.tick(this.time);
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.06;

    const sway = this.idle ? Math.sin(this.time * 0.9) : 0;
    const bob = this.idle ? Math.sin(this.time * 0.7 + 1) : 0;
    this.holder.position.set(p.x * visW, p.y * visH + bob * 0.045, 0);
    this.holder.scale.setScalar(p.scale);
    this.holder.rotation.set(
      p.rotX + this.userPitch + this.mouse.y * 0.08,
      p.rotY + this.userYaw + this.mouse.x * 0.18 + (this.idle ? Math.sin(this.time * 0.45) * 0.05 : 0),
      sway * 0.022,
      "YXZ",
    );

    if (this.bouquet && Math.abs(p.bloom - this.lastBloom) > 0.002) {
      this.bouquet.setBloom(p.bloom);
      this.lastBloom = p.bloom;
    }

    const m = p.mood;
    this.key.color.lerpColors(KEY_DAY, KEY_GOLD, m);
    this.key.intensity = 1.9 + m * 0.6;
    this.rim.color.lerpColors(RIM_DAY, RIM_GOLD, m);
    this.rim.intensity = 1.1 + m * 1.2;
    this.hemi.color.lerpColors(SKY_DAY, SKY_GOLD, m);
    this.hemi.groundColor.lerpColors(GROUND_DAY, GROUND_GOLD, m);
    this.hemi.intensity = 0.8 - m * 0.1;
    this.glow.intensity = m * 14;
    this.scene.environmentIntensity = 0.3 - m * 0.08;

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    if (this.bouquet) {
      this.holder.remove(this.bouquet.group);
      this.bouquet.dispose();
      this.bouquet = null;
    }
    if (this.extras) {
      this.holder.remove(this.extras.group);
      this.extras.dispose();
      this.extras = null;
    }
    this.envTex.dispose();
    this.renderer.dispose();
  }
}
