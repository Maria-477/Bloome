"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, MoveHorizontal, RotateCcw } from "lucide-react";
import { BouquetStage } from "@/lib/three/stage";
import PetalField from "@/components/PetalField";
import { BloomPhoto } from "@/components/Photo";
import { PRODUCTS, formatPrice } from "@/data/site";
import { useCart } from "@/lib/cart";
import { scrollToId } from "@/lib/scroll";
import { petalStore } from "@/lib/petalStore";
import { smooth, lerp } from "@/lib/three/petal";
import { useIsMobile, useReducedMotion } from "@/hooks/useEnv";

gsap.registerPlugin(ScrollTrigger);

const HERO = PRODUCTS.find((p) => p.id === "maison-bloom")!;

interface Key {
  p: number;
  x: number;
  y: number;
  s: number;
  ry: number;
  b: number;
  m: number;
}
/** Scroll keyframes: x/y are fractions of the viewport, ry in radians. */
const DESK: Key[] = [
  { p: 0.0, x: 0.23, y: 0.0, s: 1.0, ry: -0.55, b: 0.5, m: 0 },
  { p: 0.16, x: 0.22, y: 0.0, s: 1.1, ry: -0.2, b: 0.62, m: 0 },
  { p: 0.34, x: -0.2, y: 0.0, s: 1.0, ry: 2.9, b: 0.75, m: 0 },
  { p: 0.5, x: 0.2, y: -0.09, s: 1.3, ry: 5.5, b: 0.9, m: 0.1 },
  { p: 0.68, x: 0.0, y: 0.0, s: 1.1, ry: 7.2, b: 0.9, m: 1 },
  { p: 0.82, x: 0.0, y: 0.0, s: 1.3, ry: 9.2, b: 1.0, m: 1 },
  { p: 1.0, x: -0.2, y: 0.0, s: 1.02, ry: 12.32, b: 0.96, m: 0.1 },
];
const MOB: Key[] = [
  { p: 0.0, x: 0.0, y: 0.13, s: 0.82, ry: -0.55, b: 0.5, m: 0 },
  { p: 0.16, x: 0.0, y: 0.14, s: 0.86, ry: -0.2, b: 0.62, m: 0 },
  { p: 0.34, x: 0.0, y: 0.15, s: 0.82, ry: 2.9, b: 0.75, m: 0 },
  { p: 0.5, x: 0.0, y: 0.16, s: 0.96, ry: 5.5, b: 0.9, m: 0.1 },
  { p: 0.68, x: 0.0, y: 0.15, s: 0.82, ry: 7.2, b: 0.9, m: 1 },
  { p: 0.82, x: 0.0, y: 0.15, s: 0.93, ry: 9.2, b: 1.0, m: 1 },
  { p: 1.0, x: 0.0, y: 0.14, s: 0.82, ry: 12.32, b: 0.96, m: 0.1 },
];

function sample(keys: Key[], p: number): Key {
  if (p <= keys[0].p) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (p <= b.p) {
      const raw = (p - a.p) / (b.p - a.p);
      const t = lerp(raw, smooth(raw), 0.7);
      return {
        p,
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        s: lerp(a.s, b.s, t),
        ry: lerp(a.ry, b.ry, t),
        b: lerp(a.b, b.b, t),
        m: lerp(a.m, b.m, t),
      };
    }
  }
  return keys[keys.length - 1];
}

/** window function for a text scene */
const win = (p: number, a: number, b: number) => {
  const i = smooth((p - a) / 0.03);
  const o = b === Infinity ? 0 : smooth((p - b + 0.03) / 0.03);
  return { in: i, out: o, a: i * (1 - o) };
};

interface LabelData {
  id: string;
  label: string;
  note: string;
}

