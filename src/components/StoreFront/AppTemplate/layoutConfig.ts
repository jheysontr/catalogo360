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

/** Schema version. Bump when adding sections or changing config shape. */
export const LAYOUT_CONFIG_VERSION = 3;

const VALID_BASES = new Set(["app", "classic", "elegante", "moderna", "market", "blank"]);
const VALID_SECTION_IDS = new Set<SectionId>(Object.keys(SECTION_META) as SectionId[]);
const LOCKED_SECTION_IDS: SectionId[] = (Object.entries(SECTION_META) as [SectionId, typeof SECTION_META[SectionId]][])
  .filter(([, m]) => m.locked)
  .map(([id]) => id);

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const sanitizeHex = (v: unknown, fallback: string): string =>
  typeof v === "string" && HEX_RE.test(v.trim()) ? v.trim() : fallback;
const sanitizeText = (v: unknown, fallback = "", max = 200): string => {
  if (typeof v !== "string") return fallback;
  const trimmed = v.trim().slice(0, max);
  return trimmed || fallback;
};
const clampInt = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

/** Per-section config validator. Returns a fresh, safe object. */
const sanitizeSectionConfig = (id: SectionId, raw: any): Record<string, any> | undefined => {
  const safe = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  switch (id) {
    case "featured":
      return {
        title: sanitizeText(safe.title, "Destacados", 60),
        count: clampInt(safe.count, 1, 8, 4),
        source: safe.source === "newest" ? "newest" : "on_sale",
      };
    case "promo":
      return {
        title: sanitizeText(safe.title, "Oferta especial", 80),
        subtitle: sanitizeText(safe.subtitle, "", 140),
        ctaText: sanitizeText(safe.ctaText, "", 40),
        ctaUrl: sanitizeText(safe.ctaUrl, "", 500),
        background: sanitizeHex(safe.background, "#FFE8B3"),
        textColor: safe.textColor === "light" ? "light" : "dark",
      };
    case "testimonials": {
      const rawItems = Array.isArray(safe.items) ? safe.items : [];
      const items = rawItems
        .map((t: any) => ({
          name: sanitizeText(t?.name, "", 60),
          text: sanitizeText(t?.text, "", 300),
          role: sanitizeText(t?.role, "", 80),
        }))
        .filter((t: TestimonialItem) => t.name && t.text)
        .slice(0, 12);
      return {
        title: sanitizeText(safe.title, "Lo que dicen", 60),
        items,
      };
    }
    default:
      return undefined;
  }
};

export const defaultLayoutConfig = (base = "app"): LayoutConfig => ({
  base: VALID_BASES.has(base) ? base : "app",
  sections: DEFAULT_SECTIONS.map((s) => ({
    ...s,
    config: s.config ? sanitizeSectionConfig(s.id, s.config) : undefined,
  })),
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
  const safeOverrides =
    layoutConfig.overrides && typeof layoutConfig.overrides === "object"
      ? layoutConfig.overrides
      : {};
  return { ...base, ...safeOverrides, id: "custom" };
};

/**
 * Normalize a possibly partial / outdated / malformed layout config from the DB.
 * Auto-migrates older versions by:
 *  - Validating `base` against known options.
 *  - Filtering unknown overrides keys (kept as-is — TemplateTheme is open-ended).
 *  - Dropping unknown section ids and de-duping by id.
 *  - Auto-adding any missing sections from DEFAULT_SECTIONS (so newly released
 *    sections appear in the editor without manual migration).
 *  - Forcing locked sections (header/products/footer) to always be enabled.
 *  - Sanitizing per-section config (clamping, hex validation, array filtering).
 * Wrapped in try/catch so a corrupt config never breaks the storefront.
 */
export const normalizeLayoutConfig = (raw: unknown): LayoutConfig => {
  try {
    const obj = (raw && typeof raw === "object" && !Array.isArray(raw)) ? (raw as any) : {};

    const rawBase = typeof obj.base === "string" ? obj.base : "app";
    const base = VALID_BASES.has(rawBase) ? rawBase : "app";

    const overrides: ThemeOverrides =
      obj.overrides && typeof obj.overrides === "object" && !Array.isArray(obj.overrides)
        ? obj.overrides
        : {};

    const incoming: any[] = Array.isArray(obj.sections) ? obj.sections : [];
    const byId = new Map<SectionId, any>();
    for (const s of incoming) {
      if (!s || typeof s !== "object") continue;
      const id = s.id as SectionId;
      if (!VALID_SECTION_IDS.has(id)) continue; // drop unknown ids
      if (byId.has(id)) continue;               // dedupe
      byId.set(id, s);
    }

    // Merge with defaults — newly released sections appear automatically.
    const merged: LayoutSection[] = DEFAULT_SECTIONS.map((d, idx) => {
      const found = byId.get(d.id);
      const isLocked = SECTION_META[d.id].locked === true;
      const enabled = isLocked
        ? true
        : (typeof found?.enabled === "boolean" ? found.enabled : d.enabled);
      const order = typeof found?.order === "number" && Number.isFinite(found.order)
        ? found.order
        : idx;
      const mergedConfig = { ...(d.config || {}), ...((found?.config && typeof found.config === "object") ? found.config : {}) };
      return {
        id: d.id,
        enabled,
        order,
        config: SECTION_META[d.id].configurable ? sanitizeSectionConfig(d.id, mergedConfig) : undefined,
      } as LayoutSection;
    })
      .sort((a, b) => a.order - b.order)
      .map((s, idx) => ({ ...s, order: idx }));

    // Final safety: ensure every locked section exists in the output.
    for (const lockedId of LOCKED_SECTION_IDS) {
      if (!merged.some((s) => s.id === lockedId)) {
        merged.push({ id: lockedId, enabled: true, order: merged.length });
      }
    }

    return { base, sections: merged, overrides };
  } catch (err) {
    console.error("[layoutConfig] normalize failed, falling back to defaults:", err);
    return defaultLayoutConfig();
  }
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
