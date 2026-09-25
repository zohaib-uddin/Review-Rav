import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Loading Skeleton Components
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[3/4] rounded-xl mb-3"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-square rounded-xl mb-2"></div>
      <div className="bg-gray-200 h-4 rounded w-2/3 mx-auto"></div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse h-[80vh] bg-gray-200"></div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 h-4 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        ></div>
      ))}
    </div>
  );
}

// Smooth Page Transition Wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// Scroll to Top Button
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-28 right-[36px] z-40 w-8 h-8 bg-white/80 hover:bg-white text-neutral-800 border border-neutral-300 shadow-md backdrop-blur-xs rounded-full flex items-center justify-center transition-all cursor-pointer"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <svg
            className="w-3.5 h-3.5 text-neutral-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Image with Fallback
export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

// Tooltip Component
export function Tooltip({
  children,
  content,
  position = 'top',
}: {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute ${positionClasses[position]} px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap z-50`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import CookiePreferencesModal from './CookiePreferencesModal';

// Cookie Consent Banner - Modern Luxury E-Commerce Design
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for global open preferences event
  useEffect(() => {
    const handleOpenPref = () => setIsPreferencesOpen(true);
    const handleStatusChange = (e: any) => {
      if (e.detail) {
        setIsVisible(false);
      }
    };
    window.addEventListener('open-cookie-preferences', handleOpenPref);
    window.addEventListener('cookie-consent-change', handleStatusChange);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpenPref);
      window.removeEventListener('cookie-consent-change', handleStatusChange);
    };
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: 'accepted' }));
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: 'declined' }));
    setIsVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-neutral-300/80 shadow-[0_12px_40px_rgba(0,0,0,0.18)] rounded-2xl p-5"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex-shrink-0 flex items-center justify-center shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                  <path d="M12 12v.01" />
                  <path d="M11 17v.01" />
                  <path d="M7 14v.01" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black">
                    Cookie & Privacy Notice
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsPreferencesOpen(true)}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-black underline cursor-pointer"
                  >
                    Preferences
                  </button>
                </div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  We use cookies to personalize drops, remember your bag, and ensure secure checkout on Ravenza.
                </p>

                <div className="flex items-center gap-2 mt-4 pt-1">
                  <button
                    type="button"
                    onClick={acceptCookies}
                    className="flex-1 py-2.5 px-4 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm text-center"
                  >
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={declineCookies}
                    className="py-2.5 px-3.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </>
  );
}

// Age Verification Modal
export function AgeVerification({ onVerify }: { onVerify: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (!verified) {
      setIsVisible(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age-verified', 'true');
    setIsVisible(false);
    onVerify();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Age Verification</h2>
        <p className="text-gray-600 mb-6">
          You must be at least 18 years old to access this website.
        </p>
        <p className="text-sm text-gray-500 mb-6">Are you 18 or older?</p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = 'https://google.com'}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            No
          </button>
          <button
            onClick={handleVerify}
            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Yes
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Smooth Scroll to Element
export function scrollToElement(id: string, offset: number = 0) {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Share API helper
export async function share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      console.error('Failed to share:', err);
      return false;
    }
  }
  return false;
}
