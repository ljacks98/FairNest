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
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { COLORS } from '../utils/constants';
import { fontSize } from '../theme/typography';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [hoveredSignIn, setHoveredSignIn]   = useState(false);
  const [hoveredGoogle, setHoveredGoogle]   = useState(false);
  const [hoveredForgot, setHoveredForgot]   = useState(false);
  const [hoveredSignUp, setHoveredSignUp]   = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
      headerTintColor: COLORS.primaryDeep,
    });
  }, [navigation]);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: '636482035002-cdh1lc63htjc6t653o7222pdr6ho3voa.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => navigation.navigate('ReportScreen')) // <- changed
        .catch(() => setError('Google sign-in failed.'));
    }
  }, [response]);

  const handleLogin = async () => {
    setError('');
    if (!email)    { setError('Please enter your email.');    return; }
    if (!password) { setError('Please enter your password.'); return; }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('ReportScreen'); // <- changed
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-email':     setError('Please enter a valid email address.');        break;
        case 'auth/user-not-found':    setError('No account found with this email.');          break;
        case 'auth/wrong-password':    setError('Incorrect password. Please try again.');      break;
        case 'auth/too-many-requests': setError('Too many failed attempts. Try again later.'); break;
        default:                       setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email above to reset password.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent.');
    } catch {
      setError('Unable to send reset email.');
    }
  };

  const cardWidth = Math.min(width - 32, 480);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* Decorative rings — subtle background geometry */}
      <View style={styles.ringOuter} />
      <View style={styles.ringMiddle} />
      <View style={styles.ringInner} />

      <View style={[styles.wrapper, { width: cardWidth }]}>

        {/* Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>FAIRNEST LOGIN</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Welcome Back!</Text>
        <Text style={styles.subheading}>
          Sign in to access your housing tools
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

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
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
              placeholder="••••••••"
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

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={handleForgotPassword}
            onMouseEnter={() => setHoveredForgot(true)}
            onMouseLeave={() => setHoveredForgot(false)}
            activeOpacity={0.7}
            accessibilityLabel="Forgot password">
            <Text style={[styles.forgotText, hoveredForgot && styles.forgotTextHover]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign In */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled, !loading && hoveredSignIn && styles.signInBtnHover]}
            onPress={handleLogin}
            onMouseEnter={() => setHoveredSignIn(true)}
            onMouseLeave={() => setHoveredSignIn(false)}
            activeOpacity={0.7}
            disabled={loading}
            accessibilityLabel="Sign in to FairNest">
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
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
            onPress={() => promptAsync()}
            onMouseEnter={() => setHoveredGoogle(true)}
            onMouseLeave={() => setHoveredGoogle(false)}
            activeOpacity={0.7}
            accessibilityLabel="Continue with Google">
            <Text style={{ fontSize: 18 }}>🇬</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

        </View>

        {/* Sign Up */}
        <View style={styles.signUpRow}>
          <Text style={styles.signUpPrompt}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            onMouseEnter={() => setHoveredSignUp(true)}
            onMouseLeave={() => setHoveredSignUp(false)}
            activeOpacity={0.7}
            accessibilityLabel="Create a FairNest account">
            <Text style={[styles.signUpLink, hoveredSignUp && styles.signUpLinkHover]}>
              Create one
            </Text>
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
    paddingVertical: 56,
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

  // ── Content wrapper ───────────────────────────────────────────────────────
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
    fontWeight: '700',
    color: COLORS.primaryDeep,
    letterSpacing: 2,
  },

  // ── Heading ───────────────────────────────────────────────────────────────
  heading: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    fontSize: fontSize.body,
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
    alignItems: 'center',
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
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  label: {
    fontSize: fontSize.small,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  labelGap: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: fontSize.body,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.greenTint,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: COLORS.greenTint,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: fontSize.body,
    color: COLORS.textPrimary,
  },

  // ── Forgot ────────────────────────────────────────────────────────────────
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: fontSize.small,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ── Sign In button ────────────────────────────────────────────────────────
  signInBtn: {
    backgroundColor: COLORS.primaryDeep,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primaryDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  signInBtnDisabled: {
    opacity: 0.6,
  },
  signInText: {
    color: COLORS.white,
    fontWeight: '800',
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
    color: COLORS.textMuted,
    fontWeight: '500',
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
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // ── Sign Up row ───────────────────────────────────────────────────────────
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpPrompt: {
    fontSize: fontSize.small,
    color: COLORS.textMuted,
  },
  signUpLink: {
    fontSize: fontSize.small,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // ── Hover states ──────────────────────────────────────────────────────────
  signInBtnHover:  { backgroundColor: '#163d18' },
  googleBtnHover:  { backgroundColor: COLORS.greenTint, borderColor: COLORS.primary },
  forgotTextHover: { color: COLORS.primaryDeep, textDecorationLine: 'underline' },
  signUpLinkHover: { color: COLORS.primaryDeep },
});
