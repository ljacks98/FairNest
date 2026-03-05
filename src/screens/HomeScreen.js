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
      navigation.navigate('Login');
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Welcome to FairNest</Text>
          <Text style={styles.subtitle}>
            Your AI-powered housing assistance platform for Durham residents
          </Text>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        {/* FEATURES */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>How FairNest Can Help</Text>

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
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  featuresContainer: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
});
