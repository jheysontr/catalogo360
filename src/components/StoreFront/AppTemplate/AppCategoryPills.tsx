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

  // TILES — pastel mosaic of large category cards (Market template)
  if (style === "tiles") {
    const PASTELS = [
      { bg: "#DCEFD8", ring: "#A8D4A0" }, // green
      { bg: "#FFE6CC", ring: "#F4B678" }, // orange
      { bg: "#FBDADA", ring: "#E89999" }, // red
      { bg: "#F1E0F5", ring: "#C9A0DC" }, // purple
      { bg: "#FFF4C9", ring: "#F0D88C" }, // yellow
      { bg: "#D7EAF7", ring: "#8FB8D9" }, // blue
    ];
    const all = [{ id: "all", name: "Todos", icon: "🛍️" }, ...categories];
    return (
      <div className="container px-4 pt-4">
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {all.map((cat, i) => {
            const active = activeCategory === cat.id;
            const p = PASTELS[i % PASTELS.length];
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`group relative flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl p-2 text-center transition-all ${
                  active ? "shadow-md ring-2" : "hover:shadow-sm"
                }`}
                style={{
                  backgroundColor: p.bg,
                  // @ts-ignore custom prop for ring
                  ["--tw-ring-color" as any]: active ? primaryColor : p.ring,
                }}
              >
                {cat.icon && <span className="text-xl leading-none">{cat.icon}</span>}
                <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }


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
