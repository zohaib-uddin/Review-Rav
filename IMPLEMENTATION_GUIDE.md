# 🚀 RAVENZA - COMPREHENSIVE IMPLEMENTATION GUIDE

## 📋 OVERVIEW

यह guide सभी requested features को implement करने के लिए है। इसे 5 phases में divide किया गया है।

**Important Notes:**
- सभी data dynamic होगा (NeonDB से)
- Frontend और Admin panel दोनों connected होंगे
- Admin panel से changes frontend पर automatically reflect होंगे
- सभी tables Drizzle Kit के through test होंगी

---

## 🎯 PHASE 1: MEGA MENU & HOMEPAGE SECTIONS FIX

### 1.1 Mega Menu Fix (Static Position)

**Problem:** Mega menu आगे-पीछे हो रहा है based on which category is hovered

**Solution:** Mega menu को एक fixed position में रखना है

**Implementation:**
```tsx
// MegaMenu.tsx में changes
<div className="fixed top-[header-height] left-0 right-0 z-40">
  <div className="max-w-7xl mx-auto">
    {/* Mega menu content */}
  </div>
</div>
```

**Requirements:**
- Mega menu हमेशा screen के mid में रहे
- Category hover करने पर position change न हो
- Smooth transition के साथ open/close हो
- Subcategories, products, और category image show हो

**Testing:**
```bash
# सभी main categories पर hover करके test करें
# Mega menu की position consistent रहनी चाहिए
```

---

### 1.2 Warm Chapter Section (Replace Shop by Category)

**Location:** Hero section के बाद

**Structure:**
```
┌─────────────────────────────────────────────┐
│  WARM CHAPTER ONE                           │
│  New Edit                                   │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │Card1│ │Card2│ │Card3│ │Card4│ ← Carousel│
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│         ● ○ ○ ○ (dots)                      │
└─────────────────────────────────────────────┘
```

**Requirements:**
- Heading: "WARM CHAPTER ONE" (bold)
- Subheading: "New Edit" (smaller)
- Carousel type (left-right loop)
- एक row में 4 cards
- 4 से ज़्यादा हों तो loop में चलें
- Dots indicator नीचे
- Smooth animation
- Hover पर text color change न हो
- Height: 16:9 ratio
- Border चौड़ा और smooth
- Background में shadow
- Hover पर image curve होके zoom हो (direct zoom नहीं)
- Dynamic data (NeonDB से)
- Admin से add/update हो सके
- Products से related हों

**Database Table:**
```sql
CREATE TABLE warm_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  subtitle varchar(255),
  image_url varchar(500) NOT NULL,
  product_ids uuid[] DEFAULT '{}',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_warm_chapters_active ON warm_chapters(is_active);
CREATE INDEX idx_warm_chapters_order ON warm_chapters(display_order);
```

**Admin Panel:**
- Warm Chapters section add करें
- CRUD operations
- Product selection (multi-select)
- Image upload
- Display order management

**Frontend:**
- `/api/warm-chapters` endpoint
- Carousel component with auto-play
- Click पर related products page खुले

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push
npx tsx scripts/seed-warm-chapters.ts

# Frontend test
# Carousel auto-play होना चाहिए
# Dots indicator काम करना चाहिए
# Click पर products page खुलना चाहिए
```

---

### 1.3 Collection in Focus Section (Dynamic)

**Structure:**
```
┌─────────────────────────────────────────────┐
│  Collection in Focus                        │
│  Our Most Loved Collections                 │
│  Ravinza bring together contemporary...     │
│                                             │
│  ┌──────────┐  ┌─────┐ ┌─────┐            │
│  │  Large   │  │Card1│ │Card2│            │
│  │  Image   │  └─────┘ └─────┘            │
│  │          │  ┌─────┐ ┌─────┐            │
│  │          │  │Card3│ │Card4│            │
│  └──────────┘  └─────┘ └─────┘            │
└─────────────────────────────────────────────┘
```

**Requirements:**
- Left side: Large image with title "Collection in Focus"
- Subtitle: "Our Most Loved Collections"
- Description: "Ravinza bring together contemporary design..."
- Right side: 4 cards (2x2 grid)
- Cards में:
  - Image (rounded curve)
  - White background section
  - Collection name
  - Short description
  - Button (Shop Co-Ord Sets, Shop Tees, etc.)
- Dynamic data (NeonDB से)
- Admin से add/update हो सके
- Products से related हों
- Button click पर category page खुले

**Database Table:**
```sql
CREATE TABLE collection_focus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  subtitle varchar(255),
  description text,
  main_image_url varchar(500) NOT NULL,
  collection_type varchar(50) NOT NULL, -- 'category', 'warm_chapter', etc.
  collection_id uuid NOT NULL, -- Reference to categories or warm_chapters
  button_text varchar(100),
  button_link varchar(255),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_collection_focus_active ON collection_focus(is_active);
