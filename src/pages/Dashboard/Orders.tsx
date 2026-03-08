import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search, ShoppingCart, Eye, MessageCircle, Download, Loader2, Package, Truck,
  MoreHorizontal, CheckCircle, XCircle, Clock, ThumbsUp, FileText, FileDown,
  DollarSign, Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import OrderReceipt from "@/components/OrderReceipt";

interface ShipmentData {
  shipping_method: string;
  tracking_number: string;
  cost: number;
  address: string;
  city: string;
  status: string;
  estimated_delivery_date: string | null;
}

const SHIPPING_METHOD_LABELS: Record<string, string> = {
  pickup: "Retiro en tienda",
  local: "Envío local",
  national: "Envío nacional",
};

const SHIPPING_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
};

/* ─── Types ──────────────────────────────────────── */

interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items: Json;
  total_price: number;
  status: string;
  created_at: string;
  store_id: string;
}

interface OrderItem {
  name?: string;
  product_name?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  unit_price?: number;
}

/* ─── Helpers ────────────────────────────────────── */

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

const PERIOD_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" },
  { value: "all", label: "Todo" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    default: return "";
  }
};

const statusLabel = (s: string) =>
  STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

const parseItems = (raw: Json): OrderItem[] => {
  if (Array.isArray(raw)) return raw as OrderItem[];
  return [];
};

const itemName = (i: OrderItem) => i.name || i.product_name || "Producto";
const itemQty = (i: OrderItem) => i.quantity ?? i.qty ?? 1;
const itemPrice = (i: OrderItem) => i.price ?? i.unit_price ?? 0;

