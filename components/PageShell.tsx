"use client";

import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PetalField from "@/components/PetalField";

export default function PageShell({
  eyebrow,
  title,
  intro,
  children,
  petals = true,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  children: React.ReactNode;
  petals?: boolean;
}) {
  return (
    <>
      <SmoothScroll />
      <Nav />
      {petals && (
        <div className="pointer-events-none fixed inset-0 z-[40]" aria-hidden>
          <PetalField count={9} mobileCount={4} opacity={0.55} />
        </div>
      )}
      <main id="main" className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70svh]" style={{ background: "linear-gradient(180deg,#f8e9e1,#fbf6ef)" }} />
        <header className="mx-auto max-w-[1100px] px-5 pb-12 pt-36 md:px-10 md:pt-44">
          <p className="eyebrow mb-5 text-rose-deep">{eyebrow}</p>
          <h1 className="h-xl max-w-[20ch] text-balance">{title}</h1>
          {intro && <p className="mt-7 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">{intro}</p>}
        </header>
        <div className="mx-auto max-w-[1100px] px-5 pb-10 md:px-10">{children}</div>
        <div className="px-5 pb-12 md:px-10">
          <Footer />
        </div>
      </main>
      <CartDrawer />
    </>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-ink">{children}</p>;
}

export function Section({ title, kicker, children }: { title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink/10 py-12 md:py-16">
      {kicker && <p className="eyebrow mb-3 text-[0.66rem] text-rose-deep">{kicker}</p>}
      <h2 className="h-lg mb-8 max-w-[24ch] text-balance">{title}</h2>
      {children}
    </section>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl font-light marker:hidden">
            {f.q}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-lg transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
