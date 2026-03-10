import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Search, ShoppingCart, Heart, Info, Share2, Store as StoreIcon,
  Grid3X3, List, ArrowLeft, ArrowRight, Star, Package, X,
  Facebook, Instagram, ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ── Mock Data ── */
const STORE = {
  store_name: "Moda Latina",
  description: "Ropa, accesorios y tendencias para emprendedores modernos 🇧🇴",
  primary_color: "#2a9d8f",
  secondary_color: "#264653",
  banner_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
  logo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center",
  currency: "BOB",
  email: "hola@modalatina.com",
  social_media: { instagram: "#", facebook: "#" },
};

const CATEGORIES = [
  { id: "all", name: "Todos", icon: null },
  { id: "cat-1", name: "Ropa", icon: "👕" },
  { id: "cat-2", name: "Accesorios", icon: "👜" },
  { id: "cat-3", name: "Calzado", icon: "👟" },
  { id: "cat-4", name: "Ofertas", icon: "🔥" },
];

const PRODUCTS = [
  { id: "1", name: "Blusa Elegante Rosa", description: "Blusa manga larga en tela premium, ideal para cualquier ocasión.", price: 189, stock: 12, image_url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500&h=500&fit=crop", on_sale: false, discount_percent: null, category_id: "cat-1" },
  { id: "2", name: "Bolso Crossbody Negro", description: "Bolso de cuero sintético con correa ajustable.", price: 149, stock: 8, image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop", on_sale: true, discount_percent: 20, category_id: "cat-2" },
  { id: "3", name: "Sneakers Urban White", description: "Zapatillas blancas con suela de goma reforzada.", price: 299, stock: 3, image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop", on_sale: false, discount_percent: null, category_id: "cat-3" },
  { id: "4", name: "Vestido Floral Verano", description: "Vestido midi con estampado floral, perfecto para el verano.", price: 259, stock: 15, image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop", on_sale: true, discount_percent: 15, category_id: "cat-1" },
  { id: "5", name: "Gafas de Sol Premium", description: "Lentes polarizados con montura metálica dorada.", price: 129, stock: 20, image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop", on_sale: false, discount_percent: null, category_id: "cat-2" },
  { id: "6", name: "Jeans Slim Fit", description: "Jean stretch de corte slim, disponible en azul oscuro.", price: 219, stock: 2, image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop", on_sale: true, discount_percent: 30, category_id: "cat-4" },
  { id: "7", name: "Reloj Minimalista", description: "Reloj analógico con correa de cuero genuino.", price: 350, stock: 6, image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop", on_sale: false, discount_percent: null, category_id: "cat-2" },
  { id: "8", name: "Camiseta Oversize Beige", description: "Camiseta de algodón 100% con corte oversize.", price: 99, stock: 25, image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop", on_sale: false, discount_percent: null, category_id: "cat-1" },
  { id: "9", name: "Sandalias Plataforma", description: "Sandalias con plataforma de 5cm, correa al tobillo.", price: 179, stock: 4, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop", on_sale: true, discount_percent: 25, category_id: "cat-4" },
  { id: "10", name: "Chaqueta Denim", description: "Chaqueta de mezclilla clásica con botones metálicos.", price: 289, stock: 7, image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop", on_sale: false, discount_percent: null, category_id: "cat-1" },
  { id: "11", name: "Aretes Dorados", description: "Aretes colgantes bañados en oro de 18k.", price: 89, stock: 30, image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop", on_sale: false, discount_percent: null, category_id: "cat-2" },
  { id: "12", name: "Botas Chelsea", description: "Botas chelsea de cuero con elástico lateral.", price: 399, stock: 1, image_url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=500&fit=crop", on_sale: true, discount_percent: 10, category_id: "cat-4" },
].map(p => ({ ...p, extra_images: [], attributes: [], variant_stock: {}, variant_prices: {} }));

const getFinalPrice = (p: typeof PRODUCTS[0]) =>
  p.on_sale && p.discount_percent ? p.price * (1 - p.discount_percent / 100) : p.price;

/* ── Components ── */

const DemoBanner = () => (
  <div className="bg-primary py-2.5 text-center">
    <p className="container text-sm font-semibold text-primary-foreground">
      🎯 Esta es una tienda demo — <Link to="/register" className="underline underline-offset-2">Crea la tuya gratis</Link>
    </p>
  </div>
);

const DemoProductCard = ({
  product: p,
  primaryColor,
  onAdd,
}: {
  product: typeof PRODUCTS[0];
  primaryColor: string;
  onAdd: (p: typeof PRODUCTS[0]) => void;
}) => {
  const finalPrice = getFinalPrice(p);
  const catName = CATEGORIES.find(c => c.id === p.category_id)?.name ?? null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <img
          src={p.image_url!}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {p.on_sale && p.discount_percent && (
          <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5">
            <span className="inline-flex items-center rounded-lg bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground shadow-sm sm:text-xs">
              -{p.discount_percent}%
            </span>
          </div>
        )}
        {p.stock < 5 && (
          <div className="absolute left-2 sm:left-2.5" style={{ top: p.on_sale && p.discount_percent ? '2.25rem' : '0.5rem' }}>
            <span className="inline-flex items-center rounded-lg bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm sm:text-[10px]">
              ¡Quedan {p.stock}!
            </span>
          </div>
        )}
        <button className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-muted-foreground shadow-md transition-all duration-200 hover:scale-110 hover:bg-white">
          <Heart className="h-4 w-4" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-2.5 transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(p); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:brightness-110 sm:text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingCart className="h-4 w-4" />
            Agregar al carrito
          </button>
        </div>
      </div>
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
              <span className="text-base font-bold text-destructive sm:text-lg">Bs{finalPrice.toFixed(2)}</span>
              <span className="text-[11px] text-muted-foreground line-through sm:text-xs">Bs{p.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-base font-bold sm:text-lg" style={{ color: primaryColor }}>Bs{p.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Demo Page ── */
const Demo = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "all" || p.category_id === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleAdd = useCallback((p: typeof PRODUCTS[0]) => {
    setCartCount(c => c + 1);
    toast({ title: "Producto agregado 🛒", description: `${p.name} añadido al carrito.` });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />

      {/* ── Header / Banner ── */}
      <div className="relative">
        <div
          className="h-44 w-full bg-cover bg-center sm:h-56 md:h-64"
          style={{
            backgroundColor: STORE.secondary_color,
            backgroundImage: `url(${STORE.banner_url})`,
          }}
        />
        <div className="container relative -mt-12 flex flex-col items-center gap-3 px-4 sm:-mt-14 sm:flex-row sm:items-end sm:gap-5">
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-background shadow-lg sm:h-28 sm:w-28"
            style={{ backgroundColor: STORE.primary_color }}
          >
            <img src={STORE.logo_url} alt={STORE.store_name} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-1.5 pb-2 sm:items-start">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{STORE.store_name}</h1>
            <p className="max-w-lg text-center text-sm text-muted-foreground sm:text-left">{STORE.description}</p>
          </div>
          <div className="flex gap-2 pb-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Info className="h-4 w-4" /> <span className="hidden sm:inline">Información</span><span className="sm:hidden">Info</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Compartir</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="container mt-8 px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? "text-white shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
                style={activeCategory === cat.id ? { backgroundColor: STORE.primary_color } : undefined}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filteredProducts.length} productos</p>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="container px-4 pb-20 pt-6">
        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
              {filteredProducts.map(p => (
                <DemoProductCard
                  key={p.id}
                  product={p}
                  primaryColor={STORE.primary_color}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </AnimatePresence>
        </LayoutGroup>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-lg font-semibold text-foreground">No se encontraron productos</p>
            <p className="text-sm text-muted-foreground">Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>

      {/* ── Floating Cart Button ── */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <button
            className="flex items-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-xl transition-transform hover:scale-105"
            style={{ backgroundColor: STORE.primary_color }}
          >
            <ShoppingCart className="h-5 w-5" />
            Ver carrito ({cartCount})
          </button>
        </motion.div>
      )}

      {/* ── CTA to register ── */}
      <section className="border-t bg-accent/30 py-12">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            ¿Te gusta lo que ves?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Crea tu propia tienda como esta en menos de 5 minutos. Gratis, sin tarjeta de crédito.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-12 gap-2 px-8 font-bold shadow-lg shadow-primary/25">
              <Link to="/register">Crear mi tienda Gratis <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 gap-2 px-8">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" /> Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: STORE.secondary_color }}>
        <div className="container px-4 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/90">{STORE.store_name}</h4>
              <p className="max-w-xs text-sm text-white/60">{STORE.description}</p>
              <p className="text-sm text-white/60">{STORE.email}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/90">Redes Sociales</h4>
              <div className="flex gap-3">
                <span className="text-white/60 hover:text-white transition-colors cursor-pointer"><Facebook className="h-5 w-5" /></span>
                <span className="text-white/60 hover:text-white transition-colors cursor-pointer"><Instagram className="h-5 w-5" /></span>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-white/40">© {new Date().getFullYear()} {STORE.store_name}. Tienda demo.</p>
            <p className="text-xs text-white/40">
              Creada con <Link to="/" className="text-white/60 underline hover:text-white">Catalogo360</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Demo;
