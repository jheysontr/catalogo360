import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ShoppingCart, Plus, Minus, Heart, Store as StoreIcon, Truck, ShieldCheck, X,
} from "lucide-react";
import { getFinalPrice } from "@/lib/CartContext";
import { motion, AnimatePresence } from "framer-motion";

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

interface ProductDetailDialogProps {
  product: Product | null;
  onClose: () => void;
  currencySymbol: string;
  primaryColor: string;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (product: Product, qty: number, attrs?: Record<string, string>) => void;
  getCategoryName: (catId: string | null) => string | null;
}

const toCartProduct = (p: Product) => ({
  ...p,
  variant_stock: (p.variant_stock && typeof p.variant_stock === "object" && !Array.isArray(p.variant_stock))
    ? p.variant_stock as Record<string, number>
    : undefined,
  variant_prices: (p.variant_prices && typeof p.variant_prices === "object" && !Array.isArray(p.variant_prices))
    ? p.variant_prices as Record<string, number>
    : undefined,
});

const getVariantStock = (product: Product, attrs: Record<string, string>): number => {
  const vs = product.variant_stock;
  if (!vs || typeof vs !== "object" || Array.isArray(vs)) return product.stock;
  const vsMap = vs as Record<string, number>;
  if (Object.keys(vsMap).length === 0) return product.stock;
  const stocks: number[] = Object.entries(attrs).map(([attrName, val]) => {
    const key = `${attrName}||${val}`;
    return vsMap[key] !== undefined ? vsMap[key] : product.stock;
  });
  return stocks.length > 0 ? Math.min(...stocks) : product.stock;
};

