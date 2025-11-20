@echo off
echo ========================================
echo   Starting React Native Auth App
echo ========================================
echo.

echo [1/2] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot && set PATH=%JAVA_HOME%\bin;%PATH% && mvn spring-boot:run"

echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak

echo.
echo [2/2] Starting React Native App...
cd ..
start "React Native" cmd /k "npm start"

echo.
echo ========================================
echo   Both servers are starting!
echo   Backend: http://localhost:9000
echo   Frontend: Check the React Native window
echo ========================================
echo.
pause
