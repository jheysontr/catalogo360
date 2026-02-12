import type { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => (
  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
    <div className="aspect-square overflow-hidden bg-muted">
      <img
        src={product.image_url || "/placeholder.svg"}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <CardContent className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">{product.category}</p>
      <h3 className="mt-1 font-display font-semibold text-foreground">{product.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      <p className="mt-3 font-display text-lg font-bold text-foreground">
        ${product.price.toFixed(2)}
      </p>
    </CardContent>
  </Card>
);

export default ProductCard;
