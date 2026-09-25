import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X, Lock, Info, Cookie as CookieIcon } from 'lucide-react';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiePreferencesModal({ isOpen, onClose }: CookiePreferencesModalProps) {
  const [cookieStatus, setCookieStatus] = useState<'accepted' | 'declined' | 'unset'>('unset');
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('cookie-consent');
    if (saved === 'accepted') {
      setCookieStatus('accepted');
      setAnalyticsAllowed(true);
      setMarketingAllowed(true);
    } else if (saved === 'declined') {
      setCookieStatus('declined');
      setAnalyticsAllowed(false);
      setMarketingAllowed(false);
    } else {
      setCookieStatus('unset');
    }
  }, [isOpen]);

  const handleAllow = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setCookieStatus('accepted');
    setAnalyticsAllowed(true);
    setMarketingAllowed(true);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: 'accepted' }));
    setTimeout(() => onClose(), 400);
  };

  const handleCancelRevoke = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setCookieStatus('declined');
    setAnalyticsAllowed(false);
    setMarketingAllowed(false);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: 'declined' }));
    setTimeout(() => onClose(), 400);
  };

  const handleSaveCustom = () => {
    const newStatus = analyticsAllowed || marketingAllowed ? 'accepted' : 'declined';
    localStorage.setItem('cookie-consent', newStatus);
    setCookieStatus(newStatus);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: newStatus }));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-neutral-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-black">
                    Cookie & Privacy Settings
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Manage your data preferences on Ravenza
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-neutral-100/70 border border-neutral-200/80 rounded-xl">
                <div className="flex items-center gap-2">
                  <CookieIcon size={18} className="text-neutral-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Current Status:
                  </span>
                </div>
                <span
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    cookieStatus === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {cookieStatus === 'accepted' ? (
                    <>
                      <Check size={12} strokeWidth={3} /> Cookies Allowed
                    </>
                  ) : (
                    <>
                      <X size={12} strokeWidth={3} /> Cookies Cancelled / Revoked
                    </>
                  )}
                </span>
              </div>

              {/* Quick Action Buttons: Allow vs Cancel */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAllow}
                  className="py-3 px-4 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <Check size={15} /> Allow Cookies
                </button>
                <button
                  type="button"
                  onClick={handleCancelRevoke}
                  className="py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-black"
                >
                  <X size={15} /> Cancel / Revoke
                </button>
              </div>

              {/* Granular Preferences */}
              <div className="divide-y divide-gray-100 pt-2 border-t border-gray-100">
                {/* Essential Cookies */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Lock size={12} className="text-neutral-500" /> Essential Store Cookies
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Required for shopping bag, checkout, and security.
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Always On
                  </span>
                </div>

                {/* Analytics Cookies */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Analytics & Performance
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Helps us improve page speed and discover popular drops.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsAllowed}
                      onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black" />
                  </label>
                </div>

                {/* Marketing Cookies */}
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Personalized Experience
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Shows curated drops and custom collection alerts.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingAllowed}
                      onChange={(e) => setMarketingAllowed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black" />
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-neutral-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Info size={13} /> Saved automatically
              </span>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
