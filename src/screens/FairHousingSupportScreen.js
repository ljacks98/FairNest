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

const SUPPORT_STEPS = [
  {
    id: 'document',
    step: '01',
    title: 'Document the incident',
    desc: 'Write down dates, names, statements, screening criteria, listing language, and any texts, notices, or screenshots tied to the housing issue.',
  },
  {
    id: 'qualify',
    step: '02',
    title: 'Check whether it may be discrimination',
    desc: 'Use the checker if you need a quick starting point, but do not wait for certainty before contacting an advocate if the situation feels urgent.',
  },
  {
    id: 'support',
    step: '03',
    title: 'Contact a support organization',
    desc: 'Local and statewide groups can help you understand the law, collect the right details, and choose the best complaint or legal path.',
  },
  {
    id: 'complaint',
    step: '04',
    title: 'Choose a complaint pathway',
    desc: 'Depending on the issue, a city, state, or federal fair housing complaint may be appropriate. Timing matters, so early outreach is helpful.',
  },
];

const LOCAL_SUPPORT = [
  {
    id: 'durham-human-relations',
    name: 'Durham Human Relations',
    desc: 'City office that says it enforces both the federal Fair Housing Act and Durham fair housing ordinance, including local protected classes.',
    phone: '919-560-4570',
    website: 'https://www.durhamnc.gov/4811/Human-Relations',
    tag: 'City of Durham',
  },
  {
    id: 'legal-aid-fair-housing',
    name: 'Legal Aid NC Fair Housing Helpline',
    desc: 'Fair housing-specific help line for discrimination questions in North Carolina, including support on what to document and where to report.',
    phone: '1-855-797-3247',
    website: 'https://legalaidnc.org/cta/fair-housing-helpline/',
    tag: 'Legal Aid',
  },
  {
    id: 'legal-aid-housing',
    name: 'Legal Aid NC Housing Helpline',
    desc: 'General housing legal help line covering eviction, repairs, subsidized housing issues, and other landlord-tenant problems.',
    phone: '1-877-201-6426',
    website: 'https://legalaidnc.org/cta/housing-helpline/',
    tag: 'Housing Help',
  },
  {
    id: 'disability-rights',
    name: 'Disability Rights NC',
    desc: 'Advocacy and rights support for people with disabilities, including housing discrimination and access-related problems.',
    phone: '877-235-4210',
    website: 'https://disabilityrightsnc.org',
    tag: 'Disability Rights',
  },
  {
    id: 'alliance',
    name: 'Alliance of Disability Advocates',
    desc: 'Independent living support and accessibility-related housing guidance for people with disabilities in North Carolina.',
    phone: '919-833-1117',
    website: 'https://alliancecil.org',
    tag: 'Accessibility',
  },
];

const OFFICIAL_PATHS = [
  {
    id: 'durham-complaint',
    eyebrow: 'City complaint path',
    title: 'Durham Human Relations complaint form and contact',
    desc: 'Durham says residents can submit an online complaint form or call 919-560-4570 about possible housing discrimination.',
    url: 'https://www.durhamnc.gov/4811/Human-Relations',
    badge: 'Local',
  },
  {
    id: 'hud-investigation',
    eyebrow: 'Federal complaint path',
    title: 'HUD report and investigation process',
    desc: 'HUD explains the Fair Housing Act complaint process and says allegations should generally be filed within 1 year of the last act.',
    url: 'https://www.hud.gov/stat/fheo/intake-investigation',
    badge: 'Federal',
  },
  {
    id: 'hud-animals',
    eyebrow: 'Accommodation guidance',
    title: 'HUD assistance animals and disability accommodations',
    desc: 'Useful official guidance if the housing problem involves disability accommodations, policy exceptions, or an assistance animal request.',
    url: 'https://www.hud.gov/helping-americans/assistance-animals',
    badge: 'HUD',
  },
];

const QUICK_FACTS = [
  {
    label: 'Durham scope',
    value:
      'Durham says its fair housing ordinance includes military status, protected hairstyles, sexual orientation, and sexual identity.',
  },
  {
    label: 'Fair housing help',
    value:
      'Legal Aid NC lists the Fair Housing Helpline as 1-855-797-FAIR, Monday through Friday, 9:00 AM to 5:00 PM.',
  },
  {
    label: 'Timing',
    value:
      'HUD says Fair Housing Act allegations should generally be filed within 1 year of the last alleged discriminatory act.',
  },
];

