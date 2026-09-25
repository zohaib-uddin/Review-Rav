// API Service Layer - Handles all backend communication
// Uses fetch to call API endpoints which interact with Neon DB via Drizzle

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = (rawApiUrl && !rawApiUrl.includes('localhost:3001')) ? rawApiUrl : '/api';

class ApiService {
  private token: string | null = null;
  private adminToken: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('ravenza_token') : null;
    this.adminToken = typeof window !== 'undefined' ? localStorage.getItem('ravenza_admin_token') : null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') localStorage.setItem('ravenza_token', token);
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') localStorage.removeItem('ravenza_token');
  }

  setAdminToken(token: string) {
    this.adminToken = token;
    if (typeof window !== 'undefined') localStorage.setItem('ravenza_admin_token', token);
  }

  clearAdminToken() {
    this.adminToken = null;
    if (typeof window !== 'undefined') localStorage.removeItem('ravenza_admin_token');
  }

  getEffectiveToken(): string | null {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return this.adminToken || localStorage.getItem('ravenza_admin_token') || this.token;
    }
    return this.token || (typeof window !== 'undefined' ? localStorage.getItem('ravenza_token') : null);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const effectiveToken = this.getEffectiveToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(effectiveToken && { Authorization: `Bearer ${effectiveToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, name: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  }

  async sendOTP(email: string) {
    return this.request<{ success: boolean; message: string; otp?: string }>('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOTP(email: string, otp: string) {
    return this.request<{ success: boolean; token: string; user: any; message?: string }>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // User Profile
  async updateProfile(data: { id?: string; name?: string; phone?: string }) {
    return this.request<{ success: boolean; message: string; user: any }>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Addresses
  async getAddresses(userId?: string, email?: string) {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (email) params.set('email', email);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/addresses${qs}`);
  }

  async createAddress(data: any) {
    return this.request<any>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string, data: any) {
    return this.request<any>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string) {
    return this.request<any>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  // Tracking
  async trackOrder(orderNumber: string, userId?: string, email?: string) {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (email) params.set('email', email);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<any>(`/orders/track/${encodeURIComponent(orderNumber)}${qs}`);
  }

  // Products
  async getProducts(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    return this.request<any[]>(`/products?${searchParams.toString()}`);
  }

  async getProduct(slug: string) {
    return this.request<any>(`/products/${slug}`);
  }

  async createProduct(data: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<any>(`/products/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async createCategory(data: any) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Collections
  async getCollections() {
    return this.request<any[]>('/collections');
  }

  // Orders
  async getOrders(userId?: string) {
    const params = userId ? `?user_id=${userId}` : '';
    return this.request<any[]>(`/orders${params}`);
  }

  async getPublicOrderDetails(orderId: string, token?: string) {
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
    return this.request<any>(`/orders/public-details/${orderId}${tokenQuery}`);
  }

  async createOrder(data: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateOrderPaymentStatus(id: string, payment_status: string) {
    return this.request<any>(`/orders/${id}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status }),
    });
  }

  // Cart
  async getCart(userId: string) {
    return this.request<any[]>(`/cart/${userId}`);
  }

  async addToCart(userId: string, productId: string, variantId: string, size: string, color: string, quantity: number) {
    return this.request<any>(`/cart/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, variant_id: variantId, size, color, quantity }),
    });
  }

  async syncCart(userId: string, cart: any[]) {
    return this.request<any>(`/cart/${userId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ cart }),
    });
  }

  async updateCartItem(cartItemId: string, quantity: number) {
    return this.request<any>(`/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartItemId: string) {
    return this.request<any>(`/cart/items/${cartItemId}`, { method: 'DELETE' });
  }

  // Order Confirmation Email Dispatch
  async sendOrderConfirmation(orderData: any) {
    return this.request<any>('/send-order-confirmation', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Wishlist
  async getWishlist(userId: string) {
    return this.request<any[]>(`/wishlist/${userId}`);
  }

  async toggleWishlist(userId: string, productId: string) {
    return this.request<any>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, product_id: productId }),
    });
  }

  // Reviews
  async getReviews(productId: string) {
    return this.request<any[]>(`/reviews?product_id=${productId}`);
  }

  async createReview(data: { product_id: string; user_id: string; rating: number; comment: string }) {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Discounts & Coupons
  async getCoupons() {
    return this.request<any[]>('/coupons');
  }

  async createCoupon(data: any) {
    return this.request<any>('/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCoupon(idOrCode: string, data: any) {
    return this.request<any>(`/coupons/${encodeURIComponent(idOrCode)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCoupon(idOrCode: string) {
    return this.request<any>(`/coupons/${encodeURIComponent(idOrCode)}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(code: string, orderAmount: number) {
    return this.request<any>('/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount }),
    });
  }

  async validateDiscount(code: string) {
    return this.request<any>(`/discounts/validate?code=${code}`);
  }

  // Dashboard Stats & Pure Dynamic Analytics
  async getDashboardStats() {
    return this.request<any>('/admin/stats');
  }

  async getAnalytics(range: string = '30days') {
    return this.request<any>(`/admin/analytics?range=${encodeURIComponent(range)}`);
  }

  // Audit Logs
  async getAuditLogs(params?: { entity_type?: string; entity_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.entity_type) searchParams.set('entity_type', params.entity_type);
    if (params?.entity_id) searchParams.set('entity_id', params.entity_id);
    return this.request<any[]>(`/admin/audit-logs?${searchParams.toString()}`);
  }

  async logAudit(action: string, entity: string, user?: string, details?: string) {
    try {
      return await this.request<any>('/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify({ action, entity, user, details }),
      });
    } catch {
      // Fire-and-forget logging
      return null;
    }
  }

  async clearAuditLogs() {
    return this.request<any>('/admin/audit-logs', { method: 'DELETE' });
  }

  // Admin Reviews
  async getAdminReviews() {
    return this.request<any[]>('/reviews?all=true');
  }

  async updateReviewApproval(id: string, is_approved: boolean) {
    return this.request<any>(`/reviews/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ is_approved }),
    });
  }

  async deleteReview(id: string) {
    return this.request<any>(`/reviews/${id}`, { method: 'DELETE' });
  }

  // Newsletter
  async getNewsletterSubscribers() {
    return this.request<any[]>('/newsletter');
  }

  async updateNewsletterSubscriber(id: string, is_active: boolean) {
    return this.request<any>(`/newsletter/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  }

  async deleteNewsletterSubscriber(id: string) {
    return this.request<any>(`/newsletter/${id}`, { method: 'DELETE' });
  }

  async sendNewsletterThanks(email: string) {
    return this.request<any>('/newsletter/send-thanks', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Email Campaigns
  async getEmailCampaigns() {
    return this.request<any[]>('/email-campaigns');
  }

  async createEmailCampaign(data: { name?: string; subject: string; content: string; target_audience?: string }) {
    return this.request<any>('/email-campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendEmailCampaign(id: string) {
    return this.request<any>(`/email-campaigns/${id}/send`, {
      method: 'POST',
    });
  }

  async deleteEmailCampaign(id: string) {
    return this.request<any>(`/email-campaigns/${id}`, { method: 'DELETE' });
  }

  // Admin Notifications
  async getNotifications() {
    return this.request<any[]>('/admin/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/admin/notifications/${id}/read`, { method: 'PUT' });
  }

  async deleteNotification(id: string) {
    return this.request<any>(`/admin/notifications/${id}`, { method: 'DELETE' });
  }

  // File Upload (Cloudinary)
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }
}

export const api = new ApiService();
export default api;
