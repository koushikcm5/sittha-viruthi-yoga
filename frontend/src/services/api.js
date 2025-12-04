import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';

const getDeviceInfo = () => {
  return `Mobile Device - ${new Date().toISOString()}`;
};

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        if (data.error === 'PENDING_APPROVAL') {
          throw new Error('PENDING_APPROVAL');
        }
        throw new Error(data.error || 'Login failed');
      }
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('username', data.username);
      await AsyncStorage.setItem('role', data.role);
      return data;
    } catch (error) {
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Backend must be running on port 9000.');
      }
      throw error;
    }
  },

  register: async (name, username, email, phone, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, phone, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send reset email');
    return data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('role');
  },

  deleteUser: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/auth/delete-user/${username}`, {
      method: 'DELETE',
      headers
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  getPendingUsers: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/auth/pending-users`, { headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch pending users');
    return data;
  },

  approveUser: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/auth/approve-user/${username}`, {
      method: 'POST',
      headers
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to approve user');
    return data;
  },

  verifyEmail: async (token) => {
    const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Verification failed');
    return data;
  },

  resendVerification: async (email) => {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to resend verification');
    return data;
  }
};

export const attendanceAPI = {
  markAttendance: async (attended) => {
    const username = await AsyncStorage.getItem('username');
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/attendance/mark`, {
      method: 'POST',
      headers: { ...headers, 'username': username },
      body: JSON.stringify({
        attended,
        deviceInfo: getDeviceInfo()
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to mark attendance');
    return data;
  },

  getUserAttendance: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/attendance/user/${username}`, { headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
    return data;
  },

  getAllAttendance: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/attendance/all`, { headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
    return data;
  },

  updateAttendance: async (id, attended) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/attendance/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ attended })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update attendance');
    return data;
  },

  getAllUsers: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/attendance/users`, { headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
    return data;
  }
};
