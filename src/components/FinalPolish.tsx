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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
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

// Cookie Consent Banner
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              We use cookies to enhance your experience. By continuing, you agree to our use of cookies.
            </p>
            <div className="flex gap-3">
              <button
                onClick={declineCookies}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Decline
              </button>
              <button
                onClick={acceptCookies}
                className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
