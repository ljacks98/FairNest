import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { fontSize } from '../theme/typography';

export default function Navbar({ navigation, currentRoute }) {
  const { user, logout } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [isAdmin, setIsAdmin]     = useState(false);
  const { width } = useWindowDimensions();

  const isSmall = width < 600;
  const isMedium = width < 900;

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setFirstName(snap.data().firstName || '');
          setIsAdmin(snap.data().role === 'admin');
        }
      } else {
        setFirstName('');
        setIsAdmin(false);
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

  // On small screens: brand on top row, links + actions below
  if (isSmall) {
    return (
      <View style={styles.navbarSmall}>
        {/* Top row: brand + sign out */}
        <View style={styles.smallTopRow}>
          <TouchableOpacity
            style={styles.brand}
            onPress={() => navigation.navigate('Home')}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>F</Text>
            </View>
            <View>
              <Text style={styles.brandName}>FairNest</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actions}>
            {user ? (
              <>
                <TouchableOpacity
                  style={styles.profileBtn}
                  onPress={() => navigation.navigate('Profile')}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>
                      {(firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
                {isAdmin && (
                  <TouchableOpacity
                    style={styles.dashBtn}
                    onPress={() => navigation.navigate('AdminDashboard')}>
                    <Text style={styles.dashBtnText}>Dashboard</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.signOutBtn} onPress={() => logout(() => navigation.navigate('Home'))}>
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom row: nav links */}
        <View style={styles.smallNavLinks}>
          {navLinks.map(link => (
            <TouchableOpacity
              key={link.route}
              onPress={() => navigation.navigate(link.route)}>
              <Text
                style={[
                  styles.navLinkSmall,
                  currentRoute === link.route && styles.navLinkActive,
                ]}>
                {link.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Standard layout: brand | center links | actions
  return (
    <View style={styles.navbar}>
      {/* LEFT: Brand */}
      <View style={styles.brandCol}>
        <TouchableOpacity
          style={styles.brand}
          onPress={() => navigation.navigate('Home')}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>F</Text>
          </View>
          <View>
            <Text style={styles.brandName}>FairNest</Text>
            {!isMedium && (
              <Text style={styles.brandSub}>Durham Housing Assistance</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* CENTER: Nav Links */}
      <View style={styles.navLinks}>
        {navLinks.map(link => (
          <TouchableOpacity
            key={link.route}
            onPress={() => navigation.navigate(link.route)}>
            <Text
              style={[
                styles.navLink,
                currentRoute === link.route && styles.navLinkActive,
              ]}>
              {link.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RIGHT: Actions */}
      <View style={styles.actionsCol}>
        {user ? (
          <>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile')}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {(firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>
                {firstName || 'My Profile'}
              </Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                style={styles.dashBtn}
                onPress={() => navigation.navigate('AdminDashboard')}>
                <Text style={styles.dashBtnText}>Dashboard</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.signOutBtn} onPress={() => logout(() => navigation.navigate('Home'))}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpBtn}
              onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Standard (≥600px) ──────────────────────────────────────────────
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  // Left column — brand takes equal flex to balance with right
  brandCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  brandName: {
    fontSize: fontSize.h4,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  brandSub: {
    fontSize: fontSize.caption,
    color: '#777',
  },

  // Center — nav links sit naturally centered
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  navLink: {
    fontSize: fontSize.navLink,
    color: '#444',
    fontWeight: '500',
  },
  navLinkActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
    paddingBottom: 2,
  },

  // Right column — matches flex of brand to balance both sides
  actionsCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userName: {
    fontSize: fontSize.small,
    color: '#2E7D32',
    fontWeight: '600',
  },
  loginBtn: {
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  loginText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: fontSize.small,
  },
  signUpBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  signUpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontSize.small,
  },
  dashBtn: {
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  dashBtnText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: fontSize.small,
  },
  signOutBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontSize.small,
  },

  // ── Small screens (<600px) ─────────────────────────────────────────
  navbarSmall: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
  },
  smallTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallNavLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 4,
    paddingBottom: 4,
  },
  navLinkSmall: {
    fontSize: fontSize.body,
    color: '#444',
    fontWeight: '500',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
