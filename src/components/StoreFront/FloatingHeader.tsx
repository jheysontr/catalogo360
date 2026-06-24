import { Search, ShoppingCart, Heart, Info, MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import type { TemplateTheme } from "@/components/StoreFront/AppTemplate/templateThemes";

interface FloatingHeaderProps {
  store: {
    store_name: string;
    logo_url: string | null;
  };
  primaryColor: string;
  theme: TemplateTheme;
  search: string;
  onSearchChange: (v: string) => void;
  itemCount: number;
  wishlistCount: number;
  whatsapp?: string;
  onCartOpen: () => void;
  onWishlistOpen: () => void;
  onInfoClick: () => void;
}

/**
 * Per-template visual personality (corners + density).
 * All variants share the same floating glass DNA.
 */
const variantStyles = (id: string) => {
  switch (id) {
    case "classic":
      return { card: "rounded-none", chip: "rounded-none", cartBtn: "rounded-none", logoRadius: 2, accentTint: false };
    case "app":
    case "moderna":
      return { card: "rounded-md", chip: "rounded-sm", cartBtn: "rounded-md", logoRadius: 4, accentTint: false };
    case "elegante":
    case "market":
      return { card: "rounded-2xl", chip: "rounded-full", cartBtn: "rounded-xl", logoRadius: 12, accentTint: true };
    default:
      return { card: "rounded-2xl", chip: "rounded-full", cartBtn: "rounded-xl", logoRadius: 12, accentTint: true };
  }
};

const FloatingHeader = ({
  store, primaryColor, theme, search, onSearchChange,
  itemCount, wishlistCount, whatsapp,
  onCartOpen, onWishlistOpen, onInfoClick,
}: FloatingHeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const v = variantStyles(theme.id);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola, vengo desde tu catálogo")}`
    : null;

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="container mx-auto max-w-5xl px-0">
        <nav
          className={`${v.card} overflow-hidden border backdrop-blur-md transition-all duration-300 ${
            scrolled
              ? "border-border/60 bg-background/95 shadow-md"
              : "border-white/40 bg-background/80 shadow-lg shadow-black/5"
          }`}
        >
          {/* Top info strip — status + WhatsApp */}
          <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5 text-[11px] font-medium sm:px-4">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="uppercase tracking-wider text-muted-foreground">Abierto ahora</span>
            </div>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-600 transition-colors hover:text-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="sm:hidden">Contactar</span>
              </a>
            )}
          </div>

          {/* Main row */}
          <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
            {/* Logo + name */}
            {!searchOpen && (
              <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-border/40 sm:h-10 sm:w-10"
                  style={{ borderRadius: v.logoRadius, backgroundColor: store.logo_url ? undefined : primaryColor }}
                >
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-base font-bold text-white sm:text-lg">
                      {(store.store_name || "T").trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  {store.store_name}
                </h1>
              </div>
            )}

            {/* Search expanded */}
            {searchOpen && (
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder="Buscar productos…"
                    className="h-9 border-border bg-background pl-8 text-sm"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { onSearchChange(""); setSearchOpen(false); }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Actions */}
            {!searchOpen && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Buscar"
                >
                  <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </button>
                <button
                  onClick={onInfoClick}
                  className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
                  aria-label="Información"
                >
                  <Info className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </button>
                {wishlistCount > 0 && (
                  <button
                    onClick={onWishlistOpen}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
                    aria-label="Favoritos"
                  >
                    <Heart className="h-[18px] w-[18px] fill-red-500 text-red-500" strokeWidth={1.5} />
                    <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                      {wishlistCount}
                    </span>
                  </button>
                )}
                <button
                  onClick={onCartOpen}
                  className={`relative ml-1 flex h-9 items-center gap-1.5 px-3 text-white shadow-sm transition-all hover:opacity-90 active:scale-95 ${v.cartBtn}`}
                  style={{ backgroundColor: primaryColor }}
                  aria-label="Carrito"
                >
                  <ShoppingCart className="h-[16px] w-[16px]" strokeWidth={2} />
                  <span className="text-xs font-bold tabular-nums">{itemCount}</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default FloatingHeader;
