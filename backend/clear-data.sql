USE yoga_attendance;

-- Clear all attendance records
DELETE FROM attendance;

-- Clear all users except admin
DELETE FROM users WHERE username != 'admin';

-- Show remaining data
SELECT 'Users:' as table_name;
SELECT * FROM users;

SELECT 'Attendance:' as table_name;
SELECT * FROM attendance;
