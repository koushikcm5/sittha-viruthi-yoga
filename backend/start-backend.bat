@echo off
echo Starting Yoga Attendance Backend...
echo.
echo Checking if port 9000 is available...
netstat -ano | findstr :9000
if %errorlevel% == 0 (
    echo Port 9000 is already in use!
    echo.
    pause
    exit /b 1
)

echo Port 9000 is available. Starting backend...
echo.
mvn spring-boot:run