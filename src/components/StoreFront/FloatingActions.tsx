import { ShoppingCart, Heart } from "lucide-react";

interface FloatingActionsProps {
  primaryColor: string;
  itemCount: number;
  wishlistCount: number;
  onCartOpen: () => void;
  onWishlistOpen: () => void;
}

const FloatingActions = ({ primaryColor, itemCount, wishlistCount, onCartOpen, onWishlistOpen }: FloatingActionsProps) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
    {wishlistCount > 0 && (
      <button
        onClick={onWishlistOpen}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-lg border transition-transform hover:scale-110"
      >
        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {wishlistCount}
        </span>
      </button>
    )}
    <button
      onClick={onCartOpen}
      className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
      style={{ backgroundColor: primaryColor }}
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
          {itemCount}
        </span>
      )}
    </button>
  </div>
);

export default FloatingActions;
