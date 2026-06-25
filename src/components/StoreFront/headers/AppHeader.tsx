import { Search, ShoppingCart, Heart, Info, X, MessageCircle, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { TemplateHeaderProps } from "./types";

/**
 * App / Diario — clean utility navbar
 *  - Single flat bar, hairline border, square logo tile
 *  - Persistent inline search on desktop
 *  - Solid filled cart with count chip
 */
const AppHeader = ({
  store, primaryColor, search, onSearchChange,
  itemCount, wishlistCount, whatsapp,
  onCartOpen, onWishlistOpen, onInfoClick,
}: TemplateHeaderProps) => {
  const [mobileSearch, setMobileSearch] = useState(false);
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center gap-3 px-3 sm:h-16 sm:px-4">
        {/* Logo + name */}
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border"
            style={{ backgroundColor: store.logo_url ? undefined : primaryColor }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-bold text-white">{(store.store_name || "T").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-tight text-foreground sm:text-base">{store.store_name}</div>
            <div className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:flex sm:items-center sm:gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Abierto · Catálogo
            </div>
          </div>
        </a>

        {/* Desktop persistent search */}
        <div className="ml-2 hidden flex-1 md:block">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 rounded-md border-border bg-muted/40 pl-9 text-sm focus-visible:bg-background"
            />
          </div>
        </div>

        {/* Spacer when no search visible */}
        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setMobileSearch(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
            aria-label="Buscar"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={onInfoClick}
            className="hidden h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted sm:flex"
            aria-label="Información"
          >
            <Info className="h-[18px] w-[18px]" />
          </button>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 sm:flex"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>
          )}
          {wishlistCount > 0 && (
            <button
              onClick={onWishlistOpen}
              className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Favoritos"
            >
              <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" />
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            </button>
          )}
          <button
            onClick={onCartOpen}
            className="ml-1 flex h-9 items-center gap-1.5 rounded-md px-3 text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
            aria-label="Carrito"
          >
            <ShoppingCart className="h-[16px] w-[16px]" strokeWidth={2} />
            <span className="text-xs font-bold tabular-nums">{itemCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile search overlay */}
      {mobileSearch && (
        <div className="border-t border-border bg-background px-3 py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar productos…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 rounded-md border-border pl-9 pr-9 text-sm"
            />
            <button
              onClick={() => { onSearchChange(""); setMobileSearch(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
