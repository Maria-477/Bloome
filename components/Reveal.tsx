"use client";
import { useEffect, useRef, useState } from "react";

/** Fades + lifts its children in when scrolled into view. */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "p" | "h2";
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as React.ElementType;
  return (
    <T
      ref={ref}
      className={`transition-all duration-[1100ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${seen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </T>
  );
}