export default function Journey({ onOpen }: { onOpen: (id: string) => void }) {
  const section = useRef<HTMLElement>(null);
  const stageEl = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const dusk = useRef<HTMLDivElement>(null);
  const rays = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const scenes = useRef<(HTMLDivElement | null)[]>([]);
  const labelEls = useRef<(HTMLDivElement | null)[]>([]);
  const decals = useRef<(HTMLDivElement | null)[]>([]);
  const hint = useRef<HTMLDivElement>(null);
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [moved, setMoved] = useState(false);
  const [failed, setFailed] = useState(false);
  const stageRef = useRef<BouquetStage | null>(null);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const { add } = useCart();

  useEffect(() => {
    const cv = canvas.current!;
    let stage: BouquetStage;
    try {
      stage = new BouquetStage({ canvas: cv, low: mobile, fill: 0.66 });
    } catch {
      setFailed(true);
      return;
    }
    stageRef.current = stage;
    stage.idle = !reduced;
    stage.setBouquet(HERO.config);
    stage.resize();
    setLabels(stage.bouquet!.anchors.slice(0, 5).map((a) => ({ id: a.id, label: a.label, note: a.note })));

    const keys = mobile ? MOB : DESK;
    const intro = { v: reduced ? 1 : 0 };
    if (!reduced) gsap.to(intro, { v: 1, duration: 2.6, ease: "power3.out", delay: 0.15 });
    if (!reduced) {
      gsap.fromTo("[data-intro]", { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: "power3.out", stagger: 0.13, delay: 0.35 });
    }

    let target = 0;
    let cur = 0;
    const st = ScrollTrigger.create({
      trigger: section.current!,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (target = self.progress),
    });
    target = st.progress;
    cur = target;

    const ro = new ResizeObserver(() => stage.resize());
    ro.observe(cv);
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "50px" });
    io.observe(section.current!);

    // manual drag-to-rotate
    let dragging = false;
    let lx = 0;
    let vel = 0;
    let movedFlag = false;
    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      vel = 0;
      cv.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const r = stageEl.current!.getBoundingClientRect();
      if (!reduced) stage.setPointer(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
      if (!dragging) return;
      const dx = e.clientX - lx;
      lx = e.clientX;
      stage.userYaw += dx * 0.011;
      vel = dx * 0.003;
      if (!movedFlag && Math.abs(stage.userYaw) > 0.08) {
        movedFlag = true;
        setMoved(true);
      }
    };
    const up = () => (dragging = false);
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    const globalMove = (e: PointerEvent) => move(e);
    window.addEventListener("pointermove", globalMove, { passive: true });

    let prevP = target;
    let burstedUp = false;
    let tone = "light";

    const tick = (_t: number, dtMs: number) => {
      if (!visible) return;
      const dt = Math.min(0.3, dtMs / 1000);
      cur += (target - cur) * (1 - Math.exp(-dt * 9));
      const p = cur;
      const k = sample(keys, p);
      const pose = stage.pose;
      pose.x = k.x;
      pose.y = k.y;
      pose.scale = k.s * (0.88 + 0.12 * intro.v);
      pose.rotY = k.ry;
      pose.bloom = k.b * (0.4 + 0.6 * intro.v);
      pose.mood = k.m;
      if (!dragging) {
        if (Math.abs(vel) > 0.0002) {
          stage.userYaw += vel;
          vel *= 0.94;
        }
      }

      // ---- backgrounds & lighting ----
      const duskA = smooth((p - 0.5) / 0.14) * (1 - smooth((p - 0.82) / 0.1));
      if (dusk.current) dusk.current.style.opacity = String(duskA);
      if (rays.current) rays.current.style.opacity = String(duskA * (0.45 + 0.55 * smooth((p - 0.66) / 0.1)));
      if (glow.current) {
        glow.current.style.opacity = String(Math.min(1, duskA * 1.1 + smooth((p - 0.88) / 0.1) * 0.5));
        glow.current.style.left = `${50 + k.x * 100}%`;
        glow.current.style.transform = `translate(-50%,-50%) scale(${0.8 + k.b * 0.6})`;
      }
      const nextTone = duskA > 0.45 ? "dark" : "light";
      if (nextTone !== tone) {
        tone = nextTone;
        document.documentElement.dataset.tone = tone;
      }

      // ---- petals ----
      const swirlWin = Math.max(0, 1 - Math.abs(p - 0.72) / 0.07);
      petalStore.swirl = swirlWin * 0.9;
      petalStore.cx = 0.5 + k.x;
      petalStore.cy = 0.5 - k.y;
      if (p > 0.69 && prevP <= 0.69 && !burstedUp) {
        petalStore.burst(0.5 + k.x, 0.5 - k.y, mobile ? 12 : 26);
        burstedUp = true;
      }
      if (p < 0.6) burstedUp = false;
      prevP = p;

      // ---- text scenes ----
      const ws = [
        { a: 1 - smooth((p - 0.09) / 0.06), in: 1, out: 0 },
        win(p, 0.17, 0.33),
        win(p, 0.35, 0.5),
        win(p, 0.53, 0.67),
        win(p, 0.69, 0.81),
        win(p, 0.92, Infinity),
      ];
      scenes.current.forEach((el, i) => {
        if (!el) return;
        const w = ws[i];
        el.style.opacity = String(w.a);
        el.style.transform = `translate3d(0, ${(1 - w.in) * 34 - w.out * 34}px, 0)`;
        el.style.visibility = w.a < 0.01 ? "hidden" : "visible";
      });
      if (cue.current) cue.current.style.opacity = String(ws[0].a);
      if (hint.current) hint.current.style.opacity = String(ws[1].a);

      // ---- anchored labels (scene 3) ----
      const lw = win(p, 0.37, 0.49).a;
      const anchors = stage.bouquet?.anchors ?? [];
      labelEls.current.forEach((el, i) => {
        if (!el) return;
        const a = anchors[i];
        if (!a || mobile || lw < 0.01) {
          el.style.opacity = "0";
          return;
        }
        const pr = stage.project(a.object);
        const facing = smooth((pr.facing + 0.1) / 0.5);
        const side = pr.x < stage.width / 2 ? "left" : "right";
        if (el.dataset.side !== side) el.dataset.side = side;
        el.style.transform = `translate3d(${pr.x}px, ${pr.y}px, 0)`;
        el.style.opacity = String(lw * facing);
      });

      // ---- floating blooms (scene 4/5) ----
      const dw = smooth((p - 0.5) / 0.08) * (1 - smooth((p - 0.8) / 0.06));
      decals.current.forEach((el, i) => {
        if (!el) return;
        const depth = 0.5 + (i % 3) * 0.45;
        el.style.opacity = String(dw * (0.55 + (i % 2) * 0.35));
        el.style.transform = `translate3d(0, ${(0.5 - p) * 520 * depth}px, 0) rotate(${(p - 0.5) * 120 * (i % 2 ? 1 : -1) * depth}deg) scale(${0.9 + dw * 0.1})`;
      });
    };
    const wrapped = (t: number, d: number) => tick(t, d);
    gsap.ticker.add(wrapped);

    // render separately so heavy WebGL work follows the pose update
    const renderer = (_t: number, dMs: number) => {
      if (visible) stage.render(Math.min(0.05, dMs / 1000));
    };
    gsap.ticker.add(renderer);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      gsap.ticker.remove(wrapped);
      gsap.ticker.remove(renderer);
      st.kill();
      ro.disconnect();
      io.disconnect();
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      window.removeEventListener("pointermove", globalMove);
      window.removeEventListener("load", refresh);
      petalStore.swirl = 0;
      document.documentElement.dataset.tone = "light";
      stage.dispose();
      stageRef.current = null;
    };
  }, [mobile, reduced]);

  const resetView = () => {
    const s = stageRef.current;
    if (!s) return;
    gsap.to(s, { userYaw: 0, userPitch: 0, duration: 0.9, ease: "power3.inOut" });
    setMoved(false);
  };

  const decalSpecs = [
    { kind: "rose" as const, pal: "blush" as const, cls: "left-[4%] top-[14%] w-[260px]", blur: 1.5 },
    { kind: "peony" as const, pal: "blush" as const, cls: "right-[3%] top-[8%] w-[340px]", blur: 3 },
    { kind: "lily" as const, pal: "ivory" as const, cls: "left-[9%] bottom-[6%] w-[320px]", blur: 4 },
    { kind: "tulip" as const, pal: "sunset" as const, cls: "right-[10%] bottom-[8%] w-[240px]", blur: 1 },
    { kind: "wild" as const, pal: "ivory" as const, cls: "left-[34%] top-[4%] w-[150px]", blur: 2 },
  ];

  const sceneBase =
    "scene-text pointer-events-none absolute inset-x-0 bottom-0 z-[6] flex flex-col px-6 pb-12 pt-32 md:inset-0 md:px-14 md:pb-0 md:pt-0";

  return (
    <section ref={section} id="discover" className="relative h-[620vh] md:h-[780vh]" aria-label="Scroll to bloom — a journey through one bouquet">
      <div ref={stageEl} className="sticky top-0 h-[100svh] w-full overflow-hidden grain">
        {/* ---------- backgrounds ---------- */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 700px at 78% 40%, #fff6ea 0%, rgba(255,246,234,0) 70%), radial-gradient(700px 500px at 8% 90%, rgba(242,211,214,0.7), transparent 70%), linear-gradient(180deg,#f8efe6 0%, #f4e6dc 100%)",
          }}
        />
        <div
          ref={dusk}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(1100px 800px at 50% 55%, #6b4a2a 0%, #3a2819 38%, #1c1511 80%), linear-gradient(180deg,#1c1511,#2a1d14)",
          }}
        />
        <div ref={rays} className="rays absolute inset-0 opacity-0" />
        <div
          ref={glow}
          className="absolute top-[52%] h-[85vmin] w-[85vmin] rounded-full opacity-0"
          style={{ background: "radial-gradient(circle, rgba(255,220,160,0.55) 0%, rgba(255,190,120,0.18) 40%, transparent 68%)" }}
        />

        {/* floating blooms drifting by (scenes 4–5) */}
        <div className="pointer-events-none absolute inset-0 z-[1] hidden md:block" aria-hidden>
          {decalSpecs.map((d, i) => (
            <div
              key={d.kind}
              ref={(el) => {
                decals.current[i] = el;
              }}
              className={`absolute opacity-0 ${d.cls}`}
              style={{ filter: `blur(${d.blur}px) drop-shadow(0 30px 40px rgba(0,0,0,0.35))` }}
            >
              <BloomPhoto kind={d.kind} palette={d.pal} alt="" className="h-auto w-full" size={420} tilt={0.7 + i * 0.12} />
            </div>
          ))}
        </div>

        {/* petals behind the bouquet */}
        <div className="absolute inset-0 z-[2]">
          <PetalField count={22} mobileCount={9} avoidCentre opacity={0.9} />
        </div>

        {/* ---------- the bouquet ---------- */}
        {failed ? (
          <div className="absolute inset-0 z-[3] grid place-items-center text-ink-soft">3D isn’t supported on this device.</div>
        ) : (
          <canvas
            ref={canvas}
            role="img"
            aria-label="A 3D bouquet that turns and blooms as you scroll. Drag to rotate it yourself."
            className="absolute inset-0 z-[3] h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
          />
        )}

        {/* anchored labels */}
        <div className="pointer-events-none absolute inset-0 z-[5] text-ink" aria-hidden>
          {labels.map((l, i) => (
            <div
              key={l.id}
              ref={(el) => {
                labelEls.current[i] = el;
              }}
              className="lbl"
              data-side="right"
            >
              <span className="dot" />
              <span className="ln" />
              <span className="tx">
                <span className="block font-display text-xl italic leading-none">{l.label}</span>
                <span className="eyebrow mt-1 block text-[0.6rem] text-ink-soft">{l.note}</span>
              </span>
            </div>
          ))}
        </div>

        {/* ---------- scene 1 — hero ---------- */}
        <div
          ref={(el) => {
            scenes.current[0] = el;
          }}
          className={`${sceneBase} justify-end md:justify-center md:pl-[7vw] md:pr-[50vw]`}
        >
          <p data-intro className="eyebrow mb-5 text-rose-deep">
            Maison de fleurs · Bloomé
          </p>
          <h1 data-intro className="h-xl max-w-[12ch] text-balance">
            Some feelings are better expressed in <span className="italic-accent">flowers.</span>
          </h1>
          <p data-intro className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
            Hand-tied bouquets, composed like paintings. Scroll — and watch one come to life.
          </p>
          <div data-intro className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4">
            <button className="btn btn-solid" onClick={() => scrollToId("collection")}>
              Discover the collection <ArrowRight size={16} />
            </button>
            <button className="link-u eyebrow hidden sm:block" onClick={() => scrollToId("studio")}>
              Design your own
            </button>
          </div>
        </div>

        {/* ---------- scene 2 — gentle turn ---------- */}
        <div
          ref={(el) => {
            scenes.current[1] = el;
          }}
          className={`${sceneBase} invisible justify-end md:items-end md:justify-center md:pl-[52vw] md:pr-[7vw] md:text-right`}
        >
          <p className="eyebrow mb-4 text-rose-deep">I · A gentle turn</p>
          <h2 className="h-lg max-w-[12ch] text-balance md:ml-auto">
            Turn it, and <span className="italic-accent">watch it breathe.</span>
          </h2>
          <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-ink-soft md:ml-auto">
            Every stem is placed by hand so the bouquet is beautiful from every side. Scroll to turn it — or take hold and turn it yourself.
          </p>
        </div>

        {/* ---------- scene 3 — the art of arrangement ---------- */}
        <div
          ref={(el) => {
            scenes.current[2] = el;
          }}
          className={`${sceneBase} invisible justify-end md:justify-end md:pb-[12vh] md:pl-[7vw] md:pr-[52vw]`}
        >
          <p className="eyebrow mb-4 text-rose-deep">II · The art of arrangement</p>
          <h2 className="h-lg max-w-[11ch] text-balance">
            Layer upon <span className="italic-accent">layer.</span>
          </h2>
          <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-ink-soft">
            Garden roses, ruffled peonies, open lilies and wild stems — gathered in silk and tied with a ribbon.
          </p>
        </div>

        {/* ---------- scene 4 — a world in bloom ---------- */}
        <div
          ref={(el) => {
            scenes.current[3] = el;
          }}
          className={`${sceneBase} invisible items-center justify-end text-center text-ivory md:items-start md:justify-end md:pb-[12vh] md:pl-[7vw] md:pr-[55vw] md:text-left`}
        >
          <p className="eyebrow mb-4 text-[#f2c9a0]">III · A world in bloom</p>
          <h2 className="h-lg max-w-[16ch] text-balance">The garden leans in to listen.</h2>
          <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-ivory/80">
            Golden light, drifting petals, a hush in the air — the bouquet is only the beginning.
          </p>
        </div>

        {/* ---------- scene 5 — the blooming moment ---------- */}
        <div
          ref={(el) => {
            scenes.current[4] = el;
          }}
          className={`${sceneBase} invisible items-center justify-start text-center text-ivory md:justify-start md:pt-[13vh]`}
        >
          <p className="eyebrow mb-1 text-[#f2c9a0]">IV · The blooming moment</p>
          <p className="font-script text-[clamp(4rem,12vw,9.5rem)] leading-[0.9] text-[#ffe3b8] drop-shadow-[0_6px_30px_rgba(255,180,100,0.45)]">
            Bloom.
          </p>
        </div>

        {/* ---------- scene 6 — the final composition ---------- */}
        <div
          ref={(el) => {
            scenes.current[5] = el;
          }}
          className={`${sceneBase} invisible justify-end md:justify-center md:pl-[54vw] md:pr-[6vw]`}
        >
          <p className="eyebrow mb-4 text-rose-deep">V · The final composition</p>
          <h2 className="h-lg max-w-[12ch] text-balance">{HERO.name}</h2>
          <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">{HERO.blurb}</p>
          <p className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl font-light">{formatPrice(HERO.price)}</span>
            <span className="eyebrow text-ink-soft">Signature collection · grand</span>
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
            <button className="btn btn-solid" onClick={() => onOpen(HERO.id)}>
              Discover this bouquet <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={() =>
                add({
                  key: `${HERO.id}-grand-`,
                  name: HERO.name,
                  detail: "Grand · signature",
                  unitPrice: HERO.price,
                  config: HERO.config,
                })
              }
            >
              Add to bag
            </button>
          </div>
        </div>

        {/* ---------- controls ---------- */}
        <div ref={cue} className="pointer-events-none absolute bottom-7 left-1/2 z-[7] hidden -translate-x-1/2 flex-col items-center gap-3 text-ink-soft md:flex">
          <span className="eyebrow">Scroll to bloom</span>
          <span className="block h-12 w-px overflow-hidden bg-ink/15">
            <span className="cue-line block h-full w-full bg-ink/60" />
          </span>
        </div>
        <div ref={hint} className="pointer-events-none absolute left-1/2 top-24 z-[7] hidden -translate-x-1/2 items-center gap-2 text-ink-soft opacity-0 md:flex">
          <MoveHorizontal size={16} /> <span className="eyebrow">Drag the bouquet to turn it</span>
        </div>
        {moved && (
          <button onClick={resetView} className="chip absolute left-5 top-24 z-[8] flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] md:left-10">
            <RotateCcw size={13} /> Reset view
          </button>
        )}
      </div>
    </section>
  );
}
