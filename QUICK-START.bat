@echo off
color 0A
echo ========================================
echo Yoga Attendance App - Quick Start
echo ========================================
echo.

:menu
echo Choose installation option:
echo.
echo 1. Install Java 17 (Required)
echo 2. Install Maven (Required)
echo 3. Check Installations
echo 4. Setup MySQL Database
echo 5. Run Backend Server
echo 6. Run Frontend App
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto java
if "%choice%"=="2" goto maven
if "%choice%"=="3" goto check
if "%choice%"=="4" goto mysql
if "%choice%"=="5" goto backend
if "%choice%"=="6" goto frontend
if "%choice%"=="7" goto end

:java
echo.
echo Opening Java 17 installation guide...
call install-java17.bat
goto menu

:maven
echo.
echo Opening Maven installation guide...
call install-maven.bat
goto menu

:check
echo.
echo Checking installations...
echo.
echo Java version:
java -version
echo.
echo Maven version:
mvn -version
echo.
pause
goto menu

:mysql
echo.
echo Setting up MySQL database...
echo.
echo Run this SQL command in MySQL:
echo CREATE DATABASE yoga_attendance;
echo.
echo Then run this to create admin user:
echo USE yoga_attendance;
echo INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
echo VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
echo         '$2a$10$N9qo8uLOickgx2ZrVzgeGe7DDZaAVZ.1.Z9jFapcvVU0sHxIL6emu', 
echo         'ADMIN', 1, 0, NOW());
echo.
pause
goto menu

:backend
echo.
echo Starting Backend Server...
cd backend
mvn spring-boot:run
pause
goto menu

:frontend
echo.
echo Starting Frontend App...
cd ..
npm start
pause
goto menu

:end
echo.
echo Goodbye!
exit
