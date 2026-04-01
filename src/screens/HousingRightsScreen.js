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
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="HousingRights" />

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text onPress={() => navigation.navigate('Home')} style={styles.breadcrumbLink}>Home</Text>
        <Text style={styles.breadcrumbSep}> / </Text>
        <Text style={styles.breadcrumbCurrent}>Housing Rights</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>KNOW YOUR RIGHTS</Text>
        <Text style={styles.heroTitle}>Housing Rights{'\n'}in Durham</Text>
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
          <View style={styles.cardAccent} />
          <View style={styles.cardInner}>
            <Text style={styles.cardLabel}>LANDLORD OBLIGATIONS</Text>
            <Text style={styles.cardTitle}>What Landlords Cannot Do</Text>
            {LANDLORD_CANNOT.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.listDot} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What you can do */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAKE ACTION</Text>
          <Text style={styles.sectionTitle}>What You Can Do</Text>
          <View style={[styles.actionGrid, isWide && styles.actionGridWide]}>
            {YOU_CAN_DO.map((item, i) => (
              <View key={i} style={[styles.actionCard, isWide && styles.actionCardWide]}>
                <View style={styles.actionIconCircle}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* External links */}
        <View style={styles.resourcesCard}>
          <Text style={styles.cardLabel}>OFFICIAL RESOURCES</Text>
          <Text style={styles.cardTitle}>Learn More</Text>
          <TouchableOpacity
            style={[styles.linkRow, hoveredLink === 'hud' && styles.linkRowHover]}
            onPress={() => Linking.openURL('https://www.hud.gov/program_offices/fair_housing_equal_opp')}
            onMouseEnter={() => setHoveredLink('hud')}
            onMouseLeave={() => setHoveredLink(null)}
            activeOpacity={0.7}
            accessibilityLabel="Visit HUD Fair Housing and Equal Opportunity website"
          >
            <Text style={styles.linkIcon}>🔗</Text>
            <View style={styles.linkContent}>
              <Text style={[styles.linkTitle, hoveredLink === 'hud' && styles.linkTitleHover]}>HUD — Fair Housing & Equal Opportunity</Text>
              <Text style={styles.linkSub}>File a federal complaint or learn about the Fair Housing Act</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkRow, hoveredLink === 'legalaid' && styles.linkRowHover]}
            onPress={() => Linking.openURL('https://legalaidnc.org')}
            onMouseEnter={() => setHoveredLink('legalaid')}
            onMouseLeave={() => setHoveredLink(null)}
            activeOpacity={0.7}
            accessibilityLabel="Visit Legal Aid of North Carolina website"
          >
            <Text style={styles.linkIcon}>🔗</Text>
            <View style={styles.linkContent}>
              <Text style={[styles.linkTitle, hoveredLink === 'legalaid' && styles.linkTitleHover]}>Legal Aid of North Carolina</Text>
              <Text style={styles.linkSub}>Free legal help for low-income Durham residents — call 866-219-5262</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkRow, styles.linkRowLast, hoveredLink === 'durham' && styles.linkRowHover]}
            onPress={() => Linking.openURL('https://www.durhamhousingauthority.org')}
            onMouseEnter={() => setHoveredLink('durham')}
            onMouseLeave={() => setHoveredLink(null)}
            activeOpacity={0.7}
            accessibilityLabel="Visit Durham Housing Authority website"
          >
            <Text style={styles.linkIcon}>🔗</Text>
            <View style={styles.linkContent}>
              <Text style={[styles.linkTitle, hoveredLink === 'durham' && styles.linkTitleHover]}>Durham Housing Authority</Text>
              <Text style={styles.linkSub}>Local housing programs and assistance — call 919-683-8596</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTAs */}
        <TouchableOpacity
          style={[styles.primaryBtn, hoveredBtn === 'primary' && styles.primaryBtnHover]}
          onPress={() => navigation.navigate('DiscriminationChecker')}
          onMouseEnter={() => setHoveredBtn('primary')}
          onMouseLeave={() => setHoveredBtn(null)}
          activeOpacity={0.7}
          accessibilityLabel="Check if your situation qualifies as discrimination"
        >
          <Text style={styles.primaryBtnText}>Check If You Qualify to File →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, hoveredBtn === 'secondary' && styles.secondaryBtnHover]}
          onPress={() => navigation.navigate('Resources', { category: 'housing' })}
          onMouseEnter={() => setHoveredBtn('secondary')}
          onMouseLeave={() => setHoveredBtn(null)}
          activeOpacity={0.7}
          accessibilityLabel="Find local housing resources"
        >
          <Text style={[styles.secondaryBtnText, hoveredBtn === 'secondary' && styles.secondaryBtnTextHover]}>Find Local Housing Resources</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          This information is for educational purposes only and does not constitute legal advice.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.greenTint },

  // Breadcrumb
  breadcrumb:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
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
  heroLabel: {
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

  body: { padding: 20, maxWidth: 960, alignSelf: 'center', width: '100%' },

  section:      { marginBottom: 32, marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' },
  sectionTitle: { fontSize: fontSize.h2, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12, letterSpacing: -0.5 },
  sectionDesc:  { fontSize: fontSize.body, color: COLORS.textMuted, lineHeight: 24, marginBottom: 16 },

  // Protected class tags
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:     { backgroundColor: COLORS.greenTint, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#A5D6A7' },
  tagText: { fontSize: fontSize.caption, color: COLORS.primary, fontWeight: '700' },

  // Landlord card — left-border accent
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardAccent: { width: 4, backgroundColor: COLORS.primaryDeep },
  cardInner:  { flex: 1, padding: 22 },
  cardLabel:  { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' },
  cardTitle:  { fontSize: fontSize.h3, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16, letterSpacing: -0.3 },

  listRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  listDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primaryDeep, marginTop: 6, flexShrink: 0 },
  listText: { fontSize: fontSize.small, color: '#444', lineHeight: 21, flex: 1 },

  // Action cards — horizontal layout
  actionGrid:     { gap: 12 },
  actionGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionCardWide:   { flex: 1, minWidth: 260 },
  actionIconCircle: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.greenTint, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  actionText:  { flex: 1 },
  actionTitle: { fontSize: fontSize.body, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  actionDesc:  { fontSize: fontSize.caption, color: COLORS.textMuted, lineHeight: 20 },

  // Official resources card
  resourcesCard: {
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
  linkRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  linkRowLast: { borderBottomWidth: 0 },
  linkIcon:    { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.greenTint, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 },
  linkContent: { flex: 1 },
  linkTitle:   { fontSize: fontSize.small, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  linkSub:     { fontSize: fontSize.tiny, color: '#777', lineHeight: 18 },

  primaryBtn:           { backgroundColor: COLORS.primaryDeep, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryBtnText:       { color: COLORS.white, fontWeight: '700', fontSize: fontSize.button },
  primaryBtnHover:      { backgroundColor: COLORS.primary },
  secondaryBtn:         { borderWidth: 1.5, borderColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  secondaryBtnText:     { color: COLORS.primary, fontWeight: '700', fontSize: fontSize.button },
  secondaryBtnHover:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  secondaryBtnTextHover: { color: '#ffffff' },
  linkRowHover:         { backgroundColor: 'rgba(27,94,32,0.06)' },
  linkTitleHover:       { color: COLORS.primaryDeep },

  disclaimer: { fontSize: fontSize.tiny, color: '#aaa', textAlign: 'center', lineHeight: 18, marginBottom: 40 },
});
