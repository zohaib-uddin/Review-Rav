import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import FilterSidebar from '../components/collection/FilterSidebar';
import QuickViewModal from '../components/collection/QuickViewModal';
import CollectionHero from '../components/CollectionHero';
import ProductCard from '../components/ProductCard';

export default function CollectionPage() {
  const { categorySlug } = useParams();
  const { products, categories, fetchProducts, fetchCategories } = useStore();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  useEffect(() => {
    if (products.length === 0) fetchProducts();
    if (categories.length === 0) fetchCategories();
  }, []);

  useEffect(() => {
    if (categorySlug && products.length > 0) {
      // Get the current category and its subcategories
      const currentCategory = categories.find(c => c.slug === categorySlug);
      const subcategorySlugs = currentCategory
        ? categories
            .filter(c => c.parent_id === currentCategory.id)
            .map(c => c.slug)
        : [];

      // Filter products by category and its subcategories ONLY - NO sidebar filters
      let filtered = products.filter(p => 
        p.category === categorySlug || (p.category && subcategorySlugs.includes(p.category))
      );

      setFilteredProducts(filtered);
    }
  }, [categorySlug, products, categories]);

  const category = categories.find(c => c.slug === categorySlug);
  const subcategories = categories.filter(c => c.parent_id === category?.id);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
          <Link to="/" className="text-purple-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <CollectionHero category={category} />

      {/* Subcategory Navigation */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b sticky top-[64px] z-10 shadow-sm">
          <div className="max-w-[1920px] mx-auto px-4 py-4">
            <div className="flex gap-3 overflow-x-auto">
              <Link
                to={`/collections/${categorySlug}`}
                className="px-5 py-2.5 bg-black text-white rounded-none text-sm font-medium whitespace-nowrap hover:bg-gray-800 transition-colors"
              >
                All {category.name}
              </Link>
              {subcategories.map(sub => {
                const productCount = products.filter(p => p.category === sub.slug).length;
                return (
                  <Link
                    key={sub.slug}
                    to={`/collections/${sub.slug}`}
                    className="px-5 py-2.5 border rounded-none text-sm font-medium whitespace-nowrap hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                  >
                    {sub.name}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-none">
                      {productCount}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Product Grid - Full Width, NO Filters */}
      <div className="max-w-[1920px] mx-auto p-0">
        <div className="flex items-center justify-between mb-6 px-4">
          <p className="text-sm text-gray-500">
            {filteredProducts.length} products
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-0">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} fullWidth />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
