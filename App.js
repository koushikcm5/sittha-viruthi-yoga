import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminScreen from './src/screens/AdminScreen';
import UserDashboardScreen from './src/screens/UserDashboardScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

const Stack = createStackNavigator();

export default function App() {
  const navigationRef = React.useRef();

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

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
