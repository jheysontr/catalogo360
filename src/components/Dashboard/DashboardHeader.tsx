import { Button } from "@/components/ui/button";
import { Menu, Eye, QrCode, Settings, LogOut, Search } from "lucide-react";
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
}: DashboardHeaderProps) => {
  const initial = userName?.charAt(0)?.toUpperCase() || "C";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-card/85 px-3 backdrop-blur-xl sm:h-16 sm:gap-3 sm:px-6">
      <button
        className="rounded-lg p-2 hover:bg-accent lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search pill — desktop */}
      <div className="hidden md:flex items-center gap-2 rounded-full bg-muted/70 px-4 py-2 w-72 lg:w-96">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Buscar pedidos, productos…"
          className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Mobile greeting */}
      <div className="flex-1 min-w-0 md:hidden">
        <p className="truncate text-sm text-muted-foreground">
          Hola, <span className="font-semibold text-foreground">{userName}</span> 👋
        </p>
      </div>

      <div className="flex-1 hidden md:block" />

      <div className="hidden sm:block">
        <SalesCalculator />
      </div>

      {storeSlug && (
        <>
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex rounded-full">
            <a href={`/${storeSlug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Ver tienda
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onOpenQR}
            aria-label="Código QR"
          >
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

      {/* Avatar group */}
      <div className="hidden sm:flex items-center gap-2.5 pl-3 ml-1 border-l border-border/60">
        <div className="text-right leading-tight max-w-[140px]">
          <p className="text-xs font-bold text-foreground truncate">{userName}</p>
          <p className="text-[10px] text-muted-foreground">Mi panel</p>
        </div>
        <button
          onClick={onNavigateToSettings}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm ring-2 ring-primary/15 hover:ring-primary/30 transition-all"
          aria-label="Ajustes"
        >
          {initial}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={onLogout}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
