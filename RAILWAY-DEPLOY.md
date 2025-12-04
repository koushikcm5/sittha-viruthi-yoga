# Deploy to Railway

## Step 1: Push Code to GitHub
```bash
cd "g:\new sittha\ReactNativeAuthApp"
git add .
git commit -m "Ready for Railway deployment"
git push
```

## Step 2: Deploy on Railway

1. Go to **https://railway.app**
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **"sittha-viruthi-yoga"** repository
6. Railway will detect and deploy automatically

## Step 3: Add MySQL Database

1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Railway auto-connects it (sets MYSQL_URL, MYSQL_USER, etc.)

## Step 4: Configure Environment Variables

Click on your backend service → **"Variables"** tab → Add:

```
MYSQL_URL (auto-set by Railway MySQL)
MYSQL_USER (auto-set by Railway MySQL)
MYSQL_PASSWORD (auto-set by Railway MySQL)
MYSQL_DATABASE (auto-set by Railway MySQL)

JWT_SECRET=YourVeryLongSecretKeyAtLeast32CharactersForSecurity123456789
JWT_EXPIRATION=3600000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=kishorekishore2145y@gmail.com
MAIL_PASSWORD=znyh uiex dmyz bppo
```

## Step 5: Map Railway MySQL Variables

Railway uses different variable names. Add these mappings:

```
DB_URL=${{MYSQL_URL}}
DB_USERNAME=${{MYSQL_USER}}
DB_PASSWORD=${{MYSQL_PASSWORD}}
```

Or update application.properties to use Railway's variable names directly.

## Step 6: Get Your URL

1. Click **"Settings"** → **"Generate Domain"**
2. Your API will be at: `https://your-app.up.railway.app`

## Done!

Your backend is live. Update frontend config.js with the Railway URL.
