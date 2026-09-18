import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function NewsletterSection() {
  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Zap className="mx-auto mb-4 text-purple-400" size={28} />
          <h2 className="text-2xl font-display font-bold mb-3">JOIN THE RAVENZA FAMILY</h2>
          <p className="text-gray-400 mb-6">
            Get early access to drops & 10% off your first order.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-l-full focus:outline-none focus:border-white/50 text-sm"
            />
            <button className="px-6 py-3.5 bg-white text-black font-bold rounded-r-full hover:bg-gray-200 transition-colors text-sm">
              SUBSCRIBE
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
