import type { PromoSectionConfig } from "@/components/StoreFront/AppTemplate/layoutConfig";

interface Props {
  config: PromoSectionConfig;
  primaryColor: string;
}

const PromoBannerSection = ({ config, primaryColor }: Props) => {
  const title = config.title || "Oferta especial";
  const subtitle = config.subtitle || "";
  const ctaText = config.ctaText || "";
  const ctaUrl = config.ctaUrl || "";
  const bg = config.background || "#FFE8B3";
  const isDark = config.textColor === "dark" || !config.textColor;
  const textClass = isDark ? "text-foreground" : "text-white";
  const subClass = isDark ? "text-foreground/70" : "text-white/80";

  const inner = (
    <div
      className="relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl px-5 py-4 shadow-sm"
      style={{ backgroundColor: bg }}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30" style={{ backgroundColor: primaryColor }} />
      <div className="relative z-10 min-w-0">
        <h3 className={`text-base font-bold leading-tight ${textClass}`}>{title}</h3>
        {subtitle && <p className={`mt-0.5 text-xs ${subClass}`}>{subtitle}</p>}
      </div>
      {ctaText && (
        <span
          className="relative z-10 shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          {ctaText}
        </span>
      )}
    </div>
  );

  return (
    <section className="container px-4 pt-4">
      {ctaUrl ? (
        <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="block hover:opacity-95 transition-opacity">
          {inner}
        </a>
      ) : inner}
    </section>
  );
};

export default PromoBannerSection;
