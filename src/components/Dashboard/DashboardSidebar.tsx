import { Link } from "react-router-dom";
import {
  Package, Store, ShoppingCart, BarChart3, CreditCard, Settings,
  ExternalLink, Eye, X, LogOut, FolderOpen, Ticket,
  Truck, Link2, Wallet, Shield, Sparkles, Palette,
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
  planName?: string;
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
  planName,
}: DashboardSidebarProps) => {
  const handleNav = (id: string, isLocked: boolean) => {
    onNavigate(isLocked ? "plans" : id);
    onClose();
  };

  const isFreePlan = !planName || /free|gratis|sin plan/i.test(planName);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[hsl(var(--shell-deep))] text-slate-300 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--shell-teal-500))] shadow-lg shadow-[hsl(var(--shell-teal-500))]/25">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">Catalogo360</span>
          <button className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {sidebarLinks.map((item, idx) => {
            if (item.type === "group") {
              return (
                <p key={idx} className="mt-5 mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </p>
              );
            }

            const link = item;
            const moduleKey = Object.entries(MODULE_SIDEBAR_MAP).find(([, sid]) => sid === link.id)?.[0];
            const isLocked = moduleKey ? enabledModules[moduleKey] !== true : false;
            const isActive = activeSection === link.id;

            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id, isLocked)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isLocked
                    ? "text-slate-500 hover:bg-white/5"
                    : isActive
                      ? "bg-[hsl(var(--shell-teal-900))]/60 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[hsl(var(--shell-teal-500))]" />
                )}
                <link.icon className={`h-4 w-4 ${isActive ? "text-[hsl(var(--shell-teal-300))]" : ""}`} />
                <span className="flex-1 text-left">{link.label}</span>
                {isLocked ? (
                  <span className="rounded-full bg-[hsl(var(--shell-teal-500))]/15 px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--shell-teal-300))]">PRO</span>
                ) : badgeCounts[link.id] > 0 ? (
                  <span className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none ${
                    link.id === "orders"
                      ? "bg-orange-500/20 text-orange-300"
                      : link.id === "products"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {badgeCounts[link.id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {isFreePlan && (
          <div className="px-4 pb-3">
            <div className="rounded-2xl bg-[hsl(var(--shell-teal-900))] p-4 border border-[hsl(var(--shell-teal-500))]/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--shell-teal-300))]" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--shell-teal-300))]">Mejora tu plan</p>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">Desbloquea productos ilimitados, cupones y más.</p>
              <button
                onClick={() => { onNavigate("plans"); onClose(); }}
                className="w-full rounded-lg bg-[hsl(var(--shell-teal-500))] py-2 text-[11px] font-bold text-[hsl(var(--shell-deep))] hover:bg-[hsl(var(--shell-teal-300))] transition-colors"
              >
                Ver planes
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-white/5 p-3 space-y-0.5">
          {storeSlug && (
            <a
              href={`/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Eye className="h-4 w-4" />
              Ver tienda
              <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
            </a>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Shield className="h-4 w-4" />
              Panel Admin
            </Link>
          )}
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-destructive/15 hover:text-red-300"
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
