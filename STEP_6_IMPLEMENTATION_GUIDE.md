# Step 6: Size Guide, Product Modal & Product Detail Page (PDP) Enhancements

## Overview
This guide covers the complete implementation of:
1. **Size Guide Modal** - Dynamic, category-specific size tables
2. **Product Modal (Quick View)** - Redesigned with gallery and enhanced UX
3. **Product Detail Page (PDP)** - Sticky images, gallery dots, care instructions, FAQ, sticky bottom card
4. **Admin Panel** - Rich Text Editor for product specifications

---

## 1. Size Guide Modal

### Design Requirements
- **Layout**: Clean, minimal, professional grid layout
- **Categories**: Separate tables for each product category:
  - Oversized Tees
  - Shorts
  - Shirts
  - Jackets
  - Bottoms
  - Oversized Hoodies/Sweatshirt/Coats

### Dynamic Logic
```typescript
// Size Guide data structure (stored in products.size_guide JSONB column)
interface SizeGuide {
  enabled: boolean;
  categories: {
    oversizedTees?: SizeTable;
    shorts?: SizeTable;
    shirts?: SizeTable;
    jackets?: SizeTable;
    bottoms?: SizeTable;
    hoodies?: SizeTable;
  };
}

interface SizeTable {
  sizes: string[]; // ["S", "M", "L", "XL", "XXL"]
  measurements: {
    chest?: number[];
    length?: number[];
    shoulder?: number[];
    sleeve?: number[];
    waist?: number[];
    hips?: number[];
  };
  unit: "inches" | "cm";
}
```

### Implementation Rules
1. **Conditional Rendering**: 
   - Check `product.size_guide.enabled === true`
   - Check `product.size_guide` JSONB column has data
   - **ONLY** show "Size Guide" button if BOTH conditions are met
   - If admin hasn't provided size guide, button must NOT appear

2. **Modal Structure**:
```jsx
<SizeGuideModal product={product}>
  {/* Render only the category matching product.category */}
  {/* Display table with sizes as columns, measurements as rows */}
  {/* Include unit toggle (inches/cm) if needed */}
</SizeGuideModal>
```

3. **Styling**:
   - Minimal borders, clean typography
   - Responsive table (scrollable on mobile)
   - Close button (X icon) in top-right corner
   - Backdrop blur effect

---

## 2. Product Modal (Quick View) Redesign

### Layout Changes
- **Increased Size**: Modal should be larger to accommodate content comfortably
- **Two-Column Layout**:
  - **Left Side**: Image gallery
    - Main image (large)
    - Thumbnail gallery (vertical or horizontal)
  - **Right Side**: Product details
    - Title, price, colors, sizes, add to cart

### Gallery Navigation
- **Arrows**: 
  - Transparent background
  - Thin, minimal black icons (← →)
  - Positioned on left/right edges of main image
- **Thumbnails**: 
  - Clickable small images below or beside main image
  - Active thumbnail highlighted with border

### Color Selection Enhancement
```jsx
<ColorSelector>
  {colors.map((color) => (
    <div key={color.id}>
      <ColorCircle color={color.hex} selected={isSelected} />
      <ColorName>{color.name}</ColorName> {/* Display color name next to/below circle */}
    </div>
  ))}
</ColorSelector>
```

### Modal Sizing
```css
.modal-container {
  max-width: 900px; /* Increased from default */
  max-height: 90vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .modal-content {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two-column layout */
    gap: 2rem;
  }
}
```

---

## 3. Product Detail Page (PDP) Enhancements

### 3.1 Main Image & Gallery

#### Sticky Image Behavior
```javascript
// Use IntersectionObserver or scroll event listener
const handleScroll = () => {
  const imageContainer = ref.current;
  const specsSection = specsRef.current;
  
  if (window.scrollY > imageContainer.offsetTop && 
      window.scrollY < specsSection.offsetTop) {
    // Make image sticky
    imageContainer.classList.add('sticky');
  } else {
    imageContainer.classList.remove('sticky');
  }
};
```

**Requirements**:
- Increase main image width and height
- Image becomes sticky when scrolling down
- Sticky behavior stops at "Product Specifications" section
- Optimize scroll listeners (use throttle/debounce)

#### Gallery Dots (Indicators)
```jsx
<GalleryDots>
  {images.map((_, index) => (
    <Dot 
      key={index} 
      active={currentIndex === index}
      onClick={() => setCurrentImage(index)}
    />
  ))}
</GalleryDots>
```

**Behavior**:
- Dots positioned below main image
- Clickable - jumps to corresponding gallery image
- Active dot highlighted

#### Gallery Arrows
- Transparent background
- Thin, minimal icons
- Same style as Quick View modal

