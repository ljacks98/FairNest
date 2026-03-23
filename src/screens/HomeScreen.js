import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { fontSize } from '../theme/typography';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const { user } = useContext(AuthContext);

  const handleSearch = () => {
    const text = query.toLowerCase();

    if (
      text.includes('rent') ||
      text.includes('eviction') ||
      text.includes('landlord') ||
      text.includes('voucher') ||
      text.includes('section 8') ||
      text.includes('shelter') ||
      text.includes('homeless') ||
      text.includes('affordable') ||
      text.includes('home') ||
      text.includes('house') ||
      text.includes('housing') ||
      text.includes('apartment') ||
      text.includes('apartments') ||
      text.includes('room') ||
      text.includes('place to live')
    ) {
      navigation.navigate('Resources', { category: 'housing' });
    } else if (
      text.includes('discrimination') ||
      text.includes('fair housing') ||
      text.includes('harassment')
    ) {
      navigation.navigate('FairHousingSupport');
    } else if (
      text.includes('job') ||
      text.includes('employment') ||
      text.includes('work')
    ) {
      navigation.navigate('Resources', { category: 'employment' });
    } else {
      navigation.navigate('Resources', { category: 'housing' });
    }

    setQuery('');
  };

  const requireAuth = (screen) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to log in to use the AI Assistant.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="Home" />

      {/* HERO */}
      <View style={styles.header}>
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>ABOUT FAIRNEST</Text>
          <Text style={styles.title}>
            Housing Justice, Built for Durham
          </Text>
          <Text style={styles.subtitle}>
            FairNest is a capstone project designed to help Durham residents
            navigate housing rights, report discrimination, and access local
            assistance — all in one place.
          </Text>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        {/* FEATURES */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>How FairNest Can Help</Text>

          {/* QUALIFIER HIGHLIGHT CARD */}
          <TouchableOpacity
            style={styles.checkerCard}
            onPress={() => navigation.navigate('DiscriminationChecker')}>
            <View style={styles.checkerCardInner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkerCardTitle}>Have you been treated unfairly because of who you are?</Text>
                <Text style={styles.checkerCardDesc}>
                  If you think you've experienced housing discrimination, answer a few questions to find out if your situation qualifies — and what to do next.
                </Text>
                <Text style={styles.checkerCardCta}>Find out now →</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('HousingRights')}>
            <Text style={styles.featureTitle}>🏠 Housing Rights</Text>
            <Text style={styles.featureDescription}>
              Learn about your rights as a tenant in Durham
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('FairHousingSupport')}>
            <Text style={styles.featureTitle}>⚖️ Fair Housing Support</Text>
            <Text style={styles.featureDescription}>
              Learn about advocacy and support resources in Durham
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() =>
              navigation.navigate('Resources', { category: 'housing' })
            }>
            <Text style={styles.featureTitle}>📋 Resources</Text>
            <Text style={styles.featureDescription}>
              Find local housing assistance programs
            </Text>
          </TouchableOpacity>

          {/* PROTECTED FEATURE */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => requireAuth('ChatInterface')}>
            <Text style={styles.featureTitle}>💬 AI Assistant</Text>
            <Text style={styles.featureDescription}>
              Get instant answers to your housing questions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Report')}>
            <Text style={styles.featureTitle}>📝 File a Report</Text>
            <Text style={styles.featureDescription}>
              Submit a housing discrimination or issue report
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => requireAuth('ScheduleCall')}>
            <Text style={styles.featureTitle}>📞 Schedule a Call</Text>
            <Text style={styles.featureDescription}>
              Book a free consultation with a fair housing advocate or legal expert
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('About')}>
            <Text style={styles.featureTitle}>ℹ️ About FairNest</Text>
            <Text style={styles.featureDescription}>
              Learn about the mission and scope of this project
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH SECTION */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Ask about housing rights, discrimination, or resources..."
            value={query}
            onChangeText={setQuery}
            multiline
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Get Help</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1B5E20',
    paddingVertical: 70,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 780,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: fontSize.tiny,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 18,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: fontSize.hero * 1.25,
  },
  subtitle: {
    fontSize: fontSize.bodyLg,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: fontSize.bodyLg * 1.6,
    maxWidth: 640,
  },
  featuresContainer: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: fontSize.h2,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  checkerCard: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    elevation: 3,
  },
  checkerCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkerCardTitle: {
    fontSize: fontSize.h3,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  checkerCardDesc: {
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: fontSize.body * 1.5,
    maxWidth: 280,
  },
  checkerCardCta: {
    fontSize: fontSize.body,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  featureTitle: {
    fontSize: fontSize.h4,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  featureDescription: {
    fontSize: fontSize.body,
    color: '#666',
    lineHeight: fontSize.body * 1.5,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: fontSize.input,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  searchButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: fontSize.button,
    fontWeight: 'bold',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
});
