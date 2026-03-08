import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, LayoutGrid, List } from "lucide-react";
import type { Category } from "./types";

interface StoreFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (v: string) => void;
  primaryColor: string;
  productCount: number;
  activeCategoryName: string | null;
  perPage: number;
  onPerPageChange: (v: number) => void;
}

const StoreFilters = ({
  search, onSearchChange, sortBy, onSortChange,
  viewMode, onViewModeChange, categories, activeCategory,
  onCategoryChange, primaryColor, productCount, activeCategoryName,
  perPage, onPerPageChange,
}: StoreFiltersProps) => (
  <div className="container mt-6 space-y-3 px-4">
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar productos..." className="pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[130px] shrink-0 sm:w-44">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Más nuevos</SelectItem>
          <SelectItem value="price_high">Mayor precio</SelectItem>
          <SelectItem value="price_low">Menor precio</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex shrink-0 rounded-lg border">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`flex items-center justify-center p-2 transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`flex items-center justify-center p-2 transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>

    {categories.length > 0 && (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        <button
          onClick={() => onCategoryChange("all")}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === "all" ? "text-white shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          style={activeCategory === "all" ? { backgroundColor: primaryColor } : undefined}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat.id ? "text-white shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={activeCategory === cat.id ? { backgroundColor: primaryColor } : undefined}
          >
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>
    )}

    <p className="text-xs text-muted-foreground">
      {productCount} {productCount === 1 ? "producto" : "productos"}
      {activeCategory !== "all" && ` en ${activeCategoryName || "categoría"}`}
    </p>
  </div>
);

export default StoreFilters;
