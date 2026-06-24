import { useMemo } from "react";
import type { Product } from "@/components/StoreFront/types";
import type { TemplateTheme } from "@/components/StoreFront/AppTemplate/templateThemes";
import type { FeaturedSectionConfig } from "@/components/StoreFront/AppTemplate/layoutConfig";
import AppProductCard from "@/components/StoreFront/AppTemplate/AppProductCard";
import { getFinalPrice } from "@/lib/CartContext";

interface Props {
  config: FeaturedSectionConfig;
  products: Product[];
  primaryColor: string;
  currencySymbol: string;
  theme: TemplateTheme;
  isInWishlist: (id: string) => boolean;
  onQuickAdd: (p: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (p: Product, e?: React.MouseEvent) => void;
  onOpenDetail: (p: Product) => void;
  getCategoryName: (id: string | null) => string | null;
}

const toCart = (p: Product) => ({
  ...p,
  variant_stock: (p.variant_stock && typeof p.variant_stock === "object" && !Array.isArray(p.variant_stock))
    ? (p.variant_stock as Record<string, number>) : undefined,
  variant_prices: (p.variant_prices && typeof p.variant_prices === "object" && !Array.isArray(p.variant_prices))
    ? (p.variant_prices as Record<string, number>) : undefined,
});

const FeaturedProductsSection = ({
  config, products, primaryColor, currencySymbol, theme,
  isInWishlist, onQuickAdd, onToggleWishlist, onOpenDetail, getCategoryName,
}: Props) => {
  const title = config.title || "Destacados";
  const count = Math.min(Math.max(config.count ?? 4, 1), 8);
  const source = config.source ?? "on_sale";

  const items = useMemo(() => {
    const pool = source === "on_sale"
      ? products.filter((p) => p.on_sale).concat(products.filter((p) => !p.on_sale))
      : products;
    return pool.slice(0, count);
  }, [products, source, count]);

  if (items.length === 0) return null;

  return (
    <section className="container px-4 pt-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
          {items.map((p) => (
            <div key={p.id} className="w-[150px] shrink-0 sm:w-[170px]">
              <AppProductCard
                product={p}
                finalPrice={getFinalPrice(toCart(p))}
                currencySymbol={currencySymbol}
                primaryColor={primaryColor}
                isWishlisted={isInWishlist(p.id)}
                onQuickAdd={onQuickAdd}
                onToggleWishlist={onToggleWishlist}
                onOpenDetail={onOpenDetail}
                theme={theme}
                catName={getCategoryName(p.category_id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
