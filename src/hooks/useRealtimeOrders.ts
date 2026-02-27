import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";

export const useRealtimeOrders = (storeId: string | null) => {
  const storeIdRef = useRef(storeId);
  storeIdRef.current = storeId;

  useEffect(() => {
    if (!storeId) return;

    const channel = supabase
      .channel(`orders-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const order = payload.new as any;
          toast.success(
            `🛒 Nueva orden de ${order.customer_name || "Cliente"} — Bs ${(order.total_price || 0).toFixed(2)}`,
            { duration: 6000, position: "top-right" }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);
};
