'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs?: FAQItem[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const exactRequiredFAQs: FAQItem[] = [
    {
      question: 'Is there any discount on online payment?',
      answer: 'Yes. We offer a 10% discount on online payments, capped at Rs. 500.',
    },
    {
      question: 'Do you offer Cash on Delivery (COD)?',
      answer: 'Yes. Cash on Delivery (COD) is available across Pakistan.',
    },
    {
      question: 'When will I receive my order?',
      answer: 'Orders are usually delivered within 3–5 working days for major cities and 4–8 working days for other areas. Delivery times may vary slightly depending on the destination and courier service.',
    },
    {
      question: 'What is your return and exchange policy?',
      answer: 'We offer Return & Exchange on eligible regular products. For complete details, please refer to our Return & Exchange Policy. Please note: Products listed under the MINOR OR LAST collection are final sale and are strictly non-returnable and non-exchangeable.',
    },
    {
      question: 'What are the shipping or delivery charges?',
      answer: 'The standard delivery charge is Rs. 260, at a flat rate across Pakistan.',
    },
    {
      question: 'How will I know that my order is confirmed?',
      answer: 'Once your order is placed, our Customer Support Team will contact you via phone call or WhatsApp to confirm your order details. Your order will be processed after confirmation.',
    },
    {
      question: 'What is the MINOR OR LAST collection?',
      answer: 'MINOR OR LAST is a special collection featuring selected products offered at 40%–80% off their original price. Includes Minor Fault / Imperfect Products (small holes, rafoo marks, spots, loose threads) and Last Pieces / Old Collection.',
    },
  ];

  const questions = faqs && faqs.length >= 7 ? faqs : exactRequiredFAQs;

  return (
    <div className="mt-8">
      <div className="space-y-3">
        {questions.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-xs"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
            >
              <span className="font-bold text-xs uppercase tracking-wider text-black pr-8">{faq.question}</span>
              <ChevronDown
                size={16}
                className={`flex-shrink-0 transition-transform text-black ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-xs text-gray-600 border-t border-gray-100 pt-3 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

