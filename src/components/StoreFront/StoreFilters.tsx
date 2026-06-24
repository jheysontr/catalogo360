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
  <div className="container space-y-5 px-4 pt-6">
    {/* Search + controls */}
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Buscar productos…"
          className="h-10 border-border bg-background pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="h-10 w-[130px] shrink-0 border-border bg-background text-xs sm:w-44" style={{ borderRadius: 2 }}>
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
          className={`flex h-10 w-10 items-center justify-center transition-colors ${viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`flex h-10 w-10 items-center justify-center transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          <List className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>

    {/* Categories — editorial underline strip */}
    {categories.length > 0 && (
      <div className="-mx-4 flex gap-6 overflow-x-auto border-b border-border px-4 scrollbar-hide">
        <button
          onClick={() => onCategoryChange("all")}
          className={`relative whitespace-nowrap px-1 pb-2 pt-1 text-[13px] font-medium tracking-wide transition-colors ${
            activeCategory === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Todos
          {activeCategory === "all" && (
            <span className="absolute inset-x-0 -bottom-px h-[2px]" style={{ backgroundColor: primaryColor }} />
          )}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`relative whitespace-nowrap px-1 pb-2 pt-1 text-[13px] font-medium tracking-wide transition-colors ${
              activeCategory === cat.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
            {cat.name}
            {activeCategory === cat.id && (
              <span className="absolute inset-x-0 -bottom-px h-[2px]" style={{ backgroundColor: primaryColor }} />
            )}
          </button>
        ))}
      </div>
    )}

    {/* Editorial section header */}
    <div className="flex items-end justify-between border-b border-border pb-3">
      <div>
        <span className="editorial-eyebrow">Catálogo</span>
        <h2 className="mt-0.5 text-2xl leading-none text-foreground sm:text-3xl">
          {activeCategory !== "all" ? activeCategoryName || "Productos" : "Productos"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {productCount} {productCount === 1 ? "artículo disponible" : "artículos disponibles"}
        </p>
      </div>
      {productCount > 12 && (
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
      )}
    </div>
  </div>
);

export default StoreFilters;