CREATE INDEX idx_collection_focus_order ON collection_focus(display_order);
```

**Admin Panel:**
- Collection Focus section add करें
- CRUD operations
- Collection type selection (dropdown)
- Collection selection (dynamic based on type)
- Button text customization
- Button link auto-generate

**Frontend:**
- `/api/collection-focus` endpoint
- Dynamic rendering based on collection type
- Button click पर appropriate page खुले

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push
npx tsx scripts/seed-collection-focus.ts

# Frontend test
# Left side image show होना चाहिए
# Right side 4 cards show होने चाहिए
# Button click पर correct page खुलना चाहिए
```

---

### 1.4 Journal Section (Static)

**Requirements:**
- Static रखना (database table delete करें)
- 3-4 additional sections add करें
- Duplicate sections नहीं होने चाहिए

**Implementation:**
```tsx
// JournalSection.tsx में hardcode करें
const journalEntries = [
  {
    title: 'The Birth of Ravenza',
    subtitle: 'Our journey from concept to reality',
    content: '...',
    image: '...',
    author: 'Ravenza Team',
    date: '2024-01-15'
  },
  // ... 3-4 more entries
];
```

**Database:**
```sql
-- Journal table delete करें
DROP TABLE IF EXISTS journal_entries;
```

**Testing:**
```bash
# Journal table delete करें
# Static data show होना चाहिए
# No duplicate sections
```

---

### 1.5 FAQ Section (Static)

**Requirements:**
- Static और dummy रखना
- Sensible content होना चाहिए

**Implementation:**
```tsx
// FAQSection.tsx में hardcode करें
const faqs = [
  {
    question: 'What is your return policy?',
    answer: 'We offer a 7-day easy return policy...'
  },
  // ... 5-6 more FAQs
];
```

**Database:**
```sql
-- FAQ table delete करें
DROP TABLE IF EXISTS faqs;
```

**Testing:**
```bash
# FAQ table delete करें
# Static FAQs show होने चाहिए
```

---

## 🎯 PHASE 2: PRODUCT CARDS ENHANCEMENT

### 2.1 Product Card Design (All Pages)

**Applies to:** Homepage, Collection Page, Shop All Page

**Requirements:**
- Width-height बड़ी (16:9 ratio)
- एक row में 4 cards
- Left-right में कोई खाली जगह नहीं
- बराबर gap
- Smooth cards

**Card Structure:**
```
┌─────────────────────┐
│                     │
│    Product Image    │ ← Hover पर second image
│    (16:9 ratio)     │ ← Left-right icons
│                     │ ← Quick View icon (top-right)
│                     │
├─────────────────────┤
│ Badge (if any)      │ ← Zoom in/out effect
├─────────────────────┤
│ Product Name        │ ← Less bold
│ Rs. 4,500           │
│ Rs. 3,990           │ ← Compare price
│                     │
│ [Add to Cart]       │ ← Hover पर show हो
│                     │
│ ┌─────────────────┐ │
│ │ Size Selection  │ │ ← Hover पर नीचे से open हो
│ │ S M L XL        │ │
│ └─────────────────┘ │
└─────────────────────┘
```

**Hover Effects:**
1. Image automatically change हो (second image from gallery)
2. Left-right icons show हों (for gallery navigation)
3. Quick View icon show हो (top-right)
4. Size selection modal नीचे से open हो
5. Add to Cart button show हो
6. Image curve होके zoom हो (direct zoom नहीं)

**Requirements:**
- Wishlist icon नहीं (सिर्फ Quick View)
- Badge एक ही हो (zoom in/out effect)
- Auto-select first color and size
- Smooth animations

**Implementation:**
```tsx
// ProductCard.tsx
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const [isHovered, setIsHovered] = useState(false);

// Hover पर image change
onMouseEnter={() => {
  setIsHovered(true);
  if (product.images.length > 1) {
    setCurrentImageIndex(1);
  }
}}

onMouseLeave={() => {
  setIsHovered(false);
  setCurrentImageIndex(0);
}}

// Gallery navigation
<button onClick={() => setCurrentImageIndex(prev => 
  prev === product.images.length - 1 ? 0 : prev + 1
)}>
  <ChevronRight />
</button>

// Size selection modal
{isHovered && (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="absolute bottom-0 left-0 right-0 bg-white p-4"
  >
    <div className="flex gap-2">
      {product.sizes.map(size => (
        <button key={size}>{size}</button>
      ))}
    </div>
  </motion.div>
)}
```

**Testing:**
```bash
# सभी pages पर test करें
# Hover effects काम करने चाहिए
# Image change होना चाहिए
# Size selection modal खुलना चाहिए
# Add to Cart button show होना चाहिए
```

---

### 2.2 Add to Cart Animation

**Requirements:**
- Add to Cart click करने पर animation हो
- Product card से cart icon तक flying animation
- Smooth transition

