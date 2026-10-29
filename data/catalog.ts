import type { Stock } from "@/data/site";

/* ================================================================== *
 *  GIFT CATALOG — edit prices, stock and photos here.
 *  Every price below is a SAMPLE (PKR) until Bloomé confirms real rates.
 *
 *  Photos: put an authorised product photo in /public/products/… and set
 *  `image`. Until a photo exists the site shows a clearly-labelled neutral
 *  tile — it never draws fake brand wrappers or logos.
 * ================================================================== */

export interface Variant {
  id: string;
  label: string;
  price: number;
  stock: Stock;
}

/** key used for a selected line: "<category>:<itemId>:<variantId>" */
export type LineKey = string;

/* ---------------- chocolates & sweets ---------------- */
export interface Chocolate {
  id: string;
  brand: string;
  name: string;
  blurb: string;
  /** e.g. "/products/chocolates/kitkat.jpg" — add the file to show a real photo */
  image?: string;
  tone: string; // neutral tile colour used when no photo is available
  variants: Variant[];
}

export const CHOCOLATES: Chocolate[] = [
  {
    id: "kitkat",
    brand: "KitKat",
    name: "KitKat",
    blurb: "Crisp wafer fingers in milk chocolate.",
    image: "/products/chocolates/kitkat.jpg",
    tone: "#e9d9d3",
    variants: [
      { id: "2f", label: "2-finger bar", price: 120, stock: "in" },
      { id: "4f", label: "4-finger bar", price: 230, stock: "in" },
    ],
  },
  {
    id: "mars",
    brand: "Mars",
    name: "Mars",
    blurb: "Soft nougat and caramel under milk chocolate.",
    image: "/products/chocolates/mars.jpg",
    tone: "#e8d7d0",
    variants: [
      { id: "bar", label: "Single bar", price: 160, stock: "in" },
      { id: "multi", label: "Multipack", price: 480, stock: "low" },
    ],
  },
  {
    id: "dairy-milk",
    brand: "Cadbury",
    name: "Dairy Milk",
    blurb: "Creamy milk chocolate — the classic gift bar.",
    image: "/products/chocolates/dairy-milk.jpg",
    tone: "#e3d3e6",
    variants: [
      { id: "bar", label: "Standard bar", price: 250, stock: "in" },
      { id: "large", label: "Large bar", price: 520, stock: "in" },
    ],
  },
  {
    id: "snickers",
    brand: "Snickers",
    name: "Snickers",
    blurb: "Peanuts, caramel and nougat in milk chocolate.",
    image: "/products/chocolates/snickers.jpg",
    tone: "#e6dccf",
    variants: [
      { id: "bar", label: "Single bar", price: 170, stock: "in" },
      { id: "multi", label: "Multipack", price: 520, stock: "in" },
    ],
  },
  {
    id: "bounty",
    brand: "Bounty",
    name: "Bounty",
    blurb: "Coconut filling wrapped in milk chocolate.",
    image: "/products/chocolates/bounty.jpg",
    tone: "#d9e3ea",
    variants: [{ id: "bar", label: "Twin bar", price: 160, stock: "out" }],
  },
  {
    id: "ferrero",
    brand: "Ferrero",
    name: "Ferrero Rocher",
    blurb: "Hazelnut praline in a crisp shell — the gift-box favourite.",
    image: "/products/chocolates/ferrero-rocher.jpg",
    tone: "#eadfc9",
    variants: [
      { id: "t3", label: "T3 · 3 pieces", price: 650, stock: "in" },
      { id: "t8", label: "T8 · 8 pieces", price: 1650, stock: "in" },
      { id: "t16", label: "T16 · 16 pieces", price: 3200, stock: "low" },
    ],
  },
  {
    id: "galaxy",
    brand: "Galaxy",
    name: "Galaxy",
    blurb: "Silky smooth milk chocolate.",
    image: "/products/chocolates/galaxy.jpg",
    tone: "#e9d5dc",
    variants: [{ id: "bar", label: "Standard bar", price: 230, stock: "low" }],
  },
  {
    id: "toblerone",
    brand: "Toblerone",
    name: "Toblerone",
    blurb: "Swiss milk chocolate with honey & almond nougat.",
    image: "/products/chocolates/toblerone.jpg",
    tone: "#e6dfd0",
    variants: [
      { id: "small", label: "Small bar", price: 450, stock: "in" },
      { id: "large", label: "Large bar", price: 1300, stock: "in" },
    ],
  },
  {
    id: "kinder",
    brand: "Kinder",
    name: "Kinder Chocolate",
    blurb: "Milk-cream filled chocolate bars.",
    image: "/products/chocolates/kinder.jpg",
    tone: "#f0dcd8",
    variants: [{ id: "pack4", label: "Pack of 4 bars", price: 380, stock: "in" }],
  },
];

