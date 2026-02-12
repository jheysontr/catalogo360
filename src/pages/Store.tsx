import { useParams } from "react-router-dom";
import { Package } from "lucide-react";

const Store = () => {
  const { slug } = useParams();

  return (
    <div className="container py-16 text-center">
      <Package className="mx-auto h-16 w-16 text-muted-foreground/30" />
      <h1 className="mt-6 font-display text-3xl font-bold text-foreground">Tienda: {slug}</h1>
      <p className="mt-2 text-muted-foreground">
        Esta tienda estará disponible próximamente.
      </p>
    </div>
  );
};

export default Store;
