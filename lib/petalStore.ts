/** Tiny shared (non-React) store so scroll scenes can steer the petals. */
export const petalStore = {
  /** smoothed scroll velocity in px/s (positive = scrolling down) */
  scrollV: 0,
  /** 0..1 — petals orbit (cx, cy) while > 0 */
  swirl: 0,
  cx: 0.5,
  cy: 0.5,
  mouseX: -9999,
  mouseY: -9999,
  burstQueue: [] as { x: number; y: number; n: number }[],
  burst(x: number, y: number, n = 24) {
    this.burstQueue.push({ x, y, n });
  },
};
