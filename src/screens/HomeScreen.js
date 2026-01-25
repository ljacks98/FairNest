import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  TextInput 
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // AI search functionality will be implemented here
    console.log('Searching for:', query);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to FairNest</Text>
        <Text style={styles.subtitle}>
          Your AI-powered housing assistance platform for Durham residents
        </Text>
      </View>

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

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>How FairNest Can Help</Text>
        
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureTitle}>🏠 Housing Rights</Text>
          <Text style={styles.featureDescription}>
            Learn about your rights as a tenant in Durham
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureTitle}>⚖️ Report Discrimination</Text>
          <Text style={styles.featureDescription}>
            Document and report housing discrimination
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureTitle}>📋 Resources</Text>
          <Text style={styles.featureDescription}>
            Find local housing assistance programs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureTitle}>💬 AI Assistant</Text>
          <Text style={styles.featureDescription}>
            Get instant answers to your housing questions
          </Text>
        </TouchableOpacity>
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
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
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});