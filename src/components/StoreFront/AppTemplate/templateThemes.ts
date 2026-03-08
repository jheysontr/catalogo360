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
  // Cards
  cardRounded: string;
  cardAspect: string;
  cardBorder: boolean;
  cardShadow: string;
  // Category pills
  pillRounded: string;
  // Header
  headerBorder: boolean;
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
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-[4/5]",
    cardBorder: true,
    cardShadow: "shadow-sm hover:shadow-md",
    pillRounded: "rounded-full",
    headerBorder: true,
  },
  app: {
    id: "app",
    label: "App",
    description: "Estilo app móvil moderno",
    emoji: "📱",
    bannerGreeting: "Bienvenido a",
    bannerRounded: "rounded-2xl",
    bannerOverlayOpacity: "opacity-30",
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-sm hover:shadow-md",
    pillRounded: "rounded-xl",
    headerBorder: true,
  },
  elegante: {
    id: "elegante",
    label: "Elegante",
    description: "Minimalista y sofisticado",
    emoji: "✨",
    bannerGreeting: "Descubre",
    bannerRounded: "rounded-3xl",
    bannerOverlayOpacity: "opacity-20",
    cardRounded: "rounded-3xl",
    cardAspect: "aspect-[3/4]",
    cardBorder: false,
    cardShadow: "shadow-md hover:shadow-xl",
    pillRounded: "rounded-full",
    headerBorder: false,
  },
  moderna: {
    id: "moderna",
    label: "Moderna",
    description: "Audaz y dinámica",
    emoji: "🚀",
    bannerGreeting: "Explora",
    bannerRounded: "rounded-xl",
    bannerOverlayOpacity: "opacity-40",
    cardRounded: "rounded-xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-sm hover:shadow-lg",
    pillRounded: "rounded-lg",
    headerBorder: true,
  },
  comida: {
    id: "comida",
    label: "Comida",
    description: "Ideal para restaurantes y delivery",
    emoji: "🍔",
    category: "nicho",
    bannerGreeting: "¡Pide ahora de",
    bannerRounded: "rounded-2xl",
    bannerOverlayOpacity: "opacity-25",
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-sm hover:shadow-md",
    pillRounded: "rounded-full",
    headerBorder: true,
  },
  frutas: {
    id: "frutas",
    label: "Frutas y Orgánicos",
    description: "Fresco y natural para productos orgánicos",
    emoji: "🍎",
    category: "nicho",
    bannerGreeting: "Productos frescos de",
    bannerRounded: "rounded-3xl",
    bannerOverlayOpacity: "opacity-20",
    cardRounded: "rounded-2xl",
    cardAspect: "aspect-[4/5]",
    cardBorder: false,
    cardShadow: "shadow-md hover:shadow-lg",
    pillRounded: "rounded-full",
    headerBorder: false,
  },
  moda: {
    id: "moda",
    label: "Moda y Ropa",
    description: "Estilo editorial para tiendas de moda",
    emoji: "👗",
    category: "nicho",
    bannerGreeting: "Nueva colección de",
    bannerRounded: "rounded-2xl",
    bannerOverlayOpacity: "opacity-30",
    cardRounded: "rounded-xl",
    cardAspect: "aspect-[3/4]",
    cardBorder: false,
    cardShadow: "shadow-lg hover:shadow-xl",
    pillRounded: "rounded-full",
    headerBorder: false,
  },
  electronica: {
    id: "electronica",
    label: "Electrónica",
    description: "Tech y repuestos con diseño limpio",
    emoji: "🔌",
    category: "nicho",
    bannerGreeting: "Lo mejor en tech de",
    bannerRounded: "rounded-xl",
    bannerOverlayOpacity: "opacity-35",
    cardRounded: "rounded-xl",
    cardAspect: "aspect-square",
    cardBorder: true,
    cardShadow: "shadow-sm hover:shadow-md",
    pillRounded: "rounded-lg",
    headerBorder: true,
  },
};

export const getTheme = (templateId: string): TemplateTheme =>
  TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.app;
