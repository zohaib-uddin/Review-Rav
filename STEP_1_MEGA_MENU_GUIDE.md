# Step 1: Mega Menu 3-Column Redesign & Category Logic Guide

## Overview
This guide details the implementation of a 3-column Mega Menu located directly below the header. The menu features sub-categories on the left, featured products in the middle, and a promotional banner on the right. It includes necessary database schema updates (cleaning up duplicate columns), API endpoint specifications, and Admin Panel logic for managing categories and products.

---

## 1. UI/UX Layout Specifications

### Positioning & Behavior
- **Location**: Directly below the main Header navigation.
- **Behavior**: Fixed position relative to the header or sticky behavior. It must remain visible below the header even when the page is scrolled, until the user scrolls past the menu trigger area or closes it.
- **Trigger**: Hover or Click on Main Category links in the top nav.

### Column Structure (3 Columns)

| Column | Section | Content Source | Styling Notes |
| :--- | :--- | :--- | : |
| **Left (25%)** | **Sub-Categories** | `sub_categories` linked to the active `main_category`. | List view. Active sub-category highlighted. Clicking filters the middle column or navigates. |
| **Middle (50%)** | **Featured Products** | `products` where `is_featured = true` AND linked to the active sub-category/main-category. | Grid layout (2x2 or 2x3). Shows Product Image, Name, Price. |
| **Right (25%)** | **Banner Image** | `banner_image` column from the `categories` table (Main Category). | Full height image. Text overlay (Category Name, CTA button) positioned absolutely over the image. |

### Visual Flow
1. User hovers "Electronics".
2. Mega Menu slides down/fades in below Header.
3. **Left**: Shows "Mobiles", "Laptops", "Accessories".
4. **Middle**: Shows featured iPhones, MacBooks, etc.
5. **Right**: Shows a big banner image for "Electronics" with text "Latest Gadgets".

---

## 2. Database Schema Changes (Drizzle ORM)

### Critical Rule: Duplicate Column Cleanup
The `products` table currently has duplicate foreign keys. We must standardize on `main_category_id` and `sub_category_id`.

**Action Plan:**
1. **IGNORE/REMOVE**: `category_id` and `subcategory_id` (if they exist and are null/unused).
2. **KEEP/USE**: `main_category_id` and `sub_category_id`.
3. **Schema Update**: Ensure `schema.ts` only defines the active columns. If migrating via SQL, drop the unused columns.

### Updated Schema Definition (`schema.ts`)

#### Categories Table
We need a self-referencing structure or a explicit Main/Sub split. Based on requirements, we will treat "Main Categories" as parent rows and "Sub Categories" as children, OR use a specific flag.
*Requirement Check*: "Admin pehle sub-categories add karega, phir main category banayega aur dropdown se sub-categories assign karega."
This implies a **Many-to-Many** or a **Parent-Child** relationship where a Main Category holds multiple Sub Categories.

Let's refine the `categories` table to support the Banner Image and hierarchy.

```typescript
// schema/categories.ts
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  // For Main Categories: Stores the Banner Image
  banner_image: text('banner_image'), 
  // Self-referencing for Hierarchy (Optional if using explicit linking table, but recommended for simplicity)
  parentId: uuid('parent_id').references(() => categories.id), 
  createdAt: timestamp('created_at').defaultNow(),
});
```

*Alternative Approach based on prompt specifics*:
If the prompt implies distinct tables or specific columns:
- `main_category_id` in Products points to a Category marked as 'main'.
- `sub_category_id` in Products points to a Category marked as 'sub'.

**Revised Schema Strategy for Clarity:**
We will use a single `categories` table with a `type` enum ('main' | 'sub') and a `parent_id` for subs.

```typescript
// schema/categories.ts
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: varchar('type', { enum: ['main', 'sub'] }).notNull(), // Distinguish Main vs Sub
  banner_image: text('banner_image'), // Only used for 'main' type
  parentId: uuid('parent_id').references(() => categories.id), // Points to Main Category if type is 'sub'
  createdAt: timestamp('created_at').defaultNow(),
});
```

#### Products Table (Cleanup Applied)
Removing `category_id` and `subcategory_id`. Keeping `main_category_id` and `sub_category_id`.

