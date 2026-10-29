"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Minus, Plus, Check } from "lucide-react";
import BouquetViewer, { type ViewerHandle } from "@/components/BouquetViewer";
import { PRODUCTS, SAMPLE_PRICE_NOTE, SIZE_LABEL, STOCK_LABEL, formatPrice, productPrice } from "@/data/site";
import { openStudio } from "@/lib/studioBus";
import { useCart } from "@/lib/cart";
import { lockScroll, scrollToId } from "@/lib/scroll";
import type { SizeId } from "@/lib/three/types";

const VIEWS: { label: string; yaw: number; pitch: number }[] = [
  { label: "Front", yaw: -0.25, pitch: 0 },
  { label: "Side", yaw: 1.3, pitch: 0 },
  { label: "Back", yaw: 2.9, pitch: 0 },
  { label: "Above", yaw: -0.25, pitch: 0.65 },
];

export default function ProductModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const product = useMemo(() => PRODUCTS.find((p) => p.id === id) ?? null, [id]);
  const { add, setOpen } = useCart();
  const [size, setSize] = useState<SizeId>("classic");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [view, setView] = useState(0);
  const [added, setAdded] = useState(false);
  const viewer = useRef<ViewerHandle>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    setSize(product.config.size);
    setQty(1);
    setMessage("");
    setView(0);
    setAdded(false);
    lockScroll(true);
    const t = setTimeout(() => closeBtn.current?.focus(), 80);
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", key);
      lockScroll(false);
    };
  }, [product, onClose]);

  if (!product) return null;
  const unit = productPrice(product, size);
  const config = { ...product.config, size };
  const out = product.stock === "out";
  const toStudio = (tab: "bouquet" | "gifts") => {
    onClose();
    setTimeout(() => {
      openStudio({ productId: product.id, size, tab });
      scrollToId("studio");
    }, 280);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="absolute inset-0 bg-[#2a1d1a]/55 backdrop-blur-sm" onClick={onClose} />
      <div
        data-lenis-prevent
        className="relative grid max-h-[94svh] w-full max-w-[1150px] overflow-y-auto rounded-t-[2rem] bg-ivory shadow-2xl md:max-h-[88vh] md:grid-cols-2 md:rounded-[2rem]"
      >
        <button
          ref={closeBtn}
          onClick={onClose}
          aria-label="Close"
          className="glass absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full"
        >
          <X size={18} />
        </button>

        <div
          className="relative min-h-[52vh] md:min-h-[600px]"
          style={{ background: `radial-gradient(90% 70% at 50% 35%, ${product.accent}77, ${product.accent}1a 65%, transparent), #f8efe6` }}
        >
          <BouquetViewer ref={viewer} config={config} className="absolute inset-0" fill={0.7} initialYaw={-0.25} label={`${product.name} — drag to rotate`} />
          <div className="absolute inset-x-0 bottom-4 flex flex-wrap items-center justify-center gap-2 px-4">
            {VIEWS.map((v, i) => (
              <button
                key={v.label}
                className="chip text-[0.7rem] uppercase tracking-[0.14em]"
                aria-pressed={view === i}
                onClick={() => {
                  setView(i);
                  viewer.current?.setView(v.yaw, v.pitch);
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="eyebrow absolute left-5 top-5 text-[0.62rem] text-ink-soft">Drag to rotate · live 3D</p>
        </div>

        <div className="flex flex-col gap-6 p-7 md:p-10">
          <div>
            <p className="eyebrow mb-3 text-rose-deep">{product.kicker}</p>
            <h2 className="h-lg">{product.name}</h2>
            <p className="mt-4 text-ink-soft">{product.blurb}</p>
          </div>
          <div className="flex items-baseline justify-between border-y border-ink/10 py-4">
            <span className="font-display text-4xl font-light">{formatPrice(unit)}</span>
            <span className="flex items-center gap-2 text-sm text-ink-soft">
              <span
                className={`h-2 w-2 rounded-full ${product.stock === "in" ? "bg-sage" : product.stock === "low" ? "bg-gold" : "bg-rose"}`}
              />
              {STOCK_LABEL[product.stock]}
            </span>
          </div>

          <p className="-mt-3 text-[0.7rem] text-ink-soft">{SAMPLE_PRICE_NOTE}</p>
          <div>
            <p className="eyebrow mb-3 text-[0.66rem] text-ink-soft">Flower composition</p>
            <ul className="flex flex-wrap gap-2">
              {product.composition.map((c) => (
                <li key={c} className="rounded-full bg-blush/50 px-3 py-1 text-[0.8rem]">
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-soft">{product.varieties}</p>
          </div>

          <div>
            <p className="eyebrow mb-3 text-[0.66rem] text-ink-soft">Size</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Bouquet size">
              {product.sizes.map((s) => (
                <button key={s} role="radio" aria-checked={size === s} className="chip" onClick={() => setSize(s)}>
                  {SIZE_LABEL[s]} · {formatPrice(productPrice(product, s))}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
            <div>
              <p className="eyebrow mb-3 text-[0.66rem] text-ink-soft">Quantity</p>
              <div className="inline-flex items-center rounded-full border border-ink/15 bg-white/60">
                <button className="grid h-11 w-11 place-items-center" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center tabular-nums" aria-live="polite">{qty}</span>
                <button className="grid h-11 w-11 place-items-center" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(20, q + 1))}>
                  <Plus size={15} />
                </button>
              </div>
            </div>
            <label className="block">
              <span className="eyebrow mb-3 block text-[0.66rem] text-ink-soft">Personal message (optional)</span>
              <input
                value={message}
                maxLength={140}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="With love, always…"
                className="w-full rounded-full border border-ink/15 bg-white/60 px-5 py-3 text-sm outline-none transition focus:border-rose"
              />
            </label>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <button
              className="btn btn-solid flex-1 justify-center disabled:opacity-40"
              disabled={out}
              onClick={() => {
                add({
                  key: `${product.id}-${size}-${message}`,
                  name: product.name,
                  detail: `${SIZE_LABEL[size]}`,
                  unitPrice: unit,
                  qty,
                  message: message || undefined,
                  config,
                });
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
            >
              {out ? (
                <>Sold out</>
              ) : added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>Add to bag · {formatPrice(unit * qty)}</>
              )}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                onClose();
                setTimeout(() => setOpen(true), 250);
              }}
            >
              View bag
            </button>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-ink/10 pt-5">
            <button className="btn btn-ghost" onClick={() => toStudio("bouquet")}>Customize this bouquet</button>
            <button className="btn btn-ghost" onClick={() => toStudio("gifts")}>Add gifts</button>
          </div>
        </div>
      </div>
    </div>
  );
}
