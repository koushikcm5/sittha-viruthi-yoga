@echo off
echo ========================================
echo Testing System Setup
echo ========================================
echo.

echo [1/5] Checking Java...
java -version 2>nul
if %errorlevel% neq 0 (
    echo [FAIL] Java not found
) else (
    echo [OK] Java installed
)

echo.
echo [2/5] Checking Maven...
mvn -version 2>nul
if %errorlevel% neq 0 (
    echo [FAIL] Maven not found or JAVA_HOME not set
) else (
    echo [OK] Maven installed
)

echo.
echo [3/5] Checking Node.js...
node -v 2>nul
if %errorlevel% neq 0 (
    echo [FAIL] Node.js not found
) else (
    echo [OK] Node.js installed
)

echo.
echo [4/5] Checking MySQL...
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo [FAIL] MySQL not running on port 3306
) else (
    echo [OK] MySQL running
)

echo.
echo [5/5] Checking Backend Port...
netstat -ano | findstr :9000 >nul
if %errorlevel% neq 0 (
    echo [INFO] Port 9000 available (backend not running)
) else (
    echo [INFO] Port 9000 in use (backend may be running)
)

echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
echo Next steps:
echo 1. Run FIX-MYSQL-PASSWORD.bat to configure MySQL
echo 2. Run START-BACKEND.bat to start backend
echo 3. Run RUN-APP.bat to start frontend
echo.
pause
