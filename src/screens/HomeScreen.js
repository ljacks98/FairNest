import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { COLORS } from '../utils/constants';
import { fontSize, font } from '../theme/typography';

// ── Search index ─────────────────────────────────────────────────────────────

const SEARCH_INDEX = [
  {
    icon: '📋',
    label: 'File a Report',
    hint: 'Submit a housing discrimination report',
    keywords: [
      'report',
      'file',
      'submit',
      'complaint',
      'issue',
      'incident',
      'discrimination',
      'bias',
    ],
    route: 'Report',
    requiresAuth: true,
    category: 'Actions',
  },
  {
    icon: '📖',
    label: 'Know Your Rights',
    hint: 'Tenant rights & legal protections',
    keywords: [
      'rights',
      'tenant',
      'law',
      'legal',
      'protection',
      'fair housing',
      'lease',
      'landlord',
      'know',
    ],
    route: 'HousingRights',
    requiresAuth: false,
    category: 'Learn',
  },
  {
    icon: '📅',
    label: 'Schedule a Call',
    hint: 'Book a free consultation',
    keywords: [
      'schedule',
      'call',
      'consultation',
      'lawyer',
      'attorney',
      'book',
      'appointment',
      'speak',
      'legal',
    ],
    route: 'ScheduleCall',
    requiresAuth: true,
    category: 'Actions',
  },
  {
    icon: '💬',
    label: 'Ask AI Assistant',
    hint: 'Instant answers to housing questions',
    keywords: [
      'ask',
      'ai',
      'chat',
      'question',
      'help',
      'assistant',
      'talk',
      'message',
      'bot',
      'answer',
    ],
    route: 'ChatInterface',
    requiresAuth: true,
    category: 'Actions',
  },
  {
    icon: '🛡️',
    label: 'Check If You Qualify',
    hint: 'Free discrimination self-assessment',
    keywords: [
      'qualify',
      'checker',
      'check',
      'am i',
      'do i',
      'protected',
      'class',
      'assess',
      'eligible',
    ],
    route: 'DiscriminationChecker',
    requiresAuth: false,
    category: 'Tools',
  },
  {
    icon: '🏠',
    label: 'Housing Resources',
    hint: 'Local programs & assistance near you',
    keywords: [
      'resources',
      'programs',
      'assistance',
      'voucher',
      'section 8',
      'shelter',
      'affordable',
      'homeless',
      'rent help',
    ],
    route: 'Resources',
    requiresAuth: false,
    category: 'Resources',
  },
  {
    icon: '💼',
    label: 'Jobs & Employment',
    hint: 'Job listings, training & career support',
    keywords: [
      'jobs',
      'employment',
      'work',
      'career',
      'hiring',
      'training',
      'resume',
      'workforce',
      'entry level',
      'listings',
    ],
    route: 'Resources',
    routeParams: { category: 'employment' },
    requiresAuth: false,
    category: 'Resources',
  },
  {
    icon: '👥',
    label: 'Fair Housing Support',
    hint: 'Connect with local advocates',
    keywords: [
      'support',
      'advocate',
      'organization',
      'community',
      'partner',
      'nonprofit',
      'fair housing',
    ],
    route: 'FairHousingSupport',
    requiresAuth: false,
    category: 'Resources',
  },
  {
    icon: 'ℹ️',
    label: 'About FairNest',
    hint: 'Our mission & team',
    keywords: [
      'about',
      'mission',
      'team',
      'who',
      'fairnest',
      'story',
      'contact',
    ],
    route: 'About',
    requiresAuth: false,
    category: 'Info',
  },
  {
    icon: '👤',
    label: 'My Profile',
    hint: 'View your reports and history',
    keywords: [
      'profile',
      'account',
      'my reports',
      'history',
      'settings',
      'dashboard',
    ],
    route: 'Profile',
    requiresAuth: true,
    category: 'Account',
  },
  {
    icon: '🔑',
    label: 'Eviction Help',
    hint: 'Rights & steps if facing eviction',
    keywords: [
      'evict',
      'eviction',
      'notice',
      'kicked out',
      'forced out',
      'lease termination',
      'move out',
    ],
    route: 'HousingRights',
    requiresAuth: false,
    category: 'Topics',
  },
  {
    icon: '🔧',
    label: 'Repair & Maintenance',
    hint: "When your landlord won't fix issues",
    keywords: [
      'repair',
      'fix',
      'broken',
      'maintenance',
      'habitability',
      'mold',
      'heat',
      'water',
      'pest',
      'conditions',
    ],
    route: 'HousingRights',
    requiresAuth: false,
    category: 'Topics',
  },
  {
    icon: '💰',
    label: 'Rent & Deposit Issues',
    hint: 'Overcharges, hikes & security deposits',
    keywords: [
      'rent',
      'increase',
      'late fee',
      'overcharge',
      'deposit',
      'security deposit',
      'pricing',
      'fee',
    ],
    route: 'HousingRights',
    requiresAuth: false,
    category: 'Topics',
  },
  {
    icon: '🚫',
    label: 'Race & Color Discrimination',
    hint: 'Denied housing based on race',
    keywords: [
      'race',
      'racial',
      'color',
      'ethnic',
      'ethnicity',
      'national origin',
      'skin',
      'biased',
    ],
    route: 'DiscriminationChecker',
    requiresAuth: false,
    category: 'Topics',
  },
  {
    icon: '♿',
    label: 'Disability Accommodations',
    hint: 'ADA rights & accessibility',
    keywords: [
      'disability',
      'disabled',
      'accommodation',
      'accessibility',
      'wheelchair',
      'ada',
      'handicap',
      'impairment',
    ],
    route: 'DiscriminationChecker',
    requiresAuth: false,
    category: 'Topics',
  },
  {
    icon: '👶',
    label: 'Familial Status Rights',
    hint: 'Rights for families with children',
    keywords: [
      'family',
      'children',
      'kids',
      'pregnant',
      'pregnancy',
      'familial',
      'parent',
      'child',
    ],
    route: 'DiscriminationChecker',
    requiresAuth: false,
    category: 'Topics',
  },
];

