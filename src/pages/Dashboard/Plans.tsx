import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Check, Crown, Loader2, Sparkles, Download, CreditCard, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ──────────────────────────────────── */

interface PlanDef {
  id: string;
  name: string;
  monthly: number;
  annual: number;
  maxProducts: number;
  features: string[];
  recommended?: boolean;
}

interface PaymentRecord {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: "paid" | "pending";
}

const fmtCurrency = (n: number) =>
  `Bs${n.toFixed(2)}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });

/* ─── Component ──────────────────────────────────── */

const Plans = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanDef[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [annual, setAnnual] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState<PlanDef | null>(null);
  const [changing, setChanging] = useState(false);

  // Current plan from store
  const [currentPlan, setCurrentPlan] = useState<string>("");

  // Simulated payment history
  const [payments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      // Fetch plans from DB
      const { data: dbPlans } = await supabase.from("pricing_plans").select("*").order("monthly_price");
      const mappedPlans: PlanDef[] = (dbPlans || []).map((p: any, i: number) => ({
        id: p.id,
        name: p.name,
        monthly: p.monthly_price,
        annual: p.annual_price,
        maxProducts: p.max_products,
        features: Array.isArray(p.features) ? p.features : [],
        recommended: i === 1, // middle plan = recommended
      }));
      setPlans(mappedPlans);

      // Check current plan from store
      const { data: stores } = await supabase
        .from("stores")
        .select("id, plan_id")
        .eq("user_id", user.id)
        .limit(1);

      if (stores?.[0]) {
        if (stores[0].plan_id) {
          setCurrentPlan(stores[0].plan_id);
        }

        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("store_id", stores[0].id);
        setProductCount(count ?? 0);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const activePlanDef = plans.find((p) => p.id === currentPlan);
  const maxProducts = activePlanDef?.maxProducts ?? 10;
  const isFree = activePlanDef?.monthly === 0;

  const handleChangePlan = async () => {
    if (!confirmPlan || !user) return;
    setChanging(true);

    // Update store's plan_id in the database
    const { data: stores } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (stores?.[0]) {
      const { error } = await supabase
        .from("stores")
        .update({ plan_id: confirmPlan.id })
        .eq("id", stores[0].id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setChanging(false);
        return;
      }
    }

    setCurrentPlan(confirmPlan.id);
    setChanging(false);
    setConfirmPlan(null);
    toast({ title: "Plan actualizado", description: `Ahora tienes el plan ${confirmPlan.name}` });
  };

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
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Planes y Facturación</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estás en el plan <span className="font-semibold text-foreground">{activePlanDef?.name ?? "Gratis"}</span>
        </p>
      </div>

      {/* Current plan card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Plan {activePlanDef?.name ?? "Gratis"}
              </h2>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isFree
                ? "Gratis"
                : fmtCurrency(annual ? (activePlanDef?.annual ?? 0) : (activePlanDef?.monthly ?? 0))}
              {!isFree && <span className="text-sm font-normal text-muted-foreground">/mes</span>}
            </p>
          </div>

          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Productos: {productCount}/{maxProducts}</span>
              <span>{Math.round((productCount / maxProducts) * 100)}%</span>
            </div>
            <Progress value={(productCount / maxProducts) * 100} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="planes" className="w-full">
        <TabsList className="dashboard-tabs-list">
          <TabsTrigger value="planes" className="dashboard-tab-trigger gap-1.5">
            <CreditCard className="h-4 w-4" />
            Planes
          </TabsTrigger>
          <TabsTrigger value="historial" className="dashboard-tab-trigger gap-1.5">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Tab: Planes */}
        <TabsContent value="planes" className="mt-6 space-y-6">
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <Label htmlFor="billing-toggle" className="text-sm text-muted-foreground">
              Mensual
            </Label>
            <Switch id="billing-toggle" checked={annual} onCheckedChange={setAnnual} />
            <Label htmlFor="billing-toggle" className="text-sm text-muted-foreground">
              Anual
            </Label>
            {annual && (
              <Badge className="ml-1 bg-primary/10 text-primary border-primary/20">
                40% descuento
              </Badge>
            )}
          </div>

          {/* Plan cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isActive = currentPlan === plan.id;
              const price = annual ? plan.annual : plan.monthly;

              return (
                <Card
                  key={plan.id}
                  className={`relative transition-shadow hover:shadow-md ${
                    plan.recommended ? "border-primary shadow-sm" : ""
                  } ${isActive ? "ring-2 ring-primary" : ""}`}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-2.5 right-4 gap-1 bg-primary text-primary-foreground">
                      <Sparkles className="h-3 w-3" /> Recomendado
                    </Badge>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 font-display text-xl">
                      {plan.id === "pro" && <Crown className="h-5 w-5 text-primary" />}
                      Plan {plan.name}
                    </CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-foreground">{fmtCurrency(price)}</span>
                      <span className="text-sm text-muted-foreground">/mes</span>
                      {annual && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Facturado {fmtCurrency(price * 12)}/año
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {isActive ? (
                      <Button disabled className="w-full" variant="secondary">
                        Plan actual
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => setConfirmPlan(plan)}>
                        Cambiar a este plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="historial" className="mt-6">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <CreditCard className="h-10 w-10" />
                <p className="text-sm">Aún no tienes pagos registrados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{fmtDate(p.date)}</TableCell>
                      <TableCell className="font-medium">{p.plan}</TableCell>
                      <TableCell>{fmtCurrency(p.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            p.status === "paid"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {p.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Recibo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm plan change dialog */}
      <Dialog open={!!confirmPlan} onOpenChange={(o) => !o && setConfirmPlan(null)}>
        {confirmPlan && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Cambiar a Plan {confirmPlan.name}</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas cambiar al Plan {confirmPlan.name}?
              </DialogDescription>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-semibold">{confirmPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Precio</span>
                <span className="font-semibold">
                  {fmtCurrency(annual ? confirmPlan.annual : confirmPlan.monthly)}/mes
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Facturación</span>
                <span className="font-semibold">{annual ? "Anual" : "Mensual"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Productos máx.</span>
                <span className="font-semibold">{confirmPlan.maxProducts}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmPlan(null)}>
                Cancelar
              </Button>
              <Button onClick={handleChangePlan} disabled={changing}>
                {changing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar cambio
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Plans;
