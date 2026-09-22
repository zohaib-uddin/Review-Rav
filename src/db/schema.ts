import { pgTable, uuid, varchar, text, boolean, integer, numeric, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== CATEGORIES ====================
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  parent_id: uuid('parent_id'),
  description: text('description'),
  badge: varchar('badge', { length: 50 }),
  cover_image_url: varchar('cover_image_url', { length: 500 }),
  tag: varchar('tag', { length: 100 }),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  // Collections in Focus fields
  is_featured_in_focus: boolean('is_featured_in_focus').notNull().default(false),
  display_order_in_focus: integer('display_order_in_focus').notNull().default(0),
  // Warm Chapters fields
  is_warm_chapter: boolean('is_warm_chapter').notNull().default(false),
  display_order_warm_chapter: integer('display_order_warm_chapter').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
  parentIdx: index('categories_parent_idx').on(table.parent_id),
  activeIdx: index('categories_active_idx').on(table.is_active),
  sortIdx: index('categories_sort_idx').on(table.sort_order),
  featuredInFocusIdx: index('categories_featured_in_focus_idx').on(table.is_featured_in_focus),
  displayOrderInFocusIdx: index('categories_display_order_in_focus_idx').on(table.display_order_in_focus),
  warmChapterIdx: index('categories_warm_chapter_idx').on(table.is_warm_chapter),
}));

// Categories relations - simplified to avoid self-reference issues
// Parent-child relationship handled via parent_id field directly

// ==================== PRODUCTS ====================
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  description: text('description'),
  base_price: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  compare_at_price: numeric('compare_at_price', { precision: 10, scale: 2 }),
  is_active: boolean('is_active').notNull().default(true),
  category_id: uuid('category_id'),
  subcategory_id: uuid('subcategory_id'),
  brand: varchar('brand', { length: 100 }).default('RAVENZA'),
  sku: varchar('sku', { length: 100 }),
  cost_price: numeric('cost_price', { precision: 10, scale: 2 }),
  track_inventory: boolean('track_inventory').default(true),
  low_stock_threshold: integer('low_stock_threshold').default(4),
  
  // Flags
  is_new_arrival: boolean('is_new_arrival').notNull().default(false),
  is_best_seller: boolean('is_best_seller').notNull().default(false),
  is_featured: boolean('is_featured').notNull().default(false),
  is_spotlight: boolean('is_spotlight').default(false),
  is_draft: boolean('is_draft').default(false),
  
  // Specifications
  fabric: varchar('fabric', { length: 200 }),
  fabric_composition: text('fabric_composition'),
  fabric_finish: text('fabric_finish'),
  fit: varchar('fit', { length: 100 }),
  graphic_print: text('graphic_print'),
  garment_specs: text('garment_specs'),
  garment_care: text('garment_care'),
  shipping_delivery: text('shipping_delivery'),
  model_size: varchar('model_size', { length: 255 }),
  
  // SEO
  meta_title: varchar('meta_title', { length: 255 }),
  meta_description: text('meta_description'),
  meta_keywords: text('meta_keywords'),
  focus_keywords: text('focus_keywords'),
  url_handle: varchar('url_handle', { length: 255 }),
  canonical_url: varchar('canonical_url', { length: 500 }),
  robots_index: boolean('robots_index').notNull().default(true),
  
  // Media
  badge: varchar('badge', { length: 50 }),
  images: jsonb('images').default([]),
  image_url: varchar('image_url', { length: 1000 }),
  cloudinary_image_id: varchar('cloudinary_image_id', { length: 255 }),
  
  // Variants & Attributes
  attributes: jsonb('attributes').default({ sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] }),
  variants_matrix: jsonb('variants_matrix').default([]),
  size_guide: jsonb('size_guide').$type<{ chart: any[]; unit: string } | null>(),
  care_instructions: jsonb('care_instructions').$type<{ icon: string; text: string }[] | null>(),
  faq: jsonb('faq').$type<{ question: string; answer: string }[] | null>(),
  specs: text('specs'), // Rich HTML from RTE for PDP
  
  // Status
  status: varchar('status', { length: 20 }).notNull().default('active'),
  
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
  categoryIdx: index('products_category_idx').on(table.category_id),
  subcategoryIdx: index('products_subcategory_idx').on(table.subcategory_id),
  activeIdx: index('products_active_idx').on(table.is_active),
  newArrivalIdx: index('products_new_arrival_idx').on(table.is_new_arrival),
  bestSellerIdx: index('products_best_seller_idx').on(table.is_best_seller),
  featuredIdx: index('products_featured_idx').on(table.is_featured),
  statusIdx: index('products_status_idx').on(table.status),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
    relationName: 'product_category',
  }),
  subcategory: one(categories, {
    fields: [products.subcategory_id],
    references: [categories.id],
    relationName: 'product_subcategory',
  }),
  reviews: many(reviews),
  orderItems: many(orderItems),
}));

