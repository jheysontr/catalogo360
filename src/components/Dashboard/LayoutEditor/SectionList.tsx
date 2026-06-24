import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SECTION_META, type LayoutSection } from "@/components/StoreFront/AppTemplate/layoutConfig";

interface SectionListProps {
  sections: LayoutSection[];
  onChange: (sections: LayoutSection[]) => void;
}

const SortableRow = ({
  section,
  onToggle,
}: {
  section: LayoutSection;
  onToggle: (id: string, enabled: boolean) => void;
}) => {
  const meta = SECTION_META[section.id];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{meta.label}</p>
        <p className="truncate text-xs text-muted-foreground">{meta.description}</p>
      </div>
      {meta.locked ? (
        <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          Fijo
        </div>
      ) : (
        <Switch
          checked={section.enabled}
          onCheckedChange={(checked) => onToggle(section.id, checked)}
        />
      )}
    </div>
  );
};

const SectionList = ({ sections, onChange }: SectionListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(sections, oldIdx, newIdx).map((s, idx) => ({ ...s, order: idx }));
    onChange(reordered);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, enabled } : s)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {sections.map((s) => (
            <SortableRow key={s.id} section={s} onToggle={handleToggle} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SectionList;
