// PWA Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          
          // Check for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content available, show update prompt
                    console.log('New content available, please refresh.');
                    // You can show a toast/notification here
                  } else {
                    // Content cached for the first time
                    console.log('Content cached for offline use.');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
}

// PWA Install Prompt
export function setupInstallPrompt() {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    const installButton = document.getElementById('install-pwa-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted install prompt');
          } else {
            console.log('User dismissed install prompt');
          }
          deferredPrompt = null;
        });
      });
    }
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
}

// Check if app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

// PWA Manifest
export const manifest = {
  name: 'Ravenza - Premium Streetwear',
  short_name: 'Ravenza',
  description: 'Pakistan\'s premium streetwear brand',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#000000',
  orientation: 'portrait-primary',
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
  categories: ['shopping', 'fashion', 'lifestyle'],
  lang: 'en',
  dir: 'ltr',
  scope: '/',
};

// Generate manifest.json
export function generateManifest() {
  const manifestBlob = new Blob([JSON.stringify(manifest)], {
    type: 'application/json',
  });
  const manifestURL = URL.createObjectURL(manifestBlob);
  
  // Add manifest link to head
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = manifestURL;
  document.head.appendChild(link);
  
  // Add theme color
  const themeColor = document.createElement('meta');
  themeColor.name = 'theme-color';
  themeColor.content = manifest.theme_color;
  document.head.appendChild(themeColor);
  
  // Add Apple touch icon
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = '/icon-192x192.png';
  document.head.appendChild(appleTouchIcon);
}

// Offline detection
export function setupOfflineDetection() {
  window.addEventListener('online', () => {
    console.log('App is online');
    // Show online notification
    // You can dispatch a custom event or update state
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
    // Show offline notification
    // You can dispatch a custom event or update state
  });
}

// Cache API helper
export async function cacheData(key: string, data: any, maxAge: number = 3600000) {
  const cache = {
    data,
    timestamp: Date.now(),
    maxAge,
  };
  localStorage.setItem(key, JSON.stringify(cache));
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  const cache = JSON.parse(cached);
  const now = Date.now();
  
  if (now - cache.timestamp > cache.maxAge) {
    localStorage.removeItem(key);
    return null;
  }
  
  return cache.data;
}

// Prefetch data for faster navigation
export function prefetchData(url: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

// Preconnect to external domains
export function preconnectDomain(domain: string) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  document.head.appendChild(link);
}
