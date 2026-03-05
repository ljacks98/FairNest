import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  // 🔐 Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      '636482035002-cdh1lc63htjc6t653o7222pdr6ho3voa.apps.googleusercontent.com',
  });

  // 🔄 Handle Google Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication;

      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => {
          navigation.navigate('Home');
        })
        .catch(() => {
          setError('Google sign-in failed.');
        });
    }
  }, [response]);

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleLogin = async () => {
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Try again later.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email above to reset password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent.');
    } catch {
      setError('Unable to send reset email.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Text style={styles.toggle}>{secureText ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* 🔐 Google Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.forgot} onPress={handleForgotPassword}>
        Forgot Password?
      </Text>

      <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
        Don’t have an account? Sign Up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },

  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: '#ccc',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },

  toggle: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },

  error: {
    color: 'red',
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  googleButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  googleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#444',
  },

  forgot: {
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 15,
  },

  link: {
    textAlign: 'center',
    color: '#2E7D32',
  },
});
