import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

(async () => {
  try {
    await sql`
      INSERT INTO products (id, name, slug, base_price, status, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Test Product', 'test-product', 1999, 'active', true, now(), now())
      ON CONFLICT DO NOTHING;
    `;
    console.log('✅ Test product inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();