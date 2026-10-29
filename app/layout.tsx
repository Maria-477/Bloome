import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource-variable/jost";
import "@fontsource/allura";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { BRAND } from "@/data/site";

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
};

export const viewport: Viewport = {
  themeColor: "#fbf6ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="text-ink antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
