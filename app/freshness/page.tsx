import type { Metadata } from "next";
import PageShell, { Faq, Notice, Section } from "@/components/PageShell";

export const metadata: Metadata = { title: "The Bloomé Freshness Guide" };

const steps = [
  ["Unwrap and inspect", "Take off the wrapping, ribbon and any plastic or rubber bands. Check for damaged petals and remove them. Keep the card and any care leaflet."],
  ["Prepare a clean vase", "Wash the vase with hot, soapy water first — bacteria are the main thing that shortens a flower’s life. Choose one tall enough to support the stems."],
  ["Fill with cool water and flower food", "Fill about two-thirds with clean, cool water and stir in the flower food that came with your bouquet, following the sachet instructions."],
  ["Recut every stem", "Trim 2–3 cm off each stem on a diagonal with sharp, clean scissors or a knife. Do this quickly and put the flowers straight into water."],
  ["Strip leaves below the waterline", "Leaves sitting in water rot and cloud it. Remove any that would be submerged, and leave the rest of the foliage."],
  ["Choose a cool, bright spot", "Keep the vase away from direct sun, heaters, fans and bowls of ripening fruit (it gives off ethylene gas, which ages flowers faster)."],
  ["Refresh every day or two", "Change the water and recut the stems every 1–2 days, and wash the vase. Pick off any bloom that has finished so it doesn’t age its neighbours."],
];

const faq = [
  { q: "How long will my flowers last?", a: "It depends on the variety, the season, how they were grown and how they’re cared for. As a rough guide, roses and peonies often last around 5–7 days, tulips 3–7 days and lilies 7–10 days with good care. These are typical ranges, not guarantees." },
  { q: "Why are my roses drooping?", a: "Usually an air bubble or blockage in the stem is stopping water rising. Recut the stem, plunge it into cool water at once, and give the bouquet a few hours somewhere cool. Not every flower can be revived." },
  { q: "Do tulips keep growing?", a: "Yes. Tulips continue to grow and bend towards light after cutting, so they can drift out of shape. Recut them and rearrange occasionally. A little cold water helps them stay firmer." },
  { q: "Should I add sugar, bleach or an aspirin?", a: "Commercial flower food is formulated to feed the flowers and slow bacteria in the right balance, so it is the dependable choice. Home recipes are inconsistent, and too much of anything can harm the stems." },
  { q: "Can I keep the flowers in the fridge overnight?", a: "A cool room is ideal. A fridge works for some flowers, but keep them away from fruit and vegetables, and avoid freezing temperatures." },
  { q: "My bouquet came in a box or basket — what now?", a: "Follow the guidance on floral foam below. If you’d rather use a vase, lift the stems out gently, recut them and arrange them as in steps 2–5." },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Customer care"
      title={
        <>
          The Bloomé <span className="italic-accent">Freshness</span> Guide
        </>
      }
      intro="Seven small habits that give a bouquet its longest, loveliest life — plus how to look after arrangements that sit in floral foam."
    >
      <Section title="Seven steps to longer-lasting flowers" kicker="Day one">
        <ol className="grid gap-5 md:grid-cols-2">
          {steps.map(([t, d], i) => (
            <li key={t} className="relative rounded-[1.6rem] border border-ink/10 bg-white/55 p-6 pl-20">
              <span className="font-display absolute left-6 top-4 text-5xl font-light text-rose/70" aria-hidden>
                {i + 1}
              </span>
              <h3 className="font-display text-2xl">
                <span className="sr-only">Step {i + 1}: </span>
                {t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="If your arrangement uses floral foam" kicker="Boxes, baskets & arrangements">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/55 p-6">
            <h3 className="font-display text-2xl">Keeping foam hydrated</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
              <li>
                Foam must be <b className="text-ink">fully saturated</b>. If you are refilling a dish, top up with clean water (plus flower food) so the foam stays visibly damp all the way through, and never let it dry out.
              </li>
              <li>Check it daily. Press gently: if it feels light or dry, add water slowly until it stops absorbing.</li>
              <li>
                Once <b className="text-ink">dry foam has had stems pushed into it, it should not be soaked again</b> — trapped air pockets stop water reaching the stems.
              </li>
              <li>If you are soaking new foam yourself, float it on top of clean water and let it sink on its own; do not push it down. It is ready when it has darkened evenly and sunk, usually within a few minutes.</li>
              <li>Keep stems inserted at their original depth; re-poking holes lets in air.</li>
            </ul>
          </div>
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/55 p-6">
            <h3 className="font-display text-2xl">Alternatives to foam</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
              <li>A vase or jar of water with flower food — the simplest and longest-lasting option for most flowers.</li>
              <li>Chicken wire or a metal flower frog (kenzan) set in a shallow dish of water to hold stems in place.</li>
              <li>Small water tubes or vials for individual stems in a basket or box.</li>
              <li>Damp moss or other plant-based fibre with a waterproof liner.</li>
            </ul>
            <p className="mt-4 text-sm text-ink-soft">
              Standard floral foam is a plastic that doesn’t break down in compost. Dispose of used foam with general waste, don’t rinse it down a drain, and avoid breathing the dust when cutting dry foam.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Notice>Which foam or alternative a particular arrangement uses is confirmed by Bloomé when your order is prepared — ask in your order notes if you have a preference.</Notice>
        </div>
      </Section>

      <Section title="Questions we’re often asked" kicker="FAQ">
        <Faq items={faq} />
      </Section>
    </PageShell>
  );
}
