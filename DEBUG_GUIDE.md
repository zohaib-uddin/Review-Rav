# 🔧 RAVENZA - Debugging Guide

## Problem: 500 Internal Server Error

Agar tumhe `GET http://localhost:3001/api/products? 500 (Internal Server Error)` aa raha hai, toh ye steps follow karo:

---

## Step 1: Database Connection Test Karo

Terminal mein ye command run karo:

```bash
npx tsx scripts/test-db.ts
```

### Expected Output (Agar Sab Theek Hai):
```
🧪 Testing NeonDB Connection...

✅ DATABASE_URL found
📡 Connecting to: postgresql://neondb_owner...

🔍 Test 1: Basic database connection...
✅ Database connected! Current time: 2024-...

🔍 Test 2: Checking if tables exist...
✅ Found 10 tables:
   - cart_items
   - carts
   - categories
   - discounts
   - order_items
   - orders
   - products
   - reviews
   - users
   - wishlists

🔍 Test 3: Checking products...
✅ Found 8 products in database

🔍 Test 4: Checking categories...
✅ Found 6 categories in database

🔍 Test 5: Fetching sample products...
✅ Sample products:
   - Shadow Realm Co-Ord Set (Rs.4500)
   - Acid Wash Phantom Tee (Rs.2800)
   - Wide Leg Graphic Trouser (Rs.3200)

═══════════════════════════════════════
✅ ALL TESTS PASSED!
═══════════════════════════════════════
```

### Agar Error Aaye:

#### Error 1: "DATABASE_URL not found"
**Solution:** `.env` file check karo:
```
DATABASE_URL="postgresql://neondb_owner:npg_dW4UY9ieyQsB@ep-weathered-dew-ayfoquyg-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

#### Error 2: "No tables found"
**Solution:** Tables create karo:
```bash
npx drizzle-kit push
```

#### Error 3: "No active products found"
**Solution:** Data seed karo:
```bash
npx tsx scripts/seed.ts
```

#### Error 4: "Connection failed"
**Solution:** 
- Internet connection check karo
- NeonDB dashboard pe jaake verify karo ke project active hai
- Connection string sahi copy ki hai ya nahi

---

## Step 2: Backend Server Start Karo

```bash
cd server
npm run dev
```

### Expected Output:
```
🚀 Ravenza API Server running on http://localhost:3001
📦 Database: NeonDB connected
```

### Agar Error Aaye:

#### Error: "Cannot find module"
**Solution:** Dependencies install karo:
```bash
cd server
npm install
```

#### Error: "Port already in use"
**Solution:** `.env` file mein PORT change karo:
```
PORT=3002
```

---

## Step 3: Health Check Karo

Browser mein ye URL kholo:
```
http://localhost:3001/api/health
```

### Expected Response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2024-..."
}
```

### Agar Error Aaye:
- Backend server terminal mein error logs dekho
- Console mein red errors check karo

---

## Step 4: Products API Test Karo

Browser mein ye URL kholo:
```
http://localhost:3001/api/products
```

### Expected Response:
```json
[
  {
    "id": "uuid...",
    "name": "Shadow Realm Co-Ord Set",
    "slug": "shadow-realm-co-ord",
    "price": 4500,
    "salePrice": 3990,
    "image": "https://...",
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Black", "Charcoal"],
    ...
  },
  ...
]
```

### Agar 500 Error Aaye:
Backend server terminal mein error logs dekho. Common issues:

1. **Column not found** - Database schema match nahi kar raha
   - Solution: `npx drizzle-kit push` run karo
   
2. **Connection timeout** - Database slow hai
   - Solution: Retry karo ya NeonDB dashboard check karo

3. **Permission denied** - Database user ko permissions nahi hain
   - Solution: NeonDB dashboard pe roles check karo

---

## Step 5: Frontend Start Karo

Naya terminal kholo aur run karo:
```bash
npm run dev
```

### Browser Console Check Karo:
1. F12 dabao (Developer Tools)
2. Console tab pe jao
3. Dekho kya errors aa rahe hain

### Expected Console Logs:
```
🔄 Fetching products from API...
✅ Received 8 products from API
🔄 Fetching categories from API...
✅ Received 6 categories from API
```

### Agar Error Aaye:
- Network tab pe jao (F12 → Network)
- `/api/products` request pe click karo
- Response tab mein dekho kya error message hai

---

## Step 6: Common Issues & Solutions

