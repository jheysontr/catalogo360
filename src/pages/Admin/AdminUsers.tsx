import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Users, ShieldCheck, ShieldX, Loader2, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserRow {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  created_at: string;
  store_count: number;
  is_admin: boolean;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleAction, setRoleAction] = useState<{ user: UserRow; action: "grant" | "revoke" } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);

    const [profilesRes, storesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("stores").select("user_id"),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);

    const storeCounts: Record<string, number> = {};
    (storesRes.data || []).forEach((s: any) => {
      storeCounts[s.user_id] = (storeCounts[s.user_id] || 0) + 1;
    });

    const adminSet = new Set((rolesRes.data || []).map((r: any) => r.user_id));

    const mapped: UserRow[] = (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      email: p.email,
      full_name: p.full_name,
      business_name: p.business_name,
      created_at: p.created_at,
      store_count: storeCounts[p.user_id] || 0,
      is_admin: adminSet.has(p.user_id),
    }));

    setUsers(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async () => {
    if (!roleAction) return;
    const { user, action } = roleAction;

    if (action === "grant") {
      const { error } = await supabase.from("user_roles").insert({ user_id: user.user_id, role: "admin" });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Rol asignado", description: `${user.email} ahora es administrador` });
      }
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", user.user_id).eq("role", "admin");
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Rol removido", description: `${user.email} ya no es administrador` });
      }
    }

    setRoleAction(null);
    fetchUsers();
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.business_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.is_admin).length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} usuarios · {adminCount} administradores
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{adminCount}</p>
              <p className="text-xs text-muted-foreground">Administradores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Store className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.store_count > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Con tienda</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.store_count === 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Sin tienda</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="hidden md:table-cell">Negocio</TableHead>
                  <TableHead>Tiendas</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden sm:table-cell">Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.business_name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.store_count}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
                      ) : (
                        <Badge variant="outline">Usuario</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {fmtDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.is_admin ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRoleAction({ user, action: "revoke" })}
                        >
                          <ShieldX className="mr-1.5 h-4 w-4" />
                          Quitar admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRoleAction({ user, action: "grant" })}
                        >
                          <ShieldCheck className="mr-1.5 h-4 w-4" />
                          Hacer admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role change confirmation */}
      <AlertDialog open={!!roleAction} onOpenChange={(o) => !o && setRoleAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {roleAction?.action === "grant" ? "Otorgar rol de administrador" : "Revocar rol de administrador"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {roleAction?.action === "grant"
                ? `¿Estás seguro de hacer a "${roleAction?.user.email}" administrador? Tendrá acceso completo al panel de administración.`
                : `¿Estás seguro de quitar el rol de administrador a "${roleAction?.user.email}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
