import { motion } from 'framer-motion';
import { Package, ShoppingCart } from 'lucide-react';
import { useStore, Product } from '../store/useStore';

interface Bundle {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
}

interface BundleDealsProps {
  currentProductId?: string;
}

// Sample bundles - in production, these would come from the database
const sampleBundles: Bundle[] = [
  {
    id: 'bundle-winter',
    name: 'Complete Winter Set',
    description: 'Stay warm and stylish with our premium winter collection',
    productIds: ['1', '2', '3'], // Shadow Realm Co-Ord, Acid Wash Phantom Tee, Wide Leg Graphic Trouser
    originalPrice: 10500,
    bundlePrice: 8999,
    savings: 1501,
  },
  {
    id: 'bundle-streetwear',
    name: 'Streetwear Essentials',
    description: 'Build your streetwear wardrobe with these must-have pieces',
    productIds: ['4', '5', '6'], // Urban Drift Trackpants, Neon Pulse Graphic Shorts, Midnight Vortex Co-Ord
    originalPrice: 9900,
    bundlePrice: 8499,
    savings: 1401,
  },
  {
    id: 'bundle-premium',
    name: 'Premium Collection',
    description: 'Experience luxury streetwear at unbeatable prices',
    productIds: ['7', '8', '9'], // Reaper X Graphic Co-Ord, Denim Jacket, Classic Pullover Hoodie
    originalPrice: 11290,
    bundlePrice: 9499,
    savings: 1791,
  },
];

export default function BundleDeals({ currentProductId }: BundleDealsProps) {
  const { products, addToCart } = useStore();

  // Filter bundles that include the current product
  const relevantBundles = currentProductId
    ? sampleBundles.filter(bundle => bundle.productIds.includes(currentProductId))
    : sampleBundles;

  if (relevantBundles.length === 0) return null;

  const handleAddBundleToCart = (bundle: Bundle) => {
    bundle.productIds.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const firstColor = product.colors?.[0] as any;
        const colorName = typeof firstColor === 'string' ? firstColor : firstColor?.name || 'Black';
        addToCart(product, product.sizes?.[0] || 'M', colorName);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Package className="text-amber-600" size={24} />
        <div>
          <h3 className="text-xl font-bold">Bundle & Save</h3>
          <p className="text-sm text-gray-600">Get more, pay less</p>
        </div>
      </div>

      <div className="space-y-4">
        {relevantBundles.map((bundle, i) => {
          const bundleProducts = bundle.productIds
            .map(id => products.find(p => p.id === id))
            .filter(Boolean) as Product[];

          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-4 border-2 border-amber-200 hover:border-amber-400 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-lg">{bundle.name}</h4>
                  <p className="text-sm text-gray-600">{bundle.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 line-through">
                    Rs. {bundle.originalPrice.toLocaleString()}
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    Rs. {bundle.bundlePrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 font-bold">
                    Save Rs. {bundle.savings.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bundle Products Preview */}
              <div className="flex gap-2 mb-4">
                {bundleProducts.map((product, index) => (
                  <div key={product.id} className="flex-1">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{product.name}</p>
                  </div>
                ))}
              </div>

              {/* Add Bundle Button */}
              <button
                onClick={() => handleAddBundleToCart(bundle)}
                className="w-full bg-amber-600 text-white py-3 rounded-full font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Add Bundle to Cart
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
