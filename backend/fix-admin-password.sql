USE yoga_attendance;

UPDATE users 
SET password = '$2a$10$gyk3.0l9myW9uG9rgGMDqeSX1jGN9DK7T9EM4JtACIh29Ez23wQx2'
WHERE username = 'admin';

SELECT username, password FROM users WHERE username = 'admin';
