import type { Metadata } from "next";
import PageShell, { Faq, Notice, Section } from "@/components/PageShell";
import { BRAND, SAMPLE_PRICE_NOTE, formatPrice } from "@/data/site";
import { BUSINESS_HOURS, COVERAGE_IS_SAMPLE, DELIVERY_SLOTS, DELIVERY_ZONES } from "@/data/catalog";

export const metadata: Metadata = { title: "Our Delivery Promise — Bloomé" };

const pledges = [
  ["Packed for the journey", "Stems are hydrated and wrapped so the bouquet travels upright and protected."],
  ["A slot you choose", "Pick a delivery date and a time window at checkout. We aim to arrive inside it."],
  ["Honest about delays", "Traffic, weather and festival-day demand can slow a rider. If something changes, we tell you rather than leave you guessing."],
  ["Gifts travel together", "Chocolates, a teddy, balloons and your card are delivered with the bouquet as a single gift."],
];

export default function Page() {
  const contact = [BRAND.phone, BRAND.whatsapp, BRAND.email].filter(Boolean);
  return (
    <PageShell
      eyebrow="Customer care"
      title={
        <>
          Our <span className="italic-accent">Delivery</span> Promise
        </>
      }
      intro="What we do to get your gift to the right person, in good shape, at the time you chose — and what we do when real life gets in the way."
    >
      {COVERAGE_IS_SAMPLE && (
        <Notice>
          The cities, fees and times below are <b>sample settings</b> for this demo storefront. They are edited in <code>data/catalog.ts</code> and will be replaced with Bloomé’s confirmed delivery rules.
        </Notice>
      )}

      <Section title="What we commit to" kicker="The promise">
        <ul className="grid gap-5 md:grid-cols-2">
          {pledges.map(([t, d]) => (
            <li key={t} className="rounded-[1.6rem] border border-ink/10 bg-white/55 p-6">
              <h3 className="font-display text-2xl">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Where we deliver" kicker="Cities & fees">
        <div className="overflow-x-auto rounded-[1.6rem] border border-ink/10 bg-white/55" data-lenis-prevent>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="eyebrow text-[0.62rem] text-ink-soft">
              <tr>
                <th className="px-5 py-4 font-medium">City</th>
                <th className="px-5 py-4 font-medium">Delivery fee</th>
                <th className="px-5 py-4 font-medium">Free delivery from</th>
                <th className="px-5 py-4 font-medium">Earliest delivery</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY_ZONES.map((z) => (
                <tr key={z.id} className="border-t border-ink/10">
                  <td className="px-5 py-4 font-medium">{z.city}</td>
                  <td className="px-5 py-4">{formatPrice(z.fee)}</td>
                  <td className="px-5 py-4">{formatPrice(z.freeOver)}</td>
                  <td className="px-5 py-4">
                    {z.sameDay ? `Same day if ordered before ${z.cutoffHour > 12 ? z.cutoffHour - 12 : z.cutoffHour} pm` : `${z.leadDays} day${z.leadDays === 1 ? "" : "s"} after ordering`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-ink-soft">
          Outside these cities we can’t confirm an order, and checkout will say so before you place it. {SAMPLE_PRICE_NOTE}
        </p>
      </Section>

      <Section title="Delivery windows" kicker="Time slots">
        <ul className="flex flex-wrap gap-3">
          {DELIVERY_SLOTS.map((s) => (
            <li key={s} className="chip pointer-events-none">{s}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-soft">Order-handling hours: {BUSINESS_HOURS}. Specific times are requested, not guaranteed to the minute.</p>
      </Section>

      <Section title="Good to know" kicker="Details">
        <Faq
          items={[
            { q: "What if the recipient isn’t home?", a: "The rider will try to reach the phone number you gave. If we can’t hand the gift over, we contact you to agree a next step — a safe neighbour, a re-delivery or a new slot. Re-delivery may carry an extra fee." },
            { q: "Can I send it as a surprise?", a: "Yes. Add the recipient’s name and any instructions (gate code, ‘ask for reception’, ‘please don’t mention who it’s from’) in the checkout notes." },
            { q: "Can I change or cancel an order?", a: "Tell us as early as you can. Bouquets are hand-tied to order, so changes are easiest before preparation starts. We’ll be upfront about what is still possible." },
            { q: "Do flowers arrive in water?", a: "Bouquets are prepared so stems stay hydrated in transit. Unwrap them and follow the Freshness Guide as soon as they arrive." },
          ]}
        />
        <p className="mt-8 text-sm text-ink-soft">
          Need help with a delivery? {contact.length ? <>Reach us on {contact.join(" · ")}.</> : <i>Contact details are coming soon.</i>}
        </p>
      </Section>
    </PageShell>
  );
}
