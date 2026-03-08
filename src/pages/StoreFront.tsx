import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Search, ShoppingCart, Share2, Info, Plus, Minus, X, Loader2,
  Store as StoreIcon, Facebook, Instagram, Mail, MapPin, Phone, ExternalLink,
  LayoutGrid, List, ChevronLeft, ChevronRight, Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart, getFinalPrice } from "@/lib/CartContext";
import { getCurrencySymbol } from "@/lib/currency";
import { useWishlist } from "@/lib/WishlistContext";

/* ─── Types ─── */
interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  email: string | null;
  address: string | null;
  social_media: Record<string, string> | null;
  currency: string;
}

// Using centralized currency from @/lib/currency

interface ProductAttribute {
  name: string;
  values: string[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  extra_images: unknown;
  variant_stock?: unknown;
  variant_prices?: unknown;
  on_sale: boolean;
  discount_percent: number | null;
  category_id: string | null;
  attributes: unknown;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  
  const { toast } = useToast();
  const { items: cart, addToCart, removeFromCart, updateQuantity, cartTotal, itemCount, setStoreId } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, items: wishlistItems, itemCount: wishlistCount, setStoreId: setWishlistStoreId } = useWishlist();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [detailQty, setDetailQty] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  /* ── Sticky bar on scroll ── */
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 280);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Fetch store data ── */
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const { data: storeData } = await supabase
        .from("stores")
        .select("*")
        .eq("store_slug", slug)
        .limit(1);

      if (!storeData || storeData.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const s = storeData[0] as StoreData;
      setStore(s);
      setStoreId(s.id);
      setWishlistStoreId(s.id);

      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").eq("store_id", s.id).gt("stock", 0).order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, icon").eq("store_id", s.id),
      ]);
      setProducts(prods ?? []);
      setCategories(cats ?? []);
      setLoading(false);
    };
    load();
  }, [slug]);

  const primaryColor = store?.primary_color || "#2a9d8f";
  const secondaryColor = store?.secondary_color || "#264653";
  const socialMedia = (store?.social_media ?? {}) as Record<string, string>;
  const currencySymbol = CURRENCY_SYMBOLS[store?.currency || "BOB"] || store?.currency || "$";

  const filteredProducts = useMemo(() => {
    let items = [...products];
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory !== "all") items = items.filter((p) => p.category_id === activeCategory);
    switch (sortBy) {
      case "price_high": items.sort((a, b) => b.price - a.price); break;
      case "price_low": items.sort((a, b) => a.price - b.price); break;
      default: break;
    }
    return items;
  }, [products, search, activeCategory, sortBy]);

  const getCategoryName = (catId: string | null) =>
    categories.find((c) => c.id === catId)?.name ?? null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: store?.store_name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "¡Enlace copiado!" });
    }
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailQty(1);
    setGalleryIndex(0);
    const attrs: Record<string, string> = {};
    if (Array.isArray(product.attributes)) {
      (product.attributes as ProductAttribute[]).forEach((attr) => {
        if (attr.values.length > 0) attrs[attr.name] = attr.values[0];
      });
    }
    setSelectedAttrs(attrs);
  };

  const toCartProduct = (p: Product) => ({
    ...p,
    variant_stock: (p.variant_stock && typeof p.variant_stock === "object" && !Array.isArray(p.variant_stock))
      ? p.variant_stock as Record<string, number>
      : undefined,
    variant_prices: (p.variant_prices && typeof p.variant_prices === "object" && !Array.isArray(p.variant_prices))
      ? p.variant_prices as Record<string, number>
      : undefined,
  });

  const handleAddFromDetail = () => {
    if (!selectedProduct) return;
    const hasAttrs = Array.isArray(selectedProduct.attributes) && (selectedProduct.attributes as ProductAttribute[]).length > 0;
    addToCart(toCartProduct(selectedProduct), detailQty, hasAttrs ? selectedAttrs : undefined);
    toast({ title: "✓ Agregado", description: selectedProduct.name, duration: 1500 });
    setSelectedProduct(null);
  };

  /** Quick add for products without attributes */
  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasAttrs = Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0;
    if (hasAttrs) {
      openProductDetail(p);
      return;
    }
    addToCart(toCartProduct(p), 1);
    toast({ title: "✓ Agregado", description: p.name, duration: 1500 });
  };

  const toggleWishlist = (p: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isInWishlist(p.id)) {
      removeFromWishlist(p.id);
      toast({ title: "Eliminado de favoritos", description: p.name, duration: 1500 });
    } else {
      addToWishlist({ id: p.id, name: p.name, price: p.price, image_url: p.image_url, on_sale: p.on_sale, discount_percent: p.discount_percent });
      toast({ title: "❤️ Agregado a favoritos", description: p.name, duration: 1500 });
    }
  };

  const getVariantStock = (product: Product, attrs: Record<string, string>): number => {
    const vs = product.variant_stock;
    if (!vs || typeof vs !== "object" || Array.isArray(vs)) return product.stock;
    const vsMap = vs as Record<string, number>;
    if (Object.keys(vsMap).length === 0) return product.stock;
    const stocks: number[] = Object.entries(attrs).map(([attrName, val]) => {
      const key = `${attrName}||${val}`;
      return vsMap[key] !== undefined ? vsMap[key] : product.stock;
    });
    return stocks.length > 0 ? Math.min(...stocks) : product.stock;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <StoreIcon className="h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold text-foreground">Tienda no encontrada</h1>
        <p className="text-muted-foreground">La tienda que buscas no existe o fue eliminada.</p>
      </div>
    );
  }

  const hasSocial = socialMedia?.facebook || socialMedia?.instagram || socialMedia?.tiktok;

  return (
    <div className="min-h-screen bg-background">
      {/* ── STICKY TOP BAR ── */}
      <div
        className={`fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur-md transition-all duration-300 ${
          showStickyBar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3 min-w-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor }}>
                <StoreIcon className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="truncate text-sm font-semibold text-foreground">{store.store_name}</span>
          </div>
          <div className="flex items-center gap-2">
            {wishlistCount > 0 && (
              <button
                onClick={() => setWishlistOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent transition-colors"
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              </button>
            )}
            <button
              onClick={() => setCartOpen(true)}
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

      {/* ── BANNER & HEADER ── */}
      <div className="relative">
        <div
          className="h-44 w-full bg-cover bg-center sm:h-56 md:h-64"
          style={{
            backgroundColor: secondaryColor,
            backgroundImage: store.banner_url ? `url(${store.banner_url})` : undefined,
          }}
        />
        <div className="container relative -mt-12 flex flex-col items-center gap-3 px-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-background shadow-lg sm:h-28 sm:w-28"
            style={{ backgroundColor: primaryColor }}
          >
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="h-full w-full object-cover" />
            ) : (
              <StoreIcon className="h-10 w-10 text-white" />
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-1.5 pb-2 sm:items-start">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{store.store_name}</h1>
            {store.description && (
              <p className="max-w-lg text-center text-sm text-muted-foreground sm:text-left line-clamp-2">{store.description}</p>
            )}
          </div>
          <div className="flex gap-2 pb-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setInfoOpen(true)}>
              <Info className="h-4 w-4" /> <span className="hidden sm:inline">Información</span><span className="sm:hidden">Info</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Compartir</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="container mt-6 space-y-3 px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] shrink-0 sm:w-44">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="price_high">Mayor precio</SelectItem>
              <SelectItem value="price_low">Menor precio</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex shrink-0 rounded-lg border">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center p-2 transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center p-2 transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === "all" ? "text-white shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              style={activeCategory === "all" ? { backgroundColor: primaryColor } : undefined}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.id ? "text-white shadow-md" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                style={activeCategory === cat.id ? { backgroundColor: primaryColor } : undefined}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product count */}
        <p className="text-xs text-muted-foreground">
          {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
          {activeCategory !== "all" && ` en ${getCategoryName(activeCategory) || "categoría"}`}
        </p>
      </div>

      {/* ── PRODUCTS GRID ── */}
      <div className="container px-4 pb-8 pt-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground">No se encontraron productos</p>
            <p className="text-sm text-muted-foreground">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"}>
            {filteredProducts.map((p) => {
              const catName = getCategoryName(p.category_id);
              const finalPrice = getFinalPrice(toCartProduct(p));
              const hasAttrs = Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0;

              if (viewMode === "list") {
                return (
                  <div key={p.id} className="group cursor-pointer flex overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg" onClick={() => openProductDetail(p)}>
                    <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden bg-muted sm:h-40 sm:w-40">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                          <StoreIcon className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                      )}
                      {p.on_sale && (
                        <span className="absolute left-1.5 top-1.5 inline-flex items-center rounded-lg bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground shadow-sm">-{p.discount_percent}%</span>
                      )}
                      <button
                        onClick={(e) => toggleWishlist(p, e)}
                        className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
                          isInWishlist(p.id)
                            ? "bg-red-500 text-white"
                            : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:bg-white"
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 transition-colors ${isInWishlist(p.id) ? "fill-white" : ""}`} />
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                      <div className="space-y-1">
                        {catName && (
                          <p className="text-[10px] font-semibold uppercase tracking-widest sm:text-[11px]" style={{ color: primaryColor }}>
                            {catName}
                          </p>
                        )}
                        <h3 className="text-sm font-semibold text-foreground sm:text-base line-clamp-1">{p.name}</h3>
                        {p.description && (
                          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                        )}
                        <div className="flex items-baseline gap-2 pt-0.5">
                          {p.on_sale && p.discount_percent ? (
                            <>
                              <span className="text-base font-bold text-destructive sm:text-lg">{currencySymbol}{finalPrice.toFixed(2)}</span>
                              <span className="text-[10px] text-muted-foreground line-through">{currencySymbol}{p.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-base font-bold sm:text-lg" style={{ color: primaryColor }}>{currencySymbol}{p.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        {p.stock < 5 && (
                          <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 sm:text-xs">
                            ¡Quedan {p.stock}!
                          </span>
                        )}
                        <Button
                          className="ml-auto gap-1.5 rounded-xl text-xs text-white transition-all duration-150 active:scale-95 hover:brightness-110"
                          size="sm"
                          style={{ backgroundColor: primaryColor }}
                          onClick={(e) => handleQuickAdd(p, e)}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          {hasAttrs ? "Ver opciones" : "Agregar"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={p.id} className="group cursor-pointer" onClick={() => openProductDetail(p)}>
                  {/* Image container */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                        <StoreIcon className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {/* Sale badge */}
                    {p.on_sale && p.discount_percent && (
                      <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5">
                        <span className="inline-flex items-center rounded-lg bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground shadow-sm sm:text-xs">
                          -{p.discount_percent}%
                        </span>
                      </div>
                    )}
                    {/* Low stock badge */}
                    {p.stock < 5 && (
                      <div className="absolute left-2 sm:left-2.5" style={{ top: p.on_sale && p.discount_percent ? '2.25rem' : '0.5rem' }}>
                        <span className="inline-flex items-center rounded-lg bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm sm:text-[10px]">
                          ¡Quedan {p.stock}!
                        </span>
                      </div>
                    )}
                    {/* Wishlist button */}
                    <button
                      onClick={(e) => toggleWishlist(p, e)}
                      className={`absolute right-2 top-2 sm:right-2.5 sm:top-2.5 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
                        isInWishlist(p.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:bg-white"
                      }`}
                    >
                      <Heart className={`h-4 w-4 transition-colors ${isInWishlist(p.id) ? "fill-white" : ""}`} />
                    </button>
                    {/* Quick add button */}
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full p-2.5 transition-transform duration-300 group-hover:translate-y-0">
                      <button
                        onClick={(e) => handleQuickAdd(p, e)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:brightness-110 sm:text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {hasAttrs ? "Ver opciones" : "Agregar al carrito"}
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="mt-2.5 space-y-1 px-0.5">
                    {catName && (
                      <p className="text-[10px] font-semibold uppercase tracking-widest sm:text-[11px]" style={{ color: primaryColor }}>
                        {catName}
                      </p>
                    )}
                    <h3 className="truncate text-sm font-semibold text-foreground sm:text-[15px]">{p.name}</h3>
                    <div className="flex items-baseline gap-2">
                      {p.on_sale && p.discount_percent ? (
                        <>
                          <span className="text-base font-bold text-destructive sm:text-lg">{currencySymbol}{finalPrice.toFixed(2)}</span>
                          <span className="text-[11px] text-muted-foreground line-through sm:text-xs">{currencySymbol}{p.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-base font-bold sm:text-lg" style={{ color: primaryColor }}>{currencySymbol}{p.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FLOATING CART BUTTON ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {wishlistCount > 0 && (
          <button
            onClick={() => setWishlistOpen(true)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-lg border transition-transform hover:scale-110"
          >
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {wishlistCount}
            </span>
          </button>
        )}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
          style={{ backgroundColor: primaryColor }}
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* ── CART PANEL ── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Tu carrito ({itemCount})
            </SheetTitle>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
              <Button variant="outline" size="sm" onClick={() => setCartOpen(false)}>Seguir comprando</Button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto py-4">
                {cart.map((item, idx) => {
                  const price = getFinalPrice(item.product, item.selectedAttributes);
                  const cartKey = `${item.product.id}-${idx}`;
                  return (
                    <div key={cartKey} className="flex gap-3 rounded-lg border p-3">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                          <StoreIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</p>
                        {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                          <p className="text-[10px] text-muted-foreground">
                            {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </p>
                        )}
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                          {currencySymbol}{(price * item.quantity).toFixed(2)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedAttributes)}
                            className="flex h-6 w-6 items-center justify-center rounded border text-foreground hover:bg-accent"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedAttributes)}
                            className="flex h-6 w-6 items-center justify-center rounded border text-foreground hover:bg-accent"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id, item.selectedAttributes)} className="self-start text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>{currencySymbol}{cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full text-white"
                  size="lg"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setCheckoutOpen(true)}
                >
                  COMPLETAR PEDIDO
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── WISHLIST PANEL ── */}
      <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" /> Favoritos ({wishlistCount})
            </SheetTitle>
          </SheetHeader>
          {wishlistItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Heart className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">Tu lista de deseos está vacía</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {wishlistItems.map((item) => {
                const finalPrice = item.on_sale && item.discount_percent
                  ? item.price * (1 - item.discount_percent / 100)
                  : item.price;
                const product = products.find((p) => p.id === item.id);
                return (
                  <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-16 w-16 cursor-pointer rounded-md object-cover"
                        onClick={() => { setWishlistOpen(false); if (product) openProductDetail(product); }}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                        <StoreIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-center">
                      <p
                        className="text-sm font-medium text-foreground cursor-pointer hover:underline line-clamp-1"
                        onClick={() => { setWishlistOpen(false); if (product) openProductDetail(product); }}
                      >
                        {item.name}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        {item.on_sale && item.discount_percent ? (
                          <>
                            <span className="text-sm font-bold text-destructive">{currencySymbol}{finalPrice.toFixed(2)}</span>
                            <span className="text-[10px] text-muted-foreground line-through">{currencySymbol}{item.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold" style={{ color: primaryColor }}>{currencySymbol}{item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <button
                        onClick={() => { setWishlistOpen(false); if (product) openProductDetail(product); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors"
                        title="Ver producto"
                      >
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10 transition-colors"
                        title="Quitar de favoritos"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CartModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        storeId={store.id}
        storePhone={socialMedia?.whatsapp || ""}
        storeName={store.store_name}
        primaryColor={primaryColor}
        currencySymbol={currencySymbol}
        
        onOrderComplete={() => {
          setCartOpen(false);
          setActiveCategory("all");
          setSearch("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* ── PRODUCT DETAIL DIALOG ── */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md p-0 [&>button]:z-50 [&>button]:bg-white/80 [&>button]:backdrop-blur-sm [&>button]:rounded-full [&>button]:shadow-sm [&>button]:hover:bg-white">
          {selectedProduct && (() => {
            const sp = selectedProduct;
            const spCartProduct = toCartProduct(sp);
            const spFinalPrice = getFinalPrice(spCartProduct, selectedAttrs);
            const spBasePrice = spCartProduct.variant_prices
              ? (() => {
                  const prices = Object.entries(selectedAttrs)
                    .map(([k, v]) => spCartProduct.variant_prices![`${k}||${v}`])
                    .filter((v): v is number => v !== undefined && v > 0);
                  return prices.length > 0 ? Math.max(...prices) : sp.price;
                })()
              : sp.price;
            const spCatName = getCategoryName(sp.category_id);
            const spAttrs = Array.isArray(sp.attributes) ? (sp.attributes as ProductAttribute[]) : [];
            const extraImgs = Array.isArray(sp.extra_images) ? (sp.extra_images as string[]) : [];
            const allImages = [sp.image_url, ...extraImgs].filter(Boolean) as string[];
            const activeImg = allImages[galleryIndex] ?? null;
            const effectiveStock = getVariantStock(sp, selectedAttrs);
            const variantOutOfStock = effectiveStock <= 0;
            return (
              <>
                {/* Gallery */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted select-none">
                  {activeImg ? (
                    <img src={activeImg} alt={sp.name} className="h-full w-full object-cover transition-opacity duration-200" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <StoreIcon className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {sp.on_sale && sp.discount_percent && (
                    <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground hover:bg-destructive/90">-{sp.discount_percent}%</Badge>
                  )}
                  <button
                    onClick={() => toggleWishlist(sp)}
                    className="absolute left-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:scale-110 hover:bg-white z-10"
                  >
                    <Heart className={`h-5 w-5 transition-colors ${isInWishlist(sp.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setGalleryIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setGalleryIndex((i) => (i + 1) % allImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {/* Image dots indicator */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setGalleryIndex(idx)}
                          className={`h-2 w-2 rounded-full transition-all ${galleryIndex === idx ? "bg-white w-4" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto px-5 pt-3 pb-0 scrollbar-hide">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setGalleryIndex(idx)}
                        className={`shrink-0 h-14 w-14 overflow-hidden rounded-md border-2 transition-all ${
                          galleryIndex === idx ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-4 p-5">
                  <DialogHeader className="space-y-1">
                    {spCatName && <Badge variant="outline" className="w-fit text-xs">{spCatName}</Badge>}
                    <DialogTitle className="text-xl">{sp.name}</DialogTitle>
                    <DialogDescription className="sr-only">Detalles del producto {sp.name}</DialogDescription>
                  </DialogHeader>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    {sp.on_sale && sp.discount_percent ? (
                      <>
                        <span className="text-2xl font-bold text-destructive">{currencySymbol}{spFinalPrice.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground line-through">{currencySymbol}{spBasePrice.toFixed(2)}</span>
                        <Badge variant="secondary" className="text-xs">-{sp.discount_percent}%</Badge>
                      </>
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>{currencySymbol}{spFinalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Description */}
                  {sp.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{sp.description}</p>
                  )}

                  {/* Attributes selectors */}
                  {spAttrs.length > 0 && (
                    <div className="space-y-3">
                      {spAttrs.map((attr) => {
                        const vs = sp.variant_stock;
                        const vsMap = (vs && typeof vs === "object" && !Array.isArray(vs)) ? vs as Record<string, number> : {};
                        const hasVariantStock = Object.keys(vsMap).length > 0;
                        return (
                          <div key={attr.name} className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">{attr.name}</label>
                            <div className="flex flex-wrap gap-2">
                              {attr.values.map((val) => {
                                const isSelected = selectedAttrs[attr.name] === val;
                                const vKey = `${attr.name}||${val}`;
                                const vStock = vsMap[vKey];
                                const vOutOfStock = hasVariantStock && vStock !== undefined && vStock <= 0;
                                return (
                                  <button
                                    key={val}
                                    onClick={() => {
                                      if (!vOutOfStock) setSelectedAttrs((prev) => ({ ...prev, [attr.name]: val }));
                                    }}
                                    disabled={vOutOfStock}
                                    className={`relative rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                                      vOutOfStock
                                        ? "border-border text-muted-foreground opacity-40 cursor-not-allowed line-through"
                                        : isSelected
                                          ? "border-transparent text-white shadow-sm"
                                          : "border-border text-foreground hover:border-muted-foreground"
                                    }`}
                                    style={isSelected && !vOutOfStock ? { backgroundColor: primaryColor } : undefined}
                                  >
                                    {val}
                                    {hasVariantStock && vStock !== undefined && vStock > 0 && vStock <= 5 && (
                                      <span className="ml-1.5 text-[10px] font-normal opacity-70">({vStock})</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Stock */}
                  <p className={`text-xs ${effectiveStock < 5 ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                    {variantOutOfStock
                      ? "❌ Variante sin stock"
                      : effectiveStock < 5
                        ? `¡Solo quedan ${effectiveStock}!`
                        : `Stock disponible: ${effectiveStock}`}
                  </p>

                  {/* Quantity + Add to cart */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center rounded-lg border">
                      <button
                        onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                        disabled={variantOutOfStock}
                        className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-lg disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex h-10 w-10 items-center justify-center text-sm font-semibold">{detailQty}</span>
                      <button
                        onClick={() => setDetailQty((q) => Math.min(effectiveStock, q + 1))}
                        disabled={variantOutOfStock || detailQty >= effectiveStock}
                        className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-lg disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      className="flex-1 gap-2 text-white transition-all duration-150 active:scale-95 disabled:opacity-60"
                      size="lg"
                      style={{ backgroundColor: variantOutOfStock ? undefined : primaryColor }}
                      onClick={handleAddFromDetail}
                      disabled={variantOutOfStock}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {variantOutOfStock ? "Sin stock" : "Agregar al carrito"}
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{store.store_name}</DialogTitle>
            <DialogDescription>Información de contacto</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {store.email && (
              <a href={`mailto:${store.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-muted-foreground" /> {store.email}
              </a>
            )}
            {store.address && (
              <div className="flex items-center gap-3 text-sm text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {store.address}
              </div>
            )}
            {socialMedia?.whatsapp && (
              <a
                href={`https://api.whatsapp.com/send?phone=${socialMedia.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-muted-foreground" /> {socialMedia.whatsapp}
              </a>
            )}
            {socialMedia?.facebook && (
              <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                <Facebook className="h-4 w-4 text-muted-foreground" /> Facebook <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {socialMedia?.instagram && (
              <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                <Instagram className="h-4 w-4 text-muted-foreground" /> Instagram <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── FOOTER ── */}
      <footer className="mt-12 border-t" style={{ backgroundColor: secondaryColor }}>
        <div className="container px-4 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/90">{store.store_name}</h4>
              {store.description && <p className="max-w-xs text-sm text-white/60">{store.description}</p>}
              {store.email && <p className="text-sm text-white/60">{store.email}</p>}
              {store.address && <p className="text-sm text-white/60">{store.address}</p>}
            </div>
            {hasSocial && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white/90">Redes Sociales</h4>
                <div className="flex gap-3">
                  {socialMedia?.facebook && (
                    <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {socialMedia?.instagram && (
                    <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {socialMedia?.tiktok && (
                    <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-xs font-bold">
                      TikTok
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} {store.store_name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreFront;
