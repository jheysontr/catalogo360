/**
 * Layout configuration for the "custom" template.
 * Stored nested inside stores.storefront_config.layout_config (JSONB).
 * No DB migration required — piggybacks on existing storefront_config column.
 */
import { TEMPLATE_THEMES, type TemplateTheme, getTheme } from "./templateThemes";

export type SectionId =
  | "header"
  | "banner"
  | "categories"
  | "sort"
  | "featured"
  | "promo"
  | "testimonials"
  | "products"
  | "footer";

/** Per-section structured config (separate from theme overrides). */
export interface FeaturedSectionConfig {
  title?: string;
  count?: number; // 1–8
  source?: "on_sale" | "newest";
}
export interface PromoSectionConfig {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  background?: string; // hex
  textColor?: "light" | "dark";
}
export interface TestimonialItem {
  name: string;
  text: string;
  role?: string;
}
export interface TestimonialsSectionConfig {
  title?: string;
  items?: TestimonialItem[];
}

export type SectionConfigMap = {
  featured: FeaturedSectionConfig;
  promo: PromoSectionConfig;
  testimonials: TestimonialsSectionConfig;
};

export interface LayoutSection {
  id: SectionId;
  enabled: boolean;
  order: number;
  config?: Record<string, any>;
}

/** Subset of TemplateTheme fields that can be overridden per-store. */
export type ThemeOverrides = Partial<TemplateTheme>;

export interface LayoutConfig {
  /** Base theme to start from. Either a known template id, or "blank". */
  base: string;
  sections: LayoutSection[];
  overrides: ThemeOverrides;
}

/** Sober neutral starting point when the user picks "blank". */
export const BLANK_THEME: TemplateTheme = {
  id: "blank",
  label: "En blanco",
  description: "Lienzo neutro",
  emoji: "⬜",
  bannerGreeting: "Bienvenido a",
  bannerRounded: "rounded-lg",
  bannerOverlayOpacity: "opacity-25",
  bannerStyle: "compact",
  bannerHeight: "h-32",
  cardRounded: "rounded-lg",
  cardAspect: "aspect-[4/5]",
  cardBorder: true,
  cardShadow: "shadow-sm",
  cardLayout: "vertical",
  showDescription: false,
  gridCols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  gridGap: "gap-4",
  pillRounded: "rounded-full",
  pillStyle: "outline",
  headerBorder: true,
  ctaText: "Añadir",
  ctaRounded: "rounded-lg",
  priceStyle: "bold",
  nameStyle: "truncate",
};

export const DEFAULT_SECTIONS: LayoutSection[] = [
  { id: "header", enabled: true, order: 0 },
  { id: "banner", enabled: true, order: 1 },
  { id: "categories", enabled: true, order: 2 },
  { id: "featured", enabled: false, order: 3, config: { title: "Destacados", count: 4, source: "on_sale" } },
  { id: "promo", enabled: false, order: 4, config: { title: "Oferta especial", subtitle: "Hasta 30% de descuento", ctaText: "Ver más", background: "#FFE8B3", textColor: "dark" } },
  { id: "sort", enabled: true, order: 5 },
  { id: "products", enabled: true, order: 6 },
  { id: "testimonials", enabled: false, order: 7, config: { title: "Lo que dicen", items: [
    { name: "María", text: "Excelente atención y productos." },
    { name: "Carlos", text: "Entrega rápida, todo perfecto." },
  ] } },
  { id: "footer", enabled: true, order: 8 },
];

export const SECTION_META: Record<SectionId, { label: string; description: string; locked?: boolean; configurable?: boolean }> = {
  header: { label: "Encabezado", description: "Navbar flotante con buscador y acciones", locked: true },
  banner: { label: "Banner hero", description: "Imagen principal con saludo y descripción" },
  categories: { label: "Categorías", description: "Pills o mosaico de categorías" },
  featured: { label: "Destacados", description: "Carrusel de productos destacados", configurable: true },
  promo: { label: "Promo banner", description: "Banner promocional con CTA", configurable: true },
  sort: { label: "Barra de orden", description: "Filtro de orden, vista y resultados" },
  products: { label: "Grid de productos", description: "Catálogo principal", locked: true },
  testimonials: { label: "Testimonios", description: "Reseñas de clientes", configurable: true },
  footer: { label: "Pie de tienda", description: "Información y redes sociales", locked: true },
};

export const defaultLayoutConfig = (base = "app"): LayoutConfig => ({
  base,
  sections: DEFAULT_SECTIONS.map((s) => ({ ...s, config: s.config ? { ...s.config } : undefined })),
  overrides: {},
});

/**
 * Resolve the final theme for a storefront.
 * - If `templateId !== "custom"` or no layout config → use stock template.
 * - Otherwise merge base template (or BLANK_THEME) with user overrides.
 */
export const resolveTheme = (
  templateId: string,
  layoutConfig?: LayoutConfig | null,
): TemplateTheme => {
  if (templateId !== "custom" || !layoutConfig) return getTheme(templateId);
  const base =
    layoutConfig.base === "blank"
      ? BLANK_THEME
      : TEMPLATE_THEMES[layoutConfig.base] ?? TEMPLATE_THEMES.app;
  return { ...base, ...layoutConfig.overrides, id: "custom" };
};

/** Normalize a possibly partial / outdated layout config from the DB. */
export const normalizeLayoutConfig = (raw: unknown): LayoutConfig => {
  const base = (raw as any)?.base ?? "app";
  const overrides = ((raw as any)?.overrides as ThemeOverrides) ?? {};
  const incoming = ((raw as any)?.sections as LayoutSection[] | undefined) ?? [];
  const byId = new Map(incoming.map((s) => [s.id, s]));

  // Merge with defaults so new sections appear automatically.
  const merged = DEFAULT_SECTIONS.map((d, idx) => {
    const found = byId.get(d.id);
    return {
      id: d.id,
      enabled: found?.enabled ?? d.enabled,
      order: found?.order ?? idx,
      config: { ...(d.config || {}), ...(found?.config || {}) },
    } as LayoutSection;
  }).sort((a, b) => a.order - b.order)
    .map((s, idx) => ({ ...s, order: idx }));

  return { base, sections: merged, overrides };
};

/** Visible sections in render order. */
export const visibleSections = (cfg: LayoutConfig): LayoutSection[] =>
  [...cfg.sections].sort((a, b) => a.order - b.order).filter((s) => s.enabled);

/** Strongly-typed config lookup. */
export const getSectionConfig = <K extends keyof SectionConfigMap>(
  cfg: LayoutConfig,
  id: K,
): SectionConfigMap[K] => {
  const found = cfg.sections.find((s) => s.id === id);
  return (found?.config || {}) as SectionConfigMap[K];
};
