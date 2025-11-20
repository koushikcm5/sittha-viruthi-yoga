@echo off
echo ========================================
echo MySQL Password Configuration
echo ========================================
echo.
echo This script will help you configure MySQL password
echo.
echo Current configuration expects EMPTY password
echo.
echo Choose an option:
echo 1. I know my MySQL password (will update config)
echo 2. I want to remove MySQL password (development only)
echo 3. Exit
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto update_config
if "%choice%"=="2" goto remove_password
if "%choice%"=="3" goto end

:update_config
echo.
set /p mysql_pass="Enter your MySQL root password: "
cd backend\src\main\resources
powershell -Command "(Get-Content application.properties) -replace 'spring.datasource.password=\$\{DB_PASSWORD:\}', 'spring.datasource.password=${DB_PASSWORD:%mysql_pass%}' | Set-Content application.properties"
echo.
echo Configuration updated!
echo Password set to: %mysql_pass%
goto end

:remove_password
echo.
echo To remove MySQL password, run these commands:
echo.
echo mysql -u root -p
echo ALTER USER 'root'@'localhost' IDENTIFIED BY '';
echo FLUSH PRIVILEGES;
echo EXIT;
echo.
pause
goto end

:end
echo.
echo Done!
pause
