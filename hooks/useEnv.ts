"use client";
import { useEffect, useState, type RefObject } from "react";

export function useMedia(query: string, initial = false) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setV(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return v;
}
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
export const useIsMobile = () => useMedia("(max-width: 767px)");

/** true while the element intersects the viewport (with margin) */
export function useInView(ref: RefObject<Element | null>, margin = "200px") {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return v;
}
