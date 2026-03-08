import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, X, Store as StoreIcon } from "lucide-react";
import type { CartItem } from "@/utils/whatsapp";
import { getFinalPrice } from "@/lib/CartContext";

interface CartPanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  primaryColor: string;
  currencySymbol: string;
  onUpdateQuantity: (id: string, qty: number, attrs?: Record<string, string>) => void;
  onRemove: (id: string, attrs?: Record<string, string>) => void;
  onCheckout: () => void;
}

const CartPanel = ({
  open, onOpenChange, items, itemCount, cartTotal,
  primaryColor, currencySymbol, onUpdateQuantity, onRemove, onCheckout,
}: CartPanelProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" /> Tu carrito ({itemCount})
        </SheetTitle>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Tu carrito está vacío</p>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Seguir comprando</Button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto py-4">
            {items.map((item, idx) => {
              const price = getFinalPrice(item.product, item.selectedAttributes);
              return (
                <div key={`${item.product.id}-${idx}`} className="flex gap-3 rounded-lg border p-3">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                      <StoreIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</p>
                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                    <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                      {currencySymbol}{(price * item.quantity).toFixed(2)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedAttributes)}
                        className="flex h-6 w-6 items-center justify-center rounded border text-foreground hover:bg-accent"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedAttributes)}
                        className="flex h-6 w-6 items-center justify-center rounded border text-foreground hover:bg-accent"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.product.id, item.selectedAttributes)} className="self-start text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span style={{ color: primaryColor }}>{currencySymbol}{cartTotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full text-white"
              size="lg"
              style={{ backgroundColor: primaryColor }}
              onClick={onCheckout}
            >
              COMPLETAR PEDIDO
            </Button>
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);

export default CartPanel;
