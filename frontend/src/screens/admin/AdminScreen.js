import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { attendanceAPI, authAPI } from '../../services/api';

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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
      setSuccessMessage('Attendance updated successfully');
    } catch (error) {
      console.log('Error updating attendance:', error);
      setErrorMessage('Failed to update attendance');
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

  const handleDeleteUser = (username) => {
    setDeleteUserModal(username);
  };

  const confirmDeleteUser = async () => {
    const username = deleteUserModal;
    setDeleteUserModal(null);
    try {
      await authAPI.deleteUser(username);
      setSuccessMessage(`User "${username}" has been removed`);
      loadAllUsers();
      loadRegisteredUsersCount();
      loadAttendanceData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to remove user');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity style={styles.contentButton} onPress={() => navigation.navigate('AdminContentManager')}>
            <Text style={styles.logoutText}>Content</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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

      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <View style={styles.logoutIconCircle}>
              <MaterialIcons name="logout" size={52} color="#FF9800" />
            </View>
            <Text style={styles.logoutModalTitle}>Logout</Text>
            <Text style={styles.logoutModalDesc}>Are you sure you want to logout?</Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity 
                style={styles.logoutCancelBtn} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutConfirmBtn} 
                onPress={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
              >
                <Text style={styles.logoutConfirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {deleteUserModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.logoutModalContent}>
              <View style={[styles.logoutIconCircle, {backgroundColor: '#FFEBEE'}]}>
                <MaterialIcons name="warning" size={52} color="#EF4444" />
              </View>
              <Text style={styles.logoutModalTitle}>Remove User</Text>
              <Text style={styles.logoutModalDesc}>
                Remove "{deleteUserModal}" from the system?{"\n\n"}
                This will permanently delete:{"\n"}
                • User account{"\n"}
                • All attendance records{"\n"}
                • Cannot be undone
              </Text>
              <View style={styles.logoutModalButtons}>
                <TouchableOpacity 
                  style={styles.logoutCancelBtn} 
                  onPress={() => setDeleteUserModal(null)}
                >
                  <Text style={styles.logoutCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.logoutConfirmBtn} 
                  onPress={confirmDeleteUser}
                >
                  <Text style={styles.logoutConfirmText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {successMessage && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.logoutModalContent}>
              <View style={[styles.logoutIconCircle, {backgroundColor: '#E8F5E9'}]}>
                <MaterialIcons name="check-circle" size={52} color="#10B981" />
              </View>
              <Text style={styles.logoutModalTitle}>Success</Text>
              <Text style={styles.logoutModalDesc}>{successMessage}</Text>
              <TouchableOpacity 
                style={[styles.logoutConfirmBtn, {width: '100%'}]} 
                onPress={() => setSuccessMessage(null)}
              >
                <Text style={styles.logoutConfirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {errorMessage && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.logoutModalContent}>
              <View style={[styles.logoutIconCircle, {backgroundColor: '#FFEBEE'}]}>
                <MaterialIcons name="error" size={52} color="#EF4444" />
              </View>
              <Text style={styles.logoutModalTitle}>Error</Text>
              <Text style={styles.logoutModalDesc}>{errorMessage}</Text>
              <TouchableOpacity 
                style={[styles.logoutConfirmBtn, {width: '100%'}]} 
                onPress={() => setErrorMessage(null)}
              >
                <Text style={styles.logoutConfirmText}>OK</Text>
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
    backgroundColor: '#1A0633',
  },
  header: {
    backgroundColor: '#2E0F4A',
    paddingTop: 90,
    paddingBottom: 40,
    paddingHorizontal: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#D4A537',
    shadowColor: '#D4A537',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 15,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#D4A537',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(212, 165, 55, 0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  logoutButton: {
    backgroundColor: '#D4A537',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 18,
    shadowColor: '#F2C94C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  contentButton: {
    backgroundColor: '#2E0F4A',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#D4A537',
  },
  logoutText: {
    color: '#1A0633',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  content: {
    flex: 1,
    padding: 45,
  },
  registeredCard: {
    backgroundColor: '#2E0F4A',
    padding: 60,
    borderRadius: 30,
    marginBottom: 45,
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#D4A537',
    shadowColor: '#D4A537',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 22,
    elevation: 18,
  },
  registeredLabel: {
    fontSize: 44,
    color: '#D4A537',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 24,
  },
  registeredValue: {
    fontSize: 130,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tapHint: {
    fontSize: 34,
    color: '#8E8E93',
    marginTop: 24,
    letterSpacing: 0.9,
  },
  usersModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 36,
    padding: 60,
    width: '92%',
    maxHeight: '82%',
    borderWidth: 4,
    borderColor: '#D4AF37',
  },
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
    paddingBottom: 26,
    borderBottomWidth: 3,
    borderBottomColor: '#333333',
  },
  usersTitle: {
    fontSize: 54,
    fontWeight: '700',
    color: '#D4AF37',
  },
  usersList: {
    maxHeight: 620,
  },
  userCard: {
    backgroundColor: '#000000',
    padding: 45,
    borderRadius: 28,
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 42,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  userUsername: {
    fontSize: 36,
    color: '#8E8E93',
    marginBottom: 14,
  },
  userDetail: {
    fontSize: 36,
    color: '#8E8E93',
    marginBottom: 10,
  },
  userLevel: {
    fontSize: 36,
    color: '#D4AF37',
    fontWeight: '600',
    marginTop: 10,
  },
  userDate: {
    fontSize: 36,
    color: '#666666',
    marginTop: 16,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 45,
  },
  statCard: {
    flex: 1,
    padding: 45,
    borderRadius: 26,
    marginHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#2E0F4A',
    borderWidth: 5,
    borderColor: '#D4A537',
  },
  statValue: {
    fontSize: 95,
    fontWeight: '800',
    color: '#D4A537',
  },
  statLabel: {
    fontSize: 30,
    color: '#F5F3F0',
    marginTop: 18,
    letterSpacing: 0.9,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 24,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2E0F4A',
    paddingHorizontal: 36,
    paddingVertical: 30,
    borderRadius: 24,
    fontSize: 36,
    color: '#F5F3F0',
    borderWidth: 5,
    borderColor: '#D4A537',
  },
  calendarButton: {
    backgroundColor: '#140726',
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 5,
    borderColor: '#D4A537',
  },
  calendarIconContainer: {
    width: 52,
    height: 52,
  },
  calendarTop: {
    height: 12,
    backgroundColor: '#D4A537',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  calendarBody: {
    flex: 1,
    borderWidth: 4,
    borderColor: '#D4A537',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 28,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#D4A537',
    borderRadius: 3,
  },
  dateFilterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 36,
    borderRadius: 26,
    marginBottom: 45,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  dateFilterText: {
    color: '#D4AF37',
    fontSize: 36,
    fontWeight: '600',
  },
  clearFilterText: {
    color: '#D4AF37',
    fontSize: 48,
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
    borderRadius: 36,
    padding: 60,
    width: '92%',
    borderWidth: 4,
    borderColor: '#D4AF37',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
  },
  calendarTitle: {
    fontSize: 54,
    fontWeight: '700',
    color: '#D4AF37',
  },
  closeButton: {
    fontSize: 62,
    color: '#D4AF37',
    fontWeight: '700',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 30,
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
    marginVertical: 4,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
  },
  calendarDayText: {
    color: '#FFFFFF',
    fontSize: 36,
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
    marginBottom: 45,
    gap: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 28,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#333333',
  },
  filterActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterText: {
    fontSize: 34,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.9,
  },
  filterTextActive: {
    color: '#000000',
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 54,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 40,
    letterSpacing: 1.3,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 36,
    marginTop: 50,
  },
  recordCard: {
    backgroundColor: '#2E0F4A',
    padding: 40,
    borderRadius: 26,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#D4A537',
  },
  recordInfo: {
    flex: 1,
  },
  recordUser: {
    fontSize: 42,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordDate: {
    fontSize: 36,
    color: '#8E8E93',
    marginTop: 16,
  },
  recordLevel: {
    fontSize: 34,
    color: '#D4A537',
    marginTop: 14,
    fontWeight: '600',
  },
  recordBadge: {
    paddingHorizontal: 36,
    paddingVertical: 24,
    borderRadius: 24,
    shadowColor: '#D4A537',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  attendedBadge: {
    backgroundColor: '#D4A537',
  },
  absentBadge: {
    backgroundColor: '#140726',
    borderWidth: 5,
    borderColor: '#2E0F4A',
  },
  recordBadgeText: {
    color: '#1A0633',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  deleteButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 40,
    paddingVertical: 28,
    borderRadius: 24,
    marginLeft: 32,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  deleteButtonText: {
    color: '#D4AF37',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  logoutModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 42,
    width: '85%',
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
  },

  logoutModalTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 16,
  },
  logoutModalDesc: {
    fontSize: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutCancelText: {
    color: '#6B7280',
    fontSize: 22,
    fontWeight: '700',
  },
  logoutConfirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
});
