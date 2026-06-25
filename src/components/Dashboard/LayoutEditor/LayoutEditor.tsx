import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RotateCcw, Smartphone, Monitor, Eye, Pencil, GripVertical } from "lucide-react";
import SectionList, { ACTIVE_PREFIX } from "./SectionList";
import SectionPalette, { PALETTE_PREFIX } from "./SectionPalette";
import PreviewDnDOverlay, { PREVIEW_PREFIX } from "./PreviewDnDOverlay";
import SectionConfig from "./SectionConfig";
import SectionContentConfig from "./SectionContentConfig";
import TemplatePreview from "@/components/Dashboard/TemplatePreview";
import {
  defaultLayoutConfig,
  resolveTheme,
  SECTION_META,
  type LayoutConfig,
  type LayoutSection,
  type SectionId,
  type ThemeOverrides,
} from "@/components/StoreFront/AppTemplate/layoutConfig";

interface LayoutEditorProps {
  value: LayoutConfig;
  onChange: (next: LayoutConfig) => void;
  onEnableCustomTemplate: () => void;
  isActive: boolean;
  previewContext?: {
    storeName: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor?: string;
    accentColor?: string;
    description: string;
    currency: string;
    customGreeting?: string;
    customBannerDescription?: string;
    fontFamily?: string;
    products?: Array<{ name: string; price: number; image_url: string | null; description: string | null; on_sale: boolean; discount_percent: number | null }>;
  };
}

const BASE_OPTIONS = [
  { value: "app", label: "📱 Diario" },
  { value: "classic", label: "📰 Editorial" },
  { value: "elegante", label: "🥬 Fresh" },
  { value: "moderna", label: "🎨 Studio" },
  { value: "market", label: "🛒 Mercado" },
  { value: "blank", label: "⬜ Lienzo en blanco" },
];

/** Parse a prefixed sortable id like "active:banner" → { container, sectionId }. */
const parseId = (raw: string | number | null | undefined) => {
  if (typeof raw !== "string") return { container: "", sectionId: "" as SectionId };
  const idx = raw.indexOf(":");
  if (idx < 0) return { container: raw, sectionId: "" as SectionId };
  return { container: raw.slice(0, idx), sectionId: raw.slice(idx + 1) as SectionId };
};

