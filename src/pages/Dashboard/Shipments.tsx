import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShippingConfig from "@/pages/Dashboard/ShippingConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Loader2, MoreVertical, Pencil, Trash2, Copy, Truck, Package,
} from "lucide-react";

interface Shipment {
  id: string;
  order_id: string;
  store_id: string;
  shipping_method: string;
  tracking_number: string;
  cost: number;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  status: string;
  estimated_delivery_date: string | null;
  created_at: string;
  customer_name?: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "Procesando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
];

const METHOD_LABELS: Record<string, string> = {
  pickup: "Retiro en tienda",
  local: "Envío local",
  national: "Envío nacional",
};

const statusColor = (s: string) => {
  switch (s) {
    case "pending": return "bg-muted text-muted-foreground";
    case "processing": return "bg-orange-100 text-orange-800 border-orange-200";
    case "shipped": return "bg-blue-100 text-blue-800 border-blue-200";
    case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default: return "";
  }
};

const statusLabel = (s: string) => STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });

const Shipments = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [storeId, setStoreId] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selected, setSelected] = useState<Shipment | null>(null);
  const [editTracking, setEditTracking] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editEstimated, setEditEstimated] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("stores").select("id").eq("user_id", user.id).limit(1);
      if (data?.[0]) setStoreId(data[0].id);
    })();
  }, [user]);

  useEffect(() => {
    if (storeId) fetchShipments();
  }, [storeId]);

  const fetchShipments = async () => {
    if (!storeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch order customer names
      const orderIds = [...new Set((data as any[]).map((s) => s.order_id))];
      if (orderIds.length > 0) {
        const { data: orders } = await supabase
          .from("orders")
          .select("id, customer_name")
          .in("id", orderIds);
        const nameMap = new Map((orders ?? []).map((o) => [o.id, o.customer_name]));
        setShipments(
          (data as any[]).map((s) => ({ ...s, customer_name: nameMap.get(s.order_id) || "—" }))
        );
      } else {
        setShipments(data as any[]);
      }
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let list = [...shipments];
    if (statusFilter !== "all") list = list.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.tracking_number.toLowerCase().includes(q) ||
          (s.customer_name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [shipments, statusFilter, search]);

  const openDetail = (s: Shipment) => {
    setSelected(s);
    setEditTracking(s.tracking_number);
    setEditStatus(s.status);
    setEditEstimated(s.estimated_delivery_date ? s.estimated_delivery_date.slice(0, 10) : "");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("shipments")
      .update({
        tracking_number: editTracking,
        status: editStatus,
        estimated_delivery_date: editEstimated ? new Date(editEstimated).toISOString() : null,
      })
      .eq("id", selected.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" });
    } else {
      toast({ title: "Envío actualizado" });
      setSelected(null);
      fetchShipments();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("shipments").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    } else {
      toast({ title: "Envío eliminado" });
      fetchShipments();
    }
    setDeleteTarget(null);
  };

  const copyTracking = (t: string) => {
    if (!t) return;
    navigator.clipboard.writeText(t);
    toast({ title: "Número de rastreo copiado" });
  };

  const quickStatus = async (shipment: Shipment, newStatus: string) => {
    const { error } = await supabase.from("shipments").update({ status: newStatus }).eq("id", shipment.id);
    if (!error) fetchShipments();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Envíos</h1>
        <p className="text-sm text-muted-foreground">Gestiona los envíos y configuración de métodos de envío</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="list" className="dashboard-tab-trigger gap-1.5">
            <Package className="h-4 w-4" /> Envíos
          </TabsTrigger>
          <TabsTrigger value="config" className="dashboard-tab-trigger gap-1.5">
            <Truck className="h-4 w-4" /> Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-6">

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por rastreo o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
          <Truck className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">Sin envíos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Los envíos se crearán automáticamente cuando los clientes completen pedidos
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Rastreo</TableHead>
                <TableHead className="hidden lg:table-cell">Entrega est.</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{shortId(s.order_id)}</TableCell>
                  <TableCell className="font-medium">{s.customer_name || "—"}</TableCell>
                  <TableCell className="text-sm">{METHOD_LABELS[s.shipping_method] || s.shipping_method}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(s.status)}>
                      {statusLabel(s.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {s.tracking_number ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">{s.tracking_number}</span>
                        <button onClick={() => copyTracking(s.tracking_number)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {s.estimated_delivery_date ? fmtDate(s.estimated_delivery_date) : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetail(s)}>
                          <Pencil className="mr-2 h-4 w-4" /> Ver / Editar
                        </DropdownMenuItem>
                        {s.status === "pending" && (
                          <DropdownMenuItem onClick={() => quickStatus(s, "processing")}>
                            Marcar Procesando
                          </DropdownMenuItem>
                        )}
                        {s.status === "processing" && (
                          <DropdownMenuItem onClick={() => quickStatus(s, "shipped")}>
                            Marcar Enviado
                          </DropdownMenuItem>
                        )}
                        {s.status === "shipped" && (
                          <DropdownMenuItem onClick={() => quickStatus(s, "delivered")}>
                            Marcar Entregado
                          </DropdownMenuItem>
                        )}
                        {s.tracking_number && (
                          <DropdownMenuItem onClick={() => copyTracking(s.tracking_number)}>
                            <Copy className="mr-2 h-4 w-4" /> Copiar rastreo
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail / Edit Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        {selected && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Envío — Orden #{shortId(selected.order_id)}</DialogTitle>
              <DialogDescription>
                {METHOD_LABELS[selected.shipping_method]} • Creado {fmtDate(selected.created_at)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selected.address && (
                <div>
                  <Label className="text-xs text-muted-foreground">Dirección</Label>
                  <p className="text-sm">{selected.address}{selected.city ? `, ${selected.city}` : ""}{selected.postal_code ? ` (${selected.postal_code})` : ""}</p>
                </div>
              )}
              {selected.phone && (
                <div>
                  <Label className="text-xs text-muted-foreground">Teléfono</Label>
                  <p className="text-sm">{selected.phone}</p>
                </div>
              )}
              {selected.cost > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Costo envío</Label>
                  <p className="text-sm font-semibold">${selected.cost.toFixed(2)}</p>
                </div>
              )}

              <div>
                <Label htmlFor="edit-tracking">Número de rastreo</Label>
                <Input
                  id="edit-tracking"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  placeholder="TRK-XXXXXXXX"
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-estimated">Fecha estimada de entrega</Label>
                <Input
                  id="edit-estimated"
                  type="date"
                  value={editEstimated}
                  onChange={(e) => setEditEstimated(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar envío?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el registro de envío de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </TabsContent>

        <TabsContent value="config" className="mt-4">
          <ShippingConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Shipments;
