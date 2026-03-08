import { ShoppingCart, Heart, Store as StoreIcon } from "lucide-react";

interface StickyTopBarProps {
  visible: boolean;
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  itemCount: number;
  wishlistCount: number;
  onCartOpen: () => void;
  onWishlistOpen: () => void;
}

const StickyTopBar = ({
  visible, storeName, logoUrl, primaryColor,
  itemCount, wishlistCount, onCartOpen, onWishlistOpen,
}: StickyTopBarProps) => (
  <div
    className={`fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur-md transition-all duration-300 ${
      visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
    }`}
  >
    <div className="container flex h-14 items-center justify-between px-4">
      <div className="flex items-center gap-3 min-w-0">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor }}>
            <StoreIcon className="h-4 w-4 text-white" />
          </div>
        )}
        <span className="truncate text-sm font-semibold text-foreground">{storeName}</span>
      </div>
      <div className="flex items-center gap-2">
        {wishlistCount > 0 && (
          <button
            onClick={onWishlistOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
          >
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {wishlistCount}
            </span>
          </button>
        )}
        <button
          onClick={onCartOpen}
          className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
        >
          <ShoppingCart className="h-5 w-5 text-foreground" />
          {itemCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  </div>
);

export default StickyTopBar;
