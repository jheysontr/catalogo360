import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ThemeOverrides } from "@/components/StoreFront/AppTemplate/layoutConfig";
import type { TemplateTheme } from "@/components/StoreFront/AppTemplate/templateThemes";

interface SectionConfigProps {
  overrides: ThemeOverrides;
  resolved: TemplateTheme;
  onChange: (next: ThemeOverrides) => void;
}

/** Helpers to read effective value (override OR resolved base). */
const eff = <K extends keyof TemplateTheme>(o: ThemeOverrides, r: TemplateTheme, k: K): TemplateTheme[K] =>
  (o[k] !== undefined ? (o[k] as TemplateTheme[K]) : r[k]);

const ROUNDED_OPTIONS = [
  { value: "rounded-none", label: "Cuadrado" },
  { value: "rounded-[2px]", label: "Mínimo" },
  { value: "rounded-md", label: "Suave" },
  { value: "rounded-lg", label: "Medio" },
  { value: "rounded-xl", label: "Amplio" },
  { value: "rounded-2xl", label: "Pronunciado" },
  { value: "rounded-full", label: "Píldora" },
];

const BANNER_STYLE_OPTIONS: { value: TemplateTheme["bannerStyle"]; label: string }[] = [
  { value: "hero", label: "Hero clásico" },
  { value: "compact", label: "Compacto" },
  { value: "full", label: "Pantalla completa" },
  { value: "split", label: "Dividido" },
  { value: "minimal", label: "Minimalista" },
  { value: "fresh", label: "Fresh / promo" },
];

const BANNER_HEIGHT_OPTIONS = [
  { value: "h-24", label: "Bajo (96px)" },
  { value: "h-28", label: "Reducido (112px)" },
  { value: "h-32", label: "Medio (128px)" },
  { value: "h-36", label: "Alto (144px)" },
  { value: "h-40", label: "Hero (160px)" },
  { value: "h-48", label: "Cinemático (192px)" },
];

const OVERLAY_OPTIONS = [
  { value: "opacity-0", label: "Sin overlay" },
  { value: "opacity-10", label: "Muy sutil" },
  { value: "opacity-20", label: "Sutil" },
  { value: "opacity-25", label: "Suave" },
  { value: "opacity-30", label: "Medio" },
  { value: "opacity-50", label: "Marcado" },
  { value: "opacity-70", label: "Intenso" },
];

const PILL_STYLE_OPTIONS: { value: TemplateTheme["pillStyle"]; label: string }[] = [
  { value: "filled", label: "Relleno" },
  { value: "outline", label: "Borde" },
  { value: "underline", label: "Subrayado" },
  { value: "tiles", label: "Mosaico" },
];

const CARD_LAYOUT_OPTIONS: { value: TemplateTheme["cardLayout"]; label: string }[] = [
  { value: "vertical", label: "Vertical" },
  { value: "overlay", label: "Overlay" },
  { value: "horizontal-mini", label: "Horizontal mini" },
  { value: "fresh", label: "Fresh (CTA flotante)" },
];

const CARD_ASPECT_OPTIONS = [
  { value: "aspect-square", label: "Cuadrado 1:1" },
  { value: "aspect-[4/5]", label: "Vertical 4:5" },
  { value: "aspect-[3/4]", label: "Retrato 3:4" },
  { value: "aspect-[4/3]", label: "Horizontal 4:3" },
];

const GRID_COLS_OPTIONS = [
  { value: "grid-cols-1 sm:grid-cols-2", label: "1 → 2 columnas" },
  { value: "grid-cols-2 sm:grid-cols-3", label: "2 → 3 columnas" },
  { value: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", label: "2 → 3 → 4" },
  { value: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", label: "2 → 3 → 4 (denso)" },
  { value: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", label: "Hasta 5 columnas" },
];

const GRID_GAP_OPTIONS = [
  { value: "gap-2", label: "Compacto" },
  { value: "gap-3 sm:gap-4", label: "Apretado" },
  { value: "gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10", label: "Cómodo" },
  { value: "gap-x-5 gap-y-10 sm:gap-x-6 sm:gap-y-12", label: "Editorial" },
];

interface FieldProps<T extends string> {
  label: string;
  value: T;
  baseValue?: T;
  options: { value: T; label: string }[];
  onChange: (v: T | undefined) => void;
}

const SelectField = <T extends string>({ label, value, baseValue, options, onChange }: FieldProps<T>) => {
  const isOverridden = baseValue !== undefined && value !== baseValue;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {isOverridden && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[10px] text-primary hover:underline"
          >
            Restablecer
          </button>
        )}
      </div>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-sm">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const SwitchField = ({
  label,
  description,
  value,
  baseValue,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  baseValue?: boolean;
  onChange: (v: boolean | undefined) => void;
}) => {
  const isOverridden = baseValue !== undefined && value !== baseValue;
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border p-2.5">
      <div className="flex-1">
        <Label className="text-xs font-medium">{label}</Label>
        {description && <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {isOverridden && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[10px] text-primary hover:underline"
          >
            Reset
          </button>
        )}
        <Switch checked={value} onCheckedChange={(v) => onChange(v)} />
      </div>
    </div>
  );
};

