import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Heart, ShoppingCart, X, Store as StoreIcon } from "lucide-react";
import type { Product } from "./types";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  on_sale: boolean;
  discount_percent: number | null;
}

interface WishlistPanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: WishlistItem[];
  wishlistCount: number;
  primaryColor: string;
  currencySymbol: string;
  products: Product[];
  onOpenDetail: (p: Product) => void;
  onRemove: (id: string) => void;
}

const WishlistPanel = ({
  open, onOpenChange, items, wishlistCount,
  primaryColor, currencySymbol, products, onOpenDetail, onRemove,
}: WishlistPanelProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-500 text-red-500" /> Favoritos ({wishlistCount})
        </SheetTitle>
      </SheetHeader>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Heart className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Tu lista de deseos está vacía</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {items.map((item) => {
            const finalPrice = item.on_sale && item.discount_percent
              ? item.price * (1 - item.discount_percent / 100)
              : item.price;
            const product = products.find((p) => p.id === item.id);
            return (
              <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-16 w-16 cursor-pointer rounded-md object-cover"
                    loading="lazy"
                    onClick={() => { onOpenChange(false); if (product) onOpenDetail(product); }}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                    <StoreIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-center">
                  <p
                    className="text-sm font-medium text-foreground cursor-pointer hover:underline line-clamp-1"
                    onClick={() => { onOpenChange(false); if (product) onOpenDetail(product); }}
                  >
                    {item.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    {item.on_sale && item.discount_percent ? (
                      <>
                        <span className="text-sm font-bold text-destructive">{currencySymbol}{finalPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground line-through">{currencySymbol}{item.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold" style={{ color: primaryColor }}>{currencySymbol}{item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-center justify-center">
                  <button
                    onClick={() => { onOpenChange(false); if (product) onOpenDetail(product); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
                    title="Ver producto"
                  >
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10 transition-colors"
                    title="Quitar de favoritos"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SheetContent>
  </Sheet>
);

export default WishlistPanel;
