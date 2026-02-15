import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, Store, Package, UserPlus } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "order" | "store" | "product" | "user";
  title: string;
  subtitle: string;
  date: string;
}

const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short" });
};

const iconMap = {
  order: ShoppingCart,
  store: Store,
  product: Package,
  user: UserPlus,
};

const colorMap = {
  order: "text-purple-600",
  store: "text-primary",
  product: "text-orange-600",
  user: "text-blue-600",
};

const AdminActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);

      const [ordersRes, storesRes, productsRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("id, customer_name, total_price, created_at, store_id").order("created_at", { ascending: false }).limit(10),
        supabase.from("stores").select("id, store_name, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("products").select("id, name, created_at, store_id").order("created_at", { ascending: false }).limit(10),
        supabase.from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      const items: ActivityItem[] = [
        ...(ordersRes.data || []).map((o: any) => ({
          id: `order-${o.id}`,
          type: "order" as const,
          title: `Nueva orden de ${o.customer_name}`,
          subtitle: `$${Number(o.total_price).toFixed(2)}`,
          date: o.created_at,
        })),
        ...(storesRes.data || []).map((s: any) => ({
          id: `store-${s.id}`,
          type: "store" as const,
          title: `Tienda creada: ${s.store_name}`,
          subtitle: "Nueva tienda registrada",
          date: s.created_at,
        })),
        ...(productsRes.data || []).map((p: any) => ({
          id: `product-${p.id}`,
          type: "product" as const,
          title: `Producto agregado: ${p.name}`,
          subtitle: "Nuevo producto",
          date: p.created_at,
        })),
        ...(profilesRes.data || []).map((u: any) => ({
          id: `user-${u.id}`,
          type: "user" as const,
          title: `Nuevo usuario: ${u.full_name || u.email}`,
          subtitle: u.email,
          date: u.created_at,
        })),
      ];

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(items.slice(0, 30));
      setLoading(false);
    };

    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Actividad Reciente</h1>
      <p className="mt-1 text-sm text-muted-foreground">Últimos eventos de la plataforma</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <p className="text-sm">No hay actividad reciente</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((item) => {
                const Icon = iconMap[item.type];
                return (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className={`h-5 w-5 ${colorMap[item.type]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{fmtRelative(item.date)}</span>
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

export default AdminActivity;
