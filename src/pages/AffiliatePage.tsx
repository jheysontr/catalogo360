import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Users, DollarSign, TrendingUp, Copy, ExternalLink, Gift,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";

const AffiliatePage = () => {
  const { code } = useParams<{ code: string }>();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referrer, setReferrer] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!code || authLoading) return;

    (async () => {
      // Require authentication
      if (!user) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      const [configRes, referrerRes] = await Promise.all([
        supabase.from("platform_referral_config" as any).select("*").limit(1),
        supabase.from("platform_referrers" as any).select("*").eq("referral_code", code).limit(1),
      ]);

      const cfg = (configRes.data as any)?.[0];
      const ref = (referrerRes.data as any)?.[0];
      setConfig(cfg);

      if (!ref) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Verify the current user owns this referral code
      if (ref.user_id !== user.id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setReferrer(ref);

      const { data: refs } = await supabase
        .from("platform_referrals" as any)
        .select("*")
        .eq("referrer_id", ref.id)
        .order("created_at", { ascending: false });
      setReferrals((refs as any) ?? []);
      setLoading(false);
    })();
  }, [code, user, authLoading]);

  const copyLink = () => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "¡Enlace copiado!" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !referrer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <Gift className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Código no encontrado</h1>
        <p className="text-muted-foreground">Este enlace de afiliado no es válido.</p>
        <Button asChild><Link to="/">Ir al inicio</Link></Button>
      </div>
    );
  }

  const totalEarned = Number(referrer.total_earned);
  const totalRefs = Number(referrer.total_referrals);
  const pendingAmount = referrals.filter((r) => r.status !== "paid").reduce((s: number, r: any) => s + Number(r.commission_amount), 0);
  const paidAmount = referrals.filter((r) => r.status === "paid").reduce((s: number, r: any) => s + Number(r.commission_amount), 0);
  const registerLink = `${window.location.origin}/register?ref=${code}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Programa de Afiliados</h1>
          <p className="mt-2 text-muted-foreground">
            {config?.welcome_message || "Refiere amigos y gana comisiones."}
          </p>
          {config && (
            <Badge variant="secondary" className="mt-3 text-sm">
              Comisión: {config.commission_type === "percentage" ? `${config.commission_value}%` : `$${config.commission_value}`} por plan contratado
            </Badge>
          )}
        </div>

        {/* Referrer info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {referrer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">{referrer.name}</p>
                <p className="text-sm text-muted-foreground">Código: <span className="font-mono font-medium">{referrer.referral_code}</span></p>
              </div>
              <Badge variant={referrer.is_active ? "default" : "secondary"}>
                {referrer.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalRefs}</p>
                <p className="text-xs text-muted-foreground">Referidos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">${pendingAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Pendiente</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">${paidAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Pagado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share link */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Tu enlace de referido</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground truncate font-mono">
                {registerLink}
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Comparte este enlace. Cuando alguien se registre y contrate un plan, ganarás tu comisión.
            </p>
          </CardContent>
        </Card>

        {/* Recent referrals */}
        {referrals.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">Historial de comisiones</h3>
              <div className="space-y-3">
                {referrals.map((ref: any) => (
                  <div key={ref.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ref.referred_email || "—"}</p>
                      <p className="text-xs text-muted-foreground">Plan: {ref.plan_name || "—"} · {new Date(ref.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">${Number(ref.commission_amount).toFixed(2)}</p>
                      <Badge variant={ref.status === "paid" ? "default" : "outline"} className="text-xs">
                        {ref.status === "paid" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="gap-1.5">
            <Link to="/"><ExternalLink className="h-3.5 w-3.5" /> Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;
