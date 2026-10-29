import type Lenis from "lenis";

let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  instance = l;
};

/** Smoothly scroll to an element id (works with or without Lenis). */
export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { offset, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
export function scrollToTop() {
  if (instance) instance.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Freeze / release page scrolling while a modal or drawer is open. */
export function lockScroll(lock: boolean) {
  if (instance) {
    if (lock) instance.stop();
    else instance.start();
  }
  document.body.style.overflow = lock ? "hidden" : "";
}
