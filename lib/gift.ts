import { ADDONS, BALLOONS, CARD_PRICES, CHOCOLATES, STUDIO_PRICES, TOYS, type CardDesignId, type Variant } from "@/data/catalog";
import { SIZE_LABEL, SIZE_MULT, productPrice, roundTo, type Product } from "@/data/site";
import { PALETTES, FLOWER_LABEL, WRAPS } from "@/lib/three/palettes";
import { SIZE_COUNT } from "@/lib/three/bouquet";
import type { BouquetConfig } from "@/lib/three/types";

export type GiftCategory = "choc" | "toy" | "balloon" | "addon";

export interface CardSelection {
  design: CardDesignId | null; // null = no card
  kind: "card" | "letter";
  message: string;
  to: string;
  from: string;
}
export interface BalloonCustom {
  text: string;
  shape: "heart" | "round";
  color: string;
}
export interface GiftSelection {
  /** "<category>:<itemId>:<variantId>" → quantity */
  qty: Record<string, number>;
  customBalloon: BalloonCustom;
  card: CardSelection;
}

export const EMPTY_GIFT: GiftSelection = {
  qty: {},
  customBalloon: { text: "", shape: "heart", color: "#f1a6b8" },
  card: { design: null, kind: "card", message: "", to: "", from: "" },
};

export interface PriceLine {
  id: string;
  label: string;
  detail?: string;
  qty: number;
  unit: number;
  group: "bouquet" | "custom" | "choc" | "toy" | "balloon" | "card" | "addon";
}
export const lineTotal = (l: PriceLine) => l.qty * l.unit;
export const sumLines = (ls: PriceLine[]) => ls.reduce((n, l) => n + lineTotal(l), 0);

export interface Resolved {
  category: GiftCategory;
  label: string;
  detail: string;
  variant: Variant;
  itemId: string;
}

/** find the catalogue entry behind a selection key */
export function resolveKey(key: string): Resolved | null {
  const [cat, itemId, variantId] = key.split(":");
  if (cat === "choc") {
    const it = CHOCOLATES.find((c) => c.id === itemId);
    const v = it?.variants.find((x) => x.id === variantId);
    if (it && v) return { category: "choc", label: `${it.brand === it.name ? it.name : `${it.brand} ${it.name}`}`, detail: v.label, variant: v, itemId };
  }
  if (cat === "toy") {
    const it = TOYS.find((c) => c.id === itemId);
    const v = it?.variants.find((x) => x.id === variantId);
    if (it && v) return { category: "toy", label: it.name, detail: v.label, variant: v, itemId };
  }
  if (cat === "balloon") {
    const it = BALLOONS.find((c) => c.id === itemId);
    const v = it?.variants.find((x) => x.id === variantId);
    if (it && v) return { category: "balloon", label: it.name, detail: v.label, variant: v, itemId };
  }
  if (cat === "addon") {
    const it = ADDONS.find((c) => c.id === itemId);
    const v = it?.variants.find((x) => x.id === variantId);
    if (it && v) return { category: "addon", label: it.name, detail: v.label, variant: v, itemId };
  }
  return null;
}

export const selectionKey = (cat: GiftCategory, itemId: string, variantId: string) => `${cat}:${itemId}:${variantId}`;

/** price lines for everything chosen in the Gift Builder (not the bouquet) */
export function giftLines(g: GiftSelection): PriceLine[] {
  const lines: PriceLine[] = [];
  for (const [key, qty] of Object.entries(g.qty)) {
    if (qty <= 0) continue;
    const r = resolveKey(key);
    if (!r || r.variant.stock === "out") continue;
    let detail = r.detail;
    if (r.itemId === "custom" && r.category === "balloon") detail = g.customBalloon.text ? `“${g.customBalloon.text}”` : "Custom text";
    lines.push({ id: key, label: r.label, detail, qty, unit: r.variant.price, group: r.category });
  }
  if (g.card.design) {
    const unit = g.card.kind === "letter" ? CARD_PRICES.letter : g.card.design === "blank" ? CARD_PRICES.blank : CARD_PRICES.card;
    lines.push({
      id: "card",
      label: g.card.kind === "letter" ? "Personal letter" : "Greeting card",
      detail: g.card.design === "blank" ? "Blank card" : g.card.design,
      qty: 1,
      unit,
      group: "card",
    });
  }
  return lines;
}

