import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../store/useStore';

interface SizeGuideModalProps {
  product: Product;
  onClose: () => void;
}

export default function SizeGuideModal({ product, onClose }: SizeGuideModalProps) {
  // Dynamic size guide based on product category
  const getSizeGuide = () => {
    const category = product.category?.toLowerCase() || '';
    
    // Check if product has custom size guide
    if (product.size_guide && Object.keys(product.size_guide).length > 0) {
      return product.size_guide;
    }
    
    // Default size guides based on category
    if (category.includes('trouser') || category.includes('pant') || category.includes('short')) {
      return {
        type: 'bottoms',
        data: [
          { size: 'S', waist: '28-30', hip: '36-38', length: '40' },
          { size: 'M', waist: '30-32', hip: '38-40', length: '41' },
          { size: 'L', waist: '32-34', hip: '40-42', length: '42' },
          { size: 'XL', waist: '34-36', hip: '42-44', length: '43' },
          { size: '2XL', waist: '36-38', hip: '44-46', length: '44' },
        ],
      };
    }
    
    // Default to tops
    return {
      type: 'tops',
      data: [
        { size: 'S', chest: '36-38', length: '27', shoulder: '17' },
        { size: 'M', chest: '38-40', length: '28', shoulder: '18' },
        { size: 'L', chest: '40-42', length: '29', shoulder: '19' },
        { size: 'XL', chest: '42-44', length: '30', shoulder: '20' },
        { size: '2XL', chest: '44-46', length: '31', shoulder: '21' },
      ],
    };
  };

  const sizeGuide = getSizeGuide();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Size Guide</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* How to Measure */}
          <div>
            <h3 className="text-lg font-bold mb-4">How to Measure</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold mb-2">Chest</h4>
                <p className="text-sm text-gray-600">
                  Measure around the fullest part of your chest, keeping the tape horizontal.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold mb-2">Waist</h4>
                <p className="text-sm text-gray-600">
                  Measure around your natural waistline, just above the belly button.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold mb-2">Length</h4>
                <p className="text-sm text-gray-600">
                  Measure from the highest point of the shoulder to the desired hem length.
                </p>
              </div>
            </div>
          </div>

          {/* Size Chart */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {sizeGuide.type === 'bottoms' ? 'Bottoms & Trousers' : 'Tops & T-Shirts'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    {sizeGuide.type === 'bottoms' ? (
                      <>
                        <th className="py-3 px-4 text-left">Size</th>
                        <th className="py-3 px-4 text-left">Waist (in)</th>
                        <th className="py-3 px-4 text-left">Hip (in)</th>
                        <th className="py-3 px-4 text-left">Length (in)</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-4 text-left">Size</th>
                        <th className="py-3 px-4 text-left">Chest (in)</th>
                        <th className="py-3 px-4 text-left">Length (in)</th>
                        <th className="py-3 px-4 text-left">Shoulder (in)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.data.map((row: any, i: number) => (
                    <tr key={row.size} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 font-bold">{row.size}</td>
                      {sizeGuide.type === 'bottoms' ? (
                        <>
                          <td className="py-3 px-4">{row.waist}</td>
                          <td className="py-3 px-4">{row.hip}</td>
                          <td className="py-3 px-4">{row.length}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4">{row.chest}</td>
                          <td className="py-3 px-4">{row.length}</td>
                          <td className="py-3 px-4">{row.shoulder}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Size Info */}
          {product.model_size && (
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3">Model Information</h3>
              <p className="text-sm text-gray-700">{product.model_size}</p>
            </div>
          )}

          {/* Fit Guide */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3">Fit Guide</h3>
            {product.fit && (
              <p className="text-sm text-gray-700 mb-3">
                <strong>This Product:</strong> {product.fit}
              </p>
            )}
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Oversized Fit:</strong> Relaxed and loose, 1-2 sizes larger than regular</li>
              <li>• <strong>Regular Fit:</strong> Classic fit, true to size</li>
              <li>• <strong>Slim Fit:</strong> Tailored and close to body</li>
              <li>• <strong>Wide Leg:</strong> Relaxed through the leg with wide opening</li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• If you're between sizes, we recommend sizing up for a more comfortable fit</li>
              <li>• All measurements are in inches</li>
              <li>• Allow 1-2 cm tolerance for manual measurements</li>
              <li>• When in doubt, check product reviews for fit feedback</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
