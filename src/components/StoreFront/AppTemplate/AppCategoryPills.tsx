import type { Category } from "../types";
import type { TemplateTheme } from "./templateThemes";

interface AppCategoryPillsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (v: string) => void;
  primaryColor: string;
  theme: TemplateTheme;
}

const AppCategoryPills = ({
  categories,
  activeCategory,
  onCategoryChange,
  primaryColor,
  theme,
}: AppCategoryPillsProps) => {
  if (categories.length === 0) return null;

  const style = theme.pillStyle;

  // FILLED — grocery-app style (Fresh / Elegante)
  if (style === "filled") {
    const pillClass = (active: boolean) =>
      `whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
        active
          ? "text-white shadow-sm"
          : "bg-background text-foreground border border-border hover:border-foreground/30"
      }`;

    return (
      <div className="container px-4 pt-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          <button
            onClick={() => onCategoryChange("all")}
            className={pillClass(activeCategory === "all")}
            style={activeCategory === "all" ? { backgroundColor: primaryColor } : undefined}
          >
            Todos
          </button>
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={pillClass(active)}
                style={active ? { backgroundColor: primaryColor } : undefined}
              >
                {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // OUTLINE — soft outlined pills
  if (style === "outline") {
    const pillClass = (active: boolean) =>
      `whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
        active ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground"
      }`;
    return (
      <div className="container px-4 pt-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          <button onClick={() => onCategoryChange("all")} className={pillClass(activeCategory === "all")}>
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={pillClass(activeCategory === cat.id)}
            >
              {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // UNDERLINE — editorial default
  const itemClass = (active: boolean) =>
    `relative whitespace-nowrap px-1 pb-2 pt-1 text-[13px] font-medium tracking-wide transition-colors ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="container px-4 pt-5">
      <div className="-mx-4 flex gap-6 overflow-x-auto border-b border-border px-4 scrollbar-hide">
        <button onClick={() => onCategoryChange("all")} className={itemClass(activeCategory === "all")}>
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
