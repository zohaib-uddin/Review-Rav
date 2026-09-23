// API Service Layer - Handles all backend communication
// Uses fetch to call API endpoints which interact with Neon DB via Drizzle

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = (rawApiUrl && !rawApiUrl.includes('localhost:3001')) ? rawApiUrl : '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('ravenza_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('ravenza_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('ravenza_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
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

  async verifyOTP(email: string, otp: string) {
    return this.request<{ success: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
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

  // Cart
  async getCart(userId: string) {
    return this.request<any>(`/cart/${userId}`);
  }

  async addToCart(userId: string, productId: string, variantId: string, size: string, color: string, quantity: number) {
    return this.request<any>(`/cart/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, variant_id: variantId, size, color, quantity }),
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

  // Discounts
  async validateDiscount(code: string) {
    return this.request<any>(`/discounts/validate?code=${code}`);
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request<any>('/admin/stats');
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
