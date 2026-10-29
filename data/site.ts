import type { BouquetConfig, FlowerKind, SizeId } from "@/lib/three/types";

/* ------------------------------------------------------------------ *
 *  EDIT ME — brand + contact details.
 *  Leave a field as "" and the website shows "coming soon" instead of
 *  inventing details.
 * ------------------------------------------------------------------ */
export const BRAND = {
  name: "Bloomé",
  tagline: "Where Flowers Come to Life",
  description:
    "Bloomé is a luxury floral atelier and gifting studio. Scroll to watch a hand-tied bouquet turn, open and bloom — then design a complete gift.",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
};

/* ------------------------------------------------------------------ *
 *  Money — everything is in Pakistani rupees (PKR).
 * ------------------------------------------------------------------ */
export const CURRENCY = "PKR";
/** PKR 1,500 */
export const formatPrice = (n: number) => `${CURRENCY} ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
export const roundTo = (n: number, step = 50) => Math.round(n / step) * step;

/** Shown wherever prices appear until the business confirms real rates. */
export const SAMPLE_PRICE_NOTE = "Sample prices — final rates are confirmed by Bloomé.";

export const SIZE_MULT: Record<SizeId, number> = { petite: 0.75, classic: 1, grand: 1.55 };
export const SIZE_LABEL: Record<SizeId, string> = {
  petite: "Petite",
  classic: "Classic",
  grand: "Grand",
};

export type Occasion = "birthday" | "anniversary" | "celebration" | "apology" | "everyday";
export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "birthday", label: "Birthdays" },
  { id: "anniversary", label: "Anniversaries" },
  { id: "celebration", label: "Celebrations" },
  { id: "apology", label: "Apologies & thanks" },
  { id: "everyday", label: "Everyday gestures" },
];

export type Stock = "in" | "low" | "out";
export const STOCK_LABEL: Record<Stock, string> = {
  in: "In season",
  low: "Limited — few left",
  out: "Sold out",
};

export type Category = "roses" | "pastel" | "tulips" | "signature" | "seasonal" | "birthday" | "anniversary" | "appreciation" | "gift-sets";
export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "roses", label: "Roses" },
  { id: "pastel", label: "Pastel" },
  { id: "tulips", label: "Tulips" },
  { id: "signature", label: "Signature" },
  { id: "seasonal", label: "Seasonal" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "appreciation", label: "Thank you & sorry" },
  { id: "gift-sets", label: "With gifts" },
];

export interface Product {
  id: string;
  name: string;
  kicker: string;
  blurb: string;
  /** price of the size in config.size (PKR) */
  price: number;
  config: BouquetConfig;
  sizes: SizeId[];
  composition: string[];
  /** colours / varieties, shown on the product page */
  varieties: string;
  occasions: Occasion[];
  categories: Category[];
  stock: Stock;
  accent: string;
  flowerTags: FlowerKind[];
  /** gift add-ons pre-selected in the Gift Builder (catalog keys: "choc:ferrero:t8") */
  bundle?: string[];
}

/** price of a product in a given size, rounded to the nearest PKR 50 */
export const productPrice = (p: Product, size: SizeId) => roundTo((p.price / SIZE_MULT[p.config.size]) * SIZE_MULT[size]);

const base = {
  wrap: "cream",
  ribbon: "champagne",
  ribbonStyle: "bow",
  size: "classic",
  presentation: "wrapped",
} as const;
const ALL: SizeId[] = ["petite", "classic", "grand"];

export const PRODUCTS: Product[] = [
  {
    id: "rose-reverie",
    name: "Rosé Reverie",
    kicker: "Romantic roses",
    blurb: "Blush garden roses, hand-tied with silver eucalyptus — a love letter without a single word.",
    price: 4500,
    config: { ...base, style: "classic", flowers: ["rose"], palette: "blush", wrap: "blush", seed: 11 },
    sizes: ALL,
    composition: ["Garden roses", "Silver eucalyptus", "Baby's breath", "Silk ribbon"],
    varieties: "Blush & dusty-rose roses",
    occasions: ["anniversary", "apology", "everyday"],
    categories: ["roses", "anniversary"],
    stock: "in",
    accent: "#e9a7b4",
    flowerTags: ["rose"],
  },
  {
    id: "peony-promise",
    name: "Peony Promise",
    kicker: "Pastel arrangements",
    blurb: "Cloud-soft peonies in ivory and rose. Joy, abundance, and the happiest kind of fuss.",
    price: 6500,
    config: { ...base, style: "dome", flowers: ["peony", "rose"], palette: "ivory", wrap: "sage", seed: 5 },
    sizes: ["classic", "grand"],
    composition: ["Peonies", "Garden roses", "Eucalyptus", "Silk ribbon"],
    varieties: "Ivory & cream peonies, champagne roses",
    occasions: ["birthday", "celebration"],
    categories: ["pastel", "seasonal"],
    stock: "low",
    accent: "#f1d9cc",
    flowerTags: ["peony", "rose"],
  },
  {
    id: "tulip-morning",
    name: "Tulip Morning",
    kicker: "Elegant tulips",
    blurb: "Sun-washed tulips that lean toward the light. A fresh start, tied with a ribbon.",
    price: 3800,
    config: { ...base, style: "classic", flowers: ["tulip", "wild"], palette: "sunset", wrap: "cream", ribbon: "sage", seed: 21 },
    sizes: ALL,
    composition: ["Tulips", "Wild daisies", "Eucalyptus", "Linen wrap"],
    varieties: "Golden & peach tulips, white daisies",
    occasions: ["birthday", "everyday", "celebration"],
    categories: ["tulips", "seasonal", "birthday"],
    stock: "in",
    accent: "#f6c27a",
    flowerTags: ["tulip", "wild"],
  },
  {
    id: "meadow-whisper",
    name: "Meadow Whisper",
    kicker: "Seasonal wildflowers",
    blurb: "Loose, lavender-dusted and a little untamed — like an afternoon in a field.",
    price: 4200,
    config: { ...base, style: "wild", flowers: ["wild", "rose", "tulip"], palette: "lavender", wrap: "kraft", ribbon: "ivory", ribbonStyle: "band", seed: 8 },
    sizes: ALL,
    composition: ["Wildflowers", "Lavender roses", "Tulips", "Baby's breath"],
    varieties: "Lavender roses & tulips, white wildflowers",
    occasions: ["everyday", "apology", "birthday"],
    categories: ["seasonal", "pastel"],
    stock: "in",
    accent: "#c9bce6",
    flowerTags: ["wild", "rose", "tulip"],
  },
  {
    id: "lily-hour",
    name: "Lily Hour",
    kicker: "Quiet elegance",
    blurb: "Pure white lilies with a whisper of pink. Graceful, fragrant, unforgettable.",
    price: 5500,
    config: { ...base, style: "classic", flowers: ["lily", "rose"], palette: "blush", wrap: "cream", ribbon: "ivory", seed: 14 },
    sizes: ["classic", "grand"],
    composition: ["Oriental lilies", "Blush roses", "Eucalyptus", "Silk ribbon"],
    varieties: "White lilies, blush roses",
    occasions: ["anniversary", "celebration", "apology"],
    categories: ["anniversary", "appreciation"],
    stock: "out",
    accent: "#fbe9e4",
    flowerTags: ["lily", "rose"],
  },
  {
    id: "maison-bloom",
    name: "The Maison Bloom",
    kicker: "Signature arrangement",
    blurb: "Our grandest composition: roses, peonies, lilies and tulips in full, glowing bloom.",
    price: 11500,
    config: { ...base, style: "classic", flowers: ["rose", "peony", "lily", "tulip", "wild"], palette: "blush", wrap: "cream", size: "grand", seed: 3 },
    sizes: ["classic", "grand"],
    composition: ["Garden roses", "Peonies", "Lilies", "Tulips", "Wildflowers", "Eucalyptus"],
    varieties: "Blush roses & peonies, white lilies, mixed tulips",
    occasions: ["anniversary", "celebration", "birthday"],
    categories: ["signature", "anniversary"],
    stock: "in",
    accent: "#d98b9b",
    flowerTags: ["rose", "peony", "lily", "tulip", "wild"],
  },
  {
    id: "birthday-bloom",
    name: "Birthday Bloom",
    kicker: "Birthday flowers",
    blurb: "A cheerful, sun-warm mix made for candles, cake and the people you adore.",
    price: 4800,
    config: { ...base, style: "wild", flowers: ["tulip", "rose", "wild"], palette: "sunset", wrap: "kraft", ribbon: "rose", seed: 33 },
    sizes: ALL,
    composition: ["Tulips", "Peach roses", "Wildflowers", "Eucalyptus"],
    varieties: "Golden tulips, peach roses, cream wildflowers",
    occasions: ["birthday", "celebration"],
    categories: ["birthday", "seasonal"],
    stock: "in",
    accent: "#f4a582",
    flowerTags: ["tulip", "rose", "wild"],
  },
  {
    id: "gratitude-posy",
    name: "Gratitude Posy",
    kicker: "Thank you & sorry",
    blurb: "A soft, round posy that says thank you, I’m sorry, or I’m thinking of you — gently.",
    price: 3400,
    config: { ...base, style: "dome", flowers: ["rose", "wild"], palette: "lavender", wrap: "blush", ribbon: "ivory", ribbonStyle: "band", size: "petite", seed: 41 },
    sizes: ["petite", "classic"],
    composition: ["Lavender roses", "Wildflowers", "Eucalyptus"],
    varieties: "Lavender roses, white wildflowers",
    occasions: ["apology", "everyday"],
    categories: ["appreciation", "pastel"],
    stock: "in",
    accent: "#d9cdf0",
    flowerTags: ["rose", "wild"],
  },
  {
    id: "sweetheart-set",
    name: "Sweetheart Gift Set",
    kicker: "Flowers + chocolates + a bear",
    blurb: "Blush roses with Ferrero Rocher, a small teddy and a heart balloon — ready to customise.",
    price: 4500,
    config: { ...base, style: "classic", flowers: ["rose", "peony"], palette: "blush", wrap: "blush", seed: 17 },
    sizes: ["classic", "grand"],
    composition: ["Garden roses", "Peonies", "Eucalyptus", "Plus the gifts selected in the Gift Builder"],
    varieties: "Blush roses & peonies",
    occasions: ["anniversary", "birthday", "everyday"],
    categories: ["gift-sets", "roses"],
    stock: "in",
    accent: "#f2c6cf",
    flowerTags: ["rose", "peony"],
    bundle: ["choc:ferrero:t8", "toy:cream-cuddle:small", "balloon:heart-love:std"],
  },
];

export interface FlowerStory {
  kind: FlowerKind;
  name: string;
  meaning: string;
  poem: string;
  occasions: Occasion[];
  palette: "blush" | "ivory" | "sunset" | "lavender" | "crimson";
}

export const STORIES: FlowerStory[] = [
  {
    kind: "rose",
    name: "Roses",
    meaning: "Love & romance",
    poem: "The oldest way to say it. Every petal is a reason, folded closer to the heart.",
    occasions: ["anniversary", "apology"],
    palette: "crimson",
  },
  {
    kind: "peony",
    name: "Peonies",
    meaning: "Joy & prosperity",
    poem: "They arrive tightly held and open into something astonishing. A promise of good days.",
    occasions: ["birthday", "celebration"],
    palette: "blush",
  },
  {
    kind: "tulip",
    name: "Tulips",
    meaning: "Affection & new beginnings",
    poem: "Simple, bright and quietly hopeful. The first yes of spring.",
    occasions: ["everyday", "birthday"],
    palette: "sunset",
  },
  {
    kind: "lily",
    name: "Lilies",
    meaning: "Elegance & remembrance",
    poem: "Tall, serene and softly scented — for the moments that deserve stillness.",
    occasions: ["anniversary", "apology"],
    palette: "ivory",
  },
  {
    kind: "wild",
    name: "Wildflowers",
    meaning: "Freedom & spontaneity",
    poem: "Unplanned and unashamed. A reminder that the best things grow on their own.",
    occasions: ["everyday", "apology"],
    palette: "lavender",
  },
];
