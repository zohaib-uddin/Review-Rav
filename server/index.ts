import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const sql = neon(process.env.DATABASE_URL!);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const adminOnly = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected',
      timestamp: result[0].current_time
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await sql`SELECT * FROM users WHERE email = ${email} AND is_active = true`;
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_verified: user.is_verified,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const users = await sql`
      INSERT INTO users (email, name, password, role, is_verified, is_active)
      VALUES (${email}, ${name}, ${password}, 'customer', false, true)
      RETURNING id, email, name, role, is_verified
    `;

    const user = users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user, token });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== PRODUCTS ROUTES ====================

app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching products from database...');
    
    const countResult = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`📊 Total products in database: ${countResult[0].count}`);
    
    if (countResult[0].count === 0) {
      console.log('⚠️ No products found in database!');
      return res.json([]);
    }
    
    const products = await sql`
      SELECT * FROM products 
      WHERE is_active = true 
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    console.log(`✅ Raw products fetched: ${products.length}`);
    
    const categories = await sql`SELECT id, name, slug FROM categories`;
    const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
    
    const transformedProducts = products.map((p: any) => {
      // Find category - try multiple possible category ID fields
      const categoryId = p.category_id || p.main_category_id;
      const category = categoryId ? categoryMap.get(categoryId) : null;
      
      let images = [];
      try {
        images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
      } catch (e) {
        images = [];
      }
      
      let attributes = { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] };
      try {
        attributes = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : (p.attributes || attributes);
      } catch (e) {
        attributes = { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] };
      }
      
      // Handle price fields - check multiple possible column names
      const basePrice = parseFloat(p.base_price || p.actual_price || 0);
      const comparePrice = p.compare_at_price || p.compare_price ? parseFloat(p.compare_at_price || p.compare_price) : null;
      
      return {
        id: p.id,
        name: p.name || '',
        slug: p.slug || '',
        description: p.description || '',
        base_price: basePrice,
        compare_at_price: comparePrice,
        is_active: p.is_active !== false,
        category_id: p.category_id || p.main_category_id || null,
        subcategory_id: p.subcategory_id || p.sub_category_id || null,
        category_slug: category?.slug || 'uncategorized',
        category_name: category?.name || 'Uncategorized',
        brand: p.brand || 'RAVENZA',
        fabric: p.fabric || null,
        fit: p.fit || null,
        sku: p.sku || null,
        is_new_arrival: p.is_new_arrival === true,
        is_bestseller: p.is_bestseller === true || p.is_best_seller === true,
        is_featured: p.is_featured === true,
        is_spotlight: p.is_spotlight === true,
        badge: p.badge || p.badge_type || null,
        badge_text: p.badge_text || null,
        images: images,
        image_url: p.image_url || p.thumbnail_image || null,
        thumbnail_image: p.thumbnail_image || null,
        attributes: attributes,
        fabric_composition: p.fabric_composition || null,
        fabric_finish: p.fabric_finish || null,
        graphic_print: p.graphic_print || null,
        garment_specs: p.garment_specs || null,
        garment_care: p.garment_care || null,
        shipping_info: p.shipping_info || null,
        shipping_delivery: p.shipping_delivery || null,
        meta_title: p.meta_title || null,
        meta_description: p.meta_description || null,
        focus_keywords: p.focus_keywords || null,
        status: p.status || 'active',
        is_draft: p.is_draft === true,
        stock: p.stock || 0,
        is_in_stock: p.is_in_stock !== false,
        created_at: p.created_at,
        updated_at: p.updated_at,
        // Frontend compatible fields
        price: basePrice,
        salePrice: comparePrice,
        actual_price: parseFloat(p.actual_price || p.base_price || 0),
        image: p.image_url || p.thumbnail_image || (images && images[0]) || '',
        sizes: attributes?.sizes || ['S', 'M', 'L', 'XL'],
        colors: attributes?.colors || ['Black'],
        stockCount: p.stock || 50,
        inStock: p.is_in_stock !== false && (p.stock || 0) > 0,
        isNew: p.is_new_arrival === true,
        isFeatured: p.is_featured === true,
        isBestseller: p.is_bestseller === true || p.is_best_seller === true,
        details: [
          p.fabric_composition,
          p.fit && `Fit: ${p.fit}`,
          p.garment_care && `Care: ${p.garment_care}`,
          'Made in Pakistan'
        ].filter(Boolean),
        material: p.fabric_composition || p.fabric || 'Premium Cotton',
        category: category?.slug || 'uncategorized'
      };
    });
    
    console.log(`✅ Transformed products: ${transformedProducts.length}`);
    res.json(transformedProducts);
  } catch (error: any) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ 
      message: 'Server error fetching products', 
      error: error.message
    });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ${slug}
    `;
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch products by array of IDs (for warm chapters product_ids)
app.post('/api/products/by-ids', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json([]);
    }
    
    const productList = await sql`
      SELECT * FROM products
      WHERE is_active = true
        AND id = ANY(${ids})
    `;
    
    console.log(`✅ Found ${productList.length} products by IDs`);
    res.json(productList);
  } catch (error: any) {
    console.error('Get products by IDs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/products', authenticateToken, adminOnly, async (req, res) => {
  try {
    const product = req.body;
    const result = await sql`
      INSERT INTO products (
        name, slug, description, base_price, compare_at_price, category_id,
        fabric, fit, sku, is_new_arrival, is_bestseller, is_featured,
        badge, images, image_url, attributes, fabric_composition, graphic_print,
        garment_specs, status, is_active
      ) VALUES (
        ${product.name}, ${product.slug}, ${product.description}, ${product.base_price},
        ${product.compare_at_price}, ${product.category_id}, ${product.fabric}, ${product.fit},
        ${product.sku}, ${product.is_new_arrival}, ${product.is_bestseller},
        ${product.is_featured}, ${product.badge},
        ${JSON.stringify(product.images)}, ${product.image_url},
        ${JSON.stringify(product.attributes)}, ${product.fabric_composition},
        ${product.graphic_print}, ${product.garment_specs}, ${product.status}, true
      )
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    
    const result = await sql`
      UPDATE products SET
        name = ${product.name},
        slug = ${product.slug},
        description = ${product.description},
        base_price = ${product.base_price},
        compare_at_price = ${product.compare_at_price},
        category_id = ${product.category_id},
        fabric = ${product.fabric},
        fit = ${product.fit},
        sku = ${product.sku},
        is_new_arrival = ${product.is_new_arrival},
        is_bestseller = ${product.is_bestseller},
        is_featured = ${product.is_featured},
        badge = ${product.badge},
        images = ${JSON.stringify(product.images)},
        image_url = ${product.image_url},
        attributes = ${JSON.stringify(product.attributes)},
        fabric_composition = ${product.fabric_composition},
        graphic_print = ${product.graphic_print},
        garment_specs = ${product.garment_specs},
        status = ${product.status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM products WHERE id = ${id}`;
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== CATEGORIES ROUTES ====================

app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 Fetching categories from database...');
    
    const categories = await sql`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC
    `;
    
    console.log(`✅ Found ${categories.length} categories`);
    res.json(categories);
  } catch (error: any) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured categories for Collections in Focus (max 4)
app.get('/api/categories/featured-in-focus', async (req, res) => {
  try {
    console.log('🎯 Fetching featured categories for Collections in Focus...');
    
    const categories = await sql`
      SELECT * FROM categories 
      WHERE is_active = true 
        AND is_featured_in_focus = true 
      ORDER BY display_order_in_focus ASC
      LIMIT 4
    `;
    
    console.log(`✅ Found ${categories.length} featured categories`);
    res.json(categories);
  } catch (error: any) {
    console.error('❌ Get featured categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category (Admin only) - with validation for is_featured_in_focus max 4
app.put('/api/categories/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured_in_focus, display_order_in_focus, ...otherFields } = req.body;
    
    // Validate max 4 featured categories if enabling is_featured_in_focus
    if (is_featured_in_focus === true) {
      const featuredCount = await sql`
        SELECT COUNT(*) as count FROM categories 
        WHERE is_featured_in_focus = true AND id != ${id}
      `;
      
      if (parseInt(featuredCount[0].count) >= 4) {
        return res.status(400).json({ 
          message: 'Maximum 4 categories can be featured in Collections in Focus' 
        });
      }
    }
    
    const updateData: any = { ...otherFields };
    if (is_featured_in_focus !== undefined) updateData.is_featured_in_focus = is_featured_in_focus;
    if (display_order_in_focus !== undefined) updateData.display_order_in_focus = display_order_in_focus;
    
    const updated = await sql`
      UPDATE categories 
      SET ${sql(updateData)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('❌ Update category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== WARM CHAPTERS ROUTES ====================

app.get('/api/warm-chapters', async (req, res) => {
  try {
    console.log('🔥 Fetching warm chapters from database...');
    
    const warmChapters = await sql`
      SELECT * FROM warm_chapters 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `;
    
    console.log(`✅ Found ${warmChapters.length} warm chapters`);
    res.json(warmChapters);
  } catch (error: any) {
    console.error('❌ Get warm chapters error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== COLLECTIONS ROUTES ====================

app.get('/api/collections', async (req, res) => {
  try {
    console.log('📚 Fetching collections from database...');
    
    const collections = await sql`
      SELECT * FROM collections 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `;
    
    console.log(`✅ Found ${collections.length} collections`);
    res.json(collections);
  } catch (error: any) {
    console.error('❌ Get collections error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/collections/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`📚 Fetching collection by slug: ${slug}`);
    
    const collections = await sql`
      SELECT * FROM collections 
      WHERE slug = ${slug} AND is_active = true
    `;
    
    if (collections.length === 0) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    console.log(`✅ Found collection: ${collections[0].name}`);
    res.json(collections[0]);
  } catch (error: any) {
    console.error('❌ Get collection error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== ORDERS ROUTES ====================

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = `SELECT * FROM orders`;
    const params: any[] = [];
    
    if (user_id) {
      query += ` WHERE user_id = $1`;
      params.push(user_id);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const orders = await sql(query, params);
    res.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const order = req.body;
    const orderNumber = `RVZ-${Date.now().toString().slice(-6)}`;
    
    const result = await sql`
      INSERT INTO orders (
        order_number, user_id, status, subtotal, shipping_cost, total,
        shipping_address, notes, discount_code, discount_amount
      ) VALUES (
        ${orderNumber}, ${order.user_id}, 'pending_verification',
        ${order.subtotal}, ${order.shipping_cost}, ${order.total},
        ${JSON.stringify(order.shipping_address)}, ${order.notes},
        ${order.discount_code}, ${order.discount_amount}
      )
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== REVIEWS ROUTES ====================

app.get('/api/reviews', async (req, res) => {
  try {
    const { product_id } = req.query;
    let query = `SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.is_approved = true`;
    const params: any[] = [];
    
    if (product_id) {
      query += ` AND r.product_id = $1`;
      params.push(product_id);
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const reviews = await sql(query, params);
    res.json(reviews);
  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== WISHLIST ROUTES ====================

app.get('/api/wishlist/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const wishlists = await sql`SELECT * FROM wishlists WHERE user_id = ${user_id}`;
    res.json(wishlists);
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    
    const existing = await sql`
      SELECT id FROM wishlists WHERE user_id = ${user_id} AND product_id = ${product_id}
    `;
    
    if (existing.length > 0) {
      await sql`DELETE FROM wishlists WHERE id = ${existing[0].id}`;
      res.json({ action: 'removed' });
    } else {
      await sql`INSERT INTO wishlists (user_id, product_id) VALUES (${user_id}, ${product_id})`;
      res.json({ action: 'added' });
    }
  } catch (error: any) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== ADMIN STATS ====================

app.get('/api/admin/stats', authenticateToken, adminOnly, async (req, res) => {
  try {
    const totalRevenue = await sql`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'delivered'`;
    const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;
    const totalProducts = await sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`;
    
    res.json({
      totalRevenue: totalRevenue[0].total,
      totalOrders: totalOrders[0].count,
      totalProducts: totalProducts[0].count,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== JOURNAL ENTRIES ====================

app.get('/api/journal', async (req, res) => {
  try {
    const entries = await sql`
      SELECT * FROM journal_entries 
      WHERE is_active = true 
      ORDER BY display_order ASC, published_date DESC
    `;
    res.json(entries);
  } catch (error: any) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== FAQs ====================

app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await sql`
      SELECT * FROM faqs 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `;
    res.json(faqs);
  } catch (error: any) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== OTP VERIFICATION ROUTES ====================

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save OTP to database
    await sql`
      INSERT INTO otp_verifications (email, otp, expires_at)
      VALUES (${email}, ${otp}, ${expiresAt})
    `;
    
    // In production, send email with OTP
    // For now, we'll just log it and return it in response (for testing)
    console.log(`📧 OTP for ${email}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // In production, don't return OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP record
    const records = await sql`
      SELECT * FROM otp_verifications
      WHERE email = ${email} 
        AND otp = ${otp} 
        AND is_verified = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (records.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Mark OTP as verified
    await sql`
      UPDATE otp_verifications
      SET is_verified = true
      WHERE id = ${records[0].id}
    `;
    
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== COUPON CODE ROUTES ====================

// Validate coupon
app.post('/api/validate-coupon', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    // Find coupon
    const coupons = await sql`
      SELECT * FROM coupon_codes
      WHERE code = ${code}
        AND is_active = true
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (ends_at IS NULL OR ends_at >= NOW())
        AND (usage_limit IS NULL OR used_count < usage_limit)
    `;
    
    if (coupons.length === 0) {
      return res.json({ valid: false, message: 'Invalid or expired coupon code' });
    }
    
    const coupon = coupons[0];
    
    // Check minimum order amount
    if (coupon.min_order_amount && orderAmount < parseFloat(coupon.min_order_amount)) {
      return res.json({ 
        valid: false, 
        message: `Minimum order amount of Rs. ${coupon.min_order_amount} required` 
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderAmount * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount && discount > parseFloat(coupon.max_discount)) {
        discount = parseFloat(coupon.max_discount);
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = parseFloat(coupon.discount_value);
    }
    
    res.json({ 
      valid: true, 
      discount: Math.round(discount),
      coupon: {
        code: coupon.code,
        type: coupon.discount_type,
        value: coupon.discount_value
      }
    });
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ravenza API Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: NeonDB connected`);
});
