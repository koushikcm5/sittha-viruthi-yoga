# How to Change User Role to ADMIN

## Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Login to your account
3. Click on your project

## Step 2: Open MySQL Database
1. Click on the **MySQL** service (not the backend)
2. Click the **"Data"** tab at the top

## Step 3: Run SQL Query

### Option A: If you know the username
```sql
UPDATE user SET role='ADMIN', email_verified=1, approved=1 WHERE username='YOUR_USERNAME_HERE';
```

### Option B: Update the "admin" user
```sql
UPDATE user SET role='ADMIN', email_verified=1, approved=1 WHERE username='admin';
```

### Option C: Update by email
```sql
UPDATE user SET role='ADMIN', email_verified=1, approved=1 WHERE email='your_email@example.com';
```

### Option D: See all users first
```sql
SELECT id, username, email, role, email_verified, approved FROM user;
```

## Step 4: Verify the Change
```sql
SELECT username, role FROM user WHERE role='ADMIN';
```

## Step 5: Logout and Login Again
- Logout from your app
- Login again with the updated user
- You should now have ADMIN access

---

## Quick Reference - All Users to ADMIN (if needed)
```sql
UPDATE user SET role='ADMIN', email_verified=1, approved=1;
```

## Create New Admin User from Scratch
```sql
INSERT INTO user (name, username, email, phone, password, role, email_verified, approved, created_at)
VALUES (
  'Admin User',
  'admin',
  'admin@example.com',
  '1234567890',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  1,
  1,
  NOW()
);
```
Login: username=`admin`, password=`Admin123`
