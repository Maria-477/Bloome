"use client";

import Link from "next/link";
import { ArrowRight, Gift, Leaf, Clock, Truck } from "lucide-react";
import Footer from "@/components/Footer";
import { openStudio } from "@/lib/studioBus";
import Reveal from "@/components/Reveal";
import { BouquetPhoto } from "@/components/Photo";
import BouquetViewer from "@/components/BouquetViewer";
import PetalField from "@/components/PetalField";
import { PRODUCTS } from "@/data/site";
import { scrollToId } from "@/lib/scroll";

export function OurStory() {
  const p = PRODUCTS[0];
  return (
    <section id="story" className="relative px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1300px] items-center gap-14 md:grid-cols-12">
        <Reveal className="relative md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[14rem_14rem_2rem_2rem] bg-gradient-to-b from-blush/70 to-[#f9ece2]">
            <BouquetPhoto config={p.config} yaw={0.9} alt="A Bloomé bouquet" className="absolute inset-x-0 bottom-0 h-[92%] w-full object-contain" />
          </div>
        </Reveal>
        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="eyebrow mb-5 text-rose-deep">Our story</p>
            <h2 className="h-xl text-balance">
              Born in a garden, <span className="italic-accent">tied by hand.</span>
            </h2>
            <p className="mt-7 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft">
              Bloomé began with a simple belief: flowers aren’t decoration, they’re language. Every morning we choose the stems at their
              peak, build each bouquet slowly, and wrap it as if it were already a gift — because it is.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { i: Leaf, t: "Seasonal & sustainable", d: "Grown close to home, never forced." },
              { i: Clock, t: "Hand-tied daily", d: "Composed the morning it’s sent." },
              { i: Truck, t: "Delivered with care", d: "Same-day where our delivery rules allow." },
            ].map(({ i: Icon, t, d }, k) => (
              <Reveal key={t} delay={k * 120}>
                <Icon size={22} strokeWidth={1.4} className="text-rose" />
                <h3 className="font-display mt-4 text-2xl">{t}</h3>
                <p className="mt-2 text-sm text-ink-soft">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Finale() {
  const p = PRODUCTS[5];
  return (
    <section id="finale" className="relative isolate overflow-hidden px-5 pb-16 pt-28 md:px-10 md:pt-40">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px 600px at 50% 46%, #fffaf0 0%, rgba(255,250,240,0) 70%), radial-gradient(900px 500px at 50% 110%, rgba(242,211,214,0.9), transparent 70%), linear-gradient(180deg, #fbf6ef, #f8e9e1)",
        }}
      />
      <div className="absolute inset-0 -z-[5]">
        <PetalField count={14} mobileCount={7} opacity={0.9} />
      </div>
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="relative h-[56svh] min-h-[380px] w-full max-w-[520px]">
          <div className="absolute inset-x-8 top-[18%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(255,236,200,0.95),transparent_70%)] blur-xl" aria-hidden />
          <BouquetViewer config={p.config} className="absolute inset-0" fill={0.8} mood={0.12} label="The Maison Bloom — drag to rotate" initialYaw={-0.25} />
        </div>
        <Reveal>
          <p className="eyebrow mb-4 text-rose-deep">A gift that speaks</p>
          <h2 className="h-xl max-w-[14ch] text-balance md:max-w-[18ch]">
            Let flowers say what <span className="italic-accent">words cannot.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-ink-soft">Find the arrangement that feels like you.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button className="btn btn-solid" onClick={() => scrollToId("collection")}>
              Explore the collection <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                openStudio({ tab: "gifts" });
                scrollToId("studio");
              }}
            >
              <Gift size={16} /> Create your own gift
            </button>
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/delivery" className="link-u">Our Delivery Promise</Link>
            <Link href="/freshness" className="link-u">Freshness Guide</Link>
            <Link href="/safety" className="link-u">Safety &amp; Care</Link>
          </p>
        </Reveal>
      </div>

      <Footer />
    </section>
  );
}
