// utils/htmlSanitizer.ts
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'],
    ALLOWED_ATTR: ['class', 'style'],
  });
}

/**
 * Render sanitized HTML safely
 */
export function createSafeHTML(html: string): { __html: string } {
  return { __html: sanitizeHTML(html) };
}