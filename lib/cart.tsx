"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { BouquetConfig } from "@/lib/three/types";

export interface CartItem {
  key: string;
  name: string;
  detail: string;
  unitPrice: number;
  qty: number;
  message?: string;
  config?: BouquetConfig;
  /** itemised breakdown for gifts built in the Studio */
  lines?: { label: string; detail?: string; qty: number; unit: number }[];
}

type Action =
  | { type: "add"; item: Omit<CartItem, "qty"> & { qty?: number } }
  | { type: "remove"; key: string }
  | { type: "qty"; key: string; qty: number }
  | { type: "clear" }
  | { type: "load"; items: CartItem[] };

function reducer(state: CartItem[], a: Action): CartItem[] {
  switch (a.type) {
    case "load":
      return a.items;
    case "add": {
      const q = a.item.qty ?? 1;
      const hit = state.find((i) => i.key === a.item.key);
      if (hit) return state.map((i) => (i.key === a.item.key ? { ...i, qty: Math.min(20, i.qty + q) } : i));
      return [...state, { ...a.item, qty: q }];
    }
    case "remove":
      return state.filter((i) => i.key !== a.key);
    case "qty":
      return state.map((i) => (i.key === a.key ? { ...i, qty: Math.max(1, Math.min(20, a.qty)) } : i));
    case "clear":
      return [];
  }
}

interface Ctx {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  toast: string | null;
  /** chosen delivery city (zone id) — shared by Studio, bag and checkout */
  zoneId: string | null;
  setZoneId: (id: string | null) => void;
}

const CartContext = createContext<Ctx | null>(null);
const STORAGE = "bloome-cart-v1";
const ZONE_STORAGE = "bloome-zone-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [zoneId, setZoneId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) dispatch({ type: "load", items: JSON.parse(raw) as CartItem[] });
      const z = localStorage.getItem(ZONE_STORAGE);
      if (z) setZoneId(z);
    } catch {
      /* storage unavailable — cart simply starts empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      if (zoneId) localStorage.setItem(ZONE_STORAGE, zoneId);
      else localStorage.removeItem(ZONE_STORAGE);
    } catch {
      /* ignore */
    }
  }, [zoneId, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((item: Omit<CartItem, "qty"> & { qty?: number }) => {
    dispatch({ type: "add", item });
    setToast(`${item.name} added to your bag`);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.unitPrice, 0),
      open,
      setOpen,
      add,
      remove: (key) => dispatch({ type: "remove", key }),
      setQty: (key, qty) => dispatch({ type: "qty", key, qty }),
      clear: () => dispatch({ type: "clear" }),
      toast,
      zoneId,
      setZoneId,
    }),
    [items, open, add, toast, zoneId],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
