import { motion } from 'framer-motion';

export default function SizeGuide() {
  const sizeCharts = [
    {
      title: 'T-Shirts & Tops',
      headers: ['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'],
      rows: [
        ['S', '38', '27', '17'],
        ['M', '40', '28', '18'],
        ['L', '42', '29', '19'],
        ['XL', '44', '30', '20'],
        ['2XL', '46', '31', '21'],
        ['3XL', '48', '32', '22'],
      ],
    },
    {
      title: 'Trousers & Trackpants',
      headers: ['Size', 'Waist (in)', 'Hip (in)', 'Length (in)', 'Inseam (in)'],
      rows: [
        ['S', '28-30', '36-38', '40', '30'],
        ['M', '30-32', '38-40', '41', '31'],
        ['L', '32-34', '40-42', '42', '32'],
        ['XL', '34-36', '42-44', '43', '33'],
        ['2XL', '36-38', '44-46', '44', '34'],
      ],
    },
    {
      title: 'Co-Ord Sets',
      headers: ['Size', 'Chest (in)', 'Waist (in)', 'Top Length (in)', 'Trouser Length (in)'],
      rows: [
        ['S', '38', '28-30', '27', '40'],
        ['M', '40', '30-32', '28', '41'],
        ['L', '42', '32-34', '29', '42'],
        ['XL', '44', '34-36', '30', '43'],
      ],
    },
    {
      title: 'Jackets',
      headers: ['Size', 'Chest (in)', 'Length (in)', 'Sleeve (in)', 'Shoulder (in)'],
      rows: [
        ['S', '40', '26', '25', '17'],
        ['M', '42', '27', '25.5', '18'],
        ['L', '44', '28', '26', '19'],
        ['XL', '46', '29', '26.5', '20'],
        ['2XL', '48', '30', '27', '21'],
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-black text-white py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold">SIZE GUIDE</h1>
          <p className="text-gray-400 mt-3">Find your perfect fit</p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* How to Measure */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 p-6 bg-gray-50 rounded-2xl">
          <h2 className="text-xl font-bold mb-4">How to Measure</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'Chest', desc: 'Measure around the fullest part of your chest' },
              { title: 'Waist', desc: 'Measure around your natural waistline' },
              { title: 'Length', desc: 'Measure from shoulder to desired length' },
              { title: 'Inseam', desc: 'Measure from crotch to ankle' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">{i + 1}</div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Size Charts */}
        <div className="space-y-8">
          {sizeCharts.map((chart, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-lg font-bold mb-4">{chart.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-xl overflow-hidden">
                  <thead className="bg-black text-white">
                    <tr>
                      {chart.headers.map((h, j) => (
                        <th key={j} className="py-3 px-4 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.rows.map((row, j) => (
                      <tr key={j} className={j % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {row.map((cell, k) => (
                          <td key={k} className={`py-3 px-4 ${k === 0 ? 'font-bold' : ''}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 p-6 bg-purple-50 border border-purple-200 rounded-2xl">
          <h3 className="font-bold text-purple-900 mb-3">💡 Fit Tips</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li>• Our oversized tees are designed to fit 1-2 sizes larger than regular fit</li>
            <li>• If you're between sizes, we recommend sizing down for a closer fit</li>
            <li>• Trackpants have elastic waistbands that accommodate a range of sizes</li>
            <li>• Co-ord sets are designed for a relaxed, comfortable fit</li>
            <li>• When in doubt, check product reviews for fit feedback from other customers</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
