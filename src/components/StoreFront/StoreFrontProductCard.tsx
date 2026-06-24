import { memo } from "react";
import { Heart, ShoppingCart, Store as StoreIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ProgressiveImage from "./ProgressiveImage";

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

interface StoreFrontProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  catName: string | null;
  finalPrice: number;
  currencySymbol: string;
  primaryColor: string;
  isWishlisted: boolean;
  onQuickAdd: (p: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (p: Product, e?: React.MouseEvent) => void;
  onOpenDetail: (p: Product) => void;
}

const StoreFrontProductCard = ({
  product: p,
  viewMode,
  catName,
  finalPrice,
  currencySymbol,
  primaryColor,
  isWishlisted,
  onQuickAdd,
  onToggleWishlist,
  onOpenDetail,
}: StoreFrontProductCardProps) => {
  const hasAttrs = Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0;

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="group cursor-pointer flex overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
        onClick={() => onOpenDetail(p)}
      >
        <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden bg-muted sm:h-40 sm:w-40">
          {p.image_url ? (
            <ProgressiveImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <StoreIcon className="h-10 w-10 text-muted-foreground/20" />
            </div>
          )}
          {p.on_sale && (
            <span className="absolute left-1.5 top-1.5 inline-flex items-center rounded-lg bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-sm">-{p.discount_percent}%</span>
          )}
          <button
            onClick={(e) => onToggleWishlist(p, e)}
            className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:bg-white"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? "fill-white" : ""}`} />
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
          <div className="space-y-1">
            {catName && (
              <p className="text-[10px] font-semibold uppercase tracking-widest sm:text-[11px]" style={{ color: primaryColor }}>
                {catName}
              </p>
            )}
            <h3 className="text-sm font-semibold text-foreground sm:text-base line-clamp-1">{p.name}</h3>
            {p.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{p.description}</p>
            )}
            <div className="flex items-baseline gap-2 pt-0.5">
              {p.on_sale && p.discount_percent ? (
                <>
                  <span className="text-base font-bold text-destructive sm:text-lg">{currencySymbol}{finalPrice.toFixed(2)}</span>
                  <span className="text-[10px] text-muted-foreground line-through">{currencySymbol}{p.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-base font-bold sm:text-lg" style={{ color: primaryColor }}>{currencySymbol}{p.price.toFixed(2)}</span>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            {p.stock < 5 && (
              <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 sm:text-xs">
                ¡Quedan {p.stock}!
              </span>
            )}
            <Button
              className="ml-auto gap-1.5 rounded-xl text-xs text-white transition-all duration-150 active:scale-95 hover:brightness-110"
              size="sm"
              style={{ backgroundColor: primaryColor }}
              onClick={(e) => onQuickAdd(p, e)}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {hasAttrs ? "Ver opciones" : "Agregar"}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view — editorial premium neutral
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
      <div className="relative aspect-[4/5] overflow-hidden bg-muted" style={{ borderRadius: 4 }}>
        {p.image_url ? (
          <ProgressiveImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <StoreIcon className="h-10 w-10 text-muted-foreground/25" />
          </div>
        )}

        {/* Editorial top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {p.on_sale && p.discount_percent && (
            <span className="editorial-eyebrow inline-flex items-center bg-foreground px-2 py-1 text-background" style={{ letterSpacing: '0.18em' }}>
              −{p.discount_percent}%
            </span>
          )}
          {p.stock < 5 && (
            <span className="editorial-eyebrow inline-flex items-center bg-background/95 px-2 py-1 text-foreground backdrop-blur-sm" style={{ letterSpacing: '0.18em' }}>
              Últimas {p.stock}
            </span>
          )}
        </div>

        {/* Wishlist — editorial pill */}
        <button
          onClick={(e) => onToggleWishlist(p, e)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center backdrop-blur-md transition-colors ${
            isWishlisted ? "bg-red-500 text-white" : "bg-background/85 text-foreground hover:bg-background"
          }`}
          style={{ borderRadius: 999 }}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-white" : ""}`} strokeWidth={1.5} />
        </button>

        {/* Mobile floating + button */}
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

        {/* Desktop reveal CTA */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-300 sm:block sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            onClick={(e) => onQuickAdd(p, e)}
            className="flex w-full items-center justify-center gap-2 bg-foreground py-3 text-xs font-medium uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
            style={{ borderRadius: 2 }}
          >
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.6} />
            {hasAttrs ? "Ver opciones" : "Agregar al carrito"}
          </button>
        </div>
      </div>

      {/* Editorial info block */}
      <div className="mt-3 space-y-1.5 px-0.5">
        {catName && (
          <p className="editorial-eyebrow" style={{ color: primaryColor }}>{catName}</p>
        )}
        <h3 className="editorial-serif truncate text-[17px] leading-tight text-foreground sm:text-[18px]">{p.name}</h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          {p.on_sale && p.discount_percent ? (
            <>
              <span className="text-sm font-medium text-foreground tabular-nums">{currencySymbol}{finalPrice.toFixed(2)}</span>
              <span className="text-[11px] text-muted-foreground line-through tabular-nums">{currencySymbol}{p.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-foreground tabular-nums">{currencySymbol}{p.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default memo(StoreFrontProductCard);
