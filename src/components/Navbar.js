import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { COLORS } from '../utils/constants';
import { fontSize } from '../theme/typography';

export default function Navbar({
  navigation,
  currentRoute,
  transparent = false,
}) {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { width } = useWindowDimensions();

  const isSmall = width < 600;
  const isMedium = width < 900;

  // Transparent mode overrides — white text on dark photo background
  const linkColor = transparent ? 'rgba(255,255,255,0.85)' : '#444';
  const linkActiveColor = transparent ? COLORS.white : COLORS.primaryDeep;
  const brandColor = transparent ? COLORS.white : COLORS.textPrimary;
  const brandSubColor = transparent
    ? 'rgba(255,255,255,0.6)'
    : COLORS.textMuted;
  const pillActiveBg = transparent
    ? 'rgba(255,255,255,0.15)'
    : 'rgba(27,94,32,0.12)';
  const pillHoverBg = transparent
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(27,94,32,0.08)';

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setFirstName(snap.data().firstName || '');
        }
      } else {
        setFirstName('');
      }
    };
    fetchUser();
  }, [user]);

  const navLinks = [
    { label: 'Home', route: 'Home' },
    { label: 'Learn More', route: 'HousingRights' },
    { label: 'Report', route: 'Report' },
    { label: 'Book a Call', route: 'ScheduleCall' },
    { label: 'About Us', route: 'About' },
  ];

  const renderBrand = () => (
    <TouchableOpacity
      style={styles.brand}
      onPress={() => navigation.navigate('Home')}
      activeOpacity={0.7}
      accessibilityLabel="FairNest home">
      <View style={styles.logoBox}>
        <Text style={styles.logoLetter}>F</Text>
      </View>
      <View>
        <Text style={[styles.brandName, { color: brandColor }]}>FairNest</Text>
        {!isSmall && !isMedium && (
          <Text style={[styles.brandSub, { color: brandSubColor }]}>
            Durham, NC
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      {user ? (
        <>
          <TouchableOpacity
            style={[
              styles.profileBtn,
              hoveredBtn === 'profile' && { backgroundColor: pillHoverBg },
            ]}
            onPress={() => navigation.navigate('Profile')}
            onMouseEnter={() => setHoveredBtn('profile')}
            onMouseLeave={() => setHoveredBtn(null)}
            activeOpacity={0.7}
            accessibilityLabel="View my profile">
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {(firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
              </Text>
            </View>
            {!isSmall && (
              <Text
                style={[
                  styles.userName,
                  { color: transparent ? COLORS.white : COLORS.textPrimary },
                ]}>
                {firstName || 'Profile'}
              </Text>
            )}
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={[
                styles.dashBtn,
                hoveredBtn === 'dashboard' && styles.dashBtnHover,
              ]}
              onPress={() => navigation.navigate('AdminDashboard')}
              onMouseEnter={() => setHoveredBtn('dashboard')}
              onMouseLeave={() => setHoveredBtn(null)}
              activeOpacity={0.7}
              accessibilityLabel="Admin dashboard">
              <Text
                style={[
                  styles.dashBtnText,
                  hoveredBtn === 'dashboard' && styles.dashBtnTextHover,
                ]}>
                Dashboard
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.signOutBtn,
              hoveredBtn === 'signout' && styles.signOutBtnHover,
            ]}
            onPress={() => logout(() => navigation.navigate('Home'))}
            onMouseEnter={() => setHoveredBtn('signout')}
            onMouseLeave={() => setHoveredBtn(null)}
            activeOpacity={0.7}
            accessibilityLabel="Sign out">
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.loginBtn,
              hoveredBtn === 'login' && styles.loginBtnHover,
            ]}
            onPress={() => navigation.navigate('Login')}
            onMouseEnter={() => setHoveredBtn('login')}
            onMouseLeave={() => setHoveredBtn(null)}
            activeOpacity={0.7}
            accessibilityLabel="Log in to FairNest">
            <Text
              style={[
                styles.loginText,
                hoveredBtn === 'login' && styles.loginTextHover,
              ]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.signUpBtn,
              hoveredBtn === 'signup' && styles.signUpBtnHover,
            ]}
            onPress={() => navigation.navigate('SignUp')}
            onMouseEnter={() => setHoveredBtn('signup')}
            onMouseLeave={() => setHoveredBtn(null)}
            activeOpacity={0.7}
            accessibilityLabel="Create a FairNest account">
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // ── Small (<600px): brand + actions top, links scroll horizontally below ──
  if (isSmall) {
    return (
      <View
        style={[styles.navbarSmall, transparent && styles.navbarTransparent]}>
        <View style={styles.smallTopRow}>
          {renderBrand()}
          {renderActions()}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.smallLinkScroll}>
          {navLinks.map((link) => (
            <TouchableOpacity
              key={link.route}
              style={[
                styles.navLinkPill,
                currentRoute === link.route && {
                  backgroundColor: pillActiveBg,
                },
                hoveredLink === link.route &&
                  currentRoute !== link.route && {
                    backgroundColor: pillHoverBg,
                  },
              ]}
              onPress={() => navigation.navigate(link.route)}
              onMouseEnter={() => setHoveredLink(link.route)}
              onMouseLeave={() => setHoveredLink(null)}
              activeOpacity={0.7}
              accessibilityLabel={`Go to ${link.label}`}>
              <Text
                style={[
                  styles.navLinkText,
                  { color: linkColor },
                  currentRoute === link.route && {
                    color: linkActiveColor,
                    fontWeight: '700',
                  },
                  hoveredLink === link.route &&
                    currentRoute !== link.route && {
                      color: linkActiveColor,
                      fontWeight: '600',
                    },
                ]}>
                {link.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Standard (≥600px): brand | center links | actions ──
  return (
    <View style={[styles.navbar, transparent && styles.navbarTransparent]}>
      <View style={styles.brandCol}>{renderBrand()}</View>

      <View style={styles.navLinksRow}>
        {navLinks.map((link) => (
          <TouchableOpacity
            key={link.route}
            style={[
              styles.navLinkPill,
              currentRoute === link.route && { backgroundColor: pillActiveBg },
              hoveredLink === link.route &&
                currentRoute !== link.route && { backgroundColor: pillHoverBg },
            ]}
            onPress={() => navigation.navigate(link.route)}
            onMouseEnter={() => setHoveredLink(link.route)}
            onMouseLeave={() => setHoveredLink(null)}
            activeOpacity={0.7}
            accessibilityLabel={`Go to ${link.label}`}>
            <Text
              style={[
                styles.navLinkText,
                { color: linkColor },
                currentRoute === link.route && {
                  color: linkActiveColor,
                  fontWeight: '700',
                },
                hoveredLink === link.route &&
                  currentRoute !== link.route && {
                    color: linkActiveColor,
                    fontWeight: '600',
                  },
              ]}>
              {link.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionsCol}>{renderActions()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Standard layout ──────────────────────────────────────────────────────
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenTint,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#daeada',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  navbarTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  brandCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 24,
  },
  brandName: {
    fontSize: fontSize.h3,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // Nav links — pill style, active gets greenTint bg
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  navLinkPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navLinkPillActive: {
    backgroundColor: 'rgba(27,94,32,0.12)',
  },
  navLinkPillHover: {
    backgroundColor: 'rgba(27,94,32,0.08)',
  },
  navLinkText: {
    fontSize: fontSize.body,
    color: '#444',
    fontWeight: '500',
  },
  navLinkTextActive: {
    color: COLORS.primaryDeep,
    fontWeight: '700',
  },
  navLinkTextHover: {
    color: COLORS.primaryDeep,
    fontWeight: '600',
  },

  // Right actions column
  actionsCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileBtnHover: {
    backgroundColor: 'rgba(27,94,32,0.08)',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  userName: {
    fontSize: fontSize.small,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  loginBtnHover: {
    backgroundColor: '#163d18',
  },
  loginText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: fontSize.small,
  },
  loginTextHover: {
    color: COLORS.white,
  },
  signUpBtn: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  signUpBtnHover: {
    backgroundColor: '#163d18',
  },
  signUpText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: fontSize.small,
  },
  dashBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  dashBtnHover: {
    backgroundColor: 'rgba(27,94,32,0.08)',
  },
  dashBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: fontSize.small,
  },
  dashBtnTextHover: {
    color: COLORS.primaryDeep,
  },
  signOutBtn: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  signOutBtnHover: {
    backgroundColor: '#163d18',
  },
  signOutText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: fontSize.small,
  },

  // ── Small screen (<600px) ─────────────────────────────────────────────────
  navbarSmall: {
    backgroundColor: COLORS.greenTint,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#daeada',
    elevation: 2,
  },
  smallTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  smallLinkScroll: {
    flexDirection: 'row',
    gap: 4,
    paddingBottom: 10,
    paddingTop: 2,
    paddingRight: 16,
  },
});
