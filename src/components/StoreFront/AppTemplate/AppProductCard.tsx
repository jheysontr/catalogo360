import { memo } from "react";
import { Heart, ShoppingCart, Store as StoreIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ProgressiveImage from "../ProgressiveImage";
import type { TemplateTheme } from "./templateThemes";

interface ProductAttribute {
  name: string;
  values: string[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  extra_images: unknown;
  variant_stock?: unknown;
  variant_prices?: unknown;
  on_sale: boolean;
  discount_percent: number | null;
  category_id: string | null;
  attributes: unknown;
}

interface AppProductCardProps {
  product: Product;
  finalPrice: number;
  currencySymbol: string;
  primaryColor: string;
  isWishlisted: boolean;
  onQuickAdd: (p: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (p: Product, e?: React.MouseEvent) => void;
  onOpenDetail: (p: Product) => void;
  theme: TemplateTheme;
  catName?: string | null;
}

/* ═══════════════ OVERLAY CARD (Elegante, Moda) ═══════════════ */
const OverlayCard = ({
  product: p, finalPrice, currencySymbol, primaryColor, isWishlisted,
  onQuickAdd, onToggleWishlist, onOpenDetail, theme,
}: AppProductCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="group cursor-pointer relative overflow-hidden"
    onClick={() => onOpenDetail(p)}
  >
    <div className={`relative ${theme.cardAspect} overflow-hidden ${theme.cardRounded} bg-muted`}>
      {p.image_url ? (
        <ProgressiveImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
          <StoreIcon className="h-10 w-10 text-muted-foreground/20" />
        </div>
      )}
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Sale badge */}
      {p.on_sale && p.discount_percent && (
        <span className={`absolute left-2.5 top-2.5 ${theme.pillRounded} bg-destructive px-2.5 py-1 text-[10px] font-bold text-destructive-foreground`}>
          -{p.discount_percent}%
        </span>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => onToggleWishlist(p, e)}
        className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
          isWishlisted ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
      </button>

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className={`text-xs font-semibold text-white/90 ${theme.nameStyle === "uppercase" ? "uppercase tracking-wider text-[10px]" : ""}`}>
          {p.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-2">
            {p.on_sale && p.discount_percent ? (
              <>
                <span className="text-sm font-bold text-white">{currencySymbol}{finalPrice.toFixed(2)}</span>
                <span className="text-[10px] text-white/50 line-through">{currencySymbol}{p.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-white">{currencySymbol}{p.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => onQuickAdd(p, e)}
            className={`flex items-center gap-1 ${theme.ctaRounded} px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md transition-all hover:scale-105`}
            style={{ backgroundColor: `${primaryColor}cc` }}
          >
            <Plus className="h-3 w-3" />
            {theme.ctaText}
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════ HORIZONTAL MINI CARD (Comida) ═══════════════ */
const HorizontalMiniCard = ({
  product: p, finalPrice, currencySymbol, primaryColor, isWishlisted,
  onQuickAdd, onToggleWishlist, onOpenDetail, theme, catName,
}: AppProductCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.25 }}
    className="group cursor-pointer"
    onClick={() => onOpenDetail(p)}
  >
    <div className={`flex overflow-hidden ${theme.cardRounded} bg-card ${theme.cardShadow} transition-shadow`}>
      {/* Image */}
      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden sm:h-32 sm:w-32">
        {p.image_url ? (
          <ProgressiveImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
            <StoreIcon className="h-8 w-8 text-muted-foreground/20" />
          </div>
        )}
        {p.on_sale && p.discount_percent && (
          <span className="absolute left-1 top-1 rounded-lg bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground">
            -{p.discount_percent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          {catName && (
            <p className="text-[9px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: primaryColor }}>{catName}</p>
          )}
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{p.name}</h3>
          {p.description && theme.showDescription && (
            <p className="line-clamp-2 text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            {p.on_sale && p.discount_percent ? (
              <>
                <span className="text-base font-bold text-destructive">{currencySymbol}{finalPrice.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground line-through">{currencySymbol}{p.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-base font-bold" style={{ color: primaryColor }}>{currencySymbol}{p.price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => onToggleWishlist(p, e)}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                isWishlisted ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Heart className={`h-3 w-3 ${isWishlisted ? "fill-white" : ""}`} />
            </button>
            <button
              onClick={(e) => onQuickAdd(p, e)}
              className={`flex h-8 items-center gap-1 ${theme.ctaRounded} px-3 text-[11px] font-semibold text-white transition-all hover:brightness-110 active:scale-95`}
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingCart className="h-3 w-3" />
              {theme.ctaText}
            </button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════ VERTICAL CARD — Editorial Premium Neutral ═══════════════ */
const VerticalCard = ({
  product: p, finalPrice, currencySymbol, primaryColor, isWishlisted,
  onQuickAdd, onToggleWishlist, onOpenDetail, theme, catName,
}: AppProductCardProps) => {
  const hasAttrs = Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
      onClick={() => onOpenDetail(p)}
    >
      {/* Editorial image frame — taller aspect, hairline only */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted" style={{ borderRadius: 4 }}>
        {p.image_url ? (
          <ProgressiveImage
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <StoreIcon className="h-10 w-10 text-muted-foreground/25" />
          </div>
        )}

        {/* Top-left editorial badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {p.on_sale && p.discount_percent && (
            <span
              className="editorial-eyebrow inline-flex items-center bg-foreground px-2 py-1 text-background"
              style={{ letterSpacing: "0.18em" }}
            >
              −{p.discount_percent}%
            </span>
          )}
          {p.stock < 5 && (
            <span
              className="editorial-eyebrow inline-flex items-center bg-background/95 px-2 py-1 text-foreground backdrop-blur-sm"
              style={{ letterSpacing: "0.18em" }}
            >
              Últimas {p.stock}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => onToggleWishlist(p, e)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center backdrop-blur-md transition-colors ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-background/85 text-foreground hover:bg-background"
          }`}
          style={{ borderRadius: 999 }}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-white" : ""}`} strokeWidth={1.5} />
        </button>

        {/* Mobile: floating + button (uses vendor primary as accent) */}
        <div className="absolute bottom-3 right-3 sm:hidden">
          <button
            onClick={(e) => onQuickAdd(p, e)}
            className="flex h-10 w-10 items-center justify-center bg-foreground text-background transition-opacity active:opacity-80"
            style={{ borderRadius: 999 }}
            aria-label="Agregar"
          >
            <Plus className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>

        {/* Desktop hover bar — full width editorial CTA */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-300 sm:block sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            onClick={(e) => onQuickAdd(p, e)}
            className="flex w-full items-center justify-center gap-2 bg-foreground py-3 text-xs font-medium uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
            style={{ borderRadius: 2 }}
          >
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.6} />
            {hasAttrs ? "Ver opciones" : theme.ctaText}
          </button>
        </div>
      </div>

      {/* Info — serif name, neutral price; vendor color in the eyebrow only */}
      <div className="mt-3 space-y-1.5 px-0.5">
        {catName && (
          <p className="editorial-eyebrow" style={{ color: primaryColor }}>{catName}</p>
        )}
        <h3 className="editorial-serif truncate text-[17px] leading-tight text-foreground sm:text-[18px]">
          {p.name}
        </h3>
        {p.description && theme.showDescription && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{p.description}</p>
        )}
        <div className="flex items-baseline gap-2 pt-0.5">
          {p.on_sale && p.discount_percent ? (
            <>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {currencySymbol}{finalPrice.toFixed(2)}
              </span>
              <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                {currencySymbol}{p.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-foreground tabular-nums">
              {currencySymbol}{p.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════ MAIN EXPORT ═══════════════ */
const AppProductCard = (props: AppProductCardProps) => {
  switch (props.theme.cardLayout) {
    case "overlay":
      return <OverlayCard {...props} />;
    case "horizontal-mini":
      return <HorizontalMiniCard {...props} />;
    default:
      return <VerticalCard {...props} />;
  }
};

export default memo(AppProductCard);
