import React, { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import VerifyEmailScreen from './src/screens/auth/VerifyEmailScreen';
import SplashScreen from './src/screens/auth/SplashScreen';

// User Screens
import ChemsingDashboard from './src/screens/user/ChemsingDashboard';
import UserDashboardScreen from './src/screens/user/UserDashboardScreen';
import EnhancedUserDashboard from './src/screens/user/EnhancedUserDashboard';
import RoutineDetailScreen from './src/screens/user/RoutineDetailScreen';
import NotificationsScreen from './src/screens/user/NotificationsScreen';

// Admin Screens
import AdminScreen from './src/screens/admin/AdminScreen';
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminContentManager from './src/screens/admin/AdminContentManager';
import AdminNotificationsScreen from './src/screens/admin/AdminNotificationsScreen';

// Legal Screens
import PrivacyPolicyScreen from './src/screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/legal/TermsOfServiceScreen';
import AboutScreen from './src/screens/AboutScreen';

const Stack = createStackNavigator();

export default function App() {
  const navigationRef = React.useRef();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const preventScreenCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };
    preventScreenCapture();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      if (url && url.includes('reset-password')) {
        const token = url.split('token=')[1];
        if (token && navigationRef.current) {
          navigationRef.current.navigate('ResetPassword', { token });
        }
      }
    };

    Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
        <Stack.Screen name="EnhancedUserDashboard" component={EnhancedUserDashboard} />
        <Stack.Screen name="ChemsingDashboard" component={ChemsingDashboard} />
        <Stack.Screen name="AdminContentManager" component={AdminContentManager} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
