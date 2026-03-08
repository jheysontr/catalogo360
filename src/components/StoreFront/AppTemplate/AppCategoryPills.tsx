import type { Category } from "../types";

interface AppCategoryPillsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (v: string) => void;
  primaryColor: string;
}

const AppCategoryPills = ({ categories, activeCategory, onCategoryChange, primaryColor }: AppCategoryPillsProps) => {
  if (categories.length === 0) return null;

  return (
    <div className="container px-4 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Categorías</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        <button
          onClick={() => onCategoryChange("all")}
          className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            activeCategory === "all"
              ? "text-white shadow-md scale-[1.02]"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          style={activeCategory === "all" ? { backgroundColor: primaryColor } : undefined}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? "text-white shadow-md scale-[1.02]"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={activeCategory === cat.id ? { backgroundColor: primaryColor } : undefined}
          >
            {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppCategoryPills;
