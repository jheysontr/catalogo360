import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Store as StoreIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useCart, getFinalPrice } from "@/lib/CartContext";
import { getCurrencySymbol } from "@/lib/currency";
import { useWishlist } from "@/lib/WishlistContext";
import type { StoreData, Product, ProductAttribute, Category } from "@/components/StoreFront/types";
import StickyTopBar from "@/components/StoreFront/StickyTopBar";
import StoreHeader from "@/components/StoreFront/StoreHeader";
import StoreFilters from "@/components/StoreFront/StoreFilters";
import StoreFrontProductCard from "@/components/StoreFront/StoreFrontProductCard";
import FloatingActions from "@/components/StoreFront/FloatingActions";
import ProductSkeleton from "@/components/StoreFront/ProductSkeleton";
import StoreFooter from "@/components/StoreFront/StoreFooter";
import AppStoreHeader from "@/components/StoreFront/AppTemplate/AppStoreHeader";
import AppHeroBanner from "@/components/StoreFront/AppTemplate/AppHeroBanner";
import AppCategoryPills from "@/components/StoreFront/AppTemplate/AppCategoryPills";
import AppProductCard from "@/components/StoreFront/AppTemplate/AppProductCard";
import AppSortBar from "@/components/StoreFront/AppTemplate/AppSortBar";
import { getTheme } from "@/components/StoreFront/AppTemplate/templateThemes";

