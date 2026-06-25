import { Search, ShoppingCart, Heart, Info, X, Menu, MessageCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { TemplateHeaderProps } from "./types";

/**
 * Elegante / Fresh — grocery-app style
 *  - Soft rounded card, prominent pill search filling the bar
 *  - Avatar-style round logo, big rounded cart button
 *  - Location chip + delivery line below name
 */
const EleganteHeader = ({
  store, primaryColor, search, onSearchChange,
  itemCount, wishlistCount, whatsapp,
  onCartOpen, onWishlistOpen, onInfoClick,
}: TemplateHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-3xl border border-border/40 bg-background/85 px-3 py-3 shadow-lg shadow-black/[0.04] backdrop-blur-xl sm:px-4 sm:py-3.5">
          {/* Top row: logo + greeting + actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted sm:hidden"
              aria-label="Menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-background"
              style={{ backgroundColor: store.logo_url ? undefined : primaryColor, boxShadow: `0 0 0 2px ${primaryColor}25` }}
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-base font-bold text-white">{(store.store_name || "T").charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hola 👋</div>
              <div className="truncate text-sm font-bold leading-tight text-foreground sm:text-base">{store.store_name}</div>
            </div>

            <div className="flex items-center gap-1.5">
              {wishlistCount > 0 && (
                <button
                  onClick={onWishlistOpen}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
                  aria-label="Favoritos"
                >
                  <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                </button>
              )}
              <button
                onClick={onCartOpen}
                className="relative flex h-10 items-center gap-2 rounded-full px-4 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
                aria-label="Carrito"
              >
                <ShoppingCart className="h-[16px] w-[16px]" strokeWidth={2.2} />
                <span className="text-xs font-bold tabular-nums">{itemCount}</span>
              </button>
            </div>
          </div>

          {/* Pill search */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="¿Qué te apetece hoy?"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-11 rounded-full border-transparent bg-muted/70 pl-11 pr-4 text-sm focus-visible:border-border focus-visible:bg-background"
              />
            </div>
          </div>

          {/* Quick chips */}
          <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-0.5 text-[11px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={onInfoClick}
              className="flex shrink-0 items-center gap-1 rounded-full bg-muted/70 px-3 py-1.5 font-medium text-foreground hover:bg-muted"
            >
              <Info className="h-3 w-3" /> Info
            </button>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted/70 px-3 py-1.5 font-medium text-foreground">
              <MapPin className="h-3 w-3" /> Entrega local
            </span>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 font-semibold text-white hover:bg-emerald-600"
              >
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs rounded-r-3xl bg-background p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-base font-bold">{store.store_name}</span>
              <button onClick={() => setMenuOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-1">
              <button onClick={() => { setMenuOpen(false); onInfoClick(); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-muted">
                <Info className="h-5 w-5" /> Información
              </button>
              <button onClick={() => { setMenuOpen(false); onWishlistOpen(); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-muted">
                <Heart className="h-5 w-5 fill-red-500 text-red-500" /> Favoritos
                {wishlistCount > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 text-[10px] font-bold text-white">{wishlistCount}</span>}
              </button>
              <button onClick={() => { setMenuOpen(false); onCartOpen(); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-muted">
                <ShoppingCart className="h-5 w-5" /> Carrito
                {itemCount > 0 && <span className="ml-auto rounded-full px-2 text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>{itemCount}</span>}
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default EleganteHeader;
