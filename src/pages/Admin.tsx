import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import {
  Store, CreditCard, BarChart3, Shield, LogOut, Menu, X, Users, Activity,
} from "lucide-react";
import AdminStores from "@/pages/Admin/AdminStores";
import AdminPlans from "@/pages/Admin/AdminPlans";
import AdminMetrics from "@/pages/Admin/AdminMetrics";
import AdminUsers from "@/pages/Admin/AdminUsers";
import AdminActivity from "@/pages/Admin/AdminActivity";

const sidebarLinks = [
  { label: "Métricas", icon: BarChart3, id: "metrics" },
  { label: "Tiendas", icon: Store, id: "stores" },
  { label: "Usuarios", icon: Users, id: "users" },
  { label: "Planes", icon: CreditCard, id: "plans" },
  { label: "Actividad", icon: Activity, id: "activity" },
];

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminCheck();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("metrics");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Shield className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">Acceso denegado</h1>
        <p className="text-muted-foreground">No tienes permisos de administrador.</p>
        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

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
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Admin Panel</span>
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

        <div className="border-t p-4 space-y-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Store className="h-4 w-4" />
            Ir al Dashboard
          </button>
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
            <p className="text-sm font-semibold text-foreground">Panel de Administración</p>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {activeSection === "metrics" && <AdminMetrics />}
          {activeSection === "stores" && <AdminStores />}
          {activeSection === "users" && <AdminUsers />}
          {activeSection === "plans" && <AdminPlans />}
          {activeSection === "activity" && <AdminActivity />}
        </main>
      </div>
    </div>
  );
};

export default Admin;
