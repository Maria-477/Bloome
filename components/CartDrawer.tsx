"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { SAMPLE_PRICE_NOTE, formatPrice } from "@/data/site";
import { DELIVERY_ZONES } from "@/data/catalog";
import { deliveryFee, zoneById } from "@/lib/delivery";
import { lockScroll, scrollToId } from "@/lib/scroll";
import { BouquetPhoto } from "@/components/Photo";

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, setQty, remove, toast, zoneId, setZoneId } = useCart();
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const zone = zoneById(zoneId);
  const fee = deliveryFee(zone, subtotal);
  const total = subtotal + (fee?.fee ?? 0);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const t = setTimeout(() => closeRef.current?.focus(), 120);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", k);
      lockScroll(false);
    };
  }, [open, setOpen]);

  const checkout = () => {
    setOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      <div className={`fixed inset-0 z-[95] transition-all duration-500 ${open ? "visible opacity-100" : "invisible opacity-0"}`} aria-hidden={!open}>
        <div className="absolute inset-0 bg-[#2a1d1a]/45 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping bag"
          className={`absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-ivory shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <h2 className="font-display text-3xl font-light">Your bag</h2>
            <button ref={closeRef} aria-label="Close bag" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush/40">
              <X size={20} />
            </button>
          </header>

          <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 py-5">
            {items.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="font-script text-5xl text-rose-deep">Your bag is empty</p>
                  <p className="mx-auto mt-3 max-w-[26ch] text-sm text-ink-soft">The prettiest things start with a single stem.</p>
                  <button
                    className="btn btn-solid mt-7"
                    onClick={() => {
                      setOpen(false);
                      if (location.pathname !== "/") router.push("/#collection");
                      else setTimeout(() => scrollToId("collection"), 450);
                    }}
                  >
                    Browse the collection
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-7">
                {items.map((it) => (
                  <li key={it.key} className="flex gap-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-blush/50 to-[#f9ece2]">
                      {it.config && <BouquetPhoto config={it.config} alt="" className="h-full w-full object-contain" w={240} h={300} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <h3 className="font-display text-xl leading-tight">{it.name}</h3>
                        <p className="shrink-0">{formatPrice(it.unitPrice * it.qty)}</p>
                      </div>
                      {it.lines ? (
                        <ul className="mt-1.5 space-y-0.5 text-xs text-ink-soft">
                          {it.lines.map((l, i) => (
                            <li key={i} className="flex justify-between gap-3">
                              <span className="min-w-0 truncate">{l.qty > 1 ? `${l.qty} × ` : ""}{l.label}{l.detail ? ` · ${l.detail}` : ""}</span>
                              <span className="shrink-0 tabular-nums">{l.qty * l.unit < 0 ? "− " : ""}{formatPrice(Math.abs(l.qty * l.unit))}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{it.detail}</p>
                      )}
                      {it.message && <p className="mt-1 text-xs italic text-rose-deep">“{it.message}”</p>}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-ink/15">
                          <button aria-label={`Decrease ${it.name} quantity`} className="grid h-9 w-9 place-items-center" onClick={() => setQty(it.key, it.qty - 1)}>
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{it.qty}</span>
                          <button aria-label={`Increase ${it.name} quantity`} className="grid h-9 w-9 place-items-center" onClick={() => setQty(it.key, it.qty + 1)}>
                            <Plus size={13} />
                          </button>
                        </div>
                        <button aria-label={`Remove ${it.name}`} className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-blush/40 hover:text-rose-deep" onClick={() => remove(it.key)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <footer className="border-t border-ink/10 bg-white/50 px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-soft">
                    <label className="flex items-center gap-2">
                      Delivery to
                      <select value={zoneId ?? ""} onChange={(e) => setZoneId(e.target.value || null)} aria-label="Delivery city" className="rounded-full border border-ink/15 bg-white/80 px-2.5 py-1 text-sm text-ink outline-none focus:border-rose">
                        <option value="">Choose city…</option>
                        {DELIVERY_ZONES.map((z) => (
                          <option key={z.id} value={z.id}>{z.city}</option>
                        ))}
                      </select>
                    </label>
                  </dt>
                  <dd className="tabular-nums">{fee ? (fee.free ? "Free" : formatPrice(fee.fee)) : "—"}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
                  <dt className="eyebrow text-[0.66rem]">{fee ? "Total" : "Total before delivery"}</dt>
                  <dd className="font-display text-3xl tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>
              {fee && !fee.free && <p className="mt-2 text-xs text-ink-soft">Free delivery to {zone!.city} from {formatPrice(zone!.freeOver)} — {formatPrice(fee.toFree)} to go.</p>}
              {!fee && <p className="mt-2 text-xs text-ink-soft">Choose a city to see the delivery fee.</p>}
              <p className="mt-1 text-[0.68rem] text-ink-soft">{SAMPLE_PRICE_NOTE}</p>
              <button className="btn btn-solid mt-4 w-full justify-center" onClick={checkout}>
                Continue to checkout
              </button>
            </footer>
          )}
        </aside>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[96] -translate-x-1/2 rounded-full bg-ink px-6 py-3 text-sm text-ivory shadow-xl transition-all duration-500 ${toast && !open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      >
        {toast}
      </div>
    </>
  );
}
