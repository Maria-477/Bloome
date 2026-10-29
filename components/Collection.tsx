"use client";

import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import { BouquetPhoto } from "@/components/Photo";
import { CATEGORIES, PRODUCTS, SAMPLE_PRICE_NOTE, SIZE_LABEL, STOCK_LABEL, formatPrice, type Category, type Product } from "@/data/site";
import { openStudio } from "@/lib/studioBus";
import { useCart } from "@/lib/cart";
import { scrollToId } from "@/lib/scroll";

const LAYOUT = [
  "md:col-span-5",
  "md:col-span-4 md:mt-24",
  "md:col-span-3 md:mt-8",
  "md:col-span-3 md:mt-2",
  "md:col-span-5 md:mt-16",
  "md:col-span-4",
];

function Card({ p, i, onOpen }: { p: Product; i: number; onOpen: (id: string) => void }) {
  const { add } = useCart();
  const [hover, setHover] = useState(false);
  const [everHovered, setEver] = useState(false);
  return (
    <Reveal className={`${LAYOUT[i % LAYOUT.length]} group`} delay={(i % 3) * 120}>
      <article onMouseEnter={() => {
          setHover(true);
          setEver(true);
        }} onMouseLeave={() => setHover(false)}>
        <div
          className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-[2rem]"
          style={{ background: `radial-gradient(120% 90% at 50% 30%, ${p.accent}66, ${p.accent}18 60%, transparent 90%), #fbf3ec` }}
          onClick={() => onOpen(p.id)}
        >
          <span className="eyebrow absolute left-5 top-5 z-[2] text-[0.62rem] text-ink-soft">{p.kicker}</span>
          {p.stock !== "in" && (
            <span className="absolute bottom-5 left-5 z-[2] rounded-full bg-white/80 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-rose-deep max-md:bottom-16 group-hover:opacity-0">
              {STOCK_LABEL[p.stock]}
            </span>
          )}
          <span className="absolute right-5 top-5 z-[2] flex gap-1.5" aria-label="Flowers in this bouquet">
            {p.flowerTags.map((t) => (
              <span key={t} title={t} className="h-2.5 w-2.5 rounded-full ring-1 ring-white" style={{ background: p.accent }} />
            ))}
          </span>
          <div className="absolute inset-0 flex items-center justify-center px-3 pb-8 pt-10 transition-transform duration-700 group-hover:scale-[1.04]">
            <BouquetPhoto
              config={p.config}
              yaw={-0.25}
              alt={`${p.name} bouquet`}
              className={`absolute h-[96%] w-auto max-w-none object-contain drop-shadow-[0_26px_30px_rgba(90,50,50,0.22)] transition-opacity duration-700 ${hover ? "opacity-0" : "opacity-100"}`}
            />
            <BouquetPhoto
              config={p.config}
              yaw={1.15}
              pitch={0.15}
              enabled={everHovered}
              alt={`${p.name} bouquet, side view`}
              className={`absolute h-[96%] w-auto max-w-none object-contain drop-shadow-[0_26px_30px_rgba(90,50,50,0.22)] transition-opacity duration-700 ${hover ? "opacity-100" : "opacity-0"}`}
            />
          </div>
          <div className="absolute inset-x-5 bottom-5 z-[2] flex translate-y-3 items-center justify-between opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <button className="btn btn-solid btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}>
              View bouquet <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-start justify-between gap-4 px-1">
          <div>
            <h3 className="h-md">{p.name}</h3>
            <p className="mt-2 max-w-[34ch] text-[0.92rem] leading-relaxed text-ink-soft">{p.blurb}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-2xl">{formatPrice(p.price)}</p>
            <button
              className="link-u mt-3 inline-flex items-center gap-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] disabled:opacity-40"
              disabled={p.stock === "out"}
              onClick={() => add({ key: `${p.id}-${p.config.size}-`, name: p.name, detail: SIZE_LABEL[p.config.size], unitPrice: p.price, config: p.config })}
              aria-label={`Add ${p.name} to bag`}
            >
              <Plus size={13} /> {p.stock === "out" ? "Sold out" : "Add to bag"}
            </button>
            <button
              className="link-u mt-2 block w-full text-right text-[0.7rem] font-medium uppercase tracking-[0.18em]"
              onClick={() => {
                openStudio({ productId: p.id, tab: "bouquet" });
                scrollToId("studio");
              }}
            >
              Customize
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function Collection({ onOpen }: { onOpen: (id: string) => void }) {
  const [cat, setCat] = useState<Category | "all">("all");
  const list = cat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.categories.includes(cat));
  return (
    <section id="collection" className="relative px-5 pb-28 pt-28 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-16 grid gap-6 md:mb-24 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5 text-rose-deep">The collection · Spring edit</p>
            <h2 className="h-xl text-balance">
              Arranged like <span className="italic-accent">paintings,</span> <br className="hidden md:block" />
              made to be given.
            </h2>
          </div>
          <p className="max-w-md text-[0.98rem] leading-relaxed text-ink-soft md:col-span-4 md:col-start-9">
            Nine compositions, each hand-tied from the week’s freshest stems. Hover to turn a bouquet, tap to explore it in 3D, or customise one as your own.
          </p>
        </Reveal>

        <div className="mb-12 flex flex-wrap gap-2" role="group" aria-label="Filter bouquets by category">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="-mt-6 mb-10 text-xs text-ink-soft">{SAMPLE_PRICE_NOTE}</p>

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-12" key={cat}>
          {list.map((p, i) => (
            <Card key={p.id} p={p} i={i} onOpen={onOpen} />
          ))}
          {list.length === 0 && <p className="col-span-full text-ink-soft">Nothing in this category yet.</p>}
        </div>

        <Reveal className="mt-28">
          <div
            className="relative overflow-hidden rounded-[2.4rem] px-8 py-14 text-center md:px-20 md:py-20"
            style={{ background: "linear-gradient(135deg,#f6dfe0 0%,#f9ece2 55%,#e7ecdc 100%)" }}
          >
            <p className="eyebrow mb-4 text-rose-deep">Custom for special occasions</p>
            <h3 className="h-lg mx-auto max-w-[18ch] text-balance">
              Don’t see <span className="italic-accent">the one?</span> Compose it.
            </h3>
            <p className="mx-auto mt-5 max-w-lg text-ink-soft">
              Choose the flowers, colours and presentation — then add chocolates, a teddy, balloons and a card — and watch the 3D gift change as you decide.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button className="btn btn-solid" onClick={() => { openStudio({ tab: "bouquet" }); scrollToId("studio"); }}>
                Open the Bouquet Studio <ArrowUpRight size={16} />
              </button>
              <button className="btn btn-ghost" onClick={() => { openStudio({ tab: "gifts" }); scrollToId("studio"); }}>
                Create your own gift
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
