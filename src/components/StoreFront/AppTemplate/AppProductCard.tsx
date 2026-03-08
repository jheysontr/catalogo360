import { memo } from "react";
import { Heart, ShoppingCart, Store as StoreIcon } from "lucide-react";
import { motion } from "framer-motion";
import ProgressiveImage from "../ProgressiveImage";

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
}

const AppProductCard = ({
  product: p,
  finalPrice,
  currencySymbol,
  primaryColor,
  isWishlisted,
  onQuickAdd,
  onToggleWishlist,
  onOpenDetail,
}: AppProductCardProps) => {
  const hasAttrs = Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group cursor-pointer"
      onClick={() => onOpenDetail(p)}
    >
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {p.image_url ? (
            <ProgressiveImage
              src={p.image_url}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <StoreIcon className="h-10 w-10 text-muted-foreground/20" />
            </div>
          )}

          {/* Sale badge */}
          {p.on_sale && p.discount_percent && (
            <span className="absolute left-2 top-2 inline-flex items-center rounded-lg bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground shadow-sm">
              -{p.discount_percent}%
            </span>
          )}

          {/* Low stock */}
          {p.stock < 5 && (
            <span
              className="absolute left-2 inline-flex items-center rounded-lg bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ top: p.on_sale && p.discount_percent ? "2.5rem" : "0.5rem" }}
            >
              ¡Quedan {p.stock}!
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => onToggleWishlist(p, e)}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:bg-white"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
          </button>

          {/* Quick add button on hover */}
          <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => onQuickAdd(p, e)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-transform hover:scale-110"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{p.name}</h3>
          <div className="flex items-baseline gap-2">
            {p.on_sale && p.discount_percent ? (
              <>
                <span className="text-base font-bold text-destructive">{currencySymbol}{finalPrice.toFixed(2)}</span>
                <span className="text-[11px] text-muted-foreground line-through">{currencySymbol}{p.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-base font-bold" style={{ color: primaryColor }}>{currencySymbol}{p.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(AppProductCard);
