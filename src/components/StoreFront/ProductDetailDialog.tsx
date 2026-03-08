import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, Heart, Store as StoreIcon,
} from "lucide-react";
import { getFinalPrice } from "@/lib/CartContext";

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
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Reset state when product changes
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
  const activeImg = allImages[galleryIndex] ?? null;
  const effectiveStock = getVariantStock(sp, selectedAttrs);
  const variantOutOfStock = effectiveStock <= 0;

  const handleAdd = () => {
    const hasAttrs = spAttrs.length > 0;
    onAddToCart(sp, detailQty, hasAttrs ? selectedAttrs : undefined);
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md p-0 [&>button]:z-50 [&>button]:bg-white/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:shadow-sm [&>button]:hover:bg-white">
        {/* Gallery */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted select-none">
          {activeImg ? (
            <img src={activeImg} alt={sp.name} className="h-full w-full object-cover transition-opacity duration-200" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <StoreIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          {sp.on_sale && sp.discount_percent && (
            <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground hover:bg-destructive/90">-{sp.discount_percent}%</Badge>
          )}
          <button
            onClick={() => onToggleWishlist(sp)}
            className="absolute left-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:scale-110 hover:bg-white z-10"
          >
            <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setGalleryIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setGalleryIndex((i) => (i + 1) % allImages.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`h-2 w-2 rounded-full transition-all ${galleryIndex === idx ? "bg-white w-4" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-5 pt-3 pb-0 scrollbar-hide">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setGalleryIndex(idx)}
                className={`shrink-0 h-14 w-14 overflow-hidden rounded-md border-2 transition-all ${
                  galleryIndex === idx ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4 p-5">
          <DialogHeader className="space-y-1">
            {spCatName && <Badge variant="outline" className="w-fit text-xs">{spCatName}</Badge>}
            <DialogTitle className="text-xl">{sp.name}</DialogTitle>
            <DialogDescription className="sr-only">Detalles del producto {sp.name}</DialogDescription>
          </DialogHeader>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            {sp.on_sale && sp.discount_percent ? (
              <>
                <span className="text-2xl font-bold text-destructive">{currencySymbol}{spFinalPrice.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">{currencySymbol}{spBasePrice.toFixed(2)}</span>
                <Badge variant="secondary" className="text-xs">-{sp.discount_percent}%</Badge>
              </>
            ) : (
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>{currencySymbol}{spFinalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          {sp.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{sp.description}</p>
          )}

          {/* Attributes selectors */}
          {spAttrs.length > 0 && (
            <div className="space-y-3">
              {spAttrs.map((attr) => {
                const vs = sp.variant_stock;
                const vsMap = (vs && typeof vs === "object" && !Array.isArray(vs)) ? vs as Record<string, number> : {};
                const hasVariantStock = Object.keys(vsMap).length > 0;
                return (
                  <div key={attr.name} className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{attr.name}</label>
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
                            className={`relative rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                              vOutOfStock
                                ? "border-border text-muted-foreground opacity-40 cursor-not-allowed line-through"
                                : isSelected
                                  ? "border-transparent text-white shadow-sm"
                                  : "border-border text-foreground hover:border-muted-foreground"
                            }`}
                            style={isSelected && !vOutOfStock ? { backgroundColor: primaryColor } : undefined}
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

          {/* Stock */}
          <p className={`text-xs ${effectiveStock < 5 ? "font-medium text-destructive" : "text-muted-foreground"}`}>
            {variantOutOfStock
              ? "❌ Variante sin stock"
              : effectiveStock < 5
                ? `¡Solo quedan ${effectiveStock}!`
                : `Stock disponible: ${effectiveStock}`}
          </p>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center rounded-lg border">
              <button
                onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                disabled={variantOutOfStock}
                className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-lg disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-10 items-center justify-center text-sm font-semibold">{detailQty}</span>
              <button
                onClick={() => setDetailQty((q) => Math.min(effectiveStock, q + 1))}
                disabled={variantOutOfStock || detailQty >= effectiveStock}
                className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-lg disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              className="flex-1 gap-2 text-white transition-all duration-150 active:scale-95 disabled:opacity-60"
              size="lg"
              style={{ backgroundColor: variantOutOfStock ? undefined : primaryColor }}
              onClick={handleAdd}
              disabled={variantOutOfStock}
            >
              <ShoppingCart className="h-4 w-4" />
              {variantOutOfStock ? "Sin stock" : "Agregar al carrito"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
