"use client";

import { useState } from "react";
import { Minus, Plus, Gift, Box, Ribbon, ShoppingBasket, Heart, Flame } from "lucide-react";
import { BalloonPhoto, ToyPhoto } from "@/components/Photo";
import { ADDONS, BALLOONS, CARD_DESIGNS, CARD_PRICES, CHOCOLATES, CUSTOM_BALLOON_COLORS, TOYS, type Variant } from "@/data/catalog";
import { STOCK_LABEL, formatPrice, type Stock } from "@/data/site";
import { selectionKey, type GiftCategory, type GiftSelection } from "@/lib/gift";

type Tab = "choc" | "toy" | "balloon" | "card" | "addon";
const TABS: { id: Tab; label: string }[] = [
  { id: "choc", label: "Chocolates" },
  { id: "toy", label: "Teddies & toys" },
  { id: "balloon", label: "Balloons" },
  { id: "card", label: "Cards & letters" },
  { id: "addon", label: "Other add-ons" },
];

function StockTag({ s }: { s: Stock }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] ${s === "in" ? "bg-sage/30 text-[#3d5a3f]" : s === "low" ? "bg-gold/25 text-[#7a5a1c]" : "bg-ink/10 text-ink-soft"}`}>
      {STOCK_LABEL[s]}
    </span>
  );
}

function Qty({ value, onChange, disabled }: { value: number; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white/60 p-0.5" role="group" aria-label="Quantity">
      <button type="button" aria-label="Decrease" disabled={disabled || value <= 0} onClick={() => onChange(value - 1)} className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-rose/20 disabled:opacity-30">
        <Minus size={14} />
      </button>
      <span className="min-w-6 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase" disabled={disabled || value >= 10} onClick={() => onChange(value + 1)} className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-rose/20 disabled:opacity-30">
        <Plus size={14} />
      </button>
    </div>
  );
}

/** an item with variants: each variant has its own quantity stepper */
function VariantRows({
  cat,
  itemId,
  variants,
  g,
  setQty,
}: {
  cat: GiftCategory;
  itemId: string;
  variants: Variant[];
  g: GiftSelection;
  setQty: (key: string, n: number) => void;
}) {
  return (
    <ul className="mt-3 space-y-2">
      {variants.map((v) => {
        const key = selectionKey(cat, itemId, v.id);
        const out = v.stock === "out";
        return (
          <li key={v.id} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[0.82rem]">{v.label}</p>
              <p className="flex items-center gap-2 text-xs text-ink-soft">
                {formatPrice(v.price)} <StockTag s={v.stock} />
              </p>
            </div>
            <Qty value={g.qty[key] ?? 0} onChange={(n) => setQty(key, n)} disabled={out} />
          </li>
        );
      })}
    </ul>
  );
}

const card = "rounded-[1.4rem] border border-ink/10 bg-white/55 p-4 backdrop-blur-sm";

function ChocTile({ name, tone, image }: { name: string; tone: string; image?: string }) {
  const [broken, setBroken] = useState(!image);
  return (
    <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl" style={{ background: broken ? tone : "#fff" }}>
      {!broken && image ? (
        // eslint-disable-next-line @next/next/no-img-element -- owner-supplied photo; falls back to a neutral tile
        <img src={image} alt={name} loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-contain" />
      ) : (
        <div className="text-center">
          <p className="font-display text-xl leading-none text-ink/80">{name}</p>
          <p className="eyebrow mt-2 text-[0.55rem] text-ink/45">Photo coming soon</p>
        </div>
      )}
    </div>
  );
}

export default function GiftBuilder({
  g,
  setG,
  deliveryNote,
}: {
  g: GiftSelection;
  setG: React.Dispatch<React.SetStateAction<GiftSelection>>;
  deliveryNote?: string;
}) {
  const [tab, setTab] = useState<Tab>("choc");
  const setQty = (key: string, n: number) =>
    setG((s) => {
      const qty = { ...s.qty };
      if (n <= 0) delete qty[key];
      else qty[key] = Math.min(10, n);
      return { ...s, qty };
    });
  const count = (cat: Tab) => Object.entries(g.qty).filter(([k, n]) => k.startsWith(cat + ":") && n > 0).length + (cat === "card" && g.card.design ? 1 : 0);

  const cb = g.customBalloon;
  const customKey = selectionKey("balloon", "custom", "std");
  const cardDesign = CARD_DESIGNS.find((d) => d.id === g.card.design) ?? null;
  const setCard = (p: Partial<GiftSelection["card"]>) => setG((s) => ({ ...s, card: { ...s.card, ...p } }));

  return (
    <div>
      <div className="mb-5">
        <p className="font-display text-3xl font-light">
          Make it <span className="italic-accent">more than flowers</span>
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Add chocolates, a teddy, balloons or a handwritten note. Everything is priced live and delivered together with your bouquet.
        </p>
      </div>

      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Gift categories" data-lenis-prevent>
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="chip shrink-0">
            {t.label}
            {count(t.id) > 0 && <span className="ml-1.5 rounded-full bg-rose-deep px-1.5 text-[0.6rem] text-white">{count(t.id)}</span>}
          </button>
        ))}
      </div>

      {tab === "choc" && (
        <div role="tabpanel">
          <p className="mb-4 text-xs text-ink-soft">Brand-name chocolates are sold as the original products. Pack sizes and prices are samples until stock is confirmed.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHOCOLATES.map((c) => (
              <div key={c.id} className={card}>
                <ChocTile name={c.name === c.brand ? c.name : `${c.brand} ${c.name}`} tone={c.tone} image={c.image} />
                <p className="mt-3 text-sm font-medium">{c.brand === c.name ? c.name : `${c.brand} ${c.name}`}</p>
                <p className="text-xs text-ink-soft">{c.blurb}</p>
                <VariantRows cat="choc" itemId={c.id} variants={c.variants} g={g} setQty={setQty} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "toy" && (
        <div role="tabpanel">
          <p className="mb-4 text-xs text-ink-soft">Soft toys are shown as 3D illustrations; the real plush may differ slightly in shade and fur. The first two appear beside your bouquet in the preview.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {TOYS.map((t) => (
              <div key={t.id} className={card}>
                <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-[linear-gradient(180deg,#fbf3ec,#f3e5dc)]">
                  <ToyPhoto id={t.id} model={t.model} scale={t.scale[t.variants[0].id] ?? 1} alt={`${t.name} soft toy`} className="h-full w-full object-contain" />
                </div>
                <p className="mt-3 text-sm font-medium">{t.name}</p>
                <p className="text-xs text-ink-soft">{t.colour} · {t.blurb}</p>
                <VariantRows cat="toy" itemId={t.id} variants={t.variants} g={g} setQty={setQty} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "balloon" && (
        <div role="tabpanel">
          <div className="grid gap-4 sm:grid-cols-2">
            {BALLOONS.filter((b) => !b.custom).map((b) => (
              <div key={b.id} className={card}>
                <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-[linear-gradient(180deg,#fbf3ec,#f3e5dc)]">
                  <BalloonPhoto id={b.id} model={b.model} text={b.model.text} alt={`${b.name} balloon`} className="h-full w-full object-contain" />
                </div>
                <p className="mt-3 text-sm font-medium">{b.name}</p>
                <p className="text-xs text-ink-soft">{b.blurb}</p>
                <VariantRows cat="balloon" itemId={b.id} variants={b.variants} g={g} setQty={setQty} />
              </div>
            ))}
          </div>

          <div className={`${card} mt-4`}>
            <p className="eyebrow mb-3 text-[0.68rem] text-rose-deep">Personalised balloon · {formatPrice(BALLOONS.find((b) => b.custom)!.variants[0].price)}</p>
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.1fr]">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-[linear-gradient(180deg,#fbf3ec,#f3e5dc)]">
                <BalloonPhoto
                  id="custom"
                  model={{ shape: cb.shape, color: cb.color, metal: true, textColor: cb.color === "#fbf7f1" || cb.color === "#e6cf9c" ? "#5a2a3a" : "#ffffff" }}
                  text={cb.text || "Your text"}
                  alt="Your personalised balloon"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs text-ink-soft">
                  Message (max 24 characters)
                  <input
                    value={cb.text}
                    maxLength={24}
                    onChange={(e) => setG((s) => ({ ...s, customBalloon: { ...s.customBalloon, text: e.target.value } }))}
                    placeholder="Maria I love you"
                    className="mt-1 w-full rounded-full border border-ink/15 bg-white/70 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose"
                  />
                </label>
                <div className="flex gap-2" role="radiogroup" aria-label="Balloon shape">
                  {(["heart", "round"] as const).map((sh) => (
                    <button key={sh} role="radio" aria-checked={cb.shape === sh} className="chip" onClick={() => setG((s) => ({ ...s, customBalloon: { ...s.customBalloon, shape: sh } }))}>
                      {sh === "heart" ? "Heart" : "Round"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2.5" role="radiogroup" aria-label="Balloon colour">
                  {CUSTOM_BALLOON_COLORS.map((c) => (
                    <button
                      key={c.id}
                      role="radio"
                      aria-checked={cb.color === c.id}
                      aria-label={c.label}
                      title={c.label}
                      onClick={() => setG((s) => ({ ...s, customBalloon: { ...s.customBalloon, color: c.id } }))}
                      className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-ivory ${cb.color === c.id ? "ring-2 ring-ink" : "ring-1 ring-ink/15"}`}
                      style={{ background: c.id }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-ink-soft">Printed text is placed by hand and checked before dispatch.</p>
                  <Qty value={g.qty[customKey] ?? 0} onChange={(n) => setQty(customKey, n)} />
                </div>
                {(g.qty[customKey] ?? 0) > 0 && !cb.text.trim() && <p className="text-xs text-rose-deep">Add your message so we know what to print.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "card" && (
        <div role="tabpanel" className="space-y-5">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Card or letter">
            {(["card", "letter"] as const).map((k) => (
              <button key={k} role="radio" aria-checked={g.card.kind === k} className="chip" onClick={() => setCard({ kind: k })}>
                {k === "card" ? `Greeting card · ${formatPrice(CARD_PRICES.card)}` : `Personal letter · ${formatPrice(CARD_PRICES.letter)}`}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Card design">
            <button
              role="radio"
              aria-checked={g.card.design === null}
              onClick={() => setCard({ design: null })}
              className={`rounded-xl border p-3 text-left text-xs transition ${g.card.design === null ? "border-ink bg-white" : "border-ink/10 bg-white/40 hover:border-rose"}`}
            >
              No card
            </button>
            {CARD_DESIGNS.map((d) => (
              <button
                key={d.id}
                role="radio"
                aria-checked={g.card.design === d.id}
                onClick={() => setCard({ design: d.id })}
                className={`rounded-xl border p-3 text-left text-xs transition ${g.card.design === d.id ? "border-ink ring-1 ring-ink" : "border-ink/10 hover:border-rose"}`}
                style={{ background: `linear-gradient(135deg, ${d.from}, ${d.to})`, color: d.ink }}
              >
                <span className="block font-display text-base leading-tight">{d.name}</span>
              </button>
            ))}
          </div>

          {cardDesign && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <input value={g.card.to} maxLength={30} onChange={(e) => setCard({ to: e.target.value })} placeholder="To (name)" aria-label="Card recipient name" className="w-full rounded-full border border-ink/15 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-rose" />
                <textarea
                  value={g.card.message}
                  maxLength={g.card.kind === "letter" ? 600 : 160}
                  rows={g.card.kind === "letter" ? 7 : 4}
                  onChange={(e) => setCard({ message: e.target.value })}
                  placeholder={g.card.kind === "letter" ? "Write your letter…" : "Write your message…"}
                  aria-label="Message"
                  className="w-full resize-none rounded-2xl border border-ink/15 bg-white/70 px-4 py-3 text-sm outline-none focus:border-rose"
                />
                <input value={g.card.from} maxLength={30} onChange={(e) => setCard({ from: e.target.value })} placeholder="From (your name)" aria-label="Card sender name" className="w-full rounded-full border border-ink/15 bg-white/70 px-4 py-2.5 text-sm outline-none focus:border-rose" />
                <p className="text-xs text-ink-soft">
                  {g.card.message.length}/{g.card.kind === "letter" ? 600 : 160} characters. {cardDesign.id === "blank" ? "Blank cards are left unwritten for you to fill in by hand." : "Your words are copied exactly as typed."}
                </p>
              </div>
              <CardPreview g={g} />
            </div>
          )}
        </div>
      )}

      {tab === "addon" && (
        <div role="tabpanel" className="grid gap-4 sm:grid-cols-2">
          {ADDONS.map((a) => {
            const Icon = { box: Box, ribbon: Ribbon, basket: ShoppingBasket, plush: Heart, candle: Flame }[a.icon] ?? Gift;
            return (
              <div key={a.id} className={card}>
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose/20 text-rose-deep"><Icon size={18} /></span>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-ink-soft">{a.blurb}</p>
                  </div>
                </div>
                <VariantRows cat="addon" itemId={a.id} variants={a.variants} g={g} setQty={setQty} />
              </div>
            );
          })}
        </div>
      )}

      {deliveryNote && <p className="mt-5 text-xs text-ink-soft">{deliveryNote}</p>}
    </div>
  );
}

/** a printed-card mock-up of exactly what the customer typed */
export function CardPreview({ g }: { g: GiftSelection }) {
  const d = CARD_DESIGNS.find((x) => x.id === g.card.design);
  if (!d) return null;
  const letter = g.card.kind === "letter";
  return (
    <div
      className={`relative mx-auto w-full max-w-[320px] rounded-md p-6 shadow-[0_18px_36px_-16px_rgba(60,40,40,0.5)] ${letter ? "aspect-[3/4]" : "aspect-[4/3]"}`}
      style={{ background: `linear-gradient(135deg, ${d.from}, ${d.to})`, color: d.ink }}
      aria-label="Card preview"
    >
      {d.greeting && <p className="font-display text-xl leading-tight">{d.greeting}</p>}
      {g.card.to && <p className="mt-2 text-xs uppercase tracking-[0.16em] opacity-70">Dear {g.card.to},</p>}
      <p className={`font-script break-words leading-snug ${letter ? "mt-3 text-[1.05rem]" : "mt-3 text-[1.35rem]"}`}>
        {d.id === "blank" ? "" : g.card.message || "Your message will appear here…"}
      </p>
      {g.card.from && <p className="absolute bottom-5 right-6 font-script text-lg">— {g.card.from}</p>}
    </div>
  );
}
