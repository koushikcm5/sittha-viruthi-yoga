@echo off
setlocal
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ========================================
echo   Starting Backend on Port 9000
echo ========================================
echo JAVA_HOME: %JAVA_HOME%
echo.

call mvn spring-boot:run

pause
