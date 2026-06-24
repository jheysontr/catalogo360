import { getPlaceholderMeta } from "@/lib/storefrontPlaceholders";

interface ProductImagePlaceholderProps {
  productId?: string;
  name: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

/**
 * Friendly placeholder for products without an image:
 *  - Known placeholder products → curated emoji + tint
 *  - Any other product → first letter on a hashed pastel tint
 */
const ProductImagePlaceholder = ({ productId, name, className, iconSize = "md" }: ProductImagePlaceholderProps) => {
  const { emoji, tint } = getPlaceholderMeta({ id: productId, name });
  const sizeClass = iconSize === "lg" ? "text-5xl" : iconSize === "sm" ? "text-2xl" : "text-4xl";
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${tint}, ${tint}cc)` }}
      aria-hidden="true"
    >
      <span className={`${sizeClass} font-semibold leading-none text-foreground/80 drop-shadow-sm`}>{emoji}</span>
    </div>
  );
};

export default ProductImagePlaceholder;
