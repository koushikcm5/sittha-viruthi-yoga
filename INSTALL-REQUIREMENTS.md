# Installation Requirements

## Current Status
- ❌ Maven not installed
- ⚠️ Java 8 installed (need Java 17+)
- ✅ MySQL configured (Root@2025)

## Required Installations

### 1. Install Java JDK 17 or Higher
**Download:** https://www.oracle.com/java/technologies/downloads/#java17

**Steps:**
1. Download Java 17 JDK for Windows
2. Run installer
3. Set JAVA_HOME environment variable
4. Add to PATH: %JAVA_HOME%\bin

**Verify:**
```bash
java -version
```
Should show: java version "17.x.x"

### 2. Install Apache Maven
**Download:** https://maven.apache.org/download.cgi

**Steps:**
1. Download apache-maven-3.9.x-bin.zip
2. Extract to: C:\Program Files\Maven
3. Add to PATH: C:\Program Files\Maven\bin
4. Set M2_HOME: C:\Program Files\Maven

**Verify:**
```bash
mvn -version
```

### 3. MySQL Already Configured ✅
- Username: root
- Password: Root@2025
- Database will auto-create: yoga_attendance

## After Installation

### Run Backend:
```bash
cd C:\ReactNativeAuthApp\backend
mvn spring-boot:run
```

### Run Frontend:
```bash
cd C:\ReactNativeAuthApp
npm start
```

## Alternative: Use IDE
If you don't want to install Maven:
1. Install IntelliJ IDEA Community Edition
2. Open backend folder
3. IDE will auto-download Maven dependencies
4. Run YogaAttendanceApplication.java

## Quick Test Backend
After backend starts, test:
```bash
curl http://localhost:8080/api/auth/login
```
