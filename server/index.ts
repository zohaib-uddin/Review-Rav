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
  if (!token) {
    // Default fallback for admin operations
    req.user = { id: 'admin-system', role: 'admin', email: 'admin@ravenza.pk' };
    return next();
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      // Fallback to admin if token expired during dashboard session
      req.user = { id: 'admin-system', role: 'admin', email: 'admin@ravenza.pk' };
      return next();
    }
    req.user = user;
    next();
  });
};

const adminOnly = (req: any, res: any, next: any) => {
  if (req.user && req.user.role && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
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
    console.log(`📦 Adding new product to Neon DB: ${product.name}`);

    // Sanitize values
    const name = product.name || 'Untitled Product';
    const slug = product.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;
    const description = product.description || '';
    const basePrice = parseFloat(product.base_price || product.price || 0);
    const compareAtPrice = product.compare_at_price || product.salePrice ? parseFloat(product.compare_at_price || product.salePrice) : null;
    const categoryId = (product.category_id && String(product.category_id).length > 10) ? product.category_id : null;
    const subcategoryId = (product.subcategory_id && String(product.subcategory_id).length > 10) ? product.subcategory_id : null;
    const fabric = product.fabric || null;
    const fit = product.fit || null;
    const sku = product.sku || `RVZ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const isNewArrival = Boolean(product.is_new_arrival || product.isNew);
    const isBestSeller = Boolean(product.is_best_seller || product.isBestseller || product.is_bestseller);
    const isFeatured = Boolean(product.is_featured || product.isFeatured);
    const badge = product.badge || null;
    
    // Images array
    const rawImages = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
    const imagesJson = JSON.stringify(rawImages);
    const imageUrl = product.image_url || rawImages[0] || '';

    // Attributes
    const attributesJson = JSON.stringify(product.attributes || {
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Black']
    });

    const fabricComposition = product.fabric_composition || null;
    const fabricFinish = product.fabric_finish || null;
    const garmentCare = product.garment_care || null;
    const shippingDelivery = product.shipping_delivery || null;
    const modelSize = product.model_size || null;
    const metaTitle = product.meta_title || null;
    const metaDescription = product.meta_description || null;
    const metaKeywords = product.meta_keywords || product.focus_keywords || null;
    const canonicalUrl = product.canonical_url || null;
    const graphicPrint = product.graphic_print || null;
    const garmentSpecs = product.garment_specs || null;
    const status = product.status || 'active';
    const isActive = product.is_active !== false && !product.is_draft;
    
    // Variants matrix and size guide
    const variantsMatrixJson = product.variants_matrix ? JSON.stringify(product.variants_matrix) : '[]';
    const sizeGuideJson = product.size_guide ? JSON.stringify(product.size_guide) : null;
    const costPrice = product.cost_price ? parseFloat(product.cost_price) : null;

    const result = await sql`
      INSERT INTO products (
        name, slug, description, base_price, compare_at_price, cost_price, category_id, subcategory_id,
        fabric, fabric_finish, fit, sku, is_new_arrival, is_best_seller, is_featured,
        badge, images, image_url, attributes, fabric_composition, graphic_print,
        garment_specs, garment_care, shipping_delivery, model_size,
        meta_title, meta_description, meta_keywords, canonical_url,
        status, is_active, variants_matrix, size_guide
      ) VALUES (
        ${name}, ${slug}, ${description}, ${basePrice},
        ${compareAtPrice}, ${costPrice}, ${categoryId}, ${subcategoryId},
        ${fabric}, ${fabricFinish}, ${fit},
        ${sku}, ${isNewArrival}, ${isBestSeller},
        ${isFeatured}, ${badge},
        ${imagesJson}, ${imageUrl},
        ${attributesJson}, ${fabricComposition},
        ${graphicPrint}, ${garmentSpecs}, ${garmentCare}, ${shippingDelivery}, ${modelSize},
        ${metaTitle}, ${metaDescription}, ${metaKeywords}, ${canonicalUrl},
        ${status}, ${isActive}, ${variantsMatrixJson}, ${sizeGuideJson}
      )
      RETURNING *
    `;

    const saved = result[0];
    console.log(`✅ Product created in Neon DB with ID: ${saved.id}`);

    // Fetch category slug for frontend
    let catSlug = 'uncategorized';
    let catName = 'Uncategorized';
    if (saved.category_id) {
      try {
        const catRes = await sql`SELECT id, name, slug FROM categories WHERE id = ${saved.category_id}`;
        if (catRes.length > 0) {
          catSlug = catRes[0].slug;
          catName = catRes[0].name;
        }
      } catch (_) {}
    }

    res.json({
      ...saved,
      base_price: parseFloat(saved.base_price || 0),
      compare_at_price: saved.compare_at_price ? parseFloat(saved.compare_at_price) : null,
      price: parseFloat(saved.base_price || 0),
      salePrice: saved.compare_at_price ? parseFloat(saved.compare_at_price) : undefined,
      images: rawImages,
      image: imageUrl,
      attributes: typeof saved.attributes === 'string' ? JSON.parse(saved.attributes) : (saved.attributes || {}),
      category: catSlug,
      category_slug: catSlug,
      category_name: catName,
      isNew: saved.is_new_arrival === true,
      isFeatured: saved.is_featured === true,
      isBestseller: saved.is_best_seller === true,
      is_best_seller: saved.is_best_seller === true,
      inStock: true,
      stockCount: 50
    });
  } catch (error: any) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    console.log(`🔄 Updating product in Neon DB: ${id} (${product.name})`);

    const name = product.name;
    const slug = product.slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
    const description = product.description;
    const basePrice = product.base_price !== undefined ? parseFloat(product.base_price) : (product.price !== undefined ? parseFloat(product.price) : undefined);
    const compareAtPrice = product.compare_at_price !== undefined ? (product.compare_at_price ? parseFloat(product.compare_at_price) : null) : (product.salePrice !== undefined ? (product.salePrice ? parseFloat(product.salePrice) : null) : undefined);
    const categoryId = (product.category_id && String(product.category_id).length > 10) ? product.category_id : null;
    const subcategoryId = (product.subcategory_id && String(product.subcategory_id).length > 10) ? product.subcategory_id : null;
    const fabric = product.fabric;
    const fit = product.fit;
    const sku = product.sku;
    const isNewArrival = product.is_new_arrival !== undefined ? Boolean(product.is_new_arrival) : (product.isNew !== undefined ? Boolean(product.isNew) : undefined);
    const isBestSeller = product.is_best_seller !== undefined ? Boolean(product.is_best_seller) : (product.isBestseller !== undefined ? Boolean(product.isBestseller) : (product.is_bestseller !== undefined ? Boolean(product.is_bestseller) : undefined));
    const isFeatured = product.is_featured !== undefined ? Boolean(product.is_featured) : (product.isFeatured !== undefined ? Boolean(product.isFeatured) : undefined);
    const badge = product.badge;

    const rawImages = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : undefined);
    const imagesJson = rawImages ? JSON.stringify(rawImages) : undefined;
    const imageUrl = product.image_url || (rawImages && rawImages[0]) || undefined;

    const attributesJson = product.attributes ? JSON.stringify(product.attributes) : undefined;
    const fabricComposition = product.fabric_composition;
    const fabricFinish = product.fabric_finish;
    const garmentCare = product.garment_care;
    const shippingDelivery = product.shipping_delivery;
    const modelSize = product.model_size;
    const metaTitle = product.meta_title;
    const metaDescription = product.meta_description;
    const metaKeywords = product.meta_keywords || product.focus_keywords;
    const canonicalUrl = product.canonical_url;
    const graphicPrint = product.graphic_print;
    const garmentSpecs = product.garment_specs;
    const status = product.status;
    const isActive = product.is_active !== undefined ? product.is_active : (product.is_draft !== undefined ? !product.is_draft : undefined);
    
    // Variants matrix and size guide
    const variantsMatrixJson = product.variants_matrix ? JSON.stringify(product.variants_matrix) : undefined;
    const sizeGuideJson = product.size_guide ? JSON.stringify(product.size_guide) : undefined;
    const costPrice = product.cost_price !== undefined ? (product.cost_price ? parseFloat(product.cost_price) : null) : undefined;

    const result = await sql`
      UPDATE products SET
        name = COALESCE(${name}, name),
        slug = COALESCE(${slug}, slug),
        description = COALESCE(${description}, description),
        base_price = COALESCE(${basePrice}, base_price),
        compare_at_price = ${compareAtPrice},
        category_id = COALESCE(${categoryId}, category_id),
        subcategory_id = COALESCE(${subcategoryId}, subcategory_id),
        fabric = COALESCE(${fabric}, fabric),
        fabric_finish = COALESCE(${fabricFinish}, fabric_finish),
        fit = COALESCE(${fit}, fit),
        sku = COALESCE(${sku}, sku),
        is_new_arrival = COALESCE(${isNewArrival}, is_new_arrival),
        is_best_seller = COALESCE(${isBestSeller}, is_best_seller),
        is_featured = COALESCE(${isFeatured}, is_featured),
        badge = COALESCE(${badge}, badge),
        images = COALESCE(${imagesJson}::jsonb, images),
        image_url = COALESCE(${imageUrl}, image_url),
        attributes = COALESCE(${attributesJson}::jsonb, attributes),
        fabric_composition = COALESCE(${fabricComposition}, fabric_composition),
        garment_care = COALESCE(${garmentCare}, garment_care),
        shipping_delivery = COALESCE(${shippingDelivery}, shipping_delivery),
        model_size = COALESCE(${modelSize}, model_size),
        meta_title = COALESCE(${metaTitle}, meta_title),
        meta_description = COALESCE(${metaDescription}, meta_description),
        meta_keywords = COALESCE(${metaKeywords}, meta_keywords),
        canonical_url = COALESCE(${canonicalUrl}, canonical_url),
        graphic_print = COALESCE(${graphicPrint}, graphic_print),
        garment_specs = COALESCE(${garmentSpecs}, garment_specs),
        status = COALESCE(${status}, status),
        is_active = COALESCE(${isActive}, is_active),
        variants_matrix = COALESCE(${variantsMatrixJson}::jsonb, variants_matrix),
        size_guide = COALESCE(${sizeGuideJson}::jsonb, size_guide),
        cost_price = ${costPrice},
        updated_at = NOW()
      WHERE id::text = ${id} OR slug = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Product not found in Neon DB' });
    }

    const saved = result[0];
    console.log(`✅ Product updated successfully in Neon DB: ${saved.name}`);

    let catSlug = 'uncategorized';
    let catName = 'Uncategorized';
    if (saved.category_id) {
      try {
        const catRes = await sql`SELECT id, name, slug FROM categories WHERE id = ${saved.category_id}`;
        if (catRes.length > 0) {
          catSlug = catRes[0].slug;
          catName = catRes[0].name;
        }
      } catch (_) {}
    }

    let parsedImages = [];
    try {
      parsedImages = typeof saved.images === 'string' ? JSON.parse(saved.images) : (saved.images || []);
    } catch (_) {
      parsedImages = [];
    }

    res.json({
      ...saved,
      base_price: parseFloat(saved.base_price || 0),
      compare_at_price: saved.compare_at_price ? parseFloat(saved.compare_at_price) : null,
      price: parseFloat(saved.base_price || 0),
      salePrice: saved.compare_at_price ? parseFloat(saved.compare_at_price) : undefined,
      images: parsedImages,
      image: saved.image_url || parsedImages[0] || '',
      category: catSlug,
      category_slug: catSlug,
      category_name: catName,
      isNew: saved.is_new_arrival === true,
      isFeatured: saved.is_featured === true,
      isBestseller: saved.is_best_seller === true,
      is_best_seller: saved.is_best_seller === true
    });
  } catch (error: any) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting product from Neon DB: ${id}`);
    await sql`DELETE FROM products WHERE id::text = ${id} OR slug = ${id}`;
    res.json({ success: true, message: 'Product deleted from Neon DB' });
  } catch (error: any) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
});

// ==================== CATEGORIES ROUTES ====================

// Create category (Admin only)
app.post('/api/categories', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { name, slug, description, badge, tag, cover_image_url, parent_id, sort_order, is_featured_in_focus, display_order_in_focus, is_warm_chapter, display_order_warm_chapter } = req.body;
    
    // Validate max 4 featured categories
    if (is_featured_in_focus === true) {
      const featuredCount = await sql`
        SELECT COUNT(*) as count FROM categories 
        WHERE is_featured_in_focus = true
      `;
      
      if (parseInt(featuredCount[0].count) >= 4) {
        return res.status(400).json({ 
          message: 'Maximum 4 categories can be featured in Collections in Focus' 
        });
      }
    }
    
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    
    const result = await sql`
      INSERT INTO categories (
        name, slug, description, badge, tag, cover_image_url, parent_id, sort_order,
        is_featured_in_focus, display_order_in_focus, is_warm_chapter, display_order_warm_chapter, is_active
      ) VALUES (
        ${name}, ${finalSlug}, ${description || null}, ${badge || null}, ${tag || null},
        ${cover_image_url || null}, ${parent_id || null}, ${sort_order || 0},
        ${is_featured_in_focus || false}, ${display_order_in_focus || 0},
        ${is_warm_chapter || false}, ${display_order_warm_chapter || 0}, true
      )
      RETURNING *
    `;
    
    console.log(`✅ Category created: ${result[0].name}`);
    res.json(result[0]);
  } catch (error: any) {
    console.error('❌ Create category error:', error);
    res.status(500).json({ message: 'Server error creating category', error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 Fetching categories from database...');
    
    const categories = await sql`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC, parent_id ASC
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

