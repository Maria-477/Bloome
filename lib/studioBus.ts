import type { BouquetConfig, SizeId } from "@/lib/three/types";

export interface StudioRequest {
  tab?: "bouquet" | "gifts";
  productId?: string;
  config?: BouquetConfig;
  size?: SizeId;
}
export const STUDIO_EVENT = "bloome:studio";
export const openStudio = (req: StudioRequest = {}) => {
  window.dispatchEvent(new CustomEvent<StudioRequest>(STUDIO_EVENT, { detail: req }));
  // remember it so the home page can apply a request made from another route
  try {
    sessionStorage.setItem("bloome-studio-req", JSON.stringify(req));
  } catch {
    /* ignore */
  }
};
