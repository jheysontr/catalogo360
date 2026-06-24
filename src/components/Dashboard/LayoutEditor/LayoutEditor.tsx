import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RotateCcw, Smartphone, Monitor, Eye } from "lucide-react";
import SectionList from "./SectionList";
import SectionConfig from "./SectionConfig";
import SectionContentConfig from "./SectionContentConfig";
import TemplatePreview from "@/components/Dashboard/TemplatePreview";
import {
  defaultLayoutConfig,
  resolveTheme,
  type LayoutConfig,
  type LayoutSection,
  type ThemeOverrides,
} from "@/components/StoreFront/AppTemplate/layoutConfig";

interface LayoutEditorProps {
  value: LayoutConfig;
  onChange: (next: LayoutConfig) => void;
  /** Called when the user wants to switch the storefront's active template to "custom". */
  onEnableCustomTemplate: () => void;
  /** True if the storefront is currently using template="custom". */
  isActive: boolean;
  /** Real store context for the live preview. */
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

const LayoutEditor = ({ value, onChange, onEnableCustomTemplate, isActive, previewContext }: LayoutEditorProps) => {
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  const handleBaseChange = (base: string) => {
    onChange({ ...value, base });
  };

  const handleSectionsChange = (sections: LayoutSection[]) => {
    onChange({ ...value, sections });
  };

  const handleOverridesChange = (overrides: ThemeOverrides) => {
    onChange({ ...value, overrides });
  };

  const handleReset = () => {
    onChange(defaultLayoutConfig(value.base));
  };

  const handleResetOverrides = () => {
    onChange({ ...value, overrides: {} });
  };

  const resolvedTheme = resolveTheme("custom", value);
  const overrideCount = Object.keys(value.overrides).length;

  return (
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
              <p className="mt-2 text-xs text-muted-foreground">
                Los estilos base se heredan de aquí. Cada ajuste fino más abajo sobrescribe la base.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">Secciones del storefront</CardTitle>
                <CardDescription>
                  Arrastra para reordenar y usa el switch para mostrar u ocultar.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Restablecer
              </Button>
            </CardHeader>
            <CardContent>
              <SectionList sections={value.sections} onChange={handleSectionsChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">Ajustes finos</CardTitle>
                <CardDescription>
                  Sobrescribe el banner, las tarjetas, el grid y el CTA. {overrideCount > 0 && (
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
                Configura los destacados, banner promocional y testimonios. Solo se muestran si la sección está activa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SectionContentConfig
                sections={value.sections}
                onChange={handleSectionsChange}
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
                    <Eye className="h-4 w-4" /> Vista previa en vivo
                  </CardTitle>
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
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className={`mx-auto overflow-hidden rounded-xl border bg-background ${previewDevice === "mobile" ? "max-w-[320px]" : "w-full"}`}>
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
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Los cambios se aplican al instante. Guarda para publicarlos.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutEditor;
