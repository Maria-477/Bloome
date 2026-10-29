"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BRAND } from "@/data/site";
import { scrollToId, scrollToTop } from "@/lib/scroll";
import { openStudio } from "@/lib/studioBus";

const SOON = <span className="italic text-ink-soft/70">coming soon</span>;

export default function Footer() {
  const path = usePathname();
  const router = useRouter();
  const home = path === "/";
  const go = (id: string, tab?: "gifts") => {
    if (tab) openStudio({ tab });
    if (home) scrollToId(id);
    else router.push(`/#${id}`);
  };
  const socials = Object.entries(BRAND.social).filter(([, v]) => v);
  return (
    <footer className="mx-auto mt-28 max-w-[1300px] border-t border-ink/10 pt-12">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-display text-4xl font-light">
            Bloom<span className="italic">é</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">{BRAND.tagline}. Hand-tied bouquets and thoughtful gifts, composed with love.</p>
        </div>
        <nav className="md:col-span-2" aria-label="Explore">
          <p className="eyebrow mb-4 text-[0.66rem]">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><button className="link-u" onClick={() => go("collection")}>Collections</button></li>
            <li><button className="link-u" onClick={() => go("studio")}>Bouquet Studio</button></li>
            <li><button className="link-u" onClick={() => go("studio", "gifts")}>Gift Builder</button></li>
            <li><button className="link-u" onClick={() => go("stories")}>Flower meanings</button></li>
            <li><button className="link-u" onClick={() => go("story")}>Our story</button></li>
          </ul>
        </nav>
        <nav className="md:col-span-3" aria-label="Customer care">
          <p className="eyebrow mb-4 text-[0.66rem]">Customer care</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="link-u" href="/delivery">Delivery Promise</Link></li>
            <li><Link className="link-u" href="/freshness">Freshness Guide</Link></li>
            <li><Link className="link-u" href="/safety">Safety &amp; Care</Link></li>
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4 text-[0.66rem]">Visit &amp; contact</p>
          <address className="space-y-2 text-sm not-italic text-ink-soft">
            <p>Address: {BRAND.address || SOON}</p>
            <p>Email: {BRAND.email ? <a className="link-u" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> : SOON}</p>
            <p>Phone: {BRAND.phone ? <a className="link-u" href={`tel:${BRAND.phone}`}>{BRAND.phone}</a> : SOON}</p>
            {BRAND.whatsapp && (
              <p>WhatsApp: <a className="link-u" href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}>{BRAND.whatsapp}</a></p>
            )}
          </address>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-5 text-sm">
              {socials.map(([k, v]) => (
                <li key={k}><a href={v} className="link-u capitalize" rel="noopener noreferrer" target="_blank">{k}</a></li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-soft">
        <p>© {new Date().getFullYear()} Bloomé. A demo storefront — prices are samples, and no real orders or payments are taken.</p>
        <button className="link-u" onClick={scrollToTop}>Back to top ↑</button>
      </div>
    </footer>
  );
}