const SectionConfig = ({ overrides, resolved, onChange }: SectionConfigProps) => {
  const set = <K extends keyof ThemeOverrides>(key: K, value: ThemeOverrides[K] | undefined) => {
    const next = { ...overrides };
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    onChange(next);
  };

  return (
    <Accordion type="multiple" defaultValue={["banner"]} className="w-full">
      {/* HEADER */}
      <AccordionItem value="header">
        <AccordionTrigger className="text-sm">Encabezado</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <SwitchField
            label="Borde inferior"
            description="Línea separadora bajo el header"
            value={eff(overrides, resolved, "headerBorder")}
            baseValue={resolved.headerBorder}
            onChange={(v) => set("headerBorder", v)}
          />
        </AccordionContent>
      </AccordionItem>

      {/* BANNER */}
      <AccordionItem value="banner">
        <AccordionTrigger className="text-sm">Banner hero</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Estilo del banner"
              value={eff(overrides, resolved, "bannerStyle")}
              baseValue={resolved.bannerStyle}
              options={BANNER_STYLE_OPTIONS}
              onChange={(v) => set("bannerStyle", v)}
            />
            <SelectField
              label="Altura"
              value={eff(overrides, resolved, "bannerHeight")}
              baseValue={resolved.bannerHeight}
              options={BANNER_HEIGHT_OPTIONS}
              onChange={(v) => set("bannerHeight", v)}
            />
            <SelectField
              label="Bordes redondeados"
              value={eff(overrides, resolved, "bannerRounded")}
              baseValue={resolved.bannerRounded}
              options={ROUNDED_OPTIONS}
              onChange={(v) => set("bannerRounded", v)}
            />
            <SelectField
              label="Overlay oscuro"
              value={eff(overrides, resolved, "bannerOverlayOpacity")}
              baseValue={resolved.bannerOverlayOpacity}
              options={OVERLAY_OPTIONS}
              onChange={(v) => set("bannerOverlayOpacity", v)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* CATEGORÍAS */}
      <AccordionItem value="categories">
        <AccordionTrigger className="text-sm">Categorías</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Estilo de pills"
              value={eff(overrides, resolved, "pillStyle")}
              baseValue={resolved.pillStyle}
              options={PILL_STYLE_OPTIONS}
              onChange={(v) => set("pillStyle", v)}
            />
            <SelectField
              label="Forma de pills"
              value={eff(overrides, resolved, "pillRounded")}
              baseValue={resolved.pillRounded}
              options={ROUNDED_OPTIONS}
              onChange={(v) => set("pillRounded", v)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* PRODUCTOS / CARDS / GRID */}
      <AccordionItem value="products">
        <AccordionTrigger className="text-sm">Productos y grid</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Estilo de tarjeta"
              value={eff(overrides, resolved, "cardLayout")}
              baseValue={resolved.cardLayout}
              options={CARD_LAYOUT_OPTIONS}
              onChange={(v) => set("cardLayout", v)}
            />
            <SelectField
              label="Proporción"
              value={eff(overrides, resolved, "cardAspect")}
              baseValue={resolved.cardAspect}
              options={CARD_ASPECT_OPTIONS}
              onChange={(v) => set("cardAspect", v)}
            />
            <SelectField
              label="Redondeo de tarjeta"
              value={eff(overrides, resolved, "cardRounded")}
              baseValue={resolved.cardRounded}
              options={ROUNDED_OPTIONS}
              onChange={(v) => set("cardRounded", v)}
            />
            <SelectField
              label="Columnas del grid"
              value={eff(overrides, resolved, "gridCols")}
              baseValue={resolved.gridCols}
              options={GRID_COLS_OPTIONS}
              onChange={(v) => set("gridCols", v)}
            />
            <SelectField
              label="Separación del grid"
              value={eff(overrides, resolved, "gridGap")}
              baseValue={resolved.gridGap}
              options={GRID_GAP_OPTIONS}
              onChange={(v) => set("gridGap", v)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SwitchField
              label="Borde en tarjeta"
              value={eff(overrides, resolved, "cardBorder")}
              baseValue={resolved.cardBorder}
              onChange={(v) => set("cardBorder", v)}
            />
            <SwitchField
              label="Mostrar descripción"
              value={eff(overrides, resolved, "showDescription")}
              baseValue={resolved.showDescription}
              onChange={(v) => set("showDescription", v)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* CTA */}
      <AccordionItem value="cta">
        <AccordionTrigger className="text-sm">Botón de agregar (CTA)</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs">Texto del botón</Label>
                {overrides.ctaText !== undefined && (
                  <button
                    type="button"
                    onClick={() => set("ctaText", undefined)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Restablecer
                  </button>
                )}
              </div>
              <Input
                value={eff(overrides, resolved, "ctaText")}
                onChange={(e) => set("ctaText", e.target.value.slice(0, 30))}
                maxLength={30}
                className="h-9 text-sm"
                placeholder="Añadir"
              />
            </div>
            <SelectField
              label="Redondeo del botón"
              value={eff(overrides, resolved, "ctaRounded")}
              baseValue={resolved.ctaRounded}
              options={ROUNDED_OPTIONS}
              onChange={(v) => set("ctaRounded", v)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SectionConfig;
