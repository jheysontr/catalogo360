import { Search, ShoppingCart, Heart, Info, X, Menu, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { TemplateHeaderProps } from "./types";

/**
 * Classic / Editorial — magazine layout
 *  - Top utility strip (uppercase tracking)
 *  - Centered serif wordmark, thin hairline rule
 *  - Lower row with secondary nav (Inicio · Tienda · Info)
 *  - No rounded corners anywhere
 */
const ClassicHeader = ({
  store, primaryColor, search, onSearchChange,
  itemCount, wishlistCount, whatsapp,
  onCartOpen, onWishlistOpen, onInfoClick,
}: TemplateHeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, vengo desde tu catálogo")}`
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-foreground/15 bg-background">
      {/* Utility strip */}
      <div className="hidden border-b border-foreground/10 bg-foreground/[0.02] px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
        <div className="container mx-auto flex items-center justify-between">
          <span>Edición · {new Date().toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })}</span>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Contacto · WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Main row — wordmark centered */}
      <div className="container mx-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 sm:h-20">
        {/* Left: hamburger (mobile) / search (desktop) */}
        <div className="flex items-center justify-start">
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-accent sm:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" strokeWidth={1.4} />
          </button>
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden h-9 items-center gap-2 border-b border-transparent text-[11px] uppercase tracking-[0.2em] text-foreground hover:border-foreground sm:flex"
          >
            <Search className="h-4 w-4" strokeWidth={1.4} /> Buscar
          </button>
        </div>

        {/* Center wordmark */}
        <a href="#top" className="flex flex-col items-center gap-0.5 px-4">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="h-10 w-auto object-contain sm:h-12" />
          ) : (
            <span
              className="editorial-serif text-xl uppercase leading-none tracking-[0.32em] text-foreground sm:text-2xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {store.store_name}
            </span>
          )}
          <span className="hidden text-[9px] uppercase tracking-[0.4em] text-muted-foreground sm:block">— Catálogo —</span>
        </a>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onInfoClick}
            className="hidden h-9 w-9 items-center justify-center text-foreground hover:bg-accent sm:flex"
            aria-label="Información"
          >
            <Info className="h-[18px] w-[18px]" strokeWidth={1.4} />
          </button>
          {wishlistCount > 0 && (
            <button
              onClick={onWishlistOpen}
              className="relative flex h-9 w-9 items-center justify-center text-foreground hover:bg-accent"
              aria-label="Favoritos"
            >
              <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" strokeWidth={1.4} />
              <span className="absolute right-0.5 top-1 text-[9px] font-semibold">{wishlistCount}</span>
            </button>
          )}
          <button
            onClick={onCartOpen}
            className="ml-1 flex h-9 items-center gap-2 border border-foreground px-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            aria-label="Carrito"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.4} />
            <span className="tabular-nums">{itemCount}</span>
          </button>
        </div>
      </div>

      {/* Secondary nav */}
      <nav className="hidden border-t border-foreground/10 sm:block">
        <div className="container mx-auto flex h-10 items-center justify-center gap-10 px-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <a href="#top" className="hover:text-foreground">Portada</a>
          <a href="#productos" className="hover:text-foreground">Tienda</a>
          <button onClick={onInfoClick} className="hover:text-foreground">Información</button>
          {waLink && <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Contacto</a>}
        </div>
      </nav>

      {/* Inline search drawer */}
      {searchOpen && (
        <div className="border-t border-foreground/10 bg-background px-4 py-3">
          <div className="container mx-auto flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar en el catálogo…"
              className="h-10 border-0 border-b border-foreground/30 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button onClick={() => { onSearchChange(""); setSearchOpen(false); }} aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden" role="dialog">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-foreground/15 px-4 py-3">
              <span className="editorial-serif text-lg uppercase tracking-[0.25em]" style={{ fontFamily: "Georgia, serif" }}>
                {store.store_name}
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="Cerrar"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col">
              {[
                { label: "Portada", action: () => setMenuOpen(false), href: "#top" },
                { label: "Tienda", action: () => setMenuOpen(false), href: "#productos" },
                { label: "Información", action: () => { setMenuOpen(false); onInfoClick(); } },
                { label: "Favoritos", action: () => { setMenuOpen(false); onWishlistOpen(); }, badge: wishlistCount },
                { label: "Carrito", action: () => { setMenuOpen(false); onCartOpen(); }, badge: itemCount },
              ].map((it: any) => (
                <a
                  key={it.label}
                  href={it.href || "#"}
                  onClick={(e) => { if (!it.href) e.preventDefault(); it.action(); }}
                  className="flex items-center justify-between border-b border-foreground/10 px-4 py-3 text-xs uppercase tracking-[0.2em] hover:bg-accent"
                >
                  <span>{it.label}</span>
                  {it.badge ? <span className="tabular-nums text-foreground">{it.badge}</span> : null}
                </a>
              ))}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="mx-4 mt-4 flex items-center justify-center gap-2 border border-foreground px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] hover:bg-foreground hover:text-background">
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

export default ClassicHeader;
