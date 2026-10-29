"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, Shuffle, ShoppingBag } from "lucide-react";
import Reveal from "@/components/Reveal";
import BouquetViewer, { type ViewerHandle } from "@/components/BouquetViewer";
import GiftBuilder, { CardPreview } from "@/components/GiftBuilder";
import { PALETTES, WRAPS, RIBBONS, FLOWER_LABEL } from "@/lib/three/palettes";
import { SIZE_COUNT } from "@/lib/three/bouquet";
import type { ExtrasSpec } from "@/lib/three/gifts";
import type { BouquetConfig, FlowerKind, PaletteId, PresentationId, RibbonColorId, RibbonStyleId, SizeId, StyleId, WrapId } from "@/lib/three/types";
import { PRODUCTS, SAMPLE_PRICE_NOTE, SIZE_LABEL, formatPrice, productPrice, type Product } from "@/data/site";
import { BALLOONS, DELIVERY_ZONES, STUDIO_PRICES, TOYS } from "@/data/catalog";
import { EMPTY_GIFT, bouquetLines, giftLines, lineTotal, resolveKey, sumLines, type GiftSelection } from "@/lib/gift";
import { deliveryFee, zoneById } from "@/lib/delivery";
import { STUDIO_EVENT, type StudioRequest } from "@/lib/studioBus";
import { useCart } from "@/lib/cart";

const DEFAULT: BouquetConfig = {
  style: "classic",
  flowers: ["rose", "peony"],
  palette: "blush",
  wrap: "cream",
  ribbon: "champagne",
  ribbonStyle: "bow",
  size: "classic",
  presentation: "wrapped",
  seed: 4,
};

const STYLES: { id: StyleId; name: string; note: string }[] = [
  { id: "classic", name: "Hand-tied", note: "Rounded & romantic" },
  { id: "dome", name: "Posy dome", note: "Tight & modern" },
  { id: "wild", name: "Garden wild", note: "Loose & airy" },
];
const RIBBON_STYLE: { id: RibbonStyleId; name: string }[] = [
  { id: "bow", name: "Silk bow" },
  { id: "band", name: "Band" },
  { id: "none", name: "None" },
];
const PRESENTATIONS: { id: PresentationId; name: string }[] = [
  { id: "wrapped", name: "Wrapped bouquet" },
  { id: "box", name: "Flower box" },
  { id: "basket", name: "Flower basket" },
];

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-ink/10 py-5">
      <legend className="sr-only">{title}</legend>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="eyebrow text-[0.68rem]">{title}</p>
        {hint && <p className="text-right text-xs text-ink-soft">{hint}</p>}
      </div>
      {children}
    </fieldset>
  );
}

/** what the 3D preview shows beside the bouquet (first 2 teddies, first 3 balloons) */
function extrasFor(g: GiftSelection): ExtrasSpec {
  const teddies: ExtrasSpec["teddies"] = [];
  const balloons: ExtrasSpec["balloons"] = [];
  for (const [key, n] of Object.entries(g.qty)) {
    if (n <= 0) continue;
    const r = resolveKey(key);
    if (!r || r.variant.stock === "out") continue;
    if (r.category === "toy") {
      const t = TOYS.find((x) => x.id === r.itemId)!;
      for (let i = 0; i < n; i++) teddies.push({ model: t.model, scale: t.scale[r.variant.id] ?? 1 });
    }
    if (r.category === "balloon") {
      const b = BALLOONS.find((x) => x.id === r.itemId)!;
      for (let i = 0; i < n; i++) {
        if (b.custom) {
          const c = g.customBalloon;
          balloons.push({ model: { shape: c.shape, color: c.color, metal: true, textColor: c.color === "#fbf7f1" || c.color === "#e6cf9c" ? "#5a2a3a" : "#ffffff" }, text: c.text || undefined });
        } else balloons.push({ model: b.model, text: b.model.text });
      }
    }
  }
  return { teddies: teddies.slice(0, 2), balloons: balloons.slice(0, 3) };
}

