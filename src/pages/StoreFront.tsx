import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Search, ShoppingCart, Share2, Info, Plus, Minus, X, Loader2,
  Store as StoreIcon, Facebook, Instagram, Mail, MapPin, Phone, ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  on_sale: boolean;
  discount_percent: number | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Info modal
  const [infoOpen, setInfoOpen] = useState(false);

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

  /* ── Derived ── */
  const primaryColor = store?.primary_color || "#2a9d8f";
  const secondaryColor = store?.secondary_color || "#264653";
  const socialMedia = (store?.social_media ?? {}) as Record<string, string>;

  const filteredProducts = useMemo(() => {
    let items = [...products];
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory !== "all") items = items.filter((p) => p.category_id === activeCategory);
    switch (sortBy) {
      case "price_high": items.sort((a, b) => b.price - a.price); break;
      case "price_low": items.sort((a, b) => a.price - b.price); break;
      default: break; // newest (already sorted)
    }
    return items;
  }, [products, search, activeCategory, sortBy]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => {
    const p = i.product;
    const price = p.on_sale && p.discount_percent ? p.price * (1 - p.discount_percent / 100) : p.price;
    return sum + price * i.quantity;
  }, 0);

  const getFinalPrice = (p: Product) =>
    p.on_sale && p.discount_percent ? p.price * (1 - p.discount_percent / 100) : p.price;

  const getCategoryName = (catId: string | null) =>
    categories.find((c) => c.id === catId)?.name ?? null;

  /* ── Cart actions ── */
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ title: "Stock máximo alcanzado", variant: "destructive" });
          return prev;
        }
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast({ title: `${product.name} agregado al carrito` });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.product.id !== productId) return i;
        const newQty = i.quantity + delta;
        if (newQty <= 0) return i;
        if (newQty > i.product.stock) return i;
        return { ...i, quantity: newQty };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  /* ── Checkout ── */
  const handleCheckout = async () => {
    if (!store || cart.length === 0) return;
    if (!customerName.trim() || customerName.trim().length < 3) {
      toast({ title: "Error", description: "Ingresa tu nombre completo (min 3 caracteres)", variant: "destructive" }); return;
    }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast({ title: "Error", description: "Ingresa un email válido", variant: "destructive" }); return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 7) {
      toast({ title: "Error", description: "Ingresa un teléfono válido", variant: "destructive" }); return;
    }

    setSubmitting(true);

    const items = cart.map((i) => ({
      product_id: i.product.id,
      name: i.product.name,
      price: getFinalPrice(i.product),
      quantity: i.quantity,
    }));

    // Save order
    await supabase.from("orders").insert({
      store_id: store.id,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim(),
      items: items as any,
      total_price: cartTotal,
      status: "pending",
    });

    // Build WhatsApp message
    const itemLines = cart.map(
      (i) => `📦 ${i.product.name} x${i.quantity} — $${(getFinalPrice(i.product) * i.quantity).toFixed(2)}`
    ).join("\n");

    const msg = encodeURIComponent(
      `Hola! Me gustaría realizar el siguiente pedido:\n\n${cart.map(
        (i) => `📦 ${i.product.name} x${i.quantity}`
      ).join("\n")}\n\n💰 Total: $${cartTotal.toFixed(2)}\n\n👤 Nombre: ${customerName.trim()}\n📧 Email: ${customerEmail.trim()}\n📱 Teléfono: ${customerPhone.trim()}${customerAddress ? `\n📍 Dirección: ${customerAddress.trim()}` : ""}${customerNote ? `\n📝 Nota: ${customerNote.trim()}` : ""}`
    );

    const whatsappNumber = socialMedia?.whatsapp?.replace(/\D/g, "") || "";
    const waUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${msg}`
      : `https://wa.me/?text=${msg}`;

    setSubmitting(false);
    setCheckoutOpen(false);
    setCartOpen(false);
    setCart([]);
    setCustomerName(""); setCustomerEmail(""); setCustomerPhone("");
    setCustomerAddress(""); setCustomerNote("");

    toast({ title: "¡Pedido enviado!" });
    window.open(waUrl, "_blank");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: store?.store_name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "¡Enlace copiado!" });
    }
  };

  /* ── Loading / 404 ── */
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
    <div className="min-h-screen bg-background" style={{ "--store-primary": primaryColor, "--store-secondary": secondaryColor } as React.CSSProperties}>
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
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
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
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "text-white shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                  activeCategory === cat.id
                    ? "text-white shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((p) => {
              const catName = getCategoryName(p.category_id);
              const finalPrice = getFinalPrice(p);
              return (
                <Card key={p.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <StoreIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {p.on_sale && (
                      <Badge className="absolute left-2 top-2 bg-red-500 text-white hover:bg-red-600">¡En oferta!</Badge>
                    )}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    {catName && <Badge variant="outline" className="text-xs">{catName}</Badge>}
                    <h3 className="truncate text-base font-semibold text-foreground">{p.name}</h3>
                    <div className="flex items-baseline gap-2">
                      {p.on_sale && p.discount_percent ? (
                        <>
                          <span className="text-xl font-bold" style={{ color: "#e63946" }}>${finalPrice.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground line-through">${p.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold" style={{ color: primaryColor }}>${p.price.toFixed(2)}</span>
                      )}
                    </div>
                    <p className={`text-xs ${p.stock < 5 ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                      Stock: {p.stock} unidades
                    </p>
                    <Button
                      className="w-full gap-2 text-white transition-transform group-hover:scale-[1.02]"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => addToCart(p)}
                    >
                      <ShoppingCart className="h-4 w-4" /> Agregar al carrito
                    </Button>
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
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
            {cartCount}
          </span>
        )}
      </button>

      {/* ── CART PANEL ── */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Tu carrito ({cartCount})
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
                {cart.map((item) => {
                  const price = getFinalPrice(item.product);
                  return (
                    <div key={item.product.id} className="flex gap-3 rounded-lg border p-3">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                          <StoreIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded border text-foreground hover:bg-accent"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border text-foreground hover:bg-accent"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="self-start text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span style={{ color: primaryColor }}>${cartTotal.toFixed(2)}</span>
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
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Completar pedido</DialogTitle>
            <DialogDescription>Ingresa tus datos para enviar el pedido por WhatsApp</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cust-name">Nombre completo *</Label>
              <Input id="cust-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tu nombre completo" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cust-email">Email *</Label>
              <Input id="cust-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="tu@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cust-phone">Teléfono *</Label>
              <Input id="cust-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+591 12345678" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cust-address">Dirección (opcional)</Label>
              <Input id="cust-address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Tu dirección de entrega" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cust-note">Nota de pedido (opcional)</Label>
              <Textarea id="cust-note" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="Instrucciones especiales..." className="mt-1.5" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCheckout}
              disabled={submitting}
              className="gap-2 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar y enviar a WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── INFO MODAL ── */}
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
          {/* Social */}
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

          {/* Info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/90">Información</h4>
            {store.description && <p className="text-sm text-white/60">{store.description}</p>}
            {store.email && <p className="mt-2 text-sm text-white/60">{store.email}</p>}
            {store.address && <p className="mt-1 text-sm text-white/60">{store.address}</p>}
          </div>

          {/* Copyright */}
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
