import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Package, ShoppingCart, Users, TrendingUp, DollarSign } from "lucide-react";

interface Metrics {
  totalStores: number;
  activeStores: number;
  suspendedStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

const AdminMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalStores: 0, activeStores: 0, suspendedStores: 0,
    totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [storesRes, productsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from("stores").select("is_active"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_price"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const storesList = storesRes.data || [];
      const activeStores = storesList.filter((s: any) => s.is_active).length;
      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total_price) || 0), 0);

      setMetrics({
        totalStores: storesList.length,
        activeStores,
        suspendedStores: storesList.length - activeStores,
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: profilesRes.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = [
    { label: "Usuarios", value: metrics.totalUsers, icon: Users, color: "text-blue-600" },
    { label: "Tiendas totales", value: metrics.totalStores, icon: Store, color: "text-primary" },
    { label: "Tiendas activas", value: metrics.activeStores, icon: TrendingUp, color: "text-green-600" },
    { label: "Tiendas suspendidas", value: metrics.suspendedStores, icon: Store, color: "text-destructive" },
    { label: "Productos totales", value: metrics.totalProducts, icon: Package, color: "text-orange-600" },
    { label: "Órdenes totales", value: metrics.totalOrders, icon: ShoppingCart, color: "text-purple-600" },
    { label: "Ingresos totales", value: `$${metrics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Métricas Globales</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumen general de la plataforma</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminMetrics;
