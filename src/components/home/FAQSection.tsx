import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const staticFAQs = [
  {
    id: '1',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day easy return policy. Items must be unworn, unwashed, with original tags attached. Contact our support team to initiate a return.',
    category: 'Shipping & Returns',
  },
  {
    id: '2',
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 3-5 business days for major cities and 5-7 days for other areas. Express delivery (1-2 days) is available for select locations.',
    category: 'Shipping & Returns',
  },
  {
    id: '3',
    question: 'Do you offer cash on delivery?',
    answer: 'Yes! COD is available across Pakistan. A small COD handling fee of Rs.100 may apply.',
    category: 'Payment',
  },
  {
    id: '4',
    question: 'What sizes do you offer?',
    answer: 'We offer sizes from S to 3XL depending on the product. Check the size guide on each product page for detailed measurements.',
    category: 'Sizing',
  },
  {
    id: '5',
    question: 'Are your products unisex?',
    answer: 'Most of our products are designed as unisex. Check the product description for specific fit details.',
    category: 'Sizing',
  },
  {
    id: '6',
    question: 'How do I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order on our Track Order page.',
    category: 'Shipping & Returns',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = staticFAQs;

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-2">FAQ</p>
          <h2 className="text-3xl font-display font-bold">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 transition-transform ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
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
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-gray-50 rounded-2xl">
          <h3 className="font-bold text-lg mb-2">Still have questions?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
