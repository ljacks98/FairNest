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

const LANDLORD_CANNOT = [
  'Refuse to rent or sell based on a protected characteristic',
  'Offer different rental terms, conditions, or privileges',
  'Falsely claim a unit is unavailable',
  'Harass, intimidate, or threaten tenants',
  'Retaliate against tenants who exercise their rights',
  'Discriminate in advertising or property listings',
];

const YOU_CAN_DO = [
  { icon: '📝', title: 'Document Everything', desc: 'Keep records of dates, names, conversations, emails, and any written communication with your landlord.' },
  { icon: '📞', title: 'Contact an Advocate', desc: 'Reach out to Legal Aid NC or Durham Housing Authority for free guidance on your situation.' },
  { icon: '🏛️', title: 'File with HUD', desc: 'Submit a fair housing complaint directly to the U.S. Department of Housing and Urban Development.' },
  { icon: '📋', title: 'File with FairNest', desc: 'Use our reporting tool to document your experience and connect with local support.' },
];

const PROTECTED_CLASSES = [
  'Race & Color', 'Religion', 'Sex & Gender', 'National Origin',
  'Disability', 'Familial Status', 'LGBTQ+ Status (NC)',
];

export default function HousingRightsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="HousingRights" />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>KNOW YOUR RIGHTS</Text>
        <Text style={styles.heroTitle}>Housing Rights in Durham</Text>
        <Text style={styles.heroSub}>
          Federal and state fair housing laws protect Durham tenants from
          discrimination. Here's what you need to know.
        </Text>
      </View>

      <View style={styles.body}>

        {/* Protected classes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHO IS PROTECTED</Text>
          <Text style={styles.sectionTitle}>Protected Classes Under the Law</Text>
          <Text style={styles.sectionDesc}>
            The Fair Housing Act prohibits discrimination based on the following
            characteristics. If you belong to any of these groups, you have
            legal protections.
          </Text>
          <View style={styles.tagGrid}>
            {PROTECTED_CLASSES.map(c => (
              <View key={c} style={styles.tag}>
                <Text style={styles.tagText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What landlords cannot do */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>LANDLORD OBLIGATIONS</Text>
          <Text style={styles.cardTitle}>What Landlords Cannot Do</Text>
          {LANDLORD_CANNOT.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <View style={styles.listDot} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* What you can do */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAKE ACTION</Text>
          <Text style={styles.sectionTitle}>What You Can Do</Text>
          <View style={[styles.actionGrid, isWide && styles.actionGridWide]}>
            {YOU_CAN_DO.map((item, i) => (
              <View key={i} style={[styles.actionCard, isWide && styles.actionCardWide]}>
                <Text style={styles.actionIcon}>{item.icon}</Text>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* External links */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>OFFICIAL RESOURCES</Text>
          <Text style={styles.cardTitle}>Learn More</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://www.hud.gov/program_offices/fair_housing_equal_opp')}>
            <View style={styles.linkIcon}><Text style={styles.linkIconText}>↗</Text></View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>HUD — Fair Housing & Equal Opportunity</Text>
              <Text style={styles.linkSub}>File a federal complaint or learn about the Fair Housing Act</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://legalaidnc.org')}>
            <View style={styles.linkIcon}><Text style={styles.linkIconText}>↗</Text></View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Legal Aid of North Carolina</Text>
              <Text style={styles.linkSub}>Free legal help for low-income Durham residents — call 866-219-5262</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://www.durhamhousingauthority.org')}>
            <View style={styles.linkIcon}><Text style={styles.linkIconText}>↗</Text></View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Durham Housing Authority</Text>
              <Text style={styles.linkSub}>Local housing programs and assistance — call 919-683-8596</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTAs */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('DiscriminationChecker')}>
          <Text style={styles.primaryBtnText}>Check If You Qualify to File →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Resources', { category: 'housing' })}>
          <Text style={styles.secondaryBtnText}>Find Local Housing Resources</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          This information is for educational purposes only and does not constitute legal advice.
        </Text>
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
  heroLabel:  { fontSize: fontSize.tiny, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', letterSpacing: 2.5, marginBottom: 12 },
  heroTitle:  { fontSize: fontSize.hero, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  heroSub:    { fontSize: fontSize.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, maxWidth: 560 },

  body: { padding: 20, maxWidth: 900, alignSelf: 'center', width: '100%' },

  section:     { marginBottom: 24 },
  sectionLabel:{ fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 2, marginBottom: 8, marginTop: 8, textTransform: 'uppercase' },
  sectionTitle:{ fontSize: fontSize.h2, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  sectionDesc: { fontSize: fontSize.body, color: '#555', lineHeight: 22, marginBottom: 16 },

  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:     { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#A5D6A7' },
  tagText: { fontSize: fontSize.caption, color: '#2E7D32', fontWeight: '600' },

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
  cardTitle: { fontSize: fontSize.h3, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },

  listRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  listDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2E7D32', marginTop: 6, flexShrink: 0 },
  listText: { fontSize: fontSize.small, color: '#444', lineHeight: 21, flex: 1 },

  actionGrid:     { gap: 12 },
  actionGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  actionCard: {
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
  actionCardWide: { flex: 1, minWidth: 200 },
  actionIcon:  { fontSize: fontSize.h1, marginBottom: 10 },
  actionTitle: { fontSize: fontSize.body, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  actionDesc:  { fontSize: fontSize.caption, color: '#555', lineHeight: 20 },

  linkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  linkIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  linkIconText: { color: '#2E7D32', fontWeight: 'bold', fontSize: fontSize.body },
  linkContent:  { flex: 1 },
  linkTitle:    { fontSize: fontSize.small, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 3 },
  linkSub:      { fontSize: fontSize.tiny, color: '#777', lineHeight: 18 },

  primaryBtn:      { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryBtnText:  { color: '#fff', fontWeight: 'bold', fontSize: fontSize.button },
  secondaryBtn:    { borderWidth: 1.5, borderColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  secondaryBtnText:{ color: '#2E7D32', fontWeight: 'bold', fontSize: fontSize.button },

  disclaimer: { fontSize: fontSize.tiny, color: '#aaa', textAlign: 'center', lineHeight: 18, marginBottom: 40 },
});
