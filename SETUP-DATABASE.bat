@echo off
echo ========================================
echo Setting Up Database
echo ========================================
echo.

cd /d "%~dp0backend"

echo This will create the database and admin user
echo.
echo Make sure MySQL is running on localhost:3306
echo Username: root
echo Password: Root@2025
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Creating database and tables...
mysql -u root -pRoot@2025 < database-setup.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)

echo.
echo Creating admin user...
mysql -u root -pRoot@2025 < create-admin.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create admin user
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database setup complete!
echo ========================================
echo.
echo Admin credentials:
echo Username: admin
echo Password: admin123
echo.
pause
