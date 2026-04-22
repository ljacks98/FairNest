import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';

import Navbar from '../components/Navbar';
import { fontSize, font } from '../theme/typography';
import { COLORS } from '../utils/constants';

const STORY_COLUMNS = [
  {
    label: 'Origin',
    title: 'Built in Durham for Durham residents',
    body: 'FairNest began as an NCCU IT capstone focused on making fair housing support easier to find, understand, and use. The goal was to design something that feels clear and practical for real community needs.',
  },
  {
    label: 'Mission',
    title: 'Reduce friction at the moment someone needs help',
    body: 'People dealing with housing stress should not have to decode legal language or hunt across disconnected websites. FairNest brings reporting, guidance, and local support into one calmer experience.',
  },
  {
    label: 'Values',
    title: 'Human centered, local, and action oriented',
    body: 'We care about plain language, trustworthy information, and pathways to real next steps. Every part of the product is meant to help residents move from uncertainty toward support.',
  },
];

const PLATFORM_PILLARS = [
  {
    title: 'Understand your rights',
    text: 'Helps residents recognize when housing treatment may be unfair or discriminatory.',
  },
  {
    title: 'Take the next step',
    text: 'Residents can file a report, request a consultation, and find local support without bouncing between systems.',
  },
  {
    title: 'Stay connected to local help',
    text: 'FairNest points people toward Durham-centered resources, advocates, and organizations that can continue the conversation.',
  },
];

const TEAM_PLACEHOLDERS = [
  {
    image: require('../../assets/Laila.png'),
    imageTop: true,
    name: 'Laila Jackson',
    role: 'Strategy & Coordination',
    bio: 'Laila keeps FairNest moving forward by aligning the team across mobile development, AI integration, and security. She manages timelines, coordinates communication, and ensures every moving part stays connected so the platform delivers on its promise to Durham residents.',
  },
  {
    image: require('../../assets/JAIDEN.png'),
    name: 'Jaiden Lanier',
    role: 'Frontend & UX',
    bio: 'Jaiden brings FairNest to life by translating designs into polished, accessible interfaces. His technical skill in React Native and eye for user experience ensure every screen feels intuitive, while his work integrating AI components keeps the platform smart and responsive.',
  },
  {
    image: require('../../assets/Terence123.jpg'),
    name: 'Terence Agaromba',
    role: 'Back End Developer',
    bio: "He runs FairNest's backend, cloud infrastructure, and AI integration architecting the data layer, building Firebase Cloud Functions, and ensuring everything from report filing to AI powered chat works reliably across platforms. He also enhances the UI/UX and handles quality assurance to keep the platform polished and bug free from the inside out.",
  },
  {
    image: require('../../assets/AALIYAH.png'),
    imageTop: true,
    name: 'Aaliyah Harrell',
    role: 'System Analyst',
    bio: 'Aaliyah bridges community needs and system design by gathering requirements, interpreting user feedback, and ensuring the platform stays aligned with what residents actually need. Her analytical thinking and attention to detail keep FairNest grounded in real-world expectations.',
  },
  {
    image: require('../../assets/Ray.png'),
    name: "Ray M'Passi",
    role: 'Quality Assurance & Testing',
    bio: 'Ray helps keep FairNest reliable before release by identifying bugs, validating features, and confirming that each workflow meets requirements. His careful testing supports security, accuracy, and a polished final experience for residents.',
  },
  {
    image: require('../../assets/Christian.png'),
    name: 'Christian Malone',
    role: 'Database & Cloud Engineer',
    bio: 'Christian supports FairNest’s secure cloud infrastructure by helping manage hosting, shape the database layer, and strengthen data protection. His work helps keep the platform scalable, reliable, and safe for residents using it.',
  },
];

