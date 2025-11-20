import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { authAPI } from '../services/api';

export default function ResetPasswordScreen({ route, navigation }) {
  const { token } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    if (pwd.length < minLength) return 'Password must be at least 8 characters';
    if (!hasUpper) return 'Password must contain an uppercase letter';
    if (!hasLower) return 'Password must contain a lowercase letter';
    if (!hasNumber) return 'Password must contain a number';
    if (!hasSpecial) return 'Password must contain a special character';
    return null;
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Please fill all fields');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, newPassword);
      alert('Password reset successful!');
      navigation.navigate('Login');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🔑</Text>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>Enter your new password</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Password (min 8 chars)"
              placeholderTextColor="#8E8E93"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#8E8E93"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
