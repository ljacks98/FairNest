import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import { auth } from '../firebaseConfig';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // 🔐 Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      '636482035002-cdh1lc63htjc6t653o7222pdr6ho3voa.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.authentication;

      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(() => {
          navigation.navigate('Home');
        })
        .catch(() => {
          setError('Google sign-up failed.');
        });
    }
  }, [response]);

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSignUp = async () => {
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account already exists with this email.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak.');
          break;
        case 'auth/missing-email':
          setError('Email is required.');
          break;
        default:
          setError('Sign up failed. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      <Text style={styles.rules}>
        Password must contain:
        {'\n'}• At least 8 characters
        {'\n'}• Uppercase letter
        {'\n'}• Lowercase letter
        {'\n'}• Number
        {'\n'}• Special character
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* 🔐 Google Sign Up */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
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

  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  googleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#444',
  },

  rules: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
  },

  error: {
    color: 'red',
    marginBottom: 10,
  },

  link: {
    textAlign: 'center',
    color: '#2E7D32',
    marginTop: 15,
  },
});