/* ---------------- teddy bears & soft toys (rendered in 3D) ---------------- */
export interface ToyModel {
  fur: string;
  belly: string;
  bow?: string;
  heart?: boolean;
  bunny?: boolean;
}
export interface Toy {
  id: string;
  name: string;
  colour: string;
  blurb: string;
  model: ToyModel;
  variants: Variant[];
  /** 3D scale per size variant id */
  scale: Record<string, number>;
}
export const TOYS: Toy[] = [
  {
    id: "cream-cuddle",
    name: "Cream Cuddle Bear",
    colour: "Cream",
    blurb: "A pocket-sized bear in soft cream fur.",
    model: { fur: "#efe0c8", belly: "#fbf3e4", bow: "#d9b878" },
    variants: [{ id: "small", label: "Small · about 20 cm", price: 1200, stock: "in" }],
    scale: { small: 0.72 },
  },
  {
    id: "classic-brown",
    name: "Classic Brown Bear",
    colour: "Brown",
    blurb: "The traditional teddy — warm, huggable and timeless.",
    model: { fur: "#a8763e", belly: "#d9b68a", bow: "#a03a4b" },
    variants: [
      { id: "medium", label: "Medium · about 35 cm", price: 2400, stock: "in" },
      { id: "small", label: "Small · about 20 cm", price: 1300, stock: "in" },
    ],
    scale: { medium: 1, small: 0.72 },
  },
  {
    id: "snow-white",
    name: "Snow White Bear",
    colour: "White",
    blurb: "Ultra-soft white plush with a satin bow.",
    model: { fur: "#f6f1ea", belly: "#ffffff", bow: "#e7a1b4" },
    variants: [{ id: "medium", label: "Medium · about 35 cm", price: 2600, stock: "in" }],
    scale: { medium: 1 },
  },
  {
    id: "blush-pink",
    name: "Blush Pink Bear",
    colour: "Pink",
    blurb: "Rose-pink fur for the sweetest surprise.",
    model: { fur: "#f0b3c1", belly: "#fbdde4", bow: "#ffffff" },
    variants: [{ id: "medium", label: "Medium · about 35 cm", price: 2500, stock: "in" }],
    scale: { medium: 1 },
  },
  {
    id: "heart-holder",
    name: "Heart-Holder Bear",
    colour: "Cream & red heart",
    blurb: "Hugging a satin heart — made for anniversaries.",
    model: { fur: "#e9d3b4", belly: "#fbf0dc", bow: "#c23a52", heart: true },
    variants: [{ id: "medium", label: "Medium · about 35 cm", price: 2900, stock: "in" }],
    scale: { medium: 1 },
  },
  {
    id: "grand-premium",
    name: "Grand Premium Bear",
    colour: "Honey brown",
    blurb: "A statement bear, nearly a metre tall.",
    model: { fur: "#c18a52", belly: "#ead0a8", bow: "#2f4a3a" },
    variants: [{ id: "large", label: "Large · about 90 cm", price: 7500, stock: "low" }],
    scale: { large: 1.5 },
  },
  {
    id: "bunny",
    name: "Bunny Cuddle",
    colour: "Soft grey",
    blurb: "A floppy-eared plush bunny.",
    model: { fur: "#d6d2cd", belly: "#f6f3ef", bow: "#e7a1b4", bunny: true },
    variants: [{ id: "small", label: "Small · about 25 cm", price: 1600, stock: "in" }],
    scale: { small: 0.8 },
  },
];

