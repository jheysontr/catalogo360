import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTestimonialItem from "./SortableTestimonialItem";
import type {
  LayoutSection,
  SectionId,
  FeaturedSectionConfig,
  PromoSectionConfig,
  TestimonialsSectionConfig,
  TestimonialItem,
} from "@/components/StoreFront/AppTemplate/layoutConfig";

interface Props {
  sections: LayoutSection[];
  onChange: (sections: LayoutSection[]) => void;
}

const CONFIGURABLE: SectionId[] = ["featured", "promo", "testimonials"];

const SectionContentConfig = ({ sections, onChange }: Props) => {
  const updateConfig = (id: SectionId, patch: Record<string, any>) => {
    onChange(
      sections.map((s) =>
        s.id === id ? { ...s, config: { ...(s.config || {}), ...patch } } : s,
      ),
    );
  };

  const get = <T,>(id: SectionId): T => {
    const s = sections.find((x) => x.id === id);
    return (s?.config || {}) as T;
  };

  const featured = get<FeaturedSectionConfig>("featured");
  const promo = get<PromoSectionConfig>("promo");
  const testimonials = get<TestimonialsSectionConfig>("testimonials");

  const updateTestimonialItems = (items: TestimonialItem[]) => {
    updateConfig("testimonials", { items });
  };

  return (
    <Accordion type="multiple" className="w-full">
      {/* FEATURED */}
      <AccordionItem value="featured">
        <AccordionTrigger className="text-sm">Destacados</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label className="text-xs">Título</Label>
              <Input
                className="mt-1.5 h-9 text-sm"
                value={featured.title ?? ""}
                onChange={(e) => updateConfig("featured", { title: e.target.value.slice(0, 40) })}
                placeholder="Destacados"
                maxLength={40}
              />
            </div>
            <div>
              <Label className="text-xs">Cantidad</Label>
              <Select
                value={String(featured.count ?? 4)}
                onValueChange={(v) => updateConfig("featured", { count: Number(v) })}
              >
                <SelectTrigger className="mt-1.5 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Fuente</Label>
            <Select
              value={featured.source ?? "on_sale"}
              onValueChange={(v) => updateConfig("featured", { source: v })}
            >
              <SelectTrigger className="mt-1.5 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="on_sale">Productos en oferta</SelectItem>
                <SelectItem value="newest">Más recientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* PROMO */}
      <AccordionItem value="promo">
        <AccordionTrigger className="text-sm">Promo banner</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Título</Label>
              <Input
                className="mt-1.5 h-9 text-sm"
                value={promo.title ?? ""}
                onChange={(e) => updateConfig("promo", { title: e.target.value.slice(0, 50) })}
                maxLength={50}
              />
            </div>
            <div>
              <Label className="text-xs">Subtítulo</Label>
              <Input
                className="mt-1.5 h-9 text-sm"
                value={promo.subtitle ?? ""}
                onChange={(e) => updateConfig("promo", { subtitle: e.target.value.slice(0, 80) })}
                maxLength={80}
              />
            </div>
            <div>
              <Label className="text-xs">Texto del botón</Label>
              <Input
                className="mt-1.5 h-9 text-sm"
                value={promo.ctaText ?? ""}
                onChange={(e) => updateConfig("promo", { ctaText: e.target.value.slice(0, 24) })}
                maxLength={24}
                placeholder="Ver más"
              />
            </div>
            <div>
              <Label className="text-xs">Enlace (opcional)</Label>
              <Input
                className="mt-1.5 h-9 text-sm"
                value={promo.ctaUrl ?? ""}
                onChange={(e) => updateConfig("promo", { ctaUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-xs">Color de fondo</Label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="color"
                  value={promo.background ?? "#FFE8B3"}
                  onChange={(e) => updateConfig("promo", { background: e.target.value })}
                  className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <Input
                  className="h-9 flex-1 font-mono text-xs uppercase"
                  value={promo.background ?? "#FFE8B3"}
                  onChange={(e) => updateConfig("promo", { background: e.target.value })}
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Color de texto</Label>
              <Select
                value={promo.textColor ?? "dark"}
                onValueChange={(v) => updateConfig("promo", { textColor: v })}
              >
                <SelectTrigger className="mt-1.5 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* TESTIMONIALS */}
      <AccordionItem value="testimonials">
        <AccordionTrigger className="text-sm">Testimonios</AccordionTrigger>
        <AccordionContent className="space-y-3 pt-2">
          <div>
            <Label className="text-xs">Título</Label>
            <Input
              className="mt-1.5 h-9 text-sm"
              value={testimonials.title ?? ""}
              onChange={(e) => updateConfig("testimonials", { title: e.target.value.slice(0, 50) })}
              maxLength={50}
              placeholder="Lo que dicen"
            />
          </div>
          <div className="space-y-3">
            {(testimonials.items || []).map((t, i) => (
              <div key={i} className="space-y-2 rounded-md border p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Testimonio {i + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateTestimonialItems((testimonials.items || []).filter((_, idx) => idx !== i))}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="h-8 text-sm"
                    placeholder="Nombre"
                    value={t.name}
                    maxLength={40}
                    onChange={(e) => {
                      const next = [...(testimonials.items || [])];
                      next[i] = { ...next[i], name: e.target.value };
                      updateTestimonialItems(next);
                    }}
                  />
                  <Input
                    className="h-8 text-sm"
                    placeholder="Rol (opcional)"
                    value={t.role ?? ""}
                    maxLength={40}
                    onChange={(e) => {
                      const next = [...(testimonials.items || [])];
                      next[i] = { ...next[i], role: e.target.value };
                      updateTestimonialItems(next);
                    }}
                  />
                </div>
                <Textarea
                  className="text-sm"
                  rows={2}
                  placeholder="Mensaje del cliente"
                  value={t.text}
                  maxLength={200}
                  onChange={(e) => {
                    const next = [...(testimonials.items || [])];
                    next[i] = { ...next[i], text: e.target.value };
                    updateTestimonialItems(next);
                  }}
                />
              </div>
            ))}
            {(testimonials.items?.length ?? 0) < 6 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => updateTestimonialItems([
                  ...(testimonials.items || []),
                  { name: "", text: "" },
                ])}
              >
                <Plus className="h-3.5 w-3.5" /> Agregar testimonio
              </Button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SectionContentConfig;
export { CONFIGURABLE };
