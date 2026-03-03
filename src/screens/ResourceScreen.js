import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { resources } from '../data/resources';

export default function ResourceScreen({ route }) {
  const { category, type } = route.params || {};

  const [activeType, setActiveType] = useState(type || null);

  const filteredResources = resources.filter((item) => {
    if (category !== 'housing') {
      return item.category === category;
    }

    if (activeType) {
      return item.category === category && item.type === activeType;
    }

    return item.category === category;
  });

  return (
    <ScrollView style={styles.container}>
      {category === 'housing' && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeType === null && styles.activeFilter,
            ]}
            onPress={() => setActiveType(null)}>
            <Text>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeType === 'assistance' && styles.activeFilter,
            ]}
            onPress={() => setActiveType('assistance')}>
            <Text>Rental Assistance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeType === 'affordable' && styles.activeFilter,
            ]}
            onPress={() => setActiveType('affordable')}>
            <Text>Affordable Housing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeType === 'legal' && styles.activeFilter,
            ]}
            onPress={() => setActiveType('legal')}>
            <Text>Legal Help</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredResources.map((resource) => (
        <View key={resource.id} style={styles.card}>
          <Text style={styles.title}>{resource.title}</Text>

          <Text style={styles.description}>{resource.description}</Text>

          <Text style={styles.info}>Phone: {resource.phone}</Text>

          <Text style={styles.info}>Address: {resource.address}</Text>

          <Text style={styles.info}>Eligibility: {resource.eligibility}</Text>

          <TouchableOpacity onPress={() => Linking.openURL(resource.website)}>
            <Text style={styles.link}>{resource.website}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  link: {
    color: '#2e7d32',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  description: {
    marginVertical: 5,
  },

  info: {
    marginTop: 2,
    fontSize: 14,
    color: '#555',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },

  filterButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
  },

  activeFilter: {
    backgroundColor: '#c8e6c9',
  },
});
