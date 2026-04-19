import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { resources as staticResources } from '../data/resources';
import Navbar from '../components/Navbar';
import { COLORS } from '../utils/constants';
import { fontSize, font } from '../theme/typography';

const HOUSING_FILTERS = [
  { label: 'All', value: null },
  { label: 'Rental Assistance', value: 'assistance' },
  { label: 'Affordable Housing', value: 'affordable' },
  { label: 'Legal Help', value: 'legal' },
];

const EMPLOYMENT_FILTERS = [
  { label: 'All', value: null },
  { label: 'Job Listings', value: 'listings' },
  { label: 'Training Programs', value: 'training' },
  { label: 'Employment Support', value: 'support' },
];

const CATEGORY_TABS = [
  { label: 'Accessibility', value: 'accessibility' },
  { label: 'Housing', value: 'housing' },
  { label: 'Jobs & Employment', value: 'employment' },
];

const CATEGORY_CONTENT = {
  housing: {
    title: 'Housing Resources',
    subtitle:
      'Local Durham programs, eviction support, legal help, affordability tools, and housing stability resources.',
    facts: [
      {
        label: 'Local programs',
        value:
          'Durham resources span public housing, homelessness prevention, eviction support, and affordable homeownership pathways.',
      },
      {
        label: 'Best first move',
        value:
          'If housing is unstable right now, start with the provider that matches the urgency of the situation, then document everything as you go.',
      },
      {
        label: 'Good companion pages',
        value:
          'Use Learn More for fair housing rights and Fair Housing Support if the issue may involve discrimination.',
      },
    ],
    notes: [
      'Need-based programs may have waitlists, appointment requirements, or eligibility screening.',
      'If the issue includes discrimination, a complaint pathway may matter as much as the housing resource itself.',
      'Keep the exact program name, website, and phone number saved after you call so follow-up is easier.',
    ],
    links: [
      {
        id: 'durham-community-development',
        eyebrow: 'City of Durham',
        title: 'Community Development',
        desc: 'City housing and neighborhood support information tied to affordability, preservation, and community development work.',
        url: 'https://www.durhamnc.gov/445/Community-Development',
      },
      {
        id: 'durham-eviction-diversion',
        eyebrow: 'City of Durham',
        title: 'Eviction Diversion Program',
        desc: 'Durham-backed program information for eviction support administered through Legal Aid of North Carolina.',
        url: 'https://www.durhamnc.gov/4611/Eviction-Diversion',
      },
      {
        id: 'nc211-housing',
        eyebrow: 'NC 211',
        title: 'NC 211 Housing Help',
        desc: 'Statewide referral service that can help residents locate housing, shelter, food, and crisis support resources.',
        url: 'https://nc211.org',
      },
    ],
  },
  employment: {
    title: 'Jobs & Employment',
    subtitle:
      'Job listings, workforce training, and career support programs in Durham focused on entry level roles and residents facing employment barriers.',
    facts: [
      {
        label: 'Entry-level focus',
        value:
          'Many Durham employers hire for roles that require no degree — transit, food service, hospital support, maintenance, and warehouse positions.',
      },
      {
        label: 'Free training available',
        value:
          'Durham Tech, StepUp Durham, Goodwill, and the Durham Literacy Center offer free skills training, GED prep, and job readiness programs.',
      },
      {
        label: 'Housing + employment',
        value:
          'If housing hardship is tied to job loss, combining employment support with housing assistance is often the strongest route forward.',
      },
    ],
    notes: [
      'Bring an updated resume and any training history when possible — NCWorks can help build one for free.',
      'Ask about evening, weekend, or remote options if scheduling around childcare or transportation is difficult.',
      'Duke University and Duke Health roles often include tuition assistance and health benefits even for entry-level positions.',
      'City and county jobs post on governmentjobs.com — check regularly as positions rotate.',
    ],
    links: [
      {
        id: 'ncworks',
        eyebrow: 'NCWorks',
        title: 'NCWorks Job Search',
        desc: 'North Carolina official job board — filter by Durham county, no degree required, and entry-level.',
        url: 'https://www.ncworks.gov',
      },
      {
        id: 'duke-careers',
        eyebrow: 'Duke University',
        title: 'Duke Careers Portal',
        desc: 'Search entry-level hospital, campus, and support roles with benefits and tuition assistance.',
        url: 'https://careers.duke.edu',
      },
      {
        id: 'durham-city-jobs',
        eyebrow: 'City of Durham',
        title: 'City Government Job Openings',
        desc: 'Parks, transit, sanitation, and public works positions — many require no degree.',
        url: 'https://www.governmentjobs.com/careers/durhamnc',
      },
      {
        id: 'durham-tech',
        eyebrow: 'Durham Tech',
        title: 'Durham Tech Short-Term Certificates',
        desc: 'CNA, HVAC, welding, CDL, and other certification programs that lead directly to employment.',
        url: 'https://www.durhamtech.edu',
      },
      {
        id: 'stepup-durham',
        eyebrow: 'StepUp Durham',
        title: 'StepUp Durham Job Training',
        desc: 'Workforce training for adults facing barriers to employment — housing instability, prior convictions, limited experience.',
        url: 'https://www.stepupdurham.org',
      },
    ],
  },
  accessibility: {
    title: 'Accessibility Resources',
    subtitle:
      'Disability rights, independent living, and support services relevant to housing access and accommodation issues.',
    facts: [
      {
        label: 'Accommodation support',
        value:
          'Accessibility issues may involve both service navigation and civil rights protections, especially in housing settings.',
      },
      {
        label: 'Good next step',
        value:
          'If the barrier involves a disability accommodation request, keep the request and any response in writing whenever possible.',
      },
    ],
    notes: [
      'Accessibility-related housing issues can overlap with fair housing disability protections.',
      'Independent living and legal advocacy organizations may play different roles, so contacting both can be useful.',
    ],
    links: [
      {
        id: 'drnc',
        eyebrow: 'Disability Rights NC',
        title: 'Disability Rights NC',
        desc: 'Official disability rights advocacy organization for North Carolina.',
        url: 'https://disabilityrightsnc.org',
      },
      {
        id: 'alliance',
        eyebrow: 'Alliance of Disability Advocates',
        title: 'Alliance of Disability Advocates',
        desc: 'Independent living and accessibility support organization serving North Carolina residents.',
        url: 'https://alliancecil.org',
      },
    ],
  },
};

