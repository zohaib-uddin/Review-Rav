#!/bin/bash

echo "🚀 RAVENZA - Setting up your project..."
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install drizzle-kit globally for convenience
echo "📦 Installing Drizzle Kit..."
npm install -D drizzle-kit

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📋 Next steps:"
echo "1. Push schema to database: npx drizzle-kit push"
echo "2. Seed initial data: npx tsx scripts/seed.ts"
echo "3. Start backend: cd server && npm run dev"
echo "4. Start frontend (new terminal): npm run dev"
echo ""
echo "🔐 Admin credentials:"
echo "   Email: admin@ravenza.pk"
echo "   Password: admin123"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Admin Panel: http://localhost:5173/admin"
echo ""
echo "✅ Setup complete! Happy coding! 🎉"
