import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setSubscribing(true);
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if (data.already_subscribed) {
          toast(data.message || 'You have already subscribed with this email.', {
            icon: '⚠️',
            style: {
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              fontWeight: 600,
              fontSize: '13px',
            },
            duration: 4000,
          });
        } else {
          toast.success(data.message || 'Welcome to the VIP Family! Check your inbox for your 10% gift.');
          setIsSuccess(true);
          setEmail('');
        }
      } else {
        toast.error(data.message || 'Subscription failed. Please try again.');
      }
    } catch {
      toast.error('Unable to connect to server. Please try again later.');
    } finally {
      setSubscribing(false);
    }
  };

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
          <p className="text-gray-400 mb-6 text-sm">
            Get early access to drops & 10% off your first order.
          </p>

          {isSuccess ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-white/10 rounded-2xl border border-white/20 text-emerald-400 text-sm font-semibold max-w-md mx-auto">
              <CheckCircle2 size={20} />
              <span>You are subscribed! Welcome gift sent to your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={subscribing}
                className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-l-full focus:outline-none focus:border-white/50 text-sm text-white placeholder-gray-400 disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3.5 bg-white text-black font-bold rounded-r-full hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                {subscribing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>JOINING...</span>
                  </>
                ) : (
                  <span>SUBSCRIBE</span>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
