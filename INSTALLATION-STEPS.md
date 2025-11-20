# Complete Installation Steps

## 🚀 Quick Start

**Double-click:** `QUICK-START.bat` for interactive menu

OR follow manual steps below:

---

## Step 1: Install Java 17

### Option A: Automatic Guide
Double-click: `install-java17.bat`

### Option B: Manual Installation
1. Download: https://www.oracle.com/java/technologies/downloads/#java17
2. Select: **Windows x64 Installer**
3. Run installer (accept defaults)
4. Set Environment Variables:
   - `JAVA_HOME` = `C:\Program Files\Java\jdk-17`
   - Add to `Path`: `%JAVA_HOME%\bin`
5. Verify: Open **NEW** CMD and run `java -version`

---

## Step 2: Install Maven

### Option A: Automatic Guide
Double-click: `install-maven.bat`

### Option B: Manual Installation
1. Download: https://maven.apache.org/download.cgi
2. Download: **apache-maven-3.9.6-bin.zip**
3. Extract to: `C:\Program Files\Maven\apache-maven-3.9.6`
4. Set Environment Variables:
   - `M2_HOME` = `C:\Program Files\Maven\apache-maven-3.9.6`
   - `MAVEN_HOME` = `C:\Program Files\Maven\apache-maven-3.9.6`
   - Add to `Path`: `%M2_HOME%\bin`
5. Verify: Open **NEW** CMD and run `mvn -version`

---

## Step 3: Setup MySQL Database

Run in MySQL:
```sql
CREATE DATABASE yoga_attendance;
```

---

## Step 4: Run Backend

```bash
cd C:\ReactNativeAuthApp\backend
mvn spring-boot:run
```

Wait for: "Started YogaAttendanceApplication"

---

## Step 5: Create Admin User

After backend starts, run in MySQL:
```sql
USE yoga_attendance;

INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
        '$2a$10$N9qo8uLOickgx2ZrVzgeGe7DDZaAVZ.1.Z9jFapcvVU0sHxIL6emu', 
        'ADMIN', 1, 0, NOW());
```

---

## Step 6: Run Frontend

Open **NEW** terminal:
```bash
cd C:\ReactNativeAuthApp
npm start
```

Press `w` for web or scan QR for mobile

---

## ✅ Test Login

- **Admin**: username: `admin`, password: `admin123`
- **User**: Register new account

---

## 🔧 Troubleshooting

### "mvn not found"
- Restart computer after Maven installation
- Check PATH variable includes Maven bin folder

### "java version 1.8"
- Java 17 not set as default
- Update JAVA_HOME to Java 17 path

### Backend won't start
- Check MySQL is running
- Verify password in application.properties: `Root@2025`

### Frontend can't connect
- Ensure backend is running on port 8080
- Check `src/services/api.js` has correct URL
