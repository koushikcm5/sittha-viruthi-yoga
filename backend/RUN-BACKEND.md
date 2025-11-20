# Backend Setup Instructions

## Prerequisites Required

### 1. Install Java JDK 17+
Download from: https://www.oracle.com/java/technologies/downloads/

### 2. Install Maven
Download from: https://maven.apache.org/download.cgi
- Extract to C:\Program Files\Maven
- Add to PATH: C:\Program Files\Maven\bin

### 3. Install MySQL
Download from: https://dev.mysql.com/downloads/installer/
- Set root password: Root@2025
- Start MySQL service

### 4. Create Database
```sql
CREATE DATABASE yoga_attendance;
```

## Run Backend

### Option 1: Using Maven (if installed)
```bash
cd backend
mvn spring-boot:run
```

### Option 2: Using IDE
1. Open backend folder in IntelliJ IDEA or Eclipse
2. Run YogaAttendanceApplication.java

### Option 3: Build JAR and Run
```bash
cd backend
mvn clean package
java -jar target/attendance-1.0.0.jar
```

## Verify Backend is Running
Open browser: http://localhost:8080/api/auth/login
Should see error (expected - needs POST request)

## Create Admin User
After backend starts, run this SQL:
```sql
USE yoga_attendance;

-- Password is: admin123
INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
        '$2a$10$N9qo8uLOickgx2ZrVzgeGe7DDZaAVZ.1.Z9jFapcvVU0sHxIL6emu', 
        'ADMIN', 1, 0, NOW());
```

## Then Run Frontend
```bash
cd ReactNativeAuthApp
npm start
```
