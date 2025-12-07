# Email OTP Not Receiving - Troubleshooting Guide

## Common Issues and Solutions

### 1. Gmail App Password Issue
**Problem**: Gmail blocks less secure apps by default.

**Solution**:
- Go to Google Account settings: https://myaccount.google.com/
- Enable 2-Step Verification
- Generate an App Password:
  - Go to Security → 2-Step Verification → App passwords
  - Select "Mail" and "Other (Custom name)"
  - Copy the 16-character password
  - Update `MAIL_PASSWORD` in application.properties

### 2. Check Backend Logs
When you register or request password reset, check the console output:
```
=== EMAIL VERIFICATION OTP ===
To: user@example.com
OTP: 123456
==============================
✓ Verification OTP email sent successfully
```

If you see errors, they will indicate the problem.

### 3. Email in Spam/Junk Folder
- Check your spam/junk folder
- Mark the email as "Not Spam"
- Add kishorekishore2145y@gmail.com to contacts

### 4. Firewall/Network Issues
- Ensure port 587 is not blocked
- Try using port 465 with SSL instead of TLS

### 5. Test Email Configuration
Check if the email credentials are correct:
- Username: kishorekishore2145y@gmail.com
- Password: znyh uiex dmyz bppo (App Password)
- Host: smtp.gmail.com
- Port: 587

### 6. Alternative: Use Console OTP (Development)
For testing, check the backend console logs. The OTP is printed there:
```
=== EMAIL VERIFICATION OTP ===
To: test@example.com
OTP: 123456  <-- Use this OTP
==============================
```

### 7. Update Email Configuration
If Gmail doesn't work, try these alternatives:

**Option A: Use SendGrid (Recommended for production)**
```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=YOUR_SENDGRID_API_KEY
```

**Option B: Use Mailgun**
```properties
spring.mail.host=smtp.mailgun.org
spring.mail.port=587
spring.mail.username=postmaster@your-domain.mailgun.org
spring.mail.password=YOUR_MAILGUN_PASSWORD
```

**Option C: Use Outlook/Hotmail**
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

### 8. Verify Email Settings in application.properties
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=kishorekishore2145y@gmail.com
spring.mail.password=znyh uiex dmyz bppo
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com
```

### 9. Quick Test Steps
1. Start the backend server
2. Register a new user
3. Check backend console for OTP
4. Check email inbox (and spam folder)
5. If email not received, use OTP from console

### 10. Production Recommendation
For production, use a dedicated email service:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **AWS SES** (Very cheap, reliable)
- **Twilio SendGrid**

These services have better deliverability and won't be blocked.
