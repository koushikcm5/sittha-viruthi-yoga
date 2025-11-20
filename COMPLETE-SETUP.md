# Complete Setup Guide - React Native Auth App

## Prerequisites Check

### 1. MySQL Setup
- MySQL must be installed and running on port 3306
- Root user must have a password set

### 2. Java Setup
- Java 17 is installed at: `C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot`

### 3. Node.js Setup
- Node.js must be installed for React Native

## Step-by-Step Setup

### Step 1: Configure MySQL Password

**Option A: If you know your MySQL password**
1. Open `backend\src\main\resources\application.properties`
2. Find line: `spring.datasource.password=${DB_PASSWORD:}`
3. Replace with: `spring.datasource.password=${DB_PASSWORD:YourPassword}`

**Option B: Set MySQL password to empty (for development only)**
1. Open Command Prompt as Administrator
2. Run:
```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -p
```
3. Enter current password
4. Run these SQL commands:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Create Database and Admin User

Run in Command Prompt:
```bash
cd "G:\new sittha\ReactNativeAuthApp\backend"
mysql -u root -p < database-setup.sql
mysql -u root -p < create-admin.sql
```

### Step 3: Start Backend

Run in Command Prompt:
```bash
cd "G:\new sittha\ReactNativeAuthApp\backend"
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
mvn spring-boot:run
```

Wait until you see: "Started YogaAttendanceApplication"

### Step 4: Start Frontend

Open NEW Command Prompt:
```bash
cd "G:\new sittha\ReactNativeAuthApp"
npm start
```

Press 'a' for Android or 'i' for iOS

### Step 5: Test Login

Use these credentials:
- Username: `admin`
- Password: `admin123`

## Troubleshooting

### Backend won't start - MySQL Error
- Check MySQL is running: `netstat -ano | findstr :3306`
- Verify password in application.properties matches MySQL root password

### Frontend can't connect
- Verify backend is running: `netstat -ano | findstr :9000`
- Check API URL in `src\services\api.js`:
  - Physical device: Use your PC's IP (currently: 10.64.49.108)
  - Android emulator: Use 10.0.2.2
  - iOS simulator: Use localhost

### Port already in use
- Backend (9000): `netstat -ano | findstr :9000` then `taskkill /F /PID <PID>`
- Frontend (8081): `netstat -ano | findstr :8081` then `taskkill /F /PID <PID>`

## Quick Start Scripts

Use these batch files:
- `START-BACKEND.bat` - Starts backend server
- `RUN-APP.bat` - Starts React Native app
- `START-ALL.bat` - Starts both backend and frontend

## Security Notes

Before production deployment:
1. Set strong MySQL password
2. Update JWT secret in application.properties
3. Set proper CORS origins (not *)
4. Use environment variables for all secrets
5. Review SECURITY-CHECKLIST.md
