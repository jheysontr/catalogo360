import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Package, Store, ShoppingCart, BarChart3, CreditCard, Settings,
  ExternalLink, Plus, Eye, Menu, X, LogOut, ChevronRight, FolderOpen, Ticket,
  Truck, Settings2, Link2,
} from "lucide-react";
import Products from "@/pages/Dashboard/Products";
import StoreSettings from "@/pages/Dashboard/StoreSettings";
import Orders from "@/pages/Dashboard/Orders";
import Plans from "@/pages/Dashboard/Plans";
import Analytics from "@/pages/Dashboard/Analytics";
import Categories from "@/pages/Dashboard/Categories";
import Coupons from "@/pages/Dashboard/Coupons";
import ShippingConfig from "@/pages/Dashboard/ShippingConfig";
import Shipments from "@/pages/Dashboard/Shipments";
import Linkbox from "@/pages/Dashboard/Linkbox";

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
}

const sidebarLinks = [
  { label: "Mi Tienda", icon: Store, id: "store" },
  { label: "Productos", icon: Package, id: "products" },
  { label: "Categorías", icon: FolderOpen, id: "categories" },
  { label: "Cupones", icon: Ticket, id: "coupons" },
  { label: "Órdenes", icon: ShoppingCart, id: "orders" },
  { label: "Envíos", icon: Truck, id: "shipments" },
  { label: "Config. Envíos", icon: Settings2, id: "shipping-config" },
  { label: "Linkbox", icon: Link2, id: "linkbox" },
  { label: "Estadísticas", icon: BarChart3, id: "stats" },
  { label: "Planes", icon: CreditCard, id: "plans" },
  { label: "Configuración", icon: Settings, id: "settings" },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("store");
  const [store, setStore] = useState<StoreData | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [lastOrder, setLastOrder] = useState<{ customer_name: string; items: any } | null>(null);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: stores } = await supabase
        .from("stores")
        .select("id, store_name, store_slug")
        .eq("user_id", user.id)
        .limit(1);

      if (stores && stores.length > 0) {
        const s = stores[0];
        setStore(s);

        const { count: pCount } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("store_id", s.id);
        setProductCount(pCount ?? 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: orders, count: oCount } = await supabase
          .from("orders")
          .select("customer_name, items", { count: "exact" })
          .eq("store_id", s.id)
          .gte("created_at", today.toISOString())
          .order("created_at", { ascending: false })
          .limit(1);
        setOrderCount(oCount ?? 0);
        if (orders && orders.length > 0) setLastOrder(orders[0]);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const maxProducts = 60;

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">CatalogHub</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { setActiveSection(link.id); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeSection === link.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 px-6 backdrop-blur-lg">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Hola, <span className="font-semibold text-foreground">{userName}</span> 👋
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setActiveSection("settings")}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {activeSection === "products" ? (
            <Products />
          ) : activeSection === "categories" ? (
            <Categories />
          ) : activeSection === "coupons" ? (
            <Coupons />
          ) : activeSection === "shipments" ? (
            <Shipments />
          ) : activeSection === "shipping-config" ? (
            <ShippingConfig />
          ) : activeSection === "linkbox" ? (
            <Linkbox />
          ) : activeSection === "settings" ? (
            <StoreSettings />
          ) : activeSection === "orders" ? (
            <Orders />
          ) : activeSection === "plans" ? (
            <Plans />
          ) : activeSection === "stats" ? (
            <Analytics />
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">Mi Tienda</h1>
              <p className="mt-1 text-sm text-muted-foreground">Resumen general de tu negocio</p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Tienda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold text-foreground">{store?.store_name ?? "Cargando..."}</p>
                      <p className="text-xs text-muted-foreground">gocatalog.com/{store?.store_slug ?? "..."}</p>
                    </div>
                    <div className="flex gap-2">
                      {store && (
                        <Button asChild size="sm" variant="outline" className="gap-1.5">
                          <a href={`/store/${store.store_slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3.5 w-3.5" /> Ver mi tienda
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setActiveSection("settings")}>
                        <Settings className="h-3.5 w-3.5" /> Personalizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Package className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-base">Productos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-3xl font-bold text-foreground">{productCount}</p>
                    <p className="text-xs text-muted-foreground">productos subidos</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1.5" onClick={() => setActiveSection("products")}>
                        <Plus className="h-3.5 w-3.5" /> Agregar producto
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setActiveSection("products")}>
                        Administrar <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Órdenes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-3xl font-bold text-foreground">{orderCount}</p>
                    <p className="text-xs text-muted-foreground">órdenes recibidas hoy</p>
                    {lastOrder && (
                      <p className="text-xs text-muted-foreground">
                        Última: <span className="font-medium text-foreground">{lastOrder.customer_name}</span>
                      </p>
                    )}
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setActiveSection("orders")}>
                      Ver todas las órdenes <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <CreditCard className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-base">Plan Actual</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-semibold text-foreground">Estándar</p>
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Productos: {productCount}/{maxProducts}</span>
                        <span>{Math.round((productCount / maxProducts) * 100)}%</span>
                      </div>
                      <Progress value={(productCount / maxProducts) * 100} className="mt-1.5 h-2" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setActiveSection("plans")}>
                        Cambiar plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
