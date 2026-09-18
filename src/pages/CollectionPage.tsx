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
  const [filters, setFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    priceRange: [0, 10000] as [number, number],
  });

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

      // Filter products by category and its subcategories
      let filtered = products.filter(p => 
        p.category === categorySlug || (p.category && subcategorySlugs.includes(p.category))
      );

      // Apply additional filters
      if (filters.sizes.length > 0) {
        filtered = filtered.filter(p => 
          filters.sizes.some(size => p.sizes?.includes(size) || p.attributes?.sizes?.includes(size))
        );
      }

      if (filters.colors.length > 0) {
        filtered = filtered.filter(p => 
          filters.colors.some(color => p.colors?.includes(color) || p.attributes?.colors?.includes(color))
        );
      }

      filtered = filtered.filter(p => {
        const price = p.salePrice || p.price || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });

      setFilteredProducts(filtered);
    }
  }, [categorySlug, products, categories, filters]);

  const category = categories.find(c => c.slug === categorySlug);
  const subcategories = categories.filter(c => c.parent_id === category?.id);

  // Get available sizes and colors for filters
  const availableSizes = Array.from(
    new Set(
      filteredProducts.flatMap(p => p.sizes || p.attributes?.sizes || [])
    )
  ).sort();

  const availableColors = Array.from(
    new Set(
      filteredProducts.flatMap(p => p.colors || p.attributes?.colors || [])
    )
  ).sort();

  const priceRange = {
    min: Math.min(...filteredProducts.map(p => p.salePrice || p.price || 0), 0),
    max: Math.max(...filteredProducts.map(p => p.salePrice || p.price || 0), 10000),
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <CollectionHero category={category} />

      {/* Subcategory Navigation */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b sticky top-[64px] z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-3 overflow-x-auto">
              <Link
                to={`/collections/${categorySlug}`}
                className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-800 transition-colors"
              >
                All {category.name}
              </Link>
              {subcategories.map(sub => {
                const productCount = products.filter(p => p.category === sub.slug).length;
                return (
                  <Link
                    key={sub.slug}
                    to={`/collections/${sub.slug}`}
                    className="px-5 py-2.5 border rounded-full text-sm font-medium whitespace-nowrap hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                  >
                    {sub.name}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {productCount}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              onFilterChange={setFilters}
              availableSizes={availableSizes}
              availableColors={availableColors}
              priceRange={priceRange}
            />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {filteredProducts.length} products
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
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
