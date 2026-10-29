import type { Metadata } from "next";
import Checkout from "@/components/Checkout";

export const metadata: Metadata = { title: "Checkout — Bloomé (demo)" };

export default function Page() {
  return <Checkout />;
}
