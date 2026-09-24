import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);

  const handleWhatsAppClick = () => {
    const phoneNumber = '923001234567'; // Ravenza Support WhatsApp
    const message = encodeURIComponent("Hello Ravenza Support, I wanna inquire about / buy your streetwear products. Please assist me.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="bg-black text-white text-xs font-bold px-3 py-2 shadow-xl rounded-lg whitespace-nowrap tracking-wide"
          >
            Chat with Us on WhatsApp
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#22bf5b] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-colors relative"
        aria-label="Chat with Ravenza on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-message-circle"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>

        {/* Pulsing ping ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
      </motion.button>
    </div>
  );
}
