import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Grid, List } from "lucide-react";
import { useStore } from "../store/useStore";
import ProductCard from "../components/ProductCard";

export default function ShopAllPage() {
  const { products, fetchProducts } = useStore();
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [features, setFeatures] = useState<{ newArrival?: boolean; bestSeller?: boolean; featured?: boolean }>({});

  useEffect(() => { fetchProducts(); }, []);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => p.sizes?.forEach(s => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors?.forEach(c => {
      const colorName = typeof c === "string" ? c : c.name;
      colors.add(colorName);
    }));
    return Array.from(colors).sort();
  }, [products]);

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.base_price || 0), 50000), [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedSizes.length > 0) filtered = filtered.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    if (selectedColors.length > 0) filtered = filtered.filter(p => p.colors?.some(c => selectedColors.includes(typeof c === "string" ? c : c.name)));
    filtered = filtered.filter(p => { const price = p.base_price || 0; return price >= priceRange[0] && price <= priceRange[1]; });
    if (features.newArrival) filtered = filtered.filter(p => p.is_new_arrival);
    if (features.bestSeller) filtered = filtered.filter(p => p.is_best_seller);
    if (features.featured) filtered = filtered.filter(p => p.is_featured);
    switch (sortBy) {
      case "price-low": filtered.sort((a, b) => (a.base_price || 0) - (b.base_price || 0)); break;
      case "price-high": filtered.sort((a, b) => (b.base_price || 0) - (a.base_price || 0)); break;
      case "newest": filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: filtered.sort((a, b) => { if (a.is_featured && !b.is_featured) return -1; if (!a.is_featured && b.is_featured) return 1; return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); });
    }
    return filtered;
  }, [products, selectedSizes, selectedColors, priceRange, features, sortBy]);

  const toggleSize = (size: string) => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  const toggleColor = (color: string) => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  const clearAllFilters = () => { setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, maxPrice]); setFeatures({}); };
  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice || features.newArrival || features.bestSeller || features.featured;

  const gridButtonClass = (mode: string) => `p-2 hover:bg-gray-100 ${viewMode === mode ? "bg-black text-white" : ""}`;
  const sizeButtonClass = (size: string) => `px-3 py-2 text-sm border-2 rounded-none transition-all ${selectedSizes.includes(size) ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"}`;
  const colorButtonClass = (color: string) => `w-10 h-10 rounded-none border-2 transition-all ${selectedColors.includes(color) ? "border-black ring-2 ring-black ring-offset-2" : "border-gray-300"}`;
  const gridClass = viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" : "grid-cols-1";

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-2">COLLECTION</p>
            <h1 className="text-4xl md:text-5xl font-bold">Shop All</h1>
            <p className="text-gray-400 mt-2">{filteredProducts.length} products</p>
          </motion.div>
        </div>
      </div>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50">
              <SlidersHorizontal size={18} /><span className="text-sm font-medium">Filters</span>
            </button>
            <span className="text-sm text-gray-500 hidden lg:block">{filteredProducts.length} products</span>
            <div className="flex items-center gap-4 ml-auto">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-none text-sm font-medium bg-white hover:border-black transition-colors">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="flex items-center gap-1 border border-gray-300 rounded-none">
                <button onClick={() => setViewMode("grid")} className={gridButtonClass("grid")}><Grid size={18} /></button>
                <button onClick={() => setViewMode("list")} className={gridButtonClass("list")}><List size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto">
        <div className="flex">
          <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-gray-200 p-6 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Filters</h3>
              {hasActiveFilters && <button onClick={clearAllFilters} className="text-sm text-red-600 hover:text-red-700 font-medium">Clear All</button>}
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (<button key={size} onClick={() => toggleSize(size)} className={sizeButtonClass(size)}>{size}</button>))}
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Colors</h4>
              <div className="flex flex-wrap gap-3">
                {availableColors.map(color => (<button key={color} onClick={() => toggleColor(color)} className={colorButtonClass(color)} style={{ backgroundColor: color.toLowerCase() === "black" ? "#000" : color.toLowerCase() }} />))}
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Price Range</h4>
              <div className="space-y-3">
                <input type="range" min="0" max={maxPrice} value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-black" />
                <div className="flex items-center justify-between text-sm"><span>Rs. 0</span><span className="font-medium">Rs. {priceRange[1].toLocaleString()}</span></div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Features</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={features.newArrival} onChange={e => setFeatures(prev => ({ ...prev, newArrival: e.target.checked }))} className="w-4 h-4 accent-black" /><span className="text-sm">New Arrivals</span></label>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={features.bestSeller} onChange={e => setFeatures(prev => ({ ...prev, bestSeller: e.target.checked }))} className="w-4 h-4 accent-black" /><span className="text-sm">Best Sellers</span></label>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={features.featured} onChange={e => setFeatures(prev => ({ ...prev, featured: e.target.checked }))} className="w-4 h-4 accent-black" /><span className="text-sm">Featured</span></label>
              </div>
            </div>
          </aside>
          <main className="flex-1 p-4 lg:p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500 mb-4">No products found</p>
                <button onClick={clearAllFilters} className="px-6 py-3 bg-black text-white rounded-none hover:bg-gray-800">Clear Filters</button>
              </div>
            ) : (
              <div className={`grid ${gridClass} gap-0`}>
                {filteredProducts.map((product, i) => (<ProductCard key={product.id} product={product} index={i} fullWidth={viewMode === "grid"} />))}
              </div>
            )}
          </main>
        </div>
      </div>
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)}><X size={24} /></button>
              </div>
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (<button key={size} onClick={() => toggleSize(size)} className={sizeButtonClass(size)}>{size}</button>))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(color => (<button key={color} onClick={() => toggleColor(color)} className={colorButtonClass(color)} style={{ backgroundColor: color.toLowerCase() === "black" ? "#000" : color.toLowerCase() }} />))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Price Range</h4>
                <input type="range" min="0" max={maxPrice} value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-black" />
                <div className="flex items-center justify-between text-sm mt-2"><span>Rs. 0</span><span className="font-medium">Rs. {priceRange[1].toLocaleString()}</span></div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm uppercase tracking-wide">Features</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3"><input type="checkbox" checked={features.newArrival} onChange={e => setFeatures(prev => ({ ...prev, newArrival: e.target.checked }))} className="w-4 h-4 accent-black" /><span>New Arrivals</span></label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={features.bestSeller} onChange={e => setFeatures(prev => ({ ...prev, bestSeller: e.target.checked }))} className="w-4 h-4 accent-black" /><span>Best Sellers</span></label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={features.featured} onChange={e => setFeatures(prev => ({ ...prev, featured: e.target.checked }))} className="w-4 h-4 accent-black" /><span>Featured</span></label>
                </div>
              </div>
              <button onClick={() => { clearAllFilters(); setMobileFiltersOpen(false); }} className="w-full py-3 bg-black text-white rounded-none font-medium">Apply Filters</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
