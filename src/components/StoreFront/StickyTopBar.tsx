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
    className={`fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md transition-all duration-300 ${
      visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
    }`}
  >
    <div className="container flex h-14 items-center justify-between px-4">
      <div className="flex min-w-0 items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-7 w-7 shrink-0 border border-border object-cover" style={{ borderRadius: 3 }} loading="lazy" />
        ) : (
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center"
            style={{ backgroundColor: primaryColor, borderRadius: 3 }}
          >
            <StoreIcon className="h-3.5 w-3.5 text-white" />
          </div>
        )}
        <span className="editorial-serif truncate text-base text-foreground">{storeName}</span>
      </div>
      <div className="flex items-center gap-0.5">
        {wishlistCount > 0 && (
          <button
            onClick={onWishlistOpen}
            className="relative flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-accent"
          >
            <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" strokeWidth={1.5} />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
              {wishlistCount}
            </span>
          </button>
        )}
        <button
          onClick={onCartOpen}
          className="relative ml-1 flex h-9 items-center gap-2 border border-foreground bg-foreground px-3 text-background transition-opacity hover:opacity-90"
          style={{ borderRadius: 2 }}
        >
          <ShoppingCart className="h-[16px] w-[16px]" strokeWidth={1.6} />
          <span className="text-xs font-medium">{itemCount}</span>
        </button>
      </div>
    </div>
  </div>
);

export default StickyTopBar;
