import { Search, ShoppingCart, Heart, Info, X, Menu, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { TemplateHeaderProps } from "./types";

/**
 * Moderna / Studio — bold asymmetric editorial
 *  - Left accent block with the brand mark
 *  - Sharp 2px corners, oversized type, heavy weight
 *  - Inline link nav on desktop
 */
const ModernaHeader = ({
  store, primaryColor, search, onSearchChange,
  itemCount, wishlistCount, whatsapp,
  onCartOpen, onWishlistOpen, onInfoClick,
}: TemplateHeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-foreground bg-background">
      <div className="grid grid-cols-[auto_1fr_auto] items-stretch">
        {/* Left accent brand block */}
        <a
          href="#top"
          className="flex items-center gap-3 border-r-2 border-foreground px-4 py-3 sm:px-5"
          style={{ backgroundColor: primaryColor }}
        >
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="h-8 w-8 object-cover sm:h-10 sm:w-10" style={{ borderRadius: 2 }} />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center bg-background text-base font-black text-foreground sm:h-10 sm:w-10" style={{ borderRadius: 2 }}>
              {(store.store_name || "S").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden flex-col leading-none text-white sm:flex">
            <span className="text-[9px] uppercase tracking-[0.25em] opacity-80">Studio ·</span>
            <span className="text-base font-black uppercase tracking-tight">{store.store_name}</span>
          </div>
          <span className="text-sm font-black uppercase tracking-tight text-white sm:hidden">{store.store_name}</span>
        </a>

        {/* Center nav (desktop) */}
        <nav className="hidden items-center justify-center gap-8 px-4 text-[11px] font-bold uppercase tracking-[0.22em] md:flex">
          <a href="#top" className="border-b-2 border-foreground pb-0.5">Index</a>
          <a href="#productos" className="text-muted-foreground hover:text-foreground">Catálogo</a>
          <button onClick={onInfoClick} className="text-muted-foreground hover:text-foreground">Info</button>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              Contacto <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
            </a>
          )}
        </nav>
        <div className="md:hidden" />

        {/* Right cluster */}
        <div className="flex items-stretch border-l-2 border-foreground">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="flex w-11 items-center justify-center border-r border-foreground/20 hover:bg-muted sm:w-12"
            aria-label="Buscar"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          {wishlistCount > 0 && (
            <button
              onClick={onWishlistOpen}
              className="relative flex w-11 items-center justify-center border-r border-foreground/20 hover:bg-muted sm:w-12"
              aria-label="Favoritos"
            >
              <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" />
              <span className="absolute right-1 top-1 text-[9px] font-black">{wishlistCount}</span>
            </button>
          )}
          <button
            onClick={onCartOpen}
            className="flex items-center gap-2 bg-foreground px-4 text-background hover:opacity-90 sm:px-5"
            aria-label="Carrito"
            style={{ borderRadius: 0 }}
          >
            <ShoppingCart className="h-[16px] w-[16px]" strokeWidth={2.2} />
            <span className="text-xs font-black tabular-nums">{itemCount}</span>
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="flex w-11 items-center justify-center border-l-2 border-foreground bg-background hover:bg-muted md:hidden"
            aria-label="Menú"
          >
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Search drawer */}
      {searchOpen && (
        <div className="border-t-2 border-foreground bg-background">
          <div className="container mx-auto flex items-center gap-3 px-4 py-3">
            <Search className="h-5 w-5" strokeWidth={2.2} />
            <Input
              autoFocus
              placeholder="BUSCAR…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 border-0 bg-transparent px-0 text-base font-bold uppercase tracking-wide shadow-none focus-visible:ring-0"
              style={{ borderRadius: 0 }}
            />
            <button onClick={() => { onSearchChange(""); setSearchOpen(false); }}><X className="h-5 w-5" /></button>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-xs border-l-2 border-foreground bg-background">
            <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3">
              <span className="text-sm font-black uppercase tracking-[0.2em]">Menú</span>
              <button onClick={() => setMenuOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col text-sm font-bold uppercase tracking-[0.2em]">
              <a href="#productos" onClick={() => setMenuOpen(false)} className="border-b border-foreground/20 px-4 py-3 hover:bg-muted">Catálogo</a>
              <button onClick={() => { setMenuOpen(false); onInfoClick(); }} className="border-b border-foreground/20 px-4 py-3 text-left hover:bg-muted">Información</button>
              <button onClick={() => { setMenuOpen(false); onWishlistOpen(); }} className="flex items-center justify-between border-b border-foreground/20 px-4 py-3 hover:bg-muted">
                Favoritos <span>{wishlistCount || ""}</span>
              </button>
              <button onClick={() => { setMenuOpen(false); onCartOpen(); }} className="flex items-center justify-between border-b border-foreground/20 px-4 py-3 hover:bg-muted">
                Carrito <span>{itemCount}</span>
              </button>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="mx-4 mt-4 flex items-center justify-center gap-2 bg-foreground px-4 py-3 text-background">
                  WhatsApp <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default ModernaHeader;
