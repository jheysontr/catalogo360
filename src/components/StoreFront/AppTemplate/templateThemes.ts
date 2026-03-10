export interface TemplateTheme {
  id: string;
  label: string;
  description: string;
  emoji: string;
  category?: string;
  // Banner
  bannerGreeting: string;
  bannerRounded: string;
  bannerOverlayOpacity: string;
  bannerStyle: "hero" | "compact" | "full" | "split" | "minimal";
  bannerHeight: string;
  // Cards
  cardRounded: string;
  cardAspect: string;
  cardBorder: boolean;
  cardShadow: string;
  cardLayout: "vertical" | "overlay" | "horizontal-mini";
  showDescription: boolean;
  // Grid
  gridCols: string; // tailwind grid classes
  gridGap: string;
  // Category pills
  pillRounded: string;
  pillStyle: "filled" | "outline" | "underline";
  // Header
  headerBorder: boolean;
  // CTA
  ctaText: string;
  ctaRounded: string;
  // Typography
  priceStyle: "bold" | "large" | "accent";
  nameStyle: "truncate" | "wrap" | "uppercase";
}

export const TEMPLATE_THEMES: Record<string, TemplateTheme> = {
  classic: {
    id: "classic",
    label: "Clásica",
    description: "Banner con logo circular tradicional",
    emoji: "🏪",
    bannerGreeting: "Bienvenido a",
    bannerRounded: "rounded-2xl",
    bannerOverlayOpacity: "opacity-30",
    bannerStyle: "hero",
    bannerHeight: "h-32",
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-[4/5]",
    cardBorder: true,
    cardShadow: "shadow-sm hover:shadow-md",
    cardLayout: "vertical",
    showDescription: false,
    gridCols: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    gridGap: "gap-3 sm:gap-4",
    pillRounded: "rounded-full",
    pillStyle: "filled",
    headerBorder: true,
    ctaText: "Agregar al carrito",
    ctaRounded: "rounded-xl",
    priceStyle: "bold",
    nameStyle: "truncate",
  },
  app: {
    id: "app",
    label: "App",
    description: "Estilo app móvil moderno",
    emoji: "📱",
    bannerGreeting: "Bienvenido a",
    bannerRounded: "rounded-2xl",
    bannerOverlayOpacity: "opacity-30",
    bannerStyle: "compact",
    bannerHeight: "h-24",
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-sm hover:shadow-md",
    cardLayout: "vertical",
    showDescription: false,
    gridCols: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    gridGap: "gap-3 sm:gap-4",
    pillRounded: "rounded-xl",
    pillStyle: "filled",
    headerBorder: true,
    ctaText: "Agregar",
    ctaRounded: "rounded-xl",
    priceStyle: "bold",
    nameStyle: "truncate",
  },
  elegante: {
    id: "elegante",
    label: "Elegante",
    description: "Minimalista y sofisticado",
    emoji: "✨",
    bannerGreeting: "Descubre",
    bannerRounded: "rounded-none",
    bannerOverlayOpacity: "opacity-20",
    bannerStyle: "full",
    bannerHeight: "h-44",
    cardRounded: "rounded-none",
    cardAspect: "aspect-[3/4]",
    cardBorder: false,
    cardShadow: "",
    cardLayout: "overlay",
    showDescription: false,
    gridCols: "grid-cols-2 lg:grid-cols-3",
    gridGap: "gap-1",
    pillRounded: "rounded-none",
    pillStyle: "underline",
    headerBorder: false,
    ctaText: "Comprar",
    ctaRounded: "rounded-none",
    priceStyle: "large",
    nameStyle: "uppercase",
  },
  moderna: {
    id: "moderna",
    label: "Moderna",
    description: "Audaz y dinámica",
    emoji: "🚀",
    bannerGreeting: "Explora",
    bannerRounded: "rounded-xl",
    bannerOverlayOpacity: "opacity-40",
    bannerStyle: "split",
    bannerHeight: "h-28",
    cardRounded: "rounded-xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-md hover:shadow-xl",
    cardLayout: "vertical",
    showDescription: true,
    gridCols: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    gridGap: "gap-4",
    pillRounded: "rounded-lg",
    pillStyle: "outline",
    headerBorder: true,
    ctaText: "Añadir",
    ctaRounded: "rounded-lg",
    priceStyle: "accent",
    nameStyle: "wrap",
  },
};

export const getTheme = (templateId: string): TemplateTheme =>
  TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.app;
