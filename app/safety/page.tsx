import type { Metadata } from "next";
import PageShell, { Notice, Section } from "@/components/PageShell";

export const metadata: Metadata = { title: "Your Gift, Handled with Care — Bloomé" };

const groups: { t: string; k: string; items: string[] }[] = [
  {
    k: "Flowers & plants",
    t: "Fresh flowers",
    items: [
      "Some people are sensitive to pollen or fragrance. Tell us about allergies in your order notes and we will suggest low-scent options.",
      "Lilies are toxic to cats — even pollen or the vase water can be harmful. If you share your home with a cat, choose a different flower or keep lilies out of reach, and call a vet if you are worried.",
      "Many bouquet flowers are mildly irritating if eaten. Keep arrangements away from small children and pets that chew.",
      "Roses can have thorns. We strip most of them, but handle stems carefully.",
    ],
  },
  {
    k: "Sweets",
    t: "Chocolates",
    items: [
      "Chocolate products are original, sealed, branded items. Always read the label for ingredients, allergens (milk, nuts, gluten, soy and others) and the best-before date — recipes and factory conditions can vary by product and country.",
      "If the recipient has an allergy, tell us before ordering. We can’t guarantee any product is free of an allergen.",
      "Chocolate melts in the heat. Move it to a cool place soon after delivery and keep it away from direct sun and radiators.",
      "Chocolate is harmful to dogs and cats. Keep it well out of their reach.",
    ],
  },
  {
    k: "Soft toys",
    t: "Teddies & plush",
    items: [
      "Check the toy’s own label for age suitability. Plush with small parts or loose bows may not be suitable for babies and toddlers.",
      "Remove bows and ribbons before a young child plays with a toy.",
      "Spot-clean gently with a damp cloth unless the care label says otherwise, and dry away from direct heat.",
    ],
  },
  {
    k: "Party",
    t: "Balloons",
    items: [
      "Burst or uninflated latex balloons are a choking hazard for young children. Supervise children and dispose of broken pieces straight away.",
      "Foil balloons conduct electricity. Never let them touch power lines or sockets, and don’t release them outdoors.",
      "Do not inhale helium from a balloon.",
      "Balloons lose lift over time and with heat; keep them away from heaters, candles and sharp objects.",
    ],
  },
  {
    k: "Extras",
    t: "Candles, ribbons & cards",
    items: [
      "Never leave a burning candle unattended, and keep it clear of flowers, paper, ribbons and balloons.",
      "Ribbons and plastic wrap can be a hazard to small children and pets — remove and dispose of them when unwrapping.",
      "Personal letters and cards are printed exactly as you type them. We do not read messages beyond checking they fit the card.",
    ],
  },
  {
    k: "In transit",
    t: "Receiving your gift",
    items: [
      "Don’t leave a gift in a parked car or in direct sun. Heat damages flowers, melts chocolate and shortens balloon life.",
      "Open the package soon after it arrives, check the contents against your order and tell us promptly if anything is damaged.",
      "Flowers are living things: how long they last depends on the variety, the season and how they are cared for. Our Freshness Guide shows how to get the most from them.",
    ],
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Customer care"
      title={
        <>
          Your gift, <span className="italic-accent">handled with care.</span>
        </>
      }
      intro="A beautiful gift should also be a safe one. These notes cover the practical things worth knowing about each part of your order."
    >
      <Notice>This is general guidance, not medical or veterinary advice. For an allergic reaction, poisoning or any emergency, contact a doctor, vet or local emergency service.</Notice>
      {groups.map((g) => (
        <Section key={g.t} title={g.t} kicker={g.k}>
          <ul className="grid gap-4 md:grid-cols-2">
            {g.items.map((i) => (
              <li key={i} className="rounded-[1.4rem] border border-ink/10 bg-white/55 p-5 text-[0.95rem] leading-relaxed text-ink-soft">
                {i}
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </PageShell>
  );
}
