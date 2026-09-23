import { create } from 'zustand';
import api from '../services/api';

// Types - Updated to match new schema
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  compare_at_price: number | null;
  is_active: boolean;
  category_id: string | null;
  subcategory_id?: string | null;
  category_slug?: string;
  category_name?: string;
  brand: string;
  sku: string | null;
  
  // Flags
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  is_spotlight?: boolean;
  is_draft?: boolean;
  
  // Specifications
  fabric: string | null;
  fabric_composition: string | null;
  fabric_finish: string | null;
  fit: string | null;
  graphic_print: string | null;
  garment_specs: string | null;
  garment_care: string | null;
  shipping_delivery: string | null;
  model_size: string | null;
  
  // SEO
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  focus_keywords: string | null;
  
  // Media
  badge: string | null;
  images: string[];
  image_url: string | null;
  
  // Variants
  attributes: { 
    sizes: string[]; 
    colors: Array<string | { name: string; hex: string }>; 
  };
  variants_matrix?: Array<{
    size: string;
    color: string;
    price: number | null;
    stock: number;
    sku: string;
  }>;
  size_guide?: any;
  additional_specs?: Array<{ key: string; value: string }>;
  
  // Status
  status: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields for frontend
  price?: number;
  salePrice?: number;
  image?: string;
  sizes?: string[];
  colors?: string[];
  stockCount?: number;
  low_stock_threshold?: number;
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  details?: string[];
  material?: string;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  is_verified?: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  tracking_id?: string;
  user_id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount?: number;
  coupon_code?: string | null;
  status: string;
  date: string;
  email?: string;
  shipping_address?: any;
  address?: any;
  payment_method?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  date: string;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  description: string | null;
  badge?: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  tag: string | null;
  // Collections in Focus fields
  is_featured_in_focus: boolean;
  display_order_in_focus: number;
  // Warm Chapters fields
  is_warm_chapter?: boolean;
  display_order_warm_chapter?: number;
}