export default function Studio() {
  const { add, setOpen, zoneId, setZoneId } = useCart();
  const [tab, setTab] = useState<"bouquet" | "gifts">("bouquet");
  const [cfg, setCfg] = useState<BouquetConfig>(DEFAULT);
  const [origin, setOrigin] = useState<Product | null>(null);
  const [g, setG] = useState<GiftSelection>(EMPTY_GIFT);
  const viewer = useRef<ViewerHandle>(null);
  const set = <K extends keyof BouquetConfig>(k: K, v: BouquetConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  // requests from the collection / product pages / other routes
  useEffect(() => {
    const apply = (r: StudioRequest) => {
      if (r.productId) {
        const p = PRODUCTS.find((x) => x.id === r.productId);
        if (p) {
          const size = r.size && p.sizes.includes(r.size) ? r.size : p.config.size;
          setOrigin(p);
          setCfg({ ...DEFAULT, ...p.config, size, stems: undefined, presentation: p.config.presentation ?? "wrapped" });
          setG((s) => {
            const qty: Record<string, number> = {};
            (p.bundle ?? []).forEach((k) => (qty[k] = 1));
            return { ...s, qty };
          });
        }
      } else if (r.config) {
        setOrigin(null);
        setCfg({ ...DEFAULT, ...r.config });
      }
      if (r.tab) setTab(r.tab);
    };
    const onEvt = (e: Event) => apply((e as CustomEvent<StudioRequest>).detail ?? {});
    window.addEventListener(STUDIO_EVENT, onEvt);
    try {
      const raw = sessionStorage.getItem("bloome-studio-req");
      if (raw) {
        sessionStorage.removeItem("bloome-studio-req");
        apply(JSON.parse(raw) as StudioRequest);
      }
    } catch {
      /* ignore */
    }
    return () => window.removeEventListener(STUDIO_EVENT, onEvt);
  }, []);

  const toggleFlower = (k: FlowerKind) =>
    setCfg((c) => {
      const has = c.flowers.includes(k);
      if (has && c.flowers.length === 1) return c; // keep at least one
      return { ...c, flowers: has ? c.flowers.filter((f) => f !== k) : [...c.flowers, k] };
    });

  const stems = cfg.stems ?? SIZE_COUNT[cfg.size];
  const setStems = (n: number) => setCfg((c) => ({ ...c, stems: Math.max(5, Math.min(45, n)) === SIZE_COUNT[c.size] ? undefined : Math.max(5, Math.min(45, n)) }));
  const pres = cfg.presentation ?? "wrapped";

  const bLines = useMemo(() => bouquetLines(cfg, origin), [cfg, origin]);
  const gLines = useMemo(() => giftLines(g), [g]);
  const subtotal = sumLines(bLines) + sumLines(gLines);
  const zone = zoneById(zoneId);
  const fee = deliveryFee(zone, subtotal);
  const total = subtotal + (fee?.fee ?? 0);
  const extras = useMemo(() => extrasFor(g), [g]);
  const customBalloonMissingText = (g.qty["balloon:custom:std"] ?? 0) > 0 && !g.customBalloon.text.trim();
  const originOut = origin?.stock === "out";
  const blocked = customBalloonMissingText || originOut;

  const summary = `${SIZE_LABEL[cfg.size]} · ${origin ? origin.name : STYLES.find((s) => s.id === cfg.style)!.name} · ${cfg.flowers.map((f) => FLOWER_LABEL[f]).join(", ")} · ${PALETTES[cfg.palette].name} · ${pres === "wrapped" ? WRAPS[cfg.wrap].name : PRESENTATIONS.find((p) => p.id === pres)!.name}`;

  const addToBag = () => {
    if (blocked) return;
    const lines = [...bLines, ...gLines].map((l) => ({ label: l.label, detail: l.detail, qty: l.qty, unit: l.unit }));
    const hasGifts = gLines.length > 0;
    add({
      key: `studio-${JSON.stringify(cfg)}-${JSON.stringify(g)}-${origin?.id ?? ""}`,
      name: origin ? (hasGifts ? `${origin.name} gift set` : origin.name) : hasGifts ? "Your custom gift" : "Your custom bouquet",
      detail: summary,
      unitPrice: subtotal,
      message: g.card.design && g.card.design !== "blank" && g.card.message ? g.card.message : undefined,
      config: cfg,
      lines,
    });
    setOpen(true);
  };

  const reset = () => {
    setCfg(DEFAULT);
    setOrigin(null);
    setG(EMPTY_GIFT);
    viewer.current?.reset();
  };

  return (
    <section id="studio" className="relative px-5 py-24 md:px-10 md:py-36">
      <div id="gift-builder" className="absolute top-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
        style={{ background: "linear-gradient(180deg, transparent, rgba(242,211,214,0.35) 30%, rgba(231,236,220,0.5) 80%, transparent)" }}
      />
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-12 max-w-3xl">
          <p className="eyebrow mb-5 text-rose-deep">The Bouquet Studio</p>
          <h2 className="h-xl text-balance">
            Compose something <span className="italic-accent">only you</span> would give.
          </h2>
          <p className="mt-6 max-w-xl text-ink-soft">
            Every choice rebuilds the 3D bouquet in front of you — and with the Gift Builder you can add chocolates, a teddy, balloons and a handwritten note. Prices update live.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="relative h-[62svh] min-h-[420px] overflow-hidden rounded-[2.2rem] lg:h-[calc(100svh-8rem)] lg:max-h-[760px]"
              style={{
                background: `radial-gradient(80% 60% at 50% 38%, ${PALETTES[cfg.palette].swatch[1]}99, ${PALETTES[cfg.palette].swatch[2]}33 60%, transparent), linear-gradient(180deg,#fbf3ec,#f3e5dc)`,
              }}
            >
              <BouquetViewer ref={viewer} config={cfg} extras={extras} className="absolute inset-0" fill={0.74} label="Your gift preview — drag to rotate" />
              {g.card.design && (
                <div className="pointer-events-none absolute bottom-4 left-4 w-[150px] -rotate-3 md:w-[185px]">
                  <CardPreview g={g} />
                </div>
              )}
              <div className="absolute right-5 top-5 text-right">
                <p className="eyebrow text-[0.6rem] text-ink-soft">Your total</p>
                <p className="font-display text-4xl font-light md:text-5xl" aria-live="polite">{formatPrice(subtotal)}</p>
                <p className="text-[0.65rem] text-ink-soft">+ delivery</p>
              </div>
              <p className="eyebrow absolute left-5 top-5 text-[0.6rem] text-ink-soft">Drag to rotate</p>
            </div>
            <p className="mt-3 text-center text-xs text-ink-soft">
              {extras.teddies.length + extras.balloons.length > 0 ? "Teddies and balloons are shown beside your bouquet. " : ""}
              Chocolates, cards and add-ons are listed in your itemised summary.
            </p>
          </div>

          {/* controls */}
          <div>
            <div className="mb-2 flex gap-2" role="tablist" aria-label="Studio sections">
              <button role="tab" aria-selected={tab === "bouquet"} className="chip" onClick={() => setTab("bouquet")}>1 · Design the bouquet</button>
              <button role="tab" aria-selected={tab === "gifts"} className="chip" onClick={() => setTab("gifts")}>2 · Gift Builder</button>
            </div>

            {origin && (
              <p className="mb-1 mt-3 rounded-2xl bg-white/50 px-4 py-3 text-xs text-ink-soft">
                Starting from <b className="text-ink">{origin.name}</b> ({formatPrice(productPrice(origin, cfg.size))}). Change anything below — only the differences are charged.{" "}
                <button className="underline" onClick={() => setOrigin(null)}>Price as a new design</button>
              </p>
            )}

            {tab === "bouquet" && (
              <div role="tabpanel">
                <Group title="1 · Presentation" hint={pres === "wrapped" ? "Paper wrap" : "Arranged in a vessel"}>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Presentation">
                    {PRESENTATIONS.map((p) => (
                      <button key={p.id} role="radio" aria-checked={pres === p.id} className="chip" onClick={() => set("presentation", p.id)}>
                        {p.name}
                        {STUDIO_PRICES.presentation[p.id] > 0 && ` · +${formatPrice(STUDIO_PRICES.presentation[p.id])}`}
                      </button>
                    ))}
                  </div>
                </Group>

                <Group title="2 · Style" hint={STYLES.find((s) => s.id === cfg.style)?.note}>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Bouquet style">
                    {STYLES.map((s) => (
                      <button key={s.id} role="radio" aria-checked={cfg.style === s.id} className="chip" onClick={() => set("style", s.id)}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </Group>

                <Group title="3 · Flowers" hint="Choose one or more">
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(FLOWER_LABEL) as FlowerKind[]).map((k) => (
                      <button key={k} aria-pressed={cfg.flowers.includes(k)} className="chip" onClick={() => toggleFlower(k)}>
                        {FLOWER_LABEL[k]}
                      </button>
                    ))}
                  </div>
                </Group>

                <Group title="4 · Number of flowers" hint={`Standard for ${SIZE_LABEL[cfg.size]}: ${SIZE_COUNT[cfg.size]} · ${formatPrice(STUDIO_PRICES.extraStem)} per extra`}>
                  <div className="inline-flex items-center gap-3 rounded-full border border-ink/15 bg-white/60 p-1">
                    <button type="button" aria-label="Fewer flowers" onClick={() => setStems(stems - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-rose/20"><Minus size={15} /></button>
                    <span className="min-w-16 text-center text-sm tabular-nums" aria-live="polite">{stems} flowers</span>
                    <button type="button" aria-label="More flowers" onClick={() => setStems(stems + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-rose/20"><Plus size={15} /></button>
                  </div>
                </Group>

                <Group title="5 · Colour palette" hint={PALETTES[cfg.palette].name}>
                  <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Colour palette">
                    {(Object.keys(PALETTES) as PaletteId[]).map((p) => (
                      <button
                        key={p}
                        role="radio"
                        aria-checked={cfg.palette === p}
                        aria-label={PALETTES[p].name}
                        title={PALETTES[p].name}
                        onClick={() => set("palette", p)}
                        className={`flex h-12 w-12 overflow-hidden rounded-full ring-offset-2 ring-offset-ivory transition ${cfg.palette === p ? "ring-2 ring-ink" : "ring-1 ring-ink/15 hover:ring-rose"}`}
                      >
                        {PALETTES[p].swatch.map((c) => (
                          <span key={c} className="h-full flex-1" style={{ background: c }} />
                        ))}
                      </button>
                    ))}
                  </div>
                </Group>

                <Group title={pres === "wrapped" ? "6 · Wrapping paper" : "6 · Box / basket colour"} hint={WRAPS[cfg.wrap].name}>
                  <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Wrapping paper">
                    {(Object.keys(WRAPS) as WrapId[]).map((w) => (
                      <button
                        key={w}
                        role="radio"
                        aria-checked={cfg.wrap === w}
                        aria-label={WRAPS[w].name}
                        title={`${WRAPS[w].name}${STUDIO_PRICES.wrap[w] ? ` (+${formatPrice(STUDIO_PRICES.wrap[w])})` : ""}`}
                        onClick={() => set("wrap", w)}
                        className={`h-11 w-11 rounded-full ring-offset-2 ring-offset-ivory transition ${cfg.wrap === w ? "ring-2 ring-ink" : "ring-1 ring-ink/15 hover:ring-rose"}`}
                        style={{ background: `linear-gradient(135deg, ${WRAPS[w].inner}, ${WRAPS[w].outer})` }}
                      />
                    ))}
                  </div>
                </Group>

                <Group title="7 · Ribbon" hint={cfg.ribbonStyle === "none" ? "No ribbon" : RIBBONS[cfg.ribbon].name}>
                  <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Ribbon style">
                    {RIBBON_STYLE.map((r) => (
                      <button key={r.id} role="radio" aria-checked={cfg.ribbonStyle === r.id} className="chip" onClick={() => set("ribbonStyle", r.id)}>
                        {r.name}
                      </button>
                    ))}
                  </div>
                  <div className={`mt-4 flex gap-3 transition-opacity ${cfg.ribbonStyle === "none" ? "pointer-events-none opacity-30" : ""}`} role="radiogroup" aria-label="Ribbon colour">
                    {(Object.keys(RIBBONS) as RibbonColorId[]).map((r) => (
                      <button
                        key={r}
                        role="radio"
                        aria-checked={cfg.ribbon === r}
                        aria-label={RIBBONS[r].name}
                        title={RIBBONS[r].name}
                        onClick={() => set("ribbon", r)}
                        className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-ivory transition ${cfg.ribbon === r ? "ring-2 ring-ink" : "ring-1 ring-ink/15 hover:ring-rose"}`}
                        style={{ background: RIBBONS[r].color }}
                      />
                    ))}
                  </div>
                </Group>

                <Group title="8 · Size" hint="Larger bouquets hold more blooms">
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Bouquet size">
                    {(Object.keys(SIZE_LABEL) as SizeId[]).map((s) => (
                      <button key={s} role="radio" aria-checked={cfg.size === s} className="chip" onClick={() => setCfg((c) => ({ ...c, size: s, stems: undefined }))}>
                        {SIZE_LABEL[s]} · {SIZE_COUNT[s]} flowers
                      </button>
                    ))}
                  </div>
                </Group>

                <button className="btn btn-ghost mt-2" onClick={() => setTab("gifts")}>
                  Next: add gifts →
                </button>
              </div>
            )}

            {tab === "gifts" && (
              <div role="tabpanel" className="pt-5">
                <GiftBuilder g={g} setG={setG} />
              </div>
            )}

            {/* itemised summary */}
            <div className="mt-8 rounded-[1.6rem] border border-ink/10 bg-white/60 p-5">
              <p className="eyebrow mb-3 text-[0.68rem]">Your itemised summary</p>
              <ul className="divide-y divide-ink/8 text-sm">
                {[...bLines, ...gLines].map((l) => (
                  <li key={l.id} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="min-w-0">
                      {l.qty > 1 && <span className="text-ink-soft">{l.qty} × </span>}
                      {l.label}
                      {l.detail && <span className="block truncate text-xs text-ink-soft">{l.detail}</span>}
                    </span>
                    <span className="shrink-0 tabular-nums">{lineTotal(l) < 0 ? "− " : ""}{formatPrice(Math.abs(lineTotal(l)))}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-baseline justify-between border-t border-ink/15 pt-3 text-sm">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <span>Delivery to</span>
                  <select
                    value={zoneId ?? ""}
                    onChange={(e) => setZoneId(e.target.value || null)}
                    aria-label="Delivery city"
                    className="rounded-full border border-ink/15 bg-white/80 px-3 py-1.5 text-sm outline-none focus:border-rose"
                  >
                    <option value="">Choose city…</option>
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>{z.city}</option>
                    ))}
                  </select>
                </label>
                <span className="tabular-nums">{fee ? (fee.free ? "Free" : formatPrice(fee.fee)) : "—"}</span>
              </div>
              {fee && !fee.free && <p className="mt-1 text-xs text-ink-soft">Add {formatPrice(fee.toFree)} more for free delivery to {zone!.city}.</p>}
              {!fee && <p className="mt-1 text-xs text-ink-soft">Pick a city to see the delivery fee. We only confirm orders for supported cities.</p>}
              <div className="mt-3 flex items-baseline justify-between border-t border-ink/15 pt-3">
                <span className="font-medium">{fee ? "Total" : "Total before delivery"}</span>
                <span className="font-display text-3xl font-light tabular-nums" aria-live="polite">{formatPrice(total)}</span>
              </div>
              <p className="mt-2 text-[0.7rem] text-ink-soft">{SAMPLE_PRICE_NOTE}</p>
            </div>

            {blocked && (
              <p className="mt-3 text-sm text-rose-deep" role="alert">
                {originOut ? "This bouquet is sold out right now — choose another from the collection or design your own." : "Add the message for your personalised balloon before adding to your bag."}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button className="btn btn-solid disabled:opacity-40" onClick={addToBag} disabled={blocked}>
                <ShoppingBag size={16} /> {gLines.length ? "Add gift to bag" : "Add to bag"} · {formatPrice(subtotal)}
              </button>
              <button className="btn btn-ghost" onClick={() => set("seed", (cfg.seed * 7 + 3) % 97)}>
                <Shuffle size={15} /> Shuffle
              </button>
              <button className="btn btn-ghost" onClick={reset}>
                <RotateCcw size={15} /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
