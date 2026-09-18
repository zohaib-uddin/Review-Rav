import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🧪 Testing NeonDB Connection...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    console.log('\n📝 Please make sure your .env file has:');
    console.log('DATABASE_URL="your-neondb-connection-string"');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL found');
  console.log(`📡 Connecting to: ${process.env.DATABASE_URL.substring(0, 50)}...\n`);

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Test 1: Basic connection
    console.log('🔍 Test 1: Basic database connection...');
    const time = await sql`SELECT NOW() as current_time`;
    console.log(`✅ Database connected! Current time: ${time[0].current_time}\n`);

    // Test 2: Check if tables exist
    console.log('🔍 Test 2: Checking if tables exist...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in database!');
      console.log('📝 Please run: npx drizzle-kit push');
      process.exit(1);
    }
    
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    console.log();

    // Test 3: Check products
    console.log('🔍 Test 3: Checking products...');
    const products = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`✅ Found ${products[0].count} products in database\n`);

    // Test 4: Check categories
    console.log('🔍 Test 4: Checking categories...');
    const categories = await sql`SELECT COUNT(*) as count FROM categories`;
    console.log(`✅ Found ${categories[0].count} categories in database\n`);

    // Test 5: Fetch sample products
    console.log('🔍 Test 5: Fetching sample products...');
    const sampleProducts = await sql`
      SELECT id, name, base_price, is_active 
      FROM products 
      WHERE is_active = true 
      LIMIT 3
    `;
    
    if (sampleProducts.length > 0) {
      console.log('✅ Sample products:');
      sampleProducts.forEach((p: any) => {
        console.log(`   - ${p.name} (Rs.${p.base_price})`);
      });
    } else {
      console.log('⚠️  No active products found!');
      console.log('📝 Please run: npx tsx scripts/seed.ts');
    }
    console.log();

    console.log('═══════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('\n🚀 Your database is ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start backend server: cd server && npm run dev');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Open browser: http://localhost:5173');
    console.log('\n🔐 Admin login:');
    console.log('   Email: admin@ravenza.pk');
    console.log('   Password: admin123\n');

  } catch (error: any) {
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check if DATABASE_URL in .env is correct');
    console.error('   2. Check if NeonDB project is active');
    console.error('   3. Check your internet connection');
    console.error('   4. Run: npx drizzle-kit push (to create tables)');
    process.exit(1);
  }
}

testConnection();
