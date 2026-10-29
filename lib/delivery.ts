import { DELIVERY_ZONES, type Zone } from "@/data/catalog";

export const zoneById = (id: string | null | undefined): Zone | null => DELIVERY_ZONES.find((z) => z.id === id) ?? null;

export interface Fee {
  fee: number;
  free: boolean;
  /** how much more is needed for free delivery (0 when already free) */
  toFree: number;
}
export function deliveryFee(zone: Zone | null, subtotal: number): Fee | null {
  if (!zone) return null;
  if (subtotal >= zone.freeOver) return { fee: 0, free: true, toFree: 0 };
  return { fee: zone.fee, free: false, toFree: zone.freeOver - subtotal };
}

/** earliest delivery date for a zone given the current time (sample rules) */
export function earliestDate(zone: Zone, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  let lead = zone.leadDays;
  if (zone.sameDay && now.getHours() >= zone.cutoffHour) lead = Math.max(lead, 1);
  d.setDate(d.getDate() + lead);
  return d;
}
export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
