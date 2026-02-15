import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Store, Search, Eye, Ban, CheckCircle, Trash2, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface StoreRow {
  id: string;
  store_name: string;
  store_slug: string;
  email: string | null;
  is_active: boolean;
  plan_id: string | null;
  created_at: string;
  user_id: string;
}

interface PlanRow {
  id: string;
  name: string;
  max_products: number;
}

const AdminStores = () => {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});

  const fetchData = async () => {
    setLoading(true);
    const [storesRes, plansRes] = await Promise.all([
      supabase.from("stores").select("id, store_name, store_slug, email, is_active, plan_id, created_at, user_id").order("created_at", { ascending: false }),
      supabase.from("pricing_plans").select("id, name, max_products"),
    ]);

    const storesList = (storesRes.data || []) as StoreRow[];
    setStores(storesList);
    setPlans(plansRes.data || []);

    // Fetch product and order counts per store
    if (storesList.length > 0) {
      const storeIds = storesList.map((s) => s.id);
      
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from("products").select("store_id", { count: "exact" }).in("store_id", storeIds),
        supabase.from("orders").select("store_id", { count: "exact" }).in("store_id", storeIds),
      ]);

      // Count per store from raw data
      const pCounts: Record<string, number> = {};
      const oCounts: Record<string, number> = {};
      (productsRes.data || []).forEach((p: any) => {
        pCounts[p.store_id] = (pCounts[p.store_id] || 0) + 1;
      });
      (ordersRes.data || []).forEach((o: any) => {
        oCounts[o.store_id] = (oCounts[o.store_id] || 0) + 1;
      });
      setProductCounts(pCounts);
      setOrderCounts(oCounts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleActive = async (store: StoreRow) => {
    const newStatus = !store.is_active;
    const { error } = await supabase
      .from("stores")
      .update({ is_active: newStatus })
      .eq("id", store.id);

    if (error) {
      toast.error("Error al actualizar estado");
      return;
    }
    toast.success(newStatus ? "Tienda activada" : "Tienda suspendida");
    fetchData();
  };

  const deleteStore = async (store: StoreRow) => {
    if (!confirm(`¿Eliminar la tienda "${store.store_name}"? Esta acción es irreversible.`)) return;

    const { error } = await supabase.from("stores").delete().eq("id", store.id);
    if (error) {
      toast.error("Error al eliminar tienda");
      return;
    }
    toast.success("Tienda eliminada");
    fetchData();
  };

  const openPlanDialog = (store: StoreRow) => {
    setSelectedStore(store);
    setSelectedPlanId(store.plan_id || "");
    setPlanDialogOpen(true);
  };

  const assignPlan = async () => {
    if (!selectedStore) return;
    const { error } = await supabase
      .from("stores")
      .update({ plan_id: selectedPlanId || null })
      .eq("id", selectedStore.id);

    if (error) {
      toast.error("Error al asignar plan");
      return;
    }
    toast.success("Plan asignado correctamente");
    setPlanDialogOpen(false);
    fetchData();
  };

  const filteredStores = stores.filter(
    (s) =>
      s.store_name.toLowerCase().includes(search.toLowerCase()) ||
      s.store_slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const getPlanName = (planId: string | null) => {
    if (!planId) return "Sin plan";
    return plans.find((p) => p.id === planId)?.name || "Desconocido";
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Gestión de Tiendas</h1>
          <p className="text-sm text-muted-foreground">{stores.length} tiendas registradas</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tienda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">Cargando tiendas...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tienda</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Productos</TableHead>
                  <TableHead className="hidden sm:table-cell">Órdenes</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{store.store_name}</p>
                        <p className="text-xs text-muted-foreground">/{store.store_slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {store.email || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {productCounts[store.id] || 0}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {orderCounts[store.id] || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getPlanName(store.plan_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.is_active ? "default" : "destructive"} className="text-xs">
                        {store.is_active ? "Activa" : "Suspendida"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Ver tienda"
                          onClick={() => window.open(`/store/${store.store_slug}`, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Asignar plan"
                          onClick={() => openPlanDialog(store)}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={store.is_active ? "Suspender" : "Activar"}
                          onClick={() => toggleActive(store)}
                        >
                          {store.is_active ? (
                            <Ban className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar"
                          onClick={() => deleteStore(store)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron tiendas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Plan — {selectedStore?.store_name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} (hasta {plan.max_products} productos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancelar</Button>
            <Button onClick={assignPlan}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStores;
