import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, AlertTriangle, Rocket } from "lucide-react";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useDashboardStore } from "@/hooks/useDashboardStore";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import QRDialog from "@/components/Dashboard/QRDialog";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import SetupWizard from "@/components/Dashboard/SetupWizard";
import { Button } from "@/components/ui/button";

// Lazy-loaded dashboard pages
const Products = lazy(() => import("@/pages/Dashboard/Products"));
const StoreSettings = lazy(() => import("@/pages/Dashboard/StoreSettings"));
const Orders = lazy(() => import("@/pages/Dashboard/Orders"));
const Plans = lazy(() => import("@/pages/Dashboard/Plans"));
const Analytics = lazy(() => import("@/pages/Dashboard/Analytics"));
const Categories = lazy(() => import("@/pages/Dashboard/Categories"));
const Coupons = lazy(() => import("@/pages/Dashboard/Coupons"));
const ShippingConfig = lazy(() => import("@/pages/Dashboard/ShippingConfig"));
const Linkbox = lazy(() => import("@/pages/Dashboard/Linkbox"));
const PaymentMethods = lazy(() => import("@/pages/Dashboard/PaymentMethods"));
const DashboardHome = lazy(() => import("@/pages/Dashboard/DashboardHome"));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const SECTION_MAP: Record<string, React.FC<any>> = {
  products: Products,
  categories: Categories,
  coupons: Coupons,
  shipments: ShippingConfig,
  linkbox: Linkbox,
  payment_methods: PaymentMethods,
  settings: StoreSettings,
  orders: Orders,
  plans: Plans,
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("store");
  const [qrOpen, setQrOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const {
    store,
    productCount,
    pendingOrderCount,
    lowStockCount,
    activeCouponCount,
    enabledModules,
  } = useDashboardStore();

  useRealtimeOrders(store?.id ?? null);
  const { isAdmin } = useAdminCheck();

  const setupPending = store ? !store.setup_completed : false;

  // Show wizard on first load if setup not completed
  useEffect(() => {
    if (setupPending) {
      setShowWizard(true);
    }
  }, [setupPending]);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

  const badgeCounts: Record<string, number> = {
    orders: pendingOrderCount,
    products: lowStockCount,
    coupons: activeCouponCount,
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const renderSection = () => {
    if (activeSection === "stats") {
      return <Analytics currency={store?.currency} />;
    }

    const Component = SECTION_MAP[activeSection];
    if (Component) return <Component />;

    if (store) {
      return (
        <DashboardHome
          storeId={store.id}
          storeName={store.store_name}
          storeSlug={store.store_slug}
          productCount={productCount}
          currency={store.currency}
          onNavigate={setActiveSection}
        />
      );
    }

    return <SectionLoader />;
  };

  if (showWizard && store) {
    return (
      <SetupWizard
        storeId={store.id}
        storeName={store.store_name}
        storeSlug={store.store_slug}
        onComplete={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/20">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        storeSlug={store?.store_slug}
        isAdmin={isAdmin}
        enabledModules={enabledModules}
        badgeCounts={badgeCounts}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 flex-col">
        <DashboardHeader
          userName={userName}
          storeId={store?.id}
          storeSlug={store?.store_slug}
          currency={store?.currency}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenQR={() => setQrOpen(true)}
          onNavigateToOrders={() => setActiveSection("orders")}
          onNavigateToSettings={() => setActiveSection("settings")}
          onLogout={handleLogout}
        />

          {setupPending && !showWizard && (
            <div className="mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-6 lg:mt-8 mb-0 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">Configuración pendiente</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Tu tienda no estará visible hasta completar la configuración inicial.</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowWizard(true)} className="gap-1.5 shrink-0">
                <Rocket className="h-4 w-4" /> Completar configuración
              </Button>
            </div>
          )}

          <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <SectionErrorBoundary section={activeSection} key={activeSection}>
            <Suspense fallback={<SectionLoader />}>
              {renderSection()}
            </Suspense>
          </SectionErrorBoundary>
        </main>
      </div>

      <QRDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        storeName={store?.store_name}
        storeSlug={store?.store_slug}
      />
    </div>
  );
};

export default Dashboard;
