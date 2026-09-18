# 🖤 RAVENZA - Premium Streetwear E-Commerce

Full-stack e-commerce website built with React, Vite, Tailwind CSS, NeonDB, and Drizzle ORM.

---

## 📥 DOWNLOAD & SETUP INSTRUCTIONS

### Method 1: Download from Preview (Recommended)

1. **Download the ZIP file** from the preview page
2. **Extract the ZIP** - Right click → Extract All (Windows) or Double-click (Mac)
3. **Open VS Code**:
   - Open VS Code
   - Go to `File` → `Open Folder`
   - Select the extracted folder
   - Click "Select Folder"

### Method 2: If ZIP has only one file

Sometimes the download gives only `index.html`. In that case:

1. Create a new folder on your computer called `ravenza`
2. Open VS Code
3. Go to `File` → `Open Folder` → Select `ravenza` folder
4. Open Terminal in VS Code (`Ctrl + ~` or `View` → `Terminal`)
5. Copy-paste all the files from this project manually

---

## 🚀 RUNNING THE PROJECT

### Step 1: Install Dependencies

Open terminal in VS Code and run:

```bash
npm install
```

### Step 2: Install Backend Dependencies

```bash
npm install express cors @neondatabase/serverless jsonwebtoken bcrypt dotenv
npm install -D @types/express @types/cors @types/jsonwebtoken @types/bcrypt tsx
```

### Step 3: Setup Environment Variables

The `.env` file is already created. Make sure it has:

```
DATABASE_URL="postgresql://neondb_owner:npg_dW4UY9ieyQsB@ep-weathered-dew-ayfoquyg-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
VITE_API_URL=http://localhost:3001/api
JWT_SECRET="your-secret-key-here"
PORT=3001
```

### Step 4: Push Schema to NeonDB (Drizzle Kit)

```bash
npx drizzle-kit push
```

This will create all tables in your NeonDB database. **Your data won't be lost** - it only creates tables if they don't exist.

### Step 5: Seed Initial Data

```bash
npx tsx scripts/seed.ts
```

This will add:
- 6 categories
- 8 products with images
- 1 admin user (admin@ravenza.pk / admin123)
- Sample reviews

### Step 6: Start Backend Server

```bash
npx tsx server/index.ts
```

You should see:
```
🚀 Ravenza API Server running on http://localhost:3001
📦 Database: NeonDB connected
```

### Step 7: Start Frontend (New Terminal)

Open a NEW terminal in VS Code (`Ctrl + Shift + ~`) and run:

```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 8: Open in Browser

Go to `http://localhost:5173/`

---

## 🔐 ADMIN PANEL ACCESS

- **URL**: `http://localhost:5173/admin`
- **Email**: `admin@ravenza.pk`
- **Password**: `admin123`

---

## 📋 DRIZZLE KIT COMMANDS

| Command | Description |
|---------|-------------|
| `npx drizzle-kit push` | Push schema to database (safe, won't delete data) |
| `npx drizzle-kit generate` | Generate SQL migration files |
| `npx drizzle-kit migrate` | Run migrations |
| `npx drizzle-kit studio` | Open visual database editor |

### ⚠️ IMPORTANT: Never lose your data!

- `npx drizzle-kit push` is SAFE - it only adds/updates tables, never deletes data
- `npx drizzle-kit generate` creates migration files in `./drizzle` folder
- Always backup your database before running destructive commands

---

## 📁 PROJECT STRUCTURE

```
ravenza/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── admin/
│   │       └── ProductForm.tsx    # 6-step product form
│   ├── pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── CustomerDashboard.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── FAQ.tsx
│   │   ├── SizeGuide.tsx
│   │   ├── TrackOrder.tsx
│   │   └── admin/
│   │       └── AdminPanel.tsx
│   ├── store/
│   │   └── useStore.ts    # Zustand state management
│   ├── services/
│   │   └── api.ts         # API service layer
│   ├── db/
│   │   └── schema.ts      # Drizzle schema (matches NeonDB)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/
│   └── index.ts           # Express API server
├── scripts/
│   └── seed.ts            # Database seed script
├── .env                   # Environment variables
├── drizzle.config.ts      # Drizzle configuration
├── package.json
├── vite.config.js
└── tsconfig.json
```

---

## 🗄️ DATABASE (NeonDB)

### Connection String:
```
postgresql://neondb_owner:npg_dW4UY9ieyQsB@ep-weathered-dew-ayfoquyg-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Tables:
- `users` - User accounts (customers & admins)
- `categories` - Product categories
- `products` - All products with full details
- `orders` - Customer orders
- `order_items` - Items in each order
- `carts` - User shopping carts
- `cart_items` - Items in cart
- `reviews` - Product reviews
- `wishlists` - User wishlists
- `discounts` - Discount codes
- `audit_logs` - Admin activity logs

---

## 🎯 FEATURES

### Frontend (Customer):
- ✅ Hero carousel with 5 slides
- ✅ Product browsing with filters
- ✅ Product detail with image gallery
- ✅ Quick view modal
- ✅ Shopping cart
- ✅ Checkout with COD/Bank Transfer
- ✅ Order tracking
- ✅ Wishlist
- ✅ Customer dashboard
- ✅ Size guide
- ✅ FAQ page
- ✅ Contact form

### Admin Panel:
- ✅ Dashboard with stats
- ✅ 6-step product creation form
- ✅ Inventory management
- ✅ Order management
- ✅ Customer management
- ✅ Review moderation
- ✅ Discount codes
- ✅ SEO settings
- ✅ Audit logs
- ✅ General settings

### Backend:
- ✅ RESTful API
- ✅ JWT authentication
- ✅ NeonDB integration
- ✅ Drizzle ORM
- ✅ CORS enabled
- ✅ Admin-only routes

---

## 🔧 TROUBLESHOOTING

### "Cannot find module" errors:
```bash
npm install
```

### Database connection error:
- Check `.env` file has correct `DATABASE_URL`
- Make sure NeonDB project is active

### Port already in use:
```bash
# Change PORT in .env to 3002 or another port
```

### Frontend not connecting to backend:
- Make sure backend is running on port 3001
- Check `VITE_API_URL` in `.env` is `http://localhost:3001/api`

---

## 📞 SUPPORT

For any issues, contact: support@ravenza.pk

---

**Built with ❤️ by Ravenza Team**
