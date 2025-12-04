# 🚀 Complete Deployment Guide - Render & DigitalOcean

## 📋 Table of Contents
1. [Render Setup (15 minutes)](#render-setup)
2. [DigitalOcean Setup (1-2 hours)](#digitalocean-setup)

---

# 🎨 RENDER SETUP (15 Minutes)

## Cost: $0 (Free) or $14/month (Paid)

### Prerequisites
- GitHub account
- Render account (sign up free at render.com)
- Your code pushed to GitHub

---

## Step 1: Prepare Backend for Render (5 min)

### 1.1 Add PostgreSQL Dependency

Edit `backend/pom.xml`:
```xml
<!-- Add PostgreSQL driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 1.2 Update application.properties

```properties
# Database (works with both MySQL and PostgreSQL)
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/yoga_attendance}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:Koushik5@}

# Auto-detect database type
spring.jpa.database-platform=${DB_PLATFORM:org.hibernate.dialect.MySQLDialect}

# Server port (Render provides PORT env var)
server.port=${PORT:9000}

# JWT
jwt.secret=${JWT_SECRET:YourSecretKeyForJWTTokenGenerationMustBeLongEnough}
jwt.expiration=3600000

# Email
spring.mail.username=${MAIL_USERNAME:kishorekishore2145y@gmail.com}
spring.mail.password=${MAIL_PASSWORD:znyh uiex dmyz bppo}
```

### 1.3 Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Create PostgreSQL Database (2 min)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `yoga-db`
   - **Database**: `yoga_attendance`
   - **User**: `yoga_user`
   - **Region**: Singapore (closest to you)
   - **Plan**: **Free** (1 GB)
4. Click **"Create Database"**
5. Wait 1-2 minutes for creation
6. Copy **Internal Database URL** (starts with `postgresql://`)

---

## Step 3: Deploy Backend (5 min)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `yoga-backend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Java
   - **Build Command**: `cd backend && mvn clean package -DskipTests`
   - **Start Command**: `java -jar backend/target/attendance-1.0.0.jar`
   - **Plan**: **Free** (or Starter $7/month)

4. Add Environment Variables:
   ```
   DB_URL=<paste Internal Database URL from Step 2>
   DB_USERNAME=yoga_user
   DB_PASSWORD=<from database creation>
   DB_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
   JWT_SECRET=<generate random 32 char string>
   MAIL_USERNAME=kishorekishore2145y@gmail.com
   MAIL_PASSWORD=znyh uiex dmyz bppo
   PORT=9000
   ```

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for build and deploy
7. Your backend URL: `https://yoga-backend.onrender.com`

---

## Step 4: Update Frontend (3 min)

Edit `frontend/config.js`:
```javascript
export const API_URL = __DEV__ 
  ? 'http://10.10.42.68:9000/api'
  : 'https://yoga-backend.onrender.com/api';

export const REQUEST_TIMEOUT = 30000; // 30 seconds for cold starts
```

Rebuild and test your app!

---

## Step 5: Keep Free Tier Awake (Optional)

Use UptimeRobot to prevent cold starts:
1. Sign up: https://uptimerobot.com/
2. Add Monitor:
   - **URL**: `https://yoga-backend.onrender.com/api/auth/pending-users`
   - **Interval**: 5 minutes
3. Done! App stays awake during day

---

# 🌊 DIGITALOCEAN SETUP (1-2 Hours)

## Cost: $8/month (Droplet + Backups + Domain)

### Prerequisites
- DigitalOcean account (sign up at digitalocean.com)
- Credit card (required)
- Basic Linux knowledge
- SSH client (PuTTY for Windows or Terminal for Mac/Linux)

---

## Step 1: Create Droplet (5 min)

1. Go to https://cloud.digitalocean.com/
2. Click **"Create"** → **"Droplets"**
3. Configure:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **CPU**: Regular (1 GB RAM / 1 vCPU) - **$6/month**
   - **Datacenter**: Singapore
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `yoga-app`
   - **Backups**: Enable (+$1.20/month)
4. Click **"Create Droplet"**
5. Wait 1 minute, note the IP address (e.g., 159.89.xxx.xxx)

---

## Step 2: Connect to Server (2 min)

### Windows (using PuTTY):
1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Enter IP address
4. Click "Open"
5. Login as `root` with your password

### Mac/Linux:
```bash
ssh root@159.89.xxx.xxx
# Enter password when prompted
```

---

## Step 3: Install Dependencies (15 min)

```bash
# Update system
apt update && apt upgrade -y

# Install Java 17
apt install openjdk-17-jdk -y
java -version

# Install MySQL
apt install mysql-server -y
systemctl start mysql
systemctl enable mysql

# Secure MySQL
mysql_secure_installation
# Press Y for all prompts
# Set root password: YourStrongPassword123!

# Install Nginx
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# Install Certbot (for SSL)
apt install certbot python3-certbot-nginx -y

# Install Maven (for building)
apt install maven -y
```

---

## Step 4: Setup MySQL Database (5 min)

```bash
# Login to MySQL
mysql -u root -p
# Enter password: YourStrongPassword123!
```

```sql
-- Create database
CREATE DATABASE yoga_attendance;

-- Create user
CREATE USER 'yoga_user'@'localhost' IDENTIFIED BY 'YourDbPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON yoga_attendance.* TO 'yoga_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

---

## Step 5: Upload and Build Backend (10 min)

### Option A: Upload JAR file

On your local machine:
```bash
# Build JAR
cd backend
mvn clean package -DskipTests