**Implementation:**
```tsx
// Add to Cart button
const handleAddToCart = (e: React.MouseEvent) => {
  // Get button position
  const buttonRect = e.currentTarget.getBoundingClientRect();
  
  // Get cart icon position
  const cartIcon = document.querySelector('[data-cart-icon]');
  const cartRect = cartIcon?.getBoundingClientRect();
  
  if (cartRect) {
    // Create flying element
    const flyingElement = document.createElement('div');
    flyingElement.style.position = 'fixed';
    flyingElement.style.left = `${buttonRect.left}px`;
    flyingElement.style.top = `${buttonRect.top}px`;
    flyingElement.style.width = '50px';
    flyingElement.style.height = '50px';
    flyingElement.style.backgroundImage = `url(${product.image})`;
    flyingElement.style.backgroundSize = 'cover';
    flyingElement.style.borderRadius = '50%';
    flyingElement.style.zIndex = '9999';
    flyingElement.style.transition = 'all 0.8s ease-in-out';
    
    document.body.appendChild(flyingElement);
    
    // Animate to cart
    setTimeout(() => {
      flyingElement.style.left = `${cartRect.left}px`;
      flyingElement.style.top = `${cartRect.top}px`;
      flyingElement.style.width = '20px';
      flyingElement.style.height = '20px';
      flyingElement.style.opacity = '0';
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
      flyingElement.remove();
      // Add to cart logic
      addToCart(product, selectedSize, selectedColor);
    }, 800);
  }
};
```

**Testing:**
```bash
# Add to Cart click करें
# Flying animation होना चाहिए
# Cart icon तक जाना चाहिए
# Cart count update होना चाहिए
```

---

### 2.3 Product Card Title Style

**Requirements:**
- Title less bold
- थोड़ा बारीक रखें

**Implementation:**
```tsx
// ProductCard.tsx
<h3 className="text-sm font-normal text-gray-800 line-clamp-2">
  {product.name}
</h3>
```

**Testing:**
```bash
# Title less bold होना चाहिए
# Readable रहना चाहिए
```

---

## 🎯 PHASE 3: PRODUCT DETAIL & MODAL ENHANCEMENTS

### 3.1 Auto-Select First Size and Color

**Requirements:**
- Product Detail page पर auto-select first size and color
- Product Modal पर auto-select first size and color

**Implementation:**
```tsx
// ProductDetail.tsx
useEffect(() => {
  if (product && !selectedSize && product.sizes.length > 0) {
    setSelectedSize(product.sizes[0]);
  }
  if (product && !selectedColor && product.colors.length > 0) {
    setSelectedColor(product.colors[0]);
  }
}, [product]);

// ProductModal.tsx
useEffect(() => {
  if (product && !selectedSize && product.sizes.length > 0) {
    setSelectedSize(product.sizes[0]);
  }
  if (product && !selectedColor && product.colors.length > 0) {
    setSelectedColor(product.colors[0]);
  }
}, [product]);
```

**Testing:**
```bash
# Product Detail page open करें
# First size auto-select होना चाहिए
# First color auto-select होना चाहिए
# Same for Product Modal
```

---

### 3.2 Buy Now Button

**Requirements:**
- Add to Cart के साथ Buy Now button
- Buy Now click पर directly checkout page खुले (Add to Cart नहीं)

**Implementation:**
```tsx
// ProductDetail.tsx & ProductModal.tsx
<div className="flex gap-3">
  <button onClick={handleAddToCart}>
    Add to Cart
  </button>
  <button onClick={handleBuyNow}>
    Buy Now
  </button>
</div>

const handleBuyNow = () => {
  // Add to cart first
  addToCart(product, selectedSize, selectedColor);
  // Redirect to checkout
  navigate('/checkout');
};
```

**Testing:**
```bash
# Buy Now click करें
# Directly checkout page खुलना चाहिए
# Cart में product add होना चाहिए
```

---

### 3.3 Color Swatches (Circles with Tick)

**Requirements:**
- Color circles में show हो
- Selected color पर tick mark हो
- Admin से color picker के through color आए

**Implementation:**
```tsx
// ColorSwatches.tsx
<div className="flex gap-3">
  {product.colors.map(color => (
    <button
      key={color}
      onClick={() => setSelectedColor(color)}
      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
        selectedColor === color ? 'border-black' : 'border-gray-300'
      }`}
      style={{ backgroundColor: color.hex }}
    >
      {selectedColor === color && (
        <Check size={20} className="text-white" />
      )}
    </button>
  ))}
</div>
```

**Admin Panel:**
```tsx
// ProductForm.tsx
<div>
  <label>Color</label>
  <input
    type="color"
    value={colorHex}
    onChange={(e) => setColorHex(e.target.value)}
  />
  <input
    type="text"
    value={colorName}
    onChange={(e) => setColorName(e.target.value)}
    placeholder="Color name (e.g., Red)"
  />
</div>
```

**Database:**
```sql
-- Products table में colors field update करें
ALTER TABLE products 
ADD COLUMN colors jsonb DEFAULT '[]';

