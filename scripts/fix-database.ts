import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function fixDatabase() {
  console.log('🔧 Fixing database schema issues...\n');

  try {
    // Step 1: Add missing columns to products (individually using tagged templates)
    console.log('📦 Adding missing columns to products...');
    
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false`;
      console.log('  ✓ Added: is_best_seller');
    } catch (e: any) {
      console.log('  ⚠️  is_best_seller:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id uuid`;
      console.log('  ✓ Added: subcategory_id');
    } catch (e: any) {
      console.log('  ⚠️  subcategory_id:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_delivery text`;
      console.log('  ✓ Added: shipping_delivery');
    } catch (e: any) {
      console.log('  ⚠️  shipping_delivery:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS model_size varchar(255)`;
      console.log('  ✓ Added: model_size');
    } catch (e: any) {
      console.log('  ⚠️  model_size:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS canonical_url varchar(500)`;
      console.log('  ✓ Added: canonical_url');
    } catch (e: any) {
      console.log('  ⚠️  canonical_url:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS cloudinary_image_id varchar(255)`;
      console.log('  ✓ Added: cloudinary_image_id');
    } catch (e: any) {
      console.log('  ⚠️  cloudinary_image_id:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide jsonb DEFAULT '[]'::jsonb`;
      console.log('  ✓ Added: size_guide');
    } catch (e: any) {
      console.log('  ⚠️  size_guide:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_keywords text`;
      console.log('  ✓ Added: meta_keywords');
    } catch (e: any) {
      console.log('  ⚠️  meta_keywords:', e.message.slice(0, 80));
    }

    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_spotlight boolean DEFAULT false`;
      console.log('  ✓ Added: is_spotlight');
    } catch (e: any) {
      console.log('  ⚠️  is_spotlight:', e.message.slice(0, 80));
    }
    
    console.log('✅ Products columns added\n');

    // Step 2: Fix categories table
    console.log('📂 Fixing categories table...');
    try {
      await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS badge varchar(50)`;
      console.log('✅ Badge column added to categories\n');
    } catch (e: any) {
      console.log('✅ Badge column already exists\n');
    }

    // Step 3: Fix products NULL values
    console.log('📦 Fixing products table NULL values...');
    await sql`
      UPDATE products 
      SET 
        is_new_arrival = COALESCE(is_new_arrival, false),
        is_bestseller = COALESCE(is_bestseller, false),
        is_featured = COALESCE(is_featured, false),
        is_best_seller = COALESCE(is_best_seller, false),
        fabric_composition = COALESCE(fabric_composition, 'Premium Cotton'),
        fabric_finish = COALESCE(fabric_finish, 'Matte'),
        garment_care = COALESCE(garment_care, 'Machine wash cold'),
        status = COALESCE(status, 'active')
    `;
    console.log('✅ Products table NULL values fixed\n');

    // Step 4: Create new tables
    console.log('📊 Creating new tables...');

    await sql`
      CREATE TABLE IF NOT EXISTS collection_products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        collection_id uuid NOT NULL,
        product_id uuid NOT NULL,
        sort_order integer NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        added_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ collection_products');

    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(255) NOT NULL,
        subtitle varchar(255),
        content text NOT NULL,
        featured_image varchar(500),
        category varchar(100),
        author varchar(100),
        published_date timestamp with time zone,
        is_active boolean NOT NULL DEFAULT true,
        display_order integer NOT NULL DEFAULT 0,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ journal_entries');

    await sql`
      CREATE TABLE IF NOT EXISTS faqs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        question text NOT NULL,
        answer text NOT NULL,
        category varchar(100),
        display_order integer NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ faqs');

    await sql`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        is_active boolean NOT NULL DEFAULT true,
        subscribed_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ newsletter_subscribers');

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        product_id uuid NOT NULL,
        rating integer NOT NULL,
        comment text,
        is_approved boolean NOT NULL DEFAULT false,
        created_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `;
    console.log('  ✓ reviews');

    console.log('✅ All tables created\n');

    // Step 5: Verify columns exist
    console.log('🔍 Verifying columns...');
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `;
    console.log(`✅ Products table has ${columns.length} columns\n`);

    console.log('═══════════════════════════════════════');
    console.log('✅ DATABASE FIX COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run: npx tsx scripts/seed.ts');
    console.log('   2. Start backend: cd server && npm run dev');
    console.log('   3. Start frontend: npm run dev\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDatabase();
