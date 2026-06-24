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
  | "products"
  | "footer";

export interface LayoutSection {
  id: SectionId;
  enabled: boolean;
  order: number;
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
  { id: "sort", enabled: true, order: 3 },
  { id: "products", enabled: true, order: 4 },
  { id: "footer", enabled: true, order: 5 },
];

export const SECTION_META: Record<SectionId, { label: string; description: string; locked?: boolean }> = {
  header: { label: "Encabezado", description: "Navbar flotante con buscador y acciones", locked: true },
  banner: { label: "Banner hero", description: "Imagen principal con saludo y descripción" },
  categories: { label: "Categorías", description: "Pills o mosaico de categorías" },
  sort: { label: "Barra de orden", description: "Filtro de orden, vista y resultados" },
  products: { label: "Grid de productos", description: "Catálogo principal", locked: true },
  footer: { label: "Pie de tienda", description: "Información y redes sociales", locked: true },
};

export const defaultLayoutConfig = (base = "app"): LayoutConfig => ({
  base,
  sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
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
    };
  }).sort((a, b) => a.order - b.order)
    .map((s, idx) => ({ ...s, order: idx }));

  return { base, sections: merged, overrides };
};

/** Visible sections in render order. */
export const visibleSections = (cfg: LayoutConfig): LayoutSection[] =>
  [...cfg.sections].sort((a, b) => a.order - b.order).filter((s) => s.enabled);
