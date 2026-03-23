import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import Navbar from '../components/Navbar';
import { fontSize } from '../theme/typography';

const STEPS = [
  { step: '1', icon: '📝', title: 'Document the Incident', desc: 'Write down everything: dates, times, names, what was said or done. Save any texts, emails, or letters.' },
  { step: '2', icon: '🔍', title: 'Check If You Qualify', desc: 'Use our Discrimination Checker to see if your situation meets the legal criteria for a fair housing claim.' },
  { step: '3', icon: '📋', title: 'File a Report', desc: 'Submit your report through FairNest to create an official record of the incident.' },
  { step: '4', icon: '⚖️', title: 'Seek Legal Help', desc: 'Contact Legal Aid NC for free legal advice. They can represent you at no cost if your case qualifies.' },
];

const LOCAL_ORGS = [
  {
    name: 'Legal Aid of North Carolina – Durham',
    desc: 'Free civil legal help for low-income residents including housing discrimination cases.',
    phone: '866-219-5262',
    url: 'https://legalaidnc.org',
    tag: 'Legal Aid',
  },
  {
    name: 'Durham Human Relations Commission',
    desc: 'City agency that investigates complaints of discrimination in housing, employment, and public accommodations.',
    phone: '919-560-4197',
    url: 'https://durhamnc.gov/humanrelations',
    tag: 'City Agency',
  },
  {
    name: 'Disability Rights NC',
    desc: 'Statewide advocacy for people with disabilities facing housing and other forms of discrimination.',
    phone: '877-235-4210',
    url: 'https://disabilityrightsnc.org',
    tag: 'Disability Rights',
  },
  {
    name: 'Alliance of Disability Advocates',
    desc: 'Independent living support and housing accessibility resources for people with disabilities.',
    phone: '919-833-1117',
    url: 'https://alliancecil.org',
    tag: 'Disability Rights',
  },
];

const FEDERAL_ORGS = [
  {
    name: 'HUD — Fair Housing & Equal Opportunity',
    desc: 'File a federal fair housing complaint online. HUD investigates at no cost to you.',
    url: 'https://www.hud.gov/program_offices/fair_housing_equal_opp',
    tag: 'Federal',
  },
  {
    name: 'NC Human Relations Commission',
    desc: 'State agency that accepts and mediates housing and employment discrimination complaints.',
    url: 'https://www.nccommerce.com/humanrelations',
    tag: 'State Agency',
  },
];

