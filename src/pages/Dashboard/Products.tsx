import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import ResponsiveTabsList from "@/components/Dashboard/ResponsiveTabs";
import {
  Plus, Search, Package, Loader2, LayoutGrid, List, FileDown, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductFormDialog from "@/components/Dashboard/ProductFormDialog";
import ProductListView from "@/components/Dashboard/ProductListView";
import type { Product, Category } from "@/components/Dashboard/ProductFormDialog";

const ITEMS_PER_PAGE = 15;
const MAX_PRODUCTS = 60;

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  /* ── Fetch store ── */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setStoreId(data[0].id);
      });
  }, [user]);

  /* ── Fetch categories ── */
  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("store_id", storeId);
    if (data) setCategories(data);
  }, [storeId]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ── Fetch products ── */
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("store_id", storeId);

    if (search) query = query.ilike("name", `%${search}%`);
    if (filterCategory !== "all") query = query.eq("category_id", filterCategory);
    if (filterStatus === "active") query = query.gt("stock", 0).eq("on_sale", false);
    else if (filterStatus === "inactive") query = query.eq("stock", 0);
    else if (filterStatus === "on_sale") query = query.eq("on_sale", true);

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      toast({ title: "Error", description: "Error al cargar productos", variant: "destructive" });
    } else {
      setProducts(data ?? []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [storeId, search, filterCategory, filterStatus, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, filterCategory, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const getStatus = (p: Product) => {
    if (p.on_sale) return { label: "En oferta" };
    if (p.stock === 0) return { label: "Inactivo" };
    return { label: "Activo" };
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "Sin categoría";
    return categories.find((c) => c.id === catId)?.name ?? "Sin categoría";
  };

  /* ── Actions ── */
  const openAddModal = () => { setEditingProduct(null); setModalOpen(true); };
  const openEditModal = (product: Product) => { setEditingProduct(product); setModalOpen(true); };

  const handleDuplicate = async (product: Product) => {
    if (!storeId) return;
    const { error } = await supabase.from("products").insert({
      name: `${product.name} (copia)`,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      on_sale: product.on_sale,
      discount_percent: product.discount_percent,
      category_id: product.category_id,
      attributes: product.attributes as any,
      extra_images: (product.extra_images as any) ?? [],
      variant_stock: (product.variant_stock as any) ?? {},
      variant_prices: ((product as any).variant_prices as any) ?? {},
      store_id: storeId,
    });
    if (error) toast({ title: "Error", description: "Error al duplicar", variant: "destructive" });
    else { toast({ title: "Producto duplicado" }); fetchProducts(); }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    if (product.image_url) {
      try {
        const url = new URL(product.image_url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/products\/(.+)/);
        if (pathMatch?.[1]) {
          await supabase.storage.from("products").remove([decodeURIComponent(pathMatch[1])]);
        }
      } catch { /* ignore */ }
    }
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) toast({ title: "Error", description: "Error al eliminar", variant: "destructive" });
    else { toast({ title: "Producto eliminado" }); fetchProducts(); }
  };

  /* ── CSV Export ── */
  const exportProductsCSV = () => {
    if (products.length === 0) return;
    const headers = ["Nombre", "Categoría", "Precio", "Stock", "Estado", "En oferta", "Descuento %"];
    const rows = products.map((p) => [
      p.name,
      getCategoryName(p.category_id),
      p.price.toFixed(2),
      String(p.stock),
      getStatus(p).label,
      p.on_sale ? "Sí" : "No",
      p.discount_percent ? String(p.discount_percent) : "0",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado", description: `${products.length} productos exportados` });
  };

  /* ── Derived ── */
  const lowStockProducts = products.filter((p) => p.stock <= 5 && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const fromItem = totalCount === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const toItem = Math.min(page * ITEMS_PER_PAGE, totalCount);

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground">{totalCount}/{MAX_PRODUCTS} productos usados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportProductsCSV} disabled={products.length === 0}>
            <FileDown className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button className="gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Agregar producto
          </Button>
        </div>
      </div>

      {/* Inventory alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {outOfStockProducts.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-950/30">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {outOfStockProducts.length} producto{outOfStockProducts.length !== 1 ? "s" : ""} agotado{outOfStockProducts.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-950/30">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                {lowStockProducts.length} producto{lowStockProducts.length !== 1 ? "s" : ""} con stock bajo (≤5)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Tabs */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
        <ResponsiveTabsList
          value={filterStatus}
          onValueChange={setFilterStatus}
          options={[
            { value: "all", label: "Todos" },
            { value: "active", label: "Activos" },
            { value: "on_sale", label: "En oferta" },
            { value: "inactive", label: "Agotados" },
          ]}
        />
      </Tabs>

      {/* Toolbar */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border bg-muted p-0.5">
          <Button variant={viewMode === "table" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("table")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No tienes productos aún</h3>
            <p className="text-sm text-muted-foreground">Agrega tu primer producto para comenzar a vender</p>
            <Button className="gap-2" onClick={openAddModal}>
              <Plus className="h-4 w-4" /> Crear primer producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProductListView
          products={products}
          categories={categories}
          viewMode={viewMode}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          fromItem={fromItem}
          toItem={toItem}
          onPageChange={setPage}
          onEdit={openEditModal}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}

      {/* Product Form Dialog */}
      {storeId && (
        <ProductFormDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          editingProduct={editingProduct}
          storeId={storeId}
          categories={categories}
          onSaved={fetchProducts}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Products;
