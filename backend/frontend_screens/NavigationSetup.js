import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';

// Import your screens
import LoginScreen from './LoginScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import SuccessMessageScreen from './SuccessMessageScreen';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      ResetPassword: {
        path: '/reset-password',
        parse: {
          token: (token) => token,
        },
      },
    },
  },
};

const NavigationSetup = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{ title: 'Forgot Password' }}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPasswordScreen}
          options={{ title: 'Reset Password' }}
        />
        <Stack.Screen 
          name="SuccessMessage" 
          component={SuccessMessageScreen}
          options={{ title: 'Success', headerLeft: null }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationSetup;