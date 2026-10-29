"use client";

import { useCallback, useEffect, useState } from "react";
import { scrollToId } from "@/lib/scroll";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import PetalField from "@/components/PetalField";
import Journey from "@/components/Journey";
import Collection from "@/components/Collection";
import Studio from "@/components/Studio";
import Stories from "@/components/Stories";
import Garden from "@/components/Garden";
import { OurStory, Finale } from "@/components/StoryAndFinale";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";

export default function Site() {
  const [product, setProduct] = useState<string | null>(null);
  const close = useCallback(() => setProduct(null), []);

  // arriving from another page with /#section
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const t = setTimeout(() => {
      if (document.getElementById(id)) scrollToId(id);
    }, 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <SmoothScroll />
      <Nav />
      {/* sparse petals drifting over the whole page (never intercept clicks) */}
      <div className="pointer-events-none fixed inset-0 z-[40]" aria-hidden>
        <PetalField count={13} mobileCount={6} opacity={0.7} />
      </div>
      <main>
        <Journey onOpen={setProduct} />
        <Collection onOpen={setProduct} />
        <Garden />
        <Studio />
        <Stories onOpen={setProduct} />
        <OurStory />
        <Finale />
      </main>
      <ProductModal id={product} onClose={close} />
      <CartDrawer />
    </>
  );
}
