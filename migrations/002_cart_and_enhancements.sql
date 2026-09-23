-- ============================================================================
-- RAVENZA DATABASE MIGRATIONS - CART, OTP, WISHLISTS, ADDRESSES, USERS & ORDERS
-- ============================================================================

-- 1. Ensure uuid-ossp or pgcrypto extension is enabled for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE (if not exists or update missing columns)
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "phone" varchar(20),
  "password" varchar(255),
  "role" varchar(20) DEFAULT 'customer' NOT NULL,
  "is_verified" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_login" timestamp with time zone
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");

-- 3. OTP VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS "otp_verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255),
  "phone" varchar(20),
  "otp" varchar(20),
  "otp_code" varchar(6),
  "expires_at" timestamp with time zone NOT NULL,
  "verified" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "otp_verifications_email_idx" ON "otp_verifications" ("email");
CREATE INDEX IF NOT EXISTS "otp_verifications_phone_idx" ON "otp_verifications" ("phone");

-- 4. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS "wishlists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_pkey" ON "wishlists" ("id");
CREATE INDEX IF NOT EXISTS "wishlists_user_idx" ON "wishlists" ("user_id");
CREATE INDEX IF NOT EXISTS "wishlists_product_idx" ON "wishlists" ("product_id");
CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_unique_idx" ON "wishlists" ("user_id", "product_id");

-- Foreign keys for wishlists (wrapped in DO block to prevent error if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_user_id_users_id_fk') THEN
    ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_product_id_products_id_fk') THEN
    ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- 5. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS "addresses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "type" varchar(20) NOT NULL DEFAULT 'shipping',
  "address_line_1" varchar(255) NOT NULL,
  "address_line_2" varchar(255),
  "city" varchar(100) NOT NULL,
  "region" varchar(100) NOT NULL,
  "postal_code" varchar(20),
  "country" varchar(100) DEFAULT 'Pakistan' NOT NULL,
  "phone" varchar(20) NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "addresses_user_idx" ON "addresses" ("user_id");
CREATE INDEX IF NOT EXISTS "addresses_default_idx" ON "addresses" ("is_default");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'addresses_user_id_users_id_fk') THEN
    ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- 6. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "session_id" varchar(255),
  "product_id" uuid NOT NULL,
  "variant_id" uuid,
  "size" varchar(20) NOT NULL,
  "color" varchar(50) NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "cart_items_user_idx" ON "cart_items" ("user_id");
CREATE INDEX IF NOT EXISTS "cart_items_session_idx" ON "cart_items" ("session_id");
CREATE INDEX IF NOT EXISTS "cart_items_product_idx" ON "cart_items" ("product_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_user_id_users_id_fk') THEN
    ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_product_id_products_id_fk') THEN
    ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- 7. ORDERS & ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_number" varchar(20) NOT NULL UNIQUE,
  "user_id" uuid,
  "status" varchar(30) DEFAULT 'pending' NOT NULL,
  "payment_status" varchar(30) DEFAULT 'unpaid' NOT NULL,
  "payment_method" varchar(30) DEFAULT 'cod' NOT NULL,
  "subtotal" numeric(10,2) NOT NULL,
  "shipping_cost" numeric(10,2) DEFAULT '0' NOT NULL,
  "total" numeric(10,2) NOT NULL,
  "discount_amount" numeric(10,2) DEFAULT '0' NOT NULL,
  "discount_code" varchar(50),
  "shipping_address" jsonb NOT NULL,
  "billing_address" jsonb,
  "order_notes" text,
  "shipping_method" jsonb,
  "items" jsonb NOT NULL,
  "tracking_number" varchar(100),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "orders_order_number_idx" ON "orders" ("order_number");
CREATE INDEX IF NOT EXISTS "orders_user_idx" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "orders_payment_status_idx" ON "orders" ("payment_status");

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "product_name" varchar(200),
  "variant_id" uuid,
  "quantity" integer NOT NULL,
  "unit_price" numeric(10,2) NOT NULL,
  "total_price" numeric(10,2),
  "sku" varchar(50),
  "size" varchar(20),
  "color" varchar(50),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "order_items_order_idx" ON "order_items" ("order_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_orders_id_fk') THEN
    ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
  END IF;
END $$;
