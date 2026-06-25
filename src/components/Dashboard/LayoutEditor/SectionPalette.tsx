import { useDraggable } from "@dnd-kit/core";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_META, type LayoutSection, type SectionId } from "@/components/StoreFront/AppTemplate/layoutConfig";

export const PALETTE_PREFIX = "palette:";

interface Props {
  /** Sections that are currently disabled and not locked. */
  paletteSections: LayoutSection[];
  /** Called when user clicks the + button (adds at end). */
  onAdd: (id: SectionId) => void;
}

const PaletteCard = ({ section, onAdd }: { section: LayoutSection; onAdd: (id: SectionId) => void }) => {
  const meta = SECTION_META[section.id];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: PALETTE_PREFIX + section.id,
    data: { from: "palette", sectionId: section.id },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.4 : 1 }
    : { opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-2.5 transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      <button
        type="button"
        className="flex flex-1 cursor-grab items-center gap-2 text-left touch-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Arrastrar ${meta.label}`}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{meta.label}</p>
          <p className="truncate text-[10px] text-muted-foreground">{meta.description}</p>
        </div>
      </button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 shrink-0 p-0"
        onClick={() => onAdd(section.id)}
        aria-label="Añadir"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

const SectionPalette = ({ paletteSections, onAdd }: Props) => {
  if (paletteSections.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/20 p-4 text-center text-xs text-muted-foreground">
        Todas las secciones están activas.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {paletteSections.map((s) => (
        <PaletteCard key={s.id} section={s} onAdd={onAdd} />
      ))}
    </div>
  );
};

export default SectionPalette;
