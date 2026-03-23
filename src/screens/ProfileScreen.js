import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, orderBy,
} from 'firebase/firestore';
import { updatePassword, deleteUser } from 'firebase/auth';
import { db } from '../firebaseConfig';
import Navbar from '../components/Navbar';
import { fontSize } from '../theme/typography';

const STATUS_COLORS = {
  pending:  { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
  reviewed: { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
  resolved: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
};
const STATUS_LABELS = {
  pending:  'Pending',
  reviewed: 'Under Review',
  resolved: 'Resolved',
};

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [oldPassword, setOldPassword]     = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]         = useState(true);
  const [message, setMessage]         = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeTab, setActiveTab]     = useState('profile');
  const [reports, setReports]         = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setFirstName(d.firstName || '');
          setLastName(d.lastName || '');
          setEmail(user.email || d.email || '');
          const storedPhone = d.phone || '';
          const cleanPhone = storedPhone.includes('@') ? '' : storedPhone;
          setPhone(cleanPhone);
          // Auto-fix corrupted phone field in Firestore
          if (storedPhone.includes('@')) {
            await updateDoc(doc(db, 'users', user.uid), { phone: '' });
          }
        }
      } catch (err) { console.log(err); }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.log(err); }
      setReportsLoading(false);
    };
    fetchReports();
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUpdate = async () => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        phone:     phone.trim(),
        email:     email.trim(),
      }, { merge: true });
      showMessage('Profile updated successfully.');
    } catch (err) {
      console.log('Profile update error:', err.code, err.message);
      showMessage('Update failed. Please try again.', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword) {
      showMessage('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showMessage('New password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match.', 'error');
      return;
    }
    try {
      const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password updated successfully.');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showMessage('Current password is incorrect.', 'error');
      } else {
        showMessage('Password update failed. Please try again.', 'error');
      }
    }
  };

  const confirmDeleteAccount = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to delete your account?\n\nThis will permanently remove your account and all your data. This cannot be undone.'
      );
      if (confirmed) handleDeleteAccount();
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account?\n\nThis will permanently remove your account and all your data. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Delete', style: 'destructive', onPress: handleDeleteAccount },
        ]
      );
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      navigation.navigate('Home');
    } catch (err) {
      showMessage(
        err.code === 'auth/requires-recent-login'
          ? 'Please log out and log in again to delete your account.'
          : 'Account deletion failed.',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'My Profile';
  const initials = firstName?.[0] || user?.email?.[0] || '?';

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="Profile" />

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <View style={styles.heroAvatar}>
          <Text style={styles.heroAvatarText}>{initials.toUpperCase()}</Text>
        </View>
        <Text style={styles.heroName}>{displayName}</Text>
        <Text style={styles.heroEmail}>{user?.email}</Text>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Durham Resident</Text>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {[
          { key: 'profile', label: '⚙️ Account Settings' },
          { key: 'reports', label: `📋 My Reports${reports.length > 0 ? ` (${reports.length})` : ''}` },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(t.key)}>
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.body, isWide && styles.bodyWide]}>

        {/* ── Inline feedback ── */}
        {message ? (
          <View style={[styles.feedback, messageType === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
            <Text style={[styles.feedbackText, messageType === 'error' ? styles.feedbackTextError : styles.feedbackTextSuccess]}>
              {messageType === 'success' ? '✅ ' : '⚠️ '}{message}
            </Text>
          </View>
        ) : null}

        {/* ════════ ACCOUNT SETTINGS TAB ════════ */}
        {activeTab === 'profile' && (
          <>
            {/* Personal Info card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>👤</Text>
                <View>
                  <Text style={styles.cardTitle}>Personal Information</Text>
                  <Text style={styles.cardSubtitle}>Update your name, email, and phone</Text>
                </View>
              </View>

              <View style={[styles.row, isWide && styles.rowWide]}>
                <View style={[styles.field, isWide && { flex: 1 }]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                  />
                </View>
                <View style={[styles.field, isWide && { flex: 1 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Phone Number <Text style={styles.optional}>(optional)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="e.g. 919-555-0100"
                />
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdate}>
                <Text style={styles.primaryBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>

            {/* Security card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🔒</Text>
                <View>
                  <Text style={styles.cardTitle}>Change Password</Text>
                  <Text style={styles.cardSubtitle}>Your current password is required to make changes</Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="Enter your current password"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Min. 8 characters"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Re-enter new password"
                />
              </View>

              <TouchableOpacity style={styles.secondaryBtn} onPress={handlePasswordChange}>
                <Text style={styles.secondaryBtnText}>Update Password</Text>
              </TouchableOpacity>
            </View>

            {/* Danger zone card */}
            <View style={[styles.card, styles.dangerCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>⚠️</Text>
                <View>
                  <Text style={[styles.cardTitle, { color: '#C62828' }]}>Delete Account</Text>
                  <Text style={styles.cardSubtitle}>Permanently removes your account and all data</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={confirmDeleteAccount}>
                <Text style={styles.deleteBtnText}>Delete My Account</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ════════ REPORTS TAB ════════ */}
        {activeTab === 'reports' && (
          <>
            {reportsLoading ? (
              <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
            ) : reports.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No reports yet</Text>
                <Text style={styles.emptyText}>
                  When you submit a housing report, it will appear here with its current status.
                </Text>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('Report')}>
                  <Text style={styles.primaryBtnText}>File a Report →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              reports.map(report => {
                const status = report.status || 'pending';
                const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
                const date = report.createdAt?.toDate
                  ? report.createdAt.toDate().toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                  : '—';
                return (
                  <View key={report.id} style={styles.reportCard}>
                    <View style={styles.reportCardTop}>
                      <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                        <Text style={[styles.statusText, { color: colors.text }]}>
                          {STATUS_LABELS[status] || status}
                        </Text>
                      </View>
                      <Text style={styles.reportDate}>{date}</Text>
                    </View>

                    <Text style={styles.reportType}>
                      {report.housingIssueType || 'Housing Issue'}
                    </Text>

                    {report.discriminationBasis ? (
                      <View style={styles.reportTagRow}>
                        <View style={styles.reportTag}>
                          <Text style={styles.reportTagText}>Basis: {report.discriminationBasis}</Text>
                        </View>
                      </View>
                    ) : null}

                    <Text style={styles.reportDescription} numberOfLines={3}>
                      {report.description}
                    </Text>

                    {report.desiredResolution ? (
                      <View style={styles.resolutionBox}>
                        <Text style={styles.resolutionLabel}>DESIRED RESOLUTION</Text>
                        <Text style={styles.resolutionText}>{report.desiredResolution}</Text>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={styles.scheduleCallBtn}
                      onPress={() => navigation.navigate('ScheduleCall', {
                        reportId: report.id,
                        reportType: report.housingIssueType,
                      })}>
                      <Text style={styles.scheduleCallText}>📞 Schedule a Call About This Report</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Hero
  hero: {
    backgroundColor: '#1B5E20',
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroAvatarText: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  heroName:       { fontSize: fontSize.h2, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroEmail:      { fontSize: fontSize.body, color: 'rgba(255,255,255,0.75)', marginBottom: 12 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBadgeText: { fontSize: fontSize.caption, color: '#fff', fontWeight: '600' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    paddingHorizontal: 20,
  },
  tabBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 4,
  },
  tabBtnActive: { borderBottomColor: '#2E7D32' },
  tabText:      { fontSize: fontSize.body, color: '#888', fontWeight: '500' },
  tabTextActive:{ color: '#2E7D32', fontWeight: 'bold' },

  body:     { padding: 20, maxWidth: 860, alignSelf: 'center', width: '100%' },
  bodyWide: { paddingHorizontal: 32 },

  // Feedback banner
  feedback: { padding: 14, borderRadius: 10, marginBottom: 16, borderWidth: 1 },
  feedbackSuccess:     { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  feedbackError:       { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' },
  feedbackText:        { fontSize: fontSize.body, textAlign: 'center', fontWeight: '500' },
  feedbackTextSuccess: { color: '#2E7D32' },
  feedbackTextError:   { color: '#C62828' },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dangerCard:   { borderColor: '#FFCDD2' },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  cardIcon:     { fontSize: 28 },
  cardTitle:    { fontSize: fontSize.h4, fontWeight: 'bold', color: '#1a1a1a' },
  cardSubtitle: { fontSize: fontSize.caption, color: '#888', marginTop: 2 },

  // Form
  row:      { gap: 12 },
  rowWide:  { flexDirection: 'row', gap: 16 },
  field:    { marginBottom: 16 },
  label:    { fontSize: fontSize.label, fontWeight: '600', color: '#444', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#aaa' },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fontSize.input,
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
  },

  inputReadOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  inputReadOnlyText:  { fontSize: fontSize.input, color: '#666', flex: 1 },
  inputReadOnlyBadge: { fontSize: fontSize.tiny, color: '#2E7D32', fontWeight: 'bold', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  fieldHint: { fontSize: fontSize.tiny, color: '#aaa', marginTop: 5 },

  // Buttons
  primaryBtn:      { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  primaryBtnText:  { color: '#fff', fontWeight: 'bold', fontSize: fontSize.button },
  secondaryBtn:    { backgroundColor: '#37474F', padding: 14, borderRadius: 10, alignItems: 'center' },
  secondaryBtnText:{ color: '#fff', fontWeight: 'bold', fontSize: fontSize.button },
  deleteBtn:       { backgroundColor: '#D32F2F', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  deleteBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: fontSize.button },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon:  { fontSize: 52 },
  emptyTitle: { fontSize: fontSize.h3, fontWeight: 'bold', color: '#333' },
  emptyText:  { fontSize: fontSize.body, color: '#777', textAlign: 'center', maxWidth: 320, lineHeight: 24 },

  // Report cards
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reportCardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reportType:       { fontSize: fontSize.h4, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  reportDate:       { fontSize: fontSize.caption, color: '#999' },
  statusBadge:      { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusText:       { fontSize: fontSize.caption, fontWeight: 'bold' },
  reportTagRow:     { flexDirection: 'row', marginBottom: 10 },
  reportTag:        { backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  reportTagText:    { fontSize: fontSize.caption, color: '#2E7D32', fontWeight: '600' },
  reportDescription:{ fontSize: fontSize.body, color: '#444', lineHeight: 24, marginBottom: 12 },
  resolutionBox:    { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#2E7D32' },
  resolutionLabel:  { fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 1, marginBottom: 4 },
  resolutionText:   { fontSize: fontSize.small, color: '#555', lineHeight: 20 },
  scheduleCallBtn:  { borderWidth: 1.5, borderColor: '#2E7D32', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 4 },
  scheduleCallText: { fontSize: fontSize.small, color: '#2E7D32', fontWeight: '600' },
});
