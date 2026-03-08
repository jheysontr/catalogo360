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

/* ── Types ── */
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

/* ── Constants ── */
const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const BAR_COLORS = [
  "hsl(165, 60%, 40%)",
  "hsl(200, 60%, 50%)",
  "hsl(250, 55%, 55%)",
  "hsl(35, 80%, 50%)",
  "hsl(340, 55%, 50%)",
];

const parseItems = (raw: Json): Array<{ name?: string; product_name?: string; quantity?: number; qty?: number; price?: number }> =>
  Array.isArray(raw) ? (raw as any) : [];

/* ── Helpers ── */
function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `${days}d`;
  return new Date(isoDate).toLocaleDateString("es", { day: "2-digit", month: "short" });
}

/* ── Component ── */
const DashboardHome = ({ storeId, storeName, storeSlug, productCount, currency = "BOB", onNavigate }: DashboardHomeProps) => {
  const sym = getCurrencySymbol(currency);
  const fmt = (n: number) => `${sym} ${n.toFixed(2)}`;
  const fmtK = (n: number) => (n >= 1000 ? `${sym} ${(n / 1000).toFixed(1)}k` : `${sym} ${n.toFixed(0)}`);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [allTimeOrders, setAllTimeOrders] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<ProductRow[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sold: number }[]>([]);

  /* ── Data fetching ── */
  useEffect(() => {
    if (!storeId) return;
    const load = async () => {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - 30);
      since.setHours(0, 0, 0, 0);

      const [{ data: recent }, { count: total }, { data: lowStock }] = await Promise.all([
        supabase.from("orders").select("id, customer_name, customer_phone, items, total_price, status, created_at").eq("store_id", storeId).gte("created_at", since.toISOString()).order("created_at", { ascending: false }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("store_id", storeId),
        supabase.from("products").select("id, name, stock, image_url, price").eq("store_id", storeId).lte("stock", 5).order("stock", { ascending: true }).limit(5),
      ]);

      const recentOrders = (recent as OrderRow[]) ?? [];
      setOrders(recentOrders);
      setAllTimeOrders(total ?? 0);
      setLowStockProducts((lowStock as ProductRow[]) ?? []);

      const sales: Record<string, number> = {};
      recentOrders.forEach((o) =>
        parseItems(o.items).forEach((i) => {
          const n = i.name || i.product_name || "Producto";
          sales[n] = (sales[n] || 0) + (i.quantity || i.qty || 1);
        })
      );
      setTopProducts(
        Object.entries(sales)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, sold]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, sold }))
      );
      setLoading(false);
    };
    load();
  }, [storeId]);

  /* ── KPI calculations ── */
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.created_at.slice(0, 10) === todayStr);
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total_price, 0);

  const last7 = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return orders.filter((o) => new Date(o.created_at) >= d); }, [orders]);
  const prev7 = useMemo(() => { const s = new Date(); s.setDate(s.getDate() - 14); const e = new Date(); e.setDate(e.getDate() - 7); return orders.filter((o) => { const d = new Date(o.created_at); return d >= s && d < e; }); }, [orders]);

  const weekRevenue = last7.reduce((s, o) => s + o.total_price, 0);
  const prevWeekRevenue = prev7.reduce((s, o) => s + o.total_price, 0);
  const revenueChange = prevWeekRevenue > 0 ? ((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100 : weekRevenue > 0 ? 100 : 0;
  const monthRevenue = orders.reduce((s, o) => s + o.total_price, 0);
  const avgOrderValue = orders.length > 0 ? monthRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.status === "pending");

  const chartData = useMemo(() => {
    const days: { label: string; ventas: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ label: d.toLocaleDateString("es", { day: "2-digit", month: "short" }), ventas: orders.filter((o) => o.created_at.slice(0, 10) === key).reduce((s, o) => s + o.total_price, 0) });
    }
    return days;
  }, [orders]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const kpis = [
    { label: "Ventas hoy", value: fmt(todayRevenue), sub: `${todayOrders.length} orden${todayOrders.length !== 1 ? "es" : ""}`, icon: DollarSign, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
    { label: "Esta semana", value: fmtK(weekRevenue), sub: `${last7.length} órdenes`, icon: TrendingUp, change: revenueChange, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
    { label: "Este mes", value: fmtK(monthRevenue), sub: `${orders.length} órdenes`, icon: ShoppingCart, color: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
    { label: "Ticket prom.", value: fmt(avgOrderValue), sub: `${allTimeOrders} históricas`, icon: Package, color: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
  ];

  const quickActions = [
    { label: "Órdenes", icon: ShoppingCart, section: "orders", count: orders.length },
    { label: "Productos", icon: Package, section: "products", count: productCount },
    { label: "Estadísticas", icon: BarChart3, section: "stats" },
    { label: "Cupones", icon: Ticket, section: "coupons" },
    { label: "Ver tienda", icon: Eye, section: "_store_link" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* ── 1. Header + Alert ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">¡Hola, {storeName}! 👋</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Resumen de los últimos 30 días</p>
        </div>
        {pendingOrders.length > 0 && (
          <button
            onClick={() => onNavigate("orders")}
            className="flex items-center gap-2.5 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-left transition-colors hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50 sm:self-end"
          >
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              {pendingOrders.length} pendiente{pendingOrders.length !== 1 ? "s" : ""}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
          </button>
        )}
      </div>

      {/* ── 2. KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{k.label}</p>
                  <p className="text-base sm:text-xl font-bold text-foreground truncate">{k.value}</p>
                </div>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${k.color}`}>
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs text-muted-foreground">{k.sub}</span>
                {k.change !== undefined && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${k.change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {k.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {k.change >= 0 ? "+" : ""}{k.change.toFixed(0)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 3. Chart + Quick Actions ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-1 pt-4 px-4 sm:px-6">
            <CardTitle className="text-sm font-semibold">Ventas — 14 días</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-4">
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(165,60%,40%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(165,60%,40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} className="fill-muted-foreground" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" tickFormatter={(v) => `${sym}${v}`} width={48} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}
                    formatter={(v: number) => [fmt(v), "Ventas"]}
                  />
                  <Area type="monotone" dataKey="ventas" stroke="hsl(165,60%,40%)" strokeWidth={2.5} fill="url(#sg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-4 space-y-1">
            {quickActions.map((a) => (
              <button
                key={a.section}
                onClick={() => {
                  if (a.section === "_store_link") {
                    const w = window.open(`/${storeSlug}`, "_blank");
                    if (!w) window.location.href = `/${storeSlug}`;
                  } else {
                    onNavigate(a.section);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-colors group"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15">
                  <a.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground text-left">{a.label}</span>
                {a.count !== undefined && <Badge variant="secondary" className="text-[10px]">{a.count}</Badge>}
                <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Low Stock alert ── */}
      {lowStockProducts.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Stock bajo
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground" onClick={() => onNavigate("products")}>
              Inventario <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
                    <p className="text-[11px] text-muted-foreground">{fmt(p.price)}</p>
                  </div>
                  <Badge variant={p.stock === 0 ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                    {p.stock === 0 ? "Agotado" : `${p.stock} uds`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 5. Recent Orders + Top Products side by side ── */}
      <div className={`grid gap-4 ${topProducts.length > 0 ? "lg:grid-cols-5" : ""}`}>
        <Card className={`border-0 shadow-sm ${topProducts.length > 0 ? "lg:col-span-3" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 sm:px-6">
            <CardTitle className="text-sm font-semibold">Órdenes recientes</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" onClick={() => onNavigate("orders")}>
              Ver todas <ChevronRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60">
                  <ShoppingCart className="h-6 w-6 opacity-40" />
                </div>
                <p className="text-sm font-medium">Aún no tienes órdenes</p>
                <p className="text-xs">Aparecerán aquí cuando tus clientes hagan pedidos</p>
              </div>
            ) : (
              <div className="space-y-1">
                {orders.slice(0, 6).map((o) => {
                  const items = parseItems(o.items);
                  const names = items.slice(0, 2).map((i) => i.name || i.product_name || "Producto").join(", ");
                  const extra = items.length > 2 ? ` +${items.length - 2}` : "";
                  return (
                    <div key={o.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/40 transition-colors">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8">
                        <span className="text-xs font-bold text-primary">{o.customer_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{o.customer_name}</span>
                          <Badge variant="outline" className={`text-[10px] border-0 shrink-0 ${STATUS_STYLE[o.status] || ""}`}>
                            {STATUS_LABEL[o.status] || o.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{names}{extra}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{fmt(o.total_price)}</p>
                        <p className="text-[11px] text-muted-foreground">{getTimeAgo(o.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {topProducts.length > 0 && (
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Star className="h-4 w-4 text-amber-500" /> Más vendidos
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground" onClick={() => onNavigate("stats")}>
                Detalle <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-2 sm:px-4 pb-4">
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={75} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,.08)" }}
                      formatter={(v: number) => [`${v} uds`, "Vendidos"]}
                    />
                    <Bar dataKey="sold" radius={[0, 6, 6, 0]} barSize={18}>
                      {topProducts.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
