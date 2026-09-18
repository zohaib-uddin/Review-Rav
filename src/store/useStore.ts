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
  animateQuantity?: boolean;
  assembleSequence?: number;
}

interface FlyingAnimation {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imageUrl: string;
  title: string;
  size: string;
  color: string;
  quantity: number;
  onComplete: () => void;
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

interface CartState {
  user: User | null;
  cart: CartItem[];
  wishlist: string[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  warmChapters: WarmChapter[];
  isLoading: boolean;
  apiAvailable: boolean;
  isCartSidebarOpen: boolean;
  flyingAnimations: FlyingAnimation[];
  animateHeaderIcon: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product, size: string, color: string, startRect?: DOMRect) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchWarmChapters: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addReview: (review: Review) => void;
  toggleCartSidebar: () => void;
  closeCartSidebar: () => void;
  openCartSidebar: () => void;
  addFlyingAnimation: (animation: FlyingAnimation) => void;
  removeFlyingAnimation: (id: string) => void;
  triggerHeaderIconAnimation: () => void;
}

// Empty initial state - data will be fetched from API

export const useStore = create<CartState>((set, get) => ({
  user: null,
  cart: [],
  wishlist: [],
  products: [],
  categories: [],
  orders: [],
  reviews: [],
  warmChapters: [],
  isLoading: false,
  apiAvailable: false,
  isCartSidebarOpen: false,
  flyingAnimations: [],
  animateHeaderIcon: false,

  login: async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      api.setToken(result.token);
      set({ user: result.user, apiAvailable: true });
      return true;
    } catch {
      // Fallback to demo mode
      if (email === 'admin@ravenza.pk' && password === 'admin123') {
        set({ user: { id: 'admin', email, name: 'Admin', role: 'admin', is_verified: true }, apiAvailable: false });
        return true;
      }
      if (email && password.length >= 6) {
        set({ user: { id: Date.now().toString(), email, name: email.split('@')[0], role: 'customer', is_verified: true }, apiAvailable: false });
        return true;
      }
      return false;
    }
  },

  register: async (email: string, name: string, password: string) => {
    try {
      const result = await api.register(email, name, password);
      api.setToken(result.token);
      set({ user: result.user, apiAvailable: true });
      return true;
    } catch {
      if (email && name && password.length >= 6) {
        set({ user: { id: Date.now().toString(), email, name, role: 'customer', is_verified: false }, apiAvailable: false });
        return true;
      }
      return false;
    }
  },

  logout: () => {
    api.clearToken();
    set({ user: null, cart: [], wishlist: [] });
  },

  addToCart: (product, size, color, startRect) => {
    const { cart } = get();
    const existing = cart.find(item => item.product.id === product.id && item.size === size && item.color === color);
    
    if (existing) {
      // Animate quantity bounce for existing item
      set({ 
        cart: cart.map(item =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1, animateQuantity: true } 
            : item
        ) 
      });
      setTimeout(() => {
        set({ 
          cart: cart.map(item =>
            item.product.id === product.id && item.size === size && item.color === color
              ? { ...item, animateQuantity: false } 
              : item
          ) 
        });
      }, 300);
    } else {
      // Add new item with assembly sequence
      const assembleSequence = cart.length + 1;
      set({ 
        cart: [...cart, { product, quantity: 1, size, color, assembleSequence }] 
      });
    }
    
    // Trigger header icon animation
    get().triggerHeaderIconAnimation();
    
    // Open cart sidebar automatically
    get().openCartSidebar();
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
    const { wishlist } = get();
    if (wishlist.includes(productId)) {
      set({ wishlist: wishlist.filter(id => id !== productId) });
    } else {
      set({ wishlist: [...wishlist, productId] });
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
      const response = await fetch('http://localhost:3001/api/warm-chapters');
      const warmChapters = await response.json();
      console.log(`✅ Received ${warmChapters.length} warm chapters from API`);
      set({ warmChapters, apiAvailable: true });
    } catch (error: any) {
      console.error('❌ Failed to fetch warm chapters:', error);
      console.error('Error details:', error.message);
      set({ apiAvailable: false });
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

  toggleCartSidebar: () => set((state) => ({ isCartSidebarOpen: !state.isCartSidebarOpen })),
  
  closeCartSidebar: () => set({ isCartSidebarOpen: false }),
  
  openCartSidebar: () => set({ isCartSidebarOpen: true }),
  
  addFlyingAnimation: (animation) => set((state) => ({ 
    flyingAnimations: [...state.flyingAnimations, animation] 
  })),
  
  removeFlyingAnimation: (id) => set((state) => ({ 
    flyingAnimations: state.flyingAnimations.filter(a => a.id !== id) 
  })),
  
  triggerHeaderIconAnimation: () => {
    set({ animateHeaderIcon: true });
    setTimeout(() => set({ animateHeaderIcon: false }), 400);
  },
}));
