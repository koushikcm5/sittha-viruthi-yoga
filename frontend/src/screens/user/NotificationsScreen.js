import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../../services/notificationService';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const getFilteredNotifications = () => {
    if (filter === 'ALL') return notifications;
    if (filter === 'UNREAD') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  };

  const getNotificationCounts = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const success = notifications.filter(n => n.type === 'SUCCESS').length;
    const reminders = notifications.filter(n => n.type === 'REMINDER').length;
    return { total, unread, success, reminders };
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const username = await AsyncStorage.getItem('username');
    const data = await notificationService.getUserNotifications(username);
    setNotifications(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    await notificationService.markAsRead(notification.id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    const username = await AsyncStorage.getItem('username');
    await notificationService.markAllAsRead(username);
    loadNotifications();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return 'check-circle';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      case 'REMINDER': return 'alarm';
      case 'WORKSHOP': return 'event';
      case 'SESSION': return 'video-library';
      case 'APPOINTMENT': return 'calendar-today';
      case 'QA': return 'question-answer';
      case 'ATTENDANCE': return 'how-to-reg';
      case 'LEVEL_UP': return 'trending-up';
      case 'VIDEO': return 'play-circle-filled';
      default: return 'notifications';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'SUCCESS': return '#10B981';
      case 'WARNING': return '#F59E0B';
      case 'INFO': return '#3B82F6';
      case 'REMINDER': return '#8B5CF6';
      case 'LEVEL_UP': return '#F59E0B';
      default: return '#00A8A8';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}>
      <View style={[styles.iconCircle, { backgroundColor: `${getIconColor(item.type)}20` }]}>
        <MaterialIcons name={getIcon(item.type)} size={24} color={getIconColor(item.type)} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ChemsingDashboard')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#1B3B6F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterTabs}>
        {['ALL', 'UNREAD', 'SUCCESS', 'REMINDER'].map(tab => {
          const counts = getNotificationCounts();
          const count = tab === 'ALL' ? counts.total : 
                      tab === 'UNREAD' ? counts.unread :
                      tab === 'SUCCESS' ? counts.success : counts.reminders;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.activeFilterTab]}
              onPress={() => setFilter(tab)}>
              <Text style={[styles.filterTabText, filter === tab && styles.activeFilterTabText]}>
                {tab} {count > 0 && `(${count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1B3B6F', flex: 1, textAlign: 'center' },
  markAllText: { fontSize: 14, color: '#00A8A8', fontWeight: '600' },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  unreadCard: { 
    backgroundColor: '#F0F9FF', 
    borderLeftWidth: 4, 
    borderLeftColor: '#00A8A8' 
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7F7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationContent: { flex: 1 },
  notificationTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1B3B6F', 
    marginBottom: 4 
  },
  notificationMessage: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginBottom: 4,
    lineHeight: 20
  },
  notificationTime: { fontSize: 12, color: '#9CA3AF' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A8A8'
  },
  emptyState: { 
    alignItems: 'center', 
    marginTop: 100,
    padding: 20
  },
  emptyText: { 
    fontSize: 16, 
    color: '#9CA3AF', 
    marginTop: 16 
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6'
  },
  activeFilterTab: {
    backgroundColor: '#00A8A8'
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280'
  },
  activeFilterTabText: {
    color: '#FFFFFF'
  }
});