-- Example: [{"name": "Red", "hex": "#FF0000"}]
```

**Testing:**
```bash
# Color circles show होने चाहिए
# Selected color पर tick होना चाहिए
# Admin panel में color picker काम करना चाहिए
```

---

### 3.4 Dynamic Size Guide (Per Product)

**Requirements:**
- हर product का अलग size guide हो
- Dynamic हो (database से)
- Click पर modal open हो

**Database Table:**
```sql
CREATE TABLE product_size_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size_chart jsonb NOT NULL, -- {"S": {"chest": 36, "length": 27}, ...}
  fit_notes text,
  model_size varchar(100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_size_guides_product ON product_size_guides(product_id);
```

**Admin Panel:**
```tsx
// ProductForm.tsx में Size Guide section
<div>
  <label>Size Chart</label>
  <textarea
    value={JSON.stringify(sizeChart, null, 2)}
    onChange={(e) => setSizeChart(JSON.parse(e.target.value))}
    placeholder='{"S": {"chest": 36, "length": 27}, ...}'
  />
  <label>Fit Notes</label>
  <textarea value={fitNotes} onChange={(e) => setFitNotes(e.target.value)} />
  <label>Model Size</label>
  <input value={modelSize} onChange={(e) => setModelSize(e.target.value)} />
</div>
```

**Frontend:**
```tsx
// ProductDetail.tsx
<button onClick={() => setShowSizeGuide(true)}>
  Size Guide
</button>

{showSizeGuide && (
  <SizeGuideModal
    sizeGuide={product.sizeGuide}
    onClose={() => setShowSizeGuide(false)}
  />
)}
```

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push

# Product Detail page पर Size Guide click करें
# Modal open होना चाहिए
# हर product का अलग size guide होना चाहिए
```

---

### 3.5 Dynamic Product Specifications

**Requirements:**
- हर product का अलग specifications हो
- Fabric & Composition
- Fit & Sizing
- Garment Care
- Shipping & Delivery
- More Specifications (additional details)

**Database:**
```sql
-- Products table में specifications fields add करें
ALTER TABLE products 
ADD COLUMN fabric_composition text,
ADD COLUMN fit_type varchar(100),
ADD COLUMN garment_care text,
ADD COLUMN shipping_delivery text,
ADD COLUMN additional_specs jsonb DEFAULT '{}';
```

**Admin Panel:**
```tsx
// ProductForm.tsx में Specifications section
<div>
  <label>Fabric & Composition</label>
  <input value={fabricComposition} onChange={...} />
  
  <label>Fit & Sizing</label>
  <input value={fitType} onChange={...} />
  
  <label>Garment Care</label>
  <textarea value={garmentCare} onChange={...} />
  
  <label>Shipping & Delivery</label>
  <textarea value={shippingDelivery} onChange={...} />
  
  <label>More Specifications</label>
  <textarea 
    value={JSON.stringify(additionalSpecs, null, 2)}
    onChange={...}
    placeholder='{"weight": "200g", "origin": "Pakistan", ...}'
  />
</div>
```

**Frontend:**
```tsx
// ProductDetail.tsx में Accordions
<Accordion title="Fabric & Composition">
  <p>{product.fabric_composition}</p>
</Accordion>

<Accordion title="Fit & Sizing">
  <p>{product.fit_type}</p>
</Accordion>

<Accordion title="Garment Care">
  <p>{product.garment_care}</p>
</Accordion>

<Accordion title="Shipping & Delivery">
  <p>{product.shipping_delivery}</p>
</Accordion>

{product.additional_specs && Object.keys(product.additional_specs).length > 0 && (
  <Accordion title="More Specifications">
    {Object.entries(product.additional_specs).map(([key, value]) => (
      <div key={key}>
        <strong>{key}:</strong> {value}
      </div>
    ))}
  </Accordion>
)}
```

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push

# Product Detail page पर सभी specifications show होने चाहिए
# हर product का अलग specifications होना चाहिए
```

---

## 🎯 PHASE 4: ADMIN PANEL ENHANCEMENTS

### 4.1 Color Picker for Colors

**Requirements:**
- Admin panel में color picker हो
- Color name और hex code दोनों save हों

**Implementation:**
```tsx
// ProductForm.tsx
import { useState } from 'react';

const [colors, setColors] = useState([]);

const addColor = () => {
  setColors([...colors, { name: '', hex: '#000000' }]);
};

const updateColor = (index, field, value) => {
  const newColors = [...colors];
  newColors[index][field] = value;
  setColors(newColors);
};

const removeColor = (index) => {
  setColors(colors.filter((_, i) => i !== index));
};

return (
  <div>
    <label>Colors</label>
    {colors.map((color, index) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="color"
          value={color.hex}
          onChange={(e) => updateColor(index, 'hex', e.target.value)}
        />
        <input
          type="text"
          value={color.name}
          onChange={(e) => updateColor(index, 'name', e.target.value)}
          placeholder="Color name"
        />
        <button onClick={() => removeColor(index)}>Remove</button>
      </div>
    ))}
    <button onClick={addColor}>Add Color</button>
  </div>
);
```

**Testing:**
```bash
# Admin panel में product add/edit करें
# Color picker काम करना चाहिए
# Color name और hex code save होने चाहिए
# Frontend पर color circles show होने चाहिए
```

---

### 4.2 Variants Matrix Auto-Generate

**Requirements:**
- Size और color select करने पर automatically variants matrix generate हो
- हर variant के लिए अलग price और stock दे सके
- Total stock count automatically calculate हो
- First price automatically small size का हो

**Database:**
```sql
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size varchar(50) NOT NULL,
  color varchar(100) NOT NULL,
  price numeric(10, 2),
  stock integer DEFAULT 0,
  sku varchar(100),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(product_id, size, color)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
