import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';

export default function HousingRightsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Housing Rights Overview</Text>

      <Text style={styles.section}>
        Tenants in Durham are protected under federal and state fair housing
        laws. These laws prohibit discrimination based on race, color, religion,
        sex, national origin, disability, and familial status.
      </Text>

      <Text style={styles.section}>
        Landlords may not:
        {'\n'}• Refuse to rent based on protected status
        {'\n'}• Provide different terms or conditions
        {'\n'}• Harass or intimidate tenants
      </Text>

      <Text style={styles.subtitle}>What You Can Do</Text>

      <Text style={styles.section}>
        If you believe your housing rights have been violated, you may:
        {'\n'}• Document conversations and keep records
        {'\n'}• Contact a local housing advocacy organization
        {'\n'}• File a complaint through HUD
      </Text>
      <Text style={styles.subtitle}>Local Support in Durham</Text>

      <Text style={styles.section}>
        Durham Housing Authority
        {'\n'}Phone: 919-683-8596
      </Text>

      <Text style={styles.disclaimer}>
        Disclaimer: This information is for educational purposes only and does
        not constitute legal advice.
      </Text>

      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            'https://www.hud.gov/program_offices/fair_housing_equal_opp'
          )
        }>
        <Text style={styles.link}>
          Learn more from HUD (U.S. Department of Housing and Urban Development)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('Resources', { category: 'housing' })
        }>
        <Text style={styles.buttonText}>View Local Housing Assistance</Text>
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
  disclaimer: {
    marginTop: 20,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
  },
  link: {
    marginTop: 15,
    color: '#2e7d32',
    textDecorationLine: 'underline',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
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
