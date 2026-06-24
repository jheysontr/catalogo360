import { memo } from "react";
import { Heart, ShoppingCart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ProgressiveImage from "../ProgressiveImage";
import ProductImagePlaceholder from "../ProductImagePlaceholder";
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

/* ═══════════════ OVERLAY CARD — Boutique editorial (Elegante) ═══════════════ */
const OverlayCard = ({
  product: p, finalPrice, currencySymbol, primaryColor, isWishlisted,
  onQuickAdd, onToggleWishlist, onOpenDetail, theme,
}: AppProductCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="group relative cursor-pointer overflow-hidden"
    onClick={() => onOpenDetail(p)}
  >
    <div className={`relative ${theme.cardAspect} overflow-hidden bg-muted`}>
      {p.image_url ? (
        <ProgressiveImage
          src={p.image_url}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <StoreIcon className="h-10 w-10 text-muted-foreground/25" />
        </div>
      )}

      {/* Single bottom gradient — quieter editorial */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Sale badge — typographic */}
      {p.on_sale && p.discount_percent && (
        <span
          className="editorial-eyebrow absolute left-3 top-3 inline-flex items-center bg-white px-2 py-1 text-foreground"
          style={{ letterSpacing: "0.18em" }}
        >
          −{p.discount_percent}%
        </span>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => onToggleWishlist(p, e)}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center backdrop-blur-md transition-colors ${
          isWishlisted ? "bg-red-500 text-white" : "bg-white/15 text-white hover:bg-white/30"
        }`}
        style={{ borderRadius: 999 }}
      >
        <Heart className={`h-4 w-4 ${isWishlisted ? "fill-white" : ""}`} strokeWidth={1.5} />
      </button>

      {/* Bottom info — overlay editorial */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="editorial-serif text-base uppercase tracking-[0.06em] text-white sm:text-lg">
          {p.name}
        </h3>
        <div className="mt-2 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            {p.on_sale && p.discount_percent ? (
              <>
                <span className="text-sm font-medium text-white tabular-nums">
                  {currencySymbol}{finalPrice.toFixed(2)}
                </span>
                <span className="text-[11px] text-white/55 line-through tabular-nums">
                  {currencySymbol}{p.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-white tabular-nums">
                {currencySymbol}{p.price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => onQuickAdd(p, e)}
            className="flex items-center gap-1.5 border border-white/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-foreground"
          >
            <Plus className="h-3 w-3" strokeWidth={1.8} />
            {theme.ctaText}
          </button>
        </div>
      </div>

      {/* Hairline vendor accent on hover */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ backgroundColor: primaryColor }}
      />
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

/* ═══════════════ FRESH CARD — Grocery app style (Elegante) ═══════════════ */
const FreshCard = ({
  product: p, finalPrice, currencySymbol, primaryColor, isWishlisted,
  onQuickAdd, onToggleWishlist, onOpenDetail,
}: AppProductCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="group cursor-pointer rounded-2xl border border-border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md"
    onClick={() => onOpenDetail(p)}
  >
    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
      {p.image_url ? (
        <ProgressiveImage
          src={p.image_url}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <StoreIcon className="h-8 w-8 text-muted-foreground/25" />
        </div>
      )}
      {p.on_sale && p.discount_percent && (
        <span
          className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm"
          style={{ color: primaryColor }}
        >
          −{p.discount_percent}%
        </span>
      )}
      <button
        onClick={(e) => onToggleWishlist(p, e)}
        className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          isWishlisted ? "bg-red-500 text-white" : "bg-white/85 text-foreground/70 hover:bg-white"
        }`}
        aria-label="Favorito"
      >
        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} strokeWidth={2} />
      </button>
    </div>

    <div className="mt-2 px-1 pb-1">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {p.name}
        </h3>
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          {p.on_sale && p.discount_percent ? (
            <>
              <span className="text-base font-bold text-foreground tabular-nums">
                {currencySymbol}{finalPrice.toFixed(2)}
              </span>
              <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                {currencySymbol}{p.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-foreground tabular-nums">
              {currencySymbol}{p.price.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={(e) => onQuickAdd(p, e)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: primaryColor }}
          aria-label="Agregar al carrito"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </motion.div>
);

/* ═══════════════ MAIN EXPORT ═══════════════ */
const AppProductCard = (props: AppProductCardProps) => {
  switch (props.theme.cardLayout) {
    case "fresh":
      return <FreshCard {...props} />;
    case "overlay":
      return <OverlayCard {...props} />;
    case "horizontal-mini":
      return <HorizontalMiniCard {...props} />;
    default:
      return <VerticalCard {...props} />;
  }
};

export default memo(AppProductCard);
