import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreVertical, Pencil, Copy, Trash2, Package } from "lucide-react";
import type { Product, Category } from "./ProductFormDialog";

interface Props {
  products: Product[];
  categories: Category[];
  viewMode: "table" | "grid";
  page: number;
  totalPages: number;
  totalCount: number;
  fromItem: number;
  toItem: number;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const getCategoryName = (catId: string | null, categories: Category[]) => {
  if (!catId) return "Sin categoría";
  return categories.find((c) => c.id === catId)?.name ?? "Sin categoría";
};

const getStatus = (p: Product) => {
  if (p.on_sale) return { label: "En oferta", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  if (p.stock === 0) return { label: "Inactivo", className: "bg-red-100 text-red-800 border-red-200" };
  return { label: "Activo", className: "bg-green-100 text-green-800 border-green-200" };
};

const discountedPrice = (price: number, discount: number) =>
  (price * (1 - discount / 100)).toFixed(2);

const PaginationControls = ({ page, totalPages, totalCount, fromItem, toItem, onPageChange }: {
  page: number; totalPages: number; totalCount: number; fromItem: number; toItem: number; onPageChange: (p: number) => void;
}) => (
  <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
    <p className="text-sm text-muted-foreground">Mostrando {fromItem}-{toItem} de {totalCount}</p>
    {totalPages > 1 && (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let num: number;
            if (totalPages <= 5) num = i + 1;
            else if (page <= 3) num = i + 1;
            else if (page >= totalPages - 2) num = totalPages - 4 + i;
            else num = page - 2 + i;
            return (
              <PaginationItem key={num}>
                <PaginationLink isActive={num === page} onClick={() => onPageChange(num)} className="cursor-pointer">{num}</PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )}
  </div>
);

const ProductListView = ({ products, categories, viewMode, page, totalPages, totalCount, fromItem, toItem, onPageChange, onEdit, onDuplicate, onDelete }: Props) => {
  if (viewMode === "table") {
    return (
      <>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="hidden sm:table-cell">Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Estado</TableHead>
                <TableHead className="w-12"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const status = getStatus(p);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-[50px] w-[50px] rounded-md object-cover" />
                      ) : (
                        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-left font-medium text-foreground hover:text-primary hover:underline"
                        onClick={() => onEdit(p)}
                      >
                        {p.name}
                      </button>
                      {p.on_sale && (
                        <Badge variant="secondary" className="ml-2 text-xs">-{p.discount_percent}%</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">{getCategoryName(p.category_id, categories)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">${p.price.toFixed(2)}</span>
                      {p.on_sale && p.discount_percent && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          ${discountedPrice(p.price, p.discount_percent)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={p.stock < 5 ? "font-medium text-destructive" : "text-foreground"}>
                        {p.stock} unidades
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(p)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(p)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(p)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <PaginationControls page={page} totalPages={totalPages} totalCount={totalCount} fromItem={fromItem} toItem={toItem} onPageChange={onPageChange} />
      </>
    );
  }

  // Grid view
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => {
          const status = getStatus(p);
          return (
            <Card key={p.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative aspect-square bg-muted">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge variant="outline" className={`absolute right-2 top-2 ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
              <CardContent className="space-y-2 p-4">
                <h3 className="truncate font-semibold text-foreground">{p.name}</h3>
                <Badge variant="outline" className="text-xs">{getCategoryName(p.category_id, categories)}</Badge>
                <p className="text-xl font-bold text-primary">${p.price.toFixed(2)}</p>
                <p className={`text-xs ${p.stock < 5 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {p.stock} unidades
                </p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(p)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <PaginationControls page={page} totalPages={totalPages} totalCount={totalCount} fromItem={fromItem} toItem={toItem} onPageChange={onPageChange} />
    </>
  );
};

export default ProductListView;
