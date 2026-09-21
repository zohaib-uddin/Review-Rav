import { MessageCircle, Phone } from 'lucide-react';

export default function ProductSupport() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-bold mb-2">Need Help? We're Here.</h3>
      <p className="text-sm text-gray-600 mb-4">
        Have questions about sizing, fit, or anything else? Our team is ready to help you make the perfect choice.
      </p>
      
      <div className="flex flex-wrap gap-3">
        {/* Online Support Button */}
        <a
          href="mailto:support@ravenza.pk"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all text-sm font-medium"
        >
          <MessageCircle size={18} className="text-purple-600" />
          Online Support
        </a>
        
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/923001234567"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          <Phone size={18} />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}