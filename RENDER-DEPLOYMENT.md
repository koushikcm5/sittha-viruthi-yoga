# Deploy to Render

## Prerequisites
1. GitHub account with your code pushed
2. Render account (free tier available)
3. MySQL database (use Render's managed MySQL or external service)

## Deployment Steps

### 1. Setup MySQL Database
- Create a MySQL database on Render or use external service (e.g., PlanetScale, Railway)
- Note the connection URL

### 2. Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `ReactNativeAuthApp` repository
5. Configure:
   - **Name**: `yoga-attendance-api`
   - **Root Directory**: `backend`
   - **Environment**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/attendance-1.0.0.jar`

### 3. Set Environment Variables

Add these in Render dashboard under "Environment":

```
DB_URL=jdbc:mysql://<host>:<port>/yoga_attendance
DB_USERNAME=<your-db-username>
DB_PASSWORD=<your-db-password>
JWT_SECRET=<generate-strong-secret-key>
JWT_EXPIRATION=3600000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<your-email>
MAIL_PASSWORD=<your-app-password>
```

### 4. Deploy
- Click "Create Web Service"
- Render will build and deploy automatically
- Your API will be available at: `https://yoga-attendance-api.onrender.com`

### 5. Update Frontend Config
Update `frontend/config.js` with your Render URL:
```javascript
export const API_URL = 'https://yoga-attendance-api.onrender.com';
```

## Notes
- Free tier sleeps after 15 min inactivity (first request takes ~30s)
- Upgrade to paid plan for always-on service
- Use strong passwords and secrets in production
