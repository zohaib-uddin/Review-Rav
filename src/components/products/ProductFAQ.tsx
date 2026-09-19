import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Discount on online payment?",
    answer: "Yes! Get 10% off on all online payments (capped at Rs. 500). Use code ONLINE10 at checkout."
  },
  {
    question: "COD available?",
    answer: "Yes, Cash on Delivery is available across Pakistan."
  },
  {
    question: "Delivery time?",
    answer: "3-5 days for major cities, 4-8 days for other areas."
  },
  {
    question: "Return policy?",
    answer: "Regular products are eligible for returns. MINOR OR LAST collection items are final sale and non-returnable."
  },
  {
    question: "Shipping charges?",
    answer: "Standard flat rate of Rs. 260 applies across Pakistan. FREE shipping on orders above Rs. 3,000."
  },
  {
    question: "Order confirmation?",
    answer: "All orders are confirmed via phone/WhatsApp call before processing to ensure accuracy."
  },
  {
    question: "What is MINOR OR LAST?",
    answer: "Special collection featuring items with minor faults or last pieces/old stock, offered at 40-80% off. These are final sale items."
  }
];

export default function ProductFAQ({ faqs }: { faqs?: FAQItem[] }) {
  const questions = faqs || defaultFAQs;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">Frequently Asked Questions</h3>
      <div className="space-y-2">
        {questions.map((faq, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-sm font-medium text-gray-800 pr-4">
                {faq.question}
              </span>
              {openIndex === idx ? (
                <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
              )}
            </button>
            
            {openIndex === idx && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