/* Lazy-load heavy dialogs/panels (not needed on initial render) */
const CartPanel = lazy(() => import("@/components/StoreFront/CartPanel"));
const WishlistPanel = lazy(() => import("@/components/StoreFront/WishlistPanel"));
const ProductDetailDialog = lazy(() => import("@/components/StoreFront/ProductDetailDialog"));
const StoreInfoDialog = lazy(() => import("@/components/StoreFront/StoreInfoDialog"));
const CartModal = lazy(() => import("@/components/Cart/CartModal"));

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
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

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
  const storefrontConfig = (store as any)?.storefront_config as Record<string, any> | null;
  const template = storefrontConfig?.template || "classic";
  const theme = getTheme(template);

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

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage),
    [filteredProducts, currentPage, perPage]
  );

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, activeCategory, sortBy, perPage]);

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

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-44 w-full sm:h-56 md:h-64" />
        <div className="container px-4">
          <div className="relative -mt-12 flex flex-col items-center gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
            <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
            <div className="flex-1 space-y-2 pb-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-[130px] rounded-md" />
          </div>
          <div className="mt-4">
            <ProductSkeleton viewMode="grid" count={6} />
          </div>
        </div>
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

  const isAppTemplate = template !== "classic";

  /* ── Pagination component (shared) ── */
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-8 flex items-center justify-center gap-1.5">
        <button
          onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 300, behavior: "smooth" }); }}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent"
        >←</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            if (totalPages <= 7) return true;
            if (page === 1 || page === totalPages) return true;
            return Math.abs(page - currentPage) <= 1;
          })
          .reduce<(number | "...")[]>((acc, page, idx, arr) => {
            if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push("...");
            acc.push(page);
            return acc;
          }, [])
          .map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">…</span>
            ) : (
              <button
                key={page}
                onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page ? "text-white shadow-sm" : "border hover:bg-accent"
                }`}
                style={currentPage === page ? { backgroundColor: primaryColor } : undefined}
              >{page}</button>
            )
          )}
        <button
          onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 300, behavior: "smooth" }); }}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent"
        >→</button>
      </div>
    );
  };

  /* ── Empty state (shared) ── */
  const renderEmpty = () => (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <Search className="h-12 w-12 text-muted-foreground/30" />
      <p className="text-lg font-medium text-foreground">No se encontraron productos</p>
      <p className="text-sm text-muted-foreground">Intenta con otra búsqueda o categoría</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {isAppTemplate ? (
        <>
          {/* ── APP TEMPLATE ── */}
          <AppStoreHeader
            store={store}
            primaryColor={primaryColor}
            search={search}
            onSearchChange={setSearch}
            itemCount={itemCount}
            wishlistCount={wishlistCount}
            onCartOpen={() => setCartOpen(true)}
            onWishlistOpen={() => setWishlistOpen(true)}
            onInfoClick={() => setInfoOpen(true)}
          />

          <AppHeroBanner store={store} primaryColor={primaryColor} theme={theme} />

          <AppCategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            primaryColor={primaryColor}
            theme={theme}
          />

          <AppSortBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            productCount={filteredProducts.length}
            activeCategoryName={getCategoryName(activeCategory)}
            activeCategory={activeCategory}
            perPage={perPage}
            onPerPageChange={setPerPage}
          />

          <div className="container px-4 pb-8 pt-4">
            {filteredProducts.length === 0 ? renderEmpty() : (
              <>
                <LayoutGroup>
                  <motion.div
                    layout
                    className={viewMode === "grid"
                      ? `grid ${theme.gridCols} ${theme.gridGap}`
                      : "flex flex-col gap-3"
                    }
                  >
                    <AnimatePresence mode="popLayout">
                      {paginatedProducts.map((p) =>
                        viewMode === "list" ? (
                          <StoreFrontProductCard
                            key={p.id}
                            product={p}
                            viewMode="list"
                            catName={getCategoryName(p.category_id)}
                            finalPrice={getFinalPrice(toCartProduct(p))}
                            currencySymbol={currencySymbol}
                            primaryColor={primaryColor}
                            isWishlisted={isInWishlist(p.id)}
                            onQuickAdd={handleQuickAdd}
                            onToggleWishlist={toggleWishlist}
                            onOpenDetail={setSelectedProduct}
                          />
                        ) : (
                          <AppProductCard
                            key={p.id}
                            product={p}
                            finalPrice={getFinalPrice(toCartProduct(p))}
                            currencySymbol={currencySymbol}
                            primaryColor={primaryColor}
                            isWishlisted={isInWishlist(p.id)}
                            onQuickAdd={handleQuickAdd}
                            onToggleWishlist={toggleWishlist}
                            onOpenDetail={setSelectedProduct}
                            theme={theme}
                            catName={getCategoryName(p.category_id)}
                          />
                        )
                      )}
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>
                {renderPagination()}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* ── CLASSIC TEMPLATE ── */}
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
            perPage={perPage}
            onPerPageChange={setPerPage}
          />

          <div className="container px-4 pb-8 pt-4">
            {filteredProducts.length === 0 ? renderEmpty() : (
              <>
                <LayoutGroup>
                  <motion.div
                    layout
                    className={viewMode === "grid" ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"}
                  >
                    <AnimatePresence mode="popLayout">
                      {paginatedProducts.map((p) => (
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
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>
                {renderPagination()}
              </>
            )}
          </div>
        </>
      )}

      <FloatingActions
        primaryColor={primaryColor}
        itemCount={itemCount}
        wishlistCount={wishlistCount}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />

      <Suspense fallback={null}>
        {cartOpen && (
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
        )}

        {wishlistOpen && (
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
        )}

        {checkoutOpen && (
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
        )}

        {selectedProduct && (
          <ProductDetailDialog
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            currencySymbol={currencySymbol}
            primaryColor={primaryColor}
            isWishlisted={isInWishlist(selectedProduct.id)}
            onToggleWishlist={(p) => toggleWishlist(p)}
            onAddToCart={handleAddFromDetail}
            getCategoryName={getCategoryName}
          />
        )}

        {infoOpen && (
          <StoreInfoDialog
            open={infoOpen}
            onOpenChange={setInfoOpen}
            store={store}
            socialMedia={socialMedia}
          />
        )}
      </Suspense>

      <StoreFooter
        store={store}
        secondaryColor={secondaryColor}
        socialMedia={socialMedia}
      />
    </div>
  );
};

export default StoreFront;
