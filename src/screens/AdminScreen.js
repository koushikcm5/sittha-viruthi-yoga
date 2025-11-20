import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, TextInput, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { attendanceAPI, authAPI } from '../services/api';

export default function AdminScreen({ navigation }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    attended: 0,
    absent: 0,
  });
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);

  useEffect(() => {
    loadAttendanceData();
    loadRegisteredUsersCount();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const data = await attendanceAPI.getAllAttendance();
      const records = data.filter(r => r.username !== 'admin');
      setAttendanceData(records);
      
      const attended = records.filter(r => r.attended).length;
      const absent = records.filter(r => !r.attended).length;
      
      setStats({
        totalUsers: records.length,
        attended,
        absent,
      });
    } catch (error) {
      console.log('Error loading attendance:', error);
    }
  };
  
  const loadAllUsers = async () => {
    try {
      const users = await attendanceAPI.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.log('Error loading users:', error);
    }
  };
  
  const loadRegisteredUsersCount = async () => {
    try {
      const users = await attendanceAPI.getAllUsers();
      setRegisteredUsers(users.length);
    } catch (error) {
      console.log('Error loading registered users count:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendanceData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigation.navigate('Login');
  };

  const toggleAttendance = async (index) => {
    const recordIndex = attendanceData.length - 1 - index;
    const record = attendanceData[recordIndex];
    
    try {
      await attendanceAPI.updateAttendance(record.id, !record.attended);
      await loadAttendanceData();
      Alert.alert('Success', 'Attendance updated successfully');
    } catch (error) {
      console.log('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const getFilteredData = () => {
    let filtered = attendanceData;

    if (selectedDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date).toDateString();
        return recordDate === selectedDate.toDateString();
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === 'attended') {
      filtered = filtered.filter(record => record.attended);
    } else if (filter === 'absent') {
      filtered = filtered.filter(record => !record.attended);
    }

    return filtered;
  };
  
  const getStats = () => {
    const filtered = getFilteredData();
    const attended = filtered.filter(r => r.attended).length;
    const absent = filtered.filter(r => !r.attended).length;
    
    return {
      totalUsers: filtered.length,
      attended,
      absent,
    };
  };
  
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
    const filtered = attendanceData.filter(record => {
      const recordDate = new Date(record.date).toDateString();
      return recordDate === date.toDateString();
    });
    const attended = filtered.filter(r => r.attended).length;
    const absent = filtered.filter(r => !r.attended).length;
    setStats({
      totalUsers: filtered.length,
      attended,
      absent,
    });
  };
  
  const clearDateFilter = () => {
    setSelectedDate(null);
    loadAttendanceData();
  };

  const handleDeleteUser = async (username) => {
    Alert.alert(
      'Remove User',
      `Remove "${username}" from the system?\n\nThis will permanently delete:\n• User account\n• All attendance records\n• Cannot be undone`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.deleteUser(username);
              Alert.alert('Removed', `User "${username}" has been removed`);
              loadAllUsers();
              loadRegisteredUsersCount();
              loadAttendanceData();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to remove user');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableOpacity 
          style={styles.registeredCard}
          onPress={() => {
            loadAllUsers();
            setShowUsersModal(true);
          }}
        >
          <Text style={styles.registeredLabel}>Total Registered Users</Text>
          <Text style={styles.registeredValue}>{registeredUsers}</Text>
          <Text style={styles.tapHint}>Tap to view details</Text>
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedDate ? getStats().totalUsers : stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Attendance</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedDate ? getStats().attended : stats.attended}</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedDate ? getStats().absent : stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search username..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setShowCalendar(true)}
          >
            <View style={styles.calendarIconContainer}>
              <View style={styles.calendarTop} />
              <View style={styles.calendarBody}>
                <View style={styles.calendarDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {selectedDate && (
          <View style={styles.dateFilterBar}>
            <Text style={styles.dateFilterText}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={clearDateFilter}>
              <Text style={styles.clearFilterText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.filterActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'attended' && styles.filterActive]}
            onPress={() => setFilter('attended')}
          >
            <Text style={[styles.filterText, filter === 'attended' && styles.filterTextActive]}>Attended</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'absent' && styles.filterActive]}
            onPress={() => setFilter('absent')}
          >
            <Text style={[styles.filterText, filter === 'absent' && styles.filterTextActive]}>Absent</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Records</Text>
          {getFilteredData().length === 0 ? (
            <Text style={styles.emptyText}>No records found</Text>
          ) : (
            getFilteredData().slice().reverse().map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordUser}>{record.username}</Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                  <Text style={styles.recordLevel}>Level {record.level}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.recordBadge, record.attended ? styles.attendedBadge : styles.absentBadge]}
                  onPress={() => toggleAttendance(index)}
                >
                  <Text style={styles.recordBadgeText}>{record.attended ? 'Present' : 'Absent'}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarGrid}>
              {generateCalendarDays().map((day, index) => {
                const isFuture = day && day > new Date();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !day && styles.emptyDay,
                      isFuture && styles.disabledDay,
                      day && selectedDate && day.toDateString() === selectedDate.toDateString() && styles.selectedDay
                    ]}
                    onPress={() => day && !isFuture && handleDateSelect(day)}
                    disabled={!day || isFuture}
                  >
                    {day && <Text style={[styles.calendarDayText, isFuture && styles.disabledText]}>{day.getDate()}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showUsersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUsersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.usersModal}>
            <View style={styles.usersHeader}>
              <Text style={styles.usersTitle}>Registered Users ({registeredUsers})</Text>
              <TouchableOpacity onPress={() => setShowUsersModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.usersList}>
              {allUsers.map((user, index) => (
                <View key={index} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>UserName: {user.username}</Text>
                    <Text style={styles.userDetail}>Email: {user.email}</Text>
                    <Text style={styles.userDetail}>Phone: {user.phone}</Text>
                    <Text style={styles.userLevel}>Level {user.level} • {user.monthsCompleted} months completed</Text>
                    <Text style={styles.userDate}>Registered: {new Date(user.createdAt).toLocaleString()}</Text>
                  </View>
                  {user.username !== 'admin' && (
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser(user.username)}
                    >
                      <Text style={styles.deleteButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  logoutButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  registeredCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  registeredLabel: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  registeredValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tapHint: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  usersModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  usersList: {
    maxHeight: 400,
  },
  userCard: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  userDetail: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
    marginTop: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  calendarButton: {
    backgroundColor: '#000000',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  calendarIconContainer: {
    width: 28,
    height: 28,
  },
  calendarTop: {
    height: 6,
    backgroundColor: '#D4AF37',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  calendarBody: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 16,
    gap: 3,
  },
  dot: {
    width: 3,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 1.5,
  },
  dateFilterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dateFilterText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  clearFilterText: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  closeButton: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '700',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
  },
  calendarDayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledText: {
    color: '#666666',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#000000',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 20,
  },
  recordCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  recordInfo: {
    flex: 1,
  },
  recordUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
  },
  recordLevel: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 4,
  },
  recordBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  attendedBadge: {
    backgroundColor: '#D4AF37',
  },
  absentBadge: {
    backgroundColor: '#666666',
  },
  recordBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deleteButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  deleteButtonText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
