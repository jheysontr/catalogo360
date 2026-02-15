import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Menu, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Package className="h-6 w-6 text-primary" />
          CatalogHub
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Inicio
          </Link>
          <Link to="/track" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Rastrear pedido
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Iniciar sesión
              </Link>
              <Button asChild size="sm">
                <Link to="/register">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 pt-2 md:hidden">
          <Link to="/" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Inicio</Link>
          <Link to="/track" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>Rastrear pedido</Link>
          {user ? (
            <div className="flex flex-col gap-2">
              <Link to="/dashboard" className="py-2 text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Cerrar sesión</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="py-2 text-sm" onClick={() => setMobileOpen(false)}>Iniciar sesión</Link>
              <Button asChild size="sm"><Link to="/register">Crear cuenta</Link></Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
