# Yoga Attendance Backend API

Spring Boot backend with MySQL, JWT authentication, and email functionality.

## Setup

### 1. MySQL Database
```sql
CREATE DATABASE yoga_attendance;
```

### 2. Configure application.properties
Update the following in `src/main/resources/application.properties`:
- MySQL username/password
- Email configuration (Gmail App Password)
- JWT secret key

### 3. Run Application
```bash
mvn spring-boot:run
```

## API Endpoints

### Authentication
- **POST** `/api/auth/login` - Login (user/admin)
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/forgot-password` - Send reset email
- **POST** `/api/auth/reset-password?token=xxx` - Reset password

### Attendance
- **POST** `/api/attendance/mark` - Mark attendance (auto timestamp & device)
- **GET** `/api/attendance/user/{username}` - Get user attendance
- **GET** `/api/attendance/all` - Get all attendance (admin)
- **PUT** `/api/attendance/{id}` - Update attendance (admin)

## Default Admin
Create admin user manually in database:
```sql
INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
        '$2a$10$encrypted_password', 'ADMIN', 1, 0, NOW());
```

## Features
- JWT token authentication
- Role-based access (USER/ADMIN)
- Automatic device timestamp capture
- Email password reset
- MySQL database
- Unique username validation
- 3-level progression system
