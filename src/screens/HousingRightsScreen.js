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
import { fontSize, font } from '../theme/typography';

const LANDLORD_CANNOT = [
  'Refuse to rent, sell, or negotiate because of a protected characteristic.',
  'Offer different rental terms, deposits, fees, or privileges to different tenants.',
  'Steer tenants toward or away from neighborhoods or buildings.',
  'Retaliate after a tenant asks questions, requests accommodation, or files a complaint.',
  'Harass, intimidate, threaten, or create a hostile housing environment.',
  'Use ads or listings that discourage applicants from protected groups.',
];

const ACTION_STEPS = [
  {
    id: 'document',
    step: '01',
    title: 'Document what happened',
    desc: 'Save dates, screenshots, ads, emails, texts, notices, and names. Small details are often what make a complaint easier to investigate.',
  },
  {
    id: 'local-help',
    step: '02',
    title: 'Talk to a Durham or NC advocate',
    desc: 'If you are unsure whether something is illegal, reach out early. Local and statewide fair housing teams can help you understand your options.',
  },
  {
    id: 'report',
    step: '03',
    title: 'Choose where to report',
    desc: 'You may be able to report to HUD, Durham Human Relations, or another agency depending on the situation and what kind of help you need.',
  },
  {
    id: 'support',
    step: '04',
    title: 'Ask for accommodation or support',
    desc: 'Disability-related accommodation requests, language access needs, and eviction support can all change what the next best step looks like.',
  },
];

const PROTECTED_CLASSES = [
  {
    id: 'race-color',
    title: 'Race & Color',
    scope: 'Federal and Durham protections',
    detail:
      'Housing providers cannot treat people differently because of race or skin color in renting, selling, advertising, repairs, renewals, or neighborhood steering.',
  },
  {
    id: 'religion',
    title: 'Religion',
    scope: 'Federal and Durham protections',
    detail:
      'A landlord or property manager cannot deny housing, apply different rules, or create a hostile environment because of religious belief, practice, or nonbelief.',
  },
  {
    id: 'sex-gender',
    title: 'Sex & Gender',
    scope: 'Federal and Durham protections',
    detail:
      'Sex discrimination can include unequal treatment, sexual harassment, and other conduct tied to sex or gender in housing access and tenancy.',
  },
  {
    id: 'orientation-identity',
    title: 'Sexual Orientation & Gender Identity',
    scope: 'Durham ordinance',
    detail:
      'The City of Durham says its fair housing protections include sexual orientation and sexual identity in addition to the federal baseline rules.',
  },
  {
    id: 'origin',
    title: 'National Origin',
    scope: 'Federal and Durham protections',
    detail:
      'It is illegal to discriminate because of ancestry, ethnicity, birthplace, language background, or because someone appears to be from a particular country or region.',
  },
  {
    id: 'disability',
    title: 'Disability',
    scope: 'Federal and Durham protections',
    detail:
      'Disability protections can include equal treatment plus reasonable accommodations or modifications, such as assistance-animal requests or accessible policy changes.',
  },
  {
    id: 'familial',
    title: 'Familial Status',
    scope: 'Federal and Durham protections',
    detail:
      'Families with children, pregnant tenants, and people securing custody of children are protected from rules or refusals that target households with kids.',
  },
  {
    id: 'military',
    title: 'Military Status',
    scope: 'Durham ordinance',
    detail:
      'Durham says local fair housing protections include military status, expanding beyond the core federal protected classes listed in the Fair Housing Act.',
  },
  {
    id: 'hairstyles',
    title: 'Protected Hairstyles',
    scope: 'Durham ordinance',
    detail:
      'Durham includes protected hairstyles in its local nondiscrimination enforcement, which can matter when discrimination is tied to race-based appearance rules.',
  },
];

const QUICK_FACTS = [
  {
    label: 'HUD timing',
    value:
      'HUD says allegations under the Fair Housing Act should be filed within 1 year of the last alleged discriminatory act.',
  },
  {
    label: 'Durham contact',
    value:
      'Durham Human Relations says residents can call 919-560-4570 to discuss housing discrimination.',
  },
  {
    label: 'Legal help',
    value:
      'Legal Aid NC lists its Fair Housing Helpline as 1-855-797-FAIR during weekday business hours.',
  },
];

