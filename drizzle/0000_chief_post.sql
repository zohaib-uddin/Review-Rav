CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"action" varchar(50) NOT NULL,
	"performed_by" varchar(100),
	"changes" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar(50),
	"user_agent" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"parent_id" uuid,
	"description" text,
	"badge" varchar(50),
	"cover_image_url" varchar(500),
	"banner_image" varchar(500),
	"tag" varchar(100),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured_in_focus" boolean DEFAULT false NOT NULL,
	"display_order_in_focus" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collection_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"product_ids" jsonb DEFAULT '[]'::jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupon_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(20) DEFAULT 'percentage' NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"min_purchase" numeric(10, 2),
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"rules" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" varchar(255),
	"content" text NOT NULL,
	"featured_image" varchar(500),
	"category" varchar(100),
	"author" varchar(100),
	"published_date" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(200),
	"variant_id" uuid,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2),
	"sku" varchar(50),
	"size" varchar(20),
	"color" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(20) NOT NULL,
	"user_id" uuid,
	"status" varchar(30) DEFAULT 'pending_verification' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"notes" text,
	"discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_code" varchar(50),
	"tracking_number" varchar(100),
	"email_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"timeline" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"otp" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"main_category_id" uuid,
	"sub_category_id" uuid,
	"brand" varchar(100) DEFAULT 'RAVENZA',
	"sku" varchar(100),
	"cost_price" numeric(10, 2),
	"track_inventory" boolean DEFAULT true,
	"low_stock_threshold" integer DEFAULT 4,
	"is_new_arrival" boolean DEFAULT false NOT NULL,
	"is_best_seller" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_spotlight" boolean DEFAULT false,
	"is_draft" boolean DEFAULT false,
	"fabric" varchar(200),
	"fabric_composition" text,
	"fabric_finish" text,
	"fit" varchar(100),
	"graphic_print" text,
	"garment_specs" text,
	"garment_care" text,
	"shipping_delivery" text,
	"model_size" varchar(255),
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" text,
	"focus_keywords" text,
	"url_handle" varchar(255),
	"canonical_url" varchar(500),
	"robots_index" boolean DEFAULT true NOT NULL,
	"badge" varchar(50),
	"images" jsonb DEFAULT '[]'::jsonb,
	"image_url" varchar(1000),
	"cloudinary_image_id" varchar(255),
	"attributes" jsonb DEFAULT '{"sizes":["S","M","L","XL"],"colors":["Black"]}'::jsonb,
	"variants_matrix" jsonb DEFAULT '[]'::jsonb,
	"size_guide" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100),
	"phone" varchar(20),
	"role" varchar(20) DEFAULT 'customer' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"password" varchar(255),
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "warm_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"subtitle" varchar(255),
	"slug" varchar(255) NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"product_ids" jsonb DEFAULT '[]'::jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warm_chapters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "categories_sort_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "categories_featured_in_focus_idx" ON "categories" USING btree ("is_featured_in_focus");--> statement-breakpoint
CREATE INDEX "collection_products_collection_idx" ON "collection_products" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_products_product_idx" ON "collection_products" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_products_unique_idx" ON "collection_products" USING btree ("collection_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "collections_type_idx" ON "collections" USING btree ("type");--> statement-breakpoint
CREATE INDEX "collections_active_idx" ON "collections" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupon_codes_code_idx" ON "coupon_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupon_codes_active_idx" ON "coupon_codes" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "discounts_code_idx" ON "discounts" USING btree ("code");--> statement-breakpoint
CREATE INDEX "faqs_active_idx" ON "faqs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "faqs_order_idx" ON "faqs" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "journal_active_idx" ON "journal_entries" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "journal_order_idx" ON "journal_entries" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "otp_verifications_email_idx" ON "otp_verifications" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_main_category_idx" ON "products" USING btree ("main_category_id");--> statement-breakpoint
CREATE INDEX "products_sub_category_idx" ON "products" USING btree ("sub_category_id");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "products_new_arrival_idx" ON "products" USING btree ("is_new_arrival");--> statement-breakpoint
CREATE INDEX "products_best_seller_idx" ON "products" USING btree ("is_best_seller");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_approved_idx" ON "reviews" USING btree ("is_approved");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "warm_chapters_slug_idx" ON "warm_chapters" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "warm_chapters_active_idx" ON "warm_chapters" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "warm_chapters_order_idx" ON "warm_chapters" USING btree ("display_order");