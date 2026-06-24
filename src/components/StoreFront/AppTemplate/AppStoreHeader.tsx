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
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo + Store Name — editorial */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-border bg-background"
            style={{ borderRadius: 4 }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)` }}
              >
                {(store.store_name || "T").trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {!searchOpen && (
            <h1 className="truncate text-xl leading-none text-foreground">{store.store_name}</h1>
          )}
        </div>

        {/* Search expanded */}
        {searchOpen && (
          <div className="mx-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Buscar productos…"
                className="h-10 border-border bg-background pl-9"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onBlur={() => { if (!search) setSearchOpen(false); }}
              />
            </div>
          </div>
        )}

        {/* Action buttons — neutral hairline */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-accent"
            aria-label="Buscar"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <button
            onClick={onInfoClick}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-accent"
            aria-label="Información"
          >
            <Info className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          {wishlistCount > 0 && (
            <button
              onClick={onWishlistOpen}
              className="relative flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-accent"
              aria-label="Favoritos"
            >
              <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" strokeWidth={1.5} />
              <span className="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                {wishlistCount}
              </span>
            </button>
          )}
          <button
            onClick={onCartOpen}
            className="relative ml-1 flex h-10 items-center gap-2 border border-foreground bg-foreground px-3 text-background transition-opacity hover:opacity-90"
            style={{ borderRadius: 2 }}
            aria-label="Carrito"
          >
            <ShoppingCart className="h-[16px] w-[16px]" strokeWidth={1.6} />
            <span className="text-xs font-medium tracking-wide">{itemCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppStoreHeader;