```

**Admin Panel:**
```tsx
// ProductForm.tsx में Variants section
const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL']);
const [colors, setColors] = useState([]);
const [variants, setVariants] = useState([]);

// Auto-generate variants when sizes or colors change
useEffect(() => {
  const newVariants = [];
  sizes.forEach(size => {
    colors.forEach(color => {
      newVariants.push({
        size,
        color: color.name,
        price: size === 'S' ? basePrice : null, // First price for small size
        stock: 0,
        sku: `${productSku}-${size}-${color.name}`
      });
    });
  });
  setVariants(newVariants);
}, [sizes, colors]);

// Calculate total stock
const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

return (
  <div>
    <label>Variants</label>
    <table>
      <thead>
        <tr>
          <th>Size</th>
          <th>Color</th>
          <th>Price</th>
          <th>Stock</th>
          <th>SKU</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((variant, index) => (
          <tr key={index}>
            <td>{variant.size}</td>
            <td>{variant.color}</td>
            <td>
              <input
                type="number"
                value={variant.price || ''}
                onChange={(e) => {
                  const newVariants = [...variants];
                  newVariants[index].price = parseFloat(e.target.value);
                  setVariants(newVariants);
                }}
              />
            </td>
            <td>
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => {
                  const newVariants = [...variants];
                  newVariants[index].stock = parseInt(e.target.value);
                  setVariants(newVariants);
                }}
              />
            </td>
            <td>{variant.sku}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p>Total Stock: {totalStock}</p>
  </div>
);
```

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push

# Admin panel में product add करें
# Sizes और colors select करें
# Variants matrix auto-generate होना चाहिए
# हर variant के लिए price और stock दे सकें
# Total stock automatically calculate होना चाहिए
# First price small size का होना चाहिए
```

---

### 4.3 More Specifications Section

**Requirements:**
- Product specifications में "More Specifications" section add करें
- Admin से additional details दे सके

**Implementation:**
(See Phase 3.5 for implementation)

**Testing:**
```bash
# Admin panel में product add/edit करें
# More Specifications section में details दें
# Frontend पर show होना चाहिए
```

---

## 🎯 PHASE 5: CHECKOUT PAGE ENHANCEMENTS

### 5.1 3-Step Checkout Process

**Structure:**
```
Step 1: Email Verification
├── Email input
├── OTP verification
└── Continue button

Step 2: Shipping & Billing
├── Customer details (name, phone)
├── Shipping address
├── Billing address (same as shipping / different)
├── Location
├── Postal code
└── Order summary (right side)
    ├── Products
    ├── Quantity
    ├── Size & Color
    ├── Coupon code
    ├── Discount
    ├── Shipping cost
    └── Total

Step 3: Payment Method
├── Cash on Delivery
├── Bank Transfer
├── JazzCash
├── EasyPaisa
└── Place Order button
```

**Requirements:**
- Step 1: Email verification (OTP)
- Step 2: Shipping & billing details
- Step 3: Payment method selection
- Right side: Order summary (products, quantity, size, color, coupon, discount, shipping, total)
- Coupon code apply हो सके (dynamic)
- Shipping cost calculate हो (free above certain amount)
- Loading bar जैसा progress indicator
- Place Order click पर order success modal open हो

**Database Tables:**
```sql
-- OTP table
CREATE TABLE otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  otp varchar(6) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_otp_email ON otp_verifications(email);

-- Coupon codes table
CREATE TABLE coupon_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) UNIQUE NOT NULL,
  discount_type varchar(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value numeric(10, 2) NOT NULL,
  min_order_amount numeric(10, 2),
  max_discount numeric(10, 2),
  usage_limit integer,
  used_count integer DEFAULT 0,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_coupons_code ON coupon_codes(code);
CREATE INDEX idx_coupons_active ON coupon_codes(is_active);

-- Orders table update
ALTER TABLE orders
ADD COLUMN coupon_code varchar(50),
ADD COLUMN discount_amount numeric(10, 2) DEFAULT 0,
ADD COLUMN tracking_id varchar(100);
```

**Frontend Implementation:**
```tsx
// Checkout.tsx
const [step, setStep] = useState(1);
const [email, setEmail] = useState('');
const [otp, setOtp] = useState('');
const [shippingDetails, setShippingDetails] = useState({});
const [paymentMethod, setPaymentMethod] = useState('');
const [couponCode, setCouponCode] = useState('');
const [discount, setDiscount] = useState(0);

// Step 1: Email Verification
const handleEmailSubmit = async () => {
  // Send OTP
  await fetch('/api/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  // Show OTP input
};

const handleOTPVerify = async () => {
  // Verify OTP
  const response = await fetch('/api/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
  
  if (response.ok) {
    setStep(2);
  }
};

// Step 2: Shipping & Billing
const handleShippingSubmit = () => {
  setStep(3);
};

// Step 3: Payment
const handlePlaceOrder = async () => {
  const orderData = {
    email,
    shippingDetails,
    paymentMethod,
    couponCode,
    discount,
    items: cart.items
  };
  
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
  
  const order = await response.json();
  
  // Show success modal
  setShowOrderSuccess(true);
  setOrderDetails(order);
};

// Coupon code apply
const handleApplyCoupon = async () => {
  const response = await fetch('/api/validate-coupon', {
    method: 'POST',
    body: JSON.stringify({ code: couponCode, orderAmount: cart.total })
  });
  
  const result = await response.json();
  
  if (result.valid) {
    setDiscount(result.discount);
  }
};

// Calculate shipping
const calculateShipping = () => {
  const subtotal = cart.total - discount;
  return subtotal >= 3000 ? 0 : 200; // Free shipping above Rs. 3000
};

return (
  <div className="flex gap-8">
    {/* Left side: Steps */}
    <div className="flex-1">
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-8">
        <div 
          className="h-full bg-black rounded-full transition-all"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
      
      {step === 1 && (
        <div>
          <h2>Email Verification</h2>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleEmailSubmit}>Send OTP</button>
          
          {otpSent && (
            <div>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
              <button onClick={handleOTPVerify}>Verify</button>
            </div>
          )}
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2>Shipping & Billing</h2>
          <input placeholder="Full Name" />
          <input placeholder="Phone" />
          <textarea placeholder="Shipping Address" />
          <input placeholder="City" />
          <input placeholder="Postal Code" />
          <button onClick={handleShippingSubmit}>Continue</button>
        </div>
      )}
      
      {step === 3 && (
        <div>
          <h2>Payment Method</h2>
          <label>
            <input 
              type="radio" 
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery
          </label>
          <label>
            <input 
              type="radio" 
              value="bank"
              checked={paymentMethod === 'bank'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Bank Transfer
          </label>
          {/* More payment methods */}
          
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
    </div>
    
    {/* Right side: Order Summary */}
    <div className="w-96 bg-gray-50 p-6 rounded-xl">
      <h3>Order Summary</h3>
      
      {/* Products */}
      {cart.items.map(item => (
        <div key={item.id} className="flex gap-4 mb-4">
          <img src={item.product.image} alt={item.product.name} />
          <div>
            <p>{item.product.name}</p>
            <p>Size: {item.size}</p>
            <p>Color: {item.color}</p>
            <p>Qty: {item.quantity}</p>
            <p>Rs. {item.product.price * item.quantity}</p>
          </div>
        </div>
      ))}
      
      {/* Coupon Code */}
      <div>
        <input 
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button onClick={handleApplyCoupon}>Apply</button>
      </div>
      
      {/* Totals */}
      <div>
        <p>Subtotal: Rs. {cart.total}</p>
        {discount > 0 && <p>Discount: -Rs. {discount}</p>}
        <p>Shipping: Rs. {calculateShipping()}</p>
        <p className="font-bold">Total: Rs. {cart.total - discount + calculateShipping()}</p>
      </div>
    </div>
    
    {/* Order Success Modal */}
    {showOrderSuccess && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl max-w-md">
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your order</p>
          <p>Order Number: {orderDetails.order_number}</p>
          <p>Tracking ID: {orderDetails.tracking_id}</p>
          <p>We've sent a confirmation email to {email}</p>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    )}
  </div>
);
```

**Backend API:**
```typescript
// server/index.ts

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save to database
  await sql`
    INSERT INTO otp_verifications (email, otp, expires_at)
    VALUES (${email}, ${otp}, NOW() + INTERVAL '10 minutes')
  `;
  
  // Send email (using email service)
  await sendEmail({
    to: email,
    subject: 'Your OTP Code',
    body: `Your OTP code is: ${otp}`
  });
  
  res.json({ success: true });
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  const verification = await sql`
    SELECT * FROM otp_verifications
    WHERE email = ${email} AND otp = ${otp} AND is_verified = false
    AND expires_at > NOW()
  `;
  
  if (verification.length === 0) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  
  // Mark as verified
  await sql`
    UPDATE otp_verifications
    SET is_verified = true
    WHERE id = ${verification[0].id}
  `;
  
  res.json({ success: true });
});

// Validate coupon
app.post('/api/validate-coupon', async (req, res) => {
  const { code, orderAmount } = req.body;
  
  const coupon = await sql`
    SELECT * FROM coupon_codes
    WHERE code = ${code} AND is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit)
  `;
  
  if (coupon.length === 0) {
    return res.json({ valid: false });
  }
  
  const c = coupon[0];
  
  // Check minimum order amount
  if (c.min_order_amount && orderAmount < c.min_order_amount) {
    return res.json({ valid: false, error: 'Minimum order amount not met' });
  }
  
  // Calculate discount
  let discount = 0;
  if (c.discount_type === 'percentage') {
    discount = (orderAmount * c.discount_value) / 100;
    if (c.max_discount && discount > c.max_discount) {
      discount = c.max_discount;
    }
  } else {
    discount = c.discount_value;
  }
  
  // Increment usage count
  await sql`
    UPDATE coupon_codes
    SET used_count = used_count + 1
    WHERE id = ${c.id}
  `;
  
  res.json({ valid: true, discount });
});

// Create order
app.post('/api/orders', async (req, res) => {
  const { email, shippingDetails, paymentMethod, couponCode, discount, items } = req.body;
  
  // Generate order number
  const orderNumber = `RVZ-${Date.now()}`;
  const trackingId = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = (subtotal - discount) >= 3000 ? 0 : 200;
  const total = subtotal - discount + shippingCost;
  
  // Create order
  const order = await sql`
    INSERT INTO orders (
      order_number, user_id, status, subtotal, shipping_cost, total,
      shipping_address, coupon_code, discount_amount, tracking_id
    )
    VALUES (
      ${orderNumber}, ${req.user?.id}, 'pending',
      ${subtotal}, ${shippingCost}, ${total},
      ${JSON.stringify(shippingDetails)}, ${couponCode}, ${discount}, ${trackingId}
    )
    RETURNING *
  `;
  
  // Create order items
  for (const item of items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, size, color)
      VALUES (
        ${order[0].id}, ${item.product.id}, ${item.quantity},
        ${item.product.price}, ${item.product.price * item.quantity},
        ${item.size}, ${item.color}
      )
    `;
  }
  
  // Send confirmation email
  await sendEmail({
    to: email,
    subject: 'Order Confirmation',
    body: `Your order ${orderNumber} has been placed successfully!`
  });
  
  res.json(order[0]);
});
```

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push
npx tsx scripts/seed-coupons.ts

# Checkout flow test
# Step 1: Email verification
# Step 2: Shipping details
# Step 3: Payment method
# Order success modal show होना चाहिए
# Email notification जानी चाहिए
```

