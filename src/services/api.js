import AsyncStorage from '@react-native-async-storage/async-storage';

// Choose based on your device:
const API_URL = 'http://10.10.42.68:9000/api'; // For physical device (use your PC's IP)
// const API_URL = 'http://10.0.2.2:9000/api'; // For Android emulator
// const API_URL = 'http://localhost:9000/api'; // For iOS simulator

const getDeviceInfo = () => {
  return `Mobile Device - ${new Date().toISOString()}`;
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
      if (!response.ok) throw new Error(data.error || 'Login failed');
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
    const response = await fetch(`${API_URL}/auth/delete-user/${username}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  }
};

export const attendanceAPI = {
  markAttendance: async (attended) => {
    const username = await AsyncStorage.getItem('username');
    const response = await fetch(`${API_URL}/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'username': username
      },
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
    const response = await fetch(`${API_URL}/attendance/user/${username}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
    return data;
  },

  getAllAttendance: async () => {
    const response = await fetch(`${API_URL}/attendance/all`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
    return data;
  },

  updateAttendance: async (id, attended) => {
    const response = await fetch(`${API_URL}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attended })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update attendance');
    return data;
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/attendance/users`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
    return data;
  }
};
