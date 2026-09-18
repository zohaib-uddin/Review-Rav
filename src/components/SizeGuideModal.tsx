import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SizeGuideData {
  enabled: boolean;
  categories?: {
    oversizedTees?: SizeTable;
    shorts?: SizeTable;
    shirts?: SizeTable;
    jackets?: SizeTable;
    bottoms?: SizeTable;
    hoodies?: SizeTable;
  };
}

interface SizeTable {
  sizes: string[];
  measurements: {
    chest?: number[];
    length?: number[];
    shoulder?: number[];
    sleeve?: number[];
    waist?: number[];
    hips?: number[];
    inseam?: number[];
  };
  unit: "inches" | "cm";
}

interface SizeGuideModalProps {
  product: any;
  onClose: () => void;
}

export default function SizeGuideModal({ product, onClose }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  
  // Check if size guide is enabled and has data
  const sizeGuide = product.size_guide as SizeGuideData | undefined;
  
  if (!sizeGuide?.enabled || !sizeGuide?.categories) {
    return null;
  }

  // Determine which category table to show based on product category
  const getCategoryTable = () => {
    const category = product.category?.toLowerCase() || '';
    const categories = sizeGuide.categories!;
    
    // Match product category to size guide category
    if (category.includes('tee') || category.includes('t-shirt') || category.includes('tshirt')) {
      return categories.oversizedTees || categories.shirts;
    }
    if (category.includes('short')) {
      return categories.shorts;
    }
    if (category.includes('shirt')) {
      return categories.shirts;
    }
    if (category.includes('jacket')) {
      return categories.jackets;
    }
    if (category.includes('pant') || category.includes('trouser') || category.includes('bottom')) {
      return categories.bottoms;
    }
    if (category.includes('hoodie') || category.includes('sweatshirt') || category.includes('coat')) {
      return categories.hoodies;
    }
    
    // Default to first available category
    return categories.oversizedTees || categories.shirts || categories.bottoms;
  };

  const table = getCategoryTable();
  
  if (!table) {
    return null;
  }

  const { sizes, measurements, unit: defaultUnit } = table;
  const conversionFactor = unit === 'cm' ? 2.54 : 1;
  const unitLabel = unit === 'cm' ? 'cm' : 'in';

  // Convert measurements if needed
  const convertMeasurement = (value: number | undefined) => {
    if (value === undefined) return '-';
    return Math.round(value * conversionFactor * 10) / 10;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Size Guide</h2>
              <p className="text-sm text-gray-500 mt-1">Find your perfect fit</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Unit Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    unit === 'inches' ? 'bg-white shadow text-black' : 'text-gray-500'
                  }`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    unit === 'cm' ? 'bg-white shadow text-black' : 'text-gray-500'
                  }`}
                >
                  CM
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* How to Measure */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">How to Measure</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-bold mb-2 text-gray-900">Chest</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Measure around the fullest part of your chest, keeping the tape horizontal and under your arms.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-bold mb-2 text-gray-900">Waist</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Measure around your natural waistline, just above the belly button, keeping the tape snug but not tight.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-bold mb-2 text-gray-900">Length</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Measure from the highest point of the shoulder down to the desired hem length.
                  </p>
                </div>
              </div>
            </div>

            {/* Size Chart Table */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-900">Size Chart</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="py-4 px-4 text-left font-semibold">Size</th>
                      {measurements.chest && <th className="py-4 px-4 text-left font-semibold">Chest ({unitLabel})</th>}
                      {measurements.waist && <th className="py-4 px-4 text-left font-semibold">Waist ({unitLabel})</th>}
                      {measurements.hips && <th className="py-4 px-4 text-left font-semibold">Hips ({unitLabel})</th>}
                      {measurements.length && <th className="py-4 px-4 text-left font-semibold">Length ({unitLabel})</th>}
                      {measurements.shoulder && <th className="py-4 px-4 text-left font-semibold">Shoulder ({unitLabel})</th>}
                      {measurements.sleeve && <th className="py-4 px-4 text-left font-semibold">Sleeve ({unitLabel})</th>}
                      {measurements.inseam && <th className="py-4 px-4 text-left font-semibold">Inseam ({unitLabel})</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size, sizeIndex) => (
                      <tr 
                        key={size} 
                        className={`${sizeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
                      >
                        <td className="py-4 px-4 font-bold text-gray-900">{size}</td>
                        {measurements.chest && (
                          <td className="py-4 px-4 text-gray-700">
                            {convertMeasurement(measurements.chest[sizeIndex])}
                          </td>
                        )}
                        {measurements.waist && (
                          <td className="py-4 px-4 text-gray-700">
                            {convertMeasurement(measurements.waist[sizeIndex])}
                          </td>
                        )}
                        {measurements.hips && (
                          <td className="py-4 px-4 text-gray-700">
                            {convertMeasurement(measurements.hips[sizeIndex])}
                          </td>
                        )}
                        {measurements.length && (
                          <td className="py-4 px-4 text-gray-700">
                            {convertMeasurement(measurements.length[sizeIndex])}
                          </td>
                        )}
                        {measurements.shoulder && (
                          <td className="py-4 px-4 text-gray-700">
                            {convertMeasurement(measurements.shoulder[sizeIndex])}
                          </td>
                        )}
                        {measurements.sleeve && (
                          <td className="py-4 px-4 text-gray-700">
                            {convertMeasurement(measurements.sleeve[sizeIndex])}
                          </td>
                        )}
                        {measurements.inseam && (
                          <td className="py-4 px-4 text-gray-700">
                            {convertMeasurement(measurements.inseam[sizeIndex])}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Size Info */}
            {product.model_size && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold mb-3 text-gray-900">Model Information</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{product.model_size}</p>
              </div>
            )}

            {/* Fit Guide */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-bold mb-3 text-gray-900">Fit Guide</h3>
              {product.fit && (
                <p className="text-sm text-gray-700 mb-4">
                  <strong className="text-gray-900">This Product:</strong> {product.fit}
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
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold mb-3 text-gray-900">Pro Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• If you're between sizes, we recommend sizing up for a more comfortable fit</li>
                <li>• All measurements are in {defaultUnit}. Use the toggle above to switch units</li>
                <li>• Allow 1-2 cm tolerance for manual measurements</li>
                <li>• When in doubt, check product reviews for fit feedback</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
