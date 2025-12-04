import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { validateEmail } from '../../utils/validation';

export default function VerifyEmailScreen({ route, navigation }) {
  const { email } = route.params;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  const handleVerify = async () => {
    if (!token.trim()) {
      setErrorModal('Please enter verification token');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyEmail(token);
      setSuccessModal(true);
    } catch (error) {
      setErrorModal(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorModal(emailError);
      return;
    }
    
    setResending(true);
    try {
      await authAPI.resendVerification(email);
      setErrorModal('Verification email sent! Check your inbox.');
    } catch (error) {
      setErrorModal(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/img/logo.jpg')} style={styles.logoImage} />
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Check your inbox</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.infoText}>
            We sent a verification token to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter verification token"
            placeholderTextColor="#8E8E93"
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={resending}>
            {resending ? (
              <ActivityIndicator color="#00A8A8" size="small" />
            ) : (
              <Text style={styles.resendText}>Resend Verification Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="info" size={64} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Notice</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>Email Verified!</Text>
              <Text style={styles.modalDesc}>Your email has been verified. Please wait for admin approval before signing in.</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => {
                setSuccessModal(false);
                navigation.navigate('Login');
              }}>
                <Text style={styles.modalBtnText}>Go to Login</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 85,
    height: 85,
    borderRadius: 42,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#00A8A8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B3B6F',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 19,
  },
  emailText: {
    fontWeight: '700',
    color: '#1B3B6F',
  },
  input: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 11,
    fontSize: 14,
    color: '#1B3B6F',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#00A8A8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00A8A8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: {
    color: '#00A8A8',
    fontSize: 13,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  backText: {
    color: '#6B7280',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalBtn: {
    backgroundColor: '#00A8A8',
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  successIconCircle: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
});
