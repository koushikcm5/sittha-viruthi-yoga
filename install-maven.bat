@echo off
echo ========================================
echo Apache Maven Installation Guide
echo ========================================
echo.
echo Step 1: Download Maven
echo Visit: https://maven.apache.org/download.cgi
echo.
echo Step 2: Download Binary zip archive
echo Download: apache-maven-3.9.6-bin.zip
echo.
echo Step 3: Extract Maven
echo - Extract to: C:\Program Files\Maven
echo - Final path should be: C:\Program Files\Maven\apache-maven-3.9.6
echo.
echo Step 4: Set Environment Variables
echo - Press Win + X, select System
echo - Click Advanced system settings
echo - Click Environment Variables
echo - Under System Variables, click New:
echo   Variable name: M2_HOME
echo   Variable value: C:\Program Files\Maven\apache-maven-3.9.6
echo.
echo   Variable name: MAVEN_HOME
echo   Variable value: C:\Program Files\Maven\apache-maven-3.9.6
echo.
echo - Find Path variable, click Edit, add:
echo   %%M2_HOME%%\bin
echo.
echo Step 5: Verify Installation
echo Open NEW command prompt and run:
echo   mvn -version
echo.
echo Press any key to open download page...
pause
start https://maven.apache.org/download.cgi