### 3.2 Care Instructions Section

**Location**: Below Product Specifications

**Layout**: 2x2 Grid
```jsx
<CareInstructions>
  <CareItem icon="🚫">No Iron on Print</CareItem>
  <CareItem icon="🧼">Hand Wash Only</CareItem>
  <CareItem icon="💧">Use Mild Detergent</CareItem>
  <CareItem icon="🔄">Dry Inside Out</CareItem>
</CareInstructions>
```

**Styling**:
- Each instruction with icon
- Clean grid layout
- Responsive (stack on mobile)

### 3.3 Need Help Section

**Location**: Below Care Instructions

**Content**:
```jsx
<NeedHelp>
  <Heading>NEED HELP? WE'RE HERE</Heading>
  <Buttons>
    <Button variant="primary">ONLINE SUPPORT</Button>
    <Button variant="whatsapp">CHAT WITH US ON WHATSAPP</Button>
  </Buttons>
</NeedHelp>
```

### 3.4 FAQ Section

**Location**: Below Need Help section

**Structure**: Accordion (expandable)
```jsx
<FAQ>
  <FAQItem question="What is the fabric composition?">
    <Answer>...</Answer>
  </FAQItem>
  {/* 7-8 total questions */}
</FAQ>
```

**Questions** (example):
1. What is the fabric composition?
2. How do I choose the right size?
3. What is the return policy?
4. How long does shipping take?
5. Can I exchange my order?
6. How do I track my order?
7. Do you ship internationally?
8. How do I care for my garment?

### 3.5 Sticky Bottom Card

**Trigger**: Shows when user scrolls past main image section (after Product Specifications)

**Behavior**:
- Hidden when user is at top of page
- Appears when scrolling down past image gallery
- Disappears when scrolling back up

**Content**:
```jsx
<StickyBottomCard visible={isVisible}>
  <ProductImage src={thumbnail} />
  <ProductInfo>
    <Title>{product.title}</Title>
    <Size>{selectedSize}</Size>
    <Prices>
      <ComparePrice>${comparePrice}</ComparePrice>
      <ActualPrice>${actualPrice}</ActualPrice>
    </Prices>
  </ProductInfo>
  <AddToCartButton>Add to Cart</AddToCartButton>
</StickyBottomCard>
```

**Implementation**:
```javascript
const [showStickyCard, setShowStickyCard] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    const imageSectionEnd = imageSectionRef.current?.offsetBottom;
    setShowStickyCard(window.scrollY > imageSectionEnd);
  };
  
  window.addEventListener('scroll', throttle(handleScroll, 100));
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### 3.6 Rich Text Specifications

**Admin Panel Fields**:
- Fabric & Composition (Rich Text)
- More Specifications (Rich Text)

**Editor Features**:
- Bold, Italic, Underline
- Lists (ordered/unordered)
- Text alignment
- Clean WYSIWYG interface

**Frontend Rendering**:
```jsx
<div dangerouslySetInnerHTML={{ __html: product.fabricComposition }} />
<div dangerouslySetInnerHTML={{ __html: product.moreSpecifications }} />
```

**Security**: Sanitize HTML before rendering to prevent XSS attacks

---

## 4. Admin Panel - Rich Text Editor

### Library Recommendation
**Option 1: React-Quill** (Recommended)
```bash
npm install react-quill
```

**Option 2: Tiptap**
```bash
npm install @tiptap/react @tiptap/starter-kit
```

### Implementation
```jsx
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

<RichTextEditor>
  <ReactQuill 
    value={fabricComposition}
    onChange={setFabricComposition}
    modules={{
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
      ]
    }}
  />
