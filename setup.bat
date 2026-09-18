@echo off
echo.
echo ============================================
echo   RAVENZA - Project Setup
echo ============================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd server
call npm install
cd ..
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Installing Drizzle Kit...
call npm install -D drizzle-kit

echo.
echo [4/4] Setup complete!
echo.
echo ============================================
echo   NEXT STEPS:
echo ============================================
echo.
echo 1. Push schema to database:
echo    npx drizzle-kit push
echo.
echo 2. Seed initial data:
echo    npx tsx scripts/seed.ts
echo.
echo 3. Start backend server:
echo    cd server
echo    npm run dev
echo.
echo 4. Start frontend (NEW terminal):
echo    npm run dev
echo.
echo ============================================
echo   ADMIN CREDENTIALS:
echo ============================================
echo   Email: admin@ravenza.pk
echo   Password: admin123
echo.
echo ============================================
echo   URLS:
echo ============================================
echo   Frontend: http://localhost:5173
echo   Backend: http://localhost:3001
echo   Admin: http://localhost:5173/admin
echo.
echo Setup complete! Press any key to exit...
pause >nul
