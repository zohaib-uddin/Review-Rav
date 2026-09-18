import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: {
    name: string;
    price: number;
    currency: string;
    availability: 'in stock' | 'out of stock';
  };
}

export default function SEO({
  title = 'Ravenza - Premium Streetwear',
  description = 'Pakistan\'s premium streetwear brand. Discover co-ord sets, graphic tees, trackpants, and more.',
  keywords = 'streetwear, clothing, fashion, pakistan, ravenza, co-ord sets, graphic tees',
  image = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop',
  url,
  type = 'website',
  product,
}: SEOProps) {
  const location = useLocation();
  const currentUrl = url || `https://ravenza.pk${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);

    // Open Graph tags
    updateMeta('og:title', title);
    updateMeta('og:description', description);
    updateMeta('og:image', image);
    updateMeta('og:url', currentUrl);
    updateMeta('og:type', type);
    updateMeta('og:site_name', 'Ravenza');

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Product structured data
    if (product) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: description,
        image: image,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: `https://schema.org/${product.availability === 'in stock' ? 'InStock' : 'OutOfStock'}`,
        },
      };

      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup
    return () => {
      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (ldJson && !product) {
        ldJson.remove();
      }
    };
  }, [title, description, keywords, image, currentUrl, type, product]);

  return null;
}

// Helper function to generate SEO props for different pages
export function getSEOProps(page: string, data?: any): SEOProps {
  switch (page) {
    case 'home':
      return {
        title: 'Ravenza - Premium Streetwear',
        description: 'Pakistan\'s premium streetwear brand. Discover co-ord sets, graphic tees, trackpants, and more.',
        keywords: 'streetwear, clothing, fashion, pakistan, ravenza',
        type: 'website',
      };
    case 'product':
      return {
        title: `${data?.name || 'Product'} - Ravenza`,
        description: data?.description || 'Premium streetwear product',
        keywords: `${data?.name}, streetwear, ${data?.category || 'clothing'}`,
        image: data?.image,
        type: 'product',
        product: data ? {
          name: data.name,
          price: data.price || data.base_price,
          currency: 'PKR',
          availability: data.inStock ? 'in stock' : 'out of stock',
        } : undefined,
      };
    case 'collection':
      return {
        title: `${data?.name || 'Collection'} - Ravenza`,
        description: data?.description || 'Browse our collection',
        keywords: `${data?.name}, streetwear, collection`,
        image: data?.cover_image_url,
        type: 'website',
      };
    default:
      return {
        title: 'Ravenza - Premium Streetwear',
        description: 'Pakistan\'s premium streetwear brand.',
        type: 'website',
      };
  }
}
