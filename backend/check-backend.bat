@echo off
echo Checking backend status...
echo.

echo Checking if port 9000 is in use:
netstat -ano | findstr :9000
if %errorlevel% == 0 (
    echo ✓ Backend is running on port 9000
) else (
    echo ✗ Backend is NOT running on port 9000
)

echo.
echo Testing API endpoint:
curl -s http://localhost:9000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"test\"}" 2>nul
if %errorlevel% == 0 (
    echo ✓ API endpoint is responding
) else (
    echo ✗ API endpoint is not responding
)

echo.
pause