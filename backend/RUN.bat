@echo off
cd /d "%~dp0"
echo Starting Backend...

set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot
echo JAVA_HOME set to: %JAVA_HOME%

mvn spring-boot:run
pause
