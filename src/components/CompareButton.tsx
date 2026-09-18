import { motion } from 'framer-motion';
import { GitCompare } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { Product } from '../store/useStore';

interface CompareButtonProps {
  product: Product;
}

export default function CompareButton({ product }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useComparison();
  const inCompare = isInCompare(product.id);
  const isDisabled = compareList.length >= 4 && !inCompare;

  const handleClick = () => {
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isDisabled}
      className={`p-2 rounded-full transition-colors ${
        inCompare
          ? 'bg-purple-600 text-white'
          : isDisabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-purple-600 hover:text-white'
      } shadow-md`}
      title={isDisabled ? 'Maximum 4 products' : inCompare ? 'Remove from comparison' : 'Add to comparison'}
    >
      <GitCompare size={18} />
    </motion.button>
  );
}
