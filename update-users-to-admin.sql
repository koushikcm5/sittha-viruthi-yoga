-- Update existing users in Railway MySQL database
-- Run this in Railway Dashboard → MySQL service → Data tab

-- Update 'admin' user to ADMIN role
UPDATE user 
SET role='ADMIN', email_verified=1, approved=1 
WHERE username='admin';

-- Keep 'testuser123' as USER role (just verify and approve)
UPDATE user 
SET role='USER', email_verified=1, approved=1 
WHERE username='testuser123';

-- Verify the changes
SELECT id, username, email, role, email_verified, approved 
FROM user 
WHERE username IN ('admin', 'testuser123');
