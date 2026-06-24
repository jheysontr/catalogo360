import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RotateCcw } from "lucide-react";
import SectionList from "./SectionList";
import {
  defaultLayoutConfig,
  type LayoutConfig,
  type LayoutSection,
} from "@/components/StoreFront/AppTemplate/layoutConfig";

interface LayoutEditorProps {
  value: LayoutConfig;
  onChange: (next: LayoutConfig) => void;
  /** Called when the user wants to switch the storefront's active template to "custom". */
  onEnableCustomTemplate: () => void;
  /** True if the storefront is currently using template="custom". */
  isActive: boolean;
}

const BASE_OPTIONS = [
  { value: "app", label: "📱 Diario" },
  { value: "classic", label: "📰 Editorial" },
  { value: "elegante", label: "🥬 Fresh" },
  { value: "moderna", label: "🎨 Studio" },
  { value: "market", label: "🛒 Mercado" },
  { value: "blank", label: "⬜ Lienzo en blanco" },
];

const LayoutEditor = ({ value, onChange, onEnableCustomTemplate, isActive }: LayoutEditorProps) => {
  const handleBaseChange = (base: string) => {
    onChange({ ...value, base });
  };

  const handleSectionsChange = (sections: LayoutSection[]) => {
    onChange({ ...value, sections });
  };

  const handleReset = () => {
    onChange(defaultLayoutConfig(value.base));
  };

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
            Los estilos de banner, tarjetas, grid y CTAs se heredan de aquí. Próximamente podrás sobrescribir cada uno.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Secciones del storefront</CardTitle>
            <CardDescription>
              Arrastra para reordenar y usa el switch para mostrar u ocultar. Encabezado, productos y pie son fijos.
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

      <Card className="border-dashed">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Próximamente:</strong> editor de ajustes finos por sección (banner, tarjetas, grid, pills, CTAs) y secciones extra (destacados, promo, testimonios).
        </CardContent>
      </Card>
    </div>
  );
};

export default LayoutEditor;
