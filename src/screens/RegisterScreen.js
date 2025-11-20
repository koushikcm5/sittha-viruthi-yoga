import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { authAPI } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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

  const handleRegister = async () => {
    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      alert('Please fill all fields');
      return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(name, username, email, phone, password);
      alert('Registration Successful!');
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/img/logo.jpg')} style={styles.logoImage} />
              <Text style={styles.title}>Join Us</Text>
              <Text style={styles.subtitle}>Begin Your Journey</Text>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.input}
                placeholder="Username (unique)"
                placeholderTextColor="#8E8E93"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8E8E93"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#8E8E93"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Password (min 8 chars)"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
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

              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#D4AF37',
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
    letterSpacing: 2,
    textTransform: 'uppercase',
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
    marginBottom: 14,
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
    marginTop: 10,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  linkText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
});
