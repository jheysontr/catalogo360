import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface PlanWithCount {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  max_products: number;
  max_stores: number;
  store_count: number;
}

const AdminPlans = () => {
  const [plans, setPlans] = useState<PlanWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const [plansRes, storesRes] = await Promise.all([
        supabase.from("pricing_plans").select("*"),
        supabase.from("stores").select("plan_id"),
      ]);

      const planCounts: Record<string, number> = {};
      (storesRes.data || []).forEach((s: any) => {
        if (s.plan_id) {
          planCounts[s.plan_id] = (planCounts[s.plan_id] || 0) + 1;
        }
      });

      const mapped = (plansRes.data || []).map((p: any) => ({
        ...p,
        store_count: planCounts[p.id] || 0,
      }));

      setPlans(mapped);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Gestión de Planes</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumen de planes y tiendas asignadas</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio mensual</span>
                <span className="font-semibold">${plan.monthly_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio anual</span>
                <span className="font-semibold">${plan.annual_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Máx. productos</span>
                <span>{plan.max_products}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiendas asignadas</span>
                <Badge variant="secondary">{plan.store_count}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="mt-8 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando planes...</p>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
