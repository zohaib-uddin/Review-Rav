import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RelatedProductsCarouselProps {
  products: any[];
  title?: string;
}

export default function RelatedProductsCarousel({ products, title = "You May Also Like" }: RelatedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(products.length / itemsPerPage));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(products.length / itemsPerPage)) % Math.ceil(products.length / itemsPerPage));
  };

  if (products.length === 0) return null;

  const visibleProducts = products.slice(
    currentIndex * itemsPerPage,
    (currentIndex * itemsPerPage) + itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        {products.length > itemsPerPage && (
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="p-2 border rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="p-2 border rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleProducts.map(product => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group"
          >
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-black transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {product.salePrice ? (
                <>
                  <span className="text-sm font-bold">
                    Rs. {product.salePrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    Rs. {product.price?.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold">
                  Rs. {product.price?.toLocaleString()}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {products.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(products.length / itemsPerPage) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-black w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
