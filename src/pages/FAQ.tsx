import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What is your return policy?', a: 'We offer a 7-day easy return policy. Items must be unworn, unwashed, with original tags attached. Contact our support team to initiate a return.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days for major cities and 5-7 days for other areas. Express delivery (1-2 days) is available for select locations.' },
  { q: 'Do you offer cash on delivery?', a: 'Yes! COD is available across Pakistan. A small COD handling fee of Rs.100 may apply.' },
  { q: 'What sizes do you offer?', a: 'We offer sizes from S to 3XL depending on the product. Check the size guide on each product page for detailed measurements.' },
  { q: 'Are your products unisex?', a: 'Most of our products are designed as unisex. Check the product description for specific fit details.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order on our Track Order page.' },
  { q: 'Do you ship internationally?', a: 'Currently, we only ship within Pakistan. International shipping will be available soon!' },
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery, Bank Transfer, JazzCash, EasyPaisa, and all major credit/debit cards.' },
  { q: 'How do I exchange a product?', a: 'Contact our support team within 7 days of delivery. Exchanges are subject to availability of the desired size/color.' },
  { q: 'Are your fabrics premium quality?', a: 'Absolutely! We use only premium fabrics sourced from the best suppliers. Each product page details the fabric composition and GSM.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      <div className="bg-black text-white py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold">FAQ</h1>
          <p className="text-gray-400 mt-3">Frequently Asked Questions</p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown size={20} className={`flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-gray-50 rounded-2xl">
          <h3 className="font-bold text-lg mb-2">Still have questions?</h3>
          <p className="text-gray-500 text-sm mb-4">Can't find what you're looking for? Contact our support team.</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
