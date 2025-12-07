import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.10.42.68:9000/api';

export default function EnhancedUserDashboard({ navigation }) {
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('chemsing');
  const [userContent, setUserContent] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await AsyncStorage.getItem('username');
    setUsername(user);
    
    // Load user content
    const contentRes = await fetch(`${API_URL}/content/user/${user}`);
    const contentData = await contentRes.json();
    setUserContent(contentData);
    
    // Load routines
    const routinesRes = await fetch(`${API_URL}/content/routines`);
    setRoutines(await routinesRes.json());
    
    // Load habits
    const habitsRes = await fetch(`${API_URL}/content/habits`);
    setHabits(await habitsRes.json());
    
    // Load progress
    const progressRes = await fetch(`${API_URL}/content/progress/${user}`);
    setProgress(await progressRes.json());
  };

  const completeVideo = async () => {
    if (!userContent?.currentVideo) return;
    
    await fetch(`${API_URL}/content/complete-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, 
        videoId: userContent.currentVideo.id.toString() 
      })
    });
    
    Alert.alert('Success', 'Video completed! Next video unlocked.');
    loadData();
  };

  const completeRoutine = async () => {
    await fetch(`${API_URL}/content/complete-routine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    Alert.alert('Success', 'Daily routine completed!');
    loadData();
  };

  const completeHabits = async () => {
    await fetch(`${API_URL}/content/complete-habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    Alert.alert('Success', 'Habit tasks completed!');
    loadData();
  };

  const completeQA = async (answer) => {
    await fetch(`${API_URL}/content/complete-qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, answer })
    });
    Alert.alert('Success', `Your answer "${answer}" has been sent to admin.`);
    loadData();
  };

  const renderChemsingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.levelBadge}>Level {userContent?.level || 1}</Text>
      
      {userContent?.currentVideo ? (
        <View style={styles.videoCard}>
          <Text style={styles.videoTitle}>{userContent.currentVideo.title}</Text>
          <Text style={styles.videoDesc}>{userContent.currentVideo.description}</Text>
          <Text style={styles.videoUrl}>Video: {userContent.currentVideo.url}</Text>
          
          <TouchableOpacity style={styles.completeBtn} onPress={completeVideo}>
            <Text style={styles.btnText}>Mark Video Complete</Text>
          </TouchableOpacity>
          
          <Text style={styles.progressText}>
            Video {userContent.currentVideoIndex + 1} of {userContent.totalVideos}
          </Text>
        </View>
      ) : (
        <Text style={styles.noContent}>No videos available for your level</Text>
      )}
    </View>
  );

  const renderRoutineTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Daily Routine</Text>
      {Array.isArray(routines) && routines.map((routine, index) => (
        <View key={routine.id} style={styles.routineCard}>
          <Text style={styles.routineNumber}>{index + 1}</Text>
          <View style={styles.routineContent}>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.routineDesc}>{routine.description}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkbox, completedSteps[routine.id] && styles.checkboxChecked]}
            onPress={() => setCompletedSteps({...completedSteps, [routine.id]: !completedSteps[routine.id]})}
          >
            <Text style={styles.checkmark}>{completedSteps[routine.id] ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity style={styles.completeBtn} onPress={completeRoutine}>
        <Text style={styles.btnText}>Complete All Routines</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHabitsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Habit Tasks</Text>
      {Array.isArray(habits) && habits.map((habit, index) => (
        <View key={habit.id} style={styles.habitCard}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitDesc}>{habit.description}</Text>
          {habit.minValue && (
            <Text style={styles.habitTarget}>Target: {habit.minValue} {habit.unit}</Text>
          )}
          <TouchableOpacity 
            style={[styles.checkbox, completedSteps[habit.id] && styles.checkboxChecked]}
            onPress={() => setCompletedSteps({...completedSteps, [habit.id]: !completedSteps[habit.id]})}
          >
            <Text style={styles.checkmark}>{completedSteps[habit.id] ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity style={styles.completeBtn} onPress={completeHabits}>
        <Text style={styles.btnText}>Complete All Habits</Text>
      </TouchableOpacity>
      
      <View style={styles.qaSection}>
        <Text style={styles.qaTitle}>Did you complete all tasks today?</Text>
        <View style={styles.qaButtons}>
          <TouchableOpacity style={[styles.qaBtn, styles.yesBtn]} onPress={() => completeQA('Yes')}>
            <Text style={styles.btnText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qaBtn, styles.noBtn]} onPress={() => completeQA('No')}>
            <Text style={styles.btnText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {username}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('UserDashboard', { username })}>
          <Text style={styles.backBtn}>← Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chemsing' && styles.activeTab]}
          onPress={() => setActiveTab('chemsing')}
        >
          <Text style={[styles.tabText, activeTab === 'chemsing' && styles.activeTabText]}>
            Chemsing
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'routine' && styles.activeTab]}
          onPress={() => setActiveTab('routine')}
        >
          <Text style={[styles.tabText, activeTab === 'routine' && styles.activeTabText]}>
            Daily Routine
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'habits' && styles.activeTab]}
          onPress={() => setActiveTab('habits')}
        >
          <Text style={[styles.tabText, activeTab === 'habits' && styles.activeTabText]}>
            Habit Tasks
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'chemsing' && renderChemsingTab()}
        {activeTab === 'routine' && renderRoutineTab()}
        {activeTab === 'habits' && renderHabitsTab()}
      </ScrollView>

      {progress?.allTasksCompleted && (
        <View style={styles.completionBanner}>
          <Text style={styles.completionText}>🎉 All tasks completed today!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0633' },
  header: { backgroundColor: '#2E0F4A', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#D4A537', shadowColor: '#D4A537', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#D4A537', letterSpacing: 1 },
  backBtn: { color: '#D4A537', fontSize: 16, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: '#2E0F4A', borderBottomWidth: 2, borderBottomColor: '#140726' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 4, borderBottomColor: '#D4A537', backgroundColor: '#140726' },
  tabText: { fontSize: 13, color: '#999', fontWeight: '600' },
  activeTabText: { color: '#D4A537', fontWeight: '800' },
  content: { flex: 1 },
  tabContent: { padding: 20 },
  levelBadge: { fontSize: 26, fontWeight: '800', color: '#D4A537', marginBottom: 20, textAlign: 'center', textShadowColor: 'rgba(212, 165, 55, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  videoCard: { backgroundColor: '#2E0F4A', padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 2, borderColor: '#D4A537', shadowColor: '#D4A537', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  videoTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: '#D4A537' },
  videoDesc: { fontSize: 14, color: '#F5F3F0', marginBottom: 10 },
  videoUrl: { fontSize: 12, color: '#F2C94C', marginBottom: 15, fontWeight: '600' },
  progressText: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, color: '#D4A537' },
  routineCard: { backgroundColor: '#2E0F4A', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#D4A537' },
  routineNumber: { fontSize: 20, fontWeight: '800', color: '#D4A537', marginRight: 15, width: 30 },
  routineContent: { flex: 1 },
  routineName: { fontSize: 16, fontWeight: '700', marginBottom: 5, color: '#F5F3F0' },
  routineDesc: { fontSize: 14, color: '#F5F3F0' },
  habitCard: { backgroundColor: '#2E0F4A', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: '#D4A537' },
  habitName: { fontSize: 16, fontWeight: '700', marginBottom: 5, color: '#F5F3F0' },
  habitDesc: { fontSize: 14, color: '#F5F3F0', marginBottom: 5 },
  habitTarget: { fontSize: 12, color: '#D4A537', fontWeight: '700' },
  checkbox: { width: 30, height: 30, borderWidth: 3, borderColor: '#D4A537', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#D4A537' },
  checkmark: { color: '#1A0633', fontSize: 18, fontWeight: '900' },
  completeBtn: { backgroundColor: '#D4A537', padding: 16, borderRadius: 12, marginTop: 20, shadowColor: '#F2C94C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 10 },
  btnText: { color: '#1A0633', textAlign: 'center', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  qaSection: { marginTop: 30, padding: 20, backgroundColor: '#2E0F4A', borderRadius: 15, borderWidth: 2, borderColor: '#D4A537' },
  qaTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15, textAlign: 'center', color: '#D4A537' },
  qaButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  qaBtn: { flex: 1, padding: 15, borderRadius: 12, marginHorizontal: 5, shadowColor: '#D4A537', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  yesBtn: { backgroundColor: '#D4A537', borderWidth: 2, borderColor: '#F2C94C' },
  noBtn: { backgroundColor: '#2E0F4A', borderWidth: 2, borderColor: '#140726' },
  completionBanner: { backgroundColor: '#D4A537', padding: 15 },
  completionText: { color: '#1A0633', textAlign: 'center', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  noContent: { textAlign: 'center', color: '#999', marginTop: 50 }
});