/* ---------------- balloons (rendered in 3D) ---------------- */
export interface BalloonModel {
  shape: "heart" | "round";
  color: string;
  metal?: boolean;
  text?: string;
  textColor?: string;
  /** a bundle of three */
  bundle?: string[];
}
export interface Balloon {
  id: string;
  name: string;
  blurb: string;
  model: BalloonModel;
  variants: Variant[];
  /** personalised: customer types the text */
  custom?: boolean;
}
export const BALLOONS: Balloon[] = [
  {
    id: "heart-love",
    name: "“I Love You” Heart",
    blurb: "Red foil heart balloon.",
    model: { shape: "heart", color: "#c62f4a", metal: true, text: "I Love You", textColor: "#fff3f3" },
    variants: [{ id: "std", label: "Heart foil", price: 650, stock: "in" }],
  },
  {
    id: "heart-pink",
    name: "Blush Heart",
    blurb: "Pink foil heart, no text.",
    model: { shape: "heart", color: "#f1a6b8", metal: true },
    variants: [{ id: "std", label: "Heart foil", price: 600, stock: "in" }],
  },
  {
    id: "birthday",
    name: "“Happy Birthday”",
    blurb: "Round balloon with a birthday message.",
    model: { shape: "round", color: "#f6c27a", metal: true, text: "Happy Birthday", textColor: "#5a2a1a" },
    variants: [{ id: "std", label: "Round foil", price: 550, stock: "in" }],
  },
  {
    id: "anniversary",
    name: "“Happy Anniversary”",
    blurb: "Champagne round balloon.",
    model: { shape: "round", color: "#e6cf9c", metal: true, text: "Happy Anniversary", textColor: "#6a3a1c" },
    variants: [{ id: "std", label: "Round foil", price: 600, stock: "in" }],
  },
  {
    id: "gold",
    name: "Metallic Gold",
    blurb: "Mirror-gold round balloon.",
    model: { shape: "round", color: "#d9b24a", metal: true },
    variants: [{ id: "std", label: "Round foil", price: 450, stock: "in" }],
  },
  {
    id: "silver",
    name: "Metallic Silver",
    blurb: "Polished silver round balloon.",
    model: { shape: "round", color: "#c9ced6", metal: true },
    variants: [{ id: "std", label: "Round foil", price: 450, stock: "low" }],
  },
  {
    id: "pastel-bundle",
    name: "Pastel Bundle",
    blurb: "Three latex balloons in pink, white and lavender.",
    model: { shape: "round", color: "#f4c3cf", bundle: ["#f4c3cf", "#fbf7f1", "#cfbdea"] },
    variants: [{ id: "bundle3", label: "Bundle of 3", price: 1200, stock: "in" }],
  },
  {
    id: "custom",
    name: "Personalised Balloon",
    blurb: "Your own short message, printed on the balloon.",
    custom: true,
    model: { shape: "heart", color: "#f1a6b8", metal: true, text: "", textColor: "#ffffff" },
    variants: [{ id: "std", label: "Custom text foil", price: 850, stock: "in" }],
  },
];
export const CUSTOM_BALLOON_COLORS = [
  { id: "#f1a6b8", label: "Blush" },
  { id: "#c62f4a", label: "Red" },
  { id: "#e6cf9c", label: "Champagne" },
  { id: "#cfbdea", label: "Lavender" },
  { id: "#fbf7f1", label: "White" },
];

/* ---------------- greeting cards & letters ---------------- */
export type CardDesignId = "birthday" | "anniversary" | "romantic" | "thankyou" | "apology" | "congrats" | "blank";
export interface CardDesign {
  id: CardDesignId;
  name: string;
  greeting: string;
  from: string;
  to: string;
  ink: string;
  motif: "bloom" | "heart" | "leaf" | "star" | "none";
}
export const CARD_DESIGNS: CardDesign[] = [
  { id: "birthday", name: "Birthday", greeting: "Happy Birthday", from: "#fde7df", to: "#f9c9a8", ink: "#7a3b2a", motif: "star" },
  { id: "anniversary", name: "Anniversary", greeting: "Happy Anniversary", from: "#f8e4e4", to: "#e9a7b4", ink: "#7d2a40", motif: "heart" },
  { id: "romantic", name: "Romantic", greeting: "With all my love", from: "#fbe1e6", to: "#d98b9b", ink: "#6f1f36", motif: "heart" },
  { id: "thankyou", name: "Thank you", greeting: "Thank you", from: "#e9efdc", to: "#b8c7a2", ink: "#2f4a3a", motif: "leaf" },
  { id: "apology", name: "Apology", greeting: "I’m sorry", from: "#e8e1f4", to: "#c9bce6", ink: "#4a3a72", motif: "bloom" },
  { id: "congrats", name: "Congratulations", greeting: "Congratulations", from: "#f7efd5", to: "#e6cf9c", ink: "#5c431c", motif: "star" },
  { id: "blank", name: "Blank (write by hand)", greeting: "", from: "#fbf6ef", to: "#efe4d3", ink: "#3a2e2e", motif: "none" },
];
export const CARD_PRICES = { card: 250, blank: 150, letter: 550 } as const;

