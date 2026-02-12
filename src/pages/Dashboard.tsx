import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingBag, Package, BarChart3 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login");
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) return null;

  const stats = [
    { label: "Tiendas", value: "0", icon: ShoppingBag },
    { label: "Productos", value: "0", icon: Package },
    { label: "Visitas", value: "0", icon: BarChart3 },
  ];

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenido, {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nueva tienda
        </Button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-10">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No tienes tiendas aún</h3>
          <p className="mt-1 text-sm text-muted-foreground">Crea tu primera tienda para empezar a vender.</p>
          <Button className="mt-6 gap-2">
            <Plus className="h-4 w-4" /> Crear tienda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
