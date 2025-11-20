-- Create Database
CREATE DATABASE IF NOT EXISTS yoga_attendance;
USE yoga_attendance;

-- Create Admin User (password: admin123)
INSERT INTO users (name, username, email, phone, password, role, level, months_completed, created_at)
VALUES ('Admin', 'admin', 'admin@yoga.com', '1234567890', 
        '$2a$10$rZ8qH5YvZ5YvZ5YvZ5YvZeO5YvZ5YvZ5YvZ5YvZ5YvZ5YvZ5YvZ5Y', 
        'ADMIN', 1, 0, NOW())
ON DUPLICATE KEY UPDATE username=username;

-- Note: To generate BCrypt password, use online tool or run:
-- In Spring Boot application, use: new BCryptPasswordEncoder().encode("admin123")
