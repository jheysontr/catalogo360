import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, ShoppingCart, Clock, Check, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCurrencySymbol } from "@/lib/currency";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface OrderNotification {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string;
  total_price: number;
  items: any;
  status: string;
  created_at: string;
}

interface Props {
  storeId: string;
  currency?: string;
  onNavigateToOrders?: () => void;
}

const STORAGE_KEY = "notifications_read_ids";

const getReadIds = (storeId: string): Set<string> => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${storeId}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadIds = (storeId: string, ids: Set<string>) => {
  localStorage.setItem(`${STORAGE_KEY}_${storeId}`, JSON.stringify([...ids]));
};

const NotificationPanel = ({ storeId, currency = "BOB", onNavigateToOrders }: Props) => {
  const [orders, setOrders] = useState<OrderNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const symbol = getCurrencySymbol(currency);

  const fetchRecentOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, customer_name, customer_phone, customer_email, total_price, items, status, created_at")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setOrders(data);
  }, [storeId]);

  // Initial fetch + load read state
  useEffect(() => {
    setReadIds(getReadIds(storeId));
    fetchRecentOrders();
  }, [storeId, fetchRecentOrders]);

  // Realtime subscription for new orders
  useEffect(() => {
    const channel = supabase
      .channel(`notif-orders-${storeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `store_id=eq.${storeId}` },
        (payload) => {
          const newOrder = payload.new as OrderNotification;
          setOrders((prev) => [newOrder, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [storeId]);

  const unreadCount = orders.filter((o) => !readIds.has(o.id)).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(storeId, next);
      return next;
    });
  };

  const markAllAsRead = () => {
    const next = new Set(readIds);
    orders.forEach((o) => next.add(o.id));
    setReadIds(next);
    saveReadIds(storeId, next);
  };

  const getItemCount = (items: any) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum: number, i: any) => sum + (i.quantity || i.qty || 1), 0);
  };

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 sm:w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} nueva{unreadCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllAsRead}>
              <CheckCheck className="h-3 w-3" />
              Marcar todo
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[400px]">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 opacity-40" />
              <p className="text-sm">Sin notificaciones aún</p>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                const isUnread = !readIds.has(order.id);
                const itemCount = getItemCount(order.items);

                return (
                  <button
                    key={order.id}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                      isUnread ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      markAsRead(order.id);
                      onNavigateToOrders?.();
                      setOpen(false);
                    }}
                  >
                    {/* Dot indicator */}
                    <div className="mt-1.5 flex-shrink-0">
                      {isUnread ? (
                        <span className="block h-2 w-2 rounded-full bg-primary" />
                      ) : (
                        <span className="block h-2 w-2 rounded-full bg-transparent" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${isUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          🛒 {order.customer_name}
                        </p>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[order.status] ?? statusColor.pending}`}>
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {symbol} {order.total_price.toFixed(2)}
                        </span>
                        <span>•</span>
                        <span>{itemCount} producto{itemCount !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {orders.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-primary"
              onClick={() => {
                onNavigateToOrders?.();
                setOpen(false);
              }}
            >
              Ver todas las órdenes
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
