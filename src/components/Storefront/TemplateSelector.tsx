import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Zap, Sparkles } from "lucide-react";

interface TemplateSelectorProps {
  value: string;
  onChange: (template: string) => void;
}

const TEMPLATES = [
  {
    id: "classic",
    name: "Clásico",
    description: "Catálogo limpio con banner y filtros. Ideal para tiendas con muchos productos.",
    icon: Store,
    preview: ["Banner + Logo", "Filtros y búsqueda", "Grid de productos"],
    colors: { bg: "hsl(var(--muted))", accent: "hsl(var(--primary))" },
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Hero impactante con countdown, social proof y badges de confianza. Ideal para landing de producto.",
    icon: Zap,
    preview: ["Countdown timer", "Hero con CTA", "Trust badges"],
    colors: { bg: "hsl(var(--muted))", accent: "hsl(var(--primary))" },
    badge: "Popular",
  },
  {
    id: "minimal",
    name: "Elegante",
    description: "Diseño minimalista con tipografía premium y espaciado generoso. Ideal para marcas de lujo.",
    icon: Sparkles,
    preview: ["Nombre centrado", "Galería amplia", "Tipografía serif"],
    colors: { bg: "hsl(var(--muted))", accent: "hsl(var(--primary))" },
    badge: "Nuevo",
  },
];

const TemplateSelector = ({ value, onChange }: TemplateSelectorProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {TEMPLATES.map((t) => {
        const isActive = value === t.id;
        const Icon = t.icon;
        return (
          <Card
            key={t.id}
            className={`relative cursor-pointer transition-all hover:shadow-md ${
              isActive ? "ring-2 ring-primary shadow-md" : "hover:ring-1 hover:ring-border"
            }`}
            onClick={() => onChange(t.id)}
          >
            {t.badge && (
              <Badge className="absolute -top-2 right-3 text-[10px]">{t.badge}</Badge>
            )}
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.description}</p>
              <div className="space-y-1">
                {t.preview.map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary" : "bg-border"}`} />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TemplateSelector;
