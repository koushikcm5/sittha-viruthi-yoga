USE yoga_attendance;

SELECT 'All Users:' as info;
SELECT id, username, name, email, role, level, created_at FROM users;

SELECT 'All Attendance Records:' as info;
SELECT * FROM attendance;
