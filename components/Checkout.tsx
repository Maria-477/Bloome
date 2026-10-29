"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import PageShell, { Notice } from "@/components/PageShell";
import { useCart } from "@/lib/cart";
import { SAMPLE_PRICE_NOTE, formatPrice } from "@/data/site";
import { COVERAGE_IS_SAMPLE, DELIVERY_SLOTS, DELIVERY_ZONES, PAYMENT_METHODS } from "@/data/catalog";
import { deliveryFee, earliestDate, isoDate, zoneById } from "@/lib/delivery";

const OTHER = "other";
const makeRef = () => `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const input = "w-full rounded-full border border-ink/15 bg-white/70 px-5 py-3 text-sm outline-none transition focus:border-rose";

export default function Checkout() {
  const { items, subtotal, clear, zoneId, setZoneId } = useCart();
  const methods = PAYMENT_METHODS.filter((m) => m.enabled);
  const [f, setF] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    recName: "",
    recPhone: "",
    address: "",
    date: "",
    slot: "",
    notes: "",
    pay: methods[0]?.id ?? "",
  });
  const [cityChoice, setCityChoice] = useState<string>(zoneId ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ ref: string; name: string; city: string; total: number } | null>(null);

  const zone = zoneById(cityChoice);
  const unsupported = cityChoice === OTHER;
  const fee = deliveryFee(zone, subtotal);
  const total = subtotal + (fee?.fee ?? 0);
  const [now] = useState(() => new Date());
  const minDate = zone ? isoDate(earliestDate(zone, now)) : isoDate(now);

  const pickCity = (v: string) => {
    setCityChoice(v);
    if (v && v !== OTHER) setZoneId(v);
    setErrors((e) => ({ ...e, city: "" }));
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const place = () => {
    const e: Record<string, string> = {};
    if (!f.senderName.trim()) e.senderName = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(f.senderEmail)) e.senderEmail = "Enter a valid email";
    if (f.senderPhone.replace(/\D/g, "").length < 10) e.senderPhone = "Enter a phone number we can reach";
    if (!f.recName.trim()) e.recName = "Who is the gift for?";
    if (f.recPhone.replace(/\D/g, "").length < 10) e.recPhone = "The rider needs the recipient’s phone number";
    if (!f.address.trim() || f.address.trim().length < 8) e.address = "Please enter the full delivery address";
    if (!cityChoice) e.city = "Choose a delivery city";
    if (unsupported) e.city = "We can’t confirm orders to this city yet.";
    if (!f.date) e.date = "Choose a delivery date";
    else if (zone && f.date < minDate) e.date = `The earliest date for ${zone.city} is ${minDate}`;
    if (!f.slot) e.slot = "Choose a time window";
    if (methods.length && !f.pay) e.pay = "Choose a payment method";
    setErrors(e);
    if (Object.keys(e).length || !zone) return;
    setDone({ ref: makeRef(), name: f.recName, city: zone.city, total });
    clear();
  };

  const err = (k: string) => (errors[k] ? <span className="mt-1 block px-2 text-xs text-rose-deep" role="alert">{errors[k]}</span> : null);
  const label = (t: string) => <span className="eyebrow mb-2 block text-[0.62rem] text-ink-soft">{t}</span>;

  if (done) {
    return (
      <PageShell eyebrow="Demo order" title={<>With love, <span className="italic-accent">soon.</span></>}>
        <div className="mx-auto max-w-xl py-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage/30 text-forest"><Check size={28} /></span>
          <p className="mt-6 text-ink-soft">
            Demo order <b className="text-ink">{done.ref}</b> for {done.name} in {done.city} ({formatPrice(done.total)}) was recorded on this screen only.
            <br />This is a demonstration — nothing was charged, sent or confirmed by a florist.
          </p>
          <Link href="/" className="btn btn-solid mt-8">Back to the home page</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Checkout" title={<>Almost <span className="italic-accent">there.</span></>} intro="Tell us who the gift is for and when it should arrive." petals={false}>
      <Notice>
        <b>Demo checkout.</b> No payment is taken and no real order is placed — this only shows the flow. {COVERAGE_IS_SAMPLE && "Delivery cities and fees are sample settings."}
      </Notice>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-script text-5xl text-rose-deep">Your bag is empty</p>
          <Link href="/#collection" className="btn btn-solid mt-8">Browse the collection</Link>
        </div>
      ) : (
        <form
          className="mt-10 grid gap-12 lg:grid-cols-[1.3fr_1fr]"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            place();
          }}
        >
          <div className="space-y-10">
            <fieldset className="space-y-4">
              <legend className="font-display mb-2 text-3xl font-light">Your details</legend>
              <label className="block">{label("Your name")}<input className={input} value={f.senderName} onChange={set("senderName")} aria-invalid={!!errors.senderName} autoComplete="name" />{err("senderName")}</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">{label("Email")}<input type="email" className={input} value={f.senderEmail} onChange={set("senderEmail")} aria-invalid={!!errors.senderEmail} autoComplete="email" />{err("senderEmail")}</label>
                <label className="block">{label("Phone")}<input type="tel" className={input} value={f.senderPhone} onChange={set("senderPhone")} aria-invalid={!!errors.senderPhone} autoComplete="tel" />{err("senderPhone")}</label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="font-display mb-2 text-3xl font-light">Recipient &amp; delivery</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">{label("Recipient name")}<input className={input} value={f.recName} onChange={set("recName")} aria-invalid={!!errors.recName} />{err("recName")}</label>
                <label className="block">{label("Recipient phone")}<input type="tel" className={input} value={f.recPhone} onChange={set("recPhone")} aria-invalid={!!errors.recPhone} />{err("recPhone")}</label>
              </div>
              <label className="block">{label("Delivery city")}
                <select className={input} value={cityChoice} onChange={(e) => pickCity(e.target.value)} aria-invalid={!!errors.city}>
                  <option value="">Choose city…</option>
                  {DELIVERY_ZONES.map((z) => <option key={z.id} value={z.id}>{z.city}</option>)}
                  <option value={OTHER}>My city isn’t listed</option>
                </select>
                {err("city")}
              </label>
              {unsupported && (
                <p className="rounded-2xl bg-blush/50 p-4 text-sm" role="alert">
                  We don’t deliver there yet, so we can’t confirm this order. Please choose a listed city, or see our <Link className="underline" href="/delivery">Delivery Promise</Link> for where we deliver.
                </p>
              )}
              <label className="block">{label("Full delivery address")}<textarea rows={3} className={`${input} rounded-3xl`} value={f.address} onChange={set("address")} aria-invalid={!!errors.address} autoComplete="street-address" />{err("address")}</label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">{label("Delivery date")}<input type="date" min={minDate} className={input} value={f.date} onChange={set("date")} aria-invalid={!!errors.date} />{err("date")}
                  {zone && <span className="mt-1 block px-2 text-xs text-ink-soft">Earliest for {zone.city}: {minDate}</span>}
                </label>
                <label className="block">{label("Time window")}
                  <select className={input} value={f.slot} onChange={set("slot")} aria-invalid={!!errors.slot}>
                    <option value="">Choose a window…</option>
                    {DELIVERY_SLOTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  {err("slot")}
                </label>
              </div>
              <label className="block">{label("Delivery instructions (optional)")}<textarea rows={2} className={`${input} rounded-3xl`} value={f.notes} onChange={set("notes")} placeholder="Gate code, ‘ask for reception’, surprise notes…" /></label>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="font-display mb-2 text-3xl font-light">Payment</legend>
              {methods.length === 0 ? (
                <p className="text-sm text-ink-soft">Payment options are being set up. We’ll confirm how to pay when your order is accepted.</p>
              ) : (
                methods.map((m) => (
                  <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${f.pay === m.id ? "border-ink bg-white" : "border-ink/12 bg-white/50"}`}>
                    <input type="radio" name="pay" value={m.id} checked={f.pay === m.id} onChange={set("pay")} className="mt-1 accent-[#c4687a]" />
                    <span><span className="block text-sm font-medium">{m.label}</span><span className="text-xs text-ink-soft">{m.note}</span></span>
                  </label>
                ))
              )}
              {err("pay")}
            </fieldset>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[1.8rem] border border-ink/10 bg-white/60 p-6">
              <h2 className="font-display text-3xl font-light">Order summary</h2>
              <ul className="mt-4 space-y-4 text-sm">
                {items.map((it) => (
                  <li key={it.key}>
                    <div className="flex justify-between gap-3">
                      <span className="font-medium">{it.qty > 1 ? `${it.qty} × ` : ""}{it.name}</span>
                      <span className="tabular-nums">{formatPrice(it.unitPrice * it.qty)}</span>
                    </div>
                    {it.lines ? (
                      <ul className="mt-1 space-y-0.5 text-xs text-ink-soft">
                        {it.lines.map((l, i) => (
                          <li key={i} className="flex justify-between gap-3">
                            <span className="min-w-0 truncate">{l.qty > 1 ? `${l.qty} × ` : ""}{l.label}{l.detail ? ` · ${l.detail}` : ""}</span>
                            <span className="tabular-nums">{l.qty * l.unit < 0 ? "− " : ""}{formatPrice(Math.abs(l.qty * l.unit))}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-ink-soft">{it.detail}</p>
                    )}
                    {it.message && <p className="mt-1 text-xs italic text-rose-deep">Card: “{it.message}”</p>}
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-ink/12 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Delivery{zone ? ` · ${zone.city}` : ""}</dt>
                  <dd className="tabular-nums">{fee ? (fee.free ? "Free" : formatPrice(fee.fee)) : "—"}</dd>
                </div>
                {fee?.free && zone && <p className="text-xs text-forest">Delivery is free for {zone.city} orders from {formatPrice(zone.freeOver)}. This is the only discount applied.</p>}
                {fee && !fee.free && zone && <p className="text-xs text-ink-soft">Add {formatPrice(fee.toFree)} more for free delivery.</p>}
                {!fee && <p className="text-xs text-ink-soft">Choose a city to see the delivery fee.</p>}
                <div className="flex items-baseline justify-between border-t border-ink/12 pt-3">
                  <dt className="eyebrow text-[0.66rem]">{fee ? "Total" : "Total before delivery"}</dt>
                  <dd className="font-display text-3xl tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[0.7rem] text-ink-soft">{SAMPLE_PRICE_NOTE}</p>
              <button type="submit" className="btn btn-solid mt-5 w-full justify-center disabled:opacity-40" disabled={unsupported}>
                Place demo order · {formatPrice(total)}
              </button>
              {Object.values(errors).some(Boolean) && <p className="mt-3 text-xs text-rose-deep" role="alert">Please fix the highlighted fields above.</p>}
            </div>
          </aside>
        </form>
      )}
    </PageShell>
  );
}
