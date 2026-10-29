"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BloomPhoto } from "@/components/Photo";
import { useReducedMotion } from "@/hooks/useEnv";

gsap.registerPlugin(ScrollTrigger);

/** a curved branch silhouette with pointed leaves, drawn procedurally */
function Branch({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  const P = [
    [10, 310],
    [90, 300],
    [200, 240],
    [330, 70],
  ];
  const pt = (t: number) => {
    const u = 1 - t;
    const f = (i: number) =>
      u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i];
    const d = (i: number) =>
      3 * u * u * (P[1][i] - P[0][i]) + 6 * u * t * (P[2][i] - P[1][i]) + 3 * t * t * (P[3][i] - P[2][i]);
    const r = (n: number) => Math.round(n * 100) / 100; // fixed precision keeps server & client HTML identical
    return { x: r(f(0)), y: r(f(1)), a: r((Math.atan2(d(1), d(0)) * 180) / Math.PI) };
  };
  const leaves = Array.from({ length: 16 }, (_, i) => {
    const t = 0.12 + (i / 16) * 0.86;
    const side = i % 2 ? 1 : -1;
    const p = pt(t);
    const s = 1.25 - t * 0.7;
    return { ...p, rot: Math.round((p.a + side * 48) * 100) / 100, s: Math.round(s * 100) / 100 };
  });
  return (
    <svg viewBox="0 0 340 320" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M10 310 C 90 300, 200 240, 330 70" fill="none" stroke="#24392c" strokeWidth="3" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <path
          key={i}
          d="M0 0 Q 14 -11 42 0 Q 14 11 0 0 Z"
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}
          fill="#24392c"
        />
      ))}
    </svg>
  );
}

export default function Garden() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        const d = Number(el.dataset.depth);
        gsap.fromTo(
          el,
          { y: d * 160 },
          { y: -d * 160, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
      });
      gsap.fromTo(
        "[data-sun]",
        { scale: 0.8, opacity: 0.6 },
        { scale: 1.25, opacity: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "center center", scrub: true } },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={ref} id="garden" className="relative isolate h-[125svh] min-h-[760px] overflow-hidden" aria-label="A garden at golden hour">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #fbf6ef 0%, #f9dcc4 14%, #f4b98a 42%, #d98a6a 70%, #6e5a45 92%, #3a2b21 100%)",
        }}
      />
      <div data-sun className="absolute right-[8%] top-[18%] -z-10 h-[46vmin] w-[46vmin] rounded-full" style={{ background: "radial-gradient(circle, #fff3d1 0%, rgba(255,220,150,0.7) 28%, rgba(255,190,120,0) 66%)" }} />
      <div className="rays absolute inset-0 -z-10 opacity-70" />

      {/* far silhouettes */}
      <div data-depth="0.2" className="absolute -left-10 bottom-[8%] w-[46vw] max-w-[620px] opacity-60" style={{ filter: "blur(2px)" }}>
        <Branch />
      </div>
      <div data-depth="0.25" className="absolute -right-10 top-[26%] w-[40vw] max-w-[520px] opacity-50" style={{ filter: "blur(2px)" }}>
        <Branch flip />
      </div>

      {/* blooms at different depths */}
      <div data-depth="0.5" className="absolute left-[8%] top-[18%] w-[22vw] min-w-[130px] max-w-[300px]" style={{ filter: "blur(3px)" }}>
        <BloomPhoto kind="peony" palette="blush" alt="" className="w-full" size={460} tilt={0.8} />
      </div>
      <div data-depth="1" className="absolute right-[10%] top-[44%] w-[26vw] min-w-[150px] max-w-[380px]" style={{ filter: "blur(0px)" }}>
        <BloomPhoto kind="rose" palette="sunset" alt="" className="w-full" size={520} tilt={0.7} />
      </div>
      <div data-depth="1.5" className="absolute -left-[3%] top-[58%] w-[30vw] min-w-[170px] max-w-[460px]" style={{ filter: "blur(5px)" }}>
        <BloomPhoto kind="lily" palette="ivory" alt="" className="w-full" size={520} tilt={0.9} />
      </div>
      <div data-depth="0.8" className="absolute left-[44%] top-[70%] w-[14vw] min-w-[90px] max-w-[200px]" style={{ filter: "blur(1px)" }}>
        <BloomPhoto kind="wild" palette="ivory" alt="" className="w-full" size={300} tilt={0.9} />
      </div>

      {/* foreground silhouettes */}
      <div data-depth="1.8" className="absolute -bottom-[8%] -left-[10%] w-[50vw] max-w-[700px] opacity-90" style={{ filter: "blur(4px)" }}>
        <Branch />
      </div>
      <div data-depth="1.6" className="absolute -bottom-[6%] -right-[10%] w-[44vw] max-w-[620px] opacity-90" style={{ filter: "blur(4px)" }}>
        <Branch flip />
      </div>

      {/* floating text */}
      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        <div data-depth="0.35">
          <p className="eyebrow mb-5 text-[#6b3f2b]">An interlude · golden hour</p>
          <h2 className="font-display text-[clamp(3rem,10vw,9rem)] font-light leading-[0.92] text-[#2f1e16] drop-shadow-[0_4px_40px_rgba(255,235,200,0.7)]">
            Take a moment <br />
            to <span className="font-script text-[1.15em] text-[#a3405a]">bloom.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-sm text-[#4a3123]">Breathe in. The best things open slowly.</p>
        </div>
      </div>
    </section>
  );
}
