import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

import { COLORS } from '../utils/constants';
import { fontSize, font } from '../theme/typography';

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [secureText, setSecureText]         = useState(true);
  const [secureConfirm, setSecureConfirm]   = useState(true);
  const [hoveredCreate, setHoveredCreate]   = useState(false);
  const [hoveredGoogle, setHoveredGoogle]   = useState(false);
  const [hoveredLogin, setHoveredLogin]     = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
      headerTintColor: COLORS.primaryDeep,
    });
  }, [navigation]);


  const validatePassword = (pwd) =>
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

  const handleSignUp = async () => {
    setError('');
    if (!firstName || !lastName)      { setError('Please enter your first and last name.'); return; }
    if (!email)                        { setError('Please enter your email.');               return; }
    if (!validatePassword(password))   { setError('Password must be 8+ chars with uppercase, lowercase, number, and special character.'); return; }
    if (password !== confirmPassword)  { setError('Passwords do not match.');                return; }
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'user',
        status: 'active',
        createdAt: serverTimestamp(),
      });
      navigation.navigate('Home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const nameParts = user.displayName?.split(' ') || [];
      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          role: 'user',
          status: 'active',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      navigation.navigate('Home');
    } catch (err) {
      setError('Google sign-up failed. Please try again.');
    }
  };

  const cardWidth = Math.min(width - 32, 480);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* Decorative rings */}
      <View style={styles.ringOuter} />
      <View style={styles.ringMiddle} />
      <View style={styles.ringInner} />

      <View style={[styles.wrapper, { width: cardWidth }]}>

        {/* Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>CREATE ACCOUNT</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Join FairNest</Text>
        <Text style={styles.subheading}>
          Free tools to protect your housing rights
        </Text>

        {/* Card */}
        <View style={styles.card}>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={{ fontSize: 15 }}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane"
                placeholderTextColor="#c0c8c0"
                value={firstName}
                onChangeText={setFirstName}
                accessibilityLabel="First name"
              />
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#c0c8c0"
                value={lastName}
                onChangeText={setLastName}
                accessibilityLabel="Last name"
              />
            </View>
          </View>

          {/* Email */}
          <Text style={[styles.label, styles.labelGap]}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#c0c8c0"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Email address"
          />

          {/* Password */}
          <Text style={[styles.label, styles.labelGap]}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Min 8 chars, upper, number, symbol"
              placeholderTextColor="#c0c8c0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              accessibilityLabel="Password"
            />
            <TouchableOpacity
              onPress={() => setSecureText(!secureText)}
              activeOpacity={0.7}
              accessibilityLabel={secureText ? 'Show password' : 'Hide password'}>
              <Text style={{ fontSize: 18, color: '#9aaa9a' }}>{secureText ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={[styles.label, styles.labelGap]}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter your password"
              placeholderTextColor="#c0c8c0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirm}
              accessibilityLabel="Confirm password"
            />
            <TouchableOpacity
              onPress={() => setSecureConfirm(!secureConfirm)}
              activeOpacity={0.7}
              accessibilityLabel={secureConfirm ? 'Show confirm password' : 'Hide confirm password'}>
              <Text style={{ fontSize: 18, color: '#9aaa9a' }}>{secureConfirm ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up button */}
          <TouchableOpacity
            style={[styles.signUpBtn, loading && styles.signUpBtnDisabled, !loading && hoveredCreate && styles.signUpBtnHover]}
            onPress={handleSignUp}
            onMouseEnter={() => setHoveredCreate(true)}
            onMouseLeave={() => setHoveredCreate(false)}
            activeOpacity={0.7}
            disabled={loading}
            accessibilityLabel="Create your FairNest account">
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.signUpText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleBtn, hoveredGoogle && styles.googleBtnHover]}
            onPress={handleGoogleSignUp}
            onMouseEnter={() => setHoveredGoogle(true)}
            onMouseLeave={() => setHoveredGoogle(false)}
            activeOpacity={0.7}
            accessibilityLabel="Sign up with Google">
            <Text style={{ fontSize: 18 }}>🇬</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

        </View>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            onMouseEnter={() => setHoveredLogin(true)}
            onMouseLeave={() => setHoveredLogin(false)}
            activeOpacity={0.7}
            accessibilityLabel="Go to login">
            <Text style={[styles.loginLink, hoveredLogin && styles.loginLinkHover]}>Sign in</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.greenTint,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 72,
    paddingHorizontal: 16,
  },

  // ── Decorative rings ─────────────────────────────────────────────────────
  ringOuter: {
    position: 'absolute',
    width: 900,
    height: 900,
    borderRadius: 450,
    borderWidth: 1,
    borderColor: 'rgba(27,94,32,0.07)',
    alignSelf: 'center',
    top: '50%',
    marginTop: -450,
  },
  ringMiddle: {
    position: 'absolute',
    width: 620,
    height: 620,
    borderRadius: 310,
    borderWidth: 1,
    borderColor: 'rgba(27,94,32,0.09)',
    alignSelf: 'center',
    top: '50%',
    marginTop: -310,
  },
  ringInner: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    borderWidth: 1,
    borderColor: 'rgba(27,94,32,0.11)',
    alignSelf: 'center',
    top: '50%',
    marginTop: -190,
  },

  // ── Wrapper ───────────────────────────────────────────────────────────────
  wrapper: {
    alignItems: 'center',
  },

  // ── Badge ─────────────────────────────────────────────────────────────────
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.iconTint,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginBottom: 24,
  },
  badgeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primaryDeep,
  },
  badgeText: {
    fontSize: 14,
    ...font.bold,
    color: COLORS.primaryDeep,
    letterSpacing: 2,
  },

  // ── Heading ───────────────────────────────────────────────────────────────
  heading: {
    fontSize: 40,
    ...font.extra,
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    fontSize: fontSize.body,
    ...font.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: fontSize.body * 1.6,
    marginBottom: 32,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    shadowColor: COLORS.primaryDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(27,94,32,0.07)',
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fdf0ee',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f5c0b8',
  },
  errorText: {
    fontSize: fontSize.small,
    color: '#c0392b',
    flex: 1,
    lineHeight: fontSize.small * 1.5,
  },

  // ── Name row ──────────────────────────────────────────────────────────────
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  label: {
    fontSize: fontSize.small,
    ...font.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  labelGap: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fontSize.body,
    ...font.regular,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.greenTint,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.greenTint,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: fontSize.body,
    ...font.regular,
    color: COLORS.textPrimary,
  },

  // ── Sign Up button ────────────────────────────────────────────────────────
  signUpBtn: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    shadowColor: COLORS.primaryDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  signUpBtnDisabled: {
    opacity: 0.6,
  },
  signUpText: {
    color: COLORS.white,
    ...font.extra,
    fontSize: fontSize.button,
    letterSpacing: 0.4,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    fontSize: fontSize.small,
    ...font.regular,
    color: COLORS.textMuted,
  },

  // ── Google ────────────────────────────────────────────────────────────────
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  googleText: {
    fontSize: fontSize.body,
    ...font.semi,
    color: COLORS.textPrimary,
  },

  // ── Login row ─────────────────────────────────────────────────────────────
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginPrompt: {
    fontSize: fontSize.small,
    ...font.regular,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontSize: fontSize.small,
    ...font.bold,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },

  // ── Hover states ──────────────────────────────────────────────────────────
  signUpBtnHover:  { backgroundColor: '#163d18' },
  googleBtnHover:  { backgroundColor: COLORS.greenTint, borderColor: COLORS.primary },
  loginLinkHover:  { color: COLORS.primaryDeep },
});
