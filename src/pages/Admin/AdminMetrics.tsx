import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Package, ShoppingCart, Users, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

interface Metrics {
  totalStores: number;
  activeStores: number;
  suspendedStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#f59e0b", "#8b5cf6", "#06b6d4", "#10b981"];

const AdminMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalStores: 0, activeStores: 0, suspendedStores: 0,
    totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ordersByMonth, setOrdersByMonth] = useState<{ month: string; orders: number; revenue: number }[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [storesRes, productsRes, ordersRes, profilesRes, plansRes] = await Promise.all([
        supabase.from("stores").select("is_active, plan_id, created_at"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_price, created_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("pricing_plans").select("id, name"),
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

      // Orders by month (last 6 months)
      const months: Record<string, { orders: number; revenue: number }> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("es", { month: "short", year: "2-digit" });
        months[key] = { orders: 0, revenue: 0 };
      }
      orders.forEach((o: any) => {
        const d = new Date(o.created_at);
        const key = d.toLocaleDateString("es", { month: "short", year: "2-digit" });
        if (months[key]) {
          months[key].orders++;
          months[key].revenue += Number(o.total_price) || 0;
        }
      });
      setOrdersByMonth(Object.entries(months).map(([month, data]) => ({ month, ...data })));

      // Plan distribution
      const planNames: Record<string, string> = {};
      (plansRes.data || []).forEach((p: any) => { planNames[p.id] = p.name; });
      const planCounts: Record<string, number> = { "Sin plan": 0 };
      storesList.forEach((s: any) => {
        const name = s.plan_id ? (planNames[s.plan_id] || "Otro") : "Sin plan";
        planCounts[name] = (planCounts[name] || 0) + 1;
      });
      setPlanDistribution(Object.entries(planCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    fetchAll();
  }, []);

  const cards = [
    { label: "Usuarios", value: metrics.totalUsers, icon: Users, color: "text-blue-600" },
    { label: "Tiendas totales", value: metrics.totalStores, icon: Store, color: "text-primary" },
    { label: "Tiendas activas", value: metrics.activeStores, icon: TrendingUp, color: "text-green-600" },
    { label: "Suspendidas", value: metrics.suspendedStores, icon: Store, color: "text-destructive" },
    { label: "Productos", value: metrics.totalProducts, icon: Package, color: "text-orange-600" },
    { label: "Órdenes", value: metrics.totalOrders, icon: ShoppingCart, color: "text-purple-600" },
    { label: "Ingresos totales", value: `$${metrics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Métricas Globales</h1>
        <p className="mt-1 text-sm text-muted-foreground">Resumen general de la plataforma</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => (
          <Card key={card.label} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Órdenes por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ordersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Órdenes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ingresos por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ordersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Ingresos"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribución de Planes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {planDistribution.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    >
                      {planDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {planDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8">No hay datos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMetrics;
