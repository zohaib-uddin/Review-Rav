/**
 * Fetch all active warm chapters ordered by display_order
 * Calls the backend API endpoint
 */
export async function getWarmChapters() {
  try {
    console.log('🔥 Fetching warm chapters from API...');
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_BASE}/warm-chapters`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const chapters = await response.json();
    console.log(`✅ Found ${chapters.length} warm chapters`);
    return chapters;
  } catch (error: any) {
    console.error('❌ Get warm chapters error:', error.message);
    return [];
  }
}

/**
 * Fetch products by array of IDs
 * Calls the backend API endpoint
 */
export async function getProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) {
    return [];
  }
  
  try {
    console.log(`🛍️ Fetching ${ids.length} products by IDs...`);
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_BASE}/products/by-ids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const productList = await response.json();
    console.log(`✅ Found ${productList.length} products`);
    return productList;
  } catch (error: any) {
    console.error('❌ Get products by IDs error:', error.message);
    return [];
  }
}
