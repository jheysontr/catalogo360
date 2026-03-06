import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";

const playNotificationSound = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1000;
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.65);
  } catch {
    // Audio not available
  }
};

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
          const items = Array.isArray(order.items) ? order.items : [];
          const itemCount = items.reduce((sum: number, i: any) => sum + (i.quantity || i.qty || 1), 0);

          playNotificationSound();

          toast.success(
            `🛒 ¡Nueva orden de ${order.customer_name || "Cliente"}!\n` +
            `💰 Bs ${(order.total_price || 0).toFixed(2)} • ${itemCount} producto${itemCount !== 1 ? "s" : ""}\n` +
            `📱 ${order.customer_phone || order.customer_email || ""}`,
            {
              duration: 8000,
              position: "top-right",
              style: {
                borderLeft: "4px solid #10b981",
                padding: "12px 16px",
                whiteSpace: "pre-line",
              },
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId]);
};
