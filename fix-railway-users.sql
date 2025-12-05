-- ========================================
-- FIX RAILWAY DATABASE USERS
-- Run this in Railway Dashboard → MySQL → Data tab
-- ========================================

-- Step 1: Check current state of all users
SELECT id, username, email, role, email_verified, approved, created_at 
FROM user 
ORDER BY created_at;

-- Step 2: Update 'admin' user to ADMIN role
UPDATE user 
SET role='ADMIN', email_verified=1, approved=1 
WHERE username='admin';

-- Step 3: Update 'testuser123' to USER role (keep as regular user)
UPDATE user 
SET role='USER', email_verified=1, approved=1 
WHERE username='testuser123';

-- Step 4: Update any other existing users to USER role
UPDATE user 
SET role='USER', email_verified=1, approved=1 
WHERE username NOT IN ('admin');

-- Step 5: Verify all changes
SELECT username, email, role, email_verified, approved 
FROM user 
ORDER BY 
  CASE 
    WHEN role='ADMIN' THEN 1 
    ELSE 2 
  END, 
  username;

-- Step 6: Count users by role
SELECT role, COUNT(*) as count 
FROM user 
GROUP BY role;
