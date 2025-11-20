# Password Reset Feature Setup Instructions

## Backend Setup (Spring Boot)

### 1. Run the SQL Script
Execute the SQL script to create the password_reset_tokens table:
```sql
-- Run this in your MySQL database
source password_reset_tokens.sql;
```

### 2. Configure Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Generate App Password for 'Mail'
3. Copy the 16-character code
4. Replace `your-16-char-app-password` in `application.properties` with the actual code

### 3. Update application.properties
Replace the email password in `src/main/resources/application.properties`:
```properties
spring.mail.password=your-actual-16-char-app-password
```

### 4. Start Backend
```bash
mvn spring-boot:run
```

## Frontend Setup (React Native)

### 1. Install Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios expo-linking
```

### 2. Update API URL
In `api.js`, replace the API_URL with your backend URL:
- **Android Emulator**: `http://10.0.2.2:9000/api`
- **iOS Simulator**: `http://localhost:9000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:9000/api`
- **Production**: `https://your-deployed-backend.com/api`

### 3. Add Deep Link Support
Copy the `app.json` configuration to your project root.

### 4. Update Your Main App Component
Replace your App.js with NavigationSetup.js or integrate the navigation setup.

## Testing

### 1. Test Backend APIs
Use the cURL commands in `curl_commands.txt` to test the endpoints.

### 2. Test Email Functionality
1. Register a user with a valid email
2. Use forgot password API with that email
3. Check your email for the reset link
4. Click the link to test deep linking

### 3. Test Deep Linking
The email will contain a link like: `myapp://reset-password?token=xyz`
This should open your app and navigate to the ResetPasswordScreen.

## Troubleshooting

### Email Not Sending
- Verify Gmail App Password is correct
- Check if 2FA is enabled on Gmail account
- Ensure SMTP settings are correct in application.properties

### Deep Link Not Working
- Verify app.json scheme configuration
- Test deep link manually: `adb shell am start -W -a android.intent.action.VIEW -d "myapp://reset-password?token=test" com.yourapp.package`

### API Connection Issues
- Check if backend is running on correct port (9000)
- Verify API_URL in api.js matches your backend
- For physical device testing, use your computer's IP address

## Security Notes
- Tokens expire after 15 minutes
- Tokens are single-use (deleted after successful reset)
- Passwords are hashed using BCrypt
- Email validation ensures only registered users can reset passwords