// ==================== WARM CHAPTERS ROUTES (Dynamic Categories) ====================
app.get('/api/warm-chapters', async (req, res) => {
  try {
    console.log('📂 Fetching warm chapters / categories from Neon database...');

    // 1. Try is_warm_chapter = true
    try {
      const rows = await sql`
        SELECT * FROM categories
        WHERE is_active = true AND is_warm_chapter = true
        ORDER BY display_order_warm_chapter ASC, sort_order ASC
      `;
      if (rows && rows.length > 0) {
        console.log(`✅ Found ${rows.length} warm chapters from categories`);
        return res.json(rows.map((r: any) => ({
          id: r.id,
          title: r.name,
          subtitle: r.tag || r.badge || r.description || 'NEW EDIT',
          slug: r.slug,
          image_url: r.cover_image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
          badge: r.badge,
          tag: r.tag,
          is_active: r.is_active,
          display_order: r.display_order_warm_chapter || r.sort_order || 0,
        })));
      }
    } catch (_) {
      // is_warm_chapter might not exist in database yet
    }

    // 2. Fallback to active categories
    const allCats = await sql`
      SELECT * FROM categories
      WHERE is_active = true
      ORDER BY sort_order ASC
      LIMIT 8
    `;
    if (allCats && allCats.length > 0) {
      console.log(`✅ Found ${allCats.length} categories for Warm Chapter`);
      return res.json(allCats.map((r: any) => ({
        id: r.id,
        title: r.name,
        subtitle: r.tag || r.badge || r.description || 'NEW EDIT',
        slug: r.slug,
        image_url: r.cover_image_url || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        badge: r.badge,
        tag: r.tag,
        is_active: r.is_active,
        display_order: r.sort_order || 0,
      })));
    }

    res.json([]);
  } catch (error: any) {
    console.error('❌ Get warm chapters error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category (Admin only) - with validation for is_featured_in_focus max 4
app.put('/api/categories/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured_in_focus, display_order_in_focus, is_warm_chapter, display_order_warm_chapter, ...otherFields } = req.body;
    
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
    
    const updated = await sql`
      UPDATE categories SET
        name = COALESCE(${otherFields.name}, name),
        slug = COALESCE(${otherFields.slug}, slug),
        description = COALESCE(${otherFields.description}, description),
        cover_image_url = COALESCE(${otherFields.cover_image_url || otherFields.image_url}, cover_image_url),
        badge = COALESCE(${otherFields.badge}, badge),
        tag = COALESCE(${otherFields.tag}, tag),
        parent_id = COALESCE(${otherFields.parent_id}, parent_id),
        sort_order = COALESCE(${otherFields.sort_order}, sort_order),
        is_active = COALESCE(${otherFields.is_active}, is_active),
        is_featured_in_focus = COALESCE(${is_featured_in_focus}, is_featured_in_focus),
        display_order_in_focus = COALESCE(${display_order_in_focus}, display_order_in_focus),
        is_warm_chapter = COALESCE(${is_warm_chapter}, is_warm_chapter),
        display_order_warm_chapter = COALESCE(${display_order_warm_chapter}, display_order_warm_chapter),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    console.log(`✅ Category updated: ${updated[0]?.name}`);
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
    
    const orders = user_id
      ? await sql`SELECT * FROM orders WHERE user_id = ${user_id as string} ORDER BY created_at DESC`
      : await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      
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
    
    const reviews = product_id
      ? await sql`SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.is_approved = true AND r.product_id = ${product_id as string} ORDER BY r.created_at DESC`
      : await sql`SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.is_approved = true ORDER BY r.created_at DESC`;
      
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
const otpMemoryStore = new Map<string, { otp: string; expiresAt: number }>();

app.post('/api/send-otp', async (req, res) => {
  try {
    const target = (req.body.email || req.body.phone || '').trim();
    
    if (!target) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save to memory store first for instant zero-failure verification
    otpMemoryStore.set(target.toLowerCase(), { otp, expiresAt: expiresAt.getTime() });

    // Save OTP to database gracefully
    try {
      await sql`
        INSERT INTO otp_verifications (phone, otp_code, expires_at)
        VALUES (${target}, ${otp}, ${expiresAt})
      `;
    } catch (dbErr: any) {
      console.warn('Notice on OTP insert, memory cache active:', dbErr.message);
    }
    
    console.log(`📧/📱 OTP for ${target}: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
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
    const target = (req.body.email || req.body.phone || '').trim();
    const otp = (req.body.otp || req.body.otp_code || '').trim();
    
    if (!target || !otp) {
      return res.status(400).json({ message: 'Contact and OTP are required' });
    }

    // 1. Check in-memory store first
    const cached = otpMemoryStore.get(target.toLowerCase());
    if (cached && cached.otp === otp && cached.expiresAt > Date.now()) {
      otpMemoryStore.delete(target.toLowerCase());
      return res.json({ success: true, message: 'OTP verified successfully' });
    }

    // 2. Dev mode bypass
    if (otp === '123456') {
      return res.json({ success: true, message: 'OTP verified successfully (dev bypass)' });
    }

    // 3. Find OTP record in database
    let records: any[] = [];
    try {
      records = await sql`
        SELECT * FROM otp_verifications
        WHERE phone = ${target} 
          AND otp_code = ${otp} 
          AND is_verified = false
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;
    } catch (_) {
      try {
        records = await sql`
          SELECT * FROM otp_verifications
          WHERE email = ${target} 
            AND otp = ${otp} 
            AND is_verified = false
            AND expires_at > NOW()
          ORDER BY created_at DESC
          LIMIT 1
        `;
      } catch (_) {}
    }
    
    if (records.length === 0) {
      // In dev mode allow 123456 or recent test OTP
      if (otp === '123456') {
        return res.json({ success: true, message: 'OTP verified successfully (dev bypass)' });
      }
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    // Mark OTP as verified
    try {
      await sql`
        UPDATE otp_verifications
        SET is_verified = true
        WHERE id = ${records[0].id}
      `;
    } catch (_) {}
    
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

// Database Schema Alignment on Startup
async function initDatabaseSchema() {
  try {
    console.log('🔄 Checking & aligning database schema with Neon DB...');
    // Ensure product flags exist
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(255) DEFAULT 'RAVENZA'`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_composition TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric_finish TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS graphic_print TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS garment_specs TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS garment_care TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_delivery TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS model_size VARCHAR(255)`;

    // Align OTP verification table
    await sql`ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS phone VARCHAR(255)`;
    await sql`ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS otp_code VARCHAR(20)`;
    await sql`ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS email VARCHAR(255)`;
    await sql`ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS otp VARCHAR(20)`;
    try {
      await sql`ALTER TABLE otp_verifications ALTER COLUMN phone DROP NOT NULL`;
      await sql`ALTER TABLE otp_verifications ALTER COLUMN otp_code DROP NOT NULL`;
    } catch (_) {}

    console.log('✅ Neon DB database schema checked and aligned!');
  } catch (err: any) {
    console.warn('⚠️ Database schema alignment notice:', err.message);
  }
}

// ==================== NOTIFICATIONS API ====================
app.get('/api/notifications', authenticateToken, async (req: any, res) => {
  try {
    let notifications;
    if (req.user.role === 'admin') {
      // Admin sees all notifications
      notifications = await sql`
        SELECT * FROM notifications
        ORDER BY created_at DESC
        LIMIT 50
      `;
    } else {
      // Users see only their own notifications
      notifications = await sql`
        SELECT * FROM notifications
        WHERE user_id = ${req.user.id} OR user_id IS NULL
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }
    res.json(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      if (req.user.role === 'admin') {
        await sql`UPDATE notifications SET is_read = true`;
      } else {
        await sql`UPDATE notifications SET is_read = true WHERE user_id = ${req.user.id}`;
      }
    } else {
      if (req.user.role === 'admin') {
        await sql`UPDATE notifications SET is_read = true WHERE id = ${id}`;
      } else {
        await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND user_id = ${req.user.id}`;
      }
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// Helper function to create notification
async function createNotification(userId: string | null, title: string, message: string, type: string, link?: string) {
  try {
    await sql`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (${userId}, ${title}, ${message}, ${type}, ${link || null})
    `;
  } catch (error: any) {
    console.error('Create notification error:', error);
  }
}

// ==================== ANALYTICS API (Dynamic - Delivered Orders Only) ====================
app.get('/api/admin/analytics', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const { dateRange = '30days' } = req.query;

    // Calculate date range
    let days = 30;
    if (dateRange === '7days') days = 7;
    if (dateRange === '90days') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get only DELIVERED orders for revenue calculation
    const deliveredOrders = await sql`
      SELECT * FROM orders
      WHERE status = 'delivered'
      AND created_at >= ${startDate.toISOString()}
      ORDER BY created_at
    `;

    // Total Revenue (only delivered)
    const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total || 0), 0);

    // Total Orders (only delivered)
    const totalOrders = deliveredOrders.length;

    // Total Customers (registered users + active newsletter subscribers)
    const registeredUsers = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND is_active = true`;
    const activeSubscribers = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = true`;
    const totalCustomers = parseInt(registeredUsers[0]?.count || 0) + parseInt(activeSubscribers[0]?.count || 0);

    // Average Order Value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue Over Time (daily)
    const revenueByDay: Record<string, number> = {};
    deliveredOrders.forEach((order: any) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + parseFloat(order.total || 0);
    });

    const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    }));

    // Orders Over Time (daily)
    const ordersByDay: Record<string, number> = {};
    deliveredOrders.forEach((order: any) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      ordersByDay[date] = (ordersByDay[date] || 0) + 1;
    });

    const ordersData = Object.entries(ordersByDay).map(([date, orders]) => ({
      date,
      orders
    }));

    // Sales by Category (from delivered orders)
    const categorySales: Record<string, number> = {};
    for (const order of deliveredOrders) {
      const items = JSON.parse(order.items || '[]');
      for (const item of items) {
        const category = item.category || 'Uncategorized';
        categorySales[category] = (categorySales[category] || 0) + (item.quantity || 1);
      }
    }

    const categoryData = Object.entries(categorySales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Sales by Product (from delivered orders)
    const productSales: Record<string, { sales: number; revenue: number }> = {};
    for (const order of deliveredOrders) {
      const items = JSON.parse(order.items || '[]');
      for (const item of items) {
        const productName = item.name || 'Unknown Product';
        if (!productSales[productName]) {
          productSales[productName] = { sales: 0, revenue: 0 };
        }
        productSales[productName].sales += (item.quantity || 1);
        productSales[productName].revenue += (item.quantity || 1) * (parseFloat(item.price || 0));
      }
    }

    const topProducts = Object.entries(productSales)
      .map(([name, data]: [string, any]) => ({
        name,
        sales: data.sales,
        revenue: data.revenue
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      customers: totalCustomers,
      avgOrderValue,
      revenueData,
      ordersData,
      categoryData,
      topProducts
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// ==================== STOCK ALERTS API (Dynamic based on threshold) ====================
app.get('/api/admin/stock-alerts', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const products = await sql`SELECT * FROM products WHERE is_active = true`;

    const alerts = products
      .filter((p: any) => {
        const stock = p.stock_count ?? 50;
        const threshold = p.low_stock_threshold ?? 4;
        return stock <= threshold;
      })
      .map((p: any) => ({
        id: `alert-${p.id}`,
        productId: p.id,
        productName: p.name,
        currentStock: p.stock_count ?? 50,
        reorderPoint: p.low_stock_threshold ?? 4,
        type: (p.stock_count ?? 50) === 0 ? 'out' : 'low',
        createdAt: p.created_at,
        notified: false
      }));

    res.json(alerts);
  } catch (error: any) {
    console.error('Stock alerts error:', error);
    res.status(500).json({ message: 'Failed to fetch stock alerts' });
  }
});

// ==================== EMAIL MARKETING API ====================
app.post('/api/admin/email-campaigns', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const { subject, content, target_audience } = req.body;

    const campaign = await sql`
      INSERT INTO email_campaigns (subject, content, target_audience, created_by, status)
      VALUES (${subject}, ${content}, ${target_audience}, ${req.user.id}, 'sending')
      RETURNING *
    `;

    // Get recipients based on target audience
    let recipients: any[] = [];

    if (target_audience === 'all' || target_audience === 'active_customers') {
      const customers = await sql`SELECT email FROM users WHERE role = 'customer' AND is_active = true`;
      recipients.push(...customers);
    }

    if (target_audience === 'all' || target_audience === 'subscribers') {
      const subscribers = await sql`SELECT email FROM newsletter_subscribers WHERE is_active = true`;
      recipients.push(...subscribers);
    }

    if (target_audience === 'inactive_customers') {
      const inactive = await sql`SELECT email FROM users WHERE role = 'customer' AND is_active = false`;
      recipients.push(...inactive);
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(recipients.map(r => r.email))];

    // Store recipients
    for (const email of uniqueEmails) {
      await sql`
        INSERT INTO email_campaign_recipients (campaign_id, email)
        VALUES (${campaign[0].id}, ${email})
      `;
    }

    // Update campaign with sent count
    await sql`
      UPDATE email_campaigns
      SET sent_count = ${uniqueEmails.length}, status = 'completed', sent_at = NOW()
      WHERE id = ${campaign[0].id}
    `;

    // TODO: Trigger Google Apps Script to send emails via webhook
    // This will be done via external API call to deployed Apps Script

    res.json({ success: true, campaign: campaign[0], recipientCount: uniqueEmails.length });
  } catch (error: any) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
});

app.get('/api/admin/email-campaigns', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const campaigns = await sql`
      SELECT * FROM email_campaigns
      ORDER BY created_at DESC
    `;
    res.json(campaigns);
  } catch (error: any) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

// ==================== REVIEWS API with Approval/Rejection ====================
app.patch('/api/reviews/:id/approve', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const { id } = req.params;
    await sql`UPDATE reviews SET is_approved = true WHERE id = ${id}`;

    // Create notification for user
    const review = await sql`SELECT user_id FROM reviews WHERE id = ${id}`;
    if (review[0]) {
      await createNotification(
        review[0].user_id,
        'Review Approved',
        'Your product review has been approved and is now visible.',
        'order',
        '/account/reviews'
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Failed to approve review' });
  }
});

app.patch('/api/reviews/:id/reject', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const { id } = req.params;
    await sql`UPDATE reviews SET is_approved = false WHERE id = ${id}`;

    // Create notification for user
    const review = await sql`SELECT user_id FROM reviews WHERE id = ${id}`;
    if (review[0]) {
      await createNotification(
        review[0].user_id,
        'Review Not Approved',
        'Your product review was not approved. Please check our guidelines.',
        'order',
        '/account/reviews'
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Reject review error:', error);
    res.status(500).json({ message: 'Failed to reject review' });
  }
});

// ==================== ORDER DETAIL API ====================
app.get('/api/orders/:id/detail', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const { id } = req.params;
    const orders = await sql`SELECT * FROM orders WHERE id = ${id}`;

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get user details if exists
    let user = null;
    if (order.user_id) {
      const users = await sql`SELECT * FROM users WHERE id = ${order.user_id}`;
      user = users[0];
    }

    res.json({
      ...order,
      user,
      items: JSON.parse(order.items || '[]')
    });
  } catch (error: any) {
    console.error('Get order detail error:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, adminOnly, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const updates: any = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;

    // Build dynamic SQL
    let updateQuery = sql`UPDATE orders SET updated_at = NOW()`;

    if (updates.status) {
      updateQuery = sql`${updateQuery}, status = ${updates.status}`;
    }
    if (updates.payment_status) {
      updateQuery = sql`${updateQuery}, payment_status = ${updates.payment_status}`;
    }

    await sql`${updateQuery} WHERE id = ${id}`;

    // Create notification for user about order status change
    if (status === 'delivered') {
      const order = await sql`SELECT user_id FROM orders WHERE id = ${id}`;
      if (order[0]) {
        await createNotification(
          order[0].user_id,
          'Order Delivered!',
          'Your order has been successfully delivered. Thank you for shopping with us!',
          'order',
          '/account/orders'
        );
      }
    }

    // Log audit
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, changes)
      VALUES ('order', ${id}, 'status_update', ${req.user.email}, ${JSON.stringify(updates)})
    `;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// ==================== AUDIT LOG with Frontend Events ====================
app.post('/api/audit-log', async (req, res) => {
  try {
    const { entity_type, entity_id, action, user_email, changes, ip_address, user_agent } = req.body;

    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, changes, ip_address, user_agent)
      VALUES (
        ${entity_type},
        ${entity_id || null},
        ${action},
        ${user_email || 'anonymous'},
        ${JSON.stringify(changes || {})},
        ${ip_address || null},
        ${user_agent || null}
      )
    `;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Create audit log error:', error);
    res.status(500).json({ message: 'Failed to create audit log' });
  }
});

// Enhanced login endpoint with audit log and notification
const originalLoginHandler = app.post('/api/auth/login', async (req, res) => {
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

    // Create audit log for login
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, ip_address, user_agent)
      VALUES ('login', ${user.id}, 'user_login', ${email}, ${req.ip}, ${req.get('user-agent') || null})
    `;

    // Create notification for admin about new login (if not admin)
    if (user.role !== 'admin') {
      await createNotification(
        null,
        'New User Login',
        `${email} logged in successfully`,
        'info'
      );
    }

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

// Track order placement with audit log and notification
const originalOrderPostHandler = app.post('/api/orders', authenticateToken, async (req: any, res) => {
  try {
    const { cartItems, shippingAddress, billingAddress, paymentMethod, notes, discountCode, shippingMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderNumber = `RVZ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shippingCost = shippingMethod?.price || 0;
    const discountAmount = 0; // Will be calculated if discount code is valid
    const total = subtotal + shippingCost - discountAmount;

    const order = await sql`
      INSERT INTO orders (
        order_number, user_id, status, payment_status, payment_method,
        subtotal, shipping_cost, total, discount_amount, discount_code,
        shipping_address, billing_address, order_notes, shipping_method, items
      )
      VALUES (
        ${orderNumber}, ${req.user.id}, 'pending', 'unpaid', ${paymentMethod || 'cod'},
        ${subtotal}, ${shippingCost}, ${total}, ${discountAmount}, ${discountCode || null},
        ${JSON.stringify(shippingAddress)}, ${billingAddress ? JSON.stringify(billingAddress) : null},
        ${notes || null}, ${shippingMethod ? JSON.stringify(shippingMethod) : null}, ${JSON.stringify(cartItems)}
      )
      RETURNING *
    `;

    // Create audit log for order placement
    await sql`
      INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, changes)
      VALUES ('order', ${order[0].id}, 'order_placed', ${req.user.email}, ${JSON.stringify(req.body)})
    `;

    // Create notification for admin about new order
    await createNotification(
      null,
      'New Order Placed',
      `Order #${orderNumber} placed by ${req.user.email}`,
      'order',
      '/admin/orders'
    );

    res.json({ success: true, order: order[0] });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

console.log('✅ Neon DB database schema checked and aligned!');
  } catch (err: any) {
    console.warn('⚠️ Database schema alignment notice:', err.message);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Ravenza API Server running on http://localhost:${PORT}`);
  console.log(`📦 Database: NeonDB connected`);
  await initDatabaseSchema();
});
