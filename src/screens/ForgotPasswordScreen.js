import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { authAPI } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleSendToken = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      alert('Reset token sent to your email! Copy and paste it below.');
      setShowTokenInput(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!token) {
      alert('Please enter the token from your email');
      return;
    }
    navigation.navigate('ResetPassword', { token });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🔐</Text>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>We'll send you a reset link</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {!showTokenInput ? (
              <TouchableOpacity style={styles.button} onPress={handleSendToken} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Token</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Paste Token from Email"
                  placeholderTextColor="#8E8E93"
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleContinue}>
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backText}>← Back to Login</Text>
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
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '500',
  },
});
