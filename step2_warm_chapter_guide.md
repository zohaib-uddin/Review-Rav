# Step 2: Warm Chapter I Auto-Scroll Carousel & Dynamic Data

## 1. Overview
This guide details the implementation of the "Warm Chapter I" section on the Homepage. It involves creating a dynamic, auto-scrolling carousel with specific hover animations, backed by the `warm_chapters` database table and manageable via the Admin Panel.

## 2. Database Schema (`schema.ts`)
**Target Table:** `warm_chapters`

### Existing Columns (Verify & Use)
Ensure the following columns exist in the `warm_chapters` table. If they exist, **IGNORE** them (do not modify). If missing, add them.
- `id`: Primary Key (Integer/Serial)
- `title`: String (e.g., "WARM CHAPTER I")
- `subtitle`: String (e.g., "NEW EDIT")
- `image_url`: String (URL for the card image)
- `product_ids`: JSON or Text (Array of product IDs associated with this chapter/card)
- `display_order`: Integer (For sorting the cards in the carousel)
- `is_active`: Boolean (To filter active chapters)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Master Rule Compliance
- **Do not** recreate the table if it exists.
- **Do not** add duplicate columns.
- Only add missing columns listed above.
- **Action:** Run `drizzle-kit push` to sync any schema changes to the local DB.

## 3. Backend API Implementation

### Endpoint: `GET /api/warm-chapters`
- **Purpose:** Fetch all active warm chapters sorted by display order.
- **Logic:**
  1. Query `warm_chapters` table.
  2. Filter: `is_active = true`.
  3. Sort: `ORDER BY display_order ASC`.
  4. Return: JSON array of chapter objects.

### Endpoint: `POST /api/warm-chapters` (Admin Only)
- **Purpose:** Create a new chapter card.
- **Payload:** `{ title, subtitle, image_url, product_ids, display_order, is_active }`.

### Endpoint: `PUT /api/warm-chapters/:id` (Admin Only)
- **Purpose:** Update an existing chapter card.
- **Payload:** Same as POST.

### Endpoint: `DELETE /api/warm-chapters/:id` (Admin Only)
- **Purpose:** Delete a chapter card.

## 4. Frontend Implementation (Homepage)

### Component: `WarmChapterCarousel`
**Location:** `src/components/home/WarmChapterCarousel.tsx` (or similar)

#### UI Layout Structure
1. **Header Section:**
   - Main Heading: "WARM CHAPTER I" (Uppercase, Bold).
   - Divider: Red horizontal line below the heading.
   - Subheading: "NEW EDIT" (Smaller font, centered below the line).
2. **Carousel Container:**
   - Visible Area: Shows exactly **4 cards** per row on desktop (responsive for mobile/tablet).
   - Overflow: Hidden (to mask sliding cards).
   - Position: Relative.

#### Card Design
- **Image:** Top section, large aspect ratio.
  - **Hover Effect:** 
    - Default: Image fits container.
    - Hover: Image scales up (zoom) AND translates slightly from the left (smooth transition). *Crucial: Do not just scale center; simulate a pan-zoom from left.*
    - CSS Strategy: Use `overflow: hidden` on the image wrapper. On hover, apply `transform: scale(1.1) translateX(-5%)`.
- **Title:** Bottom section, Uppercase text.
  - **Hover Effect:** No color change.
- **Interaction:** Clicking a card redirects to the specific collection/product page defined in `product_ids`.

#### Auto-Scroll Logic (Infinite Loop)
- **Behavior:** Smoothly scroll right automatically every **4 seconds**.
- **Reset:** When the end of the list is reached, instantly reset to the start (seamless loop).
- **Controls:** No Left/Right manual buttons.
- **Indicators:** Dots at the bottom center indicating the active slide/group.
- **Implementation Strategy:**
  - Use a state variable `scrollPosition`.
  - Use `useEffect` with `setInterval` (4000ms).
  - Calculate max scroll limit: `(totalCards - visibleCards) * cardWidth`.
  - If `scrollPosition >= maxLimit`, reset to `0`.
  - Pause scrolling on mouse hover over the carousel.

## 5. Admin Panel Implementation

### Page: `AdminWarmChapters`
**Location:** `src/pages/admin/WarmChapters.tsx`

#### Features
1. **List View:** Table showing existing chapters (Title, Order, Active Status, Actions).
2. **Add/Edit Form:**
   - **Title Input:** Text field.
   - **Subtitle Input:** Text field.
   - **Image Upload:** URL input or File uploader.
   - **Product Selection:** Multi-select dropdown or search to pick products (stores IDs in `product_ids`).
   - **Display Order:** Number input.
   - **Is Active:** Toggle switch/Checkbox.
3. **Actions:** Edit, Delete, Reorder (optional drag-and-drop or manual order update).

## 6. Testing Plan (Drizzle Kit)

### Step 6.1: Schema Verification
```bash
npx drizzle-kit push
```
- Verify no errors regarding duplicate columns.
- Verify `warm_chapters` table structure matches requirements.

### Step 6.2: Seed Data (Optional for testing)
- Insert 5-6 dummy records into `warm_chapters` with varying `display_order` and `is_active` statuses.
- Ensure images are valid URLs.

### Step 6.3: Frontend Verification
- Check if only `is_active = true` items appear.
- Verify sorting by `display_order`.
- Test Auto-scroll: Does it move every 4s? Does it loop infinitely?
- Test Hover: Does the image zoom/pan smoothly from the left?
- Test Responsiveness: Are there 4 cards per row on desktop?

### Step 6.4: Admin Verification
- Add a new chapter via Admin Panel.
- Verify it appears on the Homepage immediately (or after refresh).
- Update `display_order` and verify sort order changes.
- Deactivate a chapter (`is_active = false`) and verify it disappears from Homepage.

## 7. File Modification Scope
- **Schema:** `src/db/schema.ts` (Only if `warm_chapters` needs column fixes).
- **API:** `src/server/api/routes/warmChapters.ts` (Create new or update).
- **Frontend Component:** `src/components/home/WarmChapterCarousel.tsx` (New).
- **Homepage:** `src/pages/Home.tsx` (Integrate component).
- **Admin Page:** `src/pages/admin/WarmChapters.tsx` (New/Update).
- **Types:** `src/types/index.ts` (Add `WarmChapter` interface).

---
**Status:** Guide Ready for Implementation.
Wait for user confirmation ("ready") to start coding.
