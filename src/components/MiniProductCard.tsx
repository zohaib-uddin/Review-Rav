import { Link } from 'react-router-dom';
import { Product } from '../store/useStore';

interface MiniProductCardProps {
  product: Product;
}

export default function MiniProductCard({ product }: MiniProductCardProps) {
  const imageUrl =
    product.images?.[0] ||
    product.image_url ||
    product.image ||
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&fit=crop';

  const basePrice = Number(product.base_price || product.price || 0);
  const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const destination = `/product/${product.slug || product.id}`;
  const isOutOfStock = Boolean(
    (product.stockCount !== undefined && Number(product.stockCount) <= 0) ||
    (product.stock !== undefined && Number(product.stock) <= 0) ||
    product.inStock === false ||
    product.is_in_stock === false
  );

  return (
    <Link
      to={destination}
      className="group block bg-white border border-gray-100 hover:border-black transition-all duration-200 overflow-hidden text-left"
      title={product.name}
    >
      {/* Compact Product Image */}
      <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Subtle Discount Tag on Top Right if comparePrice > basePrice */}
        {isOutOfStock ? (
          <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
            SOLD
          </span>
        ) : !isOutOfStock && comparePrice && comparePrice > basePrice ? (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 shadow-xs">
            {Math.round(((comparePrice - basePrice) / comparePrice) * 100)}% OFF
          </span>
        ) : null}
      </div>

      {/* Ultra Compact Info: Truncated Title, Base/Actual Price */}
      <div className="p-1.5 space-y-0.5">
        <p className="text-[11px] font-bold text-gray-900 truncate leading-tight group-hover:text-black">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-[11px] font-bold text-black font-mono">
            Rs.{basePrice.toLocaleString()}
          </span>
          {comparePrice && comparePrice > basePrice && (
            <span className="text-[9px] text-gray-400 line-through font-mono">
              Rs.{comparePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