/* -------------------- bouquet pricing -------------------- */

/** itemised price of a bouquet built from scratch in the Studio */
export function studioLines(c: BouquetConfig): PriceLine[] {
  const P = STUDIO_PRICES;
  const m = SIZE_MULT[c.size];
  const lines: PriceLine[] = [
    { id: "base", label: `${SIZE_LABEL[c.size]} bouquet`, detail: "hand-tied base", qty: 1, unit: P.base[c.size], group: "bouquet" },
  ];
  for (const k of c.flowers) {
    lines.push({ id: `f-${k}`, label: FLOWER_LABEL[k], detail: "flower variety", qty: 1, unit: Math.round(P.flower[k] * m), group: "custom" });
  }
  const pres = c.presentation ?? "wrapped";
  if (P.style[c.style]) lines.push({ id: "style", label: "Arrangement style", detail: c.style, qty: 1, unit: P.style[c.style], group: "custom" });
  if (P.presentation[pres]) lines.push({ id: "pres", label: pres === "box" ? "Flower box" : "Flower basket", detail: "presentation", qty: 1, unit: P.presentation[pres], group: "custom" });
  if (pres === "wrapped" && P.wrap[c.wrap]) lines.push({ id: "wrap", label: WRAPS[c.wrap].name, detail: "wrapping paper", qty: 1, unit: P.wrap[c.wrap], group: "custom" });
  if (pres !== "wrapped" && c.wrap === "noir") lines.push({ id: "wrap", label: WRAPS[c.wrap].name, detail: "colour", qty: 1, unit: P.wrap.noir, group: "custom" });
  if (P.ribbonStyle[c.ribbonStyle]) lines.push({ id: "ribbon", label: c.ribbonStyle === "bow" ? "Silk bow" : "Ribbon band", detail: "ribbon", qty: 1, unit: P.ribbonStyle[c.ribbonStyle], group: "custom" });
  const defCount = SIZE_COUNT[c.size];
  const diff = (c.stems ?? defCount) - defCount;
  if (diff !== 0) lines.push({ id: "stems", label: diff > 0 ? `${diff} extra flower${diff > 1 ? "s" : ""}` : `${-diff} fewer flower${-diff > 1 ? "s" : ""}`, detail: "flower count", qty: 1, unit: diff * P.extraStem, group: "custom" });
  return lines;
}

/** the total of the Studio formula, used to price a customised catalogue bouquet */
export const studioTotal = (c: BouquetConfig) => sumLines(studioLines(c));

/**
 * Bouquet lines for the current Studio state.
 * If the customer started from a catalogue bouquet, its published price is the
 * base and only the *changes* are charged, so prices stay consistent everywhere.
 */
export function bouquetLines(c: BouquetConfig, origin: Product | null): PriceLine[] {
  if (!origin) return studioLines(c);
  const base = productPrice(origin, c.size);
  const lines: PriceLine[] = [
    { id: "base", label: origin.name, detail: `${SIZE_LABEL[c.size]} · ${PALETTES[c.palette].name}`, qty: 1, unit: base, group: "bouquet" },
  ];
  const delta = roundTo(studioTotal(c) - studioTotal({ ...origin.config, size: c.size }), 50);
  if (delta !== 0) lines.push({ id: "custom", label: "Customisation", detail: delta > 0 ? "changes to the original" : "simplified", qty: 1, unit: delta, group: "custom" });
  return lines;
}
