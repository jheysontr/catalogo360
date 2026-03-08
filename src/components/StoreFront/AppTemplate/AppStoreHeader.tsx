import { Search, ShoppingCart, Heart, Store as StoreIcon, Info } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface AppStoreHeaderProps {
  store: {
    store_name: string;
    logo_url: string | null;
  };
  primaryColor: string;
  search: string;
  onSearchChange: (v: string) => void;
  itemCount: number;
  wishlistCount: number;
  onCartOpen: () => void;
  onWishlistOpen: () => void;
  onInfoClick: () => void;
}

const AppStoreHeader = ({
  store, primaryColor, search, onSearchChange,
  itemCount, wishlistCount, onCartOpen, onWishlistOpen, onInfoClick,
}: AppStoreHeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo + Store Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <StoreIcon className="h-5 w-5 text-white" />
            )}
          </div>
          {!searchOpen && (
            <h1 className="truncate text-lg font-bold text-foreground">{store.store_name}</h1>
          )}
        </div>

        {/* Search expanded */}
        {searchOpen && (
          <div className="flex-1 mx-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Buscar productos..."
                className="pl-9 h-10 rounded-xl"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onBlur={() => { if (!search) setSearchOpen(false); }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors"
          >
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={onInfoClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors"
          >
            <Info className="h-5 w-5 text-foreground" />
          </button>
          {wishlistCount > 0 && (
            <button
              onClick={onWishlistOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors"
            >
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              <span className="absolute -right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            </button>
          )}
          <button
            onClick={onCartOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {itemCount > 0 && (
              <span
                className="absolute -right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppStoreHeader;
