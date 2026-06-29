/** Stock templates that ship with a dedicated header + shell. */
export const TEMPLATE_IDS = ["classic", "app", "elegante", "moderna", "market"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** Meta ids used by the custom layout system (no dedicated header/shell). */
export const META_TEMPLATE_IDS = ["custom", "blank"] as const;
export type MetaTemplateId = (typeof META_TEMPLATE_IDS)[number];

export type AnyTemplateId = TemplateId | MetaTemplateId;

export const isTemplateId = (value: unknown): value is TemplateId =>
  typeof value === "string" && (TEMPLATE_IDS as readonly string[]).includes(value);

export interface TemplateTheme {
  id: AnyTemplateId;
  label: string;
  description: string;
  emoji: string;
  category?: string;
  // Banner
  bannerGreeting: string;
  bannerRounded: string;
  bannerOverlayOpacity: string;
  bannerStyle: "hero" | "compact" | "full" | "split" | "minimal" | "fresh";
  bannerHeight: string;
  bannerHighlight?: string;
  bannerCta?: string;
  // Cards
  cardRounded: string;
  cardAspect: string;
  cardBorder: boolean;
  cardShadow: string;
  cardLayout: "vertical" | "overlay" | "horizontal-mini" | "fresh";
  showDescription: boolean;
  // Grid
  gridCols: string;
  gridGap: string;
  // Category pills
  pillRounded: string;
  pillStyle: "filled" | "outline" | "underline" | "tiles";
  // Header
  headerBorder: boolean;
  // CTA
  ctaText: string;
  ctaRounded: string;
  // Typography
  priceStyle: "bold" | "large" | "accent";
  nameStyle: "truncate" | "wrap" | "uppercase";
}

/**
 * Editorial Premium Neutral — 4 distinct identities, shared DNA.
 *
 *  • classic   → editorial magazine, generous whitespace, large serif hero
 *  • app       → daily-use catálogo, compact tape banner, tight grid
 *  • elegante  → fashion editorial, full-bleed cinematic, overlay cards
 *  • moderna   → asymmetric split banner, bold accent, denser grid
 */
export const TEMPLATE_THEMES: Record<string, TemplateTheme> = {
  classic: {
    id: "classic",
    label: "Editorial",
    description: "Magazine clásico con tipografía serif y mucho aire",
    emoji: "📰",
    bannerGreeting: "Bienvenido a",
    bannerRounded: "rounded-none",
    bannerOverlayOpacity: "opacity-20",
    bannerStyle: "hero",
    bannerHeight: "h-40",
    cardRounded: "rounded-none",
    cardAspect: "aspect-[4/5]",
    cardBorder: false,
    cardShadow: "",
    cardLayout: "vertical",
    showDescription: false,
    gridCols: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    gridGap: "gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12",
    pillRounded: "rounded-none",
    pillStyle: "underline",
    headerBorder: true,
    ctaText: "Añadir al carrito",
    ctaRounded: "rounded-none",
    priceStyle: "bold",
    nameStyle: "wrap",
  },

  app: {
    id: "app",
    label: "Diario",
    description: "Catálogo compacto, tipografía clara, ritmo rápido",
    emoji: "📱",
    bannerGreeting: "Tienda en línea",
    bannerRounded: "rounded-[4px]",
    bannerOverlayOpacity: "opacity-25",
    bannerStyle: "compact",
    bannerHeight: "h-24",
    cardRounded: "rounded-[4px]",
    cardAspect: "aspect-[4/5]",
    cardBorder: false,
    cardShadow: "",
    cardLayout: "vertical",
    showDescription: false,
    gridCols: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    gridGap: "gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10",
    pillRounded: "rounded-[2px]",
    pillStyle: "underline",
    headerBorder: true,
    ctaText: "Añadir",
    ctaRounded: "rounded-[2px]",
    priceStyle: "bold",
    nameStyle: "truncate",
  },

  elegante: {
    id: "elegante",
    label: "Fresh",
    description: "Estilo grocery app: banner promo, pills llenos y tarjetas con + flotante",
    emoji: "🥬",
    bannerGreeting: "Fresh.",
    bannerRounded: "rounded-2xl",
    bannerOverlayOpacity: "opacity-100",
    bannerStyle: "fresh",
    bannerHeight: "h-36",
    bannerHighlight: "25% Descuento",
    bannerCta: "Comprar ahora",
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-sm",
    cardLayout: "fresh",
    showDescription: false,
    gridCols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    gridGap: "gap-3 sm:gap-4",
    pillRounded: "rounded-full",
    pillStyle: "filled",
    headerBorder: false,
    ctaText: "Añadir",
    ctaRounded: "rounded-full",
    priceStyle: "bold",
    nameStyle: "truncate",
  },

  moderna: {
    id: "moderna",
    label: "Studio",
    description: "Asimétrico con acento de color y ritmo denso",
    emoji: "🎨",
    bannerGreeting: "Novedades",
    bannerRounded: "rounded-[2px]",
    bannerOverlayOpacity: "opacity-30",
    bannerStyle: "split",
    bannerHeight: "h-32",
    cardRounded: "rounded-[2px]",
    cardAspect: "aspect-[4/5]",
    cardBorder: false,
    cardShadow: "",
    cardLayout: "vertical",
    showDescription: true,
    gridCols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    gridGap: "gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8",
    pillRounded: "rounded-[2px]",
    pillStyle: "underline",
    headerBorder: true,
    ctaText: "Añadir",
    ctaRounded: "rounded-[2px]",
    priceStyle: "accent",
    nameStyle: "wrap",
  },

  market: {
    id: "market",
    label: "Mercado",
    description: "Grocery con categorías en mosaico pastel y tarjetas con + flotante",
    emoji: "🛒",
    bannerGreeting: "Find Products",
    bannerRounded: "rounded-2xl",
    bannerOverlayOpacity: "opacity-100",
    bannerStyle: "fresh",
    bannerHeight: "h-32",
    bannerHighlight: "Hasta 40% OFF",
    bannerCta: "Ver ofertas",
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-sm",
    cardLayout: "fresh",
    showDescription: false,
    gridCols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    gridGap: "gap-3 sm:gap-4",
    pillRounded: "rounded-2xl",
    pillStyle: "tiles",
    headerBorder: false,
    ctaText: "Añadir",
    ctaRounded: "rounded-full",
    priceStyle: "bold",
    nameStyle: "truncate",
  },
};

export const getTheme = (templateId: string): TemplateTheme =>
  TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.app;
