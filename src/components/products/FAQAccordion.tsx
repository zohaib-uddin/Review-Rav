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

  const defaultFAQs: FAQItem[] = [
    {
      question: 'What is the fabric composition?',
      answer: 'Our products are made from premium quality materials. Please check the product specifications for detailed fabric information.',
    },
    {
      question: 'How do I choose the right size?',
      answer: 'We recommend checking our size guide before ordering. If you are between sizes, we suggest sizing up for a more comfortable fit.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for unused items in original condition. Contact our support team for assistance.',
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days across Pakistan. Express shipping options are available at checkout.',
    },
  ];

  const questions = faqs && faqs.length > 0 ? faqs : defaultFAQs;

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <HelpCircle size={20} />
        Frequently Asked Questions
      </h3>
      <div className="space-y-3">
        {questions.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            className="border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="font-medium text-sm pr-8">{faq.question}</span>
              <ChevronDown
                size={18}
                className={`flex-shrink-0 transition-transform ${
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
                  <div className="px-4 pb-4 text-sm text-gray-600 border-t pt-3">
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