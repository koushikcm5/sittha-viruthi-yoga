import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import SecureVideoPlayer from '../../components/common/SecureVideoPlayer';
import { notificationService } from '../../services/notificationService';

const API_URL = 'http://10.10.42.68:9000/api';

export default function ChemsingDashboard({ navigation, route }) {
  const [user, setUser] = useState({ name: '', level: 1 });
  const [videos, setVideos] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('levels');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [habitModal, setHabitModal] = useState(null);
  const [completionModal, setCompletionModal] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [workshops, setWorkshops] = useState([]);
  const [sessionWorkshops, setSessionWorkshops] = useState([]);
  const [menuModal, setMenuModal] = useState(false);
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [manifestationVideo, setManifestationVideo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadDashboard();
    loadManifestationVideo();
    loadAppointments();
    loadQA();
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    const username = await AsyncStorage.getItem('username');
    const count = await notificationService.getUnreadCount(username);
    setUnreadCount(count);
  };

  useEffect(() => {
    if (user.level) {
      loadWorkshops(user.level);
    }
  }, [user.level]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.completedStep) {
        const step = route.params.completedStep;
        setCompletedSteps(prev => ({...prev, [step]: true}));
        navigation.setParams({ completedStep: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.completedStep]);

  useEffect(() => {
    if (activeTab === 'support') {
      loadAppointments();
      loadQA();
      loadSessionWorkshops(user.level);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'habits') {
      loadHabits();
    }
  }, [activeTab]);

  const loadHabits = async () => {
    const hRes = await fetch(`${API_URL}/content/habits`);
    setHabits(await hRes.json());
  };

  const loadDashboard = async () => {
    const username = await AsyncStorage.getItem('username');
    const res = await fetch(`${API_URL}/content/user/${username}`);
    const data = await res.json();
    
    setUser({ name: username, level: data.level });
    setProgress(((data.currentVideoIndex / data.totalVideos) * 100) || 0);
    
    const rRes = await fetch(`${API_URL}/content/routines`);
    setRoutines(await rRes.json());
    
    const hRes = await fetch(`${API_URL}/content/habits`);
    setHabits(await hRes.json());
    
    // Get days completed
    const pRes = await fetch(`${API_URL}/content/progress/${username}`);
    const pData = await pRes.json();
    // Calculate days from attendance records
    const aRes = await fetch(`${API_URL}/attendance/user/${username}`);
    const aData = await aRes.json();
    setDaysCompleted(Array.isArray(aData) ? aData.filter(a => a.attended).length : 0);
  };

  const loadManifestationVideo = async () => {
    try {
      const res = await fetch(`${API_URL}/content/manifestation-video`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setManifestationVideo(data);
        }
      }
    } catch (error) {
      // Silently fail if manifestation video not available yet
    }
  };

  const loadAppointments = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const res = await fetch(`${API_URL}/appointments/user/${username}`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setAppointments(Array.isArray(data) ? data : []);
        } else {
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.log('Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const loadQA = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const res = await fetch(`${API_URL}/qa/user/${username}`);
      if (res.ok) {
        const data = await res.json();
        setQaList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.log('Error loading Q&A:', error);
      setQaList([]);
    }
  };

  const askQuestion = async () => {
    if (!newQuestion.trim()) {
      setCustomErrorModal('Please enter your question');
      return;
    }
    try {
      const username = await AsyncStorage.getItem('username');
      const res = await fetch(`${API_URL}/qa/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, question: newQuestion })
      });
      if (res.ok) {
        setQaModal(false);
        setNewQuestion('');
        setCustomSuccessModal('Your question has been submitted! Admin will reply soon.');
        loadQA();
      }
    } catch (error) {
      setCustomErrorModal('Failed to submit question');
    }
  };

  const requestAppointment = async () => {
    if (!appointmentReason.trim()) {
      setCustomErrorModal('Please enter a reason for your appointment');
      return;
    }
    try {
      const username = await AsyncStorage.getItem('username');
      
      const res = await fetch(`${API_URL}/appointments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, reason: appointmentReason })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAppointmentModal(false);
        setAppointmentReason('');
        setCustomSuccessModal('Appointment request submitted! Admin will review and schedule it.');
        loadAppointments();
      } else {
        setCustomErrorModal(data.error || 'Failed to submit appointment request');
      }
    } catch (error) {
      setCustomErrorModal('Failed to submit appointment request. Please try again.');
    }
  };

  const loadLevelVideos = async (level) => {
    try {
      const vRes = await fetch(`${API_URL}/content/videos`);
      const allVideos = await vRes.json();
      const levelVideos = Array.isArray(allVideos) ? allVideos.filter(v => v.level === level) : [];
      setVideos(levelVideos);
    } catch (error) {
      console.log('Error loading videos:', error);
      setVideos([]);
    }
  };

  const loadWorkshops = async (level) => {
    try {
      const wRes = await fetch(`${API_URL}/content/workshops/${level}`);
      const data = await wRes.json();
      setWorkshops(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading workshops:', error);
      setWorkshops([]);
    }
  };

  const loadSessionWorkshops = async (level) => {
    try {
      const sRes = await fetch(`${API_URL}/content/workshops/sessions/${level}`);
      const data = await sRes.json();
      setSessionWorkshops(Array.isArray(data) ? data : []);
    } catch (error) {
      setSessionWorkshops([]);
    }
  };

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const playVideo = (videoUrl) => {
    setPlayingVideo(videoUrl);
  };

  const [videoCompletionModal, setVideoCompletionModal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [lockedModal, setLockedModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [routineCompleteModal, setRoutineCompleteModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState('');
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [routineCompleted, setRoutineCompleted] = useState(false);
  const [qaList, setQaList] = useState([]);
  const [qaModal, setQaModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [incompleteModal, setIncompleteModal] = useState(null);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [expandedQA, setExpandedQA] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [customSuccessModal, setCustomSuccessModal] = useState(null);
  const [customErrorModal, setCustomErrorModal] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const completeVideo = async (videoId) => {
    setVideoCompletionModal(videoId);
  };

  const confirmVideoCompletion = async () => {
    const username = await AsyncStorage.getItem('username');
    await fetch(`${API_URL}/content/complete-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, videoId: videoCompletionModal.toString() })
    });
    setVideoCompletionModal(null);
    setVideoCompleted(true);
    setActiveTab('routine');
    loadDashboard();
  };

  const submitHabit = async (habitId, answer) => {
    const username = await AsyncStorage.getItem('username');
    await fetch(`${API_URL}/content/complete-habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    setHabitModal(null);
    setCompletionModal(true);
  };

  const markAttendance = async (attended) => {
    const username = await AsyncStorage.getItem('username');
    try {
      if (attended) {
        // Validation already done in submit button
        // Just mark all progress as completed for Present
        
        // Mark all progress as completed for Present
        await fetch(`${API_URL}/content/complete-routine`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        
        await fetch(`${API_URL}/content/complete-habits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
      }
      // For Absent: Don't mark any tasks as completed
      
      // Mark attendance
      const response = await fetch(`${API_URL}/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'username': username },
        body: JSON.stringify({ attended, deviceInfo: 'Mobile' })
      });
      
      const data = await response.json();
      
      setCompletionModal(false);
      
      if (!response.ok) {
        setErrorModal(data.error || 'Attendance already marked for today');
        return;
      }
      
      setSuccessModal(attended ? 'Present' : 'Absent');
      await loadDashboard();
      setActiveTab('levels');
      // Reset completion flags for next day
      setVideoCompleted(false);
      setRoutineCompleted(false);
      setCompletedSteps({});
    } catch (error) {
      setCompletionModal(false);
      setErrorModal('Failed to mark attendance. Please try again.');
    }
  };

  const getLevelColor = (level) => {
    const colors = { 1: '#00B894', 2: '#FF9F43', 3: '#9B59B6' };
    return colors[level] || '#00B894';
  };

  const getLevelName = (level) => {
    const names = { 1: 'NarKarma Viruthi', 2: 'Suya Viruthi', 3: 'Yoga Viruthi' };
    return names[level] || 'Level 1';
  };

  const groupVideosByPart = (videos) => {
    const part1 = videos.filter(v => v.part === 1 || v.part === 'Part 1');
    const part2 = videos.filter(v => v.part === 2 || v.part === 'Part 2');
    return { part1, part2 };
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('role');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hello, {user.name}</Text>
            <View style={[styles.levelPill, { backgroundColor: getLevelColor(user.level) }]}>
              <Text style={styles.levelText}>Level {user.level}</Text>
            </View>
          </View>
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <MaterialIcons name="notifications" size={28} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuModal(true)}>
            <MaterialIcons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressStrip}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(() => {
            if (user.level === 1) return Math.min((daysCompleted / 120) * 100, 100);
            if (user.level === 2) return Math.min(((daysCompleted - 120) / 120) * 100, 100);
            if (user.level === 3) return Math.min(((daysCompleted - 240) / 120) * 100, 100);
            return 0;
          })()}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {user.level === 1 && `${daysCompleted}/120 days to Level 2`}
          {user.level === 2 && `${daysCompleted - 120}/120 days to Level 3`}
          {user.level === 3 && `${daysCompleted - 240}/120 days - Completed!`}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'levels' && (
          <View>
            {/* Welcome Banner */}
            <View style={styles.welcomeBanner}>
              <View style={styles.bannerGradient}>
                <Text style={styles.bannerTitle}>Welcome to Your Journey</Text>
                <Text style={styles.bannerSubtitle}>Transform your life</Text>
                <View style={styles.bannerStats}>
                  <View style={styles.bannerStatItem}>
                    <Text style={styles.bannerStatValue}>{daysCompleted}</Text>
                    <Text style={styles.bannerStatLabel}>Days</Text>
                  </View>
                  <View style={styles.bannerDivider} />
                  <View style={styles.bannerStatItem}>
                    <Text style={styles.bannerStatValue}>Level {user.level}</Text>
                    <Text style={styles.bannerStatLabel}>{getLevelName(user.level)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('routine')}>
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="self-improvement" size={32} color="#00A8A8" />
                </View>
                <Text style={styles.quickActionTitle}>Daily Routine</Text>
                <Text style={styles.quickActionDesc}>7 Steps to Wellness</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveTab('habits')}>
                <View style={styles.quickActionIcon}>
                  <MaterialIcons name="task-alt" size={32} color="#10B981" />
                </View>
                <Text style={styles.quickActionTitle}>Habits</Text>
                <Text style={styles.quickActionDesc}>Track Progress</Text>
              </TouchableOpacity>
            </View>

            {/* Workshops Section */}
            <View style={styles.luxuryCard}>
              <View style={styles.luxuryCardHeader}>
                <MaterialIcons name="event" size={24} color="#00A8A8" />
                <Text style={styles.luxuryCardTitle}>Upcoming Workshops</Text>
              </View>
              {selectedLevel && <Text style={styles.workshopSubtitle}>Level {selectedLevel} - {getLevelName(selectedLevel)}</Text>}
              {Array.isArray(workshops) && workshops.length > 0 ? (
                workshops.map((workshop) => (
                  <View key={workshop.id} style={styles.premiumWorkshopCard}>
                    <View style={styles.workshopBadgeRow}>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(workshop.level) }]}>
                        <Text style={styles.levelBadgeText}>Level {workshop.level}</Text>
                      </View>
                      <Text style={styles.workshopTime}>
                        {new Date(workshop.startTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <Text style={styles.premiumWorkshopTitle}>{workshop.title}</Text>
                    <Text style={styles.workshopDesc}>{workshop.description}</Text>
                    <TouchableOpacity 
                      style={styles.premiumJoinBtn} 
                      onPress={() => Linking.openURL(workshop.link)}>
                      <MaterialIcons name="open-in-new" size={20} color="#FFF" />
                      <Text style={styles.joinBtnText}>Join Workshop</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="event-available" size={48} color="#E5E7EB" />
                  <Text style={styles.emptyStateText}>No workshops scheduled</Text>
                  <Text style={styles.emptyStateSubtext}>Check back soon</Text>
                </View>
              )}
            </View>
          </View>
        )}


        {activeTab === 'chemsing' && selectedLevel && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Videos → {getLevelName(selectedLevel)}</Text>
              {!Array.isArray(videos) || videos.length === 0 ? (
                <Text style={styles.noVideos}>No videos available yet</Text>
              ) : (
                videos.map((video, i) => (
                  <View key={video.id} style={styles.videoTile}>
                    <View style={styles.videoThumb}>
                      <Text style={styles.orderBadge}>#{i + 1}</Text>
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle}>{video.title}</Text>
                      <Text style={styles.videoDuration}>{video.description}</Text>
                    </View>
                    <TouchableOpacity style={styles.playBtn} onPress={() => completeVideo(video.id)}>
                      <Text style={styles.playBtnText}>Play</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            {/* Workshops Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Upcoming Workshops</Text>
              <Text style={styles.workshopSubtitle}>Level {selectedLevel} - {getLevelName(selectedLevel)}</Text>
              {Array.isArray(workshops) && workshops.length > 0 ? (
                workshops.map((workshop) => (
                  <View key={workshop.id} style={styles.workshopCard}>
                    <View style={styles.workshopHeader}>
                      <Text style={styles.workshopTime}>
                        {new Date(workshop.startTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(workshop.level) }]}>
                        <Text style={styles.levelBadgeText}>Level {workshop.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.workshopTitle}>{workshop.title}</Text>
                    <Text style={styles.workshopDesc}>{workshop.description}</Text>
                    <TouchableOpacity 
                      style={styles.joinBtn} 
                      onPress={() => Linking.openURL(workshop.link)}>
                      <Text style={styles.joinBtnText}>Join Workshop →</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noWorkshops}>No workshops scheduled yet</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'routine' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Routine (7 Steps)</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
            
            {/* Step 1: Chakra Cleansing - WITH LEVELS */}
            <TouchableOpacity style={styles.stepCard} onPress={() => setExpandedStep(expandedStep === 1 ? null : 1)}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepTitle}>Chakra Cleansing</Text>
                {completedSteps[1] && <Text style={styles.checkMark}>✓</Text>}
              </View>
              {expandedStep === 1 && (
                <View style={styles.stepContent}>
                  <Text style={styles.stepDesc}>Cleanse and balance your seven chakras through meditation and energy work.</Text>
                  
                  {/* LEVELS MOVED HERE */}
                  <View style={{marginTop: 16}}>
                    <Text style={[styles.cardTitle, {marginBottom: 16}]}>Select Your Level</Text>
                    
                    {/* Level 1 */}
                    <TouchableOpacity 
                      style={[styles.levelCard, { borderColor: '#00B894', marginBottom: 12 }]} 
                      onPress={() => { 
                        if (selectedLevel === 1) {
                          setSelectedLevel(null);
                          setVideos([]);
                        } else {
                          setSelectedLevel(1); 
                          loadWorkshops(1); 
                          loadLevelVideos(1);
                        }
                      }}>
                      <View style={[styles.levelBadge, { backgroundColor: '#00B894' }]}>
                        <Text style={styles.levelBadgeText}>Level 1</Text>
                      </View>
                      <Text style={styles.levelName}>NarKarma Viruthi</Text>
                      <Text style={styles.levelDuration}>120 Days Program</Text>
                      <Text style={styles.levelStatus}>✓ Available</Text>
                      
                      {selectedLevel === 1 && (
                        <View style={styles.videosInCard}>
                          <Text style={styles.videosInCardTitle}>Videos</Text>
                          {!Array.isArray(videos) || videos.length === 0 ? (
                            <Text style={styles.noVideos}>No videos available yet</Text>
                          ) : (
                            videos.map((video, i) => (
                              <View key={video.id} style={styles.videoTile}>
                                <View style={styles.videoThumb}>
                                  <Text style={styles.orderBadge}>#{i + 1}</Text>
                                </View>
                                <View style={styles.videoInfo}>
                                  <Text style={styles.videoTitle}>{video.title}</Text>
                                  <Text style={styles.videoDuration}>{video.description}</Text>
                                </View>
                                <View style={styles.videoActions}>
                                  <TouchableOpacity style={styles.playBtn} onPress={() => playVideo(video.url)}>
                                    <Text style={styles.playBtnText}>Play</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={styles.completeBtn} onPress={() => completeVideo(video.id)}>
                                    <Text style={styles.completeBtnText}>Complete</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ))
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    {/* Level 2 */}
                    <TouchableOpacity 
                      style={[styles.levelCard, { borderColor: '#FF9F43', opacity: user.level >= 2 ? 1 : 0.5, marginBottom: 12 }]} 
                      disabled={user.level < 2}
                      onPress={() => {
                        if (user.level < 2) {
                          setLockedModal(`Complete 120 days in Level 1 to unlock Level 2\n\nCurrent Progress: ${daysCompleted}/120 days`);
                          return;
                        }
                        if (selectedLevel === 2) {
                          setSelectedLevel(null);
                          setVideos([]);
                        } else {
                          setSelectedLevel(2);
                          loadWorkshops(2);
                          loadLevelVideos(2);
                        }
                      }}>
                      <View style={[styles.levelBadge, { backgroundColor: '#FF9F43' }]}>
                        <Text style={styles.levelBadgeText}>Level 2</Text>
                      </View>
                      <Text style={styles.levelName}>Suya Viruthi</Text>
                      <Text style={styles.levelDuration}>120 Days Program</Text>
                      {user.level >= 2 ? (
                        <Text style={styles.levelStatus}>✓ Unlocked</Text>
                      ) : (
                        <Text style={styles.levelStatusLocked}>🔒 Complete 120 days in Level 1 ({daysCompleted}/120)</Text>
                      )}
                      
                      {selectedLevel === 2 && user.level >= 2 && (
                        <View style={styles.videosInCard}>
                          <Text style={styles.videosInCardTitle}>Videos</Text>
                          {!Array.isArray(videos) || videos.length === 0 ? (
                            <Text style={styles.noVideos}>No videos available yet</Text>
                          ) : (
                            videos.map((video, i) => (
                              <View key={video.id} style={styles.videoTile}>
                                <View style={styles.videoThumb}>
                                  <Text style={styles.orderBadge}>#{i + 1}</Text>
                                </View>
                                <View style={styles.videoInfo}>
                                  <Text style={styles.videoTitle}>{video.title}</Text>
                                  <Text style={styles.videoDuration}>{video.description}</Text>
                                </View>
                                <View style={styles.videoActions}>
                                  <TouchableOpacity style={styles.playBtn} onPress={() => playVideo(video.url)}>
                                    <Text style={styles.playBtnText}>Play</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={styles.completeBtn} onPress={() => completeVideo(video.id)}>
                                    <Text style={styles.completeBtnText}>Complete</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ))
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    {/* Level 3 */}
                    <TouchableOpacity 
                      style={[styles.levelCard, { borderColor: '#9B59B6', opacity: user.level >= 3 ? 1 : 0.5, marginBottom: 12 }]} 
                      disabled={user.level < 3}
                      onPress={() => {
                        if (user.level < 3) {
                          setLockedModal('Complete 120 days in Level 2 to unlock Level 3');
                          return;
                        }
                        if (selectedLevel === 3) {
                          setSelectedLevel(null);
                          setVideos([]);
                        } else {
                          setSelectedLevel(3);
                          loadWorkshops(3);
                          loadLevelVideos(3);
                        }
                      }}>
                      <View style={[styles.levelBadge, { backgroundColor: '#9B59B6' }]}>
                        <Text style={styles.levelBadgeText}>Level 3</Text>
                      </View>
                      <Text style={styles.levelName}>Yoga Viruthi</Text>
                      <Text style={styles.levelDuration}>120 Days Program</Text>
                      {user.level >= 3 ? (
                        <Text style={styles.levelStatus}>✓ Unlocked</Text>
                      ) : (
                        <Text style={styles.levelStatusLocked}>🔒 Complete 120 days in Level 2</Text>
                      )}
                      
                      {selectedLevel === 3 && user.level >= 3 && (
                        <View style={styles.videosInCard}>
                          {!Array.isArray(videos) || videos.length === 0 ? (
                            <Text style={styles.noVideos}>No videos available yet</Text>
                          ) : (() => {
                            const { part1, part2 } = groupVideosByPart(videos);
                            return (
                              <>
                                {part1.length > 0 && (
                                  <View style={{marginBottom: 16}}>
                                    <Text style={styles.videosInCardTitle}>Yoga Viruthi Part 1</Text>
                                    {part1.map((video, i) => (
                                      <View key={video.id} style={styles.videoTile}>
                                        <View style={styles.videoThumb}>
                                          <Text style={styles.orderBadge}>#{i + 1}</Text>
                                        </View>
                                        <View style={styles.videoInfo}>
                                          <Text style={styles.videoTitle}>{video.title}</Text>
                                          <Text style={styles.videoDuration}>{video.description}</Text>
                                        </View>
                                        <View style={styles.videoActions}>
                                          <TouchableOpacity style={styles.playBtn} onPress={() => playVideo(video.url)}>
                                            <Text style={styles.playBtnText}>Play</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity style={styles.completeBtn} onPress={() => completeVideo(video.id)}>
                                            <Text style={styles.completeBtnText}>Complete</Text>
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                    ))}
                                  </View>
                                )}
                                {part2.length > 0 && (
                                  <View>
                                    <Text style={styles.videosInCardTitle}>Yoga Viruthi Part 2</Text>
                                    {part2.map((video, i) => (
                                      <View key={video.id} style={styles.videoTile}>
                                        <View style={styles.videoThumb}>
                                          <Text style={styles.orderBadge}>#{i + 1}</Text>
                                        </View>
                                        <View style={styles.videoInfo}>
                                          <Text style={styles.videoTitle}>{video.title}</Text>
                                          <Text style={styles.videoDuration}>{video.description}</Text>
                                        </View>
                                        <View style={styles.videoActions}>
                                          <TouchableOpacity style={styles.playBtn} onPress={() => playVideo(video.url)}>
                                            <Text style={styles.playBtnText}>Play</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity style={styles.completeBtn} onPress={() => completeVideo(video.id)}>
                                            <Text style={styles.completeBtnText}>Complete</Text>
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                    ))}
                                  </View>
                                )}
                              </>
                            );
                          })()}
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity style={styles.doneBtn} onPress={() => setCompletedSteps({...completedSteps, 1: true})}>
                    <Text style={styles.doneBtnText}>Mark Complete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>

            {/* Step 2: Forgiveness */}
            <TouchableOpacity style={styles.stepCard} onPress={() => navigation.navigate('RoutineDetail', { step: 2 })}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepTitle}>Forgiveness</Text>
                {completedSteps[2] && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Step 3: Awareness */}
            <TouchableOpacity style={styles.stepCard} onPress={() => navigation.navigate('RoutineDetail', { step: 3 })}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepTitle}>Awareness</Text>
                {completedSteps[3] && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Step 4: Meditation */}
            <TouchableOpacity style={styles.stepCard} onPress={() => navigation.navigate('RoutineDetail', { step: 4 })}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepTitle}>Meditation</Text>
                {completedSteps[4] && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Step 5: Manifestation */}
            <TouchableOpacity style={styles.stepCard} onPress={() => navigation.navigate('RoutineDetail', { step: 5 })}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>5</Text>
                <Text style={styles.stepTitle}>Manifestation</Text>
                {completedSteps[5] && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Step 6: Tharpanam/Thithi */}
            <TouchableOpacity style={styles.stepCard} onPress={() => navigation.navigate('RoutineDetail', { step: 6 })}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>6</Text>
                <Text style={styles.stepTitle}>Tharpanam/Thithi</Text>
                {completedSteps[6] && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {/* Step 7: Healing */}
            <TouchableOpacity style={styles.stepCard} onPress={() => navigation.navigate('RoutineDetail', { step: 7 })}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>7</Text>
                <Text style={styles.stepTitle}>Healing - Self & Family</Text>
                {completedSteps[7] && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {Object.keys(completedSteps).filter(k => parseInt(k) >= 1 && parseInt(k) <= 7).length === 7 && (
              <TouchableOpacity style={styles.nextBtn} onPress={() => { setRoutineCompleted(true); setRoutineCompleteModal(true); }}>
                <Text style={styles.nextBtnText}>Complete Daily Routine →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeTab === 'habits' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Habit Tracker</Text>
              <Text style={styles.habitSubtitle}>Complete your daily habits</Text>
              {Array.isArray(habits) && habits.map((habit) => (
                <View key={habit.id} style={styles.habitItem}>
                  <View style={styles.habitContent}>
                    <Text style={styles.habitTitle}>{habit.name}</Text>
                    <Text style={styles.habitDesc}>{habit.description}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.habitCheck, completedSteps[`habit_${habit.id}`] && styles.habitCheckDone]} 
                    onPress={() => setCompletedSteps({...completedSteps, [`habit_${habit.id}`]: true})}>
                    <Text style={styles.habitCheckText}>{completedSteps[`habit_${habit.id}`] ? '✓' : '○'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={() => {
              const incompleteTasks = [];
              if (!videoCompleted) incompleteTasks.push('Cleansing Video');
              if (!routineCompleted) incompleteTasks.push('Daily Routine (7 Steps)');
              const allHabitsCompleted = habits.every(h => completedSteps[`habit_${h.id}`]);
              if (!allHabitsCompleted) incompleteTasks.push('Habit Tracker');
              
              if (incompleteTasks.length > 0) {
                setIncompleteModal(incompleteTasks);
              } else {
                setCompletionModal(true);
              }
            }}>
              <Text style={styles.submitBtnText}>Submit & Mark Attendance</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'support' && (
          <View>
            {/* Appointments Section - MOVED TO TOP */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Appointments</Text>
              <Text style={styles.habitSubtitle}>Book a session with our instructors</Text>
              
              {Array.isArray(appointments) && appointments.length > 0 ? (
                appointments.map((apt) => (
                  <TouchableOpacity 
                    key={apt.id} 
                    style={[
                      styles.workshopCard,
                      { borderColor: apt.status === 'APPROVED' ? '#27AE60' : apt.status === 'REJECTED' ? '#E74C3C' : '#FF9F43' }
                    ]}
                    onPress={() => setExpandedAppointment(expandedAppointment === apt.id ? null : apt.id)}>
                    <View style={styles.workshopHeader}>
                      {apt.scheduledDate && apt.status === 'APPROVED' && (
                        <Text style={styles.workshopTime}>
                          {new Date(apt.scheduledDate).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      )}
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <View style={[
                          styles.levelBadge,
                          { backgroundColor: apt.status === 'APPROVED' ? '#27AE60' : apt.status === 'REJECTED' ? '#E74C3C' : '#FF9F43' }
                        ]}>
                          <Text style={styles.levelBadgeText}>{apt.status}</Text>
                        </View>
                        <MaterialIcons name={expandedAppointment === apt.id ? "expand-less" : "expand-more"} size={24} color="#666" />
                      </View>
                    </View>
                    {expandedAppointment === apt.id ? (
                      <View style={styles.expandedContent}>
                        <Text style={styles.workshopTitle}>Appointment Request</Text>
                        <Text style={styles.workshopDesc}>{apt.reason}</Text>
                        {apt.adminNotes && (
                          <Text style={[styles.workshopDesc, {fontStyle: 'italic', color: '#00A8A8'}]}>Note: {apt.adminNotes}</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.workshopTitle}>Appointment Request</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.appointmentBox}>
                  <MaterialIcons name="event" size={48} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 12}} />
                  <Text style={styles.appointmentText}>No appointments yet. Schedule a one-on-one session with our experienced instructors for personalized guidance.</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.submitBtn} onPress={() => setAppointmentModal(true)}>
                <Text style={styles.submitBtnText}>Request New Appointment</Text>
              </TouchableOpacity>
            </View>

            {/* Session Workshops */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Session Workshops</Text>
              <Text style={styles.workshopSubtitle}>Join live sessions and workshops</Text>
              {Array.isArray(sessionWorkshops) && sessionWorkshops.length > 0 ? (
                sessionWorkshops.map((workshop) => (
                  <View key={workshop.id} style={styles.workshopCard}>
                    <View style={styles.workshopHeader}>
                      <Text style={styles.workshopTime}>
                        {new Date(workshop.startTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(workshop.level) }]}>
                        <Text style={styles.levelBadgeText}>Level {workshop.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.workshopTitle}>{workshop.title}</Text>
                    <Text style={styles.workshopDesc}>{workshop.description}</Text>
                    <TouchableOpacity 
                      style={styles.joinBtn} 
                      onPress={() => Linking.openURL(workshop.link)}>
                      <Text style={styles.joinBtnText}>Join Workshop →</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noWorkshops}>No workshops scheduled yet</Text>
              )}
            </View>

            {/* Q&A Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Questions & Answers</Text>
              <Text style={styles.habitSubtitle}>Ask questions and get replies from admin</Text>
              
              {Array.isArray(qaList) && qaList.length > 0 ? (
                qaList.map((qa) => (
                  <TouchableOpacity 
                    key={qa.id} 
                    style={[
                      styles.qaCard,
                      { borderLeftColor: qa.status === 'ANSWERED' ? '#10B981' : '#FF9F43' }
                    ]}
                    onPress={() => setExpandedQA(expandedQA === qa.id ? null : qa.id)}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={styles.qaCardLabel}>Your Question:</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <View style={[
                          styles.qaBadge,
                          { backgroundColor: qa.status === 'ANSWERED' ? '#10B981' : '#FF9F43' }
                        ]}>
                          <Text style={styles.qaBadgeText}>{qa.status}</Text>
                        </View>
                        <MaterialIcons name={expandedQA === qa.id ? "expand-less" : "expand-more"} size={24} color="#666" />
                      </View>
                    </View>
                    {expandedQA === qa.id ? (
                      <View style={styles.expandedContent}>
                        <Text style={styles.qaCardQuestion}>{qa.question}</Text>
                        <Text style={styles.qaCardDate}>
                          Asked: {new Date(qa.createdAt).toLocaleString()}
                        </Text>
                        {qa.answer && (
                          <View style={styles.qaAnswerBox}>
                            <Text style={styles.qaAnswerLabel}>Admin Reply:</Text>
                            <Text style={styles.qaAnswerText}>{qa.answer}</Text>
                            <Text style={styles.qaAnswerDate}>
                              Replied: {new Date(qa.answeredAt).toLocaleString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.qaCardQuestion} numberOfLines={1}>{qa.question}</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.appointmentBox}>
                  <MaterialIcons name="question-answer" size={48} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 12}} />
                  <Text style={styles.appointmentText}>No questions yet. Ask your questions and get personalized answers from admin.</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.submitBtn} onPress={() => setQaModal(true)}>
                <Text style={styles.submitBtnText}>Ask New Question</Text>
              </TouchableOpacity>
            </View>

            {/* FAQ Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>FAQ</Text>
              <Text style={styles.habitSubtitle}>Frequently Asked Questions</Text>
              
              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do chakra cleansing?</Text>
                <Text style={styles.faqAnswer}>A: Preferably on an empty stomach in the morning. If that’s not possible, practice at
least 2 hours after eating.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: How many times can chakra cleansing be done?</Text>
                <Text style={styles.faqAnswer}>A: Recommended once a day. If you wish to repeat the practice the same day, do
so only after at least 9 hours have passed since the first session.</Text>
              </View>


              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: Can we drink water during the practice?</Text>
                <Text style={styles.faqAnswer}>A: Do not drink water during the chakra-cleansing practice. You may drink water up
to 30 minutes before or after the session.</Text>
              </View>


              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: Will these practices increase body heat?</Text>
                <Text style={styles.faqAnswer}>A: Yes — these practices can naturally raise body heat. It is recommended to take
a full-body (head-to-toe) oil bath twice a week.
Additionally, performing the fifth exercise of the chakra-cleansing routine in the
evening (or when convenient) may help reduce excess body heat.</Text>
              </View>
              

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: Will we get tired doing these practices?</Text>
                <Text style={styles.faqAnswer}>A: Some people may feel tired depending on their current health condition. These
practices are meant to build energy in the body. Usually within a week or two,
any excessive tiredness settles down and the body becomes more active
and energetic.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do forgiveness practice?</Text>
                <Text style={styles.faqAnswer}>A: Forgiveness can be read at any time during the day. Preferably follow the
schedule given in your class. You may also read the forgiveness practice before
each manifestation session.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do meditation?</Text>
                <Text style={styles.faqAnswer}>A: Twice daily — once in the morning and once at night before sleep, following the
schedule provided in class.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: When to do thithi / tharpanam?</Text>
                <Text style={styles.faqAnswer}>A: Perform before each meal. For further questions about timing or procedure,
contact admin.</Text>
              </View>

              <View style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Q: If you experience discomfort after these practices (for example: pain in any
part of the body, overheating, excessive tiredness, or excessive sleep):</Text>
                <Text style={styles.faqAnswer}>A: 1. Please do not overstrain your body — listen to your body and slow down if
needed.</Text>
<Text style={styles.faqAnswer}>2. Contact Sittha Viruthi Yoga admin (available 10:00 AM – 6:00 PM, except
Sunday).</Text>
<Text style={styles.faqAnswer}>3. Stop the practice if symptoms are severe or worsening. If you experience
serious symptoms (severe pain, fainting, chest pain, severe shortness of
breath, etc.), seek medical attention immediately.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('levels')}>
          <MaterialIcons name="home" size={24} color={(activeTab === 'levels' || activeTab === 'chemsing') ? '#00A8A8' : '#999'} />
          <Text style={[styles.navLabel, (activeTab === 'levels' || activeTab === 'chemsing') && styles.navActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('routine')}>
          <MaterialIcons name="assignment" size={24} color={activeTab === 'routine' ? '#00A8A8' : '#999'} />
          <Text style={[styles.navLabel, activeTab === 'routine' && styles.navActive]}>Daily Routine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('habits')}>
          <MaterialIcons name="check-circle" size={24} color={activeTab === 'habits' ? '#00A8A8' : '#999'} />
          <Text style={[styles.navLabel, activeTab === 'habits' && styles.navActive]}>Habit Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('support')}>
          <MaterialIcons name="support-agent" size={24} color={activeTab === 'support' ? '#00A8A8' : '#999'} />
          <Text style={[styles.navLabel, activeTab === 'support' && styles.navActive]}>Support</Text>
        </TouchableOpacity>
      </View>

      {completionModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="celebration" size={64} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <Text style={styles.modalDesc}>Did you complete all tasks today?

• Cleansing Video
• Daily Routine (7 Steps)
• Habit Tracker

Note: Select "Absent" if you didn't complete the tasks.</Text>
              
              <View style={styles.qaButtons}>
                <TouchableOpacity style={styles.yesBtn} onPress={() => markAttendance(true)}>
                  <Text style={styles.qaText}>Yes - Present</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noBtn} onPress={() => markAttendance(false)}>
                  <Text style={styles.qaText}>No - Absent</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.closeBtnWithMargin} onPress={() => setCompletionModal(false)}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {habitModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{habitModal.name}</Text>
              <Text style={styles.modalDesc}>{habitModal.description}</Text>
              
              <View style={styles.qaSection}>
                <Text style={styles.qaTitle}>Completed?</Text>
                <View style={styles.qaButtons}>
                  <TouchableOpacity style={styles.yesBtn} onPress={() => submitHabit(habitModal.id, 'Yes')}>
                    <Text style={styles.qaText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.noBtn} onPress={() => submitHabit(habitModal.id, 'No')}>
                    <Text style={styles.qaText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setHabitModal(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Menu Modal */}
      {menuModal && (
        <Modal visible={true} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <View style={styles.menuAvatar}>
                  <Text style={styles.menuAvatarText}>{user.name[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{user.name}</Text>
                  <View style={[styles.menuLevelBadge, { backgroundColor: getLevelColor(user.level) }]}>
                    <Text style={styles.menuLevelText}>Level {user.level} - {getLevelName(user.level)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuStats}>
                <View style={styles.menuStatItem}>
                  <Text style={styles.menuStatValue}>{daysCompleted}</Text>
                  <Text style={styles.menuStatLabel}>Days Completed</Text>
                </View>
                <View style={styles.menuStatItem}>
                  <Text style={styles.menuStatValue}>{Math.round(progress)}%</Text>
                  <Text style={styles.menuStatLabel}>Level Progress</Text>
                </View>
              </View>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModal(false); setProfileModal(true); }}>
                <MaterialIcons name="person" size={24} color="#1B3B6F" />
                <Text style={styles.menuItemText}>Profile Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={async () => {
                const username = await AsyncStorage.getItem('username');
                const aRes = await fetch(`${API_URL}/attendance/user/${username}`);
                const aData = await aRes.json();
                const totalDays = Array.isArray(aData) ? aData.length : 0;
                const presentDays = Array.isArray(aData) ? aData.filter(a => a.attended).length : 0;
                const absentDays = totalDays - presentDays;
                setProgressData({ totalDays, presentDays, absentDays });
                setMenuModal(false);
                setProgressModal(true);
              }}>
                <MaterialIcons name="bar-chart" size={24} color="#1B3B6F" />
                <Text style={styles.menuItemText}>My Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModal(false); navigation.navigate('About'); }}>
                <MaterialIcons name="info" size={24} color="#1B3B6F" />
                <Text style={styles.menuItemText}>About</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <Text style={styles.versionText}>Version 1.0.0</Text>

              <TouchableOpacity style={styles.logoutBtn} onPress={() => { setMenuModal(false); setShowLogoutModal(true); }}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
                  <MaterialIcons name="logout" size={20} color="#fff" />
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeMenuBtn} onPress={() => setMenuModal(false)}>
                <Text style={styles.closeMenuBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}



      {/* Video Completion Modal */}
      {videoCompletionModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="check-circle" size={64} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Complete Video?</Text>
              <Text style={styles.modalDesc}>Have you finished watching the video?</Text>
              
              <View style={styles.qaButtons}>
                <TouchableOpacity style={styles.yesBtn} onPress={confirmVideoCompletion}>
                  <Text style={styles.qaText}>Yes, Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noBtn} onPress={() => setVideoCompletionModal(null)}>
                  <Text style={styles.qaText}>Not Yet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Error Modal */}
      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={64} color="#E74C3C" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalDesc}>{errorModal}</Text>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setErrorModal(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Locked Level Modal */}
      {lockedModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="lock" size={64} color="#FF9F43" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Level Locked</Text>
              <Text style={styles.modalDesc}>{lockedModal}</Text>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setLockedModal(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Success Modal */}
      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Attendance Marked!</Text>
              <Text style={styles.successDesc}>
                Your attendance has been marked as {successModal === 'Present' ? '✓ Present' : '✗ Absent'}
              </Text>
              <Text style={styles.successDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              
              <TouchableOpacity style={styles.successBtn} onPress={() => { setSuccessModal(null); setActiveTab('levels'); }}>
                <Text style={styles.successBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Profile Settings Modal */}
      {profileModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="person" size={64} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Profile Settings</Text>
              <View style={styles.profileInfo}>
                <Text style={styles.profileLabel}>Username:</Text>
                <Text style={styles.profileValue}>{user.name}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileLabel}>Current Level:</Text>
                <Text style={styles.profileValue}>Level {user.level} - {getLevelName(user.level)}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileLabel}>Days Completed:</Text>
                <Text style={styles.profileValue}>{daysCompleted} days</Text>
              </View>
              <Text style={styles.profileNote}>Contact admin to update your profile information.</Text>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setProfileModal(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* My Progress Modal */}
      {progressModal && progressData && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="bar-chart" size={64} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>My Progress</Text>
              
              <View style={styles.progressStatsGrid}>
                <View style={styles.progressStatBox}>
                  <Text style={styles.progressStatValue}>{progressData.totalDays}</Text>
                  <Text style={styles.progressStatLabel}>Total Days</Text>
                </View>
                <View style={[styles.progressStatBox, {backgroundColor: '#E8F5E9'}]}>
                  <Text style={[styles.progressStatValue, {color: '#27AE60'}]}>{progressData.presentDays}</Text>
                  <Text style={styles.progressStatLabel}>Present</Text>
                </View>
                <View style={[styles.progressStatBox, {backgroundColor: '#FFEBEE'}]}>
                  <Text style={[styles.progressStatValue, {color: '#E74C3C'}]}>{progressData.absentDays}</Text>
                  <Text style={styles.progressStatLabel}>Absent</Text>
                </View>
              </View>

              <View style={styles.levelProgressBox}>
                <Text style={styles.levelProgressTitle}>Current Level: {user.level}</Text>
                <Text style={styles.levelProgressDesc}>{getLevelName(user.level)}</Text>
                <Text style={styles.levelProgressDays}>
                  {user.level === 1 && `${progressData.presentDays}/120 days (${120 - progressData.presentDays} days to Level 2)`}
                  {user.level === 2 && `${progressData.presentDays}/240 days (${240 - progressData.presentDays} days to Level 3)`}
                  {user.level === 3 && `${progressData.presentDays}/360 days (Completed)`}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setProgressModal(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Routine Complete Modal */}
      {routineCompleteModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIconCircle}>
                <MaterialIcons name="check" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Daily Routine Complete!</Text>
              <Text style={styles.successDesc}>
                Congratulations! You've completed all 7 steps of your daily routine.
              </Text>
              <Text style={styles.successDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              
              <TouchableOpacity style={styles.successBtn} onPress={() => { setRoutineCompleteModal(false); setActiveTab('habits'); }}>
                <Text style={styles.successBtnText}>Go to Habit Tracker</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Q&A Modal */}
      {qaModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="question-answer" size={64} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Ask a Question</Text>
              <Text style={styles.modalDesc}>Submit your question and admin will reply as soon as possible.</Text>
              
              <TextInput 
                style={styles.qaInput} 
                placeholder="Type your question here..." 
                placeholderTextColor="#999"
                multiline
                value={newQuestion}
                onChangeText={setNewQuestion}
              />
              
              <TouchableOpacity style={[styles.submitBtn, {marginBottom: 0}]} onPress={askQuestion}>
                <Text style={styles.submitBtnText}>Submit Question</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeBtnWithMargin} onPress={() => { setQaModal(false); setNewQuestion(''); }}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Incomplete Tasks Modal */}
      {incompleteModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="warning" size={64} color="#FF9F43" style={{alignSelf: 'center', marginBottom: 16}} />
              <Text style={styles.modalTitle}>Incomplete Tasks</Text>
              <Text style={styles.modalDesc}>Please complete the following tasks before marking attendance:</Text>
              
              <View style={styles.incompleteTasksList}>
                {incompleteModal.map((task, index) => (
                  <View key={index} style={styles.incompleteTaskItem}>
                    <MaterialIcons name="cancel" size={20} color="#E74C3C" />
                    <Text style={styles.incompleteTaskText}>{task}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.closeBtn} onPress={() => setIncompleteModal(null)}>
                <Text style={styles.closeBtnText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Appointment Request Modal */}
      {appointmentModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="event" size={56} color="#00A8A8" style={{alignSelf: 'center', marginBottom: 12}} />
              <Text style={styles.modalTitle}>Request Appointment</Text>
              <Text style={styles.modalDesc}>Please provide a reason for your appointment request. Admin will review and schedule it.</Text>
              
              <TextInput 
                style={styles.qaInput} 
                placeholder="Reason for appointment..." 
                placeholderTextColor="#999"
                multiline
                value={appointmentReason}
                onChangeText={setAppointmentReason}
              />
              
              <TouchableOpacity style={[styles.submitBtn, {marginBottom: 0}]} onPress={requestAppointment}>
                <Text style={styles.submitBtnText}>Submit Request</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeBtnWithMargin} onPress={() => { setAppointmentModal(false); setAppointmentReason(''); }}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {playingVideo && (
        <SecureVideoPlayer
          videoUrl={playingVideo}
          onClose={() => setPlayingVideo(null)}
          onComplete={() => {
            setPlayingVideo(null);
            setVideoCompleted(true);
          }}
        />
      )}

      {/* Custom Success Modal */}
      {customSuccessModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="check-circle" size={56} color="#10B981" style={{alignSelf: 'center', marginBottom: 12}} />
              <Text style={styles.modalTitle}>Success!</Text>
              <Text style={styles.modalDesc}>{customSuccessModal}</Text>
              <TouchableOpacity style={[styles.submitBtn, {marginBottom: 0, marginTop: 8}]} onPress={() => setCustomSuccessModal(null)}>
                <Text style={styles.submitBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Custom Error Modal */}
      {customErrorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons name="error" size={56} color="#EF4444" style={{alignSelf: 'center', marginBottom: 12}} />
              <Text style={styles.modalTitle}>Error</Text>
              <Text style={styles.modalDesc}>{customErrorModal}</Text>
              <TouchableOpacity style={[styles.submitBtn, {backgroundColor: '#EF4444', marginBottom: 0, marginTop: 8}]} onPress={() => setCustomErrorModal(null)}>
                <Text style={styles.submitBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.logoutModalContent}>
              <View style={styles.logoutIconCircle}>
                <MaterialIcons name="logout" size={40} color="#FF9800" />
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#1B3B6F', padding: 16, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00A8A8', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  greeting: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  levelPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  levelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E74C3C', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  icon: { fontSize: 20 },
  progressStrip: { backgroundColor: '#1B3B6F', padding: 12 },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00A8A8' },
  progressLabel: { color: '#FFFFFF', fontSize: 12, marginTop: 6, textAlign: 'center' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1B3B6F', marginBottom: 20, textAlign: 'center' },
  levelCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  videosInCard: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  videosInCardTitle: { fontSize: 16, fontWeight: '700', color: '#1B3B6F', marginBottom: 12 },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  levelBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  levelName: { fontSize: 20, fontWeight: '800', color: '#1B3B6F', marginBottom: 4 },
  levelDuration: { fontSize: 14, color: '#666' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1B3B6F', marginBottom: 12 },
  dateText: { fontSize: 12, color: '#999', marginBottom: 12 },
  videoTile: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#F6F7FB', borderRadius: 12, marginBottom: 12 },
  videoThumb: { width: 60, height: 60, backgroundColor: '#1B3B6F', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  orderBadge: { color: '#00A8A8', fontSize: 20, fontWeight: '800' },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 14, fontWeight: '700', color: '#1B3B6F' },
  videoDuration: { fontSize: 12, color: '#666', marginTop: 2 },
  microCopy: { fontSize: 11, color: '#999', marginTop: 4 },
  videoActions: { flexDirection: 'column', gap: 6 },
  playBtn: { backgroundColor: '#00A8A8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 80 },
  playBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  completeBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 80 },
  completeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  routineItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  routineIcon: { fontSize: 20 },
  routineContent: { flex: 1 },
  routineTitle: { fontSize: 14, fontWeight: '600', color: '#1B3B6F' },
  routineDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  checkBtn: { backgroundColor: '#27AE60', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  checkBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  habitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, backgroundColor: '#F6F7FB', borderRadius: 12, marginBottom: 8 },
  habitTitle: { fontSize: 14, fontWeight: '700', color: '#1B3B6F' },
  habitSchedule: { fontSize: 12, color: '#666', marginTop: 2 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingVertical: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIcon: { fontSize: 24, marginBottom: 2 },
  navLabel: { fontSize: 10, color: '#999' },
  navActive: { color: '#00A8A8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '85%' },
  completionIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1B3B6F', marginBottom: 8, textAlign: 'center' },
  modalDesc: { fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'center', lineHeight: 20 },
  qaSection: { marginBottom: 20 },
  qaTitle: { fontSize: 16, fontWeight: '700', color: '#1B3B6F', marginBottom: 12, textAlign: 'center' },
  qaButtons: { flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center' },
  yesBtn: { flex: 1, backgroundColor: '#27AE60', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  noBtn: { flex: 1, backgroundColor: '#E74C3C', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qaText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  closeBtn: { backgroundColor: '#f0f0f0', paddingVertical: 12, borderRadius: 8 },
  closeBtnWithMargin: { backgroundColor: '#f0f0f0', paddingVertical: 10, borderRadius: 8, marginTop: 12 },
  closeBtnText: { color: '#666', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#D4A537', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabText: { fontSize: 24 },
  stepCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#00A8A8', color: '#fff', fontSize: 15, fontWeight: '800', textAlign: 'center', lineHeight: 32, shadowColor: '#00A8A8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1B3B6F', letterSpacing: 0.1 },
  checkMark: { fontSize: 22, color: '#27AE60', fontWeight: '800' },
  stepContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 2, borderTopColor: '#E5E7EB' },
  stepDesc: { fontSize: 15, color: '#4B5563', marginBottom: 16, lineHeight: 24, fontWeight: '500' },
  stepSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1B3B6F', marginTop: 12, marginBottom: 8, paddingLeft: 8, borderLeftWidth: 4, borderLeftColor: '#00A8A8' },
  stepContentText: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 12 },
  videoBox: { backgroundColor: '#1B3B6F', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  videoIcon: { fontSize: 24 },
  videoText: { color: '#00A8A8', fontSize: 14, fontWeight: '700', flex: 1 },
  doneBtn: { backgroundColor: '#27AE60', padding: 12, borderRadius: 8 },
  doneBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  nextBtn: { backgroundColor: '#00A8A8', padding: 16, borderRadius: 12, marginTop: 16 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  habitSubtitle: { fontSize: 12, color: '#999', marginBottom: 12 },
  habitContent: { flex: 1 },
  habitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  scheduleBadge: { backgroundColor: '#00A8A8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scheduleBadgeRandom: { backgroundColor: '#FF9F43' },
  scheduleBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  habitCheck: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#00A8A8', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  habitCheckDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  habitCheckText: { fontSize: 20, color: '#00A8A8', fontWeight: '800' },
  qaInput: { backgroundColor: '#F5F7FA', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 13, color: '#1B3B6F', minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  submitBtn: { backgroundColor: '#00A8A8', padding: 14, borderRadius: 10, marginTop: 8, marginBottom: 80 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  workshopSubtitle: { fontSize: 12, color: '#999', marginBottom: 12 },
  workshopCard: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 2, borderColor: '#00A8A8' },
  workshopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  workshopTime: { fontSize: 11, fontWeight: '700', color: '#00A8A8' },
  workshopTitle: { fontSize: 14, fontWeight: '800', color: '#1B3B6F', marginBottom: 4 },
  workshopDesc: { fontSize: 11, color: '#666', marginBottom: 6 },
  joinBtn: { backgroundColor: '#00A8A8', padding: 10, borderRadius: 8 },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  noWorkshops: { fontSize: 14, color: '#999', textAlign: 'center', padding: 20 },
  noVideos: { fontSize: 14, color: '#6B7280', textAlign: 'center', padding: 20 },
  levelStatus: { fontSize: 12, color: '#27AE60', fontWeight: '700', marginTop: 8 },
  levelStatusLocked: { fontSize: 12, color: '#999', fontWeight: '700', marginTop: 8 },
  menuContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, width: '100%', position: 'absolute', bottom: 0 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  menuAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00A8A8', justifyContent: 'center', alignItems: 'center' },
  menuAvatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 20, fontWeight: '800', color: '#1B3B6F', marginBottom: 6 },
  menuLevelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  menuLevelText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  menuStats: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  menuStatItem: { flex: 1, backgroundColor: '#F6F7FB', padding: 16, borderRadius: 12, alignItems: 'center' },
  menuStatValue: { fontSize: 28, fontWeight: '800', color: '#1B3B6F', marginBottom: 4 },
  menuStatLabel: { fontSize: 12, color: '#666' },
  menuDivider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  menuItemIcon: { fontSize: 24 },
  menuItemText: { fontSize: 16, color: '#1B3B6F', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#E74C3C', padding: 16, borderRadius: 12, marginTop: 8 },
  logoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  closeMenuBtn: { backgroundColor: '#f0f0f0', padding: 16, borderRadius: 12, marginTop: 12 },
  closeMenuBtnText: { color: '#666', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  versionText: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 12 },
  startLevelBtn: { backgroundColor: '#00A8A8', padding: 16, borderRadius: 12, marginTop: 16 },
  startLevelBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  habitDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  successModalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32, width: '85%', alignItems: 'center' },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1B3B6F', marginBottom: 12, textAlign: 'center' },
  successDesc: { fontSize: 16, color: '#666', marginBottom: 8, textAlign: 'center', lineHeight: 24 },
  successDate: { fontSize: 13, color: '#00A8A8', fontWeight: '600', marginBottom: 24, textAlign: 'center' },
  successBtn: { backgroundColor: '#00A8A8', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, width: '100%' },
  successBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  profileInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  profileLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  profileValue: { fontSize: 14, fontWeight: '700', color: '#1B3B6F' },
  profileNote: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 16, marginBottom: 16, fontStyle: 'italic' },
  progressStatsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  progressStatBox: { flex: 1, backgroundColor: '#F5F7FA', padding: 16, borderRadius: 12, alignItems: 'center' },
  progressStatValue: { fontSize: 24, fontWeight: '800', color: '#1B3B6F', marginBottom: 4 },
  progressStatLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  levelProgressBox: { backgroundColor: '#F5F7FA', padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  levelProgressTitle: { fontSize: 16, fontWeight: '700', color: '#1B3B6F', marginBottom: 4 },
  levelProgressDesc: { fontSize: 14, color: '#00A8A8', fontWeight: '600', marginBottom: 8 },
  levelProgressDays: { fontSize: 13, color: '#6B7280' },
  faqItem: { marginBottom: 12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  faqQuestion: { fontSize: 14, fontWeight: '700', color: '#1B3B6F', flex: 1, paddingRight: 8 },
  faqAnswer: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  appointmentBox: { backgroundColor: '#F5F7FA', padding: 16, borderRadius: 10, alignItems: 'center' },
  appointmentText: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 12, lineHeight: 18 },
  qaCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderLeftWidth: 5 },
  qaCardLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  qaBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  qaBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  qaCardQuestion: { fontSize: 14, color: '#1B3B6F', marginBottom: 8, fontWeight: '600' },
  qaCardDate: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  qaAnswerBox: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, marginTop: 8 },
  qaAnswerLabel: { fontSize: 12, fontWeight: '700', color: '#10B981', marginBottom: 6 },
  qaAnswerText: { fontSize: 14, color: '#1B3B6F', marginBottom: 6, lineHeight: 20 },
  qaAnswerDate: { fontSize: 11, color: '#6B7280', fontStyle: 'italic' },
  welcomeBanner: { backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  bannerGradient: { backgroundColor: '#1B3B6F', padding: 16, alignItems: 'center' },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginBottom: 4, textAlign: 'center', letterSpacing: 0.3 },
  bannerSubtitle: { fontSize: 12, color: '#E5E7EB', marginBottom: 12, textAlign: 'center', fontStyle: 'italic' },
  bannerStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bannerStatItem: { alignItems: 'center' },
  bannerStatValue: { fontSize: 20, fontWeight: '900', color: '#FFD700', marginBottom: 2 },
  bannerStatLabel: { fontSize: 10, color: '#E5E7EB', textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  quickActions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  quickActionCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionTitle: { fontSize: 13, fontWeight: '800', color: '#1B3B6F', marginBottom: 2 },
  quickActionDesc: { fontSize: 10, color: '#6B7280' },
  luxuryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  luxuryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  luxuryCardTitle: { fontSize: 16, fontWeight: '800', color: '#1B3B6F', letterSpacing: 0.2 },
  premiumWorkshopCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#00A8A8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  workshopBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  premiumWorkshopTitle: { fontSize: 14, fontWeight: '800', color: '#1B3B6F', marginBottom: 6, letterSpacing: 0.1 },
  premiumJoinBtn: { backgroundColor: '#00A8A8', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, shadowColor: '#00A8A8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyStateText: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginTop: 8, marginBottom: 2 },
  emptyStateSubtext: { fontSize: 12, color: '#9CA3AF' },
  incompleteTasksList: { backgroundColor: '#FFF5F5', borderRadius: 12, padding: 16, marginVertical: 16, borderWidth: 1, borderColor: '#FEE2E2' },
  incompleteTaskItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  incompleteTaskText: { fontSize: 15, color: '#1B3B6F', fontWeight: '600', flex: 1 },
  expandedContent: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  logoutModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  logoutModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B3B6F',
    marginBottom: 12,
  },
  logoutModalDesc: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutConfirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