---

### 5.2 Auto-Detect Email for Logged-in Users

**Requirements:**
- अगर user logged in है, तो email automatically show हो
- User email change भी कर सकता है
- अगर logged in नहीं है, तो empty आए

**Implementation:**
```tsx
// Checkout.tsx
const { user } = useStore();

useEffect(() => {
  if (user) {
    setEmail(user.email);
  }
}, [user]);

return (
  <input 
    type="email" 
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email"
  />
);
```

**Testing:**
```bash
# Login करके checkout करें
# Email automatically show होना चाहिए
# Email change कर सकें
# Logout करके checkout करें
# Email empty होना चाहिए
```

---

## 🎯 PHASE 6: URL STRUCTURE & DATABASE CHANGES

### 6.1 URL Structure Changes

**Current URLs:**
- `/shop/category-name`
- `/product/product-id`

**New URLs:**
- `/collections/category-name`
- `/products/product-name-slug`

**Implementation:**
```tsx
// App.tsx
<Routes>
  <Route path="/collections/:categorySlug" element={<CollectionPage />} />
  <Route path="/products/:productSlug" element={<ProductDetail />} />
</Routes>
```

**Database Changes:**
```sql
-- Products table में slug field add करें
ALTER TABLE products 
ADD COLUMN slug varchar(255) UNIQUE;

-- Generate slugs for existing products
UPDATE products 
SET slug = LOWER(REPLACE(name, ' ', '-'))
WHERE slug IS NULL;

-- Collections table (unified table for all collection types)
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(255) UNIQUE NOT NULL,
  type varchar(50) NOT NULL, -- 'category', 'warm_chapter', 'collection_focus'
  description text,
  image_url varchar(500),
  product_ids uuid[] DEFAULT '{}',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_type ON collections(type);
CREATE INDEX idx_collections_active ON collections(is_active);
```

