import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideModalProps {
  sizeGuide?: { chart: any[]; unit: string } | null;
  category?: string;
  modelSize?: string | null;
  fit?: string | null;
  onClose: () => void;
}

export default function SizeGuideModal({ 
  sizeGuide, 
  category, 
  modelSize, 
  fit, 
  onClose 
}: SizeGuideModalProps) {
  
  // Default size guides based on category
  const getDefaultSizeGuide = () => {
    const cat = category?.toLowerCase() || '';
    
    if (cat.includes('trouser') || cat.includes('pant') || cat.includes('short') || cat.includes('bottom')) {
      return {
        type: 'bottoms',
        title: 'Bottoms & Trousers',
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
      title: 'Tops & T-Shirts',
      data: [
        { size: 'S', chest: '36-38', length: '27', shoulder: '17' },
        { size: 'M', chest: '38-40', length: '28', shoulder: '18' },
        { size: 'L', chest: '40-42', length: '29', shoulder: '19' },
        { size: 'XL', chest: '42-44', length: '30', shoulder: '20' },
        { size: '2XL', chest: '44-46', length: '31', shoulder: '21' },
      ],
    };
  };

  const guideData = sizeGuide && sizeGuide.chart && sizeGuide.chart.length > 0 
    ? { type: 'custom', title: 'Size Chart', data: sizeGuide.chart, unit: sizeGuide.unit || 'inches' }
    : getDefaultSizeGuide();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold">{guideData.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
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

          {/* Size Chart Table */}
          <div>
            <h3 className="text-lg font-bold mb-4">Size Chart ({guideData.unit || 'inches'})</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Size</th>
                    {guideData.type === 'bottoms' ? (
                      <>
                        <th className="py-3 px-4 text-left font-semibold">Waist</th>
                        <th className="py-3 px-4 text-left font-semibold">Hip</th>
                        <th className="py-3 px-4 text-left font-semibold">Length</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-4 text-left font-semibold">Chest</th>
                        <th className="py-3 px-4 text-left font-semibold">Length</th>
                        <th className="py-3 px-4 text-left font-semibold">Shoulder</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {guideData.data.map((row: any, i: number) => (
                    <tr key={row.size} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 font-bold">{row.size}</td>
                      {guideData.type === 'bottoms' ? (
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
          {modelSize && (
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3">Model Information</h3>
              <p className="text-sm text-gray-700">Model wears size: {modelSize}</p>
            </div>
          )}

          {/* Fit Guide */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3">Fit Guide</h3>
            {fit && (
              <p className="text-sm text-gray-700 mb-3">
                <strong>This Product:</strong> {fit}
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
              <li>• All measurements are in {guideData.unit || 'inches'}</li>
              <li>• Allow 1-2 cm tolerance for manual measurements</li>
              <li>• When in doubt, check product reviews for fit feedback</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
