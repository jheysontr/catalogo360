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
  LayoutGrid, List, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart, getFinalPrice } from "@/lib/CartContext";
import CartModal from "@/components/Cart/CartModal";

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", BOB: "Bs", ARS: "$", MXN: "$", CLP: "$",
  COP: "$", PEN: "S/", UYU: "$U", BRL: "R$", PYG: "₲", GBP: "£",
};

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
  const referralCode = searchParams.get("ref") || "";
  const { toast } = useToast();
  const { items: cart, addToCart, removeFromCart, updateQuantity, cartTotal, itemCount, setStoreId } = useCart();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [detailQty, setDetailQty] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);

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

  const handleAddFromDetail = () => {
    if (!selectedProduct) return;
    const hasAttrs = Array.isArray(selectedProduct.attributes) && (selectedProduct.attributes as ProductAttribute[]).length > 0;
    addToCart(selectedProduct, detailQty, hasAttrs ? selectedAttrs : undefined);
    toast({ title: "✓ Agregado", description: selectedProduct.name, duration: 1500 });
    setSelectedProduct(null);
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

  return (
    <div className="min-h-screen bg-background">
      {/* ── BANNER & HEADER ── */}
      <div className="relative">
        <div
          className="h-48 w-full bg-cover bg-center sm:h-56 md:h-64"
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
          <div className="flex flex-1 flex-col items-center gap-2 pb-2 sm:items-start">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{store.store_name}</h1>
            {store.description && (
              <p className="max-w-lg text-center text-sm text-muted-foreground sm:text-left">{store.description}</p>
            )}
          </div>
          <div className="flex gap-2 pb-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setInfoOpen(true)}>
              <Info className="h-4 w-4" /> Información
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Compartir
            </Button>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="container mt-8 space-y-4 px-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex shrink-0 rounded-lg border sm:hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center p-2.5 transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center p-2.5 transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más nuevos</SelectItem>
              <SelectItem value="price_high">Mayor precio</SelectItem>
              <SelectItem value="price_low">Menor precio</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden shrink-0 rounded-lg border sm:flex">
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
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
      </div>

      {/* ── PRODUCTS GRID ── */}
      <div className="container px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-foreground">No se encontraron productos</p>
            <p className="text-sm text-muted-foreground">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" : "flex flex-col gap-3"}>
            {filteredProducts.map((p) => {
              const catName = getCategoryName(p.category_id);
              const finalPrice = getFinalPrice(p);

              if (viewMode === "list") {
                return (
                  <Card key={p.id} className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg" onClick={() => openProductDetail(p)}>
                    <div className="flex">
                      <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden bg-muted sm:h-40 sm:w-40">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <StoreIcon className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        {p.on_sale && (
                          <Badge className="absolute left-1.5 top-1.5 text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90">¡Oferta!</Badge>
                        )}
                      </div>
                      <CardContent className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                        <div className="space-y-1">
                          {catName && <Badge variant="outline" className="text-[10px] sm:text-xs">{catName}</Badge>}
                          <h3 className="text-sm font-semibold text-foreground sm:text-base">{p.name}</h3>
                          {p.description && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                          )}
                          {Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(p.attributes as ProductAttribute[]).map((attr, i) => (
                                <span key={i} className="text-[10px] text-muted-foreground">
                                  {attr.name}: {attr.values.join(", ")}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-baseline gap-1.5">
                            {p.on_sale && p.discount_percent ? (
                              <>
                                <span className="text-base font-bold text-destructive">{currencySymbol}{finalPrice.toFixed(2)}</span>
                                <span className="text-[10px] text-muted-foreground line-through">{currencySymbol}{p.price.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-base font-bold" style={{ color: primaryColor }}>{currencySymbol}{p.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className={`text-[10px] sm:text-xs ${p.stock < 5 ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                            Stock: {p.stock}
                          </p>
                          <Button
                            className="gap-1.5 text-xs text-white transition-all duration-150 active:scale-90 active:brightness-110"
                            size="sm"
                            style={{ backgroundColor: primaryColor }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openProductDetail(p);
                            }}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" /> Ver
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              }

              return (
                <Card key={p.id} className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg" onClick={() => openProductDetail(p)}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <StoreIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {p.on_sale && (
                      <Badge className="absolute left-1.5 top-1.5 text-[10px] sm:left-2 sm:top-2 sm:text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90">¡Oferta!</Badge>
                    )}
                  </div>
                  <CardContent className="space-y-1.5 p-2.5 sm:space-y-2 sm:p-4">
                    {catName && <Badge variant="outline" className="text-[10px] sm:text-xs">{catName}</Badge>}
                    <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{p.name}</h3>
                    {p.description && (
                      <p className="line-clamp-2 text-[10px] text-muted-foreground sm:text-xs">{p.description}</p>
                    )}
                    {Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(p.attributes as ProductAttribute[]).map((attr, i) => (
                          <span key={i} className="text-[9px] sm:text-[10px] text-muted-foreground">
                            {attr.name}: {attr.values.join(", ")}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      {p.on_sale && p.discount_percent ? (
                        <>
                          <span className="text-base font-bold text-destructive sm:text-xl">{currencySymbol}{finalPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-muted-foreground line-through sm:text-sm">{currencySymbol}{p.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-base font-bold sm:text-xl" style={{ color: primaryColor }}>{currencySymbol}{p.price.toFixed(2)}</span>
                      )}
                    </div>
                    <p className={`text-[10px] sm:text-xs ${p.stock < 5 ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                      Stock: {p.stock}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FLOATING CART BUTTON ── */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: primaryColor }}
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {itemCount}
          </span>
        )}
      </button>

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
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto py-4">
                {cart.map((item, idx) => {
                  const price = getFinalPrice(item.product);
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
                        <p className="text-sm font-medium text-foreground">{item.product.name}</p>
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

      {/* ── CHECKOUT MODAL ── */}
      <CartModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        storeId={store.id}
        storePhone={socialMedia?.whatsapp || ""}
        storeName={store.store_name}
        primaryColor={primaryColor}
        currencySymbol={currencySymbol}
        referralCode={referralCode}
        onOrderComplete={() => {
          setCartOpen(false);
          setActiveCategory("all");
          setSearch("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* ── PRODUCT DETAIL DIALOG ── */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md p-0">
          {selectedProduct && (() => {
            const sp = selectedProduct;
            const spFinalPrice = getFinalPrice(sp);
            const spCatName = getCategoryName(sp.category_id);
            const spAttrs = Array.isArray(sp.attributes) ? (sp.attributes as ProductAttribute[]) : [];
            const extraImgs = Array.isArray(sp.extra_images) ? (sp.extra_images as string[]) : [];
            const allImages = [sp.image_url, ...extraImgs].filter(Boolean) as string[];
            const activeImg = allImages[galleryIndex] ?? null;
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
                  {sp.on_sale && (
                    <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground hover:bg-destructive/90">¡Oferta!</Badge>
                  )}
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
                        <span className="text-sm text-muted-foreground line-through">{currencySymbol}{sp.price.toFixed(2)}</span>
                        <Badge variant="secondary" className="text-xs">-{sp.discount_percent}%</Badge>
                      </>
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>{currencySymbol}{sp.price.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Description */}
                  {sp.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{sp.description}</p>
                  )}

                  {/* Attributes selectors */}
                  {spAttrs.length > 0 && (
                    <div className="space-y-3">
                      {spAttrs.map((attr) => (
                        <div key={attr.name} className="space-y-1.5">
                          <label className="text-sm font-medium text-foreground">{attr.name}</label>
                          <div className="flex flex-wrap gap-2">
                            {attr.values.map((val) => {
                              const isSelected = selectedAttrs[attr.name] === val;
                              return (
                                <button
                                  key={val}
                                  onClick={() => setSelectedAttrs((prev) => ({ ...prev, [attr.name]: val }))}
                                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                                    isSelected
                                      ? "border-transparent text-white shadow-sm"
                                      : "border-border text-foreground hover:border-muted-foreground"
                                  }`}
                                  style={isSelected ? { backgroundColor: primaryColor } : undefined}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stock */}
                  <p className={`text-xs ${sp.stock < 5 ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                    {sp.stock < 5 ? `¡Solo quedan ${sp.stock}!` : `Stock disponible: ${sp.stock}`}
                  </p>

                  {/* Quantity + Add to cart */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center rounded-lg border">
                      <button
                        onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                        className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-l-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex h-10 w-10 items-center justify-center text-sm font-semibold">{detailQty}</span>
                      <button
                        onClick={() => setDetailQty((q) => Math.min(sp.stock, q + 1))}
                        className="flex h-10 w-10 items-center justify-center text-foreground hover:bg-accent transition-colors rounded-r-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      className="flex-1 gap-2 text-white transition-all duration-150 active:scale-95"
                      size="lg"
                      style={{ backgroundColor: primaryColor }}
                      onClick={handleAddFromDetail}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Agregar al carrito
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
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" /> {store.email}
              </div>
            )}
            {store.address && (
              <div className="flex items-center gap-3 text-sm text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {store.address}
              </div>
            )}
            {socialMedia?.whatsapp && (
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" /> {socialMedia.whatsapp}
              </div>
            )}
            {socialMedia?.facebook && (
              <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary">
                <Facebook className="h-4 w-4 text-muted-foreground" /> Facebook <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {socialMedia?.instagram && (
              <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-primary">
                <Instagram className="h-4 w-4 text-muted-foreground" /> Instagram <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── FOOTER ── */}
      <footer className="mt-12 border-t" style={{ backgroundColor: secondaryColor }}>
        <div className="container grid gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/90">Redes Sociales</h4>
            <div className="flex gap-3">
              {socialMedia?.facebook && (
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.instagram && (
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.tiktok && (
                <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-xs font-bold">
                  TikTok
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/90">Información</h4>
            {store.description && <p className="text-sm text-white/60">{store.description}</p>}
            {store.email && <p className="mt-2 text-sm text-white/60">{store.email}</p>}
            {store.address && <p className="mt-1 text-sm text-white/60">{store.address}</p>}
          </div>
          <div className="flex items-end">
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
