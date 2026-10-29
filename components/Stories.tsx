"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import { BloomPhoto } from "@/components/Photo";
import { OCCASIONS, PRODUCTS, STORIES, formatPrice, type FlowerStory, type Occasion } from "@/data/site";
import { useIsMobile } from "@/hooks/useEnv";

gsap.registerPlugin(ScrollTrigger);

export default function Stories({ onOpen }: { onOpen: (id: string) => void }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [open, setOpen] = useState<FlowerStory | null>(null);
  const mobile = useIsMobile();

  // desktop: vertical scroll drives a horizontal gallery
  useEffect(() => {
    if (mobile) return;
    const sec = section.current!;
    const tr = track.current!;
    let dist = 0;
    const measure = () => {
      dist = Math.max(0, tr.scrollWidth - window.innerWidth);
      sec.style.height = `${window.innerHeight + dist}px`;
    };
    measure();
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        gsap.set(tr, { x: -s.progress * dist });
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
      },
    });
    const ro = new ResizeObserver(() => {
      measure();
      ScrollTrigger.refresh();
    });
    ro.observe(tr);
    window.addEventListener("resize", measure);
    return () => {
      st.kill();
      ro.disconnect();
      window.removeEventListener("resize", measure);
      sec.style.height = "";
      gsap.set(tr, { clearProps: "transform" });
    };
  }, [mobile]);

  const suggestions = occasion ? PRODUCTS.filter((p) => p.occasions.includes(occasion)) : [];
  const related = open ? PRODUCTS.filter((p) => p.flowerTags.includes(open.kind)) : [];

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <section ref={section} id="stories" className="relative" aria-label="Every flower tells a story">
      <div className="top-0 md:sticky md:h-[100svh] md:overflow-hidden">
        <div className="flex h-full flex-col justify-center py-24 md:py-0">
          <div
            ref={track}
            className="no-scrollbar flex gap-8 overflow-x-auto px-5 max-md:snap-x max-md:snap-mandatory md:w-max md:items-center md:gap-14 md:overflow-visible md:px-[6vw]"
          >
            {/* intro panel */}
            <div className="w-[86vw] shrink-0 snap-center md:w-[34vw] md:max-w-[520px]">
              <p className="eyebrow mb-5 text-rose-deep">Flowers with meaning</p>
              <h2 className="h-xl text-balance">
                Every flower tells a <span className="italic-accent">story.</span>
              </h2>
              <p className="mt-6 max-w-md text-ink-soft">What are you celebrating, or saying sorry for? Choose an occasion and we’ll show the flowers and bouquets that speak for you.</p>
              <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Occasions">
                {OCCASIONS.map((o) => (
                  <button key={o.id} className="chip" aria-pressed={occasion === o.id} onClick={() => setOccasion(occasion === o.id ? null : o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 min-h-[84px]" aria-live="polite">
                {occasion && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((p) => (
                      <button key={p.id} onClick={() => onOpen(p.id)} className="btn btn-ghost btn-sm !normal-case !tracking-normal">
                        {p.name} · {formatPrice(p.price)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {STORIES.map((s, i) => {
              const dim = occasion && !s.occasions.includes(occasion);
              return (
                <button
                  key={s.kind}
                  onClick={() => setOpen(s)}
                  aria-label={`${s.name}: ${s.meaning}. Open story.`}
                  className={`group relative w-[78vw] shrink-0 snap-center text-left transition-all duration-700 md:w-[26vw] md:max-w-[420px] ${dim ? "opacity-30 saturate-50" : "opacity-100"}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#fbf0ea] to-[#f3e2da]">
                    <span className="font-display absolute left-6 top-4 text-[5.5rem] font-light leading-none text-ink/10">0{i + 1}</span>
                    <BloomPhoto
                      kind={s.kind}
                      palette={s.palette}
                      alt={`${s.name} bloom`}
                      className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
                      size={600}
                    />
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="h-md">{s.name}</h3>
                      <p className="eyebrow mt-2 text-[0.66rem] text-rose-deep">{s.meaning}</p>
                    </div>
                    <span className="link-u text-[0.7rem] font-medium uppercase tracking-[0.18em]">Read</span>
                  </div>
                </button>
              );
            })}

            <div className="hidden w-[24vw] shrink-0 md:block">
              <p className="font-script text-6xl leading-tight text-rose-deep">…and yours is waiting.</p>
            </div>
          </div>

          <div className="mx-auto mt-10 hidden h-px w-[min(520px,60vw)] bg-ink/10 md:block" aria-hidden>
            <div ref={bar} className="h-full origin-left bg-rose" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>

      {/* story panel */}
      {open && (
        <div className="fixed inset-0 z-[88] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`${open.name} story`}>
          <div className="absolute inset-0 bg-[#2a1d1a]/50 backdrop-blur-sm" onClick={() => setOpen(null)} />
          <div data-lenis-prevent className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-ivory md:grid-cols-2">
            <button onClick={() => setOpen(null)} aria-label="Close" className="glass absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full">
              <X size={18} />
            </button>
            <div className="relative aspect-square bg-gradient-to-b from-[#fbf0ea] to-[#f1ddd5] md:aspect-auto md:min-h-[480px]">
              <BloomPhoto kind={open.kind} palette={open.palette} alt={open.name} className="absolute inset-0 h-full w-full object-contain" size={700} />
            </div>
            <div className="p-7 md:p-10">
              <p className="eyebrow mb-3 text-rose-deep">{open.meaning}</p>
              <h3 className="h-lg">{open.name}</h3>
              <p className="mt-4 text-ink-soft">{open.poem}</p>
              <p className="eyebrow mb-3 mt-7 text-[0.66rem] text-ink-soft">Perfect for</p>
              <div className="flex flex-wrap gap-2">
                {open.occasions.map((o) => (
                  <span key={o} className="rounded-full bg-blush/50 px-3 py-1 text-[0.8rem]">
                    {OCCASIONS.find((x) => x.id === o)?.label}
                  </span>
                ))}
              </div>
              <p className="eyebrow mb-3 mt-7 text-[0.66rem] text-ink-soft">Arrangements with {open.name.toLowerCase()}</p>
              <ul className="space-y-2">
                {related.map((p) => (
                  <li key={p.id}>
                    <button
                      className="flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-white/50 px-4 py-3 text-left transition hover:border-rose"
                      onClick={() => {
                        setOpen(null);
                        setTimeout(() => onOpen(p.id), 200);
                      }}
                    >
                      <span className="font-display text-xl">{p.name}</span>
                      <span className="text-sm text-ink-soft">{formatPrice(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
