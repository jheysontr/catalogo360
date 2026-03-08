import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  viewMode: "grid" | "list";
  count?: number;
}

const ProductSkeleton = ({ viewMode, count = 6 }: ProductSkeletonProps) => {
  const items = Array.from({ length: count });

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3">
        {items.map((_, i) => (
          <div key={i} className="flex overflow-hidden rounded-2xl border bg-card">
            <Skeleton className="h-36 w-36 flex-shrink-0 sm:h-40 sm:w-40" />
            <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-5 w-20 mt-1" />
              </div>
              <div className="flex justify-end mt-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="mt-2.5 space-y-1.5 px-0.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
