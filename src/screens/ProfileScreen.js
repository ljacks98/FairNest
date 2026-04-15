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
  Linking,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { updatePassword, deleteUser } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { COLORS } from '../utils/constants';
import { font } from '../theme/typography';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  pending: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
  reviewed: { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
  resolved: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
};
const STATUS_LABELS = {
  pending: 'Pending',
  reviewed: 'Under Review',
  resolved: 'Resolved',
};

const CALL_TYPE_LABELS = {
  advocate: '⚖️ Advocate Call',
  legal: '🏛️ Legal Consultation',
};

export default function ProfileScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [activeTab, setActiveTab] = useState('profile');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [calls, setCalls] = useState([]);
  const [callsLoading, setCallsLoading] = useState(true);

  // Hover states
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredSave, setHoveredSave] = useState(false);
  const [hoveredPassword, setHoveredPassword] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState(false);
  const [hoveredSchedule, setHoveredSchedule] = useState(null);
  const [hoveredEmptyBtn, setHoveredEmptyBtn] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [expandedCall, setExpandedCall] = useState(null);

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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
        if (storedPhone.includes('@')) {
          await updateDoc(doc(db, 'users', user.uid), { phone: '' });
        }
      } else {
        setEmail(user.email || '');
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const fetchReports = async () => {
    if (!user) {
      setReports([]);
      setReportsLoading(false);
      return;
    }

    setReportsLoading(true);
    try {
      const q = query(
        collection(db, 'reports'),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      );
      setReports(docs);
    } catch (err) {
      console.log(err);
    }
    setReportsLoading(false);
  };

  const fetchCalls = async () => {
    if (!user) {
      setCalls([]);
      setCallsLoading(false);
      return;
    }

    setCallsLoading(true);
    try {
      const q = query(
        collection(db, 'callRequests'),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      );
      setCalls(docs);
    } catch (err) {
      console.log(err);
    }
    setCallsLoading(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchReports();
    fetchCalls();
  }, [user]);

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
      fetchReports();
      fetchCalls();
      if (route?.params?.initialTab) {
        setActiveTab(route.params.initialTab);
      }
    });

    return unsubscribe;
  }, [navigation, route?.params?.initialTab, user]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUpdate = async () => {
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        { merge: true }
      );
      showMessage('Profile updated successfully.');
    } catch (err) {
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
      const { EmailAuthProvider, reauthenticateWithCredential } =
        await import('firebase/auth');
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Password updated successfully.');
    } catch (err) {
      showMessage(
        err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential'
          ? 'Current password is incorrect.'
          : 'Password update failed. Please try again.',
        'error'
      );
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
        'Are you sure you want to delete your account?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Delete',
            style: 'destructive',
            onPress: handleDeleteAccount,
          },
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getFileNameFromUrl = (url) => {
    try {
      const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
      return path.split('/').pop();
    } catch {
      return 'Evidence File';
    }
  };

  const displayName =
    [firstName, lastName].filter(Boolean).join(' ') || 'My Profile';
  const initials = firstName?.[0] || user?.email?.[0] || '?';

  const TABS = [
    { key: 'profile', emoji: '⚙️', label: 'Account' },
    {
      key: 'reports',
      emoji: '📋',
      label: `Reports${reports.length > 0 ? ` (${reports.length})` : ''}`,
    },
    {
      key: 'calls',
      emoji: '📞',
      label: `Calls${calls.length > 0 ? ` (${calls.length})` : ''}`,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Navbar navigation={navigation} currentRoute="Profile" />

      {/* ── Modern Hero ── */}
      <View style={styles.heroWrap}>
        {/* Decorative rings */}
        <View style={styles.ring1} />
        <View style={styles.ring2} />
        <View style={styles.ring3} />

        <View style={styles.heroContent}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{initials.toUpperCase()}</Text>
          </View>
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>DURHAM RESIDENT</Text>
          </View>
        </View>
      </View>

      {/* ── Tab Bar ── */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.tabBtn,
              activeTab === t.key && styles.tabBtnActive,
              activeTab !== t.key && hoveredTab === t.key && styles.tabBtnHover,
            ]}
            onPress={() => setActiveTab(t.key)}
            onMouseEnter={() => setHoveredTab(t.key)}
            onMouseLeave={() => setHoveredTab(null)}
            activeOpacity={0.7}>
            <Text style={styles.tabEmoji}>{t.emoji}</Text>
            <Text
              style={[
                styles.tabText,
                activeTab === t.key && styles.tabTextActive,
              ]}>
              {t.label}
            </Text>
            {activeTab === t.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.body, isWide && styles.bodyWide]}>
        {/* ── Feedback banner ── */}
        {message ? (
          <View
            style={[
              styles.feedback,
              messageType === 'error'
                ? styles.feedbackError
                : styles.feedbackSuccess,
            ]}>
            <Text
              style={[
                styles.feedbackText,
                messageType === 'error'
                  ? styles.feedbackTextError
                  : styles.feedbackTextSuccess,
              ]}>
              {messageType === 'success' ? '✅ ' : '⚠️ '}
              {message}
            </Text>
          </View>
        ) : null}

        {/* ════════ ACCOUNT TAB ════════ */}
        {activeTab === 'profile' && (
          <>
            <View style={styles.card}>
              <View style={styles.cardAccent} />
              <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrap}>
                    <Text style={styles.cardIconEmoji}>👤</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Personal Information</Text>
                    <Text style={styles.cardSubtitle}>
                      Update your name, email, and phone
                    </Text>
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
                      placeholderTextColor="#bbb"
                    />
                  </View>
                  <View style={[styles.field, isWide && { flex: 1 }]}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Last name"
                      placeholderTextColor="#bbb"
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
                    placeholderTextColor="#bbb"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Phone <Text style={styles.optional}>(optional)</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="e.g. 919-555-0100"
                    placeholderTextColor="#bbb"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    hoveredSave && styles.primaryBtnHover,
                  ]}
                  onPress={handleUpdate}
                  onMouseEnter={() => setHoveredSave(true)}
                  onMouseLeave={() => setHoveredSave(false)}
                  activeOpacity={0.7}>
                  <Text style={styles.primaryBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardAccent} />
              <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconWrap}>
                    <Text style={styles.cardIconEmoji}>🔒</Text>
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Change Password</Text>
                    <Text style={styles.cardSubtitle}>
                      Your current password is required
                    </Text>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Current Password</Text>
                  <TextInput
                    style={styles.input}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
                    placeholder="Enter current password"
                    placeholderTextColor="#bbb"
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
                    placeholderTextColor="#bbb"
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
                    placeholderTextColor="#bbb"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.secondaryBtn,
                    hoveredPassword && styles.secondaryBtnHover,
                  ]}
                  onPress={handlePasswordChange}
                  onMouseEnter={() => setHoveredPassword(true)}
                  onMouseLeave={() => setHoveredPassword(false)}
                  activeOpacity={0.7}>
                  <Text style={styles.secondaryBtnText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.card, styles.dangerCard]}>
              <View
                style={[styles.cardAccent, { backgroundColor: '#D32F2F' }]}
              />
              <View style={styles.cardInner}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.cardIconWrap,
                      { backgroundColor: '#FFEBEE' },
                    ]}>
                    <Text style={styles.cardIconEmoji}>⚠️</Text>
                  </View>
                  <View>
                    <Text style={[styles.cardTitle, { color: '#C62828' }]}>
                      Delete Account
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      Permanently removes your account and all data
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.deleteBtn,
                    hoveredDelete && styles.deleteBtnHover,
                  ]}
                  onPress={confirmDeleteAccount}
                  onMouseEnter={() => setHoveredDelete(true)}
                  onMouseLeave={() => setHoveredDelete(false)}
                  activeOpacity={0.7}>
                  <Text style={styles.deleteBtnText}>Delete My Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ════════ REPORTS TAB ════════ */}
        {activeTab === 'reports' && (
          <>
            {reportsLoading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginTop: 40 }}
              />
            ) : reports.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No reports yet</Text>
                <Text style={styles.emptyText}>
                  When you submit a housing report, it will appear here with its
                  status.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    hoveredEmptyBtn === 'report' && styles.primaryBtnHover,
                  ]}
                  onPress={() => navigation.navigate('Report')}
                  onMouseEnter={() => setHoveredEmptyBtn('report')}
                  onMouseLeave={() => setHoveredEmptyBtn(null)}
                  activeOpacity={0.7}>
                  <Text style={styles.primaryBtnText}>File a Report →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              reports.map((report) => {
                const status = report.status || 'pending';
                const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
                const expanded = expandedReport === report.id;
                const date = report.createdAt?.toDate
                  ? report.createdAt.toDate().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';
                return (
                  <View key={report.id} style={styles.reportCard}>
                    <View style={[styles.reportAccent, { backgroundColor: colors.text }]} />
                    <View style={styles.reportBody}>
                      {/* Header row — tap to expand */}
                      <TouchableOpacity
                        style={styles.reportHeader}
                        onPress={() => setExpandedReport(expanded ? null : report.id)}
                        activeOpacity={0.7}>
                        <View style={styles.reportHeaderLeft}>
                          <Text style={styles.reportType}>
                            {report.housingIssueType || 'Housing Issue'}
                          </Text>
                          <Text style={styles.reportMeta}>
                            {date}
                            {report.discriminationBasis ? `  ·  ${report.discriminationBasis}` : ''}
                          </Text>
                        </View>
                        <View style={styles.reportHeaderRight}>
                          <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                            <Text style={[styles.statusText, { color: colors.text }]}>
                              {STATUS_LABELS[status] || status}
                            </Text>
                          </View>
                          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Expanded detail */}
                      {expanded && (
                        <View style={styles.reportDetail}>
                          <View style={styles.detailDivider} />

                          <Text style={styles.detailLabel}>Description</Text>
                          <Text style={styles.detailText}>{report.description || '—'}</Text>

                          {report.incidentDate ? (
                            <>
                              <Text style={styles.detailLabel}>Incident Date</Text>
                              <Text style={styles.detailText}>{report.incidentDate}</Text>
                            </>
                          ) : null}

                          {report.witnesses && report.witnesses !== 'No' ? (
                            <>
                              <Text style={styles.detailLabel}>Witnesses</Text>
                              <Text style={styles.detailText}>
                                {report.witnessNames && report.witnessNames.trim()
                                  ? report.witnessNames
                                  : 'Witness indicated — no names provided'}
                              </Text>
                            </>
                          ) : null}

                          <Text style={styles.detailLabel}>Evidence Files</Text>
                          {report.evidenceUrls && report.evidenceUrls.length > 0 ? (
                            <View style={styles.evidenceRow}>
                              {report.evidenceUrls.map((url, i) => (
                                <TouchableOpacity
                                  key={i}
                                  style={styles.evidenceBtn}
                                  onPress={() => Linking.openURL(url)}>
                                  <Text style={styles.evidenceBtnText}>
                                    📎 {getFileNameFromUrl(url)}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : (
                            <Text style={styles.detailText}>No files attached</Text>
                          )}

                          {report.desiredResolution ? (
                            <>
                              <Text style={styles.detailLabel}>Desired Resolution</Text>
                              <Text style={styles.detailText}>{report.desiredResolution}</Text>
                            </>
                          ) : null}

                          {report.contactInfo ? (
                            <>
                              <Text style={styles.detailLabel}>Contact Info</Text>
                              <Text style={styles.detailText}>{report.contactInfo}</Text>
                            </>
                          ) : null}

                          <TouchableOpacity
                            style={[
                              styles.scheduleCallBtn,
                              hoveredSchedule === report.id && styles.scheduleCallBtnHover,
                            ]}
                            onPress={() => navigation.navigate('ScheduleCall', {
                              reportId: report.id,
                              reportType: report.housingIssueType,
                            })}
                            onMouseEnter={() => setHoveredSchedule(report.id)}
                            onMouseLeave={() => setHoveredSchedule(null)}
                            activeOpacity={0.7}>
                            <Text style={[
                              styles.scheduleCallText,
                              hoveredSchedule === report.id && styles.scheduleCallTextHover,
                            ]}>
                              📞 Schedule a Call About This Report
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ════════ CALLS TAB ════════ */}
        {activeTab === 'calls' && (
          <>
            {callsLoading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginTop: 40 }}
              />
            ) : calls.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📞</Text>
                <Text style={styles.emptyTitle}>No calls scheduled</Text>
                <Text style={styles.emptyText}>
                  When you book a consultation with an advocate or attorney, it
                  will appear here.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    hoveredEmptyBtn === 'call' && styles.primaryBtnHover,
                  ]}
                  onPress={() => navigation.navigate('ScheduleCall')}
                  onMouseEnter={() => setHoveredEmptyBtn('call')}
                  onMouseLeave={() => setHoveredEmptyBtn(null)}
                  activeOpacity={0.7}>
                  <Text style={styles.primaryBtnText}>Book a Call →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              calls.map((call) => {
                const status = call.status || 'pending';
                const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
                const expanded = expandedCall === call.id;
                const date = call.createdAt?.toDate
                  ? call.createdAt.toDate().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';
                return (
                  <View key={call.id} style={styles.callCard}>
                    {/* Header row — tap to expand */}
                    <TouchableOpacity
                      style={styles.reportHeader}
                      onPress={() => setExpandedCall(expanded ? null : call.id)}
                      activeOpacity={0.7}>
                      <View style={styles.reportHeaderLeft}>
                        <Text style={styles.callTypeLabel}>
                          {CALL_TYPE_LABELS[call.callType] || '📞 Call Request'}
                        </Text>
                        <Text style={styles.reportMeta}>{date}</Text>
                      </View>
                      <View style={styles.reportHeaderRight}>
                        <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                          <Text style={[styles.statusText, { color: colors.text }]}>
                            {STATUS_LABELS[status] || status}
                          </Text>
                        </View>
                        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Expanded detail */}
                    {expanded && (
                      <View style={styles.reportDetail}>
                        <View style={styles.detailDivider} />
                        <View style={styles.callDetailGrid}>
                          {call.preferredDate ? (
                            <View style={styles.callDetailItem}>
                              <Text style={styles.callDetailLabel}>📅 Preferred Date</Text>
                              <Text style={styles.callDetailValue}>{call.preferredDate}</Text>
                            </View>
                          ) : null}
                          {call.timeSlot ? (
                            <View style={styles.callDetailItem}>
                              <Text style={styles.callDetailLabel}>🕐 Time Slot</Text>
                              <Text style={styles.callDetailValue}>{call.timeSlot}</Text>
                            </View>
                          ) : null}
                          {call.phone ? (
                            <View style={styles.callDetailItem}>
                              <Text style={styles.callDetailLabel}>📱 Contact</Text>
                              <Text style={styles.callDetailValue}>{call.phone}</Text>
                            </View>
                          ) : null}
                        </View>
                        {call.notes ? (
                          <View style={styles.callNotesBox}>
                            <Text style={styles.callNotesLabel}>NOTES</Text>
                            <Text style={styles.callNotesText}>{call.notes}</Text>
                          </View>
                        ) : null}
                        {call.reportId ? (
                          <View style={styles.callLinkedBadge}>
                            <Text style={styles.callLinkedText}>📋 Linked to a submitted report</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
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
  container: { flex: 1, backgroundColor: COLORS.greenTint },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Hero ────────────────────────────────────────────────────────────────
  heroWrap: {
    backgroundColor: COLORS.primaryDeep,
    overflow: 'hidden',
    paddingTop: 48,
    paddingBottom: 48,
    alignItems: 'center',
    position: 'relative',
  },
  ring1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 50,
    borderColor: 'rgba(255,255,255,0.05)',
    top: -150,
    right: -120,
  },
  ring2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 40,
    borderColor: 'rgba(255,255,255,0.04)',
    bottom: -80,
    left: -60,
  },
  ring3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 30,
    borderColor: 'rgba(255,255,255,0.04)',
    top: 20,
    left: 40,
  },
  heroContent: { alignItems: 'center', zIndex: 1 },
  heroAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroAvatarText: { fontSize: 36, ...font.extra, color: '#fff' },
  heroName: {
    fontSize: 22,
    ...font.extra,
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroEmail: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.amber,
  },
  heroBadgeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    ...font.bold,
    letterSpacing: 1.5,
  },

  // ── Tab Bar ──────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    position: 'relative',
  },
  tabBtnActive: {},
  tabBtnHover: { backgroundColor: COLORS.greenTint },
  tabEmoji: { fontSize: 15 },
  tabText: { fontSize: 13, color: '#999', ...font.regular },
  tabTextActive: { color: COLORS.primaryDeep, ...font.bold },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primaryDeep,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  body: { padding: 20, maxWidth: 860, alignSelf: 'center', width: '100%' },
  bodyWide: { paddingHorizontal: 32 },

  // ── Feedback ──────────────────────────────────────────────────────────────
  feedback: { padding: 14, borderRadius: 10, marginBottom: 16, borderWidth: 1 },
  feedbackSuccess: { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  feedbackError: { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' },
  feedbackText: { fontSize: 14, textAlign: 'center', ...font.regular },
  feedbackTextSuccess: { color: '#2E7D32' },
  feedbackTextError: { color: '#C62828' },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: COLORS.primaryDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dangerCard: { borderColor: '#FFCDD2' },
  cardAccent: { width: 5, backgroundColor: COLORS.primary },
  cardInner: { flex: 1, padding: 22 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 16, ...font.bold, color: '#1a1a1a' },
  cardSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },

  // ── Form ──────────────────────────────────────────────────────────────────
  row: { gap: 12 },
  rowWide: { flexDirection: 'row', gap: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, ...font.semi, color: '#555', marginBottom: 7 },
  optional: { ...font.regular, color: '#bbb' },
  input: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: COLORS.greenTint,
    color: '#1a1a1a',
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: COLORS.primaryDeep,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnHover: { backgroundColor: '#163d18' },
  primaryBtnText: { color: '#fff', ...font.extra, fontSize: 14 },
  secondaryBtn: {
    backgroundColor: '#37474F',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnHover: { backgroundColor: '#263238' },
  secondaryBtnText: { color: '#fff', ...font.bold, fontSize: 14 },
  deleteBtn: {
    backgroundColor: '#D32F2F',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteBtnHover: { backgroundColor: '#b71c1c' },
  deleteBtnText: { color: '#fff', ...font.bold, fontSize: 14 },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 20, ...font.bold, color: '#333' },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },

  // ── Report cards ──────────────────────────────────────────────────────────
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reportAccent: { width: 5 },
  reportBody: { flex: 1, padding: 18 },
  reportCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportType: {
    fontSize: 16,
    ...font.bold,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  reportDate: { fontSize: 12, color: '#999' },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, ...font.bold },
  reportTagRow: { flexDirection: 'row', marginBottom: 10 },
  reportTag: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reportTagText: { fontSize: 12, color: '#2E7D32', ...font.semi },
  reportDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  resolutionBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  resolutionLabel: {
    fontSize: 10,
    ...font.bold,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  resolutionText: { fontSize: 13, color: '#555', lineHeight: 20 },
  scheduleCallBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  scheduleCallBtnHover: { backgroundColor: COLORS.primary },
  scheduleCallText: { fontSize: 13, color: COLORS.primary, ...font.semi },
  scheduleCallTextHover: { color: '#fff' },

  // ── Call cards ────────────────────────────────────────────────────────────
  callCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
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
  callCardTop: { marginBottom: 14 },
  callTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  callTypeLabel: { fontSize: 16, ...font.bold, color: '#1a1a1a' },
  callDate: { fontSize: 12, color: '#999' },
  callDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  callDetailItem: {
    backgroundColor: COLORS.greenTint,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 130,
  },
  callDetailLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  callDetailValue: { fontSize: 13, ...font.semi, color: '#1a1a1a' },
  callNotesBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  callNotesLabel: {
    fontSize: 10,
    ...font.bold,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  callNotesText: { fontSize: 13, color: '#555', lineHeight: 20 },
  callLinkedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  callLinkedText: { fontSize: 12, color: '#2E7D32', ...font.semi },

  // ── Expandable report / call header ───────────────────────────────────────
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  reportHeaderLeft: { flex: 1, paddingRight: 12 },
  reportHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  reportMeta: { fontSize: 12, color: '#999', marginTop: 3 },
  chevron: { fontSize: 11, color: '#999' },

  // ── Expanded detail area ──────────────────────────────────────────────────
  reportDetail: { paddingTop: 4 },
  detailDivider: { height: 1, backgroundColor: '#eee', marginVertical: 14 },
  detailLabel: {
    fontSize: 11,
    ...font.bold,
    color: '#888',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 12,
  },
  detailText: { fontSize: 14, color: '#444', lineHeight: 21 },

  // ── Evidence file buttons ─────────────────────────────────────────────────
  evidenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  evidenceBtn: {
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#CE93D8',
  },
  evidenceBtnText: { fontSize: 13, color: '#7B1FA2', ...font.semi },
});
