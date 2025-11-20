@echo off
echo ========================================
echo Starting React Native App
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    pause
    exit /b 1
)

echo.
echo Starting Expo...
echo.
start "React Native App" cmd /k "npm start"

echo.
echo App is starting...
echo.
echo After Expo starts:
echo - Press 'a' for Android emulator
echo - Press 'i' for iOS simulator  
echo - Press 'w' for web browser
echo - Scan QR code with Expo Go app on your phone
echo.
pause
