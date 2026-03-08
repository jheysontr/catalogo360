import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Store as StoreIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart, getFinalPrice } from "@/lib/CartContext";
import { getCurrencySymbol } from "@/lib/currency";
import { useWishlist } from "@/lib/WishlistContext";
import CartModal from "@/components/Cart/CartModal";
import type { StoreData, Product, ProductAttribute, Category } from "@/components/StoreFront/types";
import StickyTopBar from "@/components/StoreFront/StickyTopBar";
import StoreHeader from "@/components/StoreFront/StoreHeader";
import StoreFilters from "@/components/StoreFront/StoreFilters";
import StoreFrontProductCard from "@/components/StoreFront/StoreFrontProductCard";
import FloatingActions from "@/components/StoreFront/FloatingActions";
import CartPanel from "@/components/StoreFront/CartPanel";
import WishlistPanel from "@/components/StoreFront/WishlistPanel";
import ProductDetailDialog from "@/components/StoreFront/ProductDetailDialog";
import StoreInfoDialog from "@/components/StoreFront/StoreInfoDialog";
import StoreFooter from "@/components/StoreFront/StoreFooter";

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
        .from("stores_public" as any)
        .select("*")
        .eq("store_slug", slug)
        .limit(1);

      if (!storeData || storeData.length === 0) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const s = storeData[0] as unknown as StoreData;
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
  const currencySymbol = getCurrencySymbol(store?.currency || "BOB");

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

  const getCategoryName = useCallback(
    (catId: string | null) => categories.find((c) => c.id === catId)?.name ?? null,
    [categories]
  );

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: store?.store_name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "¡Enlace copiado!" });
    }
  }, [store?.store_name, toast]);

  const toCartProduct = useCallback((p: Product) => ({
    ...p,
    variant_stock: (p.variant_stock && typeof p.variant_stock === "object" && !Array.isArray(p.variant_stock))
      ? p.variant_stock as Record<string, number> : undefined,
    variant_prices: (p.variant_prices && typeof p.variant_prices === "object" && !Array.isArray(p.variant_prices))
      ? p.variant_prices as Record<string, number> : undefined,
  }), []);

  const handleQuickAdd = useCallback((p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasAttrs = Array.isArray(p.attributes) && (p.attributes as ProductAttribute[]).length > 0;
    if (hasAttrs) { setSelectedProduct(p); return; }
    addToCart(toCartProduct(p), 1);
    toast({ title: "✓ Agregado", description: p.name, duration: 1500 });
  }, [addToCart, toCartProduct, toast]);

  const toggleWishlist = useCallback((p: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isInWishlist(p.id)) {
      removeFromWishlist(p.id);
      toast({ title: "Eliminado de favoritos", description: p.name, duration: 1500 });
    } else {
      addToWishlist({ id: p.id, name: p.name, price: p.price, image_url: p.image_url, on_sale: p.on_sale, discount_percent: p.discount_percent });
      toast({ title: "❤️ Agregado a favoritos", description: p.name, duration: 1500 });
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist, toast]);

  const handleAddFromDetail = useCallback((product: Product, qty: number, attrs?: Record<string, string>) => {
    addToCart(toCartProduct(product), qty, attrs);
    toast({ title: "✓ Agregado", description: product.name, duration: 1500 });
  }, [addToCart, toCartProduct, toast]);

  /* ── Loading / Not found ── */
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
      <StickyTopBar
        visible={showStickyBar}
        storeName={store.store_name}
        logoUrl={store.logo_url}
        primaryColor={primaryColor}
        itemCount={itemCount}
        wishlistCount={wishlistCount}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />

      <StoreHeader
        store={store}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onInfoClick={() => setInfoOpen(true)}
        onShareClick={handleShare}
      />

      <StoreFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        primaryColor={primaryColor}
        productCount={filteredProducts.length}
        activeCategoryName={getCategoryName(activeCategory)}
      />

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
            {filteredProducts.map((p) => (
              <StoreFrontProductCard
                key={p.id}
                product={p}
                viewMode={viewMode}
                catName={getCategoryName(p.category_id)}
                finalPrice={getFinalPrice(toCartProduct(p))}
                currencySymbol={currencySymbol}
                primaryColor={primaryColor}
                isWishlisted={isInWishlist(p.id)}
                onQuickAdd={handleQuickAdd}
                onToggleWishlist={toggleWishlist}
                onOpenDetail={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingActions
        primaryColor={primaryColor}
        itemCount={itemCount}
        wishlistCount={wishlistCount}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />

      <CartPanel
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        itemCount={itemCount}
        cartTotal={cartTotal}
        primaryColor={primaryColor}
        currencySymbol={currencySymbol}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => setCheckoutOpen(true)}
      />

      <WishlistPanel
        open={wishlistOpen}
        onOpenChange={setWishlistOpen}
        items={wishlistItems}
        wishlistCount={wishlistCount}
        primaryColor={primaryColor}
        currencySymbol={currencySymbol}
        products={products}
        onOpenDetail={setSelectedProduct}
        onRemove={removeFromWishlist}
      />

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

      <ProductDetailDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        currencySymbol={currencySymbol}
        primaryColor={primaryColor}
        isWishlisted={selectedProduct ? isInWishlist(selectedProduct.id) : false}
        onToggleWishlist={(p) => toggleWishlist(p)}
        onAddToCart={handleAddFromDetail}
        getCategoryName={getCategoryName}
      />

      <StoreInfoDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        store={store}
        socialMedia={socialMedia}
      />

      <StoreFooter
        store={store}
        secondaryColor={secondaryColor}
        socialMedia={socialMedia}
      />
    </div>
  );
};

export default StoreFront;