// ==================== COLLECTIONS (Unified) ====================
export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // 'category', 'warm_chapter', 'collection_focus'
  description: text('description'),
  image_url: varchar('image_url', { length: 500 }),
  product_ids: jsonb('product_ids').default([]),
  display_order: integer('display_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('collections_slug_idx').on(table.slug),
  typeIdx: index('collections_type_idx').on(table.type),
  activeIdx: index('collections_active_idx').on(table.is_active),
}));

// Collections now use product_ids array instead of many-to-many relation

// ==================== COLLECTION PRODUCTS (Legacy - kept for backward compatibility) ====================
export const collectionProducts = pgTable('collection_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  collection_id: uuid('collection_id').notNull(),
  product_id: uuid('product_id').notNull(),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  added_at: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  collectionIdx: index('collection_products_collection_idx').on(table.collection_id),
  productIdx: index('collection_products_product_idx').on(table.product_id),
  uniqueIdx: uniqueIndex('collection_products_unique_idx').on(table.collection_id, table.product_id),
}));

export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionProducts.collection_id],
    references: [collections.id],
  }),
  product: one(products, {
    fields: [collectionProducts.product_id],
    references: [products.id],
  }),
}));

// ==================== JOURNAL ENTRIES ====================
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }),
  content: text('content').notNull(),
  featured_image: varchar('featured_image', { length: 500 }),
  category: varchar('category', { length: 100 }),
  author: varchar('author', { length: 100 }),
  published_date: timestamp('published_date', { withTimezone: true }),
  is_active: boolean('is_active').notNull().default(true),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  activeIdx: index('journal_active_idx').on(table.is_active),
  orderIdx: index('journal_order_idx').on(table.display_order),
}));

// ==================== FAQs ====================
export const faqs = pgTable('faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }),
  display_order: integer('display_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  activeIdx: index('faqs_active_idx').on(table.is_active),
  orderIdx: index('faqs_order_idx').on(table.display_order),
}));

// ==================== REVIEWS ====================
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  product_id: uuid('product_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  is_approved: boolean('is_approved').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  productIdx: index('reviews_product_idx').on(table.product_id),
  approvedIdx: index('reviews_approved_idx').on(table.is_approved),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.product_id],
    references: [products.id],
  }),
}));

// ==================== NEWSLETTER SUBSCRIBERS ====================
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  is_active: boolean('is_active').notNull().default(true),
  subscribed_at: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('newsletter_email_idx').on(table.email),
}));

// ==================== USERS ====================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 20 }).notNull().default('customer'),
  is_verified: boolean('is_verified').notNull().default(false),
  is_active: boolean('is_active').notNull().default(true),
  password: varchar('password', { length: 255 }),
  last_login: timestamp('last_login', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}));

// ==================== ORDERS ====================
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_number: varchar('order_number', { length: 20 }).notNull().unique(),
  user_id: uuid('user_id'),
  status: varchar('status', { length: 30 }).notNull().default('pending'), // pending, processing, shipped, delivered, cancelled
  payment_status: varchar('payment_status', { length: 30 }).notNull().default('unpaid'), // unpaid, paid, refunded
  payment_method: varchar('payment_method', { length: 30 }).notNull().default('cod'), // cod, online
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  shipping_cost: numeric('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  discount_amount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  discount_code: varchar('discount_code', { length: 50 }),
  shipping_address: jsonb('shipping_address').notNull(),
  billing_address: jsonb('billing_address'),
  order_notes: text('order_notes'),
  shipping_method: jsonb('shipping_method'),
  items: jsonb('items').notNull(), // Snapshot of cart items
  tracking_number: varchar('tracking_number', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.order_number),
  userIdx: index('orders_user_idx').on(table.user_id),
  statusIdx: index('orders_status_idx').on(table.status),
  paymentStatusIdx: index('orders_payment_status_idx').on(table.payment_status),
}));

// ==================== ORDER ITEMS ====================
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull(),
  product_id: uuid('product_id').notNull(),
  product_name: varchar('product_name', { length: 200 }),
  variant_id: uuid('variant_id'),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }),
  sku: varchar('sku', { length: 50 }),
  size: varchar('size', { length: 20 }),
  color: varchar('color', { length: 50 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.order_id),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.order_id],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.product_id],
    references: [products.id],
  }),
}));