const LayoutEditor = ({ value, onChange, onEnableCustomTemplate, isActive, previewContext }: LayoutEditorProps) => {
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [editMode, setEditMode] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Derived: active (enabled) and palette (disabled, non-locked).
  const sortedAll = [...value.sections].sort((a, b) => a.order - b.order);
  const activeSections = sortedAll.filter((s) => s.enabled);
  const paletteSections = sortedAll.filter((s) => !s.enabled && !SECTION_META[s.id].locked);

  const handleBaseChange = (base: string) => onChange({ ...value, base });
  const handleOverridesChange = (overrides: ThemeOverrides) => onChange({ ...value, overrides });
  const handleSectionsContentChange = (sections: LayoutSection[]) => onChange({ ...value, sections });
  const handleReset = () => onChange(defaultLayoutConfig(value.base));
  const handleResetOverrides = () => onChange({ ...value, overrides: {} });

  /** Rebuild sections array: enabled list (in given order) first, then disabled (current order), reindex orders. */
  const commitActiveOrder = (newActiveIds: SectionId[]) => {
    const byId = new Map(value.sections.map((s) => [s.id, s] as const));
    const next: LayoutSection[] = [];
    newActiveIds.forEach((id) => {
      const s = byId.get(id);
      if (s) next.push({ ...s, enabled: true });
    });
    value.sections
      .filter((s) => !newActiveIds.includes(s.id))
      .sort((a, b) => a.order - b.order)
      .forEach((s) => {
        const locked = SECTION_META[s.id].locked === true;
        next.push({ ...s, enabled: locked ? true : s.enabled });
      });
    onChange({
      ...value,
      sections: next.map((s, i) => ({ ...s, order: i })),
    });
  };

  const handleToggle = (id: string, enabled: boolean) => {
    if (SECTION_META[id as SectionId]?.locked) return;
    onChange({
      ...value,
      sections: value.sections.map((s) => (s.id === id ? { ...s, enabled } : s)),
    });
  };

  const handleAddFromPalette = (id: SectionId) => {
    const newActiveIds = [...activeSections.map((s) => s.id), id];
    commitActiveOrder(newActiveIds);
  };

  const onDragStart = (e: DragStartEvent) => setDragId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    setDragId(null);
    const { active, over } = e;
    if (!over) return;
    const src = parseId(active.id);
    const dst = parseId(over.id);
    if (!src.sectionId) return;

    const isSurface = (c: string) => c === "active" || c === "preview";

    // Reorder within active set (drags inside active list or preview overlay).
    if (isSurface(src.container) && (isSurface(dst.container) || dst.container === "preview")) {
      if (!dst.sectionId) return;
      if (src.sectionId === dst.sectionId) return;
      const ids = activeSections.map((s) => s.id);
      const from = ids.indexOf(src.sectionId);
      const to = ids.indexOf(dst.sectionId);
      if (from < 0 || to < 0) return;
      commitActiveOrder(arrayMove(ids, from, to));
      return;
    }

    // From palette → into active or preview surface: insert at target position.
    if (src.container === "palette") {
      const ids = activeSections.map((s) => s.id).filter((id) => id !== src.sectionId);
      let insertIdx = ids.length;
      if (dst.sectionId && isSurface(dst.container)) {
        const i = ids.indexOf(dst.sectionId);
        if (i >= 0) insertIdx = i;
      }
      // If dropped on the preview empty zone, append at end.
      ids.splice(insertIdx, 0, src.sectionId);
      commitActiveOrder(ids);
      return;
    }
  };

  const resolvedTheme = resolveTheme("custom", value);
  const overrideCount = Object.keys(value.overrides).length;

  const dragInfo = dragId ? parseId(dragId) : null;
  const dragMeta = dragInfo?.sectionId ? SECTION_META[dragInfo.sectionId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragId(null)}
    >
      <div className="space-y-6">
        {!isActive && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/15 p-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Activa el layout personalizado</p>
                  <p className="text-xs text-muted-foreground">
                    Tu tienda usa una plantilla fija. Cambia a personalizado para aplicar estas opciones.
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={onEnableCustomTemplate} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Activar personalizado
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          {/* CONTROLS */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plantilla base</CardTitle>
                <CardDescription>
                  Duplica una plantilla existente como punto de partida o empieza desde un lienzo neutro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="layout-base" className="text-xs">Partir de</Label>
                <Select value={value.base} onValueChange={handleBaseChange}>
                  <SelectTrigger id="layout-base" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BASE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">Secciones activas</CardTitle>
                  <CardDescription>
                    Arrastra para reordenar. Usa el switch o el botón × para ocultar.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" /> Restablecer
                </Button>
              </CardHeader>
              <CardContent>
                <SectionList activeSections={activeSections} onToggle={handleToggle} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Paleta de secciones</CardTitle>
                <CardDescription>
                  Arrastra una sección sobre la lista activa o el preview para insertarla, o usa el botón +.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionPalette paletteSections={paletteSections} onAdd={handleAddFromPalette} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">Ajustes finos</CardTitle>
                  <CardDescription>
                    Sobrescribe banner, tarjetas, grid y CTA. {overrideCount > 0 && (
                      <span className="font-medium text-foreground">{overrideCount} ajuste{overrideCount === 1 ? "" : "s"} activo{overrideCount === 1 ? "" : "s"}.</span>
                    )}
                  </CardDescription>
                </div>
                {overrideCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleResetOverrides} className="gap-1.5 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" /> Limpiar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <SectionConfig
                  overrides={value.overrides}
                  resolved={resolvedTheme}
                  onChange={handleOverridesChange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contenido de secciones</CardTitle>
                <CardDescription>
                  Configura destacados, banner promocional y testimonios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionContentConfig
                  sections={value.sections}
                  onChange={handleSectionsContentChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* LIVE PREVIEW */}
          {previewContext && (
            <div className="xl:sticky xl:top-4 xl:self-start">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4" /> Vista previa
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={editMode ? "default" : "outline"}
                        onClick={() => setEditMode((v) => !v)}
                        className="h-7 gap-1 px-2 text-[11px]"
                      >
                        <Pencil className="h-3 w-3" />
                        {editMode ? "Salir" : "Editar"}
                      </Button>
                      <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("mobile")}
                          className={`flex h-7 w-7 items-center justify-center rounded ${previewDevice === "mobile" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                          aria-label="Vista móvil"
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("desktop")}
                          className={`flex h-7 w-7 items-center justify-center rounded ${previewDevice === "desktop" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                          aria-label="Vista escritorio"
                        >
                          <Monitor className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className={`mx-auto overflow-hidden rounded-xl border bg-background ${previewDevice === "mobile" ? "max-w-[320px]" : "w-full"}`}>
                    {editMode ? (
                      <div className="p-3">
                        <PreviewDnDOverlay activeSections={activeSections} onToggle={handleToggle} />
                      </div>
                    ) : (
                      <TemplatePreview
                        templateId="custom"
                        layoutConfig={value}
                        storeName={previewContext.storeName}
                        logoUrl={previewContext.logoUrl}
                        bannerUrl={previewContext.bannerUrl}
                        primaryColor={previewContext.primaryColor}
                        secondaryColor={previewContext.secondaryColor}
                        backgroundColor={previewContext.backgroundColor}
                        accentColor={previewContext.accentColor}
                        description={previewContext.description}
                        products={previewContext.products}
                        currency={previewContext.currency}
                        customGreeting={previewContext.customGreeting}
                        customBannerDescription={previewContext.customBannerDescription}
                        fontFamily={previewContext.fontFamily}
                        usePlaceholders={!previewContext.products || previewContext.products.length === 0}
                      />
                    )}
                  </div>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    {editMode
                      ? "Arrastra cualquier sección o suelta una desde la paleta."
                      : "Activa el modo edición para reordenar arrastrando en el preview."}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {dragMeta ? (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 shadow-lg backdrop-blur">
              <GripVertical className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{dragMeta.label}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default LayoutEditor;
// Re-export prefixes for downstream consumers / tests.
export { ACTIVE_PREFIX, PALETTE_PREFIX, PREVIEW_PREFIX };
