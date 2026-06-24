import { Quote } from "lucide-react";
import type { TestimonialsSectionConfig } from "@/components/StoreFront/AppTemplate/layoutConfig";

interface Props {
  config: TestimonialsSectionConfig;
  primaryColor: string;
}

const TestimonialsSection = ({ config, primaryColor }: Props) => {
  const title = config.title || "Lo que dicen";
  const items = (config.items || []).filter((t) => t.name?.trim() && t.text?.trim());
  if (items.length === 0) return null;

  return (
    <section className="container px-4 pt-6">
      <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <div key={i} className="relative rounded-xl border bg-card p-4 shadow-sm">
            <Quote className="absolute right-3 top-3 h-4 w-4 opacity-20" style={{ color: primaryColor }} />
            <p className="text-sm text-foreground/90 leading-relaxed">"{t.text}"</p>
            <div className="mt-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {t.name.trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{t.name}</p>
                {t.role && <p className="text-[10px] text-muted-foreground truncate">{t.role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