export default function AboutScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMedium = width >= 760;
  const isWide = width >= 1120;
  const teamGridWidth = Math.min(width - 56, 1240);
  const wideTeamCardWidth = (teamGridWidth - 54) / 4;
  const wideTeamCardStyle = {
    width: wideTeamCardWidth,
    flexBasis: wideTeamCardWidth,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: Math.round(wideTeamCardWidth * 1.5),
  };

  const [hoveredTeam, setHoveredTeam] = useState(null);
  const [hoveredPrimary, setHoveredPrimary] = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(false);

  const renderTeamCard = (member, index, extraStyle = null) => (
    <TouchableOpacity
      key={`${member.name}-${member.role}-${index}`}
      activeOpacity={0.92}
      onPress={() => {}}
      onMouseEnter={() => setHoveredTeam(member.role)}
      onMouseLeave={() => setHoveredTeam(null)}
      style={[
        styles.teamCard,
        extraStyle,
        hoveredTeam === member.role && styles.teamCardHover,
      ]}>
      <View style={styles.teamAvatar}>
        {member.image ? (
          <Image
            source={member.image}
            style={[
              styles.teamAvatarImage,
              member.imageTop && styles.teamAvatarImageTop,
            ]}
            accessibilityRole="image"
            accessibilityLabel={`Photo of ${member.name}`}
          />
        ) : (
          <Text style={styles.teamAvatarText}>{member.emoji}</Text>
        )}
      </View>
      <Text style={styles.teamName}>{member.name}</Text>
      <Text style={styles.teamRole}>{member.role}</Text>
      <Text style={styles.teamBio}>{member.bio}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageFill}>
      <ImageBackground
        source={require('../../assets/pexel-durham2.jpg')}
        style={styles.hero}
        imageStyle={styles.heroImage}
        resizeMode="cover">
        <View style={styles.heroOverlay} />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <Navbar navigation={navigation} currentRoute="About" transparent />
          <View style={[styles.heroInner, isWide && styles.heroInnerWide]}>
            <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
              <Text style={styles.heroLabel}>ABOUT FAIRNEST</Text>
              <Text style={[styles.heroTitle, isWide && styles.heroTitleWide]}>
                A calmer way to navigate housing support in Durham
              </Text>
              <Text style={styles.heroSubtitle}>
                FairNest connects residents to reporting tools, local resources,
                and guided next steps so getting help feels more approachable
                and less overwhelming.
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.storySection}>
        <View style={styles.storyIntro}>
          <Text style={styles.sectionEyebrow}>Our Story</Text>
          <Text style={styles.sectionTitle}>Why FairNest exists</Text>
          <Text style={styles.sectionText}>
            The project brings together housing guidance, reporting, and local
            support in one place so residents can understand what is happening
            and know what to do next.
          </Text>
        </View>

        <View style={[styles.storyGrid, isWide && styles.storyGridWide]}>
          {STORY_COLUMNS.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.storyColumn,
                isWide && styles.storyColumnWide,
                isWide &&
                  index < STORY_COLUMNS.length - 1 &&
                  styles.storyColumnDivider,
              ]}>
              <Text style={styles.storyColumnLabel}>{item.label}</Text>
              <Text style={styles.storyColumnTitle}>{item.title}</Text>
              <Text style={styles.storyColumnText}>{item.body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.purposeSection}>
        <View style={[styles.purposeInner, isWide && styles.purposeInnerWide]}>
          <View style={styles.purposeLead}>
            <Text style={styles.sectionEyebrow}>What FairNest Does</Text>
            <Text style={styles.sectionTitle}>
              Support that moves from confusion to action
            </Text>
            <Text style={styles.sectionText}>
              The platform is designed to make the first step easier. Whether
              someone wants to learn, document, or connect, FairNest keeps the
              experience grounded in clear language and useful next moves.
            </Text>
          </View>

          <View style={styles.pillarList}>
            {PLATFORM_PILLARS.map((pillar) => (
              <View key={pillar.title} style={styles.pillarRow}>
                <View style={styles.pillarDot} />
                <View style={styles.pillarCopy}>
                  <Text style={styles.pillarTitle}>{pillar.title}</Text>
                  <Text style={styles.pillarText}>{pillar.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.teamSection}>
        <View style={styles.teamIntro}>
          <Text style={styles.sectionEyebrow}>Meet Our Team</Text>
        </View>

        <View style={styles.teamGrid}>
          {isWide ? (
            <>
              <View style={styles.teamRowWide}>
                {TEAM_PLACEHOLDERS.slice(0, 4).map((member, index) =>
                  renderTeamCard(member, index, wideTeamCardStyle)
                )}
              </View>

              <View style={[styles.teamRowWide, styles.teamRowCentered]}>
                {TEAM_PLACEHOLDERS.slice(4).map((member, index) =>
                  renderTeamCard(member, index + 4, wideTeamCardStyle)
                )}
              </View>
            </>
          ) : (
            <View
              style={[styles.teamGridStack, isMedium && styles.teamGridMedium]}>
              {TEAM_PLACEHOLDERS.map((member, index) =>
                renderTeamCard(member, index)
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.ctaSection}>
        <View style={[styles.ctaInner, isWide && styles.ctaInnerWide]}>
          <View style={styles.ctaCopy}>
            <Text style={styles.ctaLabel}>Need help now?</Text>
            <Text style={styles.ctaTitle}>
              Use FairNest to take the next step
            </Text>
            <Text style={styles.ctaText}>
              Whether someone wants to document an issue or talk with an
              advocate, the platform is built to make the process more direct.
            </Text>
          </View>

          <View style={styles.ctaActions}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                hoveredPrimary && styles.primaryBtnHover,
              ]}
              onPress={() => navigation.navigate('Report')}
              onMouseEnter={() => setHoveredPrimary(true)}
              onMouseLeave={() => setHoveredPrimary(false)}
              activeOpacity={0.88}>
              <Text style={styles.primaryBtnText}>File a Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                hoveredSecondary && styles.secondaryBtnHover,
              ]}
              onPress={() => navigation.navigate('ScheduleCall')}
              onMouseEnter={() => setHoveredSecondary(true)}
              onMouseLeave={() => setHoveredSecondary(false)}
              activeOpacity={0.88}>
              <Text
                style={[
                  styles.secondaryBtnText,
                  hoveredSecondary && styles.secondaryBtnTextHover,
                ]}>
                Book a Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.disclaimerSection}>
        <Text style={styles.disclaimerLabel}>Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          FairNest provides educational guidance and resource direction. It does
          not replace legal advice, government case management, or emergency
          services.
        </Text>
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
    paddingBottom: 52,
  },
  hero: {
    minHeight: 820,
    paddingBottom: 40,
    paddingHorizontal: 0,
    justifyContent: 'space-between',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 0,
  },
  heroImage: {
    opacity: 0.98,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 31, 12, 0.44)',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 22, 12, 0.16)',
  },
  heroInner: {
    width: '100%',
    maxWidth: 1380,
    alignSelf: 'center',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 72,
  },
  heroInnerWide: {
    justifyContent: 'center',
  },
  heroCopy: {
    width: '100%',
    maxWidth: 920,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroCopyWide: {
    maxWidth: 980,
  },
  heroLabel: {
    color: COLORS.gold,
    fontSize: 12,
    ...font.extra,
    letterSpacing: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 60,
    ...font.extra,
    lineHeight: 66,
    letterSpacing: -2,
    textAlign: 'center',
    marginBottom: 22,
  },
  heroTitleWide: {
    fontSize: 76,
    lineHeight: 80,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.bodyLg,
    lineHeight: 30,
    textAlign: 'center',
    maxWidth: 720,
  },
  storySection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 54,
    paddingBottom: 38,
  },
  storyIntro: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 34,
  },
  sectionEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h1,
    ...font.extra,
    textAlign: 'center',
    marginBottom: 14,
  },
  sectionText: {
    color: COLORS.textMuted,
    fontSize: fontSize.body,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 760,
  },
  storyGrid: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    gap: 18,
  },
  storyGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  storyColumn: {
    flex: 1,
    paddingVertical: 10,
  },
  storyColumnWide: {
    paddingHorizontal: 28,
  },
  storyColumnDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(20, 32, 51, 0.1)',
  },
  storyColumnLabel: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    ...font.extra,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  storyColumnTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    ...font.extra,
    lineHeight: 28,
    marginBottom: 12,
  },
  storyColumnText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 24,
  },
  purposeSection: {
    paddingHorizontal: 28,
    paddingVertical: 54,
    backgroundColor: '#EEF3EA',
  },
  purposeInner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    gap: 26,
  },
  purposeInnerWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  purposeLead: {
    flex: 1,
    maxWidth: 500,
  },
  pillarList: {
    flex: 1.2,
    gap: 18,
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 32, 51, 0.08)',
  },
  pillarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  pillarCopy: {
    flex: 1,
  },
  pillarTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.body,
    ...font.extra,
    marginBottom: 6,
  },
  pillarText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 24,
  },
  teamSection: {
    paddingHorizontal: 28,
    paddingVertical: 56,
    backgroundColor: '#F7F9F4',
  },
  teamIntro: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  teamGrid: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    gap: 18,
  },
  teamGridStack: {
    gap: 18,
  },
  teamGridMedium: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 18,
  },
  teamRowCentered: {
    justifyContent: 'center',
  },
  teamCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(20, 32, 51, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  teamCardHover: {
    transform: [{ translateY: -3 }],
    borderColor: 'rgba(46, 125, 50, 0.3)',
    shadowOpacity: 0.08,
  },
  teamAvatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#EDF4E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  teamAvatarImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    resizeMode: 'cover',
  },
  teamAvatarImageTop: {
    height: 156,
    borderRadius: 0,
    position: 'absolute',
    top: 0,
  },
  teamAvatarText: {
    fontSize: 34,
  },
  teamName: {
    color: COLORS.textPrimary,
    fontSize: fontSize.body,
    ...font.extra,
    marginBottom: 4,
  },
  teamRole: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    ...font.bold,
    marginBottom: 12,
  },
  teamBio: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 23,
  },
  ctaSection: {
    paddingHorizontal: 28,
    paddingVertical: 54,
    backgroundColor: COLORS.primaryDeep,
  },
  ctaInner: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    gap: 22,
  },
  ctaInnerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaCopy: {
    flex: 1,
    maxWidth: 620,
  },
  ctaLabel: {
    color: '#CBE8B8',
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.h1,
    ...font.extra,
    marginBottom: 14,
  },
  ctaText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: fontSize.body,
    lineHeight: 28,
  },
  ctaActions: {
    gap: 14,
  },
  primaryBtn: {
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#F6FBF2',
  },
  primaryBtnHover: {
    backgroundColor: '#E8F3E2',
    transform: [{ translateY: -1 }],
  },
  primaryBtnText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.button,
    ...font.extra,
  },
  secondaryBtn: {
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'transparent',
  },
  secondaryBtnHover: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.55)',
    transform: [{ translateY: -1 }],
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.button,
    ...font.extra,
  },
  secondaryBtnTextHover: {
    color: '#FFFFFF',
  },
  disclaimerSection: {
    paddingHorizontal: 28,
    paddingTop: 24,
    alignItems: 'center',
  },
  disclaimerLabel: {
    color: '#72806E',
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  disclaimerText: {
    color: '#6C756A',
    fontSize: fontSize.small,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 760,
  },
});