**Frontend Updates:**
```tsx
// CollectionPage.tsx
const { categorySlug } = useParams();

// Fetch collection by slug
const collection = await fetch(`/api/collections/${categorySlug}`);

// ProductDetail.tsx
const { productSlug } = useParams();

// Fetch product by slug
const product = await fetch(`/api/products/slug/${productSlug}`);
```

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push

# URLs test
# /collections/co-ord-sets should work
# /products/shadow-realm-co-ord-set should work
```

---

### 6.2 Collections Table (Unified)

**Requirements:**
- एक ही table में सभी types के collections store हों
- Type field से differentiate हो (category, warm_chapter, collection_focus)
- हर collection में products की count हो

**Database:**
```sql
-- Collections table (already created in 6.1)

-- Add product count view
CREATE VIEW collection_product_counts AS
SELECT 
  c.id,
  c.name,
  c.type,
  COUNT(p.id) as product_count
FROM collections c
LEFT JOIN unnest(c.product_ids) AS pid ON true
LEFT JOIN products p ON p.id = pid
WHERE c.is_active = true
GROUP BY c.id, c.name, c.type;
```

**Admin Panel:**
```tsx
// AdminCollections.tsx
const [collections, setCollections] = useState([]);

useEffect(() => {
  fetch('/api/collections')
    .then(res => res.json())
    .then(data => setCollections(data));
}, []);