function SnapshotRow({ label, value }) {
  return (
    <View style={styles.snapshotRow}>
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text style={styles.snapshotValue}>{value}</Text>
    </View>
  );
}

export default function ResourceScreen({ navigation, route }) {
  const { category, type } = route.params || {};
  const { width } = useWindowDimensions();
  const isMedium = width >= 760;
  const isWide = width >= 1120;
  const isExtraWide = width >= 1440;

  const [selectedCategory, setSelectedCategory] = useState(
    category || 'housing'
  );
  const resolvedCategory = selectedCategory;
  const content =
    CATEGORY_CONTENT[resolvedCategory] || CATEGORY_CONTENT.housing;

  const [activeType, setActiveType] = useState(type || null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredWebsite, setHoveredWebsite] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const q = query(collection(db, 'resources'), orderBy('title', 'asc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setResources(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setResources(staticResources);
        }
      } catch {
        setResources(staticResources);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  const filtered = resources.filter((item) => {
    const cat = resolvedCategory;
    if (item.category !== cat) return false;
    if (activeType) return item.type === activeType;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageFill}>
      <Navbar navigation={navigation} currentRoute="Resources" />

      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={[styles.heroInner, isMedium && styles.heroInnerWide]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>RESOURCE LIBRARY</Text>
            <Text style={styles.heroTitle}>{content.title}</Text>
            <Text style={styles.heroSub}>{content.subtitle}</Text>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {filtered.length} results available
                </Text>
              </View>
              {(resolvedCategory === 'housing' ||
                resolvedCategory === 'employment') && (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {resolvedCategory === 'employment'
                      ? 'Filter by job type'
                      : 'Filter by housing need'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.heroGuide}>
            <Text style={styles.heroGuideLabel}>Using this page</Text>
            {content.facts.map((fact) => (
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

      <View style={styles.workspace}>
        <View style={[styles.sideRail, isWide && styles.sideRailWide]}>
          <View style={[styles.sidePanel, isWide && styles.sidePanelWide]}>
            <Text style={styles.sidePanelEyebrow}>Quick Summary</Text>
            <Text style={styles.sidePanelTitle}>What is on this page</Text>
            <View style={styles.snapshotCard}>
              <SnapshotRow label="Category" value={content.title} />
              <SnapshotRow
                label="Visible results"
                value={`${filtered.length} resource${filtered.length === 1 ? '' : 's'}`}
              />
              {resolvedCategory === 'housing' ||
              resolvedCategory === 'employment' ? (
                <SnapshotRow
                  label="Active filter"
                  value={
                    (resolvedCategory === 'employment'
                      ? EMPLOYMENT_FILTERS
                      : HOUSING_FILTERS
                    ).find((item) => item.value === activeType)?.label ||
                    `All ${resolvedCategory} resources`
                  }
                />
              ) : null}
            </View>
          </View>

          <View style={[styles.sidePanelMuted, isWide && styles.sidePanelWide]}>
            <Text style={styles.sidePanelEyebrow}>Helpful Notes</Text>
            <Text style={styles.sidePanelTitle}>
              Things worth keeping in mind
            </Text>
            <View style={styles.noteList}>
              {content.notes.map((item) => (
                <View key={item} style={styles.noteRow}>
                  <View style={styles.noteDot} />
                  <Text style={styles.noteText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.mainColumn}>
          <View style={styles.resourcesTopCard}>
            <Text style={styles.sectionLabel}>Browse Resources</Text>
            <Text style={styles.sectionTitle}>
              Find support that matches the situation
            </Text>
            <Text style={styles.sectionDesc}>
              This library combines local Durham programs with broader North
              Carolina support resources. Hover over cards and links for a
              little more visual guidance as you scan.
            </Text>

            <View style={styles.filterRow}>
              {CATEGORY_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.value}
                  style={[
                    styles.filterBtn,
                    resolvedCategory === tab.value && styles.filterBtnActive,
                    resolvedCategory !== tab.value &&
                      hoveredFilter === `cat-${tab.value}` &&
                      styles.filterBtnHover,
                  ]}
                  onPress={() => {
                    setSelectedCategory(tab.value);
                    setActiveType(null);
                  }}
                  onMouseEnter={() => setHoveredFilter(`cat-${tab.value}`)}
                  onMouseLeave={() => setHoveredFilter(null)}
                  activeOpacity={0.75}
                  accessibilityLabel={`${tab.label} resources`}>
                  <Text
                    style={[
                      styles.filterText,
                      resolvedCategory === tab.value && styles.filterTextActive,
                    ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(resolvedCategory === 'housing' ||
              resolvedCategory === 'employment') && (
              <View style={styles.filterRowSub}>
                {(resolvedCategory === 'employment'
                  ? EMPLOYMENT_FILTERS
                  : HOUSING_FILTERS
                ).map((f) => (
                  <TouchableOpacity
                    key={String(f.value)}
                    style={[
                      styles.filterBtnSub,
                      activeType === f.value && styles.filterBtnSubActive,
                      activeType !== f.value &&
                        hoveredFilter === String(f.value) &&
                        styles.filterBtnHover,
                    ]}
                    onPress={() => setActiveType(f.value)}
                    onMouseEnter={() => setHoveredFilter(String(f.value))}
                    onMouseLeave={() => setHoveredFilter(null)}
                    activeOpacity={0.75}
                    accessibilityLabel={`Filter by ${f.label}`}>
                    <Text
                      style={[
                        styles.filterTextSub,
                        activeType === f.value && styles.filterTextSubActive,
                      ]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.resultsCount}>
              {filtered.length} resource{filtered.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          <View style={[styles.grid, isMedium && styles.gridWide]}>
            {filtered.map((resource) => (
              <TouchableOpacity
                key={resource.id}
                style={[
                  styles.card,
                  isMedium && styles.cardWide,
                  isExtraWide && styles.cardWideLarge,
                  hoveredCard === resource.id && styles.cardHover,
                ]}
                onMouseEnter={() => setHoveredCard(resource.id)}
                onMouseLeave={() => setHoveredCard(null)}
                activeOpacity={1}>
                {resource.type && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {resource.type === 'assistance'
                        ? 'Rental Assistance'
                        : resource.type === 'affordable'
                          ? 'Affordable Housing'
                          : resource.type === 'legal'
                            ? 'Legal Help'
                            : resource.type === 'training'
                              ? 'Training Program'
                              : resource.type === 'listings'
                                ? 'Job Listing'
                                : resource.type === 'support'
                                  ? 'Employment Support'
                                  : resource.type}
                    </Text>
                  </View>
                )}

                <Text style={styles.cardResourceTitle}>{resource.title}</Text>
                <Text style={styles.cardDescription}>
                  {resource.description}
                </Text>

                <View style={styles.cardDetails}>
                  {resource.phone ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${resource.phone}`)}
                      activeOpacity={0.75}>
                      <Text style={styles.detailRow}>
                        Phone: {resource.phone}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {resource.address ? (
                    <Text style={styles.detailRow}>
                      Address: {resource.address}
                    </Text>
                  ) : null}
                  {resource.eligibility ? (
                    <Text style={styles.detailRow}>
                      Eligibility: {resource.eligibility}
                    </Text>
                  ) : null}
                </View>

                {resource.website ? (
                  <TouchableOpacity
                    style={[
                      styles.websiteBtn,
                      hoveredWebsite === resource.id && styles.websiteBtnHover,
                    ]}
                    onPress={() => Linking.openURL(resource.website)}
                    onMouseEnter={() => setHoveredWebsite(resource.id)}
                    onMouseLeave={() => setHoveredWebsite(null)}
                    activeOpacity={0.75}>
                    <Text
                      style={[
                        styles.websiteBtnText,
                        hoveredWebsite === resource.id &&
                          styles.websiteBtnTextHover,
                      ]}>
                      Visit Website
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No resources matched this filter.
              </Text>
            </View>
          )}

          <View style={styles.linksCard}>
            <Text style={styles.cardLabel}>OFFICIAL QUICK LINKS</Text>
            <Text style={styles.cardTitle}>More places to look next</Text>
            <Text style={styles.cardDesc}>
              These official or organization-backed links complement the list
              above and can help residents move one step further.
            </Text>

            {content.links.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.linkRow,
                  index === content.links.length - 1 && styles.linkRowLast,
                  hoveredLink === item.id && styles.linkRowHover,
                ]}
                onPress={() => Linking.openURL(item.url)}
                onMouseEnter={() => setHoveredLink(item.id)}
                onMouseLeave={() => setHoveredLink(null)}
                activeOpacity={0.75}>
                <View style={styles.linkIconBox}>
                  <Text style={styles.linkIconText}>Go</Text>
                </View>
                <View style={styles.linkContent}>
                  <Text style={styles.linkEyebrow}>{item.eyebrow}</Text>
                  <Text
                    style={[
                      styles.linkTitle,
                      hoveredLink === item.id && styles.linkTitleHover,
                    ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.linkSub}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
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
    maxWidth: 1440,
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
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    marginTop: 28,
    gap: 28,
  },
  sideRail: {
    width: '100%',
    gap: 18,
  },
  sideRailWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
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
  sidePanelWide: {
    flex: 1,
    minWidth: 0,
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
    width: '100%',
    minWidth: 0,
  },
  resourcesTopCard: {
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FBFCF8',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnHover: {
    backgroundColor: '#EEF7E8',
    borderColor: 'rgba(46, 125, 50, 0.35)',
  },
  filterText: {
    fontSize: fontSize.caption,
    color: COLORS.textMuted,
    ...font.bold,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterRowSub: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  filterBtnSub: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FBFCF8',
  },
  filterBtnSubActive: {
    backgroundColor: COLORS.primaryDeep,
    borderColor: COLORS.primaryDeep,
  },
  filterTextSub: {
    fontSize: fontSize.tiny,
    color: COLORS.textMuted,
    ...font.medium,
  },
  filterTextSubActive: {
    color: '#FFFFFF',
  },
  resultsCount: {
    fontSize: fontSize.caption,
    color: '#6F7A6F',
  },
  grid: {
    gap: 16,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  card: {
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
  cardWide: {
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'flex-start',
  },
  cardWideLarge: {
    flexBasis: '31.5%',
  },
  cardHover: {
    transform: [{ translateY: -2 }],
    borderColor: 'rgba(46, 125, 50, 0.28)',
    backgroundColor: '#F9FCF6',
    shadowOpacity: 0.08,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF4E3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  typeBadgeText: {
    fontSize: fontSize.tiny,
    color: COLORS.primary,
    ...font.extra,
    letterSpacing: 0.7,
  },
  cardResourceTitle: {
    fontSize: fontSize.body,
    ...font.extra,
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 23,
  },
  cardDescription: {
    fontSize: fontSize.caption,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 14,
  },
  cardDetails: {
    gap: 7,
    marginBottom: 16,
  },
  detailRow: {
    fontSize: fontSize.caption,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  websiteBtn: {
    marginTop: 'auto',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  websiteBtnHover: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  websiteBtnText: {
    color: COLORS.primary,
    ...font.extra,
    fontSize: fontSize.caption,
  },
  websiteBtnTextHover: {
    color: '#FFFFFF',
  },
  linksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginTop: 24,
    marginBottom: 18,
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
    ...font.extra,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h3,
    ...font.extra,
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
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkRowHover: {
    backgroundColor: '#F4F9EF',
    paddingHorizontal: 10,
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
  empty: {
    paddingVertical: 42,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.body,
    color: '#7A847A',
  },
});
