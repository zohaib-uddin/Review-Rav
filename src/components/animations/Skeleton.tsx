interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[3/4] rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="bg-gray-200 h-4 rounded w-3/4" />
        <div className="bg-gray-200 h-4 rounded w-1/2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-3" />
      <div className="bg-gray-200 h-4 rounded w-2/3 mx-auto" />
    </div>
  );
}
