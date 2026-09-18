import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useState } from 'react';
import ProductComparison from './ProductComparison';

export default function CompareBar() {
  const { compareList, clearCompare } = useComparison();
  const [showComparison, setShowComparison] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-full shadow-2xl z-40 flex items-center gap-4"
      >
        <GitCompare size={20} />
        <span className="font-medium">
          {compareList.length} {compareList.length === 1 ? 'product' : 'products'} to compare
        </span>
        <button
          onClick={() => setShowComparison(true)}
          className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Compare Now
        </button>
        <button
          onClick={clearCompare}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </motion.div>

      {showComparison && (
        <ProductComparison />
      )}
    </>
  );
}