return (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Products</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {collections.map(collection => (
        <tr key={collection.id}>
          <td>{collection.name}</td>
          <td>{collection.type}</td>
          <td>{collection.product_ids.length}</td>
          <td>
            <button>Edit</button>
            <button>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

**Testing:**
```bash
# Drizzle Kit commands
npx drizzle-kit push

# Admin panel में collections show होने चाहिए
# Type और product count show होना चाहिए
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Mega Menu & Homepage Sections
- [ ] Mega menu static position
- [ ] Warm Chapter section (carousel)
- [ ] Collection in Focus section (dynamic)
- [ ] Journal section (static)
- [ ] FAQ section (static)

### Phase 2: Product Cards Enhancement
- [ ] Product card design (16:9 ratio, 4 per row)
- [ ] Hover effects (image change, size selection, quick view)
- [ ] Add to Cart animation
- [ ] Product card title style

### Phase 3: Product Detail & Modal
- [ ] Auto-select first size and color
- [ ] Buy Now button
- [ ] Color swatches (circles with tick)
- [ ] Dynamic size guide (per product)
- [ ] Dynamic product specifications

### Phase 4: Admin Panel
- [ ] Color picker for colors
- [ ] Variants matrix auto-generate
- [ ] More specifications section

### Phase 5: Checkout Page
- [ ] 3-step checkout process
- [ ] Email verification (OTP)
- [ ] Shipping & billing details
- [ ] Payment method selection
- [ ] Coupon code (dynamic)
- [ ] Order success modal
- [ ] Email notification
- [ ] Auto-detect email for logged-in users

### Phase 6: URL Structure & Database
- [ ] URL structure changes (/collections/, /products/)
- [ ] Collections table (unified)
- [ ] Product slugs

---

## 🧪 TESTING COMMANDS

### Drizzle Kit Commands
```bash
# Push schema to database
npx drizzle-kit push

# Generate migration files
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate

# Seed database
npx tsx scripts/seed.ts
```

### Frontend Testing
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Testing
```bash
# Start backend server
cd server
npm run dev
```

---

## 📊 DATABASE TABLES SUMMARY

### New Tables
1. `warm_chapters` - Warm chapter cards
2. `collection_focus` - Collection in focus cards
3. `product_size_guides` - Per product size guides
4. `product_variants` - Product variants (size, color, price, stock)
5. `otp_verifications` - OTP for checkout
6. `coupon_codes` - Discount coupons
7. `collections` - Unified collections table

### Modified Tables
1. `products` - Add slug, colors (jsonb), specifications fields
2. `orders` - Add coupon_code, discount_amount, tracking_id

### Deleted Tables
1. `journal_entries` - Now static
2. `faqs` - Now static

---

## 🚀 DEPLOYMENT STEPS

1. **Database Setup**
   ```bash
   npx drizzle-kit push
   npx tsx scripts/seed.ts
   ```

2. **Backend Deployment**
   ```bash
   cd server
   npm run build
   # Deploy to hosting service
   ```

3. **Frontend Deployment**
   ```bash
   npm run build
   # Deploy dist folder
   ```

4. **Environment Variables**
   ```bash
   DATABASE_URL=your_neon_db_url
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE_API_KEY=your_email_api_key
   ```

---

## 📝 NOTES

- सभी data dynamic होगा (NeonDB से)
- Frontend और Admin panel दोनों connected होंगे
- Admin panel से changes frontend पर automatically reflect होंगे
- सभी tables Drizzle Kit के through test होंगी
- सभी features responsive होंगे
- सभी animations smooth होंगी

---

## 🎯 NEXT STEPS

1. Phase 1 implement करें
2. Test करें
3. Phase 2 implement करें
4. Test करें
5. Continue for all phases

---

**Good luck with implementation!** 🚀
