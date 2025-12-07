import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(null);
  const [pendingModal, setPendingModal] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorModal('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login(username, password);
      console.log('Login response:', data);
      console.log('User role:', data.role);
      
      if (data.role === 'ADMIN') {
        console.log('Navigating to AdminDashboard');
        navigation.navigate('AdminDashboard');
      } else {
        console.log('Navigating to ChemsingDashboard');
        navigation.navigate('ChemsingDashboard', { username: data.username, name: data.name });
      }
    } catch (error) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        setErrorModal('Please verify your email before logging in. Check your inbox for the verification token.');
      } else if (error.message === 'PENDING_APPROVAL') {
        setPendingModal(true);
      } else {
        setErrorModal(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/img/logo.jpg')} style={styles.logoImage} />
            <Text style={styles.title}>Sittha Viruthi Yoga</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#8E8E93"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={styles.legalText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}> • </Text>
              <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
                <Text style={styles.legalText}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={64} color="#EF4444" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>{errorModal.includes('Pending') ? 'Account Pending' : 'Enter Valid Field'}</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.modalBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {pendingModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pendingModalContent}>
              <View style={styles.pendingIconCircle}>
                <MaterialIcons name="hourglass-empty" size={40} color="#FF9800" />
              </View>
              <Text style={styles.pendingModalTitle}>Account Pending Approval</Text>
              <Text style={styles.pendingModalDesc}>
                Your registration is under review by our admin team. You will be able to login once your account is approved.
              </Text>
              <Text style={styles.pendingModalNote}>
                This usually takes 24-48 hours. Thank you for your patience.
              </Text>
              <TouchableOpacity style={styles.pendingModalBtn} onPress={() => setPendingModal(false)}>
                <Text style={styles.pendingModalBtnText}>Understood</Text>
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
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#00A8A8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    letterSpacing: 2,
    textTransform: 'uppercase',
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
    marginBottom: 16,
    fontSize: 16,
    color: '#1B3B6F',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  forgotText: {
    color: '#00A8A8',
    textAlign: 'right',
    marginBottom: 24,
    fontSize: 13,
    fontWeight: '600',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  linkText: {
    color: '#00A8A8',
    fontSize: 14,
    fontWeight: '700',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legalText: {
    color: '#00A8A8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
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
    fontSize: 22,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 12,
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
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  pendingModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '88%',
    maxWidth: 400,
    alignItems: 'center',
  },
  pendingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pendingModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 16,
    textAlign: 'center',
  },
  pendingModalDesc: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  pendingModalNote: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pendingModalBtn: {
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  pendingModalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
