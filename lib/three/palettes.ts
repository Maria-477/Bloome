import type { PaletteId, WrapId, RibbonColorId, FlowerKind } from "./types";

export interface PaletteDef {
  id: PaletteId;
  name: string;
  /** swatch for UI */
  swatch: string[];
  /** [base, tip] colour pairs per flower slot */
  rose: [string, string];
  peony: [string, string];
  tulip: [string, string];
  lily: [string, string];
  wild: [string, string];
}

export const PALETTES: Record<PaletteId, PaletteDef> = {
  blush: {
    id: "blush",
    name: "Blush Garden",
    swatch: ["#d98b9b", "#f2c6cf", "#fbe9e4"],
    rose: ["#c9536c", "#f0a9b8"],
    peony: ["#e7a1b4", "#fde3e8"],
    tulip: ["#d9627d", "#f7b7c3"],
    lily: ["#f4e3df", "#fffaf6"],
    wild: ["#f7f0ea", "#ffffff"],
  },
  ivory: {
    id: "ivory",
    name: "Ivory & Sage",
    swatch: ["#f4ead8", "#e8d9b5", "#a9b89a"],
    rose: ["#e4d2b0", "#fbf3df"],
    peony: ["#f1e4d0", "#fffaf0"],
    tulip: ["#efe2c4", "#fffcf2"],
    lily: ["#f7f1e1", "#ffffff"],
    wild: ["#fdfbf4", "#ffffff"],
  },
  sunset: {
    id: "sunset",
    name: "Golden Hour",
    swatch: ["#f08a5d", "#f7b267", "#f9dcc4"],
    rose: ["#e8704a", "#f9b27c"],
    peony: ["#f4a582", "#fde0c4"],
    tulip: ["#f2b134", "#ffe29a"],
    lily: ["#f9c9a0", "#fff0dd"],
    wild: ["#fbe4a8", "#fffbe9"],
  },
  lavender: {
    id: "lavender",
    name: "Lavender Dream",
    swatch: ["#9a86c9", "#c9bce6", "#f2d4e0"],
    rose: ["#a58cd0", "#dccdf2"],
    peony: ["#e6b3cf", "#fbe6f0"],
    tulip: ["#8d72bf", "#cdbcec"],
    lily: ["#efe3f6", "#fffaff"],
    wild: ["#d9cdf0", "#ffffff"],
  },
  crimson: {
    id: "crimson",
    name: "Crimson Romance",
    swatch: ["#8f1b36", "#c9304f", "#f0a3ae"],
    rose: ["#7d1230", "#d3425f"],
    peony: ["#c2415f", "#f4a9b6"],
    tulip: ["#a3172f", "#e2566d"],
    lily: ["#f8dfe0", "#fffafa"],
    wild: ["#f4d5d8", "#ffffff"],
  },
};

export interface WrapDef {
  id: WrapId;
  name: string;
  outer: string;
  inner: string;
  extra: number;
}
export const WRAPS: Record<WrapId, WrapDef> = {
  cream: { id: "cream", name: "Cream Linen", outer: "#f3ead9", inner: "#fbf6ec", extra: 0 },
  blush: { id: "blush", name: "Blush Silk", outer: "#f0c9cf", inner: "#fbe9ea", extra: 4 },
  sage: { id: "sage", name: "Sage Paper", outer: "#a9b89a", inner: "#dfe6d3", extra: 4 },
  kraft: { id: "kraft", name: "Soft Kraft", outer: "#c9a77c", inner: "#e9d8bd", extra: 0 },
  noir: { id: "noir", name: "Midnight Noir", outer: "#2b2630", inner: "#4a4252", extra: 8 },
};

export interface RibbonDef {
  id: RibbonColorId;
  name: string;
  color: string;
}
export const RIBBONS: Record<RibbonColorId, RibbonDef> = {
  champagne: { id: "champagne", name: "Champagne", color: "#d9b878" },
  rose: { id: "rose", name: "Rose", color: "#d27a8d" },
  sage: { id: "sage", name: "Sage", color: "#7f9a78" },
  ivory: { id: "ivory", name: "Ivory", color: "#f6efe2" },
  wine: { id: "wine", name: "Wine", color: "#7a1f3a" },
};

export const FLOWER_LABEL: Record<FlowerKind, string> = {
  rose: "Garden Rose",
  peony: "Peony",
  tulip: "Tulip",
  lily: "Lily",
  wild: "Wildflower",
};