const LOCAL_NOTE_ITEMS = [
  'Durham says its ordinance covers sexual orientation, sexual identity, military status, and protected hairstyles.',
  'The City says hostile-environment harassment and sexual harassment can also violate fair housing rules.',
  'HUD has separate guidance for disability accommodations, including assistance animals.',
];

const RESOURCE_LINKS = [
  {
    id: 'durham-human-relations',
    eyebrow: 'City of Durham',
    title: 'Human Relations and Fair Housing',
    desc: 'Read Durham fair housing protections and find the city complaint pathway for local housing discrimination issues.',
    url: 'https://www.durhamnc.gov/4811/Human-Relations',
  },
  {
    id: 'legal-aid-helpline',
    eyebrow: 'Legal Aid NC',
    title: 'Fair Housing Helpline',
    desc: 'Official helpline for housing discrimination questions in North Carolina: 1-855-797-FAIR.',
    url: 'https://legalaidnc.org/cta/fair-housing-helpline/',
  },
  {
    id: 'hud-process',
    eyebrow: 'HUD',
    title: 'Report and Investigation Process',
    desc: 'Learn how HUD handles fair housing allegations and why filing quickly matters.',
    url: 'https://www.hud.gov/stat/fheo/intake-investigation',
  },
  {
    id: 'durham-housing-authority',
    eyebrow: 'Durham Housing Authority',
    title: 'Housing Programs',
    desc: 'Explore public housing, voucher programs, and local housing stability information.',
    url: 'https://www.durhamhousingauthority.org/housing-programs',
  },
  {
    id: 'durham-affordable-housing',
    eyebrow: 'City of Durham',
    title: 'Affordable Housing and Community Development',
    desc: 'City housing and neighborhood services resources related to affordability, retention, and neighborhood support.',
    url: 'https://www.durhamnc.gov/445/Community-Development',
  },
  {
    id: 'eviction-diversion',
    eyebrow: 'City of Durham',
    title: 'Eviction Diversion Program',
    desc: 'City-backed eviction support information administered through Legal Aid of North Carolina.',
    url: 'https://www.durhamnc.gov/4611/Eviction-Diversion',
  },
  {
    id: 'hud-assistance-animals',
    eyebrow: 'HUD',
    title: 'Assistance Animals and Accommodations',
    desc: 'Official HUD guidance for disability-related assistance animal requests and reasonable accommodation rules.',
    url: 'https://www.hud.gov/helping-americans/assistance-animals',
  },
];

function SnapshotRow({ label, value }) {
  return (
    <View style={styles.snapshotRow}>
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text style={styles.snapshotValue}>{value}</Text>
    </View>
  );
}

