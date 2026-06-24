# Personalización Avanzada — Editor Visual de Layout

Sistema completo para que cualquier tienda diseñe su storefront combinando secciones reordenables y ajustes finos sobre cualquier plantilla base o desde un lienzo neutro.

## Alcance

1. **Nueva plantilla "Personalizado"** disponible junto a las 5 actuales (Editorial, Diario, Fresh, Studio, Mercado).
2. **Editor visual** en `Dashboard → Personalización` con preview en vivo lado a lado.
3. **Secciones reordenables** (drag & drop) que se pueden activar/desactivar.
4. **Ajustes finos** por sección (banner, cards, grid, header, etc.).
5. **Modo "Duplicar y personalizar"**: tomar cualquier plantilla existente como punto de partida.
6. **Disponible en todos los planes**.

## Arquitectura de datos

Nueva columna en `stores`:

```sql
ALTER TABLE public.stores
  ADD COLUMN layout_config jsonb DEFAULT NULL;
```

Estructura JSON:

```json
{
  "base": "app",                    // plantilla base o "blank"
  "sections": [
    { "id": "header",     "enabled": true,  "order": 0 },
    { "id": "banner",     "enabled": true,  "order": 1, "config": {...} },
    { "id": "categories", "enabled": true,  "order": 2, "config": {...} },
    { "id": "featured",   "enabled": false, "order": 3 },
    { "id": "products",   "enabled": true,  "order": 4, "config": {...} },
    { "id": "promo",      "enabled": false, "order": 5 },
    { "id": "footer",     "enabled": true,  "order": 6 }
  ],
  "overrides": {
    "bannerStyle": "fresh",
    "bannerHeight": "h-36",
    "cardLayout": "fresh",
    "gridCols": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    "pillStyle": "tiles",
    "ctaText": "Comprar",
    "headerBorder": false
  }
}
```

Cuando `template = "custom"` el storefront resuelve el tema así:
`getTheme(base) + overrides → finalTheme`, y renderiza solo las `sections` activas en su orden.

## Secciones disponibles

| ID | Descripción | Configurable |
|----|-------------|--------------|
| `header` | Navbar flotante | Estilo (compact/airy), border, sticky |
| `banner` | Hero principal | Estilo, altura, redondeo, overlay, CTA |
| `categories` | Pills/tiles de categorías | Estilo, forma, slider on/off |
| `featured` | Productos destacados (nuevo) | Cantidad, layout (carousel/grid) |
| `promo` | Banner promocional secundario (nuevo) | Imagen, texto, link |
| `products` | Grid principal | Columnas, gap, layout de card |
| `testimonials` | Testimonios (nuevo, opcional) | Lista editable |
| `footer` | Footer de tienda | Mostrar/ocultar bloques |

Secciones `featured`, `promo` y `testimonials` son **nuevas** y aparecen solo en modo personalizado.

## UI del editor

`src/pages/Dashboard/Personalization.tsx` gana una nueva pestaña **"Layout personalizado"** con:

```text
┌─────────────────────────────────────────────────────┐
│  Base: [Duplicar plantilla ▾] [Empezar en blanco]   │
├──────────────────────┬──────────────────────────────┤
│  SECCIONES (drag)    │   PREVIEW EN VIVO            │
│  ☰ ✓ Header     ⚙   │                              │
│  ☰ ✓ Banner     ⚙   │   [render storefront real]   │
│  ☰ ✓ Categorías ⚙   │                              │
│  ☰ □ Destacados ⚙   │   📱  💻  toggle             │
│  ☰ ✓ Productos  ⚙   │                              │
│  ☰ □ Promo      ⚙   │                              │
│  ☰ ✓ Footer     ⚙   │                              │
├──────────────────────┴──────────────────────────────┤
│  AJUSTES FINOS (acordeón por sección seleccionada)  │
│  Banner ▾                                            │
│    Estilo:    [hero|compact|split|fresh|minimal]    │
│    Altura:    [────●────] 96–240 px                 │
│    Redondeo:  [none|sm|md|lg|2xl|full]              │
│    Overlay:   [────●────] 0–100%                    │
│  Cards ▾  ...                                        │
│  Grid ▾   ...                                        │
└─────────────────────────────────────────────────────┘
            [Cancelar]  [Guardar layout]
```

## Detalles técnicos

**Drag & drop**: `@dnd-kit/core` + `@dnd-kit/sortable` (sin dependencias React-pesadas extra).

**Resolución del tema en runtime** (`src/components/StoreFront/AppTemplate/templateThemes.ts`):

```ts
export const resolveTheme = (
  templateId: string,
  layoutConfig?: LayoutConfig
): TemplateTheme => {
  if (templateId !== "custom" || !layoutConfig) return getTheme(templateId);
  const base = layoutConfig.base === "blank"
    ? BLANK_THEME
    : getTheme(layoutConfig.base);
  return { ...base, ...layoutConfig.overrides, id: "custom" };
};
```

**Renderizado por secciones** en `src/pages/StoreFront.tsx`: cuando `template === "custom"`, mapear `layoutConfig.sections.filter(s => s.enabled).sort(byOrder)` a sus componentes. Las plantillas no-custom siguen renderizando como hoy (cero regresión).

**Nuevas secciones**:
- `src/components/StoreFront/sections/FeaturedProductsSection.tsx`
- `src/components/StoreFront/sections/PromoBannerSection.tsx`
- `src/components/StoreFront/sections/TestimonialsSection.tsx`

**Editor**:
- `src/components/Dashboard/LayoutEditor/LayoutEditor.tsx` (raíz)
- `src/components/Dashboard/LayoutEditor/SectionList.tsx` (DnD)
- `src/components/Dashboard/LayoutEditor/SectionConfig.tsx` (acordeón ajustes)
- `src/components/Dashboard/LayoutEditor/LivePreview.tsx` (iframe-less, monta StoreFront en miniatura)
- `src/components/Dashboard/LayoutEditor/types.ts`

**Persistencia**: hook `useLayoutConfig(storeId)` con `useDashboardStore`. Auto-save con debounce 800 ms o botón "Guardar" explícito (a definir, por ahora explícito).

## Plan de entrega

Para no entregar un mega-PR ilegible, lo construyo en **3 iteraciones secuenciales**, cada una funcional:

1. **Iteración 1 — Fundación**
   - Migración `layout_config` + tipos.
   - Plantilla "custom" + `resolveTheme`.
   - Renderizado de secciones reordenables (header, banner, categorías, productos, footer) leyendo `layout_config`.
   - Editor mínimo: lista drag & drop de secciones con toggle on/off + selector de base. Sin ajustes finos todavía.

2. **Iteración 2 — Ajustes finos**
   - Panel de overrides por sección (banner, cards, grid, pills, header, CTA).
   - Live preview lado a lado con toggle desktop/mobile.

3. **Iteración 3 — Secciones nuevas**
   - `featured`, `promo`, `testimonials` con sus editores.
   - Pulido visual del editor, validaciones, empty states.

## Fuera de alcance (explícito)

- Editor de CSS crudo o tipografías personalizadas (ya existe en otra parte).
- Páginas adicionales (about, contacto): el editor afecta solo el storefront principal.
- Theming oscuro independiente por sección.

¿Procedo con la **Iteración 1** o quieres ajustar el alcance antes?
