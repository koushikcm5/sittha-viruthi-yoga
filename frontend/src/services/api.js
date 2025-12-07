import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, REQUEST_TIMEOUT } from '../../config';

/**
 * Helper to add a timeout to fetch calls
 */
const fetchWithTimeout = async (url, options = {}, retries = 2) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT || 15000);

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      if (i === retries || error.name === 'AbortError') {
        clearTimeout(timeout);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const getDeviceInfo = () => {
  return `Mobile Device - ${new Date().toISOString()}`;
};

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  const base = { 'Content-Type': 'application/json' };
  if (token) base['Authorization'] = `Bearer ${token}`;
  return base;
};

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text || text.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'Invalid response format', raw: text };
  }
};

export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          throw new Error('EMAIL_NOT_VERIFIED');
        }
        if (data.error === 'PENDING_APPROVAL') {
          throw new Error('PENDING_APPROVAL');
        }
        throw new Error(data.error || 'Login failed');
      }

      // store token and user info
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
      }
      if (data.username) {
        await AsyncStorage.setItem('username', data.username);
      }
      if (data.role) {
        await AsyncStorage.setItem('role', data.role);
      }

      return data;
    } catch (error) {
      // better network error message - reference API URL (production or local)
      if (error.name === 'AbortError' || error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error(`Cannot connect to server at ${API_URL}. Make sure the backend is running and reachable.`);
      }
      throw error;
    }
  },

  register: async (name, username, email, phone, password) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, phone, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        return { message: 'Registration successful. Please check your email to verify your account.' };
      }
      throw err;
    }
  },

  forgotPassword: async (email) => {
    const response = await fetchWithTimeout(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to send reset email');
    return data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await fetchWithTimeout(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await parseResponse(response);
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
    const response = await fetchWithTimeout(`${API_URL}/auth/delete-user/${username}`, {
      method: 'DELETE',
      headers
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  },

  getPendingUsers: async () => {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}/auth/pending-users`, { headers });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to fetch pending users');
    return data;
  },

  approveUser: async (username) => {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${API_URL}/auth/approve-user/${username}`, {
      method: 'POST',
      headers
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to approve user');
    return data;
  },

  verifyEmail: async (email, otp) => {
    const response = await fetchWithTimeout(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Verification failed');
    return data;
  },

  resendVerification: async (email) => {
    const response = await fetchWithTimeout(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || 'Failed to resend verification');
    return data;
  }
};

export const attendanceAPI = {
  markAttendance: async (attended) => {
    try {
      const username = await AsyncStorage.getItem('username');
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/attendance/mark`, {
        method: 'POST',
        headers: { ...headers, 'username': username },
        body: JSON.stringify({ attended, deviceInfo: getDeviceInfo() })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to mark attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getUserAttendance: async (username) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/attendance/user/${username}`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getAllAttendance: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/attendance/all`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  updateAttendance: async (id, attended) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/attendance/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ attended })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to update attendance');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/attendance/users`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  }
};

export const contentAPI = {
  getVideos: async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/content/videos`);
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch videos');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  },

  getManifestationVideo: async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/content/manifestation-video`);
      if (!response.ok) return null;
      const text = await response.text();
      return text && text !== 'null' ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Error fetching manifestation video:', error);
      return null;
    }
  },

  getHabits: async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/content/habits`);
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch habits');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  },

  addVideo: async (videoData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(videoData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add video');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  updateVideo: async (id, videoData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/video/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(videoData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to update video');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  addHabit: async (habitData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/habit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(habitData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add habit');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  updateHabit: async (id, habitData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/habit/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(habitData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to update habit');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/habit/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to delete habit');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  addWorkshop: async (workshopData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/workshop`, {
        method: 'POST',
        headers,
        body: JSON.stringify(workshopData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add workshop');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  addOrUpdateManifestationVideo: async (videoData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/manifestation-video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(videoData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to update manifestation video');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  fixHabits: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/fix-habits`, {
        method: 'POST',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fix habits');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  addRoutine: async (routineData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/admin/routine`, {
        method: 'POST',
        headers,
        body: JSON.stringify(routineData)
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to add routine');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Request timeout. Please try again.');
      throw error;
    }
  },

  getRoutines: async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/content/routines`);
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch routines');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching routines:', error);
      return [];
    }
  }
};

export const workshopAPI = {
  getWorkshops: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/workshops`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch workshops');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  },

  getWorkshopsByLevel: async (level) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/content/workshops/level/${level}`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch workshops');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching workshops:', error);
      return [];
    }
  }
};

export const notificationAPI = {
  getUserNotifications: async (username) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/notifications/${username}`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch notifications');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getUnreadCount: async (username) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/notifications/${username}/unread-count`, { headers });
      const data = await parseResponse(response);
      if (!response.ok) return 0;
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to mark as read');
      return data;
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  markAllAsRead: async (username) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/notifications/${username}/read-all`, {
        method: 'POST',
        headers
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to mark all as read');
      return data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  saveDeviceToken: async (username, token, deviceType) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(`${API_URL}/notifications/device-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, token, deviceType })
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(data.error || 'Failed to save device token');
      return data;
    } catch (error) {
      console.error('Error saving device token:', error);
      throw error;
    }
  }
};
