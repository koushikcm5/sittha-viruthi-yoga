@echo off
echo ========================================
echo Starting Yoga Attendance Backend
echo ========================================
echo.

cd /d "%~dp0backend"

echo Checking Java installation...
java -version 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking if port 9000 is available...
netstat -ano | findstr :9000 >nul
if %errorlevel% == 0 (
    echo WARNING: Port 9000 is already in use!
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9000 ^| findstr LISTENING') do taskkill /F /PID %%a
    timeout /t 2 >nul
)

echo.
echo Setting JAVA_HOME...
for /f "tokens=*" %%i in ('where java') do set JAVA_PATH=%%i
for %%i in ("%JAVA_PATH%") do set JAVA_HOME=%%~dpi..
echo JAVA_HOME: %JAVA_HOME%

echo.
echo Starting Spring Boot Backend on port 9000...
start "Yoga Backend Server" cmd /k "set JAVA_HOME=%JAVA_HOME% && mvn spring-boot:run"

echo.
echo Backend is starting in new window...
echo Backend will be available at: http://localhost:9000
echo.
pause