export default function HousingRightsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMedium = width >= 760;
  const isWide = width >= 1120;

  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredClass, setHoveredClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(PROTECTED_CLASSES[0].id);

  const activeClass =
    PROTECTED_CLASSES.find((item) => item.id === hoveredClass) ||
    PROTECTED_CLASSES.find((item) => item.id === selectedClass) ||
    PROTECTED_CLASSES[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageFill}>
      <Navbar navigation={navigation} currentRoute="HousingRights" />

      <View style={styles.breadcrumb}>
        <Text
          onPress={() => navigation.navigate('Home')}
          style={styles.breadcrumbLink}>
          Home
        </Text>
        <Text style={styles.breadcrumbSep}> / </Text>
        <Text style={styles.breadcrumbCurrent}>Housing Rights</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={[styles.heroInner, isMedium && styles.heroInnerWide]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>KNOW YOUR RIGHTS</Text>
            <Text style={styles.heroTitle}>Housing Rights in Durham</Text>
            <Text style={styles.heroSub}>
              Federal law and Durham's local ordinance give residents more
              housing protections than many people realize. This page is a
              practical starting point for understanding what is covered and
              where to get help.
            </Text>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Federal baseline</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  Durham-specific additions
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  Official resource links
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.heroGuide}>
            <Text style={styles.heroGuideLabel}>Start here</Text>
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
              Important timing and contacts
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
            <Text style={styles.sidePanelEyebrow}>Durham Note</Text>
            <Text style={styles.sidePanelTitle}>
              Local protections can go further
            </Text>
            <Text style={styles.sidePanelText}>
              Durham says its Human Relations Division enforces both the federal
              Fair Housing Act and the City's fair housing ordinance.
            </Text>
            <View style={styles.noteList}>
              {LOCAL_NOTE_ITEMS.map((item) => (
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
            <Text style={styles.sectionLabel}>WHO IS PROTECTED</Text>
            <Text style={styles.sectionTitle}>
              Protected classes under the law
            </Text>
            <Text style={styles.sectionDesc}>
              Hover across the categories below to preview what each protection
              generally covers. Durham also lists several local protections
              beyond the basic federal Fair Housing Act categories.
            </Text>

            <View style={styles.classExplorer}>
              <View style={styles.tagGrid}>
                {PROTECTED_CLASSES.map((item) => {
                  const isActive = activeClass.id === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.9}
                      onPress={() => setSelectedClass(item.id)}
                      onMouseEnter={() => setHoveredClass(item.id)}
                      onMouseLeave={() => setHoveredClass(null)}
                      style={[styles.tag, isActive && styles.tagActive]}>
                      <Text
                        style={[
                          styles.tagText,
                          isActive && styles.tagTextActive,
                        ]}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.classDetailCard}>
                <Text style={styles.classDetailScope}>{activeClass.scope}</Text>
                <Text style={styles.classDetailTitle}>{activeClass.title}</Text>
                <Text style={styles.classDetailText}>{activeClass.detail}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardAccent} />
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>LANDLORD OBLIGATIONS</Text>
              <Text style={styles.cardTitle}>What landlords cannot do</Text>
              {LANDLORD_CANNOT.map((item) => (
                <View key={item} style={styles.listRow}>
                  <View style={styles.listDot} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>TAKE ACTION</Text>
            <Text style={styles.sectionTitle}>What you can do next</Text>
            <View
              style={[styles.actionGrid, isMedium && styles.actionGridWide]}>
              {ACTION_STEPS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={1}
                  onPress={() => {}}
                  onMouseEnter={() => setHoveredAction(item.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                  style={[
                    styles.actionCard,
                    isMedium && styles.actionCardWide,
                    hoveredAction === item.id && styles.actionCardHover,
                  ]}>
                  <View style={styles.actionStepBadge}>
                    <Text style={styles.actionStepText}>{item.step}</Text>
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <Text style={styles.actionDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.resourcesCard}>
            <Text style={styles.cardLabel}>OFFICIAL RESOURCES</Text>
            <Text style={styles.cardTitle}>
              More Durham and fair housing links
            </Text>
            <Text style={styles.resourcesIntro}>
              These links point to City of Durham, HUD, Durham Housing
              Authority, and Legal Aid NC pages that are relevant to local
              housing rights, discrimination reporting, and support.
            </Text>

            {RESOURCE_LINKS.map((item, index) => {
              const isHovered = hoveredLink === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.linkRow,
                    index === RESOURCE_LINKS.length - 1 && styles.linkRowLast,
                    isHovered && styles.linkRowHover,
                  ]}
                  onPress={() => Linking.openURL(item.url)}
                  onMouseEnter={() => setHoveredLink(item.id)}
                  onMouseLeave={() => setHoveredLink(null)}
                  activeOpacity={0.75}>
                  <View style={styles.linkIcon}>
                    <Text style={styles.linkIconText}>Go</Text>
                  </View>
                  <View style={styles.linkContent}>
                    <Text style={styles.linkEyebrow}>{item.eyebrow}</Text>
                    <Text
                      style={[
                        styles.linkTitle,
                        isHovered && styles.linkTitleHover,
                      ]}>
                      {item.title}
                    </Text>
                    <Text style={styles.linkSub}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                hoveredBtn === 'primary' && styles.primaryBtnHover,
              ]}
              onPress={() => navigation.navigate('DiscriminationChecker')}
              onMouseEnter={() => setHoveredBtn('primary')}
              onMouseLeave={() => setHoveredBtn(null)}
              activeOpacity={0.75}>
              <Text style={styles.primaryBtnText}>
                Check If You Qualify to File
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                hoveredBtn === 'secondary' && styles.secondaryBtnHover,
              ]}
              onPress={() =>
                navigation.navigate('Resources', { category: 'housing' })
              }
              onMouseEnter={() => setHoveredBtn('secondary')}
              onMouseLeave={() => setHoveredBtn(null)}
              activeOpacity={0.75}>
              <Text
                style={[
                  styles.secondaryBtnText,
                  hoveredBtn === 'secondary' && styles.secondaryBtnTextHover,
                ]}>
                Find Local Housing Resources
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            This page is educational and not legal advice. If you need advice on
            a specific situation, contact a qualified advocate or attorney.
          </Text>
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
    ...font.bold,
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
  heroLabel: {
    color: COLORS.gold,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: fontSize.hero,
    ...font.extra,
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
    ...font.bold,
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
    ...font.extra,
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
    ...font.extra,
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
    ...font.extra,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sidePanelTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    ...font.extra,
    marginBottom: 12,
  },
  sidePanelText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
    marginBottom: 16,
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
    ...font.extra,
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
    ...font.extra,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h2,
    ...font.extra,
    marginBottom: 12,
  },
  sectionDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.body,
    lineHeight: 27,
    marginBottom: 18,
    maxWidth: 860,
  },
  classExplorer: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    padding: 22,
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#FBFCF8',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagActive: {
    backgroundColor: '#EEF7E8',
    borderColor: 'rgba(46, 125, 50, 0.35)',
    transform: [{ translateY: -1 }],
  },
  tagText: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    ...font.bold,
  },
  tagTextActive: {
    color: COLORS.primaryDeep,
  },
  classDetailCard: {
    borderRadius: 24,
    backgroundColor: '#F7FAF4',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  classDetailScope: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    ...font.extra,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  classDetailTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    ...font.extra,
    marginBottom: 8,
  },
  classDetailText: {
    color: COLORS.textMuted,
    fontSize: fontSize.body,
    lineHeight: 26,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  cardAccent: {
    width: 5,
    backgroundColor: COLORS.primaryDeep,
  },
  cardInner: {
    flex: 1,
    padding: 24,
  },
  cardLabel: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h3,
    ...font.extra,
    marginBottom: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
    gap: 12,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryDeep,
    marginTop: 7,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    lineHeight: 23,
  },
  actionGrid: {
    gap: 14,
  },
  actionGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  actionCardWide: {
    flex: 1,
    minWidth: 280,
  },
  actionCardHover: {
    transform: [{ translateY: -2 }],
    borderColor: 'rgba(46, 125, 50, 0.28)',
    backgroundColor: '#F7FBF3',
  },
  actionStepBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EAF4E3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionStepText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 0.8,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.body,
    ...font.extra,
    marginBottom: 6,
  },
  actionDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 22,
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
  resourcesIntro: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 24,
    marginBottom: 8,
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
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkRowHover: {
    backgroundColor: '#F4F9EF',
    paddingHorizontal: 10,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF4E3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  linkIconText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.caption,
    ...font.extra,
  },
  linkContent: {
    flex: 1,
  },
  linkEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    ...font.extra,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  linkTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    ...font.extra,
    marginBottom: 4,
  },
  linkTitleHover: {
    color: COLORS.primaryDeep,
  },
  linkSub: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 21,
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
    ...font.extra,
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
  secondaryBtnText: {
    color: COLORS.primary,
    ...font.extra,
    fontSize: fontSize.button,
  },
  secondaryBtnHover: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ translateY: -1 }],
  },
  secondaryBtnTextHover: {
    color: '#FFFFFF',
  },
  disclaimer: {
    color: '#768071',
    fontSize: fontSize.tiny,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
});
