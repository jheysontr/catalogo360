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
  <div className="container px-4 pt-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative max-w-xs flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-xl border bg-card pl-10 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      {/* Category pills — filled with vendor primary when active */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => onCategoryChange("all")}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              activeCategory === "all"
                ? "text-white shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
            style={activeCategory === "all" ? { backgroundColor: primaryColor } : undefined}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? "text-white shadow-md"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
              style={activeCategory === cat.id ? { backgroundColor: primaryColor } : undefined}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Meta row: count + sort + view + per-page */}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">
        {productCount} {productCount === 1 ? "producto" : "productos"}
        {activeCategory !== "all" && activeCategoryName ? ` en ${activeCategoryName}` : ""}
      </p>
      <div className="flex items-center gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-[140px] rounded-xl border bg-card text-xs">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más nuevos</SelectItem>
            <SelectItem value="price_high">Mayor precio</SelectItem>
            <SelectItem value="price_low">Menor precio</SelectItem>
          </SelectContent>
        </Select>
        {productCount > 12 && (
          <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
            <SelectTrigger className="h-9 w-[110px] rounded-xl border bg-card text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="12">12 / pág</SelectItem>
              <SelectItem value="20">20 / pág</SelectItem>
              <SelectItem value="40">40 / pág</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="flex shrink-0 rounded-xl border bg-card">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex h-9 w-9 items-center justify-center rounded-l-xl transition-colors ${viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Vista cuadrícula"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`flex h-9 w-9 items-center justify-center rounded-r-xl transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Vista lista"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default StoreFilters;
