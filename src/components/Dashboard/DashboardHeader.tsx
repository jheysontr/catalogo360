import { Button } from "@/components/ui/button";
import { Menu, Eye, QrCode, Settings, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import SalesCalculator from "@/components/SalesCalculator";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";

interface DashboardHeaderProps {
  userName: string;
  storeId?: string;
  storeSlug?: string;
  currency?: string;
  onOpenSidebar: () => void;
  onOpenQR: () => void;
  onNavigateToOrders: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

const DashboardHeader = ({
  userName,
  storeId,
  storeSlug,
  currency,
  onOpenSidebar,
  onOpenQR,
  onNavigateToOrders,
  onNavigateToSettings,
  onLogout,
}: DashboardHeaderProps) => (
  <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-card/80 px-3 backdrop-blur-lg sm:h-16 sm:gap-4 sm:px-6">
    <button className="lg:hidden" onClick={onOpenSidebar}>
      <Menu className="h-5 w-5" />
    </button>
    <div className="flex-1 min-w-0">
      <p className="truncate text-sm text-muted-foreground">
        Hola, <span className="font-semibold text-foreground">{userName}</span> 👋
      </p>
    </div>
    <div className="hidden sm:block">
      <SalesCalculator />
    </div>
    {storeSlug && (
      <>
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
          <a href={`/${storeSlug}`} target="_blank" rel="noopener noreferrer">
            <Eye className="h-4 w-4 mr-2" />
            Ver tienda
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={onOpenQR}>
          <QrCode className="h-4 w-4" />
        </Button>
      </>
    )}
    {storeId && currency && (
      <NotificationPanel
        storeId={storeId}
        currency={currency}
        onNavigateToOrders={onNavigateToOrders}
      />
    )}
    <ThemeToggle />
    <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={onNavigateToSettings}>
      <Settings className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={onLogout}>
      <LogOut className="h-4 w-4" />
    </Button>
  </header>
);

export default DashboardHeader;
