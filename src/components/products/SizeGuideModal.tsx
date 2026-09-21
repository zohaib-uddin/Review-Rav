import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeGuide?: {
    chart?: any[];
    unit?: string;
  } | null;
  product?: any;
}

const DEFAULT_CHART = [
  { size: 'S', chest: '40"', length: '28"', shoulder: '19"', sleeve: '8.5"' },
  { size: 'M', chest: '42"', length: '29"', shoulder: '20"', sleeve: '9.0"' },
  { size: 'L', chest: '44"', length: '30"', shoulder: '21"', sleeve: '9.5"' },
  { size: 'XL', chest: '46"', length: '31"', shoulder: '22"', sleeve: '10.0"' },
  { size: 'XXL', chest: '48"', length: '32"', shoulder: '23"', sleeve: '10.5"' },
];

export default function SizeGuideModal({ isOpen, onClose, sizeGuide, product }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const productGuide = product?.size_guide || sizeGuide;
  const unit = productGuide?.unit || 'inches';
  const rawChart = productGuide?.chart;

  const chart = Array.isArray(rawChart) && rawChart.length > 0 ? rawChart : DEFAULT_CHART;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Ruler size={20} className="text-black" />
                  <h3 className="text-lg font-bold uppercase tracking-wider text-black">
                    Size Guide & Measurements
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Oversized Streetwear Fit Chart
                  </p>
                  <span className="text-xs font-mono font-bold bg-gray-100 px-2.5 py-1 rounded text-black">
                    Unit: {unit}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-gray-200">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-black text-white font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Chest</th>
                        <th className="px-4 py-3">Length</th>
                        <th className="px-4 py-3">Shoulder</th>
                        <th className="px-4 py-3">Sleeve</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {chart.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-black">{row.size || row.Size}</td>
                          <td className="px-4 py-3 text-gray-700">{row.chest || row.Chest || '—'}</td>
                          <td className="px-4 py-3 text-gray-700">{row.length || row.Length || '—'}</td>
                          <td className="px-4 py-3 text-gray-700">{row.shoulder || row.Shoulder || '—'}</td>
                          <td className="px-4 py-3 text-gray-700">{row.sleeve || row.Sleeve || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Measuring Tips */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 text-xs space-y-2 text-gray-600">
                  <h4 className="font-bold uppercase tracking-wider text-black">Fit Advice:</h4>
                  <p>• Our streetwear fits are cut relaxed and true-to-size for a signature drop-shoulder silhouette.</p>
                  <p>• If you prefer a regular tailored fit instead of an oversized drape, consider sizing down one size.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
