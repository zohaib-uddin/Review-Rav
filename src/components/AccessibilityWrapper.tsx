import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
}

export default function AccessibilityWrapper({ children }: AccessibilityWrapperProps) {
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // Focus management on route change
  useEffect(() => {
    // Move focus to main content on route change
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content (Alt + S)
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        if (mainContentRef.current) {
          mainContentRef.current.focus();
        }
      }

      // Skip to navigation (Alt + N)
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const nav = document.querySelector('nav');
        if (nav) {
          nav.focus();
        }
      }

      // Skip to footer (Alt + F)
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        const footer = document.querySelector('footer');
        if (footer) {
          footer.focus();
          footer.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Announce page changes to screen readers
  useEffect(() => {
    const announcement = document.getElementById('route-announcement');
    if (announcement) {
      announcement.textContent = `Navigated to ${location.pathname}`;
    }
  }, [location.pathname]);

  return (
    <>
      {/* Skip to main content link */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Screen reader announcements */}
      <div
        id="route-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main content with focus management */}
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        className="outline-none"
        aria-label="Main content"
      >
        {children}
      </main>

      {/* Keyboard shortcuts help */}
      <div className="sr-only" aria-label="Keyboard shortcuts">
        <p>Keyboard shortcuts available:</p>
        <ul>
          <li>Alt + S: Skip to main content</li>
          <li>Alt + N: Skip to navigation</li>
          <li>Alt + F: Skip to footer</li>
        </ul>
      </div>
    </>
  );
}

// Accessible button component
export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// Accessible link component
export function AccessibleLink({
  children,
  href,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  href: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

// Accessible image component
export function AccessibleImage({
  src,
  alt,
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={src} alt={alt} className={className} loading="lazy" {...props} />;
}

// Accessible form input component
export function AccessibleInput({
  label,
  id,
  error,
  required = false,
  className = '',
  ...props
}: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        required={required}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