const QUICK_ACTIONS = [
  { icon: '📋', label: 'File a Report', route: 'Report', requiresAuth: true },
  {
    icon: '📖',
    label: 'Know My Rights',
    route: 'HousingRights',
    requiresAuth: false,
  },
  { icon: '💬', label: 'Ask AI', route: 'ChatInterface', requiresAuth: true },
  {
    icon: '📅',
    label: 'Book a Call',
    route: 'ScheduleCall',
    requiresAuth: true,
  },
  {
    icon: '🛡️',
    label: 'Check Eligibility',
    route: 'DiscriminationChecker',
    requiresAuth: false,
  },
];

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { number: '16+', label: 'Local Programs' },
  { number: '7', label: 'Protected Classes' },
  { number: '24/7', label: 'AI Help Available' },
  { number: '100%', label: 'Free to Use' },
];

const IMPACT_STATS = [
  {
    number: '1 in 4',
    label: 'Durham renters spend 30%+ of income on housing',
    icon: '🏠',
  },
  {
    number: '72%',
    label: 'Of housing discrimination cases go unreported',
    icon: '👁️',
  },
  {
    number: '$0',
    label: 'Cost to use FairNest — completely free',
    icon: '🛡️',
  },
];

const STEPS = [
  {
    num: '01',
    icon: '🛡️',
    title: 'Check If You Qualify',
    desc: 'Answer a few questions to find out if your situation is covered under fair housing law.',
    route: 'DiscriminationChecker',
  },
  {
    num: '02',
    icon: '📖',
    title: 'Know Your Rights',
    desc: 'Get clear guidance on what legal protections apply to your case.',
    route: 'HousingRights',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'Take Action',
    desc: 'File a report, schedule a free consultation, or connect directly with a local advocate.',
    route: 'Report',
  },
];

