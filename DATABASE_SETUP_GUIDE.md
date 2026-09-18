# 🚀 RAVENZA - Complete Database Setup Guide

## ✅ WHAT'S INCLUDED IN THE SEED

### All 13 Tables Will Have Data:

1. **categories** (11 records)
   - 6 main categories + 5 subcategories
   - All fields populated: name, slug, description, badge, tag, cover_image_url, sort_order, is_active

2. **products** (9 records)
   - Complete product data with ALL fields
   - No null values in required fields
   - Includes: name, slug, description, prices, category_id, fabric details, fit, SKU, flags, images, attributes, etc.

3. **collections** (3 records)
   - Winter Essentials, Streetwear Classics, New Arrivals
   - All display flags set: show_in_focus, show_explore_banner, etc.

4. **collection_products** (multiple records)
   - Products linked to collections
   - Proper sort_order and is_active flags

5. **journal_entries** (3 records)
   - Blog posts with title, subtitle, content, featured_image, category, author, published_date

6. **faqs** (6 records)
   - Common questions with answers, categories, display_order

7. **users** (6 records)
   - 1 admin + 5 customers
   - All fields: email, name, phone, role, is_verified, is_active, password

8. **reviews** (8 records)
   - Product reviews with ratings, comments, is_approved status

9. **newsletter_subscribers** (8 records)
   - Email subscribers with is_active status

10. **orders** (5 records)
    - Complete order data with different statuses
    - All fields: order_number, user_id, status, prices, shipping_address, tracking_number, etc.

11. **order_items** (multiple records)
    - Items within each order
    - All fields: product details, quantity, prices, size, color

12. **discounts** (4 records)
    - Discount codes with type, value, usage limits, dates
    - All fields populated

13. **audit_logs** (5 records)
    - System activity logs
    - All fields: entity_type, entity_id, action, performed_by, changes, ip_address, user_agent

---

## 🎯 ZERO NULL/EMPTY COLUMNS

Every single table and column will have data. No null values in required fields.

---

## 📋 SETUP STEPS

### Step 1: Push Schema to Database
```bash
npx drizzle-kit push
```

This creates all 13 tables in your NeonDB database.

### Step 2: Run Seed Script
```bash
npx tsx scripts/seed.ts
```

This populates ALL tables with realistic data.

### Step 3: Verify Database
```bash
npx tsx scripts/test-db.ts
```

This shows you what data was created.

### Step 4: Start Backend Server
```bash
cd server
npm run dev
```

Server runs on `http://localhost:3001`

### Step 5: Start Frontend
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🔐 LOGIN CREDENTIALS

### Admin Panel
- **URL**: `http://localhost:5173/admin`
- **Email**: `admin@ravenza.pk`
- **Password**: `admin123`

### Customer Accounts (for testing)
- **Email**: `ahmed.khan@gmail.com`
- **Password**: `customer123`

- **Email**: `sara.ali@gmail.com`
- **Password**: `customer123`

(And 3 more customer accounts)

---

## 📊 EXPECTED DATA COUNTS

After running seed script, you should see:

```
✅ DATABASE SEEDING COMPLETE!

📊 Summary:
   • Categories: 11
   • Products: 9
   • Collections: 3
   • Collection Products: 15-20
   • Journal Entries: 3
   • FAQs: 6
   • Users: 6
   • Reviews: 8
   • Newsletter Subscribers: 8
   • Orders: 5
   • Order Items: 10-15
   • Discounts: 4
   • Audit Logs: 5
```

---

## 🎨 SAMPLE DATA HIGHLIGHTS

### Products Include:
- Shadow Realm Co-Ord Set (Rs. 4,500)
- Acid Wash Phantom Tee (Rs. 2,800)
- Wide Leg Graphic Trouser (Rs. 3,200)
- Urban Drift Trackpants (Rs. 2,900)
- Neon Pulse Graphic Shorts (Rs. 2,200)
- Reaper X Graphic Co-Ord (Rs. 4,800)
- Denim Jacket - Raven Black (Rs. 3,990)
- Classic Pullover Hoodie (Rs. 2,500)
- Midnight Vortex Co-Ord (Rs. 4,800)

### Orders Include:
- Different statuses: delivered, shipped, processing, confirmed, pending
- Real customer addresses in Lahore, Karachi, Islamabad
- Tracking numbers for shipped orders
- Discount codes applied

### Discount Codes:
- `WELCOME10` - 10% off (min Rs. 2,000)
- `FLAT500` - Rs. 500 off (min Rs. 3,000)
- `SUMMER25` - 25% off (min Rs. 5,000)
- `NEWYEAR30` - 30% off (min Rs. 4,000)

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] All 13 tables exist in NeonDB
- [ ] Each table has data (no empty tables)
- [ ] No null values in required columns
- [ ] Products display on frontend
- [ ] Categories display in navigation
- [ ] Collections show linked products
- [ ] Reviews appear on product pages
- [ ] Orders show in admin panel
- [ ] Discount codes work
- [ ] Admin can login successfully

---

## 🐛 TROUBLESHOOTING

### Issue: "column does not exist"
**Solution**: Run `npx drizzle-kit push` again

### Issue: "duplicate key value violates unique constraint"
**Solution**: Data already exists. You can:
1. Delete existing data manually
2. Or just continue - seed uses `ON CONFLICT DO NOTHING`

### Issue: "connection refused"
**Solution**: Check `.env` file has correct `DATABASE_URL`

### Issue: Server won't start
**Solution**: 
```bash
cd server
npm install
npm run dev
```

---

## 🎯 NEXT STEPS AFTER SETUP

1. **Test Frontend**: Browse products, categories, collections
2. **Test Admin Panel**: Login and manage products, orders, reviews
3. **Test Orders**: Place a test order as a customer
4. **Test Filters**: Use collection page filters
5. **Test Search**: Search for products
6. **Test Reviews**: Add reviews to products

---

## 📞 SUPPORT

If you encounter any issues:

1. Check backend console for errors
2. Check browser console (F12) for frontend errors
3. Verify database connection in `.env`
4. Ensure all dependencies installed: `npm install`

---

## 🚀 READY TO GO!

Your database is now fully populated with realistic, complete data. Every table has records, every required column has values, and you can immediately start testing the frontend and admin panel.

**Run the setup commands and start building!**
