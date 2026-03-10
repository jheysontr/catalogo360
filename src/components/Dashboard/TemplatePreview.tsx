import { Store as StoreIcon, Search, ShoppingCart, Heart, Plus } from "lucide-react";
import { getTheme } from "@/components/StoreFront/AppTemplate/templateThemes";
import { getCurrencySymbol } from "@/lib/currency";

interface RealProduct {
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  on_sale: boolean;
  discount_percent: number | null;
}

interface PreviewProduct {
  name: string;
  price: string;
  oldPrice?: string;
  sale: boolean;
  desc: string;
  imageUrl: string | null;
}

interface TemplatePreviewProps {
  templateId: string;
  storeName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  products?: RealProduct[];
  currency?: string;
  customGreeting?: string;
  customBannerDescription?: string;
}

const FALLBACK_PRODUCTS: PreviewProduct[] = [
  { name: "Producto 1", price: "25.00", sale: false, desc: "Descripción del producto", imageUrl: null },
  { name: "Producto 2", price: "18.50", oldPrice: "22.00", sale: true, desc: "Con descuento", imageUrl: null },
  { name: "Producto 3", price: "42.00", sale: false, desc: "Alta calidad", imageUrl: null },
  { name: "Producto 4", price: "15.00", sale: false, desc: "Popular", imageUrl: null },
  { name: "Producto 5", price: "33.00", sale: false, desc: "Nuevo", imageUrl: null },
  { name: "Producto 6", price: "28.00", oldPrice: "35.00", sale: true, desc: "Oferta", imageUrl: null },
];

const MOCK_CATEGORIES = ["Todos", "Cat 1", "Cat 2"];

