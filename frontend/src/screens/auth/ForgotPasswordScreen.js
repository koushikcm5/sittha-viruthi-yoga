import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(null);

  const handleSendOTP = async () => {
    if (!email) {
      setErrorModal('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setErrorModal('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccessModal(true);
    } catch (error) {
      setErrorModal(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal(false);
    navigation.navigate('ResetPassword', { email });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.logo}>🔐</Text>
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>We'll send you an OTP</Text>
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

            <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>OTP Sent Successfully!</Text>
              <Text style={styles.modalDesc}>
                We've sent a 6-digit OTP to your email address. Please check your inbox (and spam folder).
              </Text>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSuccessClose}>
                <Text style={styles.modalBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Error Modal */}
      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.errorModalContent}>
              <View style={styles.errorIconCircle}>
                <MaterialIcons name="error" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>Unable to Send OTP</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              <TouchableOpacity style={styles.errorModalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.modalBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#00A8A8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B3B6F',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#1B3B6F',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#00A8A8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00A8A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#00A8A8',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtn: {
    backgroundColor: '#00A8A8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  errorModalBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
