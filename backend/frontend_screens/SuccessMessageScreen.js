import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SuccessMessageScreen = ({ navigation }) => {
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.title}>Password Reset Successful</Text>
      <Text style={styles.subtitle}>
        Your password has been successfully reset. You can now login with your new password.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleBackToLogin}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  icon: {
    fontSize: 80,
    color: '#4CAF50',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuccessMessageScreen;