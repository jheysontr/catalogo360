import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown,
  Eye, ChevronRight, Clock, Loader2, ArrowUpRight,
  AlertTriangle, Star, Ticket, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import type { Json } from "@/integrations/supabase/types";
import { getCurrencySymbol } from "@/lib/currency";

interface DashboardHomeProps {
  storeId: string;
  storeName: string;
  storeSlug: string;
  productCount: number;
  currency?: string;
  onNavigate: (section: string) => void;
}

interface OrderRow {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  items: Json;
  total_price: number;
  status: string;
  created_at: string;
}

interface ProductRow {
  id: string;
  name: string;
  stock: number;
  image_url: string | null;
  price: number;
}

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const parseItems = (raw: Json): Array<{ name?: string; product_name?: string; quantity?: number; qty?: number; price?: number }> =>
  Array.isArray(raw) ? raw as any : [];

const BAR_COLORS = [
  "hsl(165, 60%, 40%)",
  "hsl(200, 60%, 50%)",
  "hsl(250, 55%, 55%)",
  "hsl(35, 80%, 50%)",
  "hsl(340, 55%, 50%)",
];

const DashboardHome = ({ storeId, storeName, storeSlug, productCount, currency = "BOB", onNavigate }: DashboardHomeProps) => {
  const sym = getCurrencySymbol(currency);
  const fmtCurrency = (n: number) => `${sym} ${n.toFixed(2)}`;
  const fmtShort = (n: number) => {
    if (n >= 1000) return `${sym} ${(n / 1000).toFixed(1)}k`;
    return `${sym} ${n.toFixed(0)}`;
  };
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [allTimeOrders, setAllTimeOrders] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<ProductRow[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sold: number }[]>([]);

  useEffect(() => {
    if (!storeId) return;
    const load = async () => {
      setLoading(true);
      const start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);

      const [{ data: recentOrders }, { count: totalCount }, { data: lowStock }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, customer_name, customer_phone, items, total_price, status, created_at")
          .eq("store_id", storeId)
          .gte("created_at", start.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("store_id", storeId),
        supabase
          .from("products")
          .select("id, name, stock, image_url, price")
          .eq("store_id", storeId)
          .lte("stock", 5)
          .order("stock", { ascending: true })
          .limit(5),
      ]);

      setOrders((recentOrders as OrderRow[]) ?? []);
      setAllTimeOrders(totalCount ?? 0);
      setLowStockProducts((lowStock as ProductRow[]) ?? []);

      const allOrders = (recentOrders as OrderRow[]) ?? [];
      const productSales: Record<string, number> = {};
      allOrders.forEach((o) => {
        const items = parseItems(o.items);
        items.forEach((item) => {
          const name = item.name || item.product_name || "Producto";
          productSales[name] = (productSales[name] || 0) + (item.quantity || item.qty || 1);
        });
      });
      const top = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, sold]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, sold }));
      setTopProducts(top);
      setLoading(false);
    };
    load();
  }, [storeId]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.created_at.slice(0, 10) === todayStr);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total_price, 0);

  const last7 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return orders.filter((o) => new Date(o.created_at) >= d);
  }, [orders]);

  const prev7 = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 14);
    const end = new Date();
    end.setDate(end.getDate() - 7);
    return orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= start && d < end;
    });
  }, [orders]);

  const weekRevenue = last7.reduce((s, o) => s + o.total_price, 0);
  const prevWeekRevenue = prev7.reduce((s, o) => s + o.total_price, 0);
  const revenueChange = prevWeekRevenue > 0
    ? ((weekRevenue - prevWeekRevenue) / prevWeekRevenue * 100)
    : weekRevenue > 0 ? 100 : 0;

  const weekOrders = last7.length;
  const monthRevenue = orders.reduce((s, o) => s + o.total_price, 0);
  const avgOrderValue = orders.length > 0 ? monthRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.status === "pending");

  const chartData = useMemo(() => {
    const days: { date: string; label: string; ventas: number; ordenes: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === key);
      days.push({
        date: key,
        label: d.toLocaleDateString("es", { day: "2-digit", month: "short" }),
        ventas: dayOrders.reduce((s, o) => s + o.total_price, 0),
        ordenes: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    {
      label: "Ventas hoy",
      value: fmtCurrency(todayRevenue),
      sub: `${todayOrders.length} orden${todayOrders.length !== 1 ? "es" : ""}`,
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "Ventas semana",
      value: fmtShort(weekRevenue),
      sub: `${weekOrders} órdenes`,
      icon: TrendingUp,
      change: revenueChange,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Ventas del mes",
      value: fmtShort(monthRevenue),
      sub: `${orders.length} órdenes`,
      icon: ShoppingCart,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    },
    {
      label: "Ticket promedio",
      value: fmtCurrency(avgOrderValue),
      sub: `${allTimeOrders} históricas`,
      icon: Package,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
  ];

  const quickActions = [
    { label: "Órdenes", icon: ShoppingCart, section: "orders", count: orders.length },
    { label: "Productos", icon: Package, section: "products", count: productCount },
    { label: "Estadísticas", icon: BarChart3, section: "stats" },
    { label: "Cupones", icon: Ticket, section: "coupons" },
    { label: "Ver tienda", icon: Eye, section: "_store_link" },
  ];

  const hasTopProducts = topProducts.length > 0;
  const hasLowStock = lowStockProducts.length > 0;
  const hasInsights = hasTopProducts || hasLowStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          ¡Bienvenido, {storeName}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen de tu negocio en los últimos 30 días
        </p>
      </div>

      {/* Pending orders alert */}
      {pendingOrders.length > 0 && (
        <button
          className="flex w-full items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 transition-colors text-left"
          onClick={() => onNavigate("orders")}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-200/60 dark:bg-yellow-900/40">
            <Clock className="h-4.5 w-4.5 text-yellow-700 dark:text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              {pendingOrders.length} orden{pendingOrders.length !== 1 ? "es" : ""} pendiente{pendingOrders.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              Haz clic para revisarlas
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
        </button>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{kpi.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{kpi.value}</p>
                </div>
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}>
                  <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{kpi.sub}</span>
                {kpi.change !== undefined && (
                  <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold ${kpi.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {kpi.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.change >= 0 ? "+" : ""}{kpi.change.toFixed(1)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart — full width */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Ventas últimos 14 días</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(165, 60%, 40%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(165, 60%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `${sym}${v}`} width={50} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "ventas" ? fmtCurrency(value) : value,
                    name === "ventas" ? "Ventas" : "Órdenes",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="hsl(165, 60%, 40%)"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                  name="ventas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights row: Top Products + Low Stock + Quick Actions */}
      <div className={`grid gap-4 sm:gap-6 ${
        hasInsights ? "lg:grid-cols-3" : "lg:grid-cols-1"
      }`}>
        {/* Top selling products */}
        {hasTopProducts && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Star className="h-4 w-4 text-amber-500" /> Top vendidos
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground" onClick={() => onNavigate("stats")}>
                  Ver más <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-4">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={75} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                      formatter={(value: number) => [`${value} uds`, "Vendidos"]}
                    />
                    <Bar dataKey="sold" radius={[0, 6, 6, 0]} barSize={18}>
                      {topProducts.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low stock */}
        {hasLowStock && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Stock bajo
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground" onClick={() => onNavigate("products")}>
                  Inventario <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg bg-accent/40 px-3 py-2.5">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtCurrency(p.price)}</p>
                  </div>
                  <Badge variant={p.stock === 0 ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                    {p.stock === 0 ? "Agotado" : `${p.stock} uds`}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 pb-4">
            {quickActions.map((action) => (
              <button
                key={action.section}
                onClick={() => {
                  if (action.section === "_store_link") {
                    window.open(`/store/${storeSlug}`, "_blank");
                  } else {
                    onNavigate(action.section);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/60 group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">{action.label}</span>
                {action.count !== undefined && (
                  <Badge variant="secondary" className="text-[10px] font-semibold">{action.count}</Badge>
                )}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Órdenes recientes</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => onNavigate("orders")}>
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                <ShoppingCart className="h-7 w-7 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Aún no tienes órdenes</p>
                <p className="text-xs">Cuando tus clientes hagan pedidos, aparecerán aquí</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 6).map((order) => {
                const items = parseItems(order.items);
                const itemNames = items.slice(0, 2).map((i) => i.name || i.product_name || "Producto").join(", ");
                const extra = items.length > 2 ? ` +${items.length - 2}` : "";
                const timeAgo = getTimeAgo(order.created_at);
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 sm:gap-4 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary/8">
                      <span className="text-xs sm:text-sm font-bold text-primary">
                        {order.customer_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.customer_name}
                        </p>
                        <Badge variant="outline" className={`text-[10px] shrink-0 border-0 ${statusStyles[order.status] || ""}`}>
                          {statusLabel[order.status] || order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {itemNames}{extra}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{fmtCurrency(order.total_price)}</p>
                      <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days}d`;
  return new Date(isoDate).toLocaleDateString("es", { day: "2-digit", month: "short" });
}

export default DashboardHome;