export default function FairHousingSupportScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="FairHousingSupport" />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>FAIR HOUSING SUPPORT</Text>
        <Text style={styles.heroTitle}>You Don't Have to Face This Alone</Text>
        <Text style={styles.heroSub}>
          If you've experienced housing discrimination, there are organizations
          and legal resources in Durham ready to help — at no cost to you.
        </Text>
      </View>

      <View style={styles.body}>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHERE TO START</Text>
          <Text style={styles.sectionTitle}>Steps to Take If You've Been Discriminated Against</Text>
          <View style={[styles.stepsGrid, isWide && styles.stepsGridWide]}>
            {STEPS.map(s => (
              <View key={s.step} style={[styles.stepCard, isWide && styles.stepCardWide]}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNum}>{s.step}</Text>
                </View>
                <Text style={styles.stepIcon}>{s.icon}</Text>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Local orgs */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LOCAL SUPPORT</Text>
          <Text style={styles.sectionTitle}>Durham & North Carolina Organizations</Text>
          <View style={[styles.orgGrid, isWide && styles.orgGridWide]}>
            {LOCAL_ORGS.map((org, i) => (
              <View key={i} style={[styles.orgCard, isWide && styles.orgCardWide]}>
                <View style={styles.orgTagRow}>
                  <View style={styles.orgTag}>
                    <Text style={styles.orgTagText}>{org.tag}</Text>
                  </View>
                </View>
                <Text style={styles.orgName}>{org.name}</Text>
                <Text style={styles.orgDesc}>{org.desc}</Text>
                <View style={styles.orgActions}>
                  {org.phone && (
                    <TouchableOpacity
                      style={styles.orgPhoneBtn}
                      onPress={() => Linking.openURL(`tel:${org.phone}`)}>
                      <Text style={styles.orgPhoneText}>📞 {org.phone}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.orgWebBtn}
                    onPress={() => Linking.openURL(org.url)}>
                    <Text style={styles.orgWebText}>Visit Website →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Federal orgs */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>FEDERAL & STATE</Text>
          <Text style={styles.cardTitle}>File an Official Complaint</Text>
          <Text style={styles.cardDesc}>
            You can file a formal complaint with government agencies. Investigations are free and confidential.
          </Text>
          {FEDERAL_ORGS.map((org, i) => (
            <TouchableOpacity
              key={i}
              style={styles.linkRow}
              onPress={() => Linking.openURL(org.url)}>
              <View style={styles.linkIcon}>
                <Text style={styles.linkIconText}>↗</Text>
              </View>
              <View style={styles.linkContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.linkTitle}>{org.name}</Text>
                  <View style={styles.fedTag}>
                    <Text style={styles.fedTagText}>{org.tag}</Text>
                  </View>
                </View>
                <Text style={styles.linkSub}>{org.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTAs */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('DiscriminationChecker')}>
          <Text style={styles.primaryBtnText}>Check If Your Situation Qualifies →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Report')}>
          <Text style={styles.secondaryBtnText}>File a Report with FairNest</Text>
        </TouchableOpacity>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            FairNest does not process discrimination complaints or provide legal advice.
            This page connects you to official support resources.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  hero: {
    backgroundColor: '#1B5E20',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroLabel: { fontSize: fontSize.tiny, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', letterSpacing: 2.5, marginBottom: 12 },
  heroTitle: { fontSize: fontSize.h1, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  heroSub:   { fontSize: fontSize.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, maxWidth: 560 },

  body: { padding: 20, maxWidth: 960, alignSelf: 'center', width: '100%' },

  section:      { marginBottom: 24 },
  sectionLabel: { fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 2, marginBottom: 8, marginTop: 8, textTransform: 'uppercase' },
  sectionTitle: { fontSize: fontSize.h2, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },

  // Steps
  stepsGrid:     { gap: 12 },
  stepsGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    position: 'relative',
  },
  stepCardWide: { flex: 1, minWidth: 180 },
  stepNumCircle: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum:   { fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32' },
  stepIcon:  { fontSize: fontSize.h1, marginBottom: 10 },
  stepTitle: { fontSize: fontSize.body, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  stepDesc:  { fontSize: fontSize.caption, color: '#555', lineHeight: 20 },

  // Org cards
  orgGrid:     { gap: 14 },
  orgGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  orgCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  orgCardWide:  { flex: 1, minWidth: 260 },
  orgTagRow:    { marginBottom: 8 },
  orgTag:       { alignSelf: 'flex-start', backgroundColor: '#E8F5E9', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  orgTagText:   { fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32' },
  orgName:      { fontSize: fontSize.body, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  orgDesc:      { fontSize: fontSize.caption, color: '#555', lineHeight: 19, marginBottom: 12 },
  orgActions:   { gap: 8 },
  orgPhoneBtn:  { paddingVertical: 6 },
  orgPhoneText: { fontSize: fontSize.caption, color: '#555' },
  orgWebBtn:    { borderWidth: 1, borderColor: '#2E7D32', borderRadius: 6, padding: 8, alignItems: 'center' },
  orgWebText:   { fontSize: fontSize.caption, color: '#2E7D32', fontWeight: 'bold' },

  // Shared card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: { fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' },
  cardTitle: { fontSize: fontSize.h3, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  cardDesc:  { fontSize: fontSize.small, color: '#666', lineHeight: 21, marginBottom: 16 },

  linkRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  linkIcon:    { width: 32, height: 32, borderRadius: 8, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  linkIconText:{ color: '#2E7D32', fontWeight: 'bold', fontSize: fontSize.body },
  linkContent: { flex: 1 },
  rowBetween:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  linkTitle:   { fontSize: fontSize.small, fontWeight: 'bold', color: '#1a1a1a', flex: 1 },
  linkSub:     { fontSize: fontSize.tiny, color: '#777', lineHeight: 18 },
  fedTag:      { backgroundColor: '#E3F2FD', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  fedTagText:  { fontSize: fontSize.tiny, fontWeight: 'bold', color: '#1565C0' },

  primaryBtn:       { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: fontSize.button },
  secondaryBtn:     { borderWidth: 1.5, borderColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  secondaryBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: fontSize.button },

  disclaimerBox: { backgroundColor: '#FFF8E1', borderRadius: 10, padding: 14, marginBottom: 40, borderWidth: 1, borderColor: '#FFE082' },
  disclaimerText:{ fontSize: fontSize.tiny, color: '#795548', lineHeight: 18, textAlign: 'center' },
});