const TemplatePreview = ({
  templateId,
  storeName,
  logoUrl,
  bannerUrl,
  primaryColor,
  secondaryColor,
  description,
  products,
  currency = "BOB",
  customGreeting,
  customBannerDescription,
}: TemplatePreviewProps) => {
  const theme = getTheme(templateId);
  const isClassic = templateId === "classic";
  const sym = getCurrencySymbol(currency);
  const greeting = customGreeting || theme.bannerGreeting;
  const bannerDesc = customBannerDescription || description;

  const previewProducts: PreviewProduct[] = products && products.length > 0
    ? products.map((p) => {
        const finalPrice = p.on_sale && p.discount_percent
          ? p.price * (1 - p.discount_percent / 100)
          : p.price;
        return {
          name: p.name,
          price: finalPrice.toFixed(2),
          oldPrice: p.on_sale && p.discount_percent ? p.price.toFixed(2) : undefined,
          sale: p.on_sale && !!p.discount_percent,
          desc: p.description || "",
          imageUrl: p.image_url,
        };
      })
    : FALLBACK_PRODUCTS;

  const renderBanner = () => {
    if (isClassic) {
      return (
        <div className="relative h-24 w-full overflow-hidden" style={{ background: bannerUrl ? `url(${bannerUrl}) center/cover` : `linear-gradient(160deg, ${secondaryColor}, ${primaryColor})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl border-2 border-white/30 overflow-hidden flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : <StoreIcon className="h-3 w-3 text-white" />}
              </div>
              <div>
                <p className="text-[9px] font-bold text-white">{storeName || "Mi Tienda"}</p>
                {description && <p className="text-[6px] text-white/60 line-clamp-1">{description}</p>}
              </div>
            </div>
          </div>
        </div>
      );
    }


    switch (theme.bannerStyle) {
      case "full":
        return (
          <div className="relative h-24 w-full" style={{ background: bannerUrl ? `url(${bannerUrl}) center/cover` : `linear-gradient(160deg, ${primaryColor}, #000 80%)` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-l border-t border-white/30" />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-r border-b border-white/30" />
            <div className="absolute bottom-0 left-0 p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="h-px w-3" style={{ backgroundColor: `${primaryColor}99` }} />
                <p className="text-[5px] uppercase tracking-[0.3em] text-white/60">{greeting}</p>
              </div>
              {bannerDesc && <p className="text-[6px] text-white/60 italic line-clamp-1 mt-0.5">{bannerDesc}</p>}
            </div>
          </div>
        );
      case "split":
        return (
          <div className="mx-2.5 mt-2 flex overflow-hidden relative" style={{ backgroundColor: primaryColor, borderRadius: "8px" }}>
            <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div className="absolute -right-1 top-3 h-6 w-6 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
            <div className="flex-1 p-3 relative z-10">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="h-1 w-1 rounded-full bg-white/70" />
                <p className="text-[6px] uppercase tracking-widest text-white/70 font-semibold">{greeting}</p>
              </div>
              {bannerDesc && <p className="text-[6px] text-white/60 line-clamp-2 mt-0.5">{bannerDesc}</p>}
            </div>
            {bannerUrl && (
              <div className="w-1/3 overflow-hidden relative">
                <div className="absolute inset-0 -skew-x-6 -ml-2 overflow-hidden">
                  <img src={bannerUrl} alt="" className="h-full w-full object-cover skew-x-6 scale-110" />
                </div>
              </div>
            )}
          </div>
        );
      case "minimal":
        return (
          <div className="mx-2.5 mt-2">
            <div className="relative overflow-hidden rounded-2xl p-2.5" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}08)` }}>
              <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full" style={{ backgroundColor: `${primaryColor}10` }} />
              <div className="relative z-10 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                  <StoreIcon className="h-2.5 w-2.5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="text-[6px] font-medium" style={{ color: primaryColor }}>{greeting}</p>
                  {bannerDesc && <p className="text-[5px] text-muted-foreground line-clamp-1">{bannerDesc}</p>}
                </div>
              </div>
            </div>
          </div>
        );
      case "compact":
        return (
          <div className="mx-2.5 mt-2">
            <div className={`relative overflow-hidden ${theme.bannerRounded} p-3`} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)` }}>
              {bannerUrl && <img src={bannerUrl} alt="" className={`absolute inset-0 h-full w-full object-cover mix-blend-overlay ${theme.bannerOverlayOpacity}`} />}
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`, backgroundSize: "10px 10px" }} />
              <div className="absolute right-2 top-2 flex gap-0.5">
                <div className="h-1 w-1 rounded-full bg-white/30" />
                <div className="h-1 w-1 rounded-full bg-white/50" />
                <div className="h-1 w-1 rounded-full bg-white/70" />
              </div>
              <div className="relative z-10">
                <p className="text-[7px] text-white/70">{greeting}</p>
                {bannerDesc && <p className="text-[6px] text-white/60 line-clamp-1 mt-0.5">{bannerDesc}</p>}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="mx-2.5 mt-2">
            <div className={`relative overflow-hidden ${theme.bannerRounded} p-3`} style={{ background: `linear-gradient(160deg, ${primaryColor}, ${primaryColor}dd 60%, ${primaryColor}aa)` }}>
              {bannerUrl && <img src={bannerUrl} alt="" className={`absolute inset-0 h-full w-full object-cover mix-blend-overlay ${theme.bannerOverlayOpacity}`} />}
              <svg className="absolute bottom-0 left-0 right-0 h-3 text-white/5" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,12 Q50,0 100,6 Q150,12 200,3 L200,12 Z" fill="currentColor" />
              </svg>
              <div className="absolute right-2 top-1.5 h-6 w-6 rounded-full border border-white/10" />
              <div className="absolute right-4 top-3 h-3 w-3 rounded-full bg-white/10" />
              <div className="relative z-10 space-y-0.5">
                <div className="inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5">
                  <p className="text-[6px] font-semibold text-white">{greeting}</p>
                </div>
                {bannerDesc && <p className="text-[6px] text-white/70 line-clamp-1">{bannerDesc}</p>}
              </div>
            </div>
          </div>
        );
    }
  };

  const renderCategoryPills = () => {
    const isUnderline = theme.pillStyle === "underline";
    const isOutline = theme.pillStyle === "outline";

    return (
      <div className={`flex ${isUnderline ? "gap-0 border-b mx-2.5" : "gap-1 px-2.5"} pt-2 overflow-hidden`}>
        {MOCK_CATEGORIES.map((cat, i) => (
          <span
            key={cat}
            className={`whitespace-nowrap ${isUnderline ? "px-2 py-1 text-[7px]" : `${theme.pillRounded} px-2 py-0.5 text-[7px]`} font-medium`}
            style={
              i === 0
                ? isUnderline
                  ? { borderBottom: `2px solid ${primaryColor}`, color: primaryColor }
                  : isOutline
                    ? { border: `1px solid ${primaryColor}`, color: primaryColor }
                    : { backgroundColor: primaryColor, color: "white" }
                : isOutline
                  ? { border: `1px solid hsl(var(--border))`, color: "hsl(var(--muted-foreground))" }
                  : isUnderline
                    ? { color: "hsl(var(--muted-foreground))" }
                    : {}
            }
          >
            {cat}
          </span>
        ))}
      </div>
    );
  };

  const renderImage = (imageUrl: string | null) => {
    if (imageUrl) {
      return <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />;
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <StoreIcon className="h-3 w-3 text-muted-foreground/20" />
      </div>
    );
  };

  const renderProductCard = (product: PreviewProduct, i: number) => {
    switch (theme.cardLayout) {
      case "overlay":
        return (
          <div key={i} className={`relative overflow-hidden ${theme.cardRounded} ${theme.cardAspect} bg-muted`}>
            {renderImage(product.imageUrl)}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {product.sale && (
              <span className={`absolute left-1 top-1 ${theme.pillRounded} bg-destructive px-1 py-0.5 text-[5px] font-bold text-destructive-foreground`}>Oferta</span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-1.5">
              <p className={`text-[6px] font-semibold text-white ${theme.nameStyle === "uppercase" ? "uppercase tracking-wider" : ""}`}>{product.name}</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[7px] font-bold text-white">{sym}{product.price}</span>
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-sm" style={{ backgroundColor: `${primaryColor}cc` }}>
                  <Plus className="h-2 w-2 text-white" />
                </div>
              </div>
            </div>
          </div>
        );
      case "horizontal-mini":
        return (
          <div key={i} className={`flex overflow-hidden ${theme.cardRounded} bg-card ${theme.cardShadow.split(" ")[0]}`}>
            <div className="h-14 w-14 flex-shrink-0 bg-muted overflow-hidden">
              {renderImage(product.imageUrl)}
            </div>
            <div className="flex flex-1 items-center justify-between p-1.5">
              <div>
                <p className="text-[7px] font-semibold text-foreground line-clamp-1">{product.name}</p>
                <p className="text-[6px] text-muted-foreground line-clamp-1">{product.desc}</p>
                <span className="text-[7px] font-bold" style={{ color: primaryColor }}>{sym}{product.price}</span>
              </div>
              <div className={`flex h-4 w-4 items-center justify-center ${theme.ctaRounded}`} style={{ backgroundColor: primaryColor }}>
                <Plus className="h-2 w-2 text-white" />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div key={i} className={`overflow-hidden ${theme.cardRounded} ${theme.cardBorder ? "border" : ""} bg-card ${theme.cardShadow.split(" ")[0]}`}>
            <div className={`relative ${theme.cardAspect} bg-muted overflow-hidden`}>
              {renderImage(product.imageUrl)}
              {product.sale && (
                <span className={`absolute left-0.5 top-0.5 ${theme.pillRounded} bg-destructive px-1 py-0.5 text-[5px] font-bold text-destructive-foreground`}>Oferta</span>
              )}
              <div className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/90 shadow-sm">
                <Heart className="h-1.5 w-1.5 text-muted-foreground" />
              </div>
            </div>
            <div className="p-1.5">
              <p className={`text-[7px] font-semibold text-foreground ${theme.nameStyle === "truncate" ? "truncate" : theme.nameStyle === "uppercase" ? "uppercase tracking-wider text-[6px]" : "line-clamp-2"}`}>
                {product.name}
              </p>
              {theme.showDescription && (
                <p className="text-[6px] text-muted-foreground line-clamp-1">{product.desc}</p>
              )}
              <span className={`font-bold ${theme.priceStyle === "large" ? "text-[9px]" : "text-[8px]"}`} style={theme.priceStyle === "accent" ? { color: primaryColor } : undefined}>
                {sym}{product.price}
              </span>
            </div>
          </div>
        );
    }
  };

  const previewGridCols = theme.cardLayout === "horizontal-mini"
    ? "grid-cols-1"
    : theme.gridCols.includes("grid-cols-3") && !theme.gridCols.includes("grid-cols-2")
      ? "grid-cols-3"
      : "grid-cols-2";

  const visibleProducts = theme.cardLayout === "horizontal-mini"
    ? previewProducts.slice(0, 4)
    : previewGridCols === "grid-cols-3"
      ? previewProducts.slice(0, 6)
      : previewProducts.slice(0, 4);

  return (
    <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-[2rem] border-[6px] border-foreground/10 bg-background shadow-2xl">
      {/* Phone status bar */}
      <div className="flex items-center justify-between bg-foreground/5 px-4 py-1.5">
        <span className="text-[9px] font-medium text-muted-foreground">9:41</span>
        <div className="h-4 w-16 rounded-full bg-foreground/10" />
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        </div>
      </div>

      <div className="h-[420px] overflow-y-auto scrollbar-hide">
        {/* Header — always shows store name + logo (single source of name) */}
        {!isClassic && (
          <div className={`flex items-center justify-between px-3 py-1.5 ${theme.headerBorder ? "border-b" : ""}`}>
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : <StoreIcon className="h-2.5 w-2.5 text-white" />}
              </div>
              <span className="text-[9px] font-bold text-foreground truncate max-w-[90px]">{storeName || "Mi Tienda"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Search className="h-2.5 w-2.5 text-muted-foreground" />
              <ShoppingCart className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
          </div>
        )}

        {renderBanner()}
        {renderCategoryPills()}

        {/* Product grid */}
        <div className={`grid ${previewGridCols} ${theme.cardLayout === "horizontal-mini" ? "gap-1.5" : theme.gridGap.includes("gap-0") ? "gap-[1px]" : "gap-1"} px-2.5 pt-2 pb-4`}>
          {visibleProducts.map((product, i) => renderProductCard(product, i))}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
