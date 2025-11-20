import axios from 'axios';

// Replace with your actual backend URL
// For development: http://10.0.2.2:9000 (Android emulator) or http://localhost:9000 (iOS simulator)
// For production: your deployed backend URL
const API_URL = 'http://10.0.2.2:9000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendForgotPasswordRequest = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to send reset email');
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to reset password');
  }
};

export default api;