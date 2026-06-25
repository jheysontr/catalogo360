import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TestimonialItem } from "@/components/StoreFront/AppTemplate/layoutConfig";

interface Props {
  id: string;
  index: number;
  item: TestimonialItem;
  onChange: (next: TestimonialItem) => void;
  onRemove: () => void;
}

const SortableTestimonialItem = ({ id, index, item, onChange, onRemove }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2 rounded-md border bg-card p-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Reordenar testimonio"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            Testimonio {index + 1}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
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
          value={item.name}
          maxLength={40}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
        />
        <Input
          className="h-8 text-sm"
          placeholder="Rol (opcional)"
          value={item.role ?? ""}
          maxLength={40}
          onChange={(e) => onChange({ ...item, role: e.target.value })}
        />
      </div>
      <Textarea
        className="text-sm"
        rows={2}
        placeholder="Mensaje del cliente"
        value={item.text}
        maxLength={200}
        onChange={(e) => onChange({ ...item, text: e.target.value })}
      />
    </div>
  );
};

export default SortableTestimonialItem;
