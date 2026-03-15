import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, deleteUser } from 'firebase/auth';
import { db } from '../firebaseConfig';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ================= FETCH USER DATA =================
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
        }
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    try {
      setMessage('');

      if (email !== user.email) {
        await updateEmail(user, email);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      setMessage('Profile updated successfully.');
    } catch (err) {
      console.log(err);

      if (err.code === 'auth/requires-recent-login') {
        setMessage('Please log out and log in again to change email.');
      } else {
        setMessage('Update failed.');
      }
    }
  };

  // ================= CHANGE PASSWORD =================
  const handlePasswordChange = async () => {
    try {
      if (newPassword.length < 8) {
        setMessage('Password must be at least 8 characters.');
        return;
      }

      await updatePassword(user, newPassword);
      setNewPassword('');
      setMessage('Password updated successfully.');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setMessage('Please log out and log in again to change password.');
      } else {
        setMessage('Password update failed.');
      }
    }
  };

  // ================= DELETE ACCOUNT =================
  const handleDeleteAccount = async () => {
    try {
      if (!user) return;

      // Delete Firestore document
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete Auth account
      await deleteUser(user);
    } catch (err) {
      console.log(err);

      if (err.code === 'auth/requires-recent-login') {
        setMessage('Please log out and log in again to delete your account.');
      } else {
        setMessage('Account deletion failed.');
      }
    }
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ================= UI =================
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Optional"
      />

      <TouchableOpacity
        style={[styles.button, { marginTop: 10 }]}
        onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Security</Text>

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder="Enter new password"
      />

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handlePasswordChange}>
        <Text style={styles.secondaryButtonText}>Change Password</Text>
      </TouchableOpacity>

      <Text style={styles.dangerTitle}>Danger Zone</Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 10,
    color: 'red',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    color: 'green',
  },
});
