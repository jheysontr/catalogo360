import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Package, Store, ShoppingCart, BarChart3, CreditCard, Settings,
  ExternalLink, Plus, Eye, Menu, X, LogOut, ChevronRight, FolderOpen, Ticket,
  Truck, Link2, Users, QrCode, Download, Wallet, Loader2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Shield } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SalesCalculator from "@/components/SalesCalculator";
import Products from "@/pages/Dashboard/Products";
import StoreSettings from "@/pages/Dashboard/StoreSettings";
import Orders from "@/pages/Dashboard/Orders";
import Plans from "@/pages/Dashboard/Plans";
import Analytics from "@/pages/Dashboard/Analytics";
import Categories from "@/pages/Dashboard/Categories";
import Coupons from "@/pages/Dashboard/Coupons";

import ShippingConfig from "@/pages/Dashboard/ShippingConfig";
import Linkbox from "@/pages/Dashboard/Linkbox";
import Referrals from "@/pages/Dashboard/Referrals";
import PaymentMethods from "@/pages/Dashboard/PaymentMethods";
import DashboardHome from "@/pages/Dashboard/DashboardHome";

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  plan_id: string | null;
}

const MODULE_SIDEBAR_MAP: Record<string, string> = {
  linkbox: "linkbox",
  referrals: "referrals",
  coupons: "coupons",
  shipments: "shipments",
  analytics: "stats",
};

type SidebarItem =
  | { type: "link"; label: string; icon: any; id: string }
  | { type: "group"; label: string };

const sidebarLinks: SidebarItem[] = [
  { type: "link", label: "Inicio", icon: Store, id: "store" },

  { type: "group", label: "Catálogo" },
  { type: "link", label: "Productos", icon: Package, id: "products" },
  { type: "link", label: "Categorías", icon: FolderOpen, id: "categories" },

  { type: "group", label: "Ventas" },
  { type: "link", label: "Órdenes", icon: ShoppingCart, id: "orders" },

  { type: "group", label: "Marketing" },
  { type: "link", label: "Cupones", icon: Ticket, id: "coupons" },
  { type: "link", label: "Referencias", icon: Users, id: "referrals" },
  { type: "link", label: "Linkbox", icon: Link2, id: "linkbox" },

  { type: "group", label: "Configuración" },
  { type: "link", label: "Zonas de Envío", icon: Truck, id: "shipments" },
  { type: "link", label: "Métodos de Pago", icon: Wallet, id: "payment_methods" },
  { type: "link", label: "Estadísticas", icon: BarChart3, id: "stats" },
  { type: "link", label: "Planes", icon: CreditCard, id: "plans" },
  { type: "link", label: "Ajustes", icon: Settings, id: "settings" },
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
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [qrOpen, setQrOpen] = useState(false);

  // Realtime notifications
  useRealtimeOrders(store?.id ?? null);
  const { isAdmin } = useAdminCheck();


  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: stores } = await supabase
        .from("stores")
        .select("id, store_name, store_slug, plan_id")
        .eq("user_id", user.id)
        .limit(1);

      if (stores && stores.length > 0) {
        const s = stores[0];
        setStore(s);

        // Fetch plan enabled_modules
        if (s.plan_id) {
          const { data: planData } = await supabase
            .from("pricing_plans")
            .select("enabled_modules")
            .eq("id", s.plan_id)
            .single();
          if (planData?.enabled_modules && typeof planData.enabled_modules === "object") {
            setEnabledModules(planData.enabled_modules as Record<string, boolean>);
          }
        }

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
          <span className="font-display text-lg font-bold text-foreground">Catalogo360</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarLinks.map((item, idx) => {
            if (item.type === "group") {
              return (
                <p key={idx} className="mt-5 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {item.label}
                </p>
              );
            }

            const link = item;
            const moduleKey = Object.entries(MODULE_SIDEBAR_MAP).find(([, sid]) => sid === link.id)?.[0];
            const isLocked = moduleKey ? enabledModules[moduleKey] !== true : false;

            return (
              <button
                key={link.id}
                onClick={() => {
                  if (isLocked) {
                    setActiveSection("plans");
                  } else {
                    setActiveSection(link.id);
                  }
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isLocked
                    ? "text-muted-foreground/50 hover:bg-accent/50"
                    : activeSection === link.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{link.label}</span>
                {isLocked && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t p-4 space-y-1">
          {store && (
            <Link
              to={`/store/${store.store_slug}`}
              target="_blank"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
              Ver tienda
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Shield className="h-4 w-4" />
              Panel Admin
            </Link>
          )}
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
         <SalesCalculator />
          {store && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/store/${store.store_slug}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver tienda
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setQrOpen(true)}>
                <QrCode className="h-4 w-4" />
              </Button>
            </>
          )}
          <ThemeToggle />
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
            <ShippingConfig />
          ) : activeSection === "linkbox" ? (
            <Linkbox />
          ) : activeSection === "referrals" ? (
            <Referrals />
          ) : activeSection === "payment_methods" ? (
            <PaymentMethods />
          ) : activeSection === "settings" ? (
            <StoreSettings />
          ) : activeSection === "orders" ? (
            <Orders />
          ) : activeSection === "plans" ? (
            <Plans />
          ) : activeSection === "stats" ? (
            <Analytics />
          ) : store ? (
            <DashboardHome
              storeId={store.id}
              storeName={store.store_name}
              storeSlug={store.store_slug}
              productCount={productCount}
              onNavigate={(section) => setActiveSection(section)}
            />
          ) : (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </main>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{store?.store_name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div id="dashboard-qr-container" className="rounded-xl border bg-white p-4">
              <QRCodeSVG
                value={`${window.location.origin}/store/${store?.store_slug}`}
                size={200}
                level="H"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center break-all">
              {window.location.origin}/store/{store?.store_slug}
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                const svg = document.querySelector("#dashboard-qr-container svg") as SVGSVGElement;
                if (!svg) return;
                const serializer = new XMLSerializer();
                const svgStr = serializer.serializeToString(svg);
                const canvas = document.createElement("canvas");
                canvas.width = 400; canvas.height = 400;
                const ctx = canvas.getContext("2d")!;
                const img = new Image();
                img.onload = () => {
                  ctx.fillStyle = "#fff";
                  ctx.fillRect(0, 0, 400, 400);
                  ctx.drawImage(img, 0, 0, 400, 400);
                  const a = document.createElement("a");
                  a.download = `${store?.store_slug}-qr.png`;
                  a.href = canvas.toDataURL("image/png");
                  a.click();
                };
                img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