export interface WarmChapter {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  image_url: string;
  product_ids: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Empty initial state - data will be fetched from API

interface StoreState {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  products: Product[];
  categories: Category[];
  featuredCategories: Category[];
  orders: Order[];
  reviews: Review[];
  warmChapters: WarmChapter[];
  isLoading: boolean;
  apiAvailable: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchFeaturedCategories: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchWarmChapters: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addReview: (review: Review) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: (() => {
    try {
      const savedUser = localStorage.getItem('ravenza_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })(),
  cart: [],
  wishlist: [],
  products: [],
  categories: [],
  featuredCategories: [],
  orders: [],
  reviews: [],
  warmChapters: [],
  isLoading: false,
  apiAvailable: false,

  login: async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      api.setToken(result.token);
      localStorage.setItem('ravenza_user', JSON.stringify(result.user));
      set({ user: result.user, apiAvailable: true });
      api.logAudit('User Login', result.user?.name || email, result.user?.name || email, `Logged in with role: ${result.user?.role}`);
      return true;
    } catch {
      // Fallback to demo mode
      if (email === 'admin@ravenza.pk' && password === 'admin123') {
        const adminUser = { id: 'admin', email, name: 'Admin', role: 'admin' as const, is_verified: true };
        localStorage.setItem('ravenza_user', JSON.stringify(adminUser));
        set({ user: adminUser, apiAvailable: false });
        api.logAudit('User Login', 'Admin', 'admin@ravenza.pk', 'Admin dashboard sign-in');
        return true;
      }
      if (email && password.length >= 6) {
        const custUser = { id: Date.now().toString(), email, name: email.split('@')[0], role: 'customer' as const, is_verified: true };
        localStorage.setItem('ravenza_user', JSON.stringify(custUser));
        set({ user: custUser, apiAvailable: false });
        api.logAudit('User Login', email, email, 'Customer storefront sign-in');
        return true;
      }
      return false;
    }
  },

  register: async (email: string, name: string, password: string) => {
    try {
      const result = await api.register(email, name, password);
      api.setToken(result.token);
      localStorage.setItem('ravenza_user', JSON.stringify(result.user));
      set({ user: result.user, apiAvailable: true });
      api.logAudit('User Registered', name, email, 'New customer account created');
      return true;
    } catch {
      if (email && name && password.length >= 6) {
        const custUser = { id: Date.now().toString(), email, name, role: 'customer' as const, is_verified: false };
        localStorage.setItem('ravenza_user', JSON.stringify(custUser));
        set({ user: custUser, apiAvailable: false });
        api.logAudit('User Registered', name, email, 'New customer account created');
        return true;
      }
      return false;
    }
  },

  logout: () => {
    api.clearToken();
    localStorage.removeItem('ravenza_user');
    set({ user: null, cart: [], wishlist: [] });
  },

  addToCart: (product, size, color) => {
    const { cart } = get();
    const existing = cart.find(item => item.product.id === product.id && item.size === size && item.color === color);
    if (existing) {
      set({ cart: cart.map(item =>
        item.product.id === product.id && item.size === size && item.color === color
          ? { ...item, quantity: item.quantity + 1 } : item
      )});
    } else {
      set({ cart: [...cart, { product, quantity: 1, size, color }] });
    }
    // Audit log item added to cart
    api.logAudit('Item Added to Cart', product.name, get().user?.name || get().user?.email || 'Storefront Visitor', `Size: ${size}, Color: ${color}`);
  },

  removeFromCart: (productId, size) => {
    set({ cart: get().cart.filter(item => !(item.product.id === productId && item.size === size)) });
  },

  updateCartQuantity: (productId, size, quantity) => {
    if (quantity <= 0) { get().removeFromCart(productId, size); return; }
    set({ cart: get().cart.map(item =>
      item.product.id === productId && item.size === size ? { ...item, quantity } : item
    )});
  },

  clearCart: () => set({ cart: [] }),

  toggleWishlist: (productId) => {
    const { wishlist, products, user } = get();
    const targetProd = products.find(p => p.id === productId);
    const prodName = targetProd?.name || productId;
    if (wishlist.includes(productId)) {
      set({ wishlist: wishlist.filter(id => id !== productId) });
      api.logAudit('Wishlist Item Removed', prodName, user?.name || user?.email || 'Storefront Visitor');
    } else {
      set({ wishlist: [...wishlist, productId] });
      api.logAudit('Wishlist Item Added', prodName, user?.name || user?.email || 'Storefront Visitor');
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      console.log('🔄 Fetching products from API...');
      const products = await api.getProducts();
      console.log(`✅ Received ${products.length} products from API`);
      set({ products, apiAvailable: true });
    } catch (error: any) {
      console.error('❌ Failed to fetch products:', error);
      console.error('Error details:', error.message);
      set({ apiAvailable: false });
    }
    set({ isLoading: false });
  },

  fetchCategories: async () => {
    try {
      console.log('🔄 Fetching categories from API...');
      const categories = await api.getCategories();
      console.log(`✅ Received ${categories.length} categories from API`);
      set({ categories, apiAvailable: true });
    } catch (error: any) {
      console.error('❌ Failed to fetch categories:', error);
      console.error('Error details:', error.message);
      set({ apiAvailable: false });
    }
  },

  fetchFeaturedCategories: async () => {
    try {
      console.log('🔄 Fetching featured categories for Collections in Focus...');
      const response = await fetch('/api/categories/featured-in-focus');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const featuredCategories = await response.json();
        console.log(`✅ Received ${featuredCategories.length} featured categories from API`);
        set({ featuredCategories, apiAvailable: true });
      } else {
        console.warn('Featured categories returned non-JSON response');
      }
    } catch (error: any) {
      console.warn('⚠️ Could not load featured categories, using store categories:', error.message);
    }
  },

  fetchOrders: async () => {
    try {
      const orders = await api.getOrders();
      set({ orders, apiAvailable: true });
    } catch {
      set({ apiAvailable: false });
    }
  },

  fetchWarmChapters: async () => {
    try {
      console.log('🔄 Fetching warm chapters from API...');
      const response = await fetch('/api/warm-chapters');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const warmChapters = await response.json();
        console.log(`✅ Received ${warmChapters.length} warm chapters from API`);
        set({ warmChapters, apiAvailable: true });
      } else {
        console.warn('Warm chapters returned non-JSON response');
      }
    } catch (error: any) {
      console.warn('⚠️ Could not load warm chapters, using store categories:', error.message);
    }
  },
  
  addOrder: (order) => {    set({ orders: [...get().orders, order] });
    api.createOrder(order).catch(() => {});
  },

  updateOrderStatus: (orderId, status) => {
    set({ orders: get().orders.map(o => o.id === orderId ? { ...o, status } : o) });
    api.updateOrderStatus(orderId, status).catch(() => {});
  },

  updateProduct: (id, data) => {
    set({ products: get().products.map(p => p.id === id ? { ...p, ...data } : p) });
    api.updateProduct(id, data).catch(() => {});
  },

  addProduct: (product) => {
    set({ products: [...get().products, product] });
    api.createProduct(product).catch(() => {});
  },

  deleteProduct: (id) => {
    set({ products: get().products.filter(p => p.id !== id) });
    api.deleteProduct(id).catch(() => {});
  },

  addReview: (review) => {
    set({ reviews: [...get().reviews, review] });
    // In production, this would call api.addReview(review)
  },
}));
