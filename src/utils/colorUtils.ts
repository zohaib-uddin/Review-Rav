/**
 * Utility to resolve color swatch hex codes from admin configured names or attributes.
 */
const COLOR_MAP: Record<string, string> = {
  black: '#111111',
  white: '#ffffff',
  grey: '#6b7280',
  gray: '#6b7280',
  'dark grey': '#374151',
  'light grey': '#d1d5db',
  charcoal: '#262626',
  navy: '#0f172a',
  'navy blue': '#0f172a',
  blue: '#1d4ed8',
  'royal blue': '#2563eb',
  'sky blue': '#38bdf8',
  beige: '#d4c4a8',
  cream: '#fef3c7',
  offwhite: '#fafafa',
  'off white': '#fafafa',
  khaki: '#c3b091',
  olive: '#556b2f',
  'olive green': '#4d5b2c',
  green: '#15803d',
  'forest green': '#14532d',
  brown: '#78350f',
  tan: '#d2b48c',
  burgundy: '#800020',
  maroon: '#800000',
  red: '#dc2626',
  pink: '#f472b6',
  orange: '#ea580c',
  purple: '#7e22ce',
  yellow: '#eab308',
  sand: '#e7d8c9',
  camel: '#c19a6b',
  rust: '#b7410e',
};

export function resolveColorHex(colorName: string, productAttributes?: any): string {
  if (!colorName) return '#111111';

  const cleanName = colorName.trim();

  // If already a hex or rgb code
  if (cleanName.startsWith('#') || cleanName.startsWith('rgb')) {
    return cleanName;
  }

  // Check product attributes if admin specified { name, hex }
  if (productAttributes && Array.isArray(productAttributes.colors)) {
    const matched = productAttributes.colors.find((c: any) => {
      if (typeof c === 'object' && c !== null) {
        return c.name?.toLowerCase() === cleanName.toLowerCase();
      }
      return false;
    });
    if (matched && matched.hex) {
      return matched.hex;
    }
  }

  const lower = cleanName.toLowerCase();
  if (COLOR_MAP[lower]) {
    return COLOR_MAP[lower];
  }

  // Check partial matches
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) {
      return hex;
    }
  }

  return '#4b5563'; // neutral fallback
}
