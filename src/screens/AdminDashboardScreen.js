import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Linking,
  Platform,
} from 'react-native';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Group flat chatLog messages into per-user conversations
function groupByUser(logs) {
  const map = {};
  for (const log of logs) {
    const uid = log.userId || 'unknown';
    if (!map[uid]) {
      map[uid] = {
        userId: uid,
        userEmail: log.userEmail || uid,
        messages: [],
        lastTimestamp: null,
      };
    }
    map[uid].messages.push(log);
    if (
      !map[uid].lastTimestamp ||
      log.timestamp?.toDate?.() > map[uid].lastTimestamp
    ) {
      map[uid].lastTimestamp = log.timestamp?.toDate?.() || null;
    }
  }
  // Sort messages within each user by timestamp
  return Object.values(map)
    .map((u) => ({
      ...u,
      messages: u.messages.sort((a, b) => {
        const ta = a.timestamp?.toDate?.() || 0;
        const tb = b.timestamp?.toDate?.() || 0;
        return ta - tb;
      }),
    }))
    .sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));
}

const STATUS_OPTIONS = ['pending', 'reviewed', 'resolved'];

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

function sanitizePhoneNumber(value) {
  return (value || '').replace(/\D/g, '');
}

export default function AdminDashboardScreen({ navigation }) {
  const { user, isAdmin } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isWebPlatform = Platform.OS === 'web';

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'conversations'

  // Reports state
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [convoLoading, setConvoLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);

  // Call requests state
  const [callRequests, setCallRequests] = useState([]);
  const [callLoading, setCallLoading] = useState(false);
  const [expandedCall, setExpandedCall] = useState(null);
  const [updatingCall, setUpdatingCall] = useState(null);
  const [contactFeedback, setContactFeedback] = useState({});

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    fetchReports();
  }, [user, isAdmin]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!user || !isAdmin) return;

      fetchReports();
      if (activeTab === 'conversations') fetchConversations();
      if (activeTab === 'calls') fetchCallRequests();
    });

    return unsubscribe;
  }, [activeTab, isAdmin, navigation, user]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const updateStatus = async (reportId, newStatus) => {
    setUpdating(reportId);
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: newStatus });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.log(err);
    }
    setUpdating(null);
  };

  const fetchConversations = async () => {
    setConvoLoading(true);
    try {
      const q = query(collection(db, 'chatLogs'), orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);
      const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setConversations(groupByUser(logs));
    } catch (err) {
      console.log('chatLogs fetch error:', err);
    }
    setConvoLoading(false);
  };

  const fetchCallRequests = async () => {
    setCallLoading(true);
    try {
      const q = query(
        collection(db, 'callRequests'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setCallRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.log('callRequests fetch error:', err);
    }
    setCallLoading(false);
  };

  const updateCallStatus = async (callId, newStatus) => {
    setUpdatingCall(callId);
    try {
      await updateDoc(doc(db, 'callRequests', callId), { status: newStatus });
      setCallRequests((prev) =>
        prev.map((c) => (c.id === callId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.log(err);
    }
    setUpdatingCall(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'reports') fetchReports();
    if (tab === 'conversations') fetchConversations();
    if (tab === 'calls') fetchCallRequests();
  };

  const setContactFeedbackMessage = (callId, text) => {
    setContactFeedback((prev) => ({ ...prev, [callId]: text }));

    setTimeout(() => {
      setContactFeedback((prev) => {
        const next = { ...prev };
        delete next[callId];
        return next;
      });
    }, 2500);
  };

  const handleCallUser = async (call) => {
    const phoneNumber = sanitizePhoneNumber(call.phone);
    if (!phoneNumber) return;

    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (err) {
      console.log('call open error:', err);
      setContactFeedbackMessage(
        call.id,
        'Unable to open a calling app on this device.'
      );
    }
  };

  const handleSmsUser = async (call) => {
    const phoneNumber = sanitizePhoneNumber(call.phone);
    if (!phoneNumber) return;

    try {
      await Linking.openURL(
        `sms:${phoneNumber}` +
          `?body=Hello, this is FairNest. We're confirming your ${call.callType === 'legal' ? 'legal consultation' : 'advocate call'} request. [Add details here]`
      );
    } catch (err) {
      console.log('sms open error:', err);
      setContactFeedbackMessage(
        call.id,
        'Unable to open the texting app on this device.'
      );
    }
  };

  const handleCopyNumber = async (call) => {
    if (!call.phone) return;

    try {
      if (globalThis.navigator?.clipboard?.writeText) {
        await globalThis.navigator.clipboard.writeText(call.phone);
        setContactFeedbackMessage(call.id, 'Phone number copied.');
        return;
      }

      setContactFeedbackMessage(
        call.id,
        'Clipboard copy is not available in this browser.'
      );
    } catch (err) {
      console.log('clipboard copy error:', err);
      setContactFeedbackMessage(call.id, 'Could not copy the phone number.');
    }
  };

  const filtered =
    filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  // Stats
  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    reviewed: reports.filter((r) => r.status === 'reviewed').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  };

  if (!user || !isAdmin) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="AdminDashboard" />

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>ADMIN</Text>
          <Text style={styles.heroTitle}>Dashboard</Text>
          <Text style={styles.heroSub}>
            This page is only available to signed-in admins.
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Admin access required.</Text>
            <Text style={styles.emptySubText}>
              If you were just promoted, sign out and sign back in to refresh
              your access token.
            </Text>
            {!user ? (
              <TouchableOpacity
                style={[styles.tabBtn, { alignSelf: 'center', marginTop: 16 }]}
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.tabText}>Go to Login</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="AdminDashboard" />

      {/* Header */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>ADMIN</Text>
        <Text style={styles.heroTitle}>Dashboard</Text>
        <Text style={styles.heroSub}>
          Review reports and monitor AI conversations from all users.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'reports' && styles.tabBtnActive,
          ]}
          onPress={() => handleTabChange('reports')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'reports' && styles.tabTextActive,
            ]}>
            📋 Reports {reports.length > 0 ? `(${reports.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'conversations' && styles.tabBtnActive,
          ]}
          onPress={() => handleTabChange('conversations')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'conversations' && styles.tabTextActive,
            ]}>
            💬 AI Conversations{' '}
            {conversations.length > 0 ? `(${conversations.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'calls' && styles.tabBtnActive]}
          onPress={() => handleTabChange('calls')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'calls' && styles.tabTextActive,
            ]}>
            📞 Call Requests{' '}
            {callRequests.length > 0 ? `(${callRequests.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* ── CONVERSATIONS TAB ── */}
        {activeTab === 'conversations' &&
          (convoLoading ? (
            <ActivityIndicator
              size="large"
              color="#2E7D32"
              style={{ marginTop: 40 }}
            />
          ) : conversations.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No conversations yet.</Text>
              <Text style={styles.emptySubText}>
                Chats will appear here once users start using the AI Assistant.
              </Text>
            </View>
          ) : (
            conversations.map((convo) => {
              const isOpen = expandedUser === convo.userId;
              const lastMsg = convo.messages[convo.messages.length - 1];
              const lastTime = convo.lastTimestamp
                ? convo.lastTimestamp.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—';
              const userMsgs = convo.messages.filter(
                (m) => m.sender === 'user'
              ).length;

              return (
                <View key={convo.userId} style={styles.convoCard}>
                  <TouchableOpacity
                    style={styles.convoHeader}
                    onPress={() =>
                      setExpandedUser(isOpen ? null : convo.userId)
                    }>
                    <View style={styles.convoAvatar}>
                      <Text style={styles.convoAvatarText}>
                        {(convo.userEmail?.[0] || '?').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.convoHeaderInfo}>
                      <Text style={styles.convoEmail}>{convo.userEmail}</Text>
                      <Text style={styles.convoMeta}>
                        {userMsgs} message{userMsgs !== 1 ? 's' : ''} · Last
                        active {lastTime}
                      </Text>
                      {!isOpen && lastMsg && (
                        <Text style={styles.convoPreview} numberOfLines={1}>
                          {lastMsg.sender === 'user' ? '👤' : '🤖'}{' '}
                          {lastMsg.text}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.convoMessages}>
                      <View style={styles.detailDivider} />
                      {convo.messages.map((msg, i) => {
                        const isUser = msg.sender === 'user';
                        const time = msg.timestamp?.toDate?.()
                          ? msg.timestamp.toDate().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '';
                        return (
                          <View
                            key={i}
                            style={[
                              styles.msgRow,
                              isUser && styles.msgRowUser,
                            ]}>
                            <View
                              style={[
                                styles.msgBubble,
                                isUser
                                  ? styles.msgBubbleUser
                                  : styles.msgBubbleAi,
                              ]}>
                              <Text
                                style={[
                                  styles.msgText,
                                  isUser && styles.msgTextUser,
                                ]}>
                                {msg.text}
                              </Text>
                              {time ? (
                                <Text
                                  style={[
                                    styles.msgTime,
                                    isUser && styles.msgTimeUser,
                                  ]}>
                                  {time}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          ))}

        {/* ── CALL REQUESTS TAB ── */}
        {activeTab === 'calls' &&
          (callLoading ? (
            <ActivityIndicator
              size="large"
              color="#2E7D32"
              style={{ marginTop: 40 }}
            />
          ) : callRequests.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No call requests yet.</Text>
              <Text style={styles.emptySubText}>
                Requests will appear here when users schedule a consultation.
              </Text>
            </View>
          ) : (
            callRequests.map((call) => {
              const isOpen = expandedCall === call.id;
              const status = call.status || 'pending';
              const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
              const date = call.createdAt?.toDate
                ? call.createdAt.toDate().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—';
              const typeLabel =
                call.callType === 'legal'
                  ? '🏛️ Legal Consultation'
                  : '⚖️ Advocate Call';

              return (
                <View key={call.id} style={styles.reportCard}>
                  <TouchableOpacity
                    style={styles.reportHeader}
                    onPress={() => setExpandedCall(isOpen ? null : call.id)}>
                    <View style={styles.reportHeaderLeft}>
                      <Text style={styles.reportType}>{typeLabel}</Text>
                      <Text style={styles.reportMeta}>
                        {call.userEmail} · Submitted {date}
                      </Text>
                    </View>
                    <View style={styles.reportHeaderRight}>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                          },
                        ]}>
                        <Text
                          style={[styles.badgeText, { color: colors.text }]}>
                          {STATUS_LABELS[status]}
                        </Text>
                      </View>
                      <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.reportDetail}>
                      <View style={styles.detailDivider} />

                      <Text style={styles.detailLabel}>Preferred Date</Text>
                      <Text style={styles.detailText}>
                        {call.preferredDate || '—'}
                      </Text>

                      <Text style={styles.detailLabel}>Preferred Time</Text>
                      <Text style={styles.detailText}>
                        {call.timeSlot || '—'}
                      </Text>

                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailText}>{call.phone || '—'}</Text>

                      {call.notes ? (
                        <>
                          <Text style={styles.detailLabel}>Notes</Text>
                          <Text style={styles.detailText}>{call.notes}</Text>
                        </>
                      ) : null}

                      {call.reportId ? (
                        <>
                          <Text style={styles.detailLabel}>Linked Report</Text>
                          <Text style={styles.detailText}>
                            {call.reportType || call.reportId}
                          </Text>
                        </>
                      ) : null}

                      {/* Contact user */}
                      <Text style={[styles.detailLabel, { marginTop: 16 }]}>
                        Contact User
                      </Text>
                      <View style={styles.contactRow}>
                        {call.userEmail ? (
                          <TouchableOpacity
                            style={styles.contactBtn}
                            onPress={() =>
                              Linking.openURL(
                                `mailto:${call.userEmail}` +
                                  `?subject=Your FairNest Call Request` +
                                  `&body=Hello,%0D%0A%0D%0AWe received your request for a ${call.callType === 'legal' ? 'legal consultation' : 'call with an advocate'}.%0D%0A%0D%0A[Add your message or confirm appointment details here]%0D%0A%0D%0ARegards,%0D%0AFairNest Team`
                              )
                            }>
                            <Text style={styles.contactBtnText}>
                              📧 Email User
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        {call.phone ? (
                          <TouchableOpacity
                            style={[styles.contactBtn, styles.contactBtnCall]}
                            onPress={() => handleCallUser(call)}>
                            <Text
                              style={[
                                styles.contactBtnText,
                                styles.contactBtnCallText,
                              ]}>
                              Call User
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        {isWebPlatform && call.phone ? (
                          <TouchableOpacity
                            style={[styles.contactBtn, styles.contactBtnCopy]}
                            onPress={() => handleCopyNumber(call)}>
                            <Text
                              style={[
                                styles.contactBtnText,
                                styles.contactBtnCopyText,
                              ]}>
                              Copy Number
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        {!isWebPlatform && call.phone ? (
                          <TouchableOpacity
                            style={[styles.contactBtn, styles.contactBtnSms]}
                            onPress={() => handleSmsUser(call)}>
                            <Text
                              style={[
                                styles.contactBtnText,
                                styles.contactBtnSmsText,
                              ]}>
                              💬 SMS User
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      {contactFeedback[call.id] ? (
                        <Text style={styles.contactFeedbackText}>
                          {contactFeedback[call.id]}
                        </Text>
                      ) : null}

                      <Text style={[styles.detailLabel, { marginTop: 16 }]}>
                        Update Status
                      </Text>
                      <View style={styles.statusButtons}>
                        {STATUS_OPTIONS.map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.statusBtn,
                              status === s && styles.statusBtnActive,
                              { borderColor: STATUS_COLORS[s].border },
                              status === s && {
                                backgroundColor: STATUS_COLORS[s].bg,
                              },
                            ]}
                            onPress={() => updateCallStatus(call.id, s)}
                            disabled={updatingCall === call.id}>
                            {updatingCall === call.id ? (
                              <ActivityIndicator size="small" color="#555" />
                            ) : (
                              <Text
                                style={[
                                  styles.statusBtnText,
                                  status === s && {
                                    color: STATUS_COLORS[s].text,
                                    fontWeight: 'bold',
                                  },
                                ]}>
                                {STATUS_LABELS[s]}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          ))}

        {/* ── REPORTS TAB ── */}
        {activeTab === 'reports' && (
          <>
            {/* Stats row */}
            <View style={[styles.statsRow, isWide && styles.statsRowWide]}>
              {[
                { key: 'all', label: 'Total', color: '#555' },
                { key: 'pending', label: 'Pending', color: '#F57F17' },
                { key: 'reviewed', label: 'Under Review', color: '#1565C0' },
                { key: 'resolved', label: 'Resolved', color: '#2E7D32' },
              ].map((s) => (
                <View key={s.key} style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: s.color }]}>
                    {counts[s.key]}
                  </Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
              {['all', 'pending', 'reviewed', 'resolved'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterBtn,
                    filter === f && styles.filterBtnActive,
                  ]}
                  onPress={() => setFilter(f)}>
                  <Text
                    style={[
                      styles.filterText,
                      filter === f && styles.filterTextActive,
                    ]}>
                    {f === 'all' ? 'All' : STATUS_LABELS[f]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reports list */}
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#2E7D32"
                style={{ marginTop: 40 }}
              />
            ) : filtered.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No reports found.</Text>
              </View>
            ) : (
              filtered.map((report) => {
                const status = report.status || 'pending';
                const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
                const expanded = expandedId === report.id;
                const date = report.createdAt?.toDate
                  ? report.createdAt.toDate().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';

                return (
                  <View key={report.id} style={styles.reportCard}>
                    {/* Card header */}
                    <TouchableOpacity
                      style={styles.reportHeader}
                      onPress={() =>
                        setExpandedId(expanded ? null : report.id)
                      }>
                      <View style={styles.reportHeaderLeft}>
                        <Text style={styles.reportType}>
                          {report.housingIssueType || 'Housing Issue'}
                        </Text>
                        <Text style={styles.reportMeta}>
                          {date}
                          {report.discriminationBasis
                            ? `  ·  ${report.discriminationBasis}`
                            : ''}
                        </Text>
                      </View>
                      <View style={styles.reportHeaderRight}>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                            },
                          ]}>
                          <Text
                            style={[styles.badgeText, { color: colors.text }]}>
                            {STATUS_LABELS[status]}
                          </Text>
                        </View>
                        <Text style={styles.chevron}>
                          {expanded ? '▲' : '▼'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Expanded detail */}
                    {expanded && (
                      <View style={styles.reportDetail}>
                        <View style={styles.detailDivider} />

                        <Text style={styles.detailLabel}>Description</Text>
                        <Text style={styles.detailText}>
                          {report.description || '—'}
                        </Text>

                        {report.desiredResolution ? (
                          <>
                            <Text style={styles.detailLabel}>
                              Desired Resolution
                            </Text>
                            <Text style={styles.detailText}>
                              {report.desiredResolution}
                            </Text>
                          </>
                        ) : null}

                        {report.witnesses && report.witnesses !== 'No' ? (
                          <>
                            <Text style={styles.detailLabel}>Witnesses</Text>
                            <Text style={styles.detailText}>
                              {report.witnessNames || report.witnesses}
                            </Text>
                          </>
                        ) : null}

                        {report.contactInfo ? (
                          <>
                            <Text style={styles.detailLabel}>Contact</Text>
                            <Text style={styles.detailText}>
                              {report.contactInfo}
                            </Text>
                          </>
                        ) : null}

                        {report.incidentDate ? (
                          <>
                            <Text style={styles.detailLabel}>
                              Incident Date
                            </Text>
                            <Text style={styles.detailText}>
                              {report.incidentDate}
                            </Text>
                          </>
                        ) : null}

                        {/* Contact user */}
                        <Text style={[styles.detailLabel, { marginTop: 16 }]}>
                          Contact User
                        </Text>
                        {report.userEmail ? (
                          <Text style={styles.contactInfoText}>
                            ✉️ {report.userEmail}
                          </Text>
                        ) : null}
                        {report.contactInfo ? (
                          <Text style={styles.contactInfoText}>
                            📱 {report.contactInfo}
                          </Text>
                        ) : null}
                        <View style={styles.contactRow}>
                          {report.userEmail ? (
                            <TouchableOpacity
                              style={styles.contactBtn}
                              onPress={() =>
                                Linking.openURL(
                                  `mailto:${report.userEmail}` +
                                    `?subject=Regarding Your FairNest Report` +
                                    `&body=Hello,%0D%0A%0D%0AWe have reviewed your report regarding "${report.housingIssueType || 'your housing issue'}" submitted on ${date}.%0D%0A%0D%0A[Add your message here]%0D%0A%0D%0ARegards,%0D%0AFairNest Team`
                                )
                              }>
                              <Text style={styles.contactBtnText}>
                                📧 Email User
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={styles.noContactText}>
                              No email on file — ask user to resubmit
                            </Text>
                          )}
                          {false && report.contactInfo ? (
                            <TouchableOpacity
                              style={[styles.contactBtn, styles.contactBtnSms]}
                              onPress={() =>
                                Linking.openURL(
                                  `sms:${report.contactInfo.replace(/\D/g, '')}` +
                                    `?body=Hello, this is FairNest regarding your report about "${report.housingIssueType || 'your housing issue'}". [Add your message here]`
                                )
                              }>
                              <Text
                                style={[
                                  styles.contactBtnText,
                                  styles.contactBtnSmsText,
                                ]}>
                                💬 SMS User
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>

                        {/* Status update */}
                        <Text style={[styles.detailLabel, { marginTop: 16 }]}>
                          Update Status
                        </Text>
                        <View style={styles.statusButtons}>
                          {STATUS_OPTIONS.map((s) => (
                            <TouchableOpacity
                              key={s}
                              style={[
                                styles.statusBtn,
                                status === s && styles.statusBtnActive,
                                { borderColor: STATUS_COLORS[s].border },
                                status === s && {
                                  backgroundColor: STATUS_COLORS[s].bg,
                                },
                              ]}
                              onPress={() => updateStatus(report.id, s)}
                              disabled={updating === report.id}>
                              {updating === report.id ? (
                                <ActivityIndicator size="small" color="#555" />
                              ) : (
                                <Text
                                  style={[
                                    styles.statusBtnText,
                                    status === s && {
                                      color: STATUS_COLORS[s].text,
                                      fontWeight: 'bold',
                                    },
                                  ]}>
                                  {STATUS_LABELS[s]}
                                </Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  hero: {
    backgroundColor: '#1B5E20',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  body: { padding: 20, maxWidth: 960, alignSelf: 'center', width: '100%' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statsRowWide: { flexWrap: 'nowrap' },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },

  // Filters
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  filterText: { fontSize: 14, color: '#555' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  // Report cards
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  reportHeaderLeft: { flex: 1 },
  reportHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reportType: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
  reportMeta: { fontSize: 12, color: '#888', marginTop: 3 },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  chevron: { fontSize: 12, color: '#999' },

  // Detail
  reportDetail: { paddingHorizontal: 16, paddingBottom: 16 },
  detailDivider: { height: 1, backgroundColor: '#eee', marginBottom: 14 },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: { fontSize: 14, color: '#333', lineHeight: 21 },

  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  statusBtnActive: {},
  statusBtnText: { fontSize: 13, color: '#555' },

  // Contact buttons
  contactRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  contactBtnText: { fontSize: 14, color: '#1565C0', fontWeight: '600' },
  contactBtnCall: { backgroundColor: '#FFF3E0', borderColor: '#FFCC80' },
  contactBtnCallText: { color: '#EF6C00' },
  contactBtnCopy: { backgroundColor: '#F3E5F5', borderColor: '#CE93D8' },
  contactBtnCopyText: { color: '#7B1FA2' },
  contactBtnSms: { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  contactBtnSmsText: { color: '#2E7D32' },
  contactFeedbackText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  contactInfoText: { fontSize: 13, color: '#555', marginBottom: 4 },
  noContactText: {
    fontSize: 13,
    color: '#aaa',
    fontStyle: 'italic',
    marginTop: 4,
  },

  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  emptySubText: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 300,
  },

  // Tabs
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
  tabText: { fontSize: 14, color: '#888', fontWeight: '500' },
  tabTextActive: { color: '#2E7D32', fontWeight: 'bold' },

  // Conversation cards
  convoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    overflow: 'hidden',
  },
  convoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  convoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  convoAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  convoHeaderInfo: { flex: 1 },
  convoEmail: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
  convoMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  convoPreview: { fontSize: 12, color: '#aaa', marginTop: 3 },

  // Chat messages inside expanded convo
  convoMessages: { paddingHorizontal: 16, paddingBottom: 16 },
  msgRow: { flexDirection: 'row', marginBottom: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  msgBubbleUser: { backgroundColor: '#2E7D32' },
  msgBubbleAi: { backgroundColor: '#f0f0f0' },
  msgText: { fontSize: 14, color: '#333', lineHeight: 20 },
  msgTextUser: { color: '#fff' },
  msgTime: { fontSize: 10, color: '#aaa', marginTop: 4, alignSelf: 'flex-end' },
  msgTimeUser: { color: 'rgba(255,255,255,0.6)' },
});
