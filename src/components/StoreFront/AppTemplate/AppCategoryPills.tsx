import type { Category } from "../types";
import type { TemplateTheme } from "./templateThemes";

interface AppCategoryPillsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (v: string) => void;
  primaryColor: string;
  theme: TemplateTheme;
}

const AppCategoryPills = ({ categories, activeCategory, onCategoryChange, primaryColor, theme }: AppCategoryPillsProps) => {
  if (categories.length === 0) return null;

  const isUnderline = theme.pillStyle === "underline";
  const isOutline = theme.pillStyle === "outline";

  const getActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isOutline) return { border: `1.5px solid hsl(var(--border))` };
      if (isUnderline) return {};
      return {};
    }
    if (isUnderline) return { borderBottom: `2px solid ${primaryColor}`, color: primaryColor };
    if (isOutline) return { border: `1.5px solid ${primaryColor}`, color: primaryColor };
    return { backgroundColor: primaryColor, color: "white" };
  };

  return (
    <div className="container px-4 pt-4">
      <div className={`flex ${isUnderline ? "gap-0 border-b" : "gap-2"} overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4`}>
        <button
          onClick={() => onCategoryChange("all")}
          className={`whitespace-nowrap ${isUnderline ? "rounded-none px-4 py-2.5" : `${theme.pillRounded} px-4 py-2`} text-sm font-medium transition-all ${
            activeCategory === "all"
              ? isUnderline ? "" : "text-white shadow-md"
              : isOutline ? "text-muted-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          style={getActiveStyle(activeCategory === "all")}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`whitespace-nowrap ${isUnderline ? "rounded-none px-4 py-2.5" : `${theme.pillRounded} px-4 py-2`} text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? isUnderline ? "" : "text-white shadow-md"
                : isOutline ? "text-muted-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            style={getActiveStyle(activeCategory === cat.id)}
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
