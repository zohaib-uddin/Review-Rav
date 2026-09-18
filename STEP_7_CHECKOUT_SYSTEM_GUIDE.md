# Step 7: Checkout System, OTP via Nginx, Emails & User Dashboard

## Overview
This guide covers the complete implementation of a 3-Step Checkout system with OTP verification via Nginx + WebScript, automatic account creation, User Dashboard, and Admin Order Management. All data is stored in Neon DB using Drizzle ORM.

---

## Table of Contents
1. [Database Schema](#1-database-schema)
2. [Checkout Page (3-Step Flow)](#2-checkout-page-3-step-flow)
3. [OTP Verification Flow](#3-otp-verification-flow)
4. [Auto Account Creation & Order Success](#4-auto-account-creation--order-success)
5. [User Dashboard](#5-user-dashboard)
6. [Admin Panel - Orders Management](#6-admin-panel---orders-management)
7. [Security & Validation Rules](#7-security--validation-rules)
8. [File Structure](#8-file-structure)

---

## 1. Database Schema

### Tables Required

#### `users` table
```typescript
{
  id: text (primary key, UUID)
  email: text (unique, not null)
  password_hash: text (not null) // Only this column, remove 'password' if exists
  name: text
  phone: text
  created_at: timestamp
  updated_at: timestamp
}
```

**IMPORTANT:** Remove duplicate `password` column if it exists. Only keep `password_hash`.

#### `addresses` table
```typescript
{
  id: text (primary key, UUID)
  user_id: text (foreign key -> users.id)
  country: text (default: 'Pakistan')
  province: text
  city: text
  postal_code: text
  street_address: text
  phone: text
  is_default: boolean (default: false)
  address_type: text ('shipping' | 'billing')
  created_at: timestamp
  updated_at: timestamp
}
```

#### `orders` table
```typescript
{
  id: text (primary key, UUID)
  order_number: text (unique, e.g., 'ORD-2024-001234')
  tracking_id: text (unique, e.g., 'TRK-ABC123XYZ')
  user_id: text (foreign key -> users.id, nullable for guest orders)
  email: text (not null)
  status: text (default: 'pending', enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
  payment_status: text (default: 'unpaid', enum: 'paid', 'unpaid')
  subtotal: numeric
  shipping_cost: numeric
  tax: numeric
  total: numeric
  shipping_address_id: text (foreign key -> addresses.id)
  billing_address_id: text (foreign key -> addresses.id, nullable)
  order_notes: text
  shipping_method: text ('standard' | 'express')
  created_at: timestamp
  updated_at: timestamp
}
```

#### `order_items` table
```typescript
{
  id: text (primary key, UUID)
  order_id: text (foreign key -> orders.id)
  product_id: text (foreign key -> products.id)
  variant_id: text (foreign key -> variants.id, nullable)
  quantity: integer
  price: numeric
  created_at: timestamp
}
```

#### `otp_verifications` table
```typescript
{
  id: text (primary key, UUID)
  email: text (not null)
  otp_code: text (not null, 6 digits) // Only this column, remove 'otp' if exists
  expires_at: timestamp (10 minutes from creation)
  is_used: boolean (default: false)
  created_at: timestamp
}
```

**IMPORTANT:** Remove duplicate `otp` column if it exists. Only keep `otp_code`.

---

## 2. Checkout Page (3-Step Flow)

### Step 1: Email & OTP Verification

#### UI Components:
- Email input field (required, email validation)
- "Send OTP" button (disabled until valid email entered)
- OTP input field (6 digits, auto-focus after OTP sent)
- "Verify OTP" button
- Resend OTP link (enabled after 60 seconds)
- Progress indicator showing Step 1 of 3

#### Flow:
1. User enters email address
2. Clicks "Send OTP" button
3. Frontend calls API: `POST /api/checkout/send-otp`
   ```json
   {
     "email": "user@example.com"
   }
   ```
4. Backend generates 6-digit OTP, stores in `otp_verifications` table with 10-minute expiry
5. Backend calls WebScript API via Nginx to send email
6. User receives OTP email
7. User enters OTP
8. Frontend calls API: `POST /api/checkout/verify-otp`
   ```json
   {
     "email": "user@example.com",
     "otp_code": "123456"
   }
   ```
9. If valid, Step 2 unlocks automatically

#### API Endpoints:
- `POST /api/checkout/send-otp` - Send OTP to email
- `POST /api/checkout/verify-otp` - Verify OTP code

---

### Step 2: Shipping & Billing Address

#### UI Components:

**Shipping Address Form:**
- Country dropdown (default: "Pakistan", read-only)
- Province dropdown (Pakistani provinces: Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Gilgit-Baltistan, Azad Kashmir)
- City dropdown (dynamically populated based on province, major Pakistani cities)
- Postal code input (5 digits, required)
- Street address textarea (required)
- Phone number input (strict Pakistani format: 03XX-XXXXXXX, required)
- Order Notes textarea (required, min 10 characters)
- "Save this address" checkbox (checked by default)

**Billing Address Section:**
- "Billing same as shipping" checkbox (checked by default)
- When unchecked, show billing address form (same fields as shipping)

#### Validation Rules:
- Phone: Must match regex `^03[0-9]{2}-[0-9]{7}$` or `^03[0-9]{9}$`
- Postal code: Exactly 5 digits
- All fields required except when billing is same as shipping
- Order notes: Minimum 10 characters

#### Data Flow:
1. User fills shipping address
2. If "Billing same as shipping" is checked, billing address = shipping address
3. If unchecked, user fills separate billing address
4. Form data stored in frontend state (not saved to DB yet)
5. "Continue to Payment" button enables when all validations pass

---

### Step 3: Shipping Method & Payment

#### UI Components:

**Shipping Options:**
- Standard Delivery (Rs. 300) - 5-7 business days
- Express Delivery (Rs. 600) - 2-3 business days
- Radio button selection (required)

**Order Summary (Right Sidebar):**
- List of items in cart (image, name, variant, quantity, price)
- Subtotal
- Shipping cost (updates dynamically based on selection)
- Tax (calculated based on location)
- Total (auto-updates)

**Payment Method:**
- Cash on Delivery (COD) - Default and only option for now
- Payment instructions displayed

**Place Order Button:**
- Shows loading state during processing
- Disabled until all steps completed

#### Order Placement Flow:
1. User selects shipping method
2. Clicks "Place Order"
3. Frontend calls API: `POST /api/checkout/place-order`
   ```json
   {
     "email": "user@example.com",
     "shipping_address": { ... },
     "billing_address": { ... },
     "shipping_method": "standard|express",
     "order_notes": "...",
     "cart_items": [...]
   }
   ```
4. Backend:
   - Checks if user exists in `users` table by email
   - If not exists, creates new user account automatically
   - Saves shipping and billing addresses to `addresses` table
   - Creates order in `orders` table with unique order_number and tracking_id
   - Creates order items in `order_items` table
   - Marks OTP as used in `otp_verifications` table
   - Sends order confirmation email via WebScript API
5. Returns order details including order_number and tracking_id
6. Frontend shows success modal and redirects to User Dashboard

---

## 3. OTP Verification Flow

### Architecture:
```
Frontend → Nginx (Reverse Proxy) → WebScript API → Email Service
                     ↓
              Neon DB (Store OTP)
```

### Nginx Configuration:
```nginx
location /api/webscript/ {
    proxy_pass https://api.webscript.io/;
    proxy_set_header Host api.webscript.io;
    proxy_set_header X-API-Key $webscript_api_key;
    proxy_set_header Content-Type application/json;
}
```

### WebScript API Integration:

#### Send OTP Email:
```javascript
// Backend API: /api/checkout/send-otp
async function sendOTP(email: string) {
  // Generate 6-digit OTP
  const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store in DB with 10-minute expiry
  await db.insert(otp_verifications).values({
    email,
    otp_code,
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
    is_used: false
  });
  
  // Call WebScript API via Nginx
  const response = await fetch('http://localhost/api/webscript/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.WEBSCRIPT_API_KEY
    },
    body: JSON.stringify({
      to: email,
      template: 'otp_verification',
      data: { otp_code, expiry_minutes: 10 }
    })
  });
  
  return { success: true };
}
```

#### Verify OTP:
```javascript
// Backend API: /api/checkout/verify-otp
async function verifyOTP(email: string, otp_code: string) {
  const record = await db.query.otp_verifications.findFirst({
    where: and(
      eq(otp_verifications.email, email),
      eq(otp_verifications.otp_code, otp_code),
      eq(otp_verifications.is_used, false),
      gt(otp_verifications.expires_at, new Date())
    )
  });
  
  if (!record) {
    throw new Error('Invalid or expired OTP');
  }
  
  // Mark as used
  await db.update(otp_verifications)
    .set({ is_used: true })
    .where(eq(otp_verifications.id, record.id));
  
  return { success: true, verified: true };
}
```

### Security Measures:
- OTP expires after 10 minutes
- OTP can only be used once
- Rate limiting: Max 3 OTP requests per email per hour
- OTP not returned in API responses
- OTP stored as hash in production (optional)

---

## 4. Auto Account Creation & Order Success

### Auto Account Creation Logic:

```javascript
// During order placement
async function placeOrder(orderData: OrderData) {
  const { email, shipping_address, ... } = orderData;
  
  // Check if user exists
  let user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  
  if (!user) {
    // Auto-create account with random password
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const password_hash = await bcrypt.hash(randomPassword, 10);
    
    user = await db.insert(users).values({
      email,
      password_hash,
      name: shipping_address.full_name,
      phone: shipping_address.phone
    }).returning();
  }
  
  // Continue with order creation...
}
```

### Order Success Modal:

#### UI Components:
- Success icon/checkmark animation
- Order confirmation message
- Order Number (clickable to copy)
- Tracking ID (clickable to copy)
- "View Order Details" button
- "Continue Shopping" button
- Auto-redirect to Dashboard after 5 seconds

#### Email Notification:
Sent via WebScript API immediately after order placement:
- Order confirmation
- Order summary
- Tracking information
- Expected delivery date
- Customer support contact

### Redirect Flow:
1. Order successfully placed
2. Show success modal (2-3 seconds)
3. Automatically redirect to `/dashboard/orders`
4. Clear cart from localStorage/sessionStorage

---

## 5. User Dashboard

### Dashboard Layout:
- Sidebar navigation (responsive, collapsible on mobile)
- Main content area
- User profile summary in header
- Breadcrumbs for navigation

### 5.1 Orders Page (`/dashboard/orders`)

#### Orders List:
- Table/Grid view of all user's orders
- Columns: Order #, Date, Status, Total, Actions
- Status badges with color coding:
  - Pending: Yellow
  - Processing: Blue
  - Shipped: Purple
  - Delivered: Green
  - Cancelled: Red
- Pagination (10 orders per page)
- Search by order number
- Filter by status

#### Order Detail Page (`/dashboard/orders/[order_id]`):
- Read-only view of complete order
- Order information section:
  - Order number
  - Order date
  - Status with progress bar
  - Tracking ID
- Items list:
  - Product images
  - Names and variants
  - Quantities and prices
- Shipping address
- Billing address
- Order summary (subtotal, shipping, tax, total)
- Order notes
- **Download Invoice PDF** button

#### Invoice PDF Generation:
- Generated on-the-fly or pre-generated
- Includes:
  - Company logo and details
  - Order details
  - Itemized list
  - Addresses
  - Payment information
  - Terms and conditions
- Downloaded as `[order_number]-invoice.pdf`

---

### 5.2 Order Tracking Page (`/dashboard/tracking/[order_id]`)

#### Public vs Private:
- Public URL exists but requires login to view details
- Users can only track their own orders (security check)
- Admin can track any order

#### Progress Bar:
Visual representation of order status:
```
[Pending] → [Processing] → [Shipped] → [Delivered]
   ●           ○              ○            ○
```

#### Tracking Information:
- Current status
- Status history with timestamps
- Expected delivery date
- Tracking updates/messages
- Contact support option

#### Security Check:
```javascript
// Middleware/API check
async function canTrackOrder(userId: string, orderId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId)
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Check if user owns this order OR is admin
  if (order.user_id !== userId && !isAdmin(userId)) {
    throw new Error('Unauthorized: You can only track your own orders');
  }
  
  return true;
}
```

---

### 5.3 Addresses Page (`/dashboard/addresses`)

#### Features:
- List all saved addresses
- Add new address
- Edit existing address
- Delete address (with confirmation)
- Set default address
- Visual indicator for default address

#### Address Card UI:
```
┌─────────────────────────────────┐
│ 🏠 Home (Default)               │
│ John Doe                        │
│ 123 Main Street                 │
│ Lahore, Punjab 54000            │
│ Pakistan                        │
│ Phone: 0300-1234567             │
│                                 │
│ [Edit] [Delete] [Set Default]   │
└─────────────────────────────────┘
```

#### CRUD Operations:

**Add Address:**
- Form with same fields as checkout
- "Set as default" checkbox
- Address type selector (Shipping/Billing/Both)

**Edit Address:**
- Pre-filled form
- Update validation
- Save changes

**Delete Address:**
- Confirmation dialog
- Cannot delete if it's the only address
- Cannot delete if it's associated with active orders

**Set as Default:**
- Only one default address per user
- Updates `is_default` flag in DB
- Previous default becomes non-default

#### API Endpoints:
- `GET /api/user/addresses` - Get all addresses
- `POST /api/user/addresses` - Add new address
- `PUT /api/user/addresses/:id` - Update address
- `DELETE /api/user/addresses/:id` - Delete address
- `POST /api/user/addresses/:id/set-default` - Set as default

---

### 5.4 Wishlist Page (`/dashboard/wishlist`)

#### Features:
- Grid/List view of wishlist items
- Product image, name, price
- Variant information (if applicable)
- Stock status indicator
- "Add to Cart" button
- "Remove from Wishlist" button
- "Move to Cart" option
- Empty state with "Continue Shopping" CTA

#### Sync with Cart:
- Items in wishlist that are added to cart show indicator
- Out of stock items show notification

---

### 5.5 Settings Page (`/dashboard/settings`)

#### Profile Settings:
- **Name**: Editable text input
- **Email**: Read-only (cannot be changed)
- **Phone**: Editable with Pakistani validation
- **Profile Picture**: Upload/change (optional)
- **Change Password**: Current password + new password fields

#### Preferences:
- Newsletter subscription toggle
- SMS notifications toggle
- Email notifications toggle

#### Save Changes:
- Validation on submit
- Success/error messages
- Auto-refresh profile data after update

#### API Endpoints:
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update profile (name, phone only)
- `PUT /api/user/change-password` - Change password

---

## 6. Admin Panel - Orders Management

### 6.1 Orders List Page (`/admin/orders`)

#### Features:
- Comprehensive orders table
- Columns: Order #, Customer, Date, Status, Payment, Total, Actions
- Advanced filtering:
  - By status (multi-select)
  - By payment status
  - By date range
  - By customer email
- Search by order number, customer name, email
- Export to CSV/Excel
- Bulk actions (update status, export)
- Pagination with customizable page size

#### Quick Stats Cards:
- Total Orders (today, week, month)
- Pending Orders count
- Revenue (today, week, month)
- Average Order Value

---

### 6.2 Order Detail Page (`/admin/orders/[order_id]`)

#### Order Information Section:
- Order number (editable with validation)
- Order date & time
- Customer information (linked to customer profile)
- Order status dropdown
- Payment status dropdown

#### Status Management:

**Order Status Dropdown:**
- Pending
- Processing
- Shipped
- Delivered
- Cancelled

**Payment Status Dropdown:**
- Paid
- Unpaid

#### Status Change Flow:
1. Admin selects new status from dropdown
2. Clicks "Update Status" button
3. Backend validates status transition rules
4. Updates order in Neon DB
5. Optionally sends email notification to customer
6. Frontend reflects changes immediately

#### Status Transition Rules:
```
Pending → Processing ✓
Pending → Cancelled ✓
Processing → Shipped ✓
Processing → Cancelled ✓
Shipped → Delivered ✓
Shipped → Cancelled ✗ (must be returned first)
Delivered → Cancelled ✗
Cancelled → Any ✗ (terminal state)
```

#### Order Items Section:
- Complete list of items
- Product details with thumbnails
- Quantity and price
- Subtotal per item

#### Addresses Section:
- Shipping address (read-only)
- Billing address (read-only)
- Option to edit addresses (admin only)

#### Order Notes:
- Customer notes (read-only)
- Admin internal notes (add/edit)
- Timeline of order activities

#### Actions:
- Download Invoice PDF
- Print Order
- Send Email to Customer
- Refund (future feature)
- Create Return (future feature)

---

### 6.3 API Endpoints for Admin:

- `GET /api/admin/orders` - List all orders with filters
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id/status` - Update order status
  ```json
  {
    "status": "processing",
    "payment_status": "paid",
    "notify_customer": true
  }
  ```
- `PUT /api/admin/orders/:id/notes` - Add admin note
- `DELETE /api/admin/orders/:id` - Cancel/delete order (with restrictions)
- `GET /api/admin/orders/export` - Export orders to CSV

---

## 7. Security & Validation Rules

### Authentication Requirements:
- Checkout: Email + OTP verification (no password required initially)
- User Dashboard: JWT-based authentication required
- Admin Panel: Role-based access control (RBAC)

### Input Validation:

#### Email:
- Valid email format
- Lowercase normalization
- Max 255 characters

#### Phone (Pakistani):
- Format: `03XX-XXXXXXX` or `03XXXXXXXXX`
- Regex: `^03[0-9]{2}-?[0-9]{7}$`
- Must start with 03

#### Postal Code:
- Exactly 5 digits
- Numeric only

#### OTP:
- Exactly 6 digits
- Numeric only
- Expires in 10 minutes
- Single use only

### Authorization Rules:
- Users can only view/edit their own data
- Users can only track their own orders
- Admins can view/manage all orders
- OTP can only be verified by the email it was sent to

### Rate Limiting:
- OTP requests: Max 3 per email per hour
- Order placement: Max 5 orders per minute per IP
- Login attempts: Max 5 per 15 minutes

### Data Protection:
- Passwords hashed with bcrypt (cost factor 10+)
- JWT tokens with short expiry (15 minutes access, 7 days refresh)
- HTTPS enforced in production
- Sensitive data encrypted at rest

---

## 8. File Structure

```
src/
├── app/
│   ├── (frontend)/
│   │   ├── checkout/
│   │   │   ├── page.tsx                 # Main checkout page (3 steps)
│   │   │   └── success/
│   │   │       └── page.tsx             # Order success page
│   │   └── dashboard/
│   │       ├── layout.tsx               # Dashboard layout with sidebar
│   │       ├── page.tsx                 # Dashboard home
│   │       ├── orders/
│   │       │   ├── page.tsx             # Orders list
│   │       │   └── [orderId]/
│   │       │       └── page.tsx         # Order detail
│   │       ├── tracking/
│   │       │   └── [orderId]/
│   │       │       └── page.tsx         # Order tracking
│   │       ├── addresses/
│   │       │   └── page.tsx             # Addresses CRUD
│   │       ├── wishlist/
│   │       │   └── page.tsx             # Wishlist
│   │       └── settings/
│   │           └── page.tsx             # User settings
│   └── (admin)/
│       └── admin/
│           ├── orders/
│           │   ├── page.tsx             # Admin orders list
│           │   └── [orderId]/
│           │       └── page.tsx         # Admin order detail
│           └── layout.tsx               # Admin layout
├── api/
│   ├── checkout/
│   │   ├── send-otp/
│   │   │   └── route.ts
│   │   ├── verify-otp/
│   │   │   └── route.ts
│   │   └── place-order/
│   │       └── route.ts
│   └── user/
│       ├── profile/
│       │   └── route.ts
│       ├── addresses/
│       │   └── route.ts
│       └── wishlist/
│           └── route.ts
├── components/
│   ├── checkout/
│   │   ├── step-1-email-otp.tsx
│   │   ├── step-2-address.tsx
│   │   ├── step-3-payment.tsx
│   │   ├── order-summary.tsx
│   │   └── success-modal.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── orders-list.tsx
│   │   ├── order-detail.tsx
│   │   ├── tracking-progress.tsx
│   │   ├── addresses-crud.tsx
│   │   ├── wishlist-grid.tsx
│   │   └── settings-form.tsx
│   └── admin/
│       ├── orders-table.tsx
│       ├── order-status-dropdown.tsx
│       └── order-detail-admin.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                  # Drizzle schema (updated)
│   │   └── index.ts                   # DB connection
│   ├── otp/
│   │   ├── generate.ts                # OTP generation
│   │   └── verify.ts                  # OTP verification
│   ├── webscript/
│   │   └── email-client.ts            # WebScript API client
│   ├── auth/
│   │   ├── jwt.ts                     # JWT utilities
│   │   └── middleware.ts              # Auth middleware
│   └── validators/
│       ├── checkout.ts                # Checkout validation
│       └── pakistani-data.ts          # Pakistani cities, provinces
├── types/
│   ├── order.ts
│   ├── user.ts
│   └── address.ts
└── middleware.ts                       # Global middleware (auth, rate limiting)
```

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Update Drizzle schema with all tables
- [ ] Remove duplicate columns (`otp`, `password`)
- [ ] Run migrations on Neon DB
- [ ] Seed Pakistani provinces and cities

### Phase 2: Checkout Flow
- [ ] Build Step 1: Email + OTP UI
- [ ] Implement OTP send/verify APIs
- [ ] Integrate WebScript email service via Nginx
- [ ] Build Step 2: Address form with validation
- [ ] Build Step 3: Shipping + Payment
- [ ] Implement place-order API
- [ ] Auto account creation logic
- [ ] Success modal and redirect

### Phase 3: User Dashboard
- [ ] Dashboard layout and navigation
- [ ] Orders list page
- [ ] Order detail page with invoice download
- [ ] Order tracking page with security checks
- [ ] Addresses CRUD functionality
- [ ] Wishlist page
- [ ] Settings page with validation

### Phase 4: Admin Panel
- [ ] Admin orders list with filters
- [ ] Admin order detail page
- [ ] Status update functionality
- [ ] Email notifications on status change

### Phase 5: Testing & Security
- [ ] Unit tests for OTP logic
- [ ] Integration tests for checkout flow
- [ ] Security audit (auth, authorization, input validation)
- [ ] Performance optimization
- [ ] Mobile responsiveness testing

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# WebScript API
WEBSCRIPT_API_KEY=your_webscript_api_key
WEBSCRIPT_API_URL=https://api.webscript.io

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email Templates
OTP_EMAIL_TEMPLATE_ID=otp_verification
ORDER_CONFIRMATION_TEMPLATE_ID=order_confirmation

# Rate Limiting
OTP_RATE_LIMIT=3
OTP_RATE_WINDOW=3600000

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Notes

1. **Duplicate Column Fix**: Ensure `otp_verifications` table only has `otp_code` (not `otp`), and `users` table only has `password_hash` (not `password`).

2. **Nginx Configuration**: Properly configure Nginx as reverse proxy for WebScript API to avoid CORS issues.

3. **Pakistani Data**: Use accurate lists of Pakistani provinces, cities, and phone number formats.

4. **Guest to Registered User**: Auto-account creation should happen seamlessly without user intervention.

5. **Invoice PDF**: Use libraries like `@react-pdf/renderer` or `pdfkit` for PDF generation.

6. **Real-time Updates**: Consider using Server-Sent Events (SSE) or WebSockets for real-time order status updates.

7. **Error Handling**: Implement comprehensive error handling with user-friendly messages.

8. **Logging**: Log all critical operations (OTP sent, order placed, status changes) for auditing.

---

## Version History

- **v1.0** (Current): Initial comprehensive guide for Step 7 implementation

---

*This guide is part of the E-commerce Platform Development Series. Follow each step carefully for successful implementation.*
