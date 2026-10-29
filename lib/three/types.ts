export type FlowerKind = "rose" | "peony" | "tulip" | "lily" | "wild";
export type StyleId = "classic" | "dome" | "wild";
export type SizeId = "petite" | "classic" | "grand";
export type PaletteId = "blush" | "ivory" | "sunset" | "lavender" | "crimson";
export type WrapId = "cream" | "blush" | "sage" | "kraft" | "noir";
export type RibbonColorId = "champagne" | "rose" | "sage" | "ivory" | "wine";
export type RibbonStyleId = "bow" | "band" | "none";
export type PresentationId = "wrapped" | "box" | "basket";

export interface BouquetConfig {
  style: StyleId;
  flowers: FlowerKind[];
  palette: PaletteId;
  wrap: WrapId;
  ribbon: RibbonColorId;
  ribbonStyle: RibbonStyleId;
  size: SizeId;
  seed: number;
  /** how the bouquet is presented (default: hand-tied & wrapped) */
  presentation?: PresentationId;
  /** override the number of flower heads (defaults to the size's count) */
  stems?: number;
}

export interface Pose {
  /** horizontal offset, fraction of viewport width (-0.5 … 0.5) */
  x: number;
  /** vertical offset, fraction of viewport height */
  y: number;
  scale: number;
  rotY: number;
  rotX: number;
  /** 0 = closed buds, 1 = fully open */
  bloom: number;
  /** 0 = airy daylight, 1 = golden-hour glow */
  mood: number;
}

export const DEFAULT_POSE: Pose = {
  x: 0,
  y: 0,
  scale: 1,
  rotY: 0,
  rotX: 0,
  bloom: 0.85,
  mood: 0,
};
