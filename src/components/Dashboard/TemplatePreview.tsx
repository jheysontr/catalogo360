import { Store as StoreIcon, Search, ShoppingCart, Heart } from "lucide-react";
import { getTheme } from "@/components/StoreFront/AppTemplate/templateThemes";

interface TemplatePreviewProps {
  templateId: string;
  storeName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

const MOCK_PRODUCTS = [
  { name: "Producto 1", price: "25.00", sale: false },
  { name: "Producto 2", price: "18.50", oldPrice: "22.00", sale: true },
  { name: "Producto 3", price: "42.00", sale: false },
  { name: "Producto 4", price: "15.00", sale: false },
];

const MOCK_CATEGORIES = ["Todos", "Categoría 1", "Categoría 2"];

const TemplatePreview = ({
  templateId,
  storeName,
  logoUrl,
  bannerUrl,
  primaryColor,
  secondaryColor,
  description,
}: TemplatePreviewProps) => {
  const theme = getTheme(templateId);
  const isClassic = templateId === "classic";

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

      {/* Content */}
      <div className="h-[420px] overflow-y-auto scrollbar-hide">
        {/* Header */}
        {isClassic ? (
          /* Classic: dark banner with circular logo */
          <div className="relative">
            <div
              className="h-24 w-full"
              style={{
                background: bannerUrl
                  ? `url(${bannerUrl}) center/cover`
                  : secondaryColor,
              }}
            >
              {bannerUrl && (
                <div className="absolute inset-0 h-24" style={{ backgroundColor: `${secondaryColor}aa` }} />
              )}
            </div>
            <div className="relative -mt-8 flex flex-col items-center px-3 pb-3">
              <div
                className="h-14 w-14 rounded-full border-[3px] border-background overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <StoreIcon className="h-5 w-5 text-white" />
                )}
              </div>
              <p className="mt-1 text-[11px] font-bold text-foreground">{storeName || "Mi Tienda"}</p>
              {description && (
                <p className="text-[8px] text-muted-foreground text-center line-clamp-1 max-w-[200px]">{description}</p>
              )}
            </div>
          </div>
        ) : (
          /* App-style templates: sticky header + hero banner */
          <>
            <div
              className={`flex items-center justify-between px-3 py-2 ${theme.headerBorder ? "border-b" : ""}`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="h-6 w-6 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <StoreIcon className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-foreground truncate max-w-[100px]">
                  {storeName || "Mi Tienda"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3 text-muted-foreground" />
                <div className="relative">
                  <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                  <span
                    className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full text-[6px] font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    2
                  </span>
                </div>
              </div>
            </div>

            {/* Hero banner */}
            <div className="px-2.5 pt-2">
              <div
                className={`relative overflow-hidden ${theme.bannerRounded} p-3`}
                style={{
                  background: bannerUrl
                    ? `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}99)`
                    : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                }}
              >
                {bannerUrl && (
                  <img
                    src={bannerUrl}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover mix-blend-overlay ${theme.bannerOverlayOpacity}`}
                  />
                )}
                <div className="relative z-10">
                  <p className="text-[8px] text-white/80">{theme.bannerGreeting}</p>
                  <p className="text-[11px] font-bold text-white">{storeName || "Mi Tienda"}</p>
                  {description && (
                    <p className="text-[7px] text-white/70 line-clamp-1 mt-0.5">{description}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Category pills */}
        <div className="flex gap-1 px-2.5 pt-2.5 overflow-hidden">
          {MOCK_CATEGORIES.map((cat, i) => (
            <span
              key={cat}
              className={`whitespace-nowrap ${theme.pillRounded} px-2 py-0.5 text-[8px] font-medium`}
              style={
                i === 0
                  ? { backgroundColor: primaryColor, color: "white" }
                  : { backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))" }
              }
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-1.5 px-2.5 pt-2.5 pb-4">
          {MOCK_PRODUCTS.map((product, i) => (
            <div
              key={i}
              className={`overflow-hidden ${theme.cardRounded} ${theme.cardBorder ? "border" : ""} bg-card ${theme.cardShadow.split(" ")[0]}`}
            >
              <div className={`relative ${theme.cardAspect} bg-muted`}>
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                  <StoreIcon className="h-4 w-4 text-muted-foreground/20" />
                </div>
                {product.sale && (
                  <span
                    className={`absolute left-1 top-1 ${theme.pillRounded} bg-destructive px-1 py-0.5 text-[6px] font-bold text-destructive-foreground`}
                  >
                    -15%
                  </span>
                )}
                <button className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 shadow-sm">
                  <Heart className="h-2 w-2 text-muted-foreground" />
                </button>
              </div>
              <div className="p-1.5">
                <p className="truncate text-[8px] font-semibold text-foreground">{product.name}</p>
                <div className="flex items-baseline gap-1">
                  {product.sale ? (
                    <>
                      <span className="text-[9px] font-bold text-destructive">${product.price}</span>
                      <span className="text-[7px] text-muted-foreground line-through">${product.oldPrice}</span>
                    </>
                  ) : (
                    <span className="text-[9px] font-bold" style={{ color: primaryColor }}>
                      ${product.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
