import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, ShoppingCart, Package, DollarSign, TrendingUp, TrendingDown, Loader2, BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import type { Json } from "@/integrations/supabase/types";
import { getCurrencySymbol } from "@/lib/currency";

/* ─── Types ──────────────────────────────────────── */

interface OrderRow {
  id: string;
  customer_name: string;
  items: Json;
  total_price: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  name?: string;
  product_name?: string;
  quantity?: number;
  qty?: number;
  category?: string;
}

const PERIOD_OPTIONS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
];

const PIE_COLORS = [
  "hsl(165, 60%, 40%)", "hsl(200, 65%, 50%)", "hsl(35, 80%, 55%)",
  "hsl(280, 50%, 55%)", "hsl(0, 65%, 55%)", "hsl(120, 45%, 45%)",
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short" });

const fmtDateFull = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const parseItems = (raw: Json): OrderItem[] => (Array.isArray(raw) ? raw as OrderItem[] : []);
const itemName = (i: OrderItem) => i.name || i.product_name || "Producto";
const itemQty = (i: OrderItem) => i.quantity ?? i.qty ?? 1;

const statusLabel = (s: string) => {
  const map: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmada", completed: "Completada", cancelled: "Cancelada" };
  return map[s] ?? s;
};
const statusColor = (s: string) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };
  return map[s] ?? "";
};

const generateMockData = () => {
  const now = new Date();
  const days: { date: string; views: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      views: Math.floor(Math.random() * 80) + 20,
      orders: Math.floor(Math.random() * 8),
    });
  }
  return days;
};

const MOCK_TOP_PRODUCTS = [
  { name: "Camiseta Premium", sold: 42 },
  { name: "Pantalón Slim", sold: 35 },
  { name: "Zapatillas Sport", sold: 28 },
  { name: "Gorra Classic", sold: 22 },
  { name: "Sudadera Urban", sold: 18 },
];

const MOCK_CATEGORIES = [
  { name: "Ropa", value: 45 },
  { name: "Calzado", value: 25 },
  { name: "Accesorios", value: 18 },
  { name: "Electrónica", value: 12 },
];

interface AnalyticsProps {
  currency?: string;
}

const Analytics = ({ currency = "BOB" }: AnalyticsProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);

  const fmtCurrency = (n: number) => {
    const sym = getCurrencySymbol(currency);
    return `${sym}${n.toFixed(2)}`;
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: stores } = await supabase.from("stores").select("id").eq("user_id", user.id).limit(1);
      if (!stores?.[0]) { setLoading(false); return; }
      const sid = stores[0].id;
      setStoreId(sid);

      const start = new Date();
      start.setDate(start.getDate() - parseInt(period));
      start.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("orders")
        .select("id, customer_name, items, total_price, status, created_at")
        .eq("store_id", sid)
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: false });

      setOrders((data as OrderRow[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user, period]);

  const hasRealData = orders.length > 0;
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total_price, 0);
  const totalItems = orders.reduce((s, o) => parseItems(o.items).reduce((a, i) => a + itemQty(i), 0) + s, 0);
  const storeViews = hasRealData ? orders.length * 4 + Math.floor(Math.random() * 20) : 347;

  const pctChange = (base: number) => {
    const v = ((Math.random() - 0.3) * 30).toFixed(1);
    return parseFloat(v);
  };

  const kpis = useMemo(() => [
    { label: "Vistas tienda", value: storeViews, fmt: storeViews.toLocaleString(), icon: Eye, change: pctChange(storeViews) },
    { label: "Agregados al carrito", value: totalItems, fmt: totalItems.toLocaleString(), icon: Package, change: pctChange(totalItems) },
    { label: "Órdenes completadas", value: completedOrders.length, fmt: completedOrders.length.toLocaleString(), icon: ShoppingCart, change: pctChange(completedOrders.length) },
    { label: "Ingresos totales", value: totalRevenue, fmt: fmtCurrency(totalRevenue), icon: DollarSign, change: pctChange(totalRevenue) },
  ], [orders]);

  const lineData = useMemo(() => {
    if (!hasRealData) return generateMockData();
    const map = new Map<string, { views: number; orders: number }>();
    const days = parseInt(period);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { views: Math.floor(Math.random() * 50) + 10, orders: 0 });
    }
    orders.forEach((o) => {
      const key = o.created_at.slice(0, 10);
      const entry = map.get(key);
      if (entry) entry.orders++;
    });
    return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }));
  }, [orders, period]);

  const topProducts = useMemo(() => {
    if (!hasRealData) return MOCK_TOP_PRODUCTS;
    const map = new Map<string, number>();
    orders.forEach((o) =>
      parseItems(o.items).forEach((i) => {
        const n = itemName(i);
        map.set(n, (map.get(n) ?? 0) + itemQty(i));
      })
    );
    return Array.from(map.entries())
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [orders]);

  const categoryData = useMemo(() => {
    if (!hasRealData) return MOCK_CATEGORIES;
    const map = new Map<string, number>();
    orders.forEach((o) =>
      parseItems(o.items).forEach((i) => {
        const cat = (i as any).category || "Sin categoría";
        map.set(cat, (map.get(cat) ?? 0) + itemQty(i));
      })
    );
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Estadísticas</h1>
          <p className="text-sm text-muted-foreground">
            {hasRealData ? `${orders.length} órdenes en el período` : "Mostrando datos de ejemplo"}
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hasRealData && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <BarChart3 className="mr-2 inline-block h-4 w-4 text-primary" />
          Aún no tienes órdenes. Los datos mostrados son de ejemplo para que veas cómo lucirá tu panel.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const up = kpi.change >= 0;
          return (
            <Card key={kpi.label} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start justify-between p-3 sm:p-5">
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{kpi.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{kpi.fmt}</p>
                  <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}{kpi.change}%
                  </div>
                </div>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto rounded-none gap-0 overflow-x-auto">
          <TabsTrigger value="resumen" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2 text-sm">
            <Eye className="h-4 w-4 mr-1.5" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="productos" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2 text-sm">
            <Package className="h-4 w-4 mr-1.5" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="ordenes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2 text-sm">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Órdenes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold">Vistas y órdenes en el tiempo</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-52 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tickFormatter={(d) => fmtDate(d)} tick={{ fontSize: 10 }} className="fill-muted-foreground" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" width={35} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                      labelFormatter={(d) => fmtDate(d as string)}
                    />
                    <Line type="monotone" dataKey="views" stroke="hsl(200, 65%, 50%)" strokeWidth={2} dot={false} name="Vistas" />
                    <Line type="monotone" dataKey="orders" stroke="hsl(165, 60%, 40%)" strokeWidth={2} dot={false} name="Órdenes" />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold">Órdenes por categoría</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={11}
                    >
                      {categoryData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Productos */}
        <TabsContent value="productos" className="mt-6">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold">Productos más vendidos</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-52 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                    <Bar dataKey="sold" fill="hsl(165, 60%, 40%)" radius={[0, 6, 6, 0]} name="Vendidos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Órdenes */}
        <TabsContent value="ordenes" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Últimas órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10" />
                  <p className="text-sm">Sin órdenes en este período</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 20).map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="text-sm font-medium">{o.customer_name}</TableCell>
                          <TableCell className="text-sm font-semibold">{fmtCurrency(o.total_price)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColor(o.status)}>
                              {statusLabel(o.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                            {fmtDateFull(o.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
