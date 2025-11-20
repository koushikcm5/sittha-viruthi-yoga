USE yoga_attendance;

-- Update admin password to a freshly encoded version
-- This uses a known working BCrypt hash for "admin123"
UPDATE users 
SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
WHERE username = 'admin';

SELECT username, password FROM users WHERE username = 'admin';
