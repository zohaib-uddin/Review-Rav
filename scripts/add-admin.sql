-- =============================================================================
-- RAVENZA - NEON DATABASE: INSERT / CONFIGURE ADMINISTRATOR RECORD
-- =============================================================================
-- Run this SQL query directly in your Neon Console (SQL Editor), Drizzle Studio,
-- or psql terminal to add an Admin user with role = 'admin'.
-- =============================================================================

-- 1. Insert new Admin user (or update existing user if email matches)
-- Replace the email, name, phone, and password values as desired.
INSERT INTO users (
  id,
  email,
  name,
  phone,
  role,
  is_verified,
  is_active,
  password,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@ravenza.pk',                     -- Replace with your Admin Email
  'Ravenza Administrator',               -- Replace with Admin Name
  '+923001234567',                       -- Phone number (optional)
  'admin',                               -- MUST BE 'admin' for full admin privileges
  true,                                  -- is_verified = true
  true,                                  -- is_active = true
  'admin123',                            -- Replace with your Admin Password (plain text or bcrypt hash)
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  role = 'admin',
  password = EXCLUDED.password,
  is_active = true,
  is_verified = true,
  updated_at = NOW();

-- 2. Verify that your admin user has been successfully created:
SELECT id, email, name, role, is_active, is_verified, created_at 
FROM users 
WHERE role = 'admin';
