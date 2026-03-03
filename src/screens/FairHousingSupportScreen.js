import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

export default function FairHousingSupportScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fair Housing Support Resources</Text>

      <Text style={styles.section}>
        If you believe you have experienced housing discrimination, support
        organizations can provide guidance, advocacy, and information about next
        steps.
      </Text>

      <Text style={styles.subtitle}>Local & State Advocacy</Text>

      <TouchableOpacity
        onPress={() => Linking.openURL('https://disabilityrightsnc.org')}>
        <Text style={styles.link}>Disability Rights NC</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL('https://alliancecil.org')}>
        <Text style={styles.link}>Alliance of Disability Advocates</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Federal Resource</Text>

      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            'https://www.hud.gov/program_offices/fair_housing_equal_opp'
          )
        }>
        <Text style={styles.link}>
          U.S. Department of Housing and Urban Development (HUD)
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Disclaimer: FairNest does not process discrimination complaints or
        provide legal advice. This page connects users to official support
        resources.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('Resources', { category: 'accessibility' })
        }>
        <Text style={styles.buttonText}>View Related Support Services</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
    fontSize: 15,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  link: {
    color: '#2e7d32',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
