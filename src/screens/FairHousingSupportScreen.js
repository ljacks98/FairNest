import React, { useState } from 'react';
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
import { COLORS } from '../utils/constants';
import { fontSize } from '../theme/typography';

const STEPS = [
  { step: '1', icon: '📝', title: 'Document the Incident', desc: 'Write down everything: dates, times, names, what was said or done. Save any texts, emails, or letters.' },
  { step: '2', icon: '🔍', title: 'Check If You Qualify',  desc: 'Use our Discrimination Checker to see if your situation meets the legal criteria for a fair housing claim.' },
  { step: '3', icon: '📋', title: 'File a Report',         desc: 'Submit your report through FairNest to create an official record of the incident.' },
  { step: '4', icon: '⚖️', title: 'Seek Legal Help',       desc: 'Contact Legal Aid NC for free legal advice. They can represent you at no cost if your case qualifies.' },
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

  const [hoveredPhone, setHoveredPhone] = useState(null);
  const [hoveredWeb, setHoveredWeb] = useState(null);
  const [hoveredFed, setHoveredFed] = useState(null);
  const [hoveredPrimary, setHoveredPrimary] = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="FairHousingSupport" />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text
          onPress={() => navigation.navigate('Home')}
          style={styles.breadcrumbLink}
        >
          Home
        </Text>
        <Text style={styles.breadcrumbSep}> / </Text>
        <Text style={styles.breadcrumbCurrent}>Fair Housing Support</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <Text style={styles.heroEyebrow}>FAIR HOUSING SUPPORT</Text>
          <Text style={styles.heroTitle}>You Don't Have to{'\n'}Face This Alone</Text>
          <Text style={styles.heroSub}>
            If you've experienced housing discrimination, there are organizations
            and legal resources in Durham ready to help — at no cost to you.
          </Text>
        </View>
      </View>

      <View style={styles.body}>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>WHERE TO START</Text>
          <Text style={styles.sectionTitle}>Steps to Take If You've Been Discriminated Against</Text>
          <View style={[styles.stepsGrid, isWide && styles.stepsGridWide]}>
            {STEPS.map(s => (
              <View key={s.step} style={[styles.stepCard, isWide && styles.stepCardWide]}>
                <Text style={styles.stepBackNum}>{s.step}</Text>
                <View style={styles.stepIconCircle}>
                  <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                </View>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Local orgs */}
        <View style={styles.section}>
          <Text style={styles.eyebrow}>LOCAL SUPPORT</Text>
          <Text style={styles.sectionTitle}>Durham & North Carolina Organizations</Text>
          <View style={[styles.orgGrid, isWide && styles.orgGridWide]}>
            {LOCAL_ORGS.map((org, i) => (
              <View key={i} style={[styles.orgCard, isWide && styles.orgCardWide]}>
                <View style={styles.orgAccent} />
                <View style={styles.orgBody}>
                  <View style={styles.orgTag}>
                    <Text style={styles.orgTagText}>{org.tag}</Text>
                  </View>
                  <Text style={styles.orgName}>{org.name}</Text>
                  <Text style={styles.orgDesc}>{org.desc}</Text>
                  <View style={styles.orgActions}>
                    {org.phone && (
                      <TouchableOpacity
                        style={[styles.orgPhoneBtn, hoveredPhone === i && styles.orgPhoneBtnHover]}
                        onPress={() => Linking.openURL(`tel:${org.phone}`)}
                        onMouseEnter={() => setHoveredPhone(i)}
                        onMouseLeave={() => setHoveredPhone(null)}
                        activeOpacity={0.7}
                        accessibilityLabel={`Call ${org.name} at ${org.phone}`}
                      >
                        <Text style={{ fontSize: 13 }}>📞</Text>
                        <Text style={styles.orgPhoneText}>{org.phone}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.orgWebBtn, hoveredWeb === i && styles.orgWebBtnHover]}
                      onPress={() => Linking.openURL(org.url)}
                      onMouseEnter={() => setHoveredWeb(i)}
                      onMouseLeave={() => setHoveredWeb(null)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Visit ${org.name} website`}
                    >
                      <Text style={styles.orgWebText}>Visit Website →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Federal / State complaint card */}
        <View style={styles.complaintCard}>
          <Text style={styles.eyebrow}>FEDERAL & STATE</Text>
          <Text style={styles.cardTitle}>File an Official Complaint</Text>
          <Text style={styles.cardDesc}>
            You can file a formal complaint with government agencies. Investigations are free and confidential.
          </Text>
          {FEDERAL_ORGS.map((org, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.linkRow, i === FEDERAL_ORGS.length - 1 && styles.linkRowLast, hoveredFed === i && styles.linkRowHover]}
              onPress={() => Linking.openURL(org.url)}
              onMouseEnter={() => setHoveredFed(i)}
              onMouseLeave={() => setHoveredFed(null)}
              activeOpacity={0.7}
              accessibilityLabel={`Visit ${org.name}`}
            >
              <Text style={styles.linkIconBox}>🔗</Text>
              <View style={styles.linkContent}>
                <View style={styles.linkTitleRow}>
                  <Text style={styles.linkTitle}>{org.name}</Text>
                  <View style={[styles.fedTag, org.tag === 'Federal' && styles.fedTagFed]}>
                    <Text style={[styles.fedTagText, org.tag === 'Federal' && styles.fedTagTextFed]}>{org.tag}</Text>
                  </View>
                </View>
                <Text style={styles.linkSub}>{org.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTAs */}
        <TouchableOpacity
          style={[styles.primaryBtn, hoveredPrimary && styles.primaryBtnHover]}
          onPress={() => navigation.navigate('DiscriminationChecker')}
          onMouseEnter={() => setHoveredPrimary(true)}
          onMouseLeave={() => setHoveredPrimary(false)}
          activeOpacity={0.7}
          accessibilityLabel="Check if your situation qualifies as discrimination"
        >
          <Text style={styles.primaryBtnText}>Check If Your Situation Qualifies →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, hoveredSecondary && styles.secondaryBtnHover]}
          onPress={() => navigation.navigate('Report')}
          onMouseEnter={() => setHoveredSecondary(true)}
          onMouseLeave={() => setHoveredSecondary(false)}
          activeOpacity={0.7}
          accessibilityLabel="File a report with FairNest"
        >
          <Text style={[styles.secondaryBtnText, hoveredSecondary && styles.secondaryBtnTextHover]}>File a Report with FairNest</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breadcrumbLink:    { fontSize: fontSize.caption, color: COLORS.primary, fontWeight: '600' },
  breadcrumbSep:     { fontSize: fontSize.caption, color: '#bbb', marginHorizontal: 4 },
  breadcrumbCurrent: { fontSize: fontSize.caption, color: COLORS.textMuted },

  // Hero
  hero: {
    backgroundColor: COLORS.primaryDeep,
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroInner: {
    maxWidth: 680,
    alignItems: 'center',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 3,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: fontSize.hero,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: fontSize.hero * 1.15,
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: fontSize.bodyLg,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: fontSize.bodyLg * 1.6,
    maxWidth: 560,
  },

  body:         { padding: 20, maxWidth: 960, alignSelf: 'center', width: '100%' },
  section:      { marginTop: 8, marginBottom: 32 },
  eyebrow:      { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' },
  sectionTitle: { fontSize: fontSize.h2, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 20, letterSpacing: -0.5 },

  // Step cards — numbered with faded backdrop
  stepsGrid:     { gap: 12 },
  stepsGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stepCardWide: { flex: 1, minWidth: 180 },
  stepBackNum: {
    position: 'absolute',
    top: -10,
    right: 10,
    fontSize: 80,
    fontWeight: '900',
    color: COLORS.primaryDeep,
    opacity: 0.06,
  },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.greenTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepTitle: { fontSize: fontSize.body, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  stepDesc:  { fontSize: fontSize.caption, color: COLORS.textMuted, lineHeight: 20 },

  // Org cards — left accent border treatment
  orgGrid:     { gap: 14 },
  orgGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  orgCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  orgCardWide: { flex: 1, minWidth: 280 },
  orgAccent:   { width: 4, backgroundColor: COLORS.primaryDeep },
  orgBody:     { flex: 1, padding: 18 },
  orgTag:      { alignSelf: 'flex-start', backgroundColor: COLORS.greenTint, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  orgTagText:  { fontSize: fontSize.tiny, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
  orgName:     { fontSize: fontSize.body, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6, lineHeight: 22 },
  orgDesc:     { fontSize: fontSize.caption, color: COLORS.textMuted, lineHeight: 19, marginBottom: 14 },
  orgActions:  { gap: 8 },
  orgPhoneBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orgPhoneBtnHover: { backgroundColor: 'rgba(27,94,32,0.08)', borderRadius: 6, paddingHorizontal: 6 },
  orgPhoneText:     { fontSize: fontSize.caption, color: COLORS.textPrimary, fontWeight: '600' },
  orgWebBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  orgWebBtnHover:   { opacity: 0.7 },
  orgWebText:       { fontSize: fontSize.caption, color: COLORS.primary, fontWeight: '600', textDecorationLine: 'underline' },

  // Official complaint card
  complaintCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: fontSize.h3, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8, letterSpacing: -0.3 },
  cardDesc:  { fontSize: fontSize.small, color: COLORS.textMuted, lineHeight: 21, marginBottom: 16 },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkRowHover: { backgroundColor: 'rgba(27,94,32,0.05)' },
  linkRowLast:  { borderBottomWidth: 0 },
  linkIconBox:  { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.greenTint, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 },
  linkContent:  { flex: 1 },
  linkTitleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, gap: 8, flexWrap: 'wrap' },
  linkTitle:    { fontSize: fontSize.small, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  linkSub:      { fontSize: fontSize.tiny, color: '#777', lineHeight: 18 },
  fedTag:       { backgroundColor: COLORS.greenTint, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  fedTagFed:    { backgroundColor: '#E3F2FD' },
  fedTagText:   { fontSize: fontSize.tiny, fontWeight: '700', color: COLORS.primary },
  fedTagTextFed:{ color: '#1565C0' },

  primaryBtn:           { backgroundColor: COLORS.primaryDeep, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryBtnHover:      { backgroundColor: '#163d18' },
  primaryBtnText:       { color: COLORS.white, fontWeight: '700', fontSize: fontSize.button },
  secondaryBtn:         { borderWidth: 1.5, borderColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  secondaryBtnHover:    { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
  secondaryBtnText:     { color: COLORS.primary, fontWeight: '700', fontSize: fontSize.button },
  secondaryBtnTextHover:{ color: '#ffffff' },

  disclaimerBox:  { backgroundColor: '#FFFDE7', borderRadius: 8, padding: 14, marginBottom: 40, borderWidth: 1, borderColor: '#FFF59D' },
  disclaimerText: { fontSize: fontSize.tiny, color: '#5D4037', lineHeight: 18, textAlign: 'center' },
});
