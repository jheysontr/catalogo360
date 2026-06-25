import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Lock } from "lucide-react";
import { SECTION_META, type LayoutSection } from "@/components/StoreFront/AppTemplate/layoutConfig";

export const PREVIEW_PREFIX = "preview:";

interface Props {
  activeSections: LayoutSection[];
  onToggle: (id: string, enabled: boolean) => void;
}

const PreviewRow = ({ section, onHide }: { section: LayoutSection; onHide: () => void }) => {
  const meta = SECTION_META[section.id];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: PREVIEW_PREFIX + section.id,
    data: { from: "preview", sectionId: section.id },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-2 shadow-sm backdrop-blur"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-primary/70 hover:text-primary active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Reordenar"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="flex-1 truncate text-[11px] font-semibold text-foreground">{meta.label}</span>
      {meta.locked ? (
        <Lock className="h-3 w-3 text-muted-foreground" />
      ) : (
        <button
          type="button"
          onClick={onHide}
          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Ocultar"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

const PreviewDnDOverlay = ({ activeSections, onToggle }: Props) => {
  const ids = activeSections.map((s) => PREVIEW_PREFIX + s.id);
  const { setNodeRef, isOver } = useDroppable({ id: "preview:__zone__", data: { from: "preview-zone" } });
  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-1.5 rounded-lg border-2 border-dashed p-2 transition-colors ${
          isOver ? "border-primary bg-primary/10" : "border-primary/30 bg-background/60"
        }`}
      >
        <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary/70">
          Modo edición — arrastra para reordenar
        </p>
        {activeSections.map((s) => (
          <PreviewRow key={s.id} section={s} onHide={() => onToggle(s.id, false)} />
        ))}
      </div>
    </SortableContext>
  );
};

export default PreviewDnDOverlay;