</RichTextEditor>
```

### Database Schema
```typescript
// products table (Drizzle ORM)
// size_guide column already exists as JSONB - USE IT
// Add/verify these columns exist:
fabricComposition: text(), // Will store HTML from rich text editor
moreSpecifications: text(), // Will store HTML from rich text editor
```

**CRITICAL**: 
- `size_guide` JSONB column already exists - DO NOT recreate it
- Only add missing columns if they don't exist
- Use existing `size_guide` column for dynamic size guide data

---

## 5. File Modification Scope

### Files to Create/Modify:
1. **Components**:
   - `components/SizeGuideModal.tsx` (NEW)
   - `components/ProductModal.tsx` (MODIFY)
   - `components/PDP/ImageGallery.tsx` (MODIFY)
   - `components/PDP/CareInstructions.tsx` (NEW)
   - `components/PDP/NeedHelp.tsx` (NEW)
   - `components/PDP/FAQ.tsx` (NEW)
   - `components/PDP/StickyBottomCard.tsx` (NEW)
   - `components/Admin/RichTextEditor.tsx` (NEW)

2. **Pages**:
   - `pages/product/[slug].tsx` (MODIFY - PDP enhancements)
   - `pages/admin/products/edit.tsx` (MODIFY - Rich text editor)

3. **Database**:
   - `db/schema.ts` (VERIFY - ensure size_guide JSONB exists, add missing text columns if needed)

4. **Utilities**:
   - `utils/scrollOptimizer.ts` (NEW - throttle/debounce functions)
   - `utils/htmlSanitizer.ts` (NEW - sanitize rich text output)

### Files to IGNORE:
- Any existing database tables/columns that already match requirements
- Unrelated components (Header, Footer, Cart, Checkout, etc.)
- Authentication logic
- Payment processing

---

## 6. Performance Optimization

### Scroll Event Optimization
```typescript
// utils/scrollOptimizer.ts
export function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
```

### Image Optimization
- Use Next.js `<Image>` component for automatic optimization
- Implement lazy loading for gallery thumbnails
- Preload main product image

### Memoization
```tsx
const SizeGuideModal = memo(({ product, isOpen, onClose }) => {
  // Component logic
});
```

---

## 7. Testing Checklist

### Size Guide Modal
- [ ] Button only shows when size_guide.enabled === true
- [ ] Button hidden when size_guide is null/empty
- [ ] Correct category table displays based on product type
- [ ] Modal closes properly (X button, backdrop click, ESC key)
- [ ] Responsive on mobile devices

### Product Modal
- [ ] Modal is larger than previous version
- [ ] Gallery navigation works (arrows + thumbnails)
- [ ] Arrow backgrounds are transparent
- [ ] Color names display next to color circles
- [ ] Add to cart functionality works

### PDP Enhancements
- [ ] Main image becomes sticky on scroll
- [ ] Sticky behavior stops at Product Specifications
- [ ] Gallery dots navigate to correct images
- [ ] Care instructions display in 2x2 grid
- [ ] Need Help buttons are clickable
- [ ] FAQ accordion expands/collapses
- [ ] Sticky bottom card appears/disappears correctly
- [ ] Rich text renders with formatting (bold, italic, etc.)

### Admin Panel
- [ ] Rich text editor loads properly
- [ ] Bold, italic, lists work in editor
- [ ] Saved content renders correctly on frontend
- [ ] Size guide JSON can be edited/saved

### Performance
- [ ] No lag during scroll events
- [ ] Images load quickly
- [ ] No memory leaks from event listeners

---

## 8. Implementation Order

1. **Database Verification** (30 min)
   - Verify `size_guide` JSONB column exists
   - Add `fabricComposition` and `moreSpecifications` text columns if missing

2. **Admin Panel Updates** (2 hours)
   - Install Rich Text Editor library
   - Update product edit form with rich text fields
   - Update size guide JSON editor

3. **Size Guide Modal** (2 hours)
   - Create modal component
   - Implement conditional rendering logic
   - Style tables for each category

4. **Product Modal Redesign** (2 hours)
   - Increase modal size
   - Update gallery with transparent arrows
   - Add color names to selector

5. **PDP Enhancements** (4 hours)
   - Implement sticky image behavior
   - Add gallery dots
   - Create Care Instructions component
   - Create Need Help section
   - Create FAQ accordion
   - Implement sticky bottom card
   - Integrate rich text rendering

6. **Performance Optimization** (1 hour)
   - Add throttle/debounce to scroll listeners
   - Optimize image loading
   - Add memoization where needed

7. **Testing & QA** (2 hours)
   - Test all features across devices
   - Fix bugs
   - Verify conditional rendering logic

**Total Estimated Time**: 14-15 hours

---

## 9. Notes & Best Practices

### Conditional Rendering Pattern
```tsx
{product.size_guide?.enabled && product.size_guide?.categories && (
  <SizeGuideButton onClick={openModal} />
)}
```

### Scroll Listener Cleanup
```tsx
useEffect(() => {
  const handleScroll = throttle(() => {
    // Scroll logic
  }, 100);
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Rich Text Security
```tsx
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(richTextContent);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

### Responsive Design
- Mobile-first approach
- Test on breakpoints: 375px, 768px, 1024px, 1440px
- Ensure sticky behaviors work on mobile

---

## 10. Reference Assets Needed

### Icons Required
- Size guide close button (X)
- Gallery navigation arrows (thin, minimal)
- Care instruction icons (4 icons)
- FAQ expand/collapse icons (+/- or chevron)
- WhatsApp icon
- Support/chat icon

### Sample Data
- Size guide JSON structure for each category
- FAQ questions and answers
- Care instruction icons/text

---

**END OF GUIDE**

This guide provides complete specifications for implementing Step 6. Follow each section carefully and refer back to requirements during implementation.
