# Screens Folder Structure

## 📁 Organization

```
screens/
├── auth/                    # Authentication & Onboarding
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── ForgotPasswordScreen.js
│   ├── ResetPasswordScreen.js
│   └── SplashScreen.js
│
├── user/                    # User-facing Screens
│   ├── ChemsingDashboard.js      # Main user dashboard
│   ├── UserDashboardScreen.js    # Alternative dashboard
│   ├── EnhancedUserDashboard.js  # Enhanced version
│   └── RoutineDetailScreen.js    # Daily routine details
│
└── admin/                   # Admin-only Screens
    ├── AdminScreen.js            # Admin home
    ├── AdminDashboard.js         # Admin dashboard
    └── AdminContentManager.js    # Content management
```

## 🎯 Purpose

### Auth Screens
- Handle user authentication flow
- Login, registration, password reset
- Splash screen for app initialization

### User Screens
- Main user experience
- Daily routines, habits, progress tracking
- Workshops, appointments, Q&A

### Admin Screens
- Content management
- User management
- Attendance tracking
- Workshop & appointment management

## 📝 Import Examples

```javascript
// Auth
import LoginScreen from './src/screens/auth/LoginScreen';

// User
import ChemsingDashboard from './src/screens/user/ChemsingDashboard';

// Admin
import AdminDashboard from './src/screens/admin/AdminDashboard';
```