const SUPPORT_NOTES = [
  'Sexual harassment and other hostile-environment harassment can violate fair housing laws.',
  'Disability-related accommodation requests may require a different response path than a standard complaint alone.',
  'If a listing, denial, or screening decision feels suspicious, save the exact language before it changes.',
];

function SnapshotRow({ label, value }) {
  return (
    <View style={styles.snapshotRow}>
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text style={styles.snapshotValue}>{value}</Text>
    </View>
  );
}

export default function FairHousingSupportScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMedium = width >= 760;
  const isWide = width >= 1120;

  const [hoveredPhone, setHoveredPhone] = useState(null);
  const [hoveredWeb, setHoveredWeb] = useState(null);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredPrimary, setHoveredPrimary] = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageFill}>
      <Navbar navigation={navigation} currentRoute="FairHousingSupport" />

      <View style={styles.breadcrumb}>
        <Text
          onPress={() => navigation.navigate('Home')}
          style={styles.breadcrumbLink}>
          Home
        </Text>
        <Text style={styles.breadcrumbSep}> / </Text>
        <Text style={styles.breadcrumbCurrent}>Fair Housing Support</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={[styles.heroInner, isMedium && styles.heroInnerWide]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>FAIR HOUSING SUPPORT</Text>
            <Text style={styles.heroTitle}>
              You do not have to navigate this alone
            </Text>
            <Text style={styles.heroSub}>
              Durham residents can reach city, legal, disability-rights, and
              federal housing support channels without paying to start the
              process. This page is a practical map of where to go next.
            </Text>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>City support</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Statewide legal help</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Federal complaint path</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroGuide}>
            <Text style={styles.heroGuideLabel}>What matters first</Text>
            {QUICK_FACTS.map((fact) => (
              <View key={fact.label} style={styles.heroGuideRow}>
                <View style={styles.heroGuideDot} />
                <View style={styles.heroGuideCopy}>
                  <Text style={styles.heroGuideTitle}>{fact.label}</Text>
                  <Text style={styles.heroGuideText}>{fact.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.workspace, isWide && styles.workspaceWide]}>
        <View style={[styles.sideRail, isWide && styles.sideRailWide]}>
          <View style={styles.sidePanel}>
            <Text style={styles.sidePanelEyebrow}>Quick Facts</Text>
            <Text style={styles.sidePanelTitle}>
              Before you contact someone
            </Text>
            <View style={styles.snapshotCard}>
              {QUICK_FACTS.map((fact) => (
                <SnapshotRow
                  key={fact.label}
                  label={fact.label}
                  value={fact.value}
                />
              ))}
            </View>
          </View>

          <View style={styles.sidePanelMuted}>
            <Text style={styles.sidePanelEyebrow}>Support Notes</Text>
            <Text style={styles.sidePanelTitle}>
              Situations worth flagging early
            </Text>
            <View style={styles.noteList}>
              {SUPPORT_NOTES.map((item) => (
                <View key={item} style={styles.noteRow}>
                  <View style={styles.noteDot} />
                  <Text style={styles.noteText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.mainColumn}>
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>WHERE TO START</Text>
            <Text style={styles.sectionTitle}>
              Steps to take after a housing discrimination issue
            </Text>
            <View style={[styles.stepsGrid, isMedium && styles.stepsGridWide]}>
              {SUPPORT_STEPS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={1}
                  onPress={() => {}}
                  onMouseEnter={() => setHoveredAction(item.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                  style={[
                    styles.stepCard,
                    isMedium && styles.stepCardWide,
                    hoveredAction === item.id && styles.stepCardHover,
                  ]}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{item.step}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>LOCAL SUPPORT</Text>
            <Text style={styles.sectionTitle}>
              Durham and North Carolina organizations
            </Text>
            <Text style={styles.sectionDesc}>
              These organizations can help with fair housing questions, legal
              options, disability accommodations, and local complaint pathways.
            </Text>
            <View style={[styles.orgGrid, isMedium && styles.orgGridWide]}>
              {LOCAL_SUPPORT.map((org) => (
                <View
                  key={org.id}
                  style={[styles.orgCard, isMedium && styles.orgCardWide]}>
                  <View style={styles.orgAccent} />
                  <View style={styles.orgBody}>
                    <View style={styles.orgTag}>
                      <Text style={styles.orgTagText}>{org.tag}</Text>
                    </View>
                    <Text style={styles.orgName}>{org.name}</Text>
                    <Text style={styles.orgDesc}>{org.desc}</Text>
                    <View style={styles.orgActions}>
                      <TouchableOpacity
                        style={[
                          styles.orgPhoneBtn,
                          hoveredPhone === org.id && styles.orgPhoneBtnHover,
                        ]}
                        onPress={() => Linking.openURL(`tel:${org.phone}`)}
                        onMouseEnter={() => setHoveredPhone(org.id)}
                        onMouseLeave={() => setHoveredPhone(null)}
                        activeOpacity={0.75}>
                        <Text style={styles.orgPhoneText}>{org.phone}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.orgWebBtn,
                          hoveredWeb === org.id && styles.orgWebBtnHover,
                        ]}
                        onPress={() => Linking.openURL(org.website)}
                        onMouseEnter={() => setHoveredWeb(org.id)}
                        onMouseLeave={() => setHoveredWeb(null)}
                        activeOpacity={0.75}>
                        <Text
                          style={[
                            styles.orgWebText,
                            hoveredWeb === org.id && styles.orgWebTextHover,
                          ]}>
                          Visit Website
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.resourcesCard}>
            <Text style={styles.cardLabel}>OFFICIAL PATHWAYS</Text>
            <Text style={styles.cardTitle}>
              Complaint and accommodation routes
            </Text>
            <Text style={styles.cardDesc}>
              Use these official resources if you are ready to report, need to
              understand the complaint process, or are dealing with a
              disability-related housing accommodation issue.
            </Text>
            {OFFICIAL_PATHS.map((org, index) => (
              <TouchableOpacity
                key={org.id}
                style={[
                  styles.linkRow,
                  index === OFFICIAL_PATHS.length - 1 && styles.linkRowLast,
                  hoveredPath === org.id && styles.linkRowHover,
                ]}
                onPress={() => Linking.openURL(org.url)}
                onMouseEnter={() => setHoveredPath(org.id)}
                onMouseLeave={() => setHoveredPath(null)}
                activeOpacity={0.75}>
                <View style={styles.linkIconBox}>
                  <Text style={styles.linkIconText}>Go</Text>
                </View>
                <View style={styles.linkContent}>
                  <View style={styles.linkTitleRow}>
                    <Text
                      style={[
                        styles.linkTitle,
                        hoveredPath === org.id && styles.linkTitleHover,
                      ]}>
                      {org.title}
                    </Text>
                    <View
                      style={[
                        styles.pathTag,
                        org.badge === 'Federal' && styles.pathTagFederal,
                      ]}>
                      <Text
                        style={[
                          styles.pathTagText,
                          org.badge === 'Federal' && styles.pathTagTextFederal,
                        ]}>
                        {org.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.linkEyebrow}>{org.eyebrow}</Text>
                  <Text style={styles.linkSub}>{org.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                hoveredPrimary && styles.primaryBtnHover,
              ]}
              onPress={() => navigation.navigate('DiscriminationChecker')}
              onMouseEnter={() => setHoveredPrimary(true)}
              onMouseLeave={() => setHoveredPrimary(false)}
              activeOpacity={0.75}>
              <Text style={styles.primaryBtnText}>
                Check If Your Situation Qualifies
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                hoveredSecondary && styles.secondaryBtnHover,
              ]}
              onPress={() => navigation.navigate('Report')}
              onMouseEnter={() => setHoveredSecondary(true)}
              onMouseLeave={() => setHoveredSecondary(false)}
              activeOpacity={0.75}>
              <Text
                style={[
                  styles.secondaryBtnText,
                  hoveredSecondary && styles.secondaryBtnTextHover,
                ]}>
                File a Report with FairNest
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              FairNest does not decide complaints or provide legal advice. This
              page is meant to help residents reach the right support channels.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5EF',
  },
  pageFill: {
    paddingBottom: 56,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  breadcrumbLink: {
    fontSize: fontSize.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  breadcrumbSep: {
    fontSize: fontSize.caption,
    color: '#A1A79F',
    marginHorizontal: 4,
  },
  breadcrumbCurrent: {
    fontSize: fontSize.caption,
    color: COLORS.textMuted,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.primaryDeep,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 112,
  },
  heroGlowA: {
    position: 'absolute',
    top: -120,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(133, 196, 112, 0.18)',
  },
  heroGlowB: {
    position: 'absolute',
    bottom: -180,
    left: -80,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroInner: {
    width: '100%',
    maxWidth: 1380,
    alignSelf: 'center',
    gap: 28,
  },
  heroInnerWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    maxWidth: 720,
  },
  heroEyebrow: {
    color: COLORS.gold,
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: fontSize.hero,
    fontWeight: '800',
    lineHeight: fontSize.hero * 1.08,
    marginBottom: 14,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.bodyLg,
    lineHeight: 30,
    maxWidth: 650,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  heroBadge: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroBadgeText: {
    color: '#F5FAF0',
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  heroGuide: {
    width: '100%',
    maxWidth: 390,
    padding: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
  heroGuideLabel: {
    color: '#E7F3DD',
    fontSize: fontSize.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  heroGuideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroGuideDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D5EEBE',
    marginTop: 8,
  },
  heroGuideCopy: {
    flex: 1,
  },
  heroGuideTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.small,
    fontWeight: '800',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  heroGuideText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: fontSize.caption,
    lineHeight: 20,
  },
  workspace: {
    width: '100%',
    maxWidth: 1380,
    alignSelf: 'center',
    paddingHorizontal: 24,
    marginTop: 28,
    gap: 28,
  },
  workspaceWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sideRail: {
    width: '100%',
    gap: 18,
  },
  sideRailWide: {
    width: 340,
  },
  sidePanel: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  sidePanelMuted: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#EEF5E9',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  sidePanelEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sidePanelTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    fontWeight: '800',
    marginBottom: 12,
  },
  snapshotCard: {
    borderRadius: 22,
    backgroundColor: '#F7FAF4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  snapshotRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 94, 32, 0.08)',
  },
  snapshotLabel: {
    color: COLORS.textMuted,
    fontSize: fontSize.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  snapshotValue: {
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    lineHeight: 21,
  },
  noteList: {
    gap: 14,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 7,
  },
  noteText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  sectionBlock: {
    marginBottom: 28,
  },
  sectionLabel: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h2,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.body,
    lineHeight: 27,
    marginBottom: 18,
    maxWidth: 860,
  },
  stepsGrid: {
    gap: 14,
  },
  stepsGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  stepCardWide: {
    flex: 1,
    minWidth: 230,
  },
  stepCardHover: {
    transform: [{ translateY: -2 }],
    borderColor: 'rgba(46, 125, 50, 0.28)',
    backgroundColor: '#F7FBF3',
  },
  stepBadge: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#EAF4E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepBadgeText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.body,
    fontWeight: '800',
    marginBottom: 8,
  },
  stepDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 22,
  },
  orgGrid: {
    gap: 14,
  },
  orgGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  orgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  orgCardWide: {
    flex: 1,
    minWidth: 300,
  },
  orgAccent: {
    width: 5,
    backgroundColor: COLORS.primaryDeep,
  },
  orgBody: {
    flex: 1,
    padding: 20,
  },
  orgTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF4E3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  orgTagText: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  orgName: {
    color: COLORS.textPrimary,
    fontSize: fontSize.body,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 24,
  },
  orgDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 22,
    marginBottom: 16,
  },
  orgActions: {
    gap: 10,
  },
  orgPhoneBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F7FAF4',
  },
  orgPhoneBtnHover: {
    backgroundColor: '#EEF7E8',
  },
  orgPhoneText: {
    color: COLORS.textPrimary,
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  orgWebBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  orgWebBtnHover: {
    opacity: 0.75,
  },
  orgWebText: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
  },
  orgWebTextHover: {
    color: COLORS.primaryDeep,
  },
  resourcesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  cardLabel: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h3,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 24,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1EA',
    borderRadius: 18,
  },
  linkRowHover: {
    backgroundColor: '#F4F9EF',
    paddingHorizontal: 10,
  },
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF4E3',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  linkIconText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.caption,
    fontWeight: '800',
  },
  linkContent: {
    flex: 1,
  },
  linkTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  linkTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    fontWeight: '800',
  },
  linkTitleHover: {
    color: COLORS.primaryDeep,
  },
  linkEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  linkSub: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 21,
  },
  pathTag: {
    backgroundColor: '#EAF4E3',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pathTagFederal: {
    backgroundColor: '#E3F2FD',
  },
  pathTagText: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    fontWeight: '800',
  },
  pathTagTextFederal: {
    color: '#1565C0',
  },
  ctaRow: {
    gap: 12,
    marginBottom: 18,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryDeep,
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
  },
  primaryBtnHover: {
    backgroundColor: COLORS.primary,
    transform: [{ translateY: -1 }],
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: fontSize.button,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnHover: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ translateY: -1 }],
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: fontSize.button,
  },
  secondaryBtnTextHover: {
    color: '#FFFFFF',
  },
  disclaimerBox: {
    backgroundColor: '#FFF9E8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2DD95',
  },
  disclaimerText: {
    color: '#5D4037',
    fontSize: fontSize.caption,
    lineHeight: 21,
    textAlign: 'center',
  },
});
