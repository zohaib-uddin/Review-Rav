import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed() {
  console.log('🌱 Starting comprehensive database seed for Ravenza...\n');

  // ==================== 1. CATEGORIES ====================
  console.log('📦 Seeding categories...');

  // Ensure columns exist in case of new database instance
  try {
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_warm_chapter boolean DEFAULT false`;
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order_warm_chapter integer DEFAULT 0`;
  } catch (err) {
    console.log('Note on categories alteration:', err);
  }

  const mainCategories = [
    {
      name: 'Co-Ord Sets',
      slug: 'co-ord-sets',
      description: 'Premium matching sets for effortless style and elevated silhouettes.',
      badge: 'TRENDING',
      tag: 'WINTER ESSENTIALS',
      sort_order: 1,
      is_featured_in_focus: true,
      display_order_in_focus: 1,
      is_warm_chapter: true,
      display_order_warm_chapter: 1,
      cover_image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
    },
    {
      name: 'Oversize Tees',
      slug: 'oversize-tees',
      description: 'Bold graphic tees with heavyweight fabric and signature acid wash.',
      badge: 'BESTSELLER',
      tag: 'STREETWEAR',
      sort_order: 2,
      is_featured_in_focus: true,
      display_order_in_focus: 2,
      is_warm_chapter: true,
      display_order_warm_chapter: 2,
      cover_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
    },
    {
      name: 'Graphic Trousers',
      slug: 'graphic-trousers',
      description: 'Relaxed wide leg and cargo trousers with custom screen prints.',
      badge: 'NEW DROP',
      tag: 'NEW DROP',
      sort_order: 3,
      is_featured_in_focus: true,
      display_order_in_focus: 3,
      is_warm_chapter: true,
      display_order_warm_chapter: 3,
      cover_image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop',
    },
    {
      name: 'Trackpants',
      slug: 'trackpants',
      description: 'Comfort-engineered heavyweight fleece trackpants for daily rotation.',
      badge: 'ESSENTIALS',
      tag: 'COMFORT',
      sort_order: 4,
      is_featured_in_focus: true,
      display_order_in_focus: 4,
      is_warm_chapter: true,
      display_order_warm_chapter: 4,
      cover_image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
    },
    {
      name: 'Graphic Shorts',
      slug: 'graphic-shorts',
      description: 'Breathable french terry shorts with bold screen-printed typography.',
      badge: 'SUMMER',
      tag: 'SUMMER',
      sort_order: 5,
      is_featured_in_focus: false,
      display_order_in_focus: 0,
      is_warm_chapter: false,
      display_order_warm_chapter: 0,
      cover_image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
    },
    {
      name: 'Shirts & Jackets',
      slug: 'shirts-jackets',
      description: 'Layering outerwear, overshirts, and utility jackets.',
      badge: 'OUTERWEAR',
      tag: 'LAYERING',
      sort_order: 6,
      is_featured_in_focus: false,
      display_order_in_focus: 0,
      is_warm_chapter: false,
      display_order_warm_chapter: 0,
      cover_image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
    },
  ];

  for (const cat of mainCategories) {
    await sql`
      INSERT INTO categories (
        name, slug, description, badge, tag, sort_order, is_active,
        is_featured_in_focus, display_order_in_focus, is_warm_chapter, display_order_warm_chapter,
        cover_image_url
      ) VALUES (
        ${cat.name}, ${cat.slug}, ${cat.description}, ${cat.badge}, ${cat.tag},
        ${cat.sort_order}, true, ${cat.is_featured_in_focus}, ${cat.display_order_in_focus},
        ${cat.is_warm_chapter}, ${cat.display_order_warm_chapter}, ${cat.cover_image_url}
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        badge = EXCLUDED.badge,
        tag = EXCLUDED.tag,
        sort_order = EXCLUDED.sort_order,
        is_active = true,
        is_featured_in_focus = EXCLUDED.is_featured_in_focus,
        display_order_in_focus = EXCLUDED.display_order_in_focus,
        is_warm_chapter = EXCLUDED.is_warm_chapter,
        display_order_warm_chapter = EXCLUDED.display_order_warm_chapter,
        cover_image_url = EXCLUDED.cover_image_url
    `;
  }

  // Fetch parent categories for subcategories mapping
  const parentRows = await sql`SELECT id, slug FROM categories WHERE parent_id IS NULL`;
  const parentMap = new Map(parentRows.map((r: any) => [r.slug, r.id]));

  const subcategories = [
    { name: 'Acid Wash Tees', slug: 'acid-wash-tees', parent_slug: 'oversize-tees', description: 'Heavyweight vintage acid wash collection', sort_order: 1 },
    { name: 'Graphic Tees', slug: 'graphic-tees', parent_slug: 'oversize-tees', description: 'Bold typography and modern streetwear prints', sort_order: 2 },
    { name: 'Hoodies', slug: 'hoodies', parent_slug: 'oversize-tees', description: 'Premium 380 GSM fleece hoodies', sort_order: 3 },
    { name: 'Wide Leg Trousers', slug: 'wide-leg', parent_slug: 'graphic-trousers', description: 'Relaxed flared cut with deep pockets', sort_order: 1 },
    { name: 'Cargo Pants', slug: 'cargo-style', parent_slug: 'graphic-trousers', description: 'Multi-pocket tactical street utility pants', sort_order: 2 },
  ];

  for (const sub of subcategories) {
    const parentId = parentMap.get(sub.parent_slug);
    if (parentId) {
      await sql`
        INSERT INTO categories (name, slug, parent_id, description, sort_order, is_active)
        VALUES (${sub.name}, ${sub.slug}, ${parentId}, ${sub.description}, ${sub.sort_order}, true)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          parent_id = EXCLUDED.parent_id,
          description = EXCLUDED.description,
          sort_order = EXCLUDED.sort_order,
          is_active = true
      `;
    }
  }

  const allCategoryRows = await sql`SELECT id, slug FROM categories`;
  const catSlugToId = new Map(allCategoryRows.map((r: any) => [r.slug, r.id]));
  console.log(`✅ Categories seeded (${allCategoryRows.length} total)\n`);

  // ==================== 2. PRODUCTS ====================
  console.log('👕 Seeding products...');

  const productList = [
    // Co-Ord Sets
    {
      name: 'Shadow Realm Co-Ord Set',
      slug: 'shadow-realm-co-ord-set',
      description: 'Premium heavyweight cotton co-ord set featuring high-density Shadow Realm graphics. Engineered for maximum street presence.',
      base_price: 4990,
      compare_at_price: 5990,
      category_slug: 'co-ord-sets',
      fabric: '100% French Terry Cotton',
      fabric_composition: '100% Combed Cotton',
      fabric_finish: 'Carbon Peach Finish',
      fit: 'Oversized Boxy Fit',
      graphic_print: 'High-Density Screen Print',
      garment_specs: '300 GSM Heavyweight Terry',
      garment_care: 'Hand wash or gentle machine wash inside out. Do not tumble dry.',
      shipping_delivery: 'Dispatched within 24 hours. Delivery in 2-4 business days across Pakistan.',
      model_size: 'Model is 6\'1" wearing size Large',
      sku: 'RVZ-CORD-001',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      badge: 'BESTSELLER',
      images: [
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Jet Black', 'Washed Grey'] },
    },
    {
      name: 'Midnight Vortex Co-Ord',
      slug: 'midnight-vortex-co-ord',
      description: 'Signature monochrome set with subtle tonal embroidery and reflective piping accents.',
      base_price: 5290,
      compare_at_price: 6490,
      category_slug: 'co-ord-sets',
      fabric: 'Heavyweight Cotton Blend',
      fabric_composition: '85% Cotton, 15% Polyester',
      fabric_finish: 'Matte Silicon Softener',
      fit: 'Relaxed Drop Shoulder',
      graphic_print: 'Puff Ink Print & Embroidery',
      garment_specs: '280 GSM Fleece Backed',
      garment_care: 'Machine wash cold with like colors.',
      shipping_delivery: 'Free delivery nationwide on orders above Rs. 3,000.',
      model_size: 'Model is 5\'11" wearing size Medium',
      sku: 'RVZ-CORD-002',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: false,
      badge: 'NEW',
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Charcoal', 'Bone White'] },
    },
    {
      name: 'Reaper X Graphic Co-Ord',
      slug: 'reaper-x-graphic-co-ord',
      description: 'Edgy streetwear statement piece with full front and back gothic iconography.',
      base_price: 4790,
      compare_at_price: 5490,
      category_slug: 'co-ord-sets',
      fabric: '100% Terry Cotton',
      fabric_composition: '100% Cotton',
      fabric_finish: 'Vintage Mineral Wash',
      fit: 'Oversized',
      graphic_print: 'Vintage Cracked Screen Print',
      garment_specs: '290 GSM',
      garment_care: 'Wash cold inside out. Iron on reverse only.',
      shipping_delivery: 'Cash on Delivery available nationwide.',
      model_size: 'Model is 6\'0" wearing size L',
      sku: 'RVZ-CORD-003',
      is_new_arrival: false,
      is_best_seller: false,
      is_featured: true,
      badge: 'FEATURED',
      images: [
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Ashen Black', 'Olive Drab'] },
    },

    // Oversize Tees
    {
      name: 'Acid Wash Phantom Tee',
      slug: 'acid-wash-phantom-tee',
      description: 'Individual hand-dipped mineral wash creates a one-of-a-kind vintage texture. Thick collar ribbing and drop shoulders.',
      base_price: 2490,
      compare_at_price: 2990,
      category_slug: 'oversize-tees',
      fabric: '100% Single Jersey Cotton',
      fabric_composition: '100% Carded Combed Cotton',
      fabric_finish: 'Enzyme Mineral Wash',
      fit: 'Oversized Drop Shoulder',
      graphic_print: 'Distressed Plastisol',
      garment_specs: '240 GSM Heavy Cotton',
      garment_care: 'Cold machine wash. Do not bleach.',
      shipping_delivery: 'Standard shipping 2-3 days.',
      model_size: 'Model wears Large',
      sku: 'RVZ-TEE-001',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      badge: 'BESTSELLER',
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Vintage Charcoal', 'Washed Olive'] },
    },
    {
      name: 'Neon Cyber Oversize Tee',
      slug: 'neon-cyber-oversize-tee',
      description: 'Futuristic cyberpunk typography rendered in reflective Japanese ink.',
      base_price: 2390,
      compare_at_price: 2790,
      category_slug: 'oversize-tees',
      fabric: '100% Cotton',
      fabric_composition: '100% Cotton',
      fabric_finish: 'Silicone Wash',
      fit: 'Boxy Fit',
      graphic_print: 'Reflective Screen Print',
      garment_specs: '230 GSM',
      garment_care: 'Gentle machine wash inside out.',
      shipping_delivery: 'Fast nationwide shipping.',
      model_size: 'Model wears Medium',
      sku: 'RVZ-TEE-002',
      is_new_arrival: true,
      is_best_seller: false,
      is_featured: true,
      badge: 'NEW',
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Pitch Black', 'Cyber Grey'] },
    },
    {
      name: 'Retro Skull Graphic Tee',
      slug: 'retro-skull-graphic-tee',
      description: 'Bold illustrated skull graphic inspired by 90s underground skate culture.',
      base_price: 2290,
      compare_at_price: null,
      category_slug: 'oversize-tees',
      fabric: '100% Cotton',
      fabric_composition: '100% Ring Spun Cotton',
      fabric_finish: 'Biowash',
      fit: 'Relaxed Fit',
      graphic_print: 'Soft Discharge Print',
      garment_specs: '220 GSM',
      garment_care: 'Machine wash cold.',
      shipping_delivery: 'Delivered in 2-4 days.',
      model_size: 'Model wears Large',
      sku: 'RVZ-TEE-003',
      is_new_arrival: false,
      is_best_seller: true,
      is_featured: false,
      badge: 'POPULAR',
      images: [
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Washed Black', 'Sand Khaki'] },
    },

    // Graphic Trousers
    {
      name: 'Wide Leg Graphic Trouser',
      slug: 'wide-leg-graphic-trouser',
      description: 'Wide flowing silhouette with articulated side panelling and discreet tonal graphic print.',
      base_price: 3490,
      compare_at_price: 4190,
      category_slug: 'graphic-trousers',
      fabric: 'Cotton Twill Blend',
      fabric_composition: '98% Cotton, 2% Elastane',
      fabric_finish: 'Garment Dyed',
      fit: 'Relaxed Wide Leg',
      graphic_print: 'Side Seam Screen Print',
      garment_specs: 'Heavy Cotton Twill 320 GSM',
      garment_care: 'Wash cold inside out. Hang dry.',
      shipping_delivery: 'Express delivery nationwide.',
      model_size: 'Model is 6\'1" wearing 32 waist',
      sku: 'RVZ-TR-001',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      badge: 'NEW DROP',
      images: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Smoky Charcoal', 'Dark Khaki'] },
    },
    {
      name: 'Tactical Cargo Graphic Trouser',
      slug: 'tactical-cargo-graphic-trouser',
      description: 'Engineered with 6 reinforced utility pockets and adjustable ankle bungee cords.',
      base_price: 3890,
      compare_at_price: 4490,
      category_slug: 'graphic-trousers',
      fabric: 'Ripstop Heavy Cotton',
      fabric_composition: '100% Cotton Ripstop',
      fabric_finish: 'Water-resistant treatment',
      fit: 'Straight Relaxed',
      graphic_print: 'Heat Transfer Utility Branding',
      garment_specs: '300 GSM',
      garment_care: 'Gentle wash. Do not iron prints.',
      shipping_delivery: 'Delivered in 3-5 days.',
      model_size: 'Model wears Large',
      sku: 'RVZ-TR-002',
      is_new_arrival: true,
      is_best_seller: false,
      is_featured: true,
      badge: 'NEW',
      images: [
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Army Green', 'Stealth Black'] },
    },

    // Trackpants
    {
      name: 'Urban Drift Heavy Trackpants',
      slug: 'urban-drift-trackpants',
      description: 'Ultra-dense 340 GSM cotton fleece trackpants with concealed zip pockets and heavy drawstrings.',
      base_price: 2990,
      compare_at_price: 3490,
      category_slug: 'trackpants',
      fabric: '100% Fleece Cotton',
      fabric_composition: '100% Cotton Fleece',
      fabric_finish: 'Brushed Interior',
      fit: 'Tapered Straight',
      graphic_print: 'Minimalist Monogram',
      garment_specs: '340 GSM',
      garment_care: 'Machine wash cold.',
      shipping_delivery: 'Dispatched same day if ordered before 3 PM.',
      model_size: 'Model wears Medium',
      sku: 'RVZ-TP-001',
      is_new_arrival: false,
      is_best_seller: true,
      is_featured: true,
      badge: 'POPULAR',
      images: [
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Heather Grey', 'Obsidian Black'] },
    },

    // Graphic Shorts
    {
      name: 'Raw Hem Terry Graphic Shorts',
      slug: 'raw-hem-graphic-shorts',
      description: 'Unfinished raw hem styling with deep side pockets and contrast interior drawstrings.',
      base_price: 1990,
      compare_at_price: 2490,
      category_slug: 'graphic-shorts',
      fabric: 'French Terry Cotton',
      fabric_composition: '100% Cotton',
      fabric_finish: 'Silicone Soft Wash',
      fit: 'Above the Knee Relaxed',
      graphic_print: 'Screen Printed Typography',
      garment_specs: '280 GSM',
      garment_care: 'Cold wash.',
      shipping_delivery: 'Standard Pakistan shipping.',
      model_size: 'Model wears Medium',
      sku: 'RVZ-SH-001',
      is_new_arrival: true,
      is_best_seller: false,
      is_featured: false,
      badge: 'NEW',
      images: [
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Washed Black', 'Oatmeal Heather'] },
    },

    // Shirts & Jackets
    {
      name: 'Overdyed Canvas Utility Jacket',
      slug: 'canvas-utility-jacket',
      description: 'Heavyweight duck canvas utility jacket featuring heavy brass hardware and reinforced elbow patches.',
      base_price: 6490,
      compare_at_price: 7990,
      category_slug: 'shirts-jackets',
      fabric: '100% Heavy Cotton Duck Canvas',
      fabric_composition: '100% Duck Canvas',
      fabric_finish: 'Stone Enzyme Wash',
      fit: 'Boxy Outerwear Fit',
      graphic_print: 'Leather Back Patch with Stamped Logo',
      garment_specs: '400 GSM',
      garment_care: 'Dry clean recommended or cold hand wash.',
      shipping_delivery: 'Free express shipping across Pakistan.',
      model_size: 'Model is 6\'2" wearing Large',
      sku: 'RVZ-JK-001',
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      badge: 'PREMIUM',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Washed Tobacco', 'Black Indigo'] },
    },
    {
      name: 'Vintage Flannel Overshirt',
      slug: 'vintage-flannel-overshirt',
      description: 'Thick custom-woven yarn-dyed flannel with double chest flap pockets.',
      base_price: 3990,
      compare_at_price: 4690,
      category_slug: 'shirts-jackets',
      fabric: '100% Brushed Cotton Flannel',
      fabric_composition: '100% Cotton',
      fabric_finish: 'Double Brushed',
      fit: 'Relaxed Layering Fit',
      graphic_print: 'None - Yarn Dyed Plaid',
      garment_specs: '310 GSM',
      garment_care: 'Machine wash cold.',
      shipping_delivery: 'Delivery in 2-4 business days.',
      model_size: 'Model wears Large',
      sku: 'RVZ-SH-002',
      is_new_arrival: false,
      is_best_seller: true,
      is_featured: true,
      badge: 'POPULAR',
      images: [
        'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&h=1000&fit=crop',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
      ],
      attributes: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Shadow Plaid', 'Crimson Charcoal'] },
    },
  ];

  for (const product of productList) {
    const categoryId = catSlugToId.get(product.category_slug);

    await sql`
      INSERT INTO products (
        name, slug, description, base_price, compare_at_price, category_id,
        fabric, fabric_composition, fabric_finish, fit, graphic_print,
        garment_specs, garment_care, shipping_delivery, model_size,
        sku, is_new_arrival, is_best_seller, is_featured,
        badge, images, image_url, attributes, status, is_active
      ) VALUES (
        ${product.name}, ${product.slug}, ${product.description}, ${product.base_price},
        ${product.compare_at_price}, ${categoryId}, ${product.fabric}, ${product.fabric_composition},
        ${product.fabric_finish}, ${product.fit}, ${product.graphic_print},
        ${product.garment_specs}, ${product.garment_care}, ${product.shipping_delivery},
        ${product.model_size}, ${product.sku}, ${product.is_new_arrival}, ${product.is_best_seller},
        ${product.is_featured}, ${product.badge},
        ${JSON.stringify(product.images)}, ${product.images[0]},
        ${JSON.stringify(product.attributes)}, 'active', true
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        base_price = EXCLUDED.base_price,
        compare_at_price = EXCLUDED.compare_at_price,
        category_id = EXCLUDED.category_id,
        fabric = EXCLUDED.fabric,
        fabric_composition = EXCLUDED.fabric_composition,
        fabric_finish = EXCLUDED.fabric_finish,
        fit = EXCLUDED.fit,
        graphic_print = EXCLUDED.graphic_print,
        garment_specs = EXCLUDED.garment_specs,
        garment_care = EXCLUDED.garment_care,
        shipping_delivery = EXCLUDED.shipping_delivery,
        model_size = EXCLUDED.model_size,
        sku = EXCLUDED.sku,
        is_new_arrival = EXCLUDED.is_new_arrival,
        is_best_seller = EXCLUDED.is_best_seller,
        is_featured = EXCLUDED.is_featured,
        badge = EXCLUDED.badge,
        images = EXCLUDED.images,
        image_url = EXCLUDED.image_url,
        attributes = EXCLUDED.attributes,
        status = 'active',
        is_active = true
    `;
  }

  const allProductRows = await sql`SELECT id, slug, name, base_price, sku FROM products`;
  console.log(`✅ Products seeded (${allProductRows.length} total)\n`);

  // ==================== 3. COLLECTIONS ====================
  console.log('📚 Seeding collections...');

  const collectionItems = [
    {
      name: 'Winter Essentials',
      slug: 'winter-essentials',
      type: 'warm_chapter',
      description: 'Heavyweight fleeces, thermal layerings, and dark tonal winter streetwear.',
      image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop',
      display_order: 1,
    },
    {
      name: 'Streetwear Classics',
      slug: 'streetwear-classics',
      type: 'collection_focus',
      description: 'Timeless oversized tees and heavy wide trousers that define underground culture.',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop',
      display_order: 2,
    },
    {
      name: 'New Drops 2024',
      slug: 'new-drops',
      type: 'category',
      description: 'Fresh silhouettes and limited release streetwear apparel.',
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop',
      display_order: 3,
    },
  ];

  for (const col of collectionItems) {
    await sql`
      INSERT INTO collections (name, slug, type, description, image_url, display_order, is_active)
      VALUES (${col.name}, ${col.slug}, ${col.type}, ${col.description}, ${col.image_url}, ${col.display_order}, true)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        display_order = EXCLUDED.display_order,
        is_active = true
    `;
  }
  console.log(`✅ Collections seeded\n`);

  // ==================== 4. USERS ====================
  console.log('👤 Seeding users (Admin & Customers)...');

  // Admin user
  await sql`
    INSERT INTO users (email, name, role, is_verified, is_active, password)
    VALUES ('admin@ravenza.pk', 'Ravenza Admin', 'admin', true, true, 'admin123')
    ON CONFLICT (email) DO UPDATE SET
      name = 'Ravenza Admin',
      role = 'admin',
      is_verified = true,
      is_active = true,
      password = 'admin123'
  `;

  // Sample customers
  const sampleCustomers = [
    { email: 'customer@ravenza.pk', name: 'Demo Customer', phone: '+923001234567', password: 'customer123' },
    { email: 'ahmed.khan@gmail.com', name: 'Ahmed Khan', phone: '+923019876543', password: 'password123' },
    { email: 'sara.ali@gmail.com', name: 'Sara Ali', phone: '+923335551234', password: 'password123' },
  ];

  for (const c of sampleCustomers) {
    await sql`
      INSERT INTO users (email, name, phone, role, is_verified, is_active, password)
      VALUES (${c.email}, ${c.name}, ${c.phone}, 'customer', true, true, ${c.password})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = 'customer',
        is_active = true
    `;
  }

  const customerRows = await sql`SELECT id, email, name FROM users WHERE role = 'customer'`;
  console.log(`✅ Users seeded (Admin: admin@ravenza.pk, Customers: ${customerRows.length})\n`);

  // ==================== 5. ORDERS & ORDER ITEMS ====================
  console.log('📦 Seeding sample orders...');

  if (customerRows.length > 0 && allProductRows.length > 0) {
    const demoUser = customerRows[0];
    const demoProduct1 = allProductRows[0];
    const demoProduct2 = allProductRows[1] || allProductRows[0];

    const sampleOrders = [
      {
        order_number: 'RVZ-901245',
        user_id: demoUser.id,
        status: 'delivered',
        payment_status: 'paid',
        payment_method: 'cod',
        subtotal: 7480,
        shipping_cost: 0,
        total: 7480,
        discount_amount: 0,
        discount_code: null,
        shipping_address: {
          firstName: 'Demo',
          lastName: 'Customer',
          phone: '+923001234567',
          address: 'House 42, Street 7, Phase 5 DHA',
          city: 'Lahore',
          postalCode: '54700',
        },
        order_notes: 'Please call upon arrival at gate.',
        tracking_number: 'TRAK-901245-PK',
        items: [
          {
            product_id: demoProduct1.id,
            product_name: demoProduct1.name,
            quantity: 1,
            unit_price: Number(demoProduct1.base_price),
            size: 'L',
            color: 'Black',
          },
          {
            product_id: demoProduct2.id,
            product_name: demoProduct2.name,
            quantity: 1,
            unit_price: Number(demoProduct2.base_price),
            size: 'M',
            color: 'Charcoal',
          },
        ],
      },
      {
        order_number: 'RVZ-901246',
        user_id: demoUser.id,
        status: 'processing',
        payment_status: 'unpaid',
        payment_method: 'cod',
        subtotal: 4990,
        shipping_cost: 200,
        total: 5190,
        discount_amount: 0,
        discount_code: null,
        shipping_address: {
          firstName: 'Demo',
          lastName: 'Customer',
          phone: '+923001234567',
          address: 'Office 301, Mall 1, Gulberg',
          city: 'Lahore',
          postalCode: '54000',
        },
        order_notes: 'Deliver during office hours 9am to 6pm',
        tracking_number: 'TRAK-901246-PK',
        items: [
          {
            product_id: demoProduct1.id,
            product_name: demoProduct1.name,
            quantity: 1,
            unit_price: Number(demoProduct1.base_price),
            size: 'XL',
            color: 'Black',
          },
        ],
      },
    ];

    for (const order of sampleOrders) {
      const orderRes = await sql`
        INSERT INTO orders (
          order_number, user_id, status, payment_status, payment_method,
          subtotal, shipping_cost, total, discount_amount, discount_code,
          shipping_address, order_notes, items, tracking_number
        ) VALUES (
          ${order.order_number}, ${order.user_id}, ${order.status}, ${order.payment_status},
          ${order.payment_method}, ${order.subtotal}, ${order.shipping_cost}, ${order.total},
          ${order.discount_amount}, ${order.discount_code}, ${JSON.stringify(order.shipping_address)},
          ${order.order_notes}, ${JSON.stringify(order.items)}, ${order.tracking_number}
        )
        ON CONFLICT (order_number) DO UPDATE SET
          status = EXCLUDED.status,
          payment_status = EXCLUDED.payment_status
        RETURNING id
      `;

      if (orderRes && orderRes.length > 0) {
        const orderId = orderRes[0].id;
        for (const item of order.items) {
          await sql`
            INSERT INTO order_items (
              order_id, product_id, product_name, quantity, unit_price, total_price, size, color
            ) VALUES (
              ${orderId}, ${item.product_id}, ${item.product_name}, ${item.quantity},
              ${item.unit_price}, ${item.quantity * item.unit_price}, ${item.size}, ${item.color}
            )
          `;
        }
      }
    }
    console.log(`✅ Sample orders created\n`);
  }

  // ==================== 6. COUPON CODES & DISCOUNTS ====================
  console.log('🎟️ Seeding discount coupons...');

  const coupons = [
    { code: 'WELCOME10', type: 'percentage', value: 10, min_order: 2000, max_discount: 1000 },
    { code: 'FLAT500', type: 'fixed', value: 500, min_order: 3000, max_discount: 500 },
    { code: 'RAVENZA20', type: 'percentage', value: 20, min_order: 5000, max_discount: 2000 },
  ];

  for (const c of coupons) {
    // Insert into coupon_codes
    await sql`
      INSERT INTO coupon_codes (
        code, discount_type, discount_value, min_order_amount, max_discount, is_active
      ) VALUES (
        ${c.code}, ${c.type}, ${c.value}, ${c.min_order}, ${c.max_discount}, true
      )
      ON CONFLICT (code) DO NOTHING
    `;

    // Also insert into discounts table
    await sql`
      INSERT INTO discounts (
        code, type, value, min_purchase, is_active, rules
      ) VALUES (
        ${c.code}, ${c.type}, ${c.value}, ${c.min_order}, true, ${JSON.stringify({ apply_to: 'all' })}
      )
      ON CONFLICT (code) DO NOTHING
    `;
  }
  console.log(`✅ Discounts seeded\n`);

  // ==================== 7. JOURNAL ENTRIES ====================
  console.log('📰 Seeding journal entries...');

  const journals = [
    {
      title: 'The Modern Streetwear Movement in Pakistan',
      subtitle: 'How heavyweight fabrics and bespoke cuts are reshaping urban identity',
      content: 'At Ravenza, we believe streetwear is more than just graphics on clothing. It is an exploration of cultural duality, functional luxury, and unapologetic self-expression.',
      featured_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop',
      category: 'Brand Story',
      author: 'Ravenza Editorial',
      display_order: 1,
    },
    {
      title: 'Behind the Shadow Realm Collection',
      subtitle: 'From Tokyo underground aesthetics to high-density screen printing',
      content: 'Each garment in the Shadow Realm edition underwent four stages of carbon washing and hand-curated screen placement.',
      featured_image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&h=800&fit=crop',
      category: 'Design & Craft',
      author: 'Lead Designer',
      display_order: 2,
    },
  ];

  for (const j of journals) {
    await sql`
      INSERT INTO journal_entries (
        title, subtitle, content, featured_image, category, author, is_active, display_order
      ) VALUES (
        ${j.title}, ${j.subtitle}, ${j.content}, ${j.featured_image}, ${j.category}, ${j.author}, true, ${j.display_order}
      )
    `;
  }
  console.log(`✅ Journal entries seeded\n`);

  // ==================== 8. FAQs ====================
  console.log('❓ Seeding FAQs...');

  const faqItems = [
    {
      question: 'What is Ravenza’s return & exchange policy?',
      answer: 'We offer an easy 7-day hassle-free exchange policy on all unworn items with original tags intact. Simply message our WhatsApp support team.',
      category: 'Orders & Shipping',
      display_order: 1,
    },
    {
      question: 'How long does nationwide delivery take?',
      answer: 'Orders in major cities (Lahore, Karachi, Islamabad) are typically delivered in 2 to 3 business days. Other regions take 3 to 5 business days.',
      category: 'Orders & Shipping',
      display_order: 2,
    },
    {
      question: 'Do you offer Cash on Delivery (COD)?',
      answer: 'Yes, Cash on Delivery is available across Pakistan on all orders without any extra convenience surcharge.',
      category: 'Payment',
      display_order: 3,
    },
    {
      question: 'How do I choose the right size for oversized fits?',
      answer: 'Our oversized products are purposefully cut with a boxy, dropped-shoulder silhouette. Choose your normal size for the intended oversized look, or size down if you prefer a regular fit.',
      category: 'Sizing & Care',
      display_order: 4,
    },
  ];

  for (const f of faqItems) {
    await sql`
      INSERT INTO faqs (question, answer, category, display_order, is_active)
      VALUES (${f.question}, ${f.answer}, ${f.category}, ${f.display_order}, true)
    `;
  }
  console.log(`✅ FAQs seeded\n`);

  // ==================== 9. REVIEWS ====================
  console.log('⭐ Seeding customer reviews...');

  if (customerRows.length > 0 && allProductRows.length > 0) {
    const demoUser = customerRows[0];
    const reviews = [
      { product_id: allProductRows[0].id, rating: 5, comment: 'Hands down the best co-ord set I own. Fabric is super heavy and comfortable!' },
      { product_id: allProductRows[1]?.id || allProductRows[0].id, rating: 5, comment: 'The acid wash finish is top notch. Fits exactly like the model photos.' },
      { product_id: allProductRows[2]?.id || allProductRows[0].id, rating: 5, comment: 'Extremely quick delivery to Karachi and premium packaging!' },
    ];

    for (const r of reviews) {
      await sql`
        INSERT INTO reviews (user_id, product_id, rating, comment, is_approved)
        VALUES (${demoUser.id}, ${r.product_id}, ${r.rating}, ${r.comment}, true)
      `;
    }
    console.log(`✅ Customer reviews seeded\n`);
  }

  console.log('==============================================');
  console.log('🎉 NEON DATABASE SEEDED SUCCESSFULLY!');
  console.log('==============================================');
  console.log('Credentials:');
  console.log('  • Admin:    admin@ravenza.pk    / admin123');
  console.log('  • Customer: customer@ravenza.pk / customer123\n');
}

seed().catch((err) => {
  console.error('❌ Error during seed:', err);
  process.exit(1);
});