/* ── Swipeable Gallery ── */
const SwipeGallery = ({
  images,
  productName,
  primaryColor,
  onSale,
  discountPercent,
  isWishlisted,
  onToggleWishlist,
}: {
  images: string[];
  productName: string;
  primaryColor: string;
  onSale: boolean;
  discountPercent: number | null;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStart = useRef(0);
  const touchDelta = useRef(0);

  const paginate = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStart.current;
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 40) {
      paginate(touchDelta.current < 0 ? 1 : -1);
    }
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full bg-muted flex items-center justify-center">
        <StoreIcon className="h-16 w-16 text-muted-foreground/20" />
      </div>
    );
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="relative">
      {/* Main image */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-muted"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={images[index]}
            alt={productName}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>

        {/* Badges */}
        {onSale && discountPercent && (
          <Badge className="absolute left-3 top-3 z-10 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md">
            -{discountPercent}%
          </Badge>
        )}

        {/* Wishlist */}
        <button
          onClick={onToggleWishlist}
          className={`absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:bg-white"
          }`}
        >
          <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-white shadow-sm" : "w-2 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              className={`shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                i === index ? "shadow-md scale-105" : "border-transparent opacity-50 hover:opacity-80"
              }`}
              style={i === index ? { borderColor: primaryColor } : undefined}
            >
              <img src={img} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main Dialog ── */
const ProductDetailDialog = ({
  product,
  onClose,
  currencySymbol,
  primaryColor,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  getCategoryName,
}: ProductDetailDialogProps) => {
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [detailQty, setDetailQty] = useState(1);

  // Reset on product change
  useEffect(() => {
    if (product) {
      setSelectedAttrs({});
      setDetailQty(1);
    }
  }, [product?.id]);

  const sp = product;
  if (!sp) return null;

  const spCartProduct = toCartProduct(sp);
  const spFinalPrice = getFinalPrice(spCartProduct, selectedAttrs);
  const spBasePrice = spCartProduct.variant_prices
    ? (() => {
        const prices = Object.entries(selectedAttrs)
          .map(([k, v]) => spCartProduct.variant_prices![`${k}||${v}`])
          .filter((v): v is number => v !== undefined && v > 0);
        return prices.length > 0 ? Math.max(...prices) : sp.price;
      })()
    : sp.price;
  const spCatName = getCategoryName(sp.category_id);
  const spAttrs = Array.isArray(sp.attributes) ? (sp.attributes as ProductAttribute[]) : [];
  const extraImgs = Array.isArray(sp.extra_images) ? (sp.extra_images as string[]) : [];
  const allImages = [sp.image_url, ...extraImgs].filter(Boolean) as string[];
  const effectiveStock = getVariantStock(sp, selectedAttrs);
  const variantOutOfStock = effectiveStock <= 0;

  const handleAdd = () => {
    const hasAttrs = spAttrs.length > 0;
    onAddToCart(sp, detailQty, hasAttrs ? selectedAttrs : undefined);
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-lg md:max-w-2xl rounded-2xl border-0 shadow-2xl [&>button:last-child]:hidden">
        <div className="max-h-[92vh] overflow-y-auto overscroll-contain relative">
          {/* Custom close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-black/80 hover:scale-110 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Gallery */}
          <SwipeGallery
            images={allImages}
            productName={sp.name}
            primaryColor={primaryColor}
            onSale={sp.on_sale}
            discountPercent={sp.discount_percent}
            isWishlisted={isWishlisted}
            onToggleWishlist={() => onToggleWishlist(sp)}
          />

          {/* Content */}
          <div className="space-y-5 p-5 sm:p-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  {spCatName && (
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
                      {spCatName}
                    </p>
                  )}
                  <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight">{sp.name}</DialogTitle>
                </div>
              </div>
              <DialogDescription className="sr-only">Detalles del producto {sp.name}</DialogDescription>
            </DialogHeader>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {sp.on_sale && sp.discount_percent ? (
                <>
                  <span className="text-3xl font-extrabold text-destructive">{currencySymbol}{spFinalPrice.toFixed(2)}</span>
                  <span className="text-base text-muted-foreground line-through">{currencySymbol}{spBasePrice.toFixed(2)}</span>
                  <Badge variant="secondary" className="text-xs font-bold">Ahorra {sp.discount_percent}%</Badge>
                </>
              ) : (
                <span className="text-3xl font-extrabold" style={{ color: primaryColor }}>{currencySymbol}{spFinalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            {sp.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{sp.description}</p>
            )}

            {/* Attributes */}
            {spAttrs.length > 0 && (
              <div className="space-y-4">
                {spAttrs.map((attr) => {
                  const vs = sp.variant_stock;
                  const vsMap = (vs && typeof vs === "object" && !Array.isArray(vs)) ? vs as Record<string, number> : {};
                  const hasVariantStock = Object.keys(vsMap).length > 0;
                  return (
                    <div key={attr.name} className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{attr.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((val) => {
                          const isSelected = selectedAttrs[attr.name] === val;
                          const vKey = `${attr.name}||${val}`;
                          const vStock = vsMap[vKey];
                          const vOutOfStock = hasVariantStock && vStock !== undefined && vStock <= 0;
                          return (
                            <button
                              key={val}
                              onClick={() => {
                                if (!vOutOfStock) setSelectedAttrs((prev) => ({ ...prev, [attr.name]: val }));
                              }}
                              disabled={vOutOfStock}
                              className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                vOutOfStock
                                  ? "border-border text-muted-foreground opacity-40 cursor-not-allowed line-through"
                                  : isSelected
                                    ? "border-transparent text-white shadow-md scale-105"
                                    : "border-border text-foreground hover:border-muted-foreground hover:shadow-sm"
                              }`}
                              style={isSelected && !vOutOfStock ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                            >
                              {val}
                              {hasVariantStock && vStock !== undefined && vStock > 0 && vStock <= 5 && (
                                <span className="ml-1.5 text-[10px] font-normal opacity-70">({vStock})</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stock indicator */}
            {effectiveStock <= 5 && (
              <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
                variantOutOfStock
                  ? "bg-destructive/10 text-destructive"
                  : "bg-amber-500/10 text-amber-600"
              }`}>
                {variantOutOfStock ? "❌ Sin stock" : `🔥 ¡Solo quedan ${effectiveStock}!`}
              </div>
            )}

            {/* Trust badges */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                <Truck className="h-3.5 w-3.5" /> Envío disponible
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Pago seguro
              </span>
            </div>

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center rounded-xl border-2 border-border">
                <button
                  onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                  disabled={variantOutOfStock}
                  className="flex h-11 w-11 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-xl disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-11 w-12 items-center justify-center text-sm font-bold">{detailQty}</span>
                <button
                  onClick={() => setDetailQty((q) => Math.min(effectiveStock, q + 1))}
                  disabled={variantOutOfStock || detailQty >= effectiveStock}
                  className="flex h-11 w-11 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-xl disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                className="flex-1 gap-2 rounded-xl text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 h-11 text-sm font-bold shadow-lg"
                style={{ backgroundColor: variantOutOfStock ? undefined : primaryColor, boxShadow: variantOutOfStock ? undefined : `0 8px 24px -6px ${primaryColor}50` }}
                onClick={handleAdd}
                disabled={variantOutOfStock}
              >
                <ShoppingCart className="h-4 w-4" />
                {variantOutOfStock ? "Sin stock" : "Agregar al carrito"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