const fmtCurrency = (n: number) =>
  `Bs${n.toFixed(2)}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

const periodStart = (period: string) => {
  const now = new Date();
  if (period === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (period === "week") {
    const d = now.getDay();
    now.setDate(now.getDate() - (d === 0 ? 6 : d - 1));
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (period === "month") {
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  return null;
};

const PER_PAGE = 20;

/* ─── Component ──────────────────────────────────── */

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [storeId, setStoreId] = useState<string | null>(null);
  const [storePhone, setStorePhone] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<{ store_name: string; logo_url?: string | null; address?: string | null; email?: string | null; social_media?: Record<string, string> | null }>({ store_name: "" });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Receipt
  const [receiptOrder, setReceiptOrder] = useState<OrderRow | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [page, setPage] = useState(1);

  // Detail modal
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentData | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  /* ── Fetch store ── */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("id, social_media, store_name, logo_url, address, email")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          setStoreId(data[0].id);
          const sm = data[0].social_media as Record<string, string> | null;
          setStorePhone(sm?.whatsapp ?? null);
          setStoreData({
            store_name: data[0].store_name,
            logo_url: data[0].logo_url,
            address: data[0].address,
            email: data[0].email,
            social_media: sm,
          });
        }
      });
  }, [user]);

  /* ── Fetch orders ── */
  useEffect(() => {
    if (!storeId) return;
    const fetchOrders = async () => {
      setLoading(true);
      let q = supabase
        .from("orders")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      const start = periodStart(period);
      if (start) q = q.gte("created_at", start);

      const { data, error } = await q;
      if (error) {
        toast({ title: "Error", description: "No se pudieron cargar las órdenes", variant: "destructive" });
      }
      setOrders((data as OrderRow[]) ?? []);
      setLoading(false);
    };
    fetchOrders();
  }, [storeId, period]);

  /* ── Filtered / sorted ── */
  const filtered = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        (o.customer_phone && o.customer_phone.includes(q)) ||
        o.id.toLowerCase().includes(q)
      );
    }

    if (minAmount) list = list.filter((o) => o.total_price >= Number(minAmount));
    if (maxAmount) list = list.filter((o) => o.total_price <= Number(maxAmount));

    if (sortBy === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (sortBy === "value") list.sort((a, b) => b.total_price - a.total_price);

    return list;
  }, [orders, statusFilter, search, sortBy, minAmount, maxAmount]);

  /* ── CSV Export ── */
  const exportCSV = () => {
    const headers = ["ID", "Cliente", "Email", "Teléfono", "Productos", "Total", "Estado", "Fecha"];
    const rows = filtered.map((o) => {
      const items = parseItems(o.items);
      return [
        shortId(o.id),
        o.customer_name,
        o.customer_email,
        o.customer_phone || "",
        items.map((i) => `${itemName(i)} x${itemQty(i)}`).join("; "),
        o.total_price.toFixed(2),
        statusLabel(o.status),
        fmtDate(o.created_at),
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ordenes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado", description: `${filtered.length} órdenes exportadas` });
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, statusFilter, sortBy, period, minAmount, maxAmount]);

  /* ── Status update ── */
  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selected?.id === orderId) setSelected((s) => s ? { ...s, status: newStatus } : null);
      toast({ title: "Estado actualizado" });
    }
    setUpdatingStatus(false);
  };

  /* ── WhatsApp ── */
  const openWhatsApp = (order: OrderRow) => {
    const phone = order.customer_phone?.replace(/\D/g, "") || "";
    if (!phone) { toast({ title: "Sin teléfono", description: "El cliente no proporcionó teléfono", variant: "destructive" }); return; }
    const items = parseItems(order.items);
    const text = encodeURIComponent(
      `Hola ${order.customer_name}, sobre tu orden #${shortId(order.id)}:\n` +
      items.map((i) => `• ${itemName(i)} x${itemQty(i)}`).join("\n") +
      `\nTotal: ${fmtCurrency(order.total_price)}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  /* ── Download PDF (text-based) ── */
  const downloadDetails = (order: OrderRow) => {
    const items = parseItems(order.items);
    const lines = [
      `ORDEN #${shortId(order.id)}`,
      `Fecha: ${fmtDate(order.created_at)}`,
      `Estado: ${statusLabel(order.status)}`,
      "",
      "CLIENTE",
      `Nombre: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      `Teléfono: ${order.customer_phone || "N/A"}`,
      "",
      "PRODUCTOS",
      ...items.map((i) => `  ${itemName(i)} x${itemQty(i)} — ${fmtCurrency(itemPrice(i))} c/u — Subtotal: ${fmtCurrency(itemPrice(i) * itemQty(i))}`),
      "",
      `TOTAL: ${fmtCurrency(order.total_price)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orden-${shortId(order.id)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Status counts ── */
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    orders.forEach((o) => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return counts;
  }, [orders]);

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Órdenes</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} órdenes encontradas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV} disabled={filtered.length === 0}>
            <FileDown className="h-4 w-4" /> Exportar CSV
          </Button>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="w-full justify-start border-b bg-transparent p-0 h-auto rounded-none gap-0 overflow-x-auto">
          {STATUS_OPTIONS.map((o) => (
            <TabsTrigger
              key={o.value}
              value={o.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2 text-sm gap-1.5"
            >
              {o.label}
              {statusCounts[o.value] > 0 && (
                <span className={`ml-1 min-w-[18px] rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  o.value === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                  : o.value === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
                }`}>
                  {statusCounts[o.value]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="space-y-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, teléfono o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más reciente</SelectItem>
              <SelectItem value="oldest">Más antiguo</SelectItem>
              <SelectItem value="value">Mayor valor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            type="number"
            placeholder="Monto mín"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-28"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Monto máx"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-28"
          />
          {(minAmount || maxAmount || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setMinAmount(""); setMaxAmount(""); }}>
              <Filter className="h-3.5 w-3.5 mr-1" /> Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <ShoppingCart className="h-12 w-12" />
          <p className="text-lg font-medium">No hay órdenes</p>
          <p className="text-sm">Las órdenes aparecerán aquí cuando tus clientes realicen compras.</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 sm:hidden">
            {paginated.map((order) => {
              const items = parseItems(order.items);
              return (
                <Card key={order.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{order.customer_name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{shortId(order.id)}</p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-[10px] ${statusColor(order.status)}`}>
                      {statusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-foreground">{fmtCurrency(order.total_price)}</p>
                      <p className="text-[10px] text-muted-foreground">{fmtDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={async () => {
                        setSelected(order);
                        const { data: shipData } = await supabase
                          .from("shipments")
                          .select("shipping_method, tracking_number, cost, address, city, status, estimated_delivery_date")
                          .eq("order_id", order.id)
                          .limit(1);
                        setSelectedShipment(shipData?.[0] as ShipmentData ?? null);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Clock className="mr-2 h-3.5 w-3.5" /> Cambiar estado
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {[
                                { value: "pending", label: "Pendiente", icon: Clock },
                                { value: "confirmed", label: "Confirmada", icon: ThumbsUp },
                                { value: "completed", label: "Completada", icon: CheckCircle },
                                { value: "cancelled", label: "Cancelada", icon: XCircle },
                              ].filter((s) => s.value !== order.status).map((s) => (
                                <DropdownMenuItem key={s.value} onClick={() => updateStatus(order.id, s.value)}>
                                  <s.icon className="mr-2 h-3.5 w-3.5" /> {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openWhatsApp(order)}>
                            <MessageCircle className="mr-2 h-3.5 w-3.5" /> WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadDetails(order)}>
                            <Download className="mr-2 h-3.5 w-3.5" /> Descargar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setReceiptOrder(order)}>
                            <FileText className="mr-2 h-3.5 w-3.5" /> Generar recibo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((order) => {
                  const items = parseItems(order.items);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{shortId(order.id)}</TableCell>
                      <TableCell className="font-medium">{order.customer_name}</TableCell>
                      <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                        {items.length === 0
                          ? "—"
                          : items.map((i) => `${itemName(i)} x${itemQty(i)}`).join(", ")}
                      </TableCell>
                      <TableCell className="font-semibold">{fmtCurrency(order.total_price)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor(order.status)}>
                          {statusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                        {fmtDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={async () => {
                            setSelected(order);
                            const { data: shipData } = await supabase
                              .from("shipments")
                              .select("shipping_method, tracking_number, cost, address, city, status, estimated_delivery_date")
                              .eq("order_id", order.id)
                              .limit(1);
                            setSelectedShipment(shipData?.[0] as ShipmentData ?? null);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Clock className="mr-2 h-3.5 w-3.5" /> Cambiar estado
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {[
                                    { value: "pending", label: "Pendiente", icon: Clock },
                                    { value: "confirmed", label: "Confirmada", icon: ThumbsUp },
                                    { value: "completed", label: "Completada", icon: CheckCircle },
                                    { value: "cancelled", label: "Cancelada", icon: XCircle },
                                  ].filter((s) => s.value !== order.status).map((s) => (
                                    <DropdownMenuItem key={s.value} onClick={() => updateStatus(order.id, s.value)}>
                                      <s.icon className="mr-2 h-3.5 w-3.5" /> {s.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openWhatsApp(order)}>
                                <MessageCircle className="mr-2 h-3.5 w-3.5" /> WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadDetails(order)}>
                                <Download className="mr-2 h-3.5 w-3.5" /> Descargar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setReceiptOrder(order)}>
                                <FileText className="mr-2 h-3.5 w-3.5" /> Generar recibo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let num: number;
                  if (totalPages <= 5) num = i + 1;
                  else if (page <= 3) num = i + 1;
                  else if (page >= totalPages - 2) num = totalPages - 4 + i;
                  else num = page - 2 + i;
                  return (
                    <PaginationItem key={num}>
                      <PaginationLink
                        isActive={num === page}
                        onClick={() => setPage(num)}
                        className="cursor-pointer"
                      >
                        {num}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setSelectedShipment(null); } }}>
        {selected && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Orden #{shortId(selected.id)}</DialogTitle>
              <DialogDescription>Creada {fmtDate(selected.created_at)}</DialogDescription>
            </DialogHeader>

            {/* Customer */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Cliente</h3>
              <p className="text-sm">{selected.customer_name}</p>
              <p className="text-sm text-muted-foreground">{selected.customer_email}</p>
              {selected.customer_phone && (
                <p className="text-sm text-muted-foreground">{selected.customer_phone}</p>
              )}
            </div>

            {/* Products */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Productos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead className="text-right">P. Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parseItems(selected.items).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{itemName(item)}</TableCell>
                      <TableCell className="text-center">{itemQty(item)}</TableCell>
                      <TableCell className="text-right">{fmtCurrency(itemPrice(item))}</TableCell>
                      <TableCell className="text-right font-medium">
                        {fmtCurrency(itemPrice(item) * itemQty(item))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end border-t pt-2">
                <span className="text-lg font-bold text-foreground">
                  Total: {fmtCurrency(selected.total_price)}
                </span>
              </div>
            </div>

            {/* Shipping info */}
            {selectedShipment && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Truck className="h-4 w-4" /> Envío
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Método</span>
                    <p className="font-medium">{SHIPPING_METHOD_LABELS[selectedShipment.shipping_method] || selectedShipment.shipping_method}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Estado envío</span>
                    <p className="font-medium">{SHIPPING_STATUS_LABELS[selectedShipment.status] || selectedShipment.status}</p>
                  </div>
                  {selectedShipment.cost > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Costo envío</span>
                      <p className="font-medium">{fmtCurrency(selectedShipment.cost)}</p>
                    </div>
                  )}
                  {selectedShipment.tracking_number && (
                    <div>
                      <span className="text-xs text-muted-foreground">Rastreo</span>
                      <p className="font-mono text-xs font-medium">{selectedShipment.tracking_number}</p>
                    </div>
                  )}
                  {selectedShipment.address && (
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Dirección</span>
                      <p className="font-medium">{selectedShipment.address}{selectedShipment.city ? `, ${selectedShipment.city}` : ""}</p>
                    </div>
                  )}
                  {selectedShipment.estimated_delivery_date && (
                    <div>
                      <span className="text-xs text-muted-foreground">Entrega estimada</span>
                      <p className="font-medium">{new Date(selectedShipment.estimated_delivery_date).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Estado</h3>
              <Select
                value={selected.status}
                onValueChange={(v) => updateStatus(selected.id, v)}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openWhatsApp(selected)}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => downloadDetails(selected)}>
                <Download className="h-4 w-4" /> Descargar
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setReceiptOrder(selected); }}>
                <FileText className="h-4 w-4" /> Recibo
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Receipt dialog */}
      <OrderReceipt
        open={!!receiptOrder}
        onOpenChange={(o) => { if (!o) setReceiptOrder(null); }}
        order={receiptOrder}
        store={storeData}
      />
    </div>
  );
};

export default Orders;
