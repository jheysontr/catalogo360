import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  plan_id: string | null;
  currency: string;
  setup_completed: boolean;
}

export interface DashboardCounts {
  productCount: number;
  orderCount: number;
  pendingOrderCount: number;
  lowStockCount: number;
  activeCouponCount: number;
}

export interface DashboardStoreState extends DashboardCounts {
  store: StoreData | null;
  enabledModules: Record<string, boolean>;
  maxProducts: number;
  loading: boolean;
}

export function useDashboardStore(): DashboardStoreState {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [activeCouponCount, setActiveCouponCount] = useState(0);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [maxProducts, setMaxProducts] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const { data: stores } = await supabase
        .from("stores")
        .select("id, store_name, store_slug, plan_id, currency")
        .eq("user_id", user.id)
        .limit(1);

      if (!stores || stores.length === 0) {
        setLoading(false);
        return;
      }

      const s = stores[0];
      setStore(s);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [planRes, productCountRes, lowStockRes, pendingOrderRes, couponCountRes, todayOrdersRes] = await Promise.all([
        s.plan_id
          ? supabase.from("pricing_plans").select("enabled_modules, max_products").eq("id", s.plan_id).single()
          : Promise.resolve({ data: null }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", s.id),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", s.id).lte("stock", 5),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("store_id", s.id).eq("status", "pending"),
        supabase.from("coupons").select("id", { count: "exact", head: true }).eq("store_id", s.id).eq("is_active", true),
        supabase.from("orders").select("customer_name, items", { count: "exact" }).eq("store_id", s.id).gte("created_at", today.toISOString()).order("created_at", { ascending: false }).limit(1),
      ]);

      if (planRes.data) {
        const planData = planRes.data as any;
        if (planData.enabled_modules && typeof planData.enabled_modules === "object") {
          setEnabledModules(planData.enabled_modules as Record<string, boolean>);
        }
        if (typeof planData.max_products === "number") {
          setMaxProducts(planData.max_products);
        }
      }

      setProductCount(productCountRes.count ?? 0);
      setLowStockCount(lowStockRes.count ?? 0);
      setPendingOrderCount(pendingOrderRes.count ?? 0);
      setActiveCouponCount(couponCountRes.count ?? 0);
      setOrderCount(todayOrdersRes.count ?? 0);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return {
    store,
    productCount,
    orderCount,
    pendingOrderCount,
    lowStockCount,
    activeCouponCount,
    enabledModules,
    maxProducts,
    loading,
  };
}
