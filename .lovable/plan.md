# Drag & Drop Personalizable — Plan de Implementación

## Objetivo

Llevar el editor visual de layout a una experiencia tipo Webflow/Framer con tres capas de drag & drop, funcionales en escritorio y táctil.

## Las tres capas

### 1. Paleta de secciones (sidebar → lista)
Nueva tarjeta **"Secciones disponibles"** que muestra las secciones actualmente desactivadas (`featured`, `promo`, `testimonials`, etc.) como tarjetas arrastrables. Al soltarlas en la lista de secciones activas:
- Se insertan en la posición exacta del drop.
- Se activan automáticamente (`enabled: true`).
- Si ya estaban en la lista, se reordenan a esa posición.

### 2. Reordenar directamente en el preview en vivo
Botón toggle **"Modo edición"** sobre el preview. Al activarlo:
- Cada sección renderizada recibe un overlay semi-transparente con:
  - Etiqueta del nombre de sección.
  - Handle de arrastre (grip).
  - Botón de ocultar (×).
- Drag entre overlays reordena las secciones en tiempo real.
- Compartido con la paleta vía un único `DndContext` global, así una sección de la paleta también puede caer directamente sobre el preview.

### 3. DnD de bloques internos
Aplicado donde tiene más sentido:
- **Testimonios**: cada tarjeta de testimonio en `SectionContentConfig` se vuelve sortable (grip + reorder vertical).
- **Categorías** (futuro): ya tienen orden propio en otra pantalla, no se toca aquí.
- **Productos destacados**: el orden viene de la fuente (`on_sale`/`newest`), no se reordenan manualmente — no aplica.

## Soporte táctil
- `PointerSensor` + `TouchSensor` de `@dnd-kit/core` con `activationConstraint: { delay: 150, tolerance: 8 }` para no interferir con scroll en móvil.
- `KeyboardSensor` para accesibilidad.

## Archivos

**Nuevos**
- `src/components/Dashboard/LayoutEditor/SectionPalette.tsx` — paleta de secciones disponibles, ítems sortables compartidos con la lista.
- `src/components/Dashboard/LayoutEditor/PreviewDnDOverlay.tsx` — overlay de edición sobre el preview con handles por sección.
- `src/components/Dashboard/LayoutEditor/SortableTestimonialItem.tsx` — wrapper sortable para items de testimonios.

**Modificados**
- `src/components/Dashboard/LayoutEditor/LayoutEditor.tsx` — eleva el `DndContext` para que paleta, lista y overlay del preview compartan el mismo contexto; añade toggle "Modo edición"; layout de 3 columnas en xl.
- `src/components/Dashboard/LayoutEditor/SectionList.tsx` — acepta drops desde la paleta (insertar+activar), usa el `DndContext` del padre.
- `src/components/Dashboard/LayoutEditor/SectionContentConfig.tsx` — testimonios envueltos en `SortableContext`.

## UX

```text
┌────────────────────────────────────────────────────────────────────┐
│  Plantilla base [Diario ▾]                                         │
├────────────────────────┬───────────────────────────────────────────┤
│ SECCIONES ACTIVAS      │   PREVIEW          [📱] [💻]  [✏️ Editar] │
│ ☰ Header        [🔒]   │  ┌────────────────────────────────────┐   │
│ ☰ Banner        [⚙]   │  │ ▒▒▒ Header        ✕   ▒▒▒          │   │
│ ☰ Categorías    [⚙]   │  │ ▒▒▒ Banner        ✕   ▒▒▒          │◀──┐│
│ ☰ Productos     [🔒]   │  │ ▒▒▒ Categorías    ✕   ▒▒▒          │   │
│ ☰ Footer        [🔒]   │  │ ▒▒▒ Productos     ✕   ▒▒▒          │   │
│                        │  │ ▒▒▒ Footer        ✕   ▒▒▒          │   │
│ DISPONIBLES (arrastra) │  └────────────────────────────────────┘   │
│ ◫ Destacados           │                                            │
│ ◫ Promo banner         │   El usuario arrastra "Destacados" desde   │
│ ◫ Testimonios          │   la paleta directamente al preview ─────┘ │
└────────────────────────┴────────────────────────────────────────────┘
```

## Detalles técnicos

- **Unified DndContext** en `LayoutEditor`: contiene `SortableContext` para la lista activa y la paleta; un `DragOverlay` global muestra la card flotante durante el drag.
- **Cross-list drag**: al soltar un ítem de la paleta sobre la lista activa, `onDragEnd` detecta el origen (`data.from = "palette"`) y muta el array `sections`: si la sección ya existe → reordena + `enabled: true`; si no → inserta.
- **Preview overlay**: posicionado con `position: absolute` sobre cada sección renderizada. Se mide la altura/posición de cada sección con `useRef` + `ResizeObserver` y se calcula la posición de los overlays. Como alternativa más simple, en "modo edición" el preview se oculta y se reemplaza por una pila vertical de tarjetas placeholder con los nombres de sección, conservando la altura aproximada — esto evita medir el DOM real.

Vamos con la **alternativa simple** para el overlay (sustituye el render por placeholders en modo edición). El reorder es lo importante; el visual real ya se ve fuera del modo edición.

## Fuera de alcance (por ahora)

- DnD de productos dentro del grid principal (los productos ya tienen su propio orden en Dashboard → Productos).
- DnD de categorías (ya existe en su propia pantalla).
- Resize de secciones, edición inline de textos en el preview.

## Iteraciones

Una sola entrega — el alcance es coherente y los tres puntos comparten infraestructura (`DndContext` unificado).
