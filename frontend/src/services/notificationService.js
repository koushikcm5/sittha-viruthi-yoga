const API_URL = 'http://10.10.42.68:9000/api';

export const notificationService = {
  // Get user notifications
  async getUserNotifications(username) {
    try {
      const res = await fetch(`${API_URL}/notifications/${username}`);
      return await res.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Get unread count
  async getUnreadCount(username) {
    try {
      const res = await fetch(`${API_URL}/notifications/${username}/unread-count`);
      const data = await res.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark as read
  async markAsRead(notificationId) {
    try {
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  // Mark all as read
  async markAllAsRead(username) {
    try {
      await fetch(`${API_URL}/notifications/${username}/read-all`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },
};