# Upload to server (replace IP)
scp target/attendance-1.0.0.jar root@159.89.xxx.xxx:/root/
```

### Option B: Build on server

```bash
# On server, clone your repo
cd /root
git clone https://github.com/yourusername/ReactNativeAuthApp.git
cd ReactNativeAuthApp/backend

# Build
mvn clean package -DskipTests

# JAR is at: target/attendance-1.0.0.jar
```

---

## Step 6: Create Systemd Service (10 min)

```bash
# Create service file
nano /etc/systemd/system/yogaapp.service
```

Paste this content:
```ini
[Unit]
Description=Yoga Attendance App
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root
ExecStart=/usr/bin/java -jar /root/attendance-1.0.0.jar
Restart=always
RestartSec=10

Environment="DB_URL=jdbc:mysql://localhost:3306/yoga_attendance"
Environment="DB_USERNAME=yoga_user"
Environment="DB_PASSWORD=YourDbPassword123!"
Environment="JWT_SECRET=YourVeryLongRandomSecretKeyHere32Chars"
Environment="MAIL_USERNAME=kishorekishore2145y@gmail.com"
Environment="MAIL_PASSWORD=znyh uiex dmyz bppo"

[Install]
WantedBy=multi-user.target
```

Save: `Ctrl+X`, `Y`, `Enter`

```bash
# Reload systemd
systemctl daemon-reload

# Start service
systemctl start yogaapp

# Enable on boot
systemctl enable yogaapp

# Check status
systemctl status yogaapp

# View logs
journalctl -u yogaapp -f
```

---

## Step 7: Configure Nginx (10 min)

```bash
# Create Nginx config
nano /etc/nginx/sites-available/yogaapp
```

Paste this content:
```nginx
server {
    listen 80;
    server_name 159.89.xxx.xxx;  # Replace with your IP

    location /api/ {
        proxy_pass http://localhost:9000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and enable:
```bash
# Enable site
ln -s /etc/nginx/sites-available/yogaapp /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## Step 8: Setup SSL with Let's Encrypt (10 min)

### If you have a domain:
```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts, select redirect HTTP to HTTPS
```

### If using IP only (self-signed):
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

# Update Nginx config
nano /etc/nginx/sites-available/yogaapp
```

Add SSL configuration:
```nginx
server {
    listen 443 ssl;
    server_name 159.89.xxx.xxx;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    location /api/ {
        proxy_pass http://localhost:9000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name 159.89.xxx.xxx;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Restart Nginx
systemctl restart nginx
```

---

## Step 9: Configure Firewall (5 min)

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Step 10: Setup Automated Backups (5 min)

```bash
# Create backup script
nano /root/backup-db.sh
```

Paste:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u yoga_user -pYourDbPassword123! yoga_attendance > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add this line:
```
0 2 * * * /root/backup-db.sh
```

---

## Step 11: Update Frontend (3 min)

Edit `frontend/config.js`:
```javascript
export const API_URL = __DEV__ 
  ? 'http://10.10.42.68:9000/api'
  : 'https://159.89.xxx.xxx/api';  // Your server IP

export const REQUEST_TIMEOUT = 10000;
```

---

## Step 12: Test Everything (5 min)

```bash
# Test backend
curl http://localhost:9000/api/auth/pending-users

# Test through Nginx
curl http://159.89.xxx.xxx/api/auth/pending-users

# Test HTTPS
curl -k https://159.89.xxx.xxx/api/auth/pending-users

# Check logs
journalctl -u yogaapp -n 50

# Check Nginx logs
tail -f /var/log/nginx/access.log
```

---

## 🎯 Comparison Summary

| Feature | Render | DigitalOcean |
|---------|--------|--------------|
| **Setup Time** | 15 min | 1-2 hours |
| **Cost** | $0-14/month | $8/month |
| **Difficulty** | ⭐ Easy | ⭐⭐⭐ Medium |
| **Maintenance** | None | 20 min/month |
| **Performance** | 512 MB RAM | 1 GB RAM |
| **Database** | PostgreSQL | MySQL |
| **Always On** | Paid only | Yes |
| **Control** | Limited | Full |

---

## 🆘 Troubleshooting

### Render Issues:

**Cold Start Timeout**:
- Use UptimeRobot to keep awake
- Increase timeout to 30 seconds in frontend

**Build Failed**:
```bash
# Test locally first
cd backend
mvn clean package -DskipTests
```

### DigitalOcean Issues:

**Service won't start**:
```bash
# Check logs
journalctl -u yogaapp -n 100

# Check if port is in use
netstat -tulpn | grep 9000

# Restart service
systemctl restart yogaapp
```

**Can't connect to database**:
```bash
# Check MySQL is running
systemctl status mysql

# Test connection
mysql -u yoga_user -p yoga_attendance
```

**Nginx errors**:
```bash
# Check config
nginx -t

# Check logs
tail -f /var/log/nginx/error.log
```

---

## 📞 Next Steps

1. ✅ Test all app features
2. ✅ Setup monitoring (UptimeRobot)
3. ✅ Get a domain name (optional)
4. ✅ Setup proper SSL certificate
5. ✅ Configure email alerts
6. ✅ Test backup restoration
7. ✅ Document your setup

**You're now live! 🎉**
