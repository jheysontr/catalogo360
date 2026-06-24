import type { Category } from "../types";
import type { TemplateTheme } from "./templateThemes";

interface AppCategoryPillsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (v: string) => void;
  primaryColor: string;
  theme: TemplateTheme;
}

/**
 * Editorial premium neutral: all templates render the same restrained
 * underline-style category strip. Vendor primaryColor is the only accent.
 */
const AppCategoryPills = ({ categories, activeCategory, onCategoryChange, primaryColor }: AppCategoryPillsProps) => {
  if (categories.length === 0) return null;

  const itemClass = (active: boolean) =>
    `relative whitespace-nowrap px-1 pb-2 pt-1 text-[13px] font-medium tracking-wide transition-colors ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="container px-4 pt-5">
      <div className="-mx-4 flex gap-6 overflow-x-auto border-b border-border px-4 scrollbar-hide">
        <button
          onClick={() => onCategoryChange("all")}
          className={itemClass(activeCategory === "all")}
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
            className={itemClass(activeCategory === cat.id)}
          >
            {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
            {cat.name}
            {activeCategory === cat.id && (
              <span className="absolute inset-x-0 -bottom-px h-[2px]" style={{ backgroundColor: primaryColor }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppCategoryPills;
