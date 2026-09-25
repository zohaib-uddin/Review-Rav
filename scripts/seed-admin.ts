import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const email = process.argv[2] || 'admin@ravenza.pk';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Ravenza Administrator';

  console.log(`⏳ Inserting/updating admin account for: ${email}...`);

  try {
    const result = await sql`
      INSERT INTO users (
        id, email, name, role, is_verified, is_active, password, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), ${email.toLowerCase().trim()}, ${name}, 'admin', true, true, ${password}, NOW(), NOW()
      )
      ON CONFLICT (email)
      DO UPDATE SET
        role = 'admin',
        password = EXCLUDED.password,
        is_active = true,
        is_verified = true,
        updated_at = NOW()
      RETURNING id, email, name, role, is_active;
    `;

    console.log('✅ Admin user successfully provisioned:');
    console.table(result);
  } catch (err: any) {
    console.error('❌ Failed to insert admin user:', err.message);
  }
}

main();
