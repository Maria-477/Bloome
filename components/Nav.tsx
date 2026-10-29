"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart";
import { scrollToId } from "@/lib/scroll";
import { openStudio } from "@/lib/studioBus";

interface NavLink {
  id: string;
  label: string;
  tab?: "gifts";
}
const LINKS: NavLink[] = [
  { id: "discover", label: "Discover" },
  { id: "collection", label: "Collections" },
  { id: "studio", label: "Bouquet Studio" },
  { id: "gift-builder", label: "Gift Builder", tab: "gifts" },
];
const CARE = [
  { href: "/delivery", label: "Delivery Promise" },
  { href: "/freshness", label: "Freshness Guide" },
  { href: "/safety", label: "Safety & Care" },
];
const STORY: NavLink = { id: "story", label: "Our Story" };

export default function Nav() {
  const { count, setOpen } = useCart();
  const [active, setActive] = useState("discover");
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const [care, setCare] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const home = path === "/";

  useEffect(() => {
    setMenu(false);
    setCare(false);
  }, [path]);

  useEffect(() => {
    if (!home) return;
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.filter((l) => l.id !== "gift-builder").concat(STORY).forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [home]);

  useEffect(() => {
    if (home) return;
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [home]);

  const go = (l: NavLink | { id: string; tab?: "gifts" }) => {
    setMenu(false);
    setCare(false);
    if (l.tab) openStudio({ tab: l.tab });
    if (home) scrollToId(l.id === "gift-builder" ? "studio" : l.id);
    else router.push(`/#${l.id === "gift-builder" ? "studio" : l.id}`);
  };

  return (
    <>
      <a
        href="#collection"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2"
      >
        Skip to collection
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ${solid ? "py-3" : "py-5 md:py-7"}`}
        style={{ color: "var(--nav-fg)" }}
      >
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${solid ? "opacity-100" : "opacity-0"}`}
          style={{
            background: "linear-gradient(180deg, color-mix(in srgb, var(--bg) 70%, transparent), transparent)",
            backdropFilter: "blur(10px)",
            WebkitMaskImage: "linear-gradient(180deg,#000 60%,transparent)",
            maskImage: "linear-gradient(180deg,#000 60%,transparent)",
          }}
        />
        <nav className="relative mx-auto flex max-w-[1500px] items-center justify-between px-5 md:px-10" aria-label="Main">
          <button
            onClick={() => go({ id: "discover" })}
            className="font-display text-[1.7rem] font-light tracking-[0.06em] md:text-[2rem]"
            aria-label="Bloomé — home"
          >
            Bloom<span className="italic">é</span>
          </button>
          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => go(l)}
                  data-active={home && active === l.id}
                  className="link-u text-[0.72rem] font-medium uppercase tracking-[0.22em]"
                >
                  {l.label}
                </button>
              </li>
            ))}
            <li className="relative" onMouseLeave={() => setCare(false)}>
              <button
                onClick={() => setCare((c) => !c)}
                onMouseEnter={() => setCare(true)}
                aria-expanded={care}
                aria-haspopup="true"
                data-active={!home}
                className="link-u inline-flex items-center gap-1 text-[0.72rem] font-medium uppercase tracking-[0.22em]"
              >
                Customer Care <ChevronDown size={13} />
              </button>
              <div className={`absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3 transition ${care ? "visible opacity-100" : "invisible opacity-0"}`}>
                <ul className="rounded-2xl bg-ivory p-2 text-ink shadow-xl ring-1 ring-ink/10">
                  {CARE.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} className="block rounded-xl px-4 py-2.5 text-sm normal-case tracking-normal hover:bg-blush/50" aria-current={path === c.href ? "page" : undefined}>
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            <li>
              <button onClick={() => go(STORY)} data-active={home && active === "story"} className="link-u text-[0.72rem] font-medium uppercase tracking-[0.22em]">
                {STORY.label}
              </button>
            </li>
          </ul>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-white/30"
              aria-label={`Open shopping bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1 text-[0.65rem] font-medium text-white">
                  {count}
                </span>
              )}
            </button>
            <button
              className="grid h-11 w-11 place-items-center rounded-full md:hidden"
              onClick={() => setMenu((m) => !m)}
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
            >
              {menu ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </nav>
      </header>
      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-[58] bg-ivory/95 backdrop-blur-xl transition-all duration-500 md:hidden ${
          menu ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul data-lenis-prevent className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto py-24 text-ink">
          {LINKS.map((l) => (
            <li key={l.id}>
              <button onClick={() => go(l)} className="font-display text-[2.1rem] font-light">
                {l.label}
              </button>
            </li>
          ))}
          <li className="mt-1 text-center">
            <p className="eyebrow mb-2 text-[0.62rem] text-ink-soft">Customer Care</p>
            <ul className="space-y-1.5">
              {CARE.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} onClick={() => setMenu(false)} className="font-display text-2xl font-light text-ink/85">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <button onClick={() => go(STORY)} className="font-display text-[2.1rem] font-light">
              {STORY.label}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