// ==================== DISCOUNTS ====================
export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull().default('percentage'),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  min_purchase: numeric('min_purchase', { precision: 10, scale: 2 }),
  max_uses: integer('max_uses'),
  used_count: integer('used_count').notNull().default(0),
  starts_at: timestamp('starts_at', { withTimezone: true }),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  is_active: boolean('is_active').notNull().default(true),
  rules: jsonb('rules').default({}),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  codeIdx: uniqueIndex('discounts_code_idx').on(table.code),
}));

// ==================== AUDIT LOGS ====================
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  entity_type: varchar('entity_type', { length: 50 }).notNull(),
  entity_id: varchar('entity_id', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  performed_by: varchar('performed_by', { length: 100 }),
  changes: jsonb('changes').default({}),
  ip_address: varchar('ip_address', { length: 50 }),
  user_agent: varchar('user_agent', { length: 500 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  entityIdx: index('audit_entity_idx').on(table.entity_type, table.entity_id),
  createdIdx: index('audit_created_idx').on(table.created_at),
}));

// ==================== WARM CHAPTERS ====================
// Warm chapters now link to categories via show_on_home_chapter flag
export const warmChapters = pgTable('warm_chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  image_url: varchar('image_url', { length: 500 }).notNull(),
  // Deprecated: product_ids - now using categories directly
  product_ids: jsonb('product_ids').default([]),
  display_order: integer('display_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('warm_chapters_slug_idx').on(table.slug),
  activeIdx: index('warm_chapters_active_idx').on(table.is_active),
  orderIdx: index('warm_chapters_order_idx').on(table.display_order),
}));

// ==================== OTP VERIFICATIONS ====================
export const otpVerifications = pgTable('otp_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).notNull(),
  otp_code: varchar('otp_code', { length: 6 }).notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  verified: boolean('verified').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  phoneIdx: index('otp_verifications_phone_idx').on(table.phone),
}));

// ==================== ADDRESSES ====================
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'shipping' or 'billing'
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  region: varchar('region', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).notNull().default('Pakistan'),
  phone: varchar('phone', { length: 20 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('addresses_user_idx').on(table.userId),
  defaultIdx: index('addresses_default_idx').on(table.isDefault),
}));

// ==================== WISHLISTS ====================
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('wishlists_user_idx').on(table.userId),
  productIdx: index('wishlists_product_idx').on(table.productId),
  uniqueIdx: uniqueIndex('wishlists_unique_idx').on(table.userId, table.productId),
}));

// ==================== COUPON CODES ====================
export const couponCodes = pgTable('coupon_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discount_type: varchar('discount_type', { length: 20 }).notNull(), // 'percentage' or 'fixed'
  discount_value: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  min_order_amount: numeric('min_order_amount', { precision: 10, scale: 2 }),
  max_discount: numeric('max_discount', { precision: 10, scale: 2 }),
  usage_limit: integer('usage_limit'),
  used_count: integer('used_count').notNull().default(0),
  starts_at: timestamp('starts_at', { withTimezone: true }),
  ends_at: timestamp('ends_at', { withTimezone: true }),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  codeIdx: index('coupon_codes_code_idx').on(table.code),
  activeIdx: index('coupon_codes_active_idx').on(table.is_active),
}));

// ==================== NOTIFICATIONS ====================
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull().default('info'), // 'info', 'order', 'stock', 'system'
  link: varchar('link', { length: 500 }), // Internal route for navigation
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.user_id),
  isReadIdx: index('notifications_is_read_idx').on(table.is_read),
  createdIdx: index('notifications_created_idx').on(table.created_at),
}));

// ==================== EMAIL CAMPAIGNS ====================
export const emailCampaigns = pgTable('email_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  subject: varchar('subject', { length: 500 }).notNull(),
  content: text('content').notNull(),
  target_audience: varchar('target_audience', { length: 50 }).notNull(), // 'all', 'active_customers', 'inactive_customers', 'subscribers'
  sent_count: integer('sent_count').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // 'draft', 'sending', 'completed'
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  sent_at: timestamp('sent_at', { withTimezone: true }),
});

export const emailCampaignRecipients = pgTable('email_campaign_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaign_id: uuid('campaign_id').references(() => emailCampaigns.id),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'sent', 'failed'
  sent_at: timestamp('sent_at', { withTimezone: true }),
});
