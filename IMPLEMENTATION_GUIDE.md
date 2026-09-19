# Neon DB E-Commerce Implementation Guide

## Project Overview
This guide covers the complete implementation roadmap for integrating Neon DB schema, frontend UI/UX enhancements, backend logic, and critical fixes across 8 phases.

**Tech Stack:**
- Database: Neon PostgreSQL with Drizzle ORM
- Frontend: Next.js 14+ with TypeScript
- Styling: Tailwind CSS
- Animations: GSAP / Framer Motion
- State Management: React Context / Zustand
- Authentication: NextAuth.js with RBAC

---

## Phase 1: Warm Chapter I Auto-Scroll Carousel & Dynamic Data

### Objective
Implement homepage carousel section matching reference design with dynamic data from `warm_chapters` table.

### Database Schema Changes
**File:** `src/db/schema.ts`
```typescript
// Add new table
export const warmChapters = pgTable('warm_chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  image_url: text('image_url').notNull(),
  product_ids: jsonb('product_ids').$type<string[]>(),
  display_order: integer('display_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### Backend API
**File:** `src/app/api/warm-chapters/route.ts` (NEW)
- GET endpoint to fetch all warm chapters ordered by `display_order`
- Include related products via `product_ids` join

**File:** `src/lib/data.ts` (UPDATE)
- Add `getWarmChapters()` function
- Add `getProductsByIds(ids: string[])` helper

### Frontend Components
**File:** `src/components/home/WarmChapterCarousel.tsx` (NEW)
- Centered heading "WARM CHAPTER I" with thin red underline
- Sub-text "NEW EDIT"
- 4 cards per row grid
- Auto-scroll every 4 seconds (right-side infinite)
- No manual navigation buttons
- Pagination dots at bottom center with active state
- Card hover: cinematic top-left zoom (scale + translate origin left)
- Mobile responsive collapse

**File:** `src/components/home/WarmChapterCard.tsx` (NEW)
- Display: image, title, subtitle
- Hover effect: transform-origin: top left, scale 1.05
- Link to product detail page

**File:** `src/app/page.tsx` (UPDATE)
- Import and render `<WarmChapterCarousel />` after hero section

### Animation Logic
**File:** `src/hooks/useAutoScroll.ts` (NEW)
- Custom hook for auto-scroll carousel
- 4-second interval
- Infinite loop logic
- Pause on hover

### Verification Checklist
- [ ] `warm_chapters` table created in Neon DB
- [ ] API returns sorted data by `display_order`
- [ ] Carousel auto-scrolls every 4s
- [ ] Hover effect is top-left zoom (not center)
- [ ] Pagination dots show active state
- [ ] Mobile responsive (stack on small screens)
- [ ] No hardcoded content - all dynamic from DB

---

## Phase 2: Collections in Focus Split Layout & Admin Validation

### Database Schema Changes
**File:** `src/db/schema.ts` (UPDATE)
```typescript
// Add to categories table
export const categories = pgTable('categories', {
  // ... existing fields
  is_featured_in_focus: boolean('is_featured_in_focus').default(false),
  display_order_in_focus: integer('display_order_in_focus'),
});
```

### Backend API
**File:** `src/app/api/categories/focus/route.ts` (NEW)
- GET: Fetch max 4 categories where `is_featured_in_focus = true`
- ORDER BY `display_order_in_focus`

### Admin Panel
**File:** `src/app/admin/categories/page.tsx` (UPDATE)
- Add checkbox for "Featured in Focus"
- Add numeric input for "Display Order in Focus"
- **Validation:** Max 4 categories can be featured
- If 4 already selected, disable remaining checkboxes
- Show warning: "Maximum 4 categories allowed in Focus section"

**File:** `src/app/admin/categories/[id]/edit/page.tsx` (UPDATE)
- Load existing category data
- Same validation logic
- Save to Neon DB without errors

### Frontend Components
**File:** `src/components/home/CollectionsInFocus.tsx` (NEW)
- Split-screen layout
- **Left Side:**
  - Static lifestyle image
  - Brand description: "Our most-loved collections..."
  - Heading text
- **Right Side:**
  - 2x2 grid of featured categories
  - Button text: "Shop {Category Name}"
  - Click redirects to `/collections/{slug}`

**File:** `src/app/collections/[slug]/page.tsx` (UPDATE)
- Ensure category products display correctly
- Filter products by category slug

### Responsive Behavior
- Desktop: Split screen (50% left, 50% right)
- Mobile: Stack vertically (image top, grid bottom)

### Verification Checklist
- [ ] Admin can select max 4 featured categories
- [ ] 5th selection blocked with validation message
- [ ] Button text dynamically shows category name
- [ ] Redirect to correct collection page
- [ ] Split layout works on desktop
- [ ] Mobile stacks properly
- [ ] Data loads from `categories` table

---

## Phase 3: Global Product Cards Redesign & Shop All Filters

### Global Product Card Component
**File:** `src/components/products/ProductCard.tsx` (REDESIGN)
- Aspect ratio: 9:16 (vertical rectangle)
- Border radius: 0 (sharp corners)
- **Hover Effects:**
  - Size selector slides up from bottom
  - Default size pre-selected from `sizes` jsonb array
  - Quick View circular icon expands to reveal text "Quick View"
- Discount badge:
  - If admin set manually → use that
  - Else → auto-calculate: `((compare_price - actual_price) / compare_price) * 100`

### Homepage Layout
**File:** `src/app/page.tsx` (UPDATE)
- Display 6 product cards full-width
- Zero side gaps (gap-0)

### Shop All Page
**File:** `src/app/shop/page.tsx` (NEW/UPDATE)
- **Left Sidebar Filters:**
  - Sizes (from `products.sizes` jsonb)
  - Colors (from `products.colors` jsonb)
  - Price range slider
  - Features: New Arrival, Best Seller toggles
- **Top Bar:**
  - Sorting: Featured, Price Low-High, Price High-Low, Date New-Old
  - Grid toggle (3/4 columns)
- Display 6 cards full-width

**File:** `src/components/shop/FilterSidebar.tsx` (NEW)
- Dynamic filter options from products table
- Multi-select for sizes/colors
- Price range with min/max inputs

**File:** `src/components/shop/SortBar.tsx` (NEW)
- Sort dropdown
- Grid view toggle buttons

### Collection Pages
**File:** `src/app/collections/[slug]/page.tsx` (UPDATE)
- NO filters on collection pages
- Only product grid display

### Database Notes
- Use `products.sizes` (jsonb array) for size options
- Use `products.colors` (jsonb array) for color options
- Respect `is_new_arrival` and `is_bestseller` boolean flags

### Verification Checklist
- [ ] Card aspect ratio is 9:16
- [ ] Sharp corners (no border-radius)
- [ ] Size selector slides up on hover
- [ ] Quick View icon expands to text
- [ ] Discount badge auto-calculates if not set
- [ ] Shop All has left sidebar filters
- [ ] Shop All has top sorting bar
- [ ] Collection pages have NO filters
- [ ] Homepage shows 6 full-width cards
- [ ] All data dynamic from `products` table

---

## Phase 4: Advanced Add to Cart Animation & Sidebar Assembly

### Animation System
**File:** `src/lib/animations/cartAnimations.ts` (NEW)
- GSAP/Framer Motion flying clone animation
- Bezier curve path from product card to cart icon
- Blast/particle impact effect on arrival

### Add to Cart Trigger
**File:** `src/components/products/AddToCartButton.tsx` (UPDATE)
- Universal trigger (works from Card, Modal, PDP)
- Clone product image on click
- Animate clone to cart icon position
- Trigger particle explosion on impact

### Cart Sidebar
**File:** `src/components/cart/CartSidebar.tsx` (UPDATE)
- **Item Entry Animation (Sequential Assembly):**
  1. Image snaps into place
  2. Title slides in from right
  3. Size/Color badges pop in
  4. Quantity fades in
- Items enter one by one (staggered)

### State Management
**File:** `src/context/CartContext.tsx` (UPDATE)
- Queue system for rapid clicks (prevent overlap)
- Instant background state update
- Existing item quantity: bounce animation on increment
- Animation queue management

### Particle Effect
**File:** `src/components/effects/CartImpactEffect.tsx` (NEW)
- Particle explosion at cart icon
- Configurable particle count and spread

### Verification Checklist
- [ ] Flying clone follows bezier curve
- [ ] Particle blast on cart icon impact
- [ ] Cart items assemble sequentially
- [ ] Rapid clicks queued (no animation overlap)
- [ ] State updates instantly in background
- [ ] Quantity increment shows bounce
- [ ] Works from all triggers (Card/Modal/PDP)

---

## Phase 5: PDP Enhancements, Size Guide Logic & Admin Forms

### Product Detail Page
**File:** `src/app/products/[slug]/page.tsx` (UPDATE)

**Sticky Image:**
- Main image sticky until specs section ends
- Use `position: sticky` with calculated top offset

**Gallery:**
- Dots must be clickable
- Active dot highlights current image

**Size Guide:**
**File:** `src/components/products/SizeGuideModal.tsx` (NEW)
- Load from `products.size_guide` (jsonb column)
- If empty/null → hide "Size Guide" button completely
- Modal displays per-product size chart

**Care Instructions:**
**File:** `src/components/products/CareInstructions.tsx` (NEW)
- 2x2 grid layout
- Icons + text: "No Iron on Print", "Hand Wash Only", etc.
- Data from `products.care_instructions` jsonb

**FAQ Accordion:**
**File:** `src/components/products/FAQAccordion.tsx` (NEW)
- Expandable FAQ items
- Data from `products.faq` jsonb array

**Sticky Add-to-Cart Bar:**
**File:** `src/components/products/StickyAddToCart.tsx` (NEW)
- Show/hide based on scroll position
- Appears when user scrolls past main ATC button
- Disappears near page bottom

### Admin Panel - Product Forms
**File:** `src/app/admin/products/add/page.tsx` (NEW)
- Rich Text Editor for specs section
- Separate add page (not modal)
- All fields including size_guide, care_instructions, faq
- Save to Neon DB

**File:** `src/app/admin/products/[id]/edit/page.tsx` (UPDATE)
- Load existing product data correctly
- Rich Text Editor pre-filled with specs
- Update functionality without errors
- Handle jsonb fields properly

### Database Schema
**File:** `src/db/schema.ts` (UPDATE)
```typescript
export const products = pgTable('products', {
  // ... existing fields
  size_guide: jsonb('size_guide'), // { chart: [], unit: 'inches' }
  care_instructions: jsonb('care_instructions'), // [{ icon, text }]
  faq: jsonb('faq'), // [{ question, answer }]
  specs: text('specs'), // Rich HTML from RTE
});
```

### Verification Checklist
- [ ] Size Guide button hidden if data empty
- [ ] Main image sticky until specs end
- [ ] Gallery dots clickable
- [ ] Care instructions in 2x2 grid
- [ ] FAQ accordion functional
- [ ] Sticky ATC bar shows/hides on scroll
- [ ] Admin add page saves to DB
- [ ] Admin edit page loads existing data
- [ ] Rich Text Editor works for specs

---

## Phase 6: Checkout System, OTP via Nginx & User Dashboard

### Checkout Flow - 3 Steps

**Step 1: OTP Verification**
**File:** `src/app/checkout/step-1/page.tsx` (NEW)
- Phone number input
- Send OTP via Nginx/WebScript
- Store in `otp_verifications` table
- Verify OTP on submit

**Database:**
**File:** `src/db/schema.ts` (UPDATE)
```typescript
export const otpVerifications = pgTable('otp_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  otp_code: text('otp_code').notNull(), // Keep this, remove 'otp'
  expires_at: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Step 2: Address Form**
**File:** `src/app/checkout/step-2/page.tsx` (NEW)
- Country default: Pakistan
- Phone: strict regex validation `^(\+92|0)?3[0-9]{9}$`
- Billing address: "Same as shipping" toggle
- Order Notes: Required field

**Step 3: Shipping Method**
**File:** `src/app/checkout/step-3/page.tsx` (NEW)
- Shipping options with prices
- Order summary updates instantly on selection
- Place order button

### Order Creation
**File:** `src/app/api/orders/route.ts` (NEW)
- POST: Create order in `orders` table
- Auto-account creation in `users` table if new customer
- Generate invoice PDF

**Database:**
```typescript
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  status: text('status').notNull(), // pending, processing, shipped, delivered
  paymentStatus: text('payment_status').notNull(), // unpaid, paid, refunded
  total: decimal('total').notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  billingAddress: jsonb('billing_address'),
  orderNotes: text('order_notes'),
  shippingMethod: jsonb('shipping_method'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### User Dashboard
**File:** `src/app/dashboard/page.tsx` (NEW)
- Overview with recent orders

**File:** `src/app/dashboard/orders/page.tsx` (NEW)
- Order history list
- Order details modal

**File:** `src/app/dashboard/tracking/[orderId]/page.tsx` (NEW)
- Private tracking (login required)
- Public tracking with security check (order number + phone)

**File:** `src/app/dashboard/addresses/page.tsx` (NEW)
- CRUD operations for addresses
- "Set as Default" functionality

**File:** `src/app/dashboard/wishlist/page.tsx` (NEW)
- Wishlist items from `wishlists` table

**File:** `src/app/dashboard/settings/page.tsx` (NEW)
- Email: read-only
- Password change
- Phone update

### Admin Order Management
**File:** `src/app/admin/orders/page.tsx` (UPDATE)
- Status dropdown: pending, processing, shipped, delivered
- Payment dropdown: unpaid, paid, refunded
- Update saves to Neon DB

**File:** `src/app/api/orders/[id]/invoice/route.ts` (NEW)
- Generate PDF invoice
- Download or email option

### Verification Checklist
- [ ] 3-step checkout flow works
- [ ] OTP sent/verified via Nginx
- [ ] Pakistan default country
- [ ] Phone regex validation works
- [ ] Order notes required
- [ ] Shipping method updates summary
- [ ] Order saved to `orders` table
- [ ] Auto-account creation for new users
- [ ] User dashboard has all sections
- [ ] Private/public tracking works
- [ ] Addresses CRUD with default setting
- [ ] Admin can update order status/payment
- [ ] Invoice PDF generates

---

## Phase 7: Header RBAC, Announcement Bar & Footer

### Header Component
**File:** `src/components/layout/Header.tsx` (UPDATE)

**Logo Scaling:**
- Scroll-based dynamic scaling
- Use `useScroll` hook to detect scroll position
- Scale logo down on scroll

**Icon Layout:**
- Search icon: far-left (after logo)
- Right side tight grouping: Admin/Profile | Wishlist | Cart
- Icons must be tightly grouped with minimal gap

**Announcement Bar:**
**File:** `src/components/layout/AnnouncementBar.tsx` (NEW/UPDATE)
- Top carousel with multiple messages
- Auto-scroll behavior
- Hide on scroll down, show on scroll up

### RBAC Implementation
**File:** `src/app/admin/signin/page.tsx` (NEW)
- Separate admin login route
- Not accessible via customer login

**File:** `src/middleware.ts` (UPDATE)
- Protect `/admin/*` routes
- Check user role from session
- Non-admin users → redirect to customer login
- Admin users → allow access

**File:** `src/lib/auth.ts` (UPDATE)
- Add role-based access control
- Session includes user role

### Footer
**File:** `src/components/layout/Footer.tsx` (UPDATE)
- White background
- Original social media icons (not generic)
- Proper spacing and alignment

### Collection Hero
**File:** `src/app/collections/[slug]/page.tsx` (UPDATE)
- Taller hero section
- No overlay on hero image
- Centered compact subcategory pills

### Verification Checklist
- [ ] Logo scales on scroll
- [ ] Search icon far-left
- [ ] Right icons tightly grouped
- [ ] Announcement bar auto-scrolls
- [ ] Announcement hides on scroll down
- [ ] Admin signin at `/admin/signin`
- [ ] Non-admin redirected from admin routes
- [ ] Footer white with original social icons
- [ ] Collection hero taller, no overlay
- [ ] Subcategory pills centered and compact

---

## Phase 8: Critical Data Fetching Fixes & Schema Cleanup

### Data Fetching Debug

**Products Not Showing:**
**File:** `src/lib/data.ts` (DEBUG)
- Fix `getProducts()` function
- Ensure proper joins with categories
- Handle null values gracefully

**Prices Not Loading:**
**File:** `src/components/products/ProductCard.tsx` (DEBUG)
- Check price formatting
- Handle missing compare_price
- Verify discount calculation

**Images Broken:**
**File:** `src/lib/image-loader.ts` (DEBUG)
- Verify image URL construction
- Check CDN/storage configuration
- Add fallback images

**Mega Menu Banners:**
**File:** `src/components/navigation/MegaMenu.tsx` (DEBUG)
- Fetch banners from correct table
- Verify image paths
- Check conditional rendering

**Focus Sections:**
**File:** `src/components/home/CollectionsInFocus.tsx` (DEBUG)
- Verify API endpoint
- Check data transformation
- Ensure proper error handling

### Schema Cleanup - Remove Duplicate Columns

**Products Table:**
**File:** `src/db/schema.ts` (CLEANUP)
```typescript
// KEEP these (actively used):
is_bestseller: boolean('is_bestseller'),
compare_at_price: decimal('compare_at_price'),
main_category_id: uuid('main_category_id'),

// DELETE these (unused, null values):
// is_best_seller: boolean('is_best_seller'),  ❌ REMOVE
// compare_price: decimal('compare_price'),    ❌ REMOVE
// category_id: uuid('category_id'),           ❌ REMOVE
```

**Users Table:**
```typescript
// KEEP:
password_hash: text('password_hash'),

// DELETE:
// password: text('password'),  ❌ REMOVE
```

**OTP Verifications Table:**
```typescript
// KEEP:
otp_code: text('otp_code'),

// DELETE:
// otp: text('otp'),  ❌ REMOVE
```

### Migration Script
**File:** `src/db/migrations/cleanup-duplicates.sql` (NEW)
```sql
-- Products table cleanup
ALTER TABLE products 
  DROP COLUMN IF EXISTS is_best_seller,
  DROP COLUMN IF EXISTS compare_price,
  DROP COLUMN IF EXISTS category_id;

-- Users table cleanup
ALTER TABLE users 
  DROP COLUMN IF EXISTS password;

-- OTP verifications cleanup
ALTER TABLE otp_verifications 
  DROP COLUMN IF EXISTS otp;
```

### Drizzle Kit Verification
**Command:** `npx drizzle-kit push`
- Verify schema pushes without errors
- Check migration files generated correctly
- Confirm duplicate columns removed from Neon DB

### Admin Forms Testing
**File:** `src/app/admin/products/add/page.tsx` (TEST)
- Test save functionality
- Verify no DB errors
- Check all fields persist correctly

**File:** `src/app/admin/products/[id]/edit/page.tsx` (TEST)
- Load existing product
- Update fields
- Save without errors
- Verify changes reflect in DB

### Verification Checklist
- [ ] Products display correctly on homepage
- [ ] Prices load and format properly
- [ ] Images show without broken links
- [ ] Mega menu banners visible
- [ ] Focus sections populate with data
- [ ] Duplicate columns deleted from products table
- [ ] Duplicate columns deleted from users table
- [ ] Duplicate columns deleted from otp_verifications table
- [ ] Drizzle Kit push succeeds
- [ ] Admin add form saves without errors
- [ ] Admin edit form loads and updates correctly
- [ ] No null-value duplicate columns remain
- [ ] Schema matches production requirements

---

## General Implementation Rules

### File Modification Guidelines
1. **Never modify `node_modules/`** - Completely ignore this folder
2. **Never modify `.next/`** - Build cache, auto-generated
3. **Always verify file exists** before editing
4. **Check Git status** to see what changed
5. **Test each phase** before moving to next

### Database Rules
1. **Use Drizzle ORM** for all DB operations
2. **Run migrations** after schema changes
3. **Verify in Neon Console** that changes applied
4. **Keep schema.ts** as single source of truth
5. **Remove duplicate columns** permanently (not just ignore)

### Code Quality
1. **No hardcoded content** - All from database
2. **TypeScript strict mode** - No `any` types
3. **Responsive design** - Mobile-first approach
4. **Accessibility** - ARIA labels, semantic HTML
5. **Performance** - Lazy loading, image optimization

### Testing Protocol
Each phase must pass:
- [ ] Database schema verified in Neon Console
- [ ] API endpoints tested (Postman/curl)
- [ ] Frontend renders without console errors
- [ ] Mobile responsive check
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] Drizzle Kit push successful
- [ ] No TypeScript errors

---

## Phase Execution Order

Execute phases in sequence:
1. **Phase 1** → Warm Chapter Carousel
2. **Phase 2** → Collections in Focus
3. **Phase 3** → Product Cards & Filters
4. **Phase 4** → Cart Animations
5. **Phase 5** → PDP & Admin Forms
6. **Phase 6** → Checkout & Dashboard
7. **Phase 7** → Header, RBAC, Footer
8. **Phase 8** → Data Fetching Fixes & Schema Cleanup

**Note:** Phase 8 must be last as it involves debugging issues from previous phases and final schema cleanup.

---

## Emergency Rollback

If any phase breaks production:
```bash
# Revert database migration
npx drizzle-kit revert

# Revert code changes
git reset --hard HEAD~1

# Clear build cache
rm -rf .next

# Rebuild
npm run build
```

---

## Success Criteria

Project complete when:
- ✅ All 8 phases implemented
- ✅ Zero TypeScript errors
- ✅ All tests passing
- ✅ Neon DB schema clean (no duplicates)
- ✅ All features functional in production
- ✅ Mobile responsive throughout
- ✅ Admin panel fully operational
- ✅ Checkout flow end-to-end working
- ✅ User dashboard complete
- ✅ Performance metrics acceptable (<3s page load)

---

**Document Version:** 1.0  
**Last Updated:** Current Session  
**Status:** Ready for Implementation  

---

*End of Implementation Guide*
