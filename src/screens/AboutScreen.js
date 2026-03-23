import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Navbar from '../components/Navbar';
import { fontSize } from '../theme/typography';

export default function AboutScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="About" />

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <Text style={styles.heroLabel}>ABOUT FAIRNEST</Text>
          <Text style={styles.heroTitle}>
            Built for Durham,{'\n'}Powered by Purpose
          </Text>
          <Text style={styles.heroSubtitle}>
            FairNest was created to close the gap between Durham residents and
            the housing resources, rights, and support services they deserve.
          </Text>
        </View>
      </View>

      {/* CARDS SECTION */}
      <View style={[styles.cardsSection, isWide && styles.cardsSectionWide]}>
        {/* THE ORGANIZATION */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>THE ORGANIZATION</Text>
          <Text style={styles.cardTitle}>
            North Carolina Central University — CIS Department
          </Text>
          <Text style={styles.cardText}>
            FairNest is a capstone project developed by students in the
            Information Technology (IT) program at North Carolina Central
            University (NCCU) — a historically Black university in Durham, NC.
          </Text>
          <Text style={styles.cardText}>
            Rooted in a commitment to social justice and community impact, NCCU
            CIS students built FairNest to demonstrate how technology can
            empower underserved communities to navigate housing challenges and
            assert their rights.
          </Text>
        </View>

        {/* THE PROJECT */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>THE PROJECT</Text>
          <Text style={styles.cardTitle}>Our Capstone</Text>
          <Text style={styles.cardText}>
            FairNest is a two-semester capstone project. NCCU CIS students
            designed, built, and deployed this platform as a prototype
            demonstrating how AI-assisted tools can modernize access to housing
            resources and civil rights services.
          </Text>
          <Text style={styles.cardText}>
            The platform integrates Firebase authentication, a Firestore
            database, and an AI chat assistant — making it easy for any Durham
            resident to get help, file a report, or find local support without
            navigating complex government systems alone.
          </Text>
        </View>
      </View>

      {/* OUR MISSION */}
      <View style={styles.missionSection}>
        <Text style={styles.sectionLabel}>OUR MISSION</Text>
        <Text style={styles.missionText}>
          Our mission is to provide Durham residents with an easy and accessible
          way to recognize housing discrimination and available resources
          through an AI-powered support system.
        </Text>
        <Text style={styles.missionText}>
          By combining AI assistance with simple, user-friendly tools, FairNest
          helps people understand what steps they can take when facing unfair
          treatment — and connects them with the local organizations and
          services that can help.
        </Text>
      </View>

      {/* PROJECT GOAL */}
      <View style={styles.goalSection}>
        <View style={styles.goalInner}>
          <Text style={styles.sectionLabel}>PROJECT GOAL</Text>
          <Text style={styles.goalTitle}>How FairNest Helps</Text>

          <View style={[styles.goalGrid, isWide && styles.goalGridWide]}>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>📝</Text>
              <Text style={styles.goalCardTitle}>Report Discrimination</Text>
              <Text style={styles.goalCardText}>
                Easily document and submit housing discrimination reports to the
                right local authorities.
              </Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>⚖️</Text>
              <Text style={styles.goalCardTitle}>Know Your Rights</Text>
              <Text style={styles.goalCardText}>
                Access clear, plain-language guides on Durham tenant rights and
                fair housing law.
              </Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>🤖</Text>
              <Text style={styles.goalCardTitle}>AI-Powered Guidance</Text>
              <Text style={styles.goalCardText}>
                Get instant answers to housing questions from our AI assistant,
                available 24/7.
              </Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalIcon}>🏘️</Text>
              <Text style={styles.goalCardTitle}>Find Local Resources</Text>
              <Text style={styles.goalCardText}>
                Discover Durham housing assistance programs, shelters, legal
                aid, and support organizations.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* DISCLAIMER */}
      <View style={styles.disclaimerSection}>
        <Text style={styles.disclaimerLabel}>DISCLAIMER</Text>
        <Text style={styles.disclaimerText}>
          FairNest provides educational information and resource guidance only.
          It does not provide legal advice, real-time case management, or
          official government services. Always consult a qualified attorney or
          housing counselor for legal matters.
        </Text>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Serving Durham, North Carolina</Text>
        <Text style={styles.footerText}>NCCU CIS Capstone Prototype</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // ── Hero ───────────────────────────────────────────────────────────
  hero: {
    backgroundColor: '#1B5E20',
    paddingVertical: 70,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroInner: {
    maxWidth: 720,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: fontSize.tiny,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 18,
  },
  heroSubtitle: {
    fontSize: fontSize.bodyLg,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 600,
  },

  // ── Cards ──────────────────────────────────────────────────────────
  cardsSection: {
    padding: 24,
    gap: 20,
  },
  cardsSectionWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: fontSize.tiny,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: fontSize.h2,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 14,
    lineHeight: 30,
  },
  cardText: {
    fontSize: fontSize.body,
    color: '#444',
    lineHeight: 24,
    marginBottom: 10,
  },

  // ── Mission ────────────────────────────────────────────────────────
  missionSection: {
    backgroundColor: '#fff',
    paddingVertical: 56,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionLabel: {
    fontSize: fontSize.tiny,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 2.5,
    marginBottom: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  missionText: {
    fontSize: fontSize.h3,
    fontStyle: 'italic',
    color: '#222',
    lineHeight: 32,
    textAlign: 'center',
    maxWidth: 760,
    marginBottom: 16,
  },

  // ── Goal ───────────────────────────────────────────────────────────
  goalSection: {
    backgroundColor: '#f0f7f0',
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  goalInner: {
    width: '100%',
    maxWidth: 960,
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: fontSize.h1,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 32,
    textAlign: 'center',
  },
  goalGrid: {
    width: '100%',
    gap: 16,
  },
  goalGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 22,
    flex: 1,
    minWidth: 200,
    maxWidth: 260,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  goalIcon: {
    fontSize: fontSize.h1,
    marginBottom: 10,
  },
  goalCardTitle: {
    fontSize: fontSize.body,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  goalCardText: {
    fontSize: fontSize.small,
    color: '#555',
    lineHeight: 21,
  },

  // ── Disclaimer ─────────────────────────────────────────────────────
  disclaimerSection: {
    backgroundColor: '#fff',
    paddingVertical: 36,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  disclaimerLabel: {
    fontSize: fontSize.tiny,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  disclaimerText: {
    fontSize: fontSize.small,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 680,
  },

  // ── Footer ─────────────────────────────────────────────────────────
  footer: {
    backgroundColor: '#1B5E20',
    paddingVertical: 24,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.7)',
  },
});
