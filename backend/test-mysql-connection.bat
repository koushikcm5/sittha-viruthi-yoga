@echo off
echo Testing MySQL Connection...
echo.
echo Trying to connect to MySQL with different passwords:
echo.

echo Test 1: Empty password
mysql -u root -e "SELECT 'SUCCESS: Empty password works!' AS Result;" 2>nul
if %errorlevel%==0 (
    echo [SUCCESS] MySQL root password is EMPTY
    echo Update application.properties: spring.datasource.password=
    pause
    exit /b 0
)

echo Test 2: Password = root
mysql -u root -proot -e "SELECT 'SUCCESS: Password is root!' AS Result;" 2>nul
if %errorlevel%==0 (
    echo [SUCCESS] MySQL root password is: root
    echo Update application.properties: spring.datasource.password=root
    pause
    exit /b 0
)

echo Test 3: Password = Root@2025
mysql -u root -pRoot@2025 -e "SELECT 'SUCCESS: Password is Root@2025!' AS Result;" 2>nul
if %errorlevel%==0 (
    echo [SUCCESS] MySQL root password is: Root@2025
    echo Your application.properties is already correct!
    pause
    exit /b 0
)

echo Test 4: Password = admin
mysql -u root -padmin -e "SELECT 'SUCCESS: Password is admin!' AS Result;" 2>nul
if %errorlevel%==0 (
    echo [SUCCESS] MySQL root password is: admin
    echo Update application.properties: spring.datasource.password=admin
    pause
    exit /b 0
)

echo.
echo [FAILED] None of the common passwords worked.
echo.
echo You need to reset your MySQL root password.
echo Run: ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root@2025';
echo.
pause
