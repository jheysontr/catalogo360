import { Search, ShoppingCart, Heart, Info, X, Menu, MapPin, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { TemplateHeaderProps } from "./types";

/**
 * Market / Mercado — two-row grocery storefront
 *  - Top utility row: location + delivery info + contact
 *  - Main row: rounded logo tile, prominent pill search, cart pill
 *  - Soft tinted background using the primary color
 */
const MarketHeader = ({
  store, primaryColor, search, onSearchChange,
  itemCount, wishlistCount, whatsapp,
  onCartOpen, onWishlistOpen, onInfoClick,
}: TemplateHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;
  const tint = `${primaryColor}10`;

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      {/* Top utility strip */}
      <div className="hidden border-b border-border/60 px-4 py-1.5 text-[11px] text-muted-foreground sm:block" style={{ backgroundColor: tint }}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" style={{ color: primaryColor }} />
            <span>Entrega local · Pide con anticipación</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onInfoClick} className="hover:text-foreground">Información</button>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
                <MessageCircle className="h-3 w-3" /> Contactar
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="border-b border-border/60 bg-background">
        <div className="container mx-auto flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-foreground hover:bg-muted lg:hidden"
            aria-label="Menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo tile */}
          <a href="#top" className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm"
              style={{ backgroundColor: store.logo_url ? undefined : primaryColor }}
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-base font-bold text-white">{(store.store_name || "M").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-base font-bold leading-tight text-foreground">{store.store_name}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mercado fresco</div>
            </div>
          </a>

          {/* Search pill */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar frutas, verduras, panadería…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 rounded-2xl border-border bg-muted/40 pl-11 pr-4 text-sm focus-visible:bg-background"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {wishlistCount > 0 && (
              <button
                onClick={onWishlistOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl hover:bg-muted"
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
              className="flex h-10 items-center gap-2 rounded-2xl px-3 text-white shadow-sm transition-opacity hover:opacity-90 sm:px-4"
              style={{ backgroundColor: primaryColor }}
              aria-label="Carrito"
            >
              <ShoppingCart className="h-[16px] w-[16px]" strokeWidth={2.2} />
              <span className="text-xs font-bold tabular-nums">{itemCount}</span>
              <span className="hidden text-[11px] font-semibold opacity-90 sm:inline">Carrito</span>
            </button>
          </div>
        </div>

        {/* Quick category strip */}
        <div className="hidden border-t border-border/40 lg:block">
          <div className="container mx-auto flex items-center gap-6 px-4 py-2 text-[12px] font-medium text-muted-foreground">
            <button className="flex items-center gap-1 hover:text-foreground">
              Categorías <ChevronDown className="h-3 w-3" />
            </button>
            <a href="#productos" className="hover:text-foreground">Catálogo</a>
            <a href="#destacados" className="hover:text-foreground">Destacados</a>
            <button onClick={onInfoClick} className="hover:text-foreground">Información</button>
            <span className="ml-auto flex items-center gap-1 text-emerald-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Abierto ahora
            </span>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs rounded-r-3xl bg-background p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-base font-bold">{store.store_name}</span>
              <button onClick={() => setMenuOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-1 text-sm">
              <button onClick={() => { setMenuOpen(false); onInfoClick(); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 hover:bg-muted">
                <Info className="h-5 w-5" /> Información
              </button>
              <button onClick={() => { setMenuOpen(false); onWishlistOpen(); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 hover:bg-muted">
                <Heart className="h-5 w-5 fill-red-500 text-red-500" /> Favoritos
                {wishlistCount > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 text-[10px] font-bold text-white">{wishlistCount}</span>}
              </button>
              <button onClick={() => { setMenuOpen(false); onCartOpen(); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 hover:bg-muted">
                <ShoppingCart className="h-5 w-5" /> Carrito
                <span className="ml-auto rounded-full px-2 text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>{itemCount}</span>
              </button>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-3 py-3 text-sm font-semibold text-white">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketHeader;