### Issue 1: Products Show Nahi Ho Rahe
**Check:**
1. Backend server chal raha hai? (`cd server && npm run dev`)
2. Database mein products hain? (`npx tsx scripts/test-db.ts`)
3. Browser console mein koi error? (F12 → Console)
4. Network tab mein API call successful? (F12 → Network)

**Solution:**
```bash
# 1. Test database
npx tsx scripts/test-db.ts

# 2. Seed data if needed
npx tsx scripts/seed.ts

# 3. Restart backend
cd server
npm run dev

# 4. Restart frontend (new terminal)
npm run dev
```

### Issue 2: Categories Static/Dummy Hain
**Check:**
1. Categories API call ho rahi hai? (Network tab)
2. Response mein kya aa raha hai?

**Solution:**
- Store mein `fetchCategories()` call ho rahi hai ya nahi check karo
- Component mein `useEffect` mein `fetchCategories()` call karo

### Issue 3: Admin Panel Mein Products Nahi Dikh Rahe
**Check:**
1. Admin login successful hai?
2. Admin panel component mein `fetchProducts()` call ho rahi hai?

**Solution:**
- AdminPanel.tsx mein `useEffect` check karo
- Console mein errors dekho

---

## Step 7: Full Debug Checklist

Run this checklist one by one:

```bash
# 1. Test database connection
npx tsx scripts/test-db.ts

# 2. Check .env file
cat .env | grep DATABASE_URL

# 3. Install all dependencies
npm install
cd server && npm install && cd ..

# 4. Push schema to database
npx drizzle-kit push

# 5. Seed initial data
npx tsx scripts/seed.ts

# 6. Start backend server
cd server
npm run dev
# (Keep this running in one terminal)

# 7. In NEW terminal - Start frontend
npm run dev

# 8. Test health endpoint
# Open browser: http://localhost:3001/api/health

# 9. Test products endpoint
# Open browser: http://localhost:3001/api/products

# 10. Open frontend
# Open browser: http://localhost:5173
```

---

## Step 8: If Nothing Works

### Complete Reset:

```bash
# 1. Delete node_modules
rm -rf node_modules
rm -rf server/node_modules

# 2. Reinstall everything
npm install
cd server && npm install && cd ..

# 3. Clear browser cache
# Ctrl+Shift+Delete (Chrome)

# 4. Restart everything
cd server && npm run dev
# (New terminal)
npm run dev
```

---

## 📞 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npx tsx scripts/test-db.ts` | Test database connection |
| `npx drizzle-kit push` | Push schema to database |
| `npx tsx scripts/seed.ts` | Seed initial data |
| `cd server && npm run dev` | Start backend server |
| `npm run dev` | Start frontend |
| `curl http://localhost:3001/api/health` | Test health endpoint |
| `curl http://localhost:3001/api/products` | Test products endpoint |

---

## 🎯 Expected Flow

1. ✅ Database connected (NeonDB)
2. ✅ Tables created (drizzle-kit push)
3. ✅ Data seeded (seed.ts)
4. ✅ Backend server running (port 3001)
5. ✅ Frontend running (port 5173)
6. ✅ API calls successful (check Network tab)
7. ✅ Products showing on frontend
8. ✅ Categories showing on frontend
9. ✅ Admin panel working
10. ✅ Dynamic data from NeonDB

---

## 🔍 Debug Commands

```bash
# Check if server is running
netstat -ano | findstr :3001

# Check if frontend is running
netstat -ano | findstr :5173

# Test API with curl
curl http://localhost:3001/api/health
curl http://localhost:3001/api/products
curl http://localhost:3001/api/categories
```

---

## 📝 Important Notes

1. **Backend server MUST be running** before frontend can fetch data
2. **Database MUST have data** - run seed script if empty
3. **Check console logs** - both backend and frontend
4. **Check Network tab** - see API responses
5. **Check .env file** - DATABASE_URL must be correct

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ `test-db.ts` shows "ALL TESTS PASSED"
- ✅ Backend server shows "Database: NeonDB connected"
- ✅ `/api/health` returns `{"status": "ok"}`
- ✅ `/api/products` returns array of products
- ✅ Frontend console shows "✅ Received X products from API"
- ✅ Products visible on http://localhost:5173
- ✅ Admin panel shows products from database

---

**Agar abhi bhi issue hai, toh:**
1. Backend server terminal ka screenshot lo
2. Frontend browser console ka screenshot lo
3. Network tab mein API response ka screenshot lo
4. Ye sab share karo, main help kar dunga! 🚀
