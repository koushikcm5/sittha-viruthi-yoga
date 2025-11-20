# Complete Setup Guide

## Backend Setup

### 1. Install MySQL
- Download and install MySQL Server
- Create database: `yoga_attendance`

### 2. Configure Backend
Edit `backend/src/main/resources/application.properties`:

```properties
# Update MySQL credentials
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Update Email (Gmail App Password)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3. Create Admin User
Run this SQL after first backend start:

```sql
USE yoga_attendance;

-- Generate password hash first using BCrypt online tool for "admin123"
INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
        '$2a$10$YOUR_BCRYPT_HASH_HERE', 
        'ADMIN', 1, 0, NOW());
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
```

Backend will run on: `http://localhost:8080`

## Frontend Setup

### 1. Install Dependencies
```bash
cd ReactNativeAuthApp
npm install
```

### 2. Update API URL
If testing on physical device, update `src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_COMPUTER_IP:8080/api';
```

### 3. Run Frontend
```bash
npm start
```

## Testing

### Login Credentials
- **Admin**: username: `admin`, password: `admin123`
- **User**: Register new user through app

### API Endpoints
- Login: POST `http://localhost:8080/api/auth/login`
- Register: POST `http://localhost:8080/api/auth/register`
- Mark Attendance: POST `http://localhost:8080/api/attendance/mark`
- Get All Attendance: GET `http://localhost:8080/api/attendance/all`

## Features
✅ JWT Authentication
✅ Role-based access (USER/ADMIN)
✅ Automatic device timestamp
✅ Email password reset
✅ MySQL database
✅ Unique username validation
✅ 3-level progression system (4 months each)
✅ Black & Gold UI theme

## Troubleshooting

### Backend Issues
- Check MySQL is running
- Verify database credentials
- Check port 8080 is available

### Frontend Issues
- Check backend is running
- Verify API_URL in api.js
- Check network connectivity

### Email Issues
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail
- Generate App Password from Google Account settings
