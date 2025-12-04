import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  const appVersion = '1.0.0';

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.appName}>Sittha Viruthi Yoga</Text>
          <Text style={styles.version}>Version {appVersion}</Text>
          <Text style={styles.tagline}>Attendance & Progress Tracking</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Program</Text>
          <Text style={styles.text}>
            A comprehensive 3-level yoga program spanning 360 days, designed to guide you through 
            NarKarma Viruthi, Suya Viruthi, and Yoga Viruthi. Track your daily routines, habits, 
            and progress on your spiritual journey.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={() => openLink('mailto:support@sitthaviruthiyoga.com')}>
            <MaterialIcons name="email" size={24} color="#00A8A8" />
            <Text style={styles.contactText}>support@sitthaviruthiyoga.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={() => openLink('tel:+1234567890')}>
            <MaterialIcons name="phone" size={24} color="#00A8A8" />
            <Text style={styles.contactText}>+1 (234) 567-890</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={() => openLink('https://www.sitthaviruthiyoga.com')}>
            <MaterialIcons name="language" size={24} color="#00A8A8" />
            <Text style={styles.contactText}>www.sitthaviruthiyoga.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity style={styles.legalItem} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.legalItem} onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={styles.legalText}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2025 Sittha Viruthi Yoga. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#1B3B6F',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B3B6F',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  version: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B3B6F',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactText: {
    fontSize: 14,
    color: '#1B3B6F',
    marginLeft: 12,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  legalText: {
    fontSize: 14,
    color: '#1B3B6F',
  },
  copyright: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});
