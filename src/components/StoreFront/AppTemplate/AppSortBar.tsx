import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List } from "lucide-react";

interface AppSortBarProps {
  sortBy: string;
  onSortChange: (v: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  productCount: number;
  activeCategoryName: string | null;
  activeCategory: string;
  perPage: number;
  onPerPageChange: (v: number) => void;
}

const AppSortBar = ({
  sortBy, onSortChange, viewMode, onViewModeChange,
  productCount, activeCategoryName, activeCategory,
  perPage, onPerPageChange,
}: AppSortBarProps) => (
  <div className="container space-y-3 px-4 pt-6">
    <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
      <div>
        <span className="editorial-eyebrow">Catálogo</span>
        <h2 className="mt-0.5 text-2xl leading-none text-foreground sm:text-3xl">
          {activeCategory !== "all" ? activeCategoryName || "Productos" : "Productos"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {productCount} {productCount === 1 ? "artículo disponible" : "artículos disponibles"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-[140px] border-border bg-background text-xs" style={{ borderRadius: 2 }}>
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más nuevos</SelectItem>
            <SelectItem value="price_high">Mayor precio</SelectItem>
            <SelectItem value="price_low">Menor precio</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex shrink-0 border border-border" style={{ borderRadius: 2 }}>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex h-9 w-9 items-center justify-center transition-colors ${viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Vista cuadrícula"
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`flex h-9 w-9 items-center justify-center transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Vista lista"
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
    {productCount > 12 && (
      <div className="flex justify-end">
        <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
          <SelectTrigger className="h-7 w-auto gap-1 border-0 px-2 text-xs text-muted-foreground hover:text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="12">12 / pág</SelectItem>
            <SelectItem value="20">20 / pág</SelectItem>
            <SelectItem value="40">40 / pág</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}
  </div>
);

export default AppSortBar;