const FEATURE_CARDS = [
  {
    icon: '🏠',
    title: 'Housing Rights',
    desc: 'Know your legal protections as a Durham tenant',
    route: 'HousingRights',
    auth: false,
  },
  {
    icon: '👥',
    title: 'Fair Housing Support',
    desc: 'Connect with local advocates and organizations',
    route: 'FairHousingSupport',
    auth: false,
  },
  {
    icon: '🧭',
    title: 'Resources',
    desc: 'Find housing assistance programs near you',
    route: 'Resources',
    routeParams: { category: 'housing' },
    auth: false,
  },
  {
    icon: '💬',
    title: 'AI Assistant',
    desc: 'Get instant answers to your housing questions',
    route: 'ChatInterface',
    auth: true,
  },
  {
    icon: '📋',
    title: 'File a Report',
    desc: 'Submit a housing discrimination or issue report',
    route: 'Report',
    auth: true,
  },
  {
    icon: '📅',
    title: 'Schedule a Call',
    desc: 'Book a free consultation with a FairNest member or legal attorney',
    route: 'ScheduleCall',
    auth: true,
  },
  {
    icon: 'ℹ️',
    title: 'About FairNest',
    desc: 'Learn about our mission and the team behind this project',
    route: 'About',
    auth: false,
  },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isWide = width >= 700;
  const isLarge = width >= 1000;
  const blurTimer = useRef(null);

  const [hoveredStep, setHoveredStep] = useState(null);
  const [hoveredCtaPrimary, setHoveredCtaPrimary] = useState(false);
  const [hoveredCtaSecondary, setHoveredCtaSecondary] = useState(false);
  const checkerArrowX = useRef(new Animated.Value(0)).current;
  const checkerCtaScale = useRef(new Animated.Value(1)).current;
  const pulseDotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseDotAnim, {
          toValue: 0.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseDotAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseDotAnim]);

  const onCheckerHoverIn = () =>
    Animated.parallel([
      Animated.timing(checkerArrowX, {
        toValue: 6,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(checkerCtaScale, {
        toValue: 1.12,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  const onCheckerHoverOut = () =>
    Animated.parallel([
      Animated.timing(checkerArrowX, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(checkerCtaScale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

  const getFilteredSuggestions = (text) => {
    if (!text.trim()) return [];
    const lower = text.toLowerCase();
    return SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        item.hint.toLowerCase().includes(lower) ||
        item.keywords.some((k) => k.includes(lower) || lower.includes(k))
    ).slice(0, 6);
  };

  const handleSearchNavigate = (item) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setIsFocused(false);
    setQuery('');
    go(item.route, null, item.requiresAuth);
  };

  const handleSearch = () => {
    const text = query.toLowerCase().trim();
    if (!text) return;
    const match = getFilteredSuggestions(text)[0];
    setIsFocused(false);
    setQuery('');
    if (match) {
      go(match.route, null, match.requiresAuth);
    } else {
      navigation.navigate('Resources');
    }
  };

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setIsFocused(true);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setIsFocused(false), 200);
  };

  const go = (route, params, requiresAuth) => {
    if (requiresAuth && !user) {
      navigation.navigate('Login');
    } else {
      navigation.navigate(route, params);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── 1+2. HERO + STATS — single continuous photo background ── */}
        <View style={styles.heroAndStats}>
          {/* Background layer — overflow hidden to clip the wide image */}
          <View style={styles.heroAndStatsBg}>
            <Image
              source={require('../../assets/pexel-durham2.jpg')}
              style={styles.heroBgImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Navbar navigation={navigation} currentRoute="Home" transparent />
            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>FAIRNEST DURHAM, NC</Text>
              <Text style={styles.heroTitle}>
                Every Durham{'\n'}resident deserves{'\n'}fair housing.
              </Text>
              <Text style={styles.heroSub}>
                Navigate your rights, report discrimination, and connect with
                local support all in one place, at no cost.
              </Text>
              <View style={styles.searchWrapper}>
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search rights, resources, or ask a question..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="search"
                    accessibilityLabel="Search housing resources"
                  />
                  <TouchableOpacity
                    style={styles.searchBtn}
                    onPress={handleSearch}
                    activeOpacity={0.7}
                    accessibilityLabel="Submit search">
                    <Text style={styles.searchBtnText}>🔍 Search</Text>
                  </TouchableOpacity>
                </View>

                {/* ── Dropdown ── */}
                {isFocused && (
                  <View style={styles.searchDropdown}>
                    {query.trim() === '' ? (
                      <>
                        <Text style={styles.dropdownSectionLabel}>
                          Quick Actions
                        </Text>
                        {QUICK_ACTIONS.map((action) => (
                          <TouchableOpacity
                            key={action.label}
                            style={[
                              styles.dropdownItem,
                              hoveredSuggestion === action.label &&
                                styles.dropdownItemHover,
                            ]}
                            onPress={() => handleSearchNavigate(action)}
                            onMouseEnter={() =>
                              setHoveredSuggestion(action.label)
                            }
                            onMouseLeave={() => setHoveredSuggestion(null)}
                            activeOpacity={0.7}
                            accessibilityLabel={action.label}>
                            <Text style={styles.dropdownIcon}>
                              {action.icon}
                            </Text>
                            <Text style={styles.dropdownItemLabel}>
                              {action.label}
                            </Text>
                            <Text style={styles.dropdownArrow}>→</Text>
                          </TouchableOpacity>
                        ))}
                        <View style={styles.dropdownDivider} />
                        <Text style={styles.dropdownHint}>
                          Type anything — eviction, rent, rights, lawyer...
                        </Text>
                      </>
                    ) : (
                      (() => {
                        const suggestions = getFilteredSuggestions(query);
                        return suggestions.length > 0 ? (
                          <>
                            <Text style={styles.dropdownSectionLabel}>
                              {suggestions.length} result
                              {suggestions.length !== 1 ? 's' : ''}
                            </Text>
                            {suggestions.map((item) => (
                              <TouchableOpacity
                                key={item.label}
                                style={[
                                  styles.dropdownItem,
                                  hoveredSuggestion === item.label &&
                                    styles.dropdownItemHover,
                                ]}
                                onPress={() => handleSearchNavigate(item)}
                                onMouseEnter={() =>
                                  setHoveredSuggestion(item.label)
                                }
                                onMouseLeave={() => setHoveredSuggestion(null)}
                                activeOpacity={0.7}
                                accessibilityLabel={item.label}>
                                <Text style={styles.dropdownIcon}>
                                  {item.icon}
                                </Text>
                                <View style={styles.dropdownItemBody}>
                                  <Text style={styles.dropdownItemLabel}>
                                    {item.label}
                                  </Text>
                                  <Text style={styles.dropdownItemHint}>
                                    {item.hint}
                                  </Text>
                                </View>
                                <View style={styles.dropdownTag}>
                                  <Text style={styles.dropdownTagText}>
                                    {item.category}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </>
                        ) : (
                          <View style={styles.dropdownEmpty}>
                            <Text style={styles.dropdownEmptyTitle}>
                              No results for "{query}"
                            </Text>
                            <Text style={styles.dropdownEmptyHint}>
                              Try: "eviction", "report", "rights", "schedule a
                              call"
                            </Text>
                          </View>
                        );
                      })()
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Stats — darker overlay strip at the bottom of the shared bg */}
          <View style={styles.statsSection}>
            <View style={styles.statsOverlay} />
            <View style={[styles.statsRow, isWide && styles.statsRowWide]}>
              {STATS.map((stat, i) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statItem,
                    isWide && styles.statItemWide,
                    i === STATS.length - 1 && styles.statItemLast,
                  ]}>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── 4. CHECKER HIGHLIGHT — full-bleed white ── */}
        <View style={styles.checkerSection}>
          <View style={styles.checkerCard}>
            {/* Concentric ring decorations */}
            <View style={styles.checkerRing3} />
            <View style={styles.checkerRing2} />
            <View style={styles.checkerRing1} />
            {/* Glow blobs */}
            <View style={styles.checkerGlowTopRight} />
            <View style={styles.checkerGlowBottomLeft} />
            {/* Glassmorphism inner border */}
            <View style={styles.checkerGlassBorder} />
            <View style={styles.checkerDecorCircle1} />
            <View style={styles.checkerDecorCircle2} />
            <View style={styles.checkerBar} />
            <View style={styles.checkerBody}>
              <View style={styles.checkerBadge}>
                <View style={styles.checkerBadgeDot} />
                <Text style={styles.checkerBadgeText}>
                  FREE SELF-ASSESSMENT
                </Text>
              </View>
              <View style={styles.checkerTitleRow}>
                <View style={styles.checkerIconCircle}>
                  <Text style={styles.checkerEmoji}>🛡️</Text>
                </View>
                <Text style={styles.checkerTitle}>
                  Have you been treated unfairly because of who you are?
                </Text>
              </View>
              <Text style={styles.checkerDesc}>
                Answer a few questions to find out if your situation qualifies
                as housing discrimination and what to do next.
              </Text>
              <TouchableOpacity
                style={styles.checkerCta}
                onPress={() => navigation.navigate('DiscriminationChecker')}
                onMouseEnter={onCheckerHoverIn}
                onMouseLeave={onCheckerHoverOut}
                activeOpacity={0.7}
                accessibilityLabel="Take the free housing discrimination self-assessment">
                <Animated.View
                  style={[
                    styles.checkerCtaInner,
                    { transform: [{ scale: checkerCtaScale }] },
                  ]}>
                  <Text style={styles.checkerCtaText}>Find out now</Text>
                  <Animated.View
                    style={{ transform: [{ translateX: checkerArrowX }] }}>
                    <Text style={styles.checkerArrowText}>→</Text>
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── 5. FEATURE CARDS — full-bleed green tint ── */}
        <View style={styles.toolsSection}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>OUR TOOLS</Text>
          </View>
          <Text style={styles.sectionTitle}>How FairNest Can Help</Text>
          <View
            style={[
              styles.cardsGrid,
              isWide && styles.cardsGridWide,
              isLarge && styles.cardsGridLarge,
            ]}>
            {FEATURE_CARDS.map((card) => {
              const hovered = hoveredCard === card.title;
              return (
                <TouchableOpacity
                  key={card.title}
                  style={[
                    styles.featureCard,
                    isWide && styles.featureCardWide,
                    isLarge && styles.featureCardLarge,
                    hovered && styles.featureCardHover,
                  ]}
                  onPress={() => go(card.route, card.routeParams, card.auth)}
                  onMouseEnter={() => setHoveredCard(card.title)}
                  onMouseLeave={() => setHoveredCard(null)}
                  activeOpacity={0.7}
                  accessibilityLabel={card.title}>
                  <View
                    style={[
                      styles.featureBar,
                      hovered && styles.featureBarHover,
                    ]}
                  />
                  <View style={styles.featureBody}>
                    <View
                      style={[
                        styles.iconCircle,
                        hovered && styles.iconCircleHover,
                      ]}>
                      <Text style={styles.iconCircleEmoji}>{card.icon}</Text>
                    </View>
                    <View style={styles.featureText}>
                      <Text
                        style={[
                          styles.featureTitle,
                          hovered && styles.featureTitleHover,
                        ]}>
                        {card.title}
                      </Text>
                      <Text
                        style={[
                          styles.featureDesc,
                          hovered && styles.featureDescHover,
                        ]}>
                        {card.desc}
                      </Text>
                    </View>
                    <Text
                      style={[styles.chevron, hovered && styles.chevronHover]}>
                      ›
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 5b. IMPACT STATS — full-bleed dark green ── */}
        <View style={styles.impactSection}>
          <View style={[styles.sectionBadge, styles.sectionBadgeGold]}>
            <Text
              style={[styles.sectionBadgeText, styles.sectionBadgeTextGold]}>
              THE PROBLEM WE'RE SOLVING
            </Text>
          </View>
          <Text style={styles.impactHeading}>
            Housing Discrimination{'\n'}in Durham
          </Text>
          <View style={[styles.impactRow, isWide && styles.impactRowWide]}>
            {IMPACT_STATS.map((stat, i) => (
              <View
                key={i}
                style={[
                  styles.impactCard,
                  isWide && styles.impactCardWide,
                  isWide &&
                    i === IMPACT_STATS.length - 1 &&
                    styles.impactCardLast,
                ]}>
                <View style={styles.impactIconWrap}>
                  <Text style={styles.impactEmoji}>{stat.icon}</Text>
                </View>
                <View style={styles.impactNumberRow}>
                  <Text style={styles.impactNumber}>{stat.number}</Text>
                  {i === 0 && (
                    <Animated.View
                      style={[styles.impactPulseDot, { opacity: pulseDotAnim }]}
                    />
                  )}
                </View>
                <Text style={styles.impactLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 6. HOW IT WORKS — full-bleed white ── */}
        <View style={styles.stepsSection}>
          <View style={[styles.sectionBadge, styles.sectionBadgeDark]}>
            <Text
              style={[styles.sectionBadgeText, styles.sectionBadgeTextDark]}>
              HOW IT WORKS
            </Text>
          </View>
          <Text style={styles.sectionTitle}>Three Simple Steps</Text>
          <View style={[styles.stepsRow, isWide && styles.stepsRowWide]}>
            {STEPS.map((step, idx) => {
              const stepHovered = hoveredStep === step.num;
              return (
                <React.Fragment key={step.num}>
                  <TouchableOpacity
                    style={[
                      styles.stepCard,
                      isWide && styles.stepCardWide,
                      stepHovered && styles.stepCardHover,
                      stepHovered && styles.stepCardHoverTransform,
                    ]}
                    onPress={() => navigation.navigate(step.route)}
                    onMouseEnter={() => setHoveredStep(step.num)}
                    onMouseLeave={() => setHoveredStep(null)}
                    activeOpacity={0.85}
                    accessibilityLabel={step.title}>
                    <View
                      style={[
                        styles.stepBadge,
                        stepHovered && styles.stepBadgeHover,
                      ]}>
                      <Text
                        style={[
                          styles.stepBadgeNum,
                          stepHovered && styles.stepBadgeNumHover,
                        ]}>
                        {step.num}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.stepIconWrap,
                        stepHovered && styles.stepIconWrapHover,
                      ]}>
                      <Text style={styles.stepEmoji}>{step.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.stepTitle,
                        stepHovered && styles.stepTitleHover,
                      ]}>
                      {step.title}
                    </Text>
                    <Text
                      style={[
                        styles.stepDesc,
                        stepHovered && styles.stepDescHover,
                      ]}>
                      {step.desc}
                    </Text>
                  </TouchableOpacity>
                  {isWide && idx < STEPS.length - 1 && (
                    <View style={styles.stepsConnector} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* ── 7. MISSION CTA — full-bleed dark green ── */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaEyebrow}>
            FREE, LOCAL, AND BUILT FOR DURHAM
          </Text>
          <Text style={styles.ctaTitle}>
            Every Durham Resident Deserves Fair Housing
          </Text>
          <Text style={styles.ctaSub}>
            FairNest was built by NCCU students to give you the tools to
            understand, document, and fight housing discrimination at no cost.
          </Text>
          <View style={[styles.ctaBtns, isWide && styles.ctaBtnsWide]}>
            <TouchableOpacity
              style={[
                styles.ctaBtnPrimary,
                hoveredCtaPrimary && styles.ctaBtnPrimaryHover,
              ]}
              onPress={() => navigation.navigate('DiscriminationChecker')}
              onMouseEnter={() => setHoveredCtaPrimary(true)}
              onMouseLeave={() => setHoveredCtaPrimary(false)}
              activeOpacity={0.7}
              accessibilityLabel="Get started with the discrimination checker">
              <Text
                style={[
                  styles.ctaBtnPrimaryText,
                  hoveredCtaPrimary && styles.ctaBtnPrimaryTextHover,
                ]}>
                Get Started It's Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ctaBtnSecondary,
                hoveredCtaSecondary && styles.ctaBtnSecondaryHover,
              ]}
              onPress={() => navigation.navigate('About')}
              onMouseEnter={() => setHoveredCtaSecondary(true)}
              onMouseLeave={() => setHoveredCtaSecondary(false)}
              activeOpacity={0.7}
              accessibilityLabel="Learn about FairNest">
              <Text
                style={[
                  styles.ctaBtnSecondaryText,
                  hoveredCtaSecondary && styles.ctaBtnSecondaryTextHover,
                ]}>
                Learn About Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingBottom: 0 },

  // ── 1+2. Shared hero + stats background wrapper ──────────────────────────
  heroAndStats: {
    position: 'relative',
  },
  heroAndStatsBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  heroBgImage: {
    position: 'absolute',
    left: -500,
    right: 0,
    bottom: 0,
    height: 950,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 40, 10, 0.65)',
  },

  // ── 1. Hero ──────────────────────────────────────────────────────────────
  hero: {
    minHeight: 760,
    paddingBottom: 40,
    paddingHorizontal: 0,
    justifyContent: 'space-between',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  heroEyebrow: {
    fontSize: 11,
    ...font.bold,
    color: COLORS.gold,
    letterSpacing: 4,
    marginBottom: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 62,
    ...font.extra,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 62 * 1.08,
    letterSpacing: -2,
    marginBottom: 24,
    maxWidth: 680,
  },
  heroSub: {
    fontSize: fontSize.bodyLg,
    ...font.regular,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: fontSize.bodyLg * 1.65,
    maxWidth: 560,
    marginBottom: 40,
  },
  searchWrapper: {
    width: '100%',
    maxWidth: 620,
    zIndex: 200,
  },
  searchRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: fontSize.body,
    ...font.regular,
    color: COLORS.white,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 22,
    paddingVertical: 15,
  },
  searchBtnText: {
    color: COLORS.white,
    ...font.bold,
    fontSize: fontSize.small,
  },

  // ── Search dropdown ───────────────────────────────────────────────────────
  searchDropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginTop: 8,
    paddingTop: 4,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(27,94,32,0.08)',
  },
  dropdownSectionLabel: {
    fontSize: 10,
    ...font.bold,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  dropdownItemHover: {
    backgroundColor: COLORS.greenTint,
  },
  dropdownIcon: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
  },
  dropdownItemBody: {
    flex: 1,
  },
  dropdownItemLabel: {
    fontSize: fontSize.small,
    ...font.semi,
    color: COLORS.textPrimary,
  },
  dropdownItemHint: {
    fontSize: 12,
    ...font.regular,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  dropdownTag: {
    backgroundColor: COLORS.iconTint,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dropdownTagText: {
    fontSize: 10,
    ...font.bold,
    color: COLORS.primaryDeep,
    letterSpacing: 0.3,
  },
  dropdownArrow: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  dropdownHint: {
    fontSize: 12,
    ...font.regular,
    color: COLORS.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  dropdownEmpty: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  dropdownEmptyTitle: {
    fontSize: fontSize.small,
    ...font.semi,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dropdownEmptyHint: {
    fontSize: 12,
    ...font.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // ── 2. Stats ─────────────────────────────────────────────────────────────
  statsSection: {
    position: 'relative',
  },
  statsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 25, 5, 0.45)',
  },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  statsRowWide: { flexWrap: 'nowrap' },
  statItem: {
    flex: 1,
    minWidth: '50%',
    alignItems: 'center',
    paddingVertical: 44,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  statItemWide: {
    minWidth: 0,
    borderBottomWidth: 0,
  },
  statItemLast: {
    borderRightWidth: 0,
  },
  statNumber: {
    fontSize: 44,
    ...font.extra,
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: fontSize.caption,
    ...font.bold,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },

  eyebrow: {
    fontSize: 11,
    ...font.bold,
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 20,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // ── 4. Checker ────────────────────────────────────────────────────────────
  checkerSection: {
    backgroundColor: COLORS.primaryDeep,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  checkerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDeep,
    overflow: 'hidden',
    width: '100%',
    minHeight: 280,
  },
  checkerGlowTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  checkerGlowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: 80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(232,160,0,0.07)',
  },
  checkerGlassBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Concentric ring decorations (right side, inspired by reference)
  checkerRing1: {
    position: 'absolute',
    right: -120,
    top: '50%',
    marginTop: -300,
    width: 600,
    height: 600,
    borderRadius: 300,
    borderWidth: 60,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  checkerRing2: {
    position: 'absolute',
    right: -180,
    top: '50%',
    marginTop: -400,
    width: 800,
    height: 800,
    borderRadius: 400,
    borderWidth: 60,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  checkerRing3: {
    position: 'absolute',
    right: -240,
    top: '50%',
    marginTop: -500,
    width: 1000,
    height: 1000,
    borderRadius: 500,
    borderWidth: 60,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  checkerBar: { width: 8, backgroundColor: COLORS.amber },
  checkerBody: {
    flex: 1,
    paddingVertical: 56,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  checkerEyebrow: {
    fontSize: fontSize.tiny,
    ...font.bold,
    color: COLORS.amber,
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  checkerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  checkerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(232,160,0,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  checkerEmoji: {
    fontSize: 18,
  },
  checkerArrowText: {
    fontSize: 16,
    color: COLORS.primaryDeep,
  },
  checkerTitle: {
    flex: 1,
    fontSize: 36,
    ...font.extra,
    color: COLORS.white,
    lineHeight: 36 * 1.2,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  checkerDesc: {
    fontSize: fontSize.bodyLg,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: fontSize.bodyLg * 1.6,
    marginBottom: 28,
    maxWidth: 560,
    textAlign: 'center',
  },
  checkerCta: {
    backgroundColor: COLORS.amber,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkerCtaInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkerCtaText: {
    fontSize: fontSize.button,
    ...font.extra,
    color: COLORS.primaryDeep,
    letterSpacing: 0.3,
  },

  // ── 6. Steps ──────────────────────────────────────────────────────────────
  stepsSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: fontSize.h1,
    ...font.extra,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 36,
    letterSpacing: -0.5,
  },
  stepsRow: { width: '100%', maxWidth: 960, gap: 16 },
  stepsRowWide: { flexDirection: 'row', alignItems: 'flex-start' },
  stepCard: {
    backgroundColor: COLORS.greenTint,
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  stepCardWide: { flex: 1 },
  stepNum: {
    fontSize: 52,
    ...font.extra,
    color: COLORS.primaryDeep,
    opacity: 0.15,
    marginBottom: 8,
    letterSpacing: -1,
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepEmoji: {
    fontSize: 24,
  },
  stepTitle: {
    fontSize: fontSize.h4,
    ...font.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: fontSize.small,
    ...font.regular,
    color: COLORS.textMuted,
    lineHeight: fontSize.small * 1.6,
  },
  stepCardHover: {
    backgroundColor: COLORS.primaryDeep,
    shadowColor: COLORS.primaryDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  stepCardHoverTransform: {
    transform: [{ translateY: -4 }],
  },
  stepNumHover: { color: COLORS.white, opacity: 0.2 },
  stepIconWrapHover: { backgroundColor: COLORS.primary },
  stepTitleHover: { color: COLORS.white },
  stepDescHover: { color: 'rgba(255,255,255,0.75)' },

  // ── 5. Feature cards ──────────────────────────────────────────────────────
  toolsSection: {
    backgroundColor: COLORS.greenTint,
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  eyebrowGreen: { display: 'none' },
  cardsGrid: { width: '100%', maxWidth: 1100, gap: 16 },
  cardsGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cardsGridLarge: { justifyContent: 'center' },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  featureCardWide: { flexBasis: '47%', flexGrow: 1 },
  featureCardLarge: { flexBasis: '31%', flexGrow: 0 },
  featureCardHover: {
    backgroundColor: COLORS.primaryDeep,
    borderColor: COLORS.primaryDeep,
  },
  featureBar: { width: 5, backgroundColor: COLORS.primaryDeep },
  featureBarHover: { backgroundColor: COLORS.gold },
  featureBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconCircleHover: {
    backgroundColor: COLORS.primary,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: fontSize.body,
    ...font.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  featureTitleHover: { color: COLORS.white },
  featureDesc: {
    fontSize: fontSize.small,
    color: COLORS.textMuted,
    lineHeight: fontSize.small * 1.5,
  },
  featureDescHover: { color: 'rgba(255,255,255,0.75)' },

  // ── 7. Mission CTA ────────────────────────────────────────────────────────
  ctaSection: {
    backgroundColor: COLORS.primaryDeep,
    borderTopWidth: 3,
    borderTopColor: COLORS.amber,
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaEyebrow: {
    fontSize: 11,
    ...font.bold,
    color: COLORS.gold,
    letterSpacing: 3,
    marginBottom: 16,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: fontSize.h1,
    ...font.bold,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: fontSize.h1 * 1.2,
    marginBottom: 16,
    maxWidth: 640,
  },
  ctaSub: {
    fontSize: fontSize.bodyLg,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: fontSize.bodyLg * 1.6,
    maxWidth: 560,
    marginBottom: 36,
  },
  ctaBtns: { gap: 12 },
  ctaBtnsWide: { flexDirection: 'row' },
  ctaBtnPrimary: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaBtnPrimaryText: {
    color: COLORS.primaryDeep,
    ...font.extra,
    fontSize: fontSize.button,
  },
  ctaBtnSecondary: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaBtnSecondaryText: {
    color: COLORS.white,
    ...font.bold,
    fontSize: fontSize.button,
  },
  ctaBtnPrimaryHover: { backgroundColor: COLORS.primary },
  ctaBtnPrimaryTextHover: { color: COLORS.white },
  ctaBtnSecondaryHover: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  ctaBtnSecondaryTextHover: { color: COLORS.primaryDeep },

  // ── Emergency bar ─────────────────────────────────────────────────────────
  emergencyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.greenTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyText: { flex: 1 },
  emergencyTitle: {
    fontSize: fontSize.small,
    ...font.bold,
    color: COLORS.textPrimary,
  },
  emergencyNum: { fontSize: fontSize.tiny, color: COLORS.textMuted },
  emergencyBtn: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emergencyBtnText: {
    color: COLORS.white,
    ...font.bold,
    fontSize: fontSize.small,
  },

  // ── Section badge pill (NLP-style label) ─────────────────────────────────
  sectionBadge: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sectionBadgeText: {
    fontSize: 11,
    ...font.bold,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionBadgeDark: { backgroundColor: 'rgba(27,94,32,0.12)' },
  sectionBadgeTextDark: { color: COLORS.primaryDeep },
  sectionBadgeGold: { backgroundColor: 'rgba(232,160,0,0.18)' },
  sectionBadgeTextGold: { color: COLORS.gold },

  // ── Impact stats section ───────────────────────────────────────────────────
  impactSection: {
    backgroundColor: COLORS.primaryDeep,
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  impactEyebrow: { display: 'none' },
  impactHeading: {
    fontSize: fontSize.h1,
    ...font.extra,
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: fontSize.h1 * 1.2,
    marginBottom: 40,
  },
  impactRow: { width: '100%', maxWidth: 900, gap: 0 },
  impactRowWide: { flexDirection: 'row' },
  impactCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  impactCardWide: {
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.12)',
  },
  impactCardLast: { borderRightWidth: 0 },
  impactIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactEmoji: {
    fontSize: 18,
  },
  impactNumber: {
    fontSize: 56,
    ...font.extra,
    color: COLORS.white,
    letterSpacing: -1,
  },
  impactLabel: {
    fontSize: fontSize.small,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: fontSize.small * 1.5,
    maxWidth: 220,
  },

  // ── Hero badge ────────────────────────────────────────────────────────────
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(27,94,32,0.5)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 20,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.amber,
  },
  heroBadgeText: {
    fontSize: 12,
    ...font.semi,
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // ── Checker decorative circles ────────────────────────────────────────────
  checkerDecorCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
    opacity: 0.7,
  },
  checkerDecorCircle2: {
    position: 'absolute',
    top: -20,
    right: 120,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.03)',
    opacity: 0.6,
  },

  // ── Checker badge ─────────────────────────────────────────────────────────
  checkerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'center',
    marginBottom: 20,
  },
  checkerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.amber,
  },
  checkerBadgeText: {
    fontSize: 11,
    ...font.bold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Checker ghost link ────────────────────────────────────────────────────
  checkerGhostLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  checkerGhostText: {
    fontSize: fontSize.small,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── Checker stats row ─────────────────────────────────────────────────────
  checkerStatsDivider: {
    width: '100%',
    maxWidth: 560,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 32,
    marginBottom: 24,
  },
  checkerStatsRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 560,
    justifyContent: 'space-around',
  },
  checkerStatItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  checkerStatItemBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  checkerStatNum: {
    fontSize: 26,
    ...font.extra,
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  checkerStatLbl: {
    fontSize: 10,
    ...font.semi,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // ── Step badge + connector ────────────────────────────────────────────────
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadgeHover: {
    backgroundColor: COLORS.primaryDeep,
  },
  stepBadgeNum: {
    fontSize: fontSize.small,
    ...font.extra,
    color: COLORS.white,
  },
  stepBadgeNumHover: {
    color: COLORS.white,
  },
  stepsConnector: {
    width: 28,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    borderStyle: 'dashed',
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 18,
  },

  // ── Impact number row + pulse dot ─────────────────────────────────────────
  impactNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  impactPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  iconCircleEmoji: { fontSize: 20 },
  chevron: { fontSize: 18, color: COLORS.border, marginLeft: 4 },
  chevronHover: { color: COLORS.primary },
});
