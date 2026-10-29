"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp } from "lucide-react";
import { setLenis, scrollToTop } from "@/lib/scroll";
import { petalStore } from "@/lib/petalStore";
import { useReducedMotion } from "@/hooks/useEnv";

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth-scroll wired into GSAP, plus progress bar + back-to-top. */
export default function SmoothScroll() {
  const reduced = useReducedMotion();
  const bar = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let lenis: Lenis | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
    }
    const tick = (t: number) => lenis?.raf(t * 1000);
    if (lenis) gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let lastY = window.scrollY;
    let lastT = performance.now();
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      const now = performance.now();
      const v = ((y - lastY) / Math.max(1, now - lastT)) * 1000;
      petalStore.scrollV += (v - petalStore.scrollV) * 0.25;
      lastY = y;
      lastT = now;
      setShowTop(y > window.innerHeight * 0.9);
    };
    // decay the velocity when scrolling stops
    const decay = () => {
      petalStore.scrollV *= 0.93;
    };
    const mouse = (e: PointerEvent) => {
      petalStore.mouseX = e.clientX;
      petalStore.mouseY = e.clientY;
    };
    gsap.ticker.add(decay);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", mouse, { passive: true });
    onScroll();
    return () => {
      gsap.ticker.remove(decay);
      if (lenis) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", mouse);
    };
  }, [reduced]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-transparent" aria-hidden>
        <div
          ref={bar}
          className="h-full origin-left bg-gradient-to-r from-rose via-gold to-sage"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <button
        type="button"
        aria-label="Back to top"
        onClick={scrollToTop}
        className={`glass fixed bottom-6 right-6 z-[65] grid h-12 w-12 place-items-center rounded-full text-ink transition-all duration-500 hover:-translate-y-1 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp size={18} />
      </button>
    </>
  );
}
