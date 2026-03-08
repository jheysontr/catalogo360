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
  <div className="container px-4 pt-4 space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Productos</h3>
        <p className="text-xs text-muted-foreground">
          {productCount} {productCount === 1 ? "producto" : "productos"}
          {activeCategory !== "all" && ` en ${activeCategoryName || "categoría"}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-8 w-[120px] rounded-xl text-xs">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más nuevos</SelectItem>
            <SelectItem value="price_high">Mayor precio</SelectItem>
            <SelectItem value="price_low">Menor precio</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex shrink-0 rounded-xl border overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex items-center justify-center p-1.5 transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`flex items-center justify-center p-1.5 transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-4 w-4" />
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
