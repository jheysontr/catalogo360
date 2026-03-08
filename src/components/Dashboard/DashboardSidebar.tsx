import { Link, useNavigate } from "react-router-dom";
import {
  Package, Store, ShoppingCart, BarChart3, CreditCard, Settings,
  ExternalLink, Eye, X, LogOut, FolderOpen, Ticket,
  Truck, Link2, Wallet, Shield,
} from "lucide-react";

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
  { type: "link", label: "Estadísticas", icon: BarChart3, id: "stats" },
  { type: "group", label: "Marketing" },
  { type: "link", label: "Cupones", icon: Ticket, id: "coupons" },
  { type: "link", label: "Linkbox", icon: Link2, id: "linkbox" },
  { type: "group", label: "Tienda" },
  { type: "link", label: "Zonas de Envío", icon: Truck, id: "shipments" },
  { type: "link", label: "Métodos de Pago", icon: Wallet, id: "payment_methods" },
  { type: "link", label: "Planes", icon: CreditCard, id: "plans" },
  { type: "link", label: "Ajustes", icon: Settings, id: "settings" },
];

const MODULE_SIDEBAR_MAP: Record<string, string> = {
  linkbox: "linkbox",
  coupons: "coupons",
  shipments: "shipments",
  analytics: "stats",
};

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  storeSlug?: string;
  isAdmin: boolean;
  enabledModules: Record<string, boolean>;
  badgeCounts: Record<string, number>;
  onLogout: () => void;
}

const DashboardSidebar = ({
  open,
  onClose,
  activeSection,
  onNavigate,
  storeSlug,
  isAdmin,
  enabledModules,
  badgeCounts,
  onLogout,
}: DashboardSidebarProps) => {
  const handleNav = (id: string, isLocked: boolean) => {
    onNavigate(isLocked ? "plans" : id);
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Catalogo360</span>
          <button className="ml-auto lg:hidden" onClick={onClose}>
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
                onClick={() => handleNav(link.id, isLocked)}
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
                {isLocked ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">PRO</span>
                ) : badgeCounts[link.id] > 0 ? (
                  <span className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none ${
                    link.id === "orders"
                      ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                      : link.id === "products"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {badgeCounts[link.id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t p-4 space-y-1">
          {storeSlug && (
            <a
              href={`/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
              Ver tienda
              <ExternalLink className="h-3 w-3 ml-auto" />
            </a>
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
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
