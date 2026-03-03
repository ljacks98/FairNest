import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>About FairNest</Text>

      <Text style={styles.sectionTitle}>Mission</Text>
      <Text style={styles.text}>
        FairNest is a housing-focused support platform designed to help
        residents of Durham, North Carolina find affordable housing resources,
        understand their rights, and access fair housing advocacy services.
      </Text>

      <Text style={styles.sectionTitle}>Target Community</Text>
      <Text style={styles.text}>
        Durham residents seeking rental assistance, affordable housing
        opportunities, legal help, and discrimination reporting support.
      </Text>

      <Text style={styles.sectionTitle}>Project Scope</Text>
      <Text style={styles.text}>
        This is a prototype developed as part of an NCCU CIS capstone project.
        The application demonstrates how AI-assisted navigation can simplify
        access to community housing resources.
      </Text>

      <Text style={styles.sectionTitle}>Disclaimer</Text>
      <Text style={styles.text}>
        FairNest provides educational information and resource guidance. It does
        not provide legal advice or real-time case management.
      </Text>

      <Text style={styles.footer}>
        Serving Durham, North Carolina{'\n'}
        NCCU CIS Capstone Prototype
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    marginTop: 30,
    fontSize: 13,
    color: '#666',
  },
});
