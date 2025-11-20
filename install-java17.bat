@echo off
echo ========================================
echo Java 17 Installation Guide
echo ========================================
echo.
echo Step 1: Download Java 17
echo Visit: https://www.oracle.com/java/technologies/downloads/#java17
echo.
echo Step 2: Select Windows x64 Installer
echo Download: jdk-17_windows-x64_bin.exe
echo.
echo Step 3: Run the installer
echo - Accept license agreement
echo - Install to default location: C:\Program Files\Java\jdk-17
echo.
echo Step 4: Set Environment Variables
echo - Press Win + X, select System
echo - Click Advanced system settings
echo - Click Environment Variables
echo - Under System Variables, click New:
echo   Variable name: JAVA_HOME
echo   Variable value: C:\Program Files\Java\jdk-17
echo.
echo - Find Path variable, click Edit, add:
echo   %%JAVA_HOME%%\bin
echo.
echo Step 5: Verify Installation
echo Open NEW command prompt and run:
echo   java -version
echo.
echo Press any key to open download page...
pause
start https://www.oracle.com/java/technologies/downloads/#java17
