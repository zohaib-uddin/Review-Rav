# Step 6: Size Guide, Product Modal & PDP Enhancements - Implementation Guide

## Overview
This guide covers the complete implementation of:
1. Size Guide Modal (Dynamic, Category-based)
2. Product Modal (Quick View) Redesign
3. Product Detail Page (PDP) Enhancements
4. Admin Panel Rich Text Editor

---

## 1. Size Guide Modal

### Design Requirements
- Clean, minimal, professional grid layout
- Category-specific tables:
  - Oversized Tees
  - Shorts
  - Shirts
  - Jackets
  - Bottoms
  - Oversized Hoodies/Sweatshirt/Coats

### Dynamic Logic
```typescript
// Use products.size_guide JSONB column
interface SizeGuide {
  enabled: boolean;
  categories: {
    [key: string]: {
      sizes: string[];
      measurements: Record<string, number>[];
    }
  };
}

// Conditional Rendering Rule:
// Show "Size Guide" button ONLY if:
// 1. product.size_guide.enabled === true
// 2. product.size_guide.categories has data
// Otherwise, hide button completely
```

### Implementation Steps
1. Create `SizeGuideModal.tsx` component
2. Fetch size_guide from products table
3. Parse JSONB and render appropriate category table
4. Add conditional button rendering on PDP

---

## 2. Product Modal (Quick View) Redesign

### Changes Required
- Increase modal size for comfortable content fit
- Left side: Main image with vertical/horizontal thumbnail gallery
- Navigation arrows: Transparent background, thin minimal black icons
- Color selector: Display color name next to/below color circle

### Component Structure
```tsx
<ProductModal>
  <LeftPanel>
    <MainImage />
    <ThumbnailGallery (vertical) />
    <NavigationArrows (transparent bg, thin icons) />
  </LeftPanel>
  <RightPanel>
    <ProductTitle />
    <ColorSelector>
      <ColorCircle />
      <ColorName (text) />
    </ColorSelector>
    <SizeSelector />
    <AddToCart />
  </RightPanel>
</ProductModal>
```

---

## 3. Product Detail Page (PDP) Enhancements

### 3.1 Main Image & Gallery
- Increase main image width/height
- **Sticky Image**: On scroll, left image stays fixed until "Product Specifications" section
- **Gallery Dots**: Clickable indicators below main image
- Click dot → Jump to corresponding gallery image
- Gallery arrows: Transparent background, thin icons

### 3.2 Care Instructions Section
Location: Below Product Specifications
Layout: 2x2 Grid
```
[No Iron on Print]  [Hand Wash Only]
[Use Mild Detergent] [Dry Inside Out]
```
Each with icon + text

### 3.3 Need Help Section
```
NEED HELP? WE'RE HERE
[ONLINE SUPPORT] [CHAT WITH US ON WHATSAPP]
```

### 3.4 FAQ Section
- 7-8 questions in accordion (expandable) format
- Store FAQs in products table or separate FAQ table

### 3.5 Sticky Bottom Card
**Trigger**: Show when user scrolls past main image section (after Product Specifications)
**Hide**: When user scrolls back up to top
**Content**:
- Small square product image
- Product title
- Selected size
- Prices (compare & actual)
- Add to Cart button

### 3.6 Rich Text Specifications
- Admin Panel: Use WYSIWYG editor (react-quill or tiptap)
- Fields: "Fabric & Composition", "More Specifications"
- Frontend: Render HTML exactly as saved

---

## 4. Admin Panel - Rich Text Editor

### Library Installation
```bash
npm install react-quill
# or
npm install @tiptap/react @tiptap/starter-kit
```

### Implementation
```tsx
<RichTextEditor
  field="fabric_composition"
  label="Fabric & Composition"
/>
<RichTextEditor
  field="more_specifications"
  label="More Specifications"
/>
```

### Database Note
- Use existing `products.size_guide` JSONB column
- Do NOT modify schema if columns already exist
- Only add missing columns

---

## Performance Optimization
- Optimize scroll event listeners (use throttle/debounce)
- Use Intersection Observer for sticky card visibility
- Lazy load gallery images
- Memoize size guide calculations

---

## Files to Modify
1. `components/SizeGuideModal.tsx` (new)
2. `components/ProductModal.tsx` (redesign)
3. `pages/product/[slug].tsx` (PDP enhancements)
4. `pages/admin/products/[id].tsx` (Rich Text Editor)
5. `lib/products.ts` (size_guide fetching logic)

