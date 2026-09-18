interface StockIndicatorProps {
  stockCount: number;
  lowStockThreshold?: number;
}

export default function StockIndicator({ stockCount, lowStockThreshold = 10 }: StockIndicatorProps) {
  if (stockCount <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Out of Stock</span>
      </div>
    );
  }

  if (stockCount <= lowStockThreshold) {
    return (
      <div className="flex items-center gap-2 text-orange-600">
        <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Only {stockCount} left in stock!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600">
      <div className="w-2 h-2 bg-green-600 rounded-full" />
      <span className="text-sm font-medium">In Stock ({stockCount} available)</span>
    </div>
  );
}