/* ---------------- other add-ons ---------------- */
export interface Addon {
  id: string;
  name: string;
  blurb: string;
  icon: "box" | "ribbon" | "basket" | "plush" | "candle";
  variants: Variant[];
}
export const ADDONS: Addon[] = [
  { id: "gift-box", name: "Decorative gift box", blurb: "A keepsake box for chocolates and small gifts.", icon: "box", variants: [{ id: "std", label: "Medium box", price: 800, stock: "in" }] },
  { id: "ribbon", name: "Satin ribbon upgrade", blurb: "Double satin ribbon in a colour of your choice.", icon: "ribbon", variants: [{ id: "std", label: "Per bouquet", price: 250, stock: "in" }] },
  { id: "basket", name: "Gift basket", blurb: "Wicker basket to hold your selected add-ons.", icon: "basket", variants: [{ id: "std", label: "Small basket", price: 1500, stock: "in" }] },
  { id: "mini-plush", name: "Mini plush charm", blurb: "A tiny plush that hangs from the ribbon.", icon: "plush", variants: [{ id: "std", label: "Mini · about 8 cm", price: 450, stock: "in" }] },
  { id: "candle", name: "Scented candle (seasonal)", blurb: "A small soy candle — fragrance varies with the season.", icon: "candle", variants: [{ id: "std", label: "Small jar", price: 900, stock: "low" }] },
];

/* ---------------- bouquet studio extras (PKR) ---------------- */
export const STUDIO_PRICES = {
  base: { petite: 2800, classic: 4200, grand: 6500 },
  flower: { rose: 600, peony: 1000, tulip: 300, lily: 750, wild: 250 },
  style: { classic: 0, dome: 400, wild: 300 },
  presentation: { wrapped: 0, box: 900, basket: 1200 },
  ribbonStyle: { bow: 400, band: 200, none: 0 },
  wrap: { cream: 0, blush: 300, sage: 300, kraft: 0, noir: 600 },
  /** per stem above / below the default count of the chosen size */
  extraStem: 200,
} as const;

/* ================================================================== *
 *  DELIVERY — zones, fees, slots. SAMPLE coverage until confirmed.
 * ================================================================== */
export interface Zone {
  id: string;
  city: string;
  fee: number;
  /** delivery is free when the order subtotal reaches this amount */
  freeOver: number;
  sameDay: boolean;
  /** same-day orders must be placed before this hour (24h clock) */
  cutoffHour: number;
  leadDays: number;
}
export const DELIVERY_ZONES: Zone[] = [
  { id: "lahore", city: "Lahore", fee: 350, freeOver: 8000, sameDay: true, cutoffHour: 14, leadDays: 0 },
  { id: "islamabad", city: "Islamabad / Rawalpindi", fee: 450, freeOver: 10000, sameDay: false, cutoffHour: 12, leadDays: 1 },
  { id: "karachi", city: "Karachi", fee: 450, freeOver: 10000, sameDay: false, cutoffHour: 12, leadDays: 1 },
];
export const COVERAGE_IS_SAMPLE = true;
export const DELIVERY_SLOTS = ["Morning · 10 am – 1 pm", "Afternoon · 1 pm – 5 pm", "Evening · 5 pm – 8 pm"];
export const BUSINESS_HOURS = "10 am – 8 pm (sample hours)";

export interface PaymentMethod {
  id: string;
  label: string;
  note: string;
  enabled: boolean;
}
/** Only methods with enabled:true are shown to customers. */
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "cod", label: "Cash on delivery", note: "Pay the rider when your order arrives.", enabled: true },
  { id: "bank", label: "Bank transfer", note: "Account details are shared after confirmation.", enabled: true },
  { id: "online", label: "Online card / wallet payment", note: "Requires a verified payment provider.", enabled: false },
];