```typescript
// schema/products.ts
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  
  // ACTIVE COLUMNS ONLY
  main_category_id: uuid('main_category_id').references(() => categories.id),
  sub_category_id: uuid('sub_category_id').references(() => categories.id),
  
  is_featured: boolean('is_featured').default(false),
  images: json('images').$type<string[]>(), // Array of image URLs
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Migration Steps (Drizzle Kit)
1. Run `drizzle-kit generate` to detect schema changes.
2. **Manual SQL Intervention**: If `category_id` exists in DB, write a migration to drop it:
   ```sql
   ALTER TABLE products DROP COLUMN IF EXISTS category_id;
   ALTER TABLE products DROP COLUMN IF EXISTS subcategory_id;
   ```
3. Run `drizzle-kit migrate` to apply new columns if missing.

---

## 3. API Endpoints

### Public APIs (Frontend Consumption)

#### `GET /api/categories/mega-menu-data`
Fetches all data required to render the mega menu in one go (optimized).
- **Response**:
  ```json
  [
    {
      "id": "main_cat_1",
      "name": "Electronics",
      "banner_image": "url...",
      "subCategories": [
        {
          "id": "sub_cat_1",
          "name": "Mobiles",
          "featuredProducts": [
            { "id": "p1", "name": "iPhone 15", "price": "999", "image": "url..." }
          ]
        }
      ]
    }
  ]
  ```

#### `GET /api/products?sub_category_id=...&is_featured=true`
Fallback endpoint to fetch featured products for a specific sub-category dynamically if not pre-fetched.

### Admin APIs

#### `POST /api/admin/categories`
- **Body**: `{ name, slug, type: 'main' | 'sub', parentId?: string, banner_image?: string }`
- **Logic**: 
  - If `type` is 'sub', `parentId` is required.
  - If `type` is 'main', `banner_image` is optional but recommended.

#### `PUT /api/admin/categories/:id`
- Update category details, re-assign sub-categories (if using a linking table approach) or update banner.

#### `POST /api/admin/products`
- **Body**: `{ name, price, main_category_id, sub_category_id, is_featured, images }`
- **Validation**: Ensure `main_category_id` corresponds to a 'main' type and `sub_category_id` to a 'sub' type linked to that main category.

---

## 4. Admin Panel Logic

### Category Management Flow
1. **Create Sub-Category First**:
   - Admin goes to "Add Category".
   - Selects Type: **Sub-Category**.
   - Enters Name (e.g., "Gaming Laptops").
   - Saves. (No parent assigned yet, or assigned later).

2. **Create Main Category & Assign Subs**:
   - Admin goes to "Add Category".
   - Selects Type: **Main Category**.
   - Enters Name (e.g., "Laptops").
   - Uploads **Banner Image**.
   - **Assignment Dropdown**: A multi-select dropdown appears listing all available "Sub-Categories" that are not yet assigned (or allows re-assignment).
   - *Implementation Detail*: When saving the Main Category, we update the `parentId` of the selected Sub-Categories to point to this new Main Category ID.

### Product Management Flow
1. **Add/Edit Product Form**:
   - **Main Category Dropdown**: Fetches all `type='main'` categories.
   - **Sub Category Dropdown**: Dynamically populated based on selected Main Category. Only shows subs where `parentId == selected_main_id`.
   - **Featured Checkbox**: Toggle `is_featured`.
   - **Images Upload**: Standard upload logic.

2. **Validation**:
   - Cannot save product without both Main and Sub Category.
   - Cannot select a Sub Category that doesn't belong to the selected Main Category.

---

## 5. Implementation Checklist

- [ ] **Schema**: Update `schema.ts` to remove `category_id`/`subcategory_id` and ensure `main_category_id`/`sub_category_id` + `banner_image` exist.
- [ ] **Migration**: Generate and run Drizzle migrations. Manually drop old columns if Drizzle doesn't auto-drop them safely.
- [ ] **Seed Data**: Create a seed script to populate some Main Cats, Sub Cats, and Featured Products for testing.
- [ ] **API**: Implement `/api/categories/mega-menu-data` with efficient joins.
- [ ] **Frontend Component**: Create `MegaMenu.tsx`.
  - Use `position: absolute` or `fixed` relative to header container.
  - Implement 3-column Grid/Flex layout.
  - Handle Hover state.
- [ ] **Admin UI**: Update Category forms to support the "Sub first, then Main with assignment" logic.
- [ ] **Admin UI**: Update Product form to have dependent dropdowns (Main -> Sub).
- [ ] **Testing**: Verify Mega Menu displays correctly on scroll. Verify Featured products filter works.

---

## 6. Testing Strategy (Drizzle Kit)
1. **Unit Test Schema**: Assert that `products` table definition in code matches the intended clean state.
2. **Integration Test**: 
   - Insert a Main Category with a banner.
   - Insert a Sub Category linked to it.
   - Insert a Product with `is_featured=true` linked to both.
   - Query the Mega Menu endpoint and verify the nested JSON structure.
3. **Visual Test**: Open frontend, hover over category, ensure 3 columns align and banner image loads with text overlay.
