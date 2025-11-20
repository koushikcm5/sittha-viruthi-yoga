# React Native Auth App

A complete authentication app with Login, Register, Admin Dashboard, and Forgot Password screens.

## Features

- **Login Screen**: Email/Username and password authentication
- **Register Screen**: Sign up with username, email, phone number, and password
- **Admin Dashboard**: Overview with statistics and quick actions
- **Forgot Password**: Password reset functionality

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the app:
```bash
npm start
```

3. Run on your device:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

## Project Structure

```
ReactNativeAuthApp/
├── App.js
├── src/
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── AdminScreen.js
│       └── ForgotPasswordScreen.js
├── package.json
└── app.json
```

## Screens

### Login Screen
- Email/Username input
- Password input
- Forgot password link
- Sign up navigation

### Register Screen
- Username input
- Email input
- Phone number input
- Password input
- Confirm password input

### Admin Dashboard
- User statistics cards
- Quick action buttons
- Logout functionality

### Forgot Password Screen
- Email input for password reset
- Back to login navigation
