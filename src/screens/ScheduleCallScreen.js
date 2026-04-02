import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
const DateTimePicker =
  Platform.OS !== 'web'
    ? require('@react-native-community/datetimepicker').default
    : null;
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { fontSize } from '../theme/typography';
import { COLORS } from '../utils/constants';

const CALL_TYPES = [
  {
    key: 'advocate',
    badge: 'AH',
    title: 'Speak with an Advocate',
    desc: 'Get guidance from a fair housing advocate about your situation or an existing report.',
  },
  {
    key: 'legal',
    badge: 'LC',
    title: 'Legal Consultation',
    desc: 'Talk directly with a legal expert about your rights and potential next steps.',
  },
];

const TIME_SLOTS = [
  'Morning (9am-12pm)',
  'Afternoon (12pm-4pm)',
  'Evening (4pm-7pm)',
];

const TRUST_BADGES = [
  'Free consultations',
  'Confidential review',
  'Follow-up by phone',
];

const PREP_NOTES = [
  'Choose the call type that best matches the kind of help you want.',
  'Pick a preferred date and time window, and we will confirm availability.',
  'Use notes to share context that helps us route your request faster.',
];

function SnapshotRow({ label, value }) {
  return (
    <View style={styles.snapshotRow}>
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text
        numberOfLines={2}
        style={[styles.snapshotValue, !value && styles.snapshotValueMuted]}>
        {value || 'Not selected yet'}
      </Text>
    </View>
  );
}

export default function ScheduleCallScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isMedium = width >= 760;
  const isWide = width >= 1120;

  // Pre-fill from report if coming from ReportScreen success
  const linkedReportId = route?.params?.reportId || '';
  const linkedReportType = route?.params?.reportType || '';

  const [callType, setCallType] = useState(linkedReportId ? 'advocate' : '');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hover states (web only)
  const [hoveredCallType, setHoveredCallType] = useState(null);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState(null);
  const [hoveredPrimary, setHoveredPrimary] = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(false);

  const selectedCallType = CALL_TYPES.find((type) => type.key === callType);
  const snapshotItems = [
    { label: 'Consultation', value: selectedCallType?.title || '' },
    { label: 'Linked report', value: linkedReportType || '' },
    { label: 'Preferred date', value: preferredDate },
    { label: 'Time window', value: timeSlot },
    { label: 'Phone', value: phone },
  ];

  useEffect(() => {
    const loadProfilePhone = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) return;

        const storedPhone = snap.data().phone || '';
        if (storedPhone && !storedPhone.includes('@')) {
          setPhone(storedPhone);
        }
      } catch (err) {
        console.log('Call profile preload error:', err);
      }
    };

    loadProfilePhone();
  }, [user]);

  // ── Auth guard ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="ScheduleCall" />
        <View style={styles.authGuard}>
          <View style={styles.authIconCircle}>
            <Text style={{ fontSize: 32, color: COLORS.primaryDeep }}>!</Text>
          </View>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authDesc}>
            You need an account to schedule a call with an advocate or legal
            expert.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              hoveredSecondary && styles.secondaryBtnHover,
            ]}
            onMouseEnter={() => setHoveredSecondary(true)}
            onMouseLeave={() => setHoveredSecondary(false)}
            onPress={() => navigation.navigate('SignUp')}>
            <Text
              style={[
                styles.secondaryBtnText,
                hoveredSecondary && styles.secondaryBtnTextHover,
              ]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── Success state ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="ScheduleCall" />
        <View style={styles.successState}>
          <View style={styles.successIconCircle}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                color: COLORS.primaryDeep,
              }}>
              OK
            </Text>
          </View>
          <Text style={styles.successTitle}>Request Received!</Text>
          <Text style={styles.successText}>
            Your call request has been submitted. An advocate or legal expert
            will reach out to you at the contact number provided within 1-2
            business days to confirm your appointment.
          </Text>
          <View style={styles.successInfoBox}>
            <Text style={styles.successInfoLabel}>WHAT HAPPENS NEXT</Text>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>1</Text>
              <Text style={styles.successStepText}>
                We review your request and match you with the right person.
              </Text>
            </View>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>2</Text>
              <Text style={styles.successStepText}>
                You'll receive a call to confirm the exact date and time.
              </Text>
            </View>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>3</Text>
              <Text style={styles.successStepText}>
                Your consultation takes place at no cost.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              hoveredSecondary && styles.secondaryBtnHover,
            ]}
            onMouseEnter={() => setHoveredSecondary(true)}
            onMouseLeave={() => setHoveredSecondary(false)}
            onPress={() =>
              navigation.navigate('Profile', { initialTab: 'calls' })
            }>
            <Text
              style={[
                styles.secondaryBtnText,
                hoveredSecondary && styles.secondaryBtnTextHover,
              ]}>
              View My Calls
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── Validation ───────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const digits = phone.replace(/\D/g, '');
    if (!callType) e.callType = 'Please select a call type.';
    if (!preferredDate.trim())
      e.preferredDate = 'Please enter a preferred date.';
    if (!timeSlot) e.timeSlot = 'Please select a preferred time slot.';
    if (!phone.trim())
      e.phone = 'Please enter a phone number we can reach you at.';
    else if (digits.length < 10)
      e.phone = 'Please enter a valid phone number with at least 10 digits.';
    return e;
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'callRequests'), {
        userId: user.uid,
        userEmail: user.email || '',
        callType,
        preferredDate: preferredDate.trim(),
        timeSlot,
        phone: phone.trim(),
        notes: notes.trim(),
        reportId: linkedReportId || null,
        reportType: linkedReportType || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email || '',
          phone: phone.trim(),
          lastCallRequestAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSubmitted(true);
    } catch (err) {
      console.log('Schedule error:', err);
      setErrors({
        submit:
          err?.code === 'permission-denied'
            ? 'Call scheduling is blocked by Firestore permissions. Deploy the updated Firestore rules and try again.'
            : 'Something went wrong. Please try again.',
      });
    }
    setSubmitting(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageFill}>
      <Navbar navigation={navigation} currentRoute="ScheduleCall" />

      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={[styles.heroInner, isMedium && styles.heroInnerWide]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>FREE CONSULTATIONS</Text>
            <Text style={styles.heroTitle}>Schedule a Call</Text>
            <Text style={styles.heroSub}>
              Choose the kind of support you need, share when you are available,
              and FairNest will route your request to the right advocate or
              legal partner.
            </Text>
            <View style={styles.heroBadgeRow}>
              {TRUST_BADGES.map((badge) => (
                <View key={badge} style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.heroGuide}>
            <Text style={styles.heroGuideLabel}>How scheduling works</Text>
            {PREP_NOTES.map((note, index) => (
              <View key={note} style={styles.heroGuideRow}>
                <View style={styles.heroGuideIndex}>
                  <Text style={styles.heroGuideIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.heroGuideText}>{note}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.workspace, isWide && styles.workspaceWide]}>
        <View style={[styles.sideRail, isWide && styles.sideRailWide]}>
          {linkedReportId ? (
            <View style={styles.sidePanelMuted}>
              <Text style={styles.sidePanelEyebrow}>Linked Report</Text>
              <Text style={styles.sidePanelTitle}>
                This request is connected
              </Text>
              <Text style={styles.sidePanelText}>
                Your call will be associated with{' '}
                {linkedReportType || 'your housing report'} so the review team
                has more context before they reach out.
              </Text>
            </View>
          ) : null}

          <View style={styles.sidePanel}>
            <Text style={styles.sidePanelEyebrow}>Live Snapshot</Text>
            <Text style={styles.sidePanelTitle}>
              What your request includes
            </Text>
            <Text style={styles.sidePanelText}>
              Use this side summary to check what is already filled in before
              you send the request.
            </Text>
            <View style={styles.snapshotCard}>
              {snapshotItems.map((item) => (
                <SnapshotRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </View>
          </View>

          <View style={styles.infoCallout}>
            <Text style={styles.infoCalloutTitle}>Confidential and free</Text>
            <Text style={styles.infoCalloutText}>
              All consultations are confidential and provided at no cost through
              our partnerships with Legal Aid NC and Durham fair housing
              advocates.
            </Text>
          </View>
        </View>

        <View style={[styles.formCard, isWide && styles.formCardWide]}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formEyebrow}>Consultation Request</Text>
              <Text style={styles.formTitle}>Tell us how to reach you</Text>
            </View>
            <Text style={styles.formHelper}>
              Choose a call type, a date, and a time window.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>STEP 1</Text>
            <Text style={styles.sectionTitle}>
              What kind of call do you need?
            </Text>
            <View style={[styles.typeGrid, isMedium && styles.typeGridWide]}>
              {CALL_TYPES.map((ct) => (
                <TouchableOpacity
                  key={ct.key}
                  style={[
                    styles.typeCard,
                    callType === ct.key && styles.typeCardActive,
                    callType !== ct.key &&
                      hoveredCallType === ct.key &&
                      styles.callTypeCardHover,
                  ]}
                  onPress={() => setCallType(ct.key)}
                  onMouseEnter={() => setHoveredCallType(ct.key)}
                  onMouseLeave={() => setHoveredCallType(null)}
                  activeOpacity={0.9}>
                  <View style={styles.typeCardHeader}>
                    <View style={styles.typeIconCircle}>
                      <Text style={styles.typeIconText}>{ct.badge}</Text>
                    </View>
                    {callType === ct.key && (
                      <View style={styles.typeCheck}>
                        <Text style={styles.typeCheckText}>OK</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.typeTitle,
                      callType === ct.key && styles.typeTitleActive,
                    ]}>
                    {ct.title}
                  </Text>
                  <Text style={styles.typeDesc}>{ct.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.callType ? (
              <Text style={styles.fieldError}>{errors.callType}</Text>
            ) : null}
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>STEP 2</Text>
            <Text style={styles.sectionTitle}>When works for you?</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Preferred Date</Text>

              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    ...webDateStyle,
                    border: errors.preferredDate
                      ? '1px solid #BE3A34'
                      : webDateStyle.border,
                  }}
                  onChange={(e) => {
                    if (e.target.value) {
                      const d = new Date(e.target.value + 'T12:00:00');
                      setSelectedDate(d);
                      setPreferredDate(
                        d.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      );
                    }
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.dateBtn,
                      errors.preferredDate && styles.dateBtnError,
                    ]}
                    onPress={() => setShowDatePicker(true)}>
                    <Text
                      style={
                        selectedDate
                          ? styles.dateBtnText
                          : styles.dateBtnPlaceholder
                      }>
                      {selectedDate
                        ? selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Tap to select a date'}
                    </Text>
                    <Text style={styles.dateBtnIcon}>Date</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate || new Date()}
                      mode="date"
                      display="default"
                      minimumDate={new Date()}
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) {
                          setSelectedDate(date);
                          setPreferredDate(
                            date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          );
                        }
                      }}
                    />
                  )}
                </>
              )}

              {errors.preferredDate ? (
                <Text style={styles.fieldError}>{errors.preferredDate}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Preferred Time of Day</Text>
              <View style={styles.slotRow}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotBtn,
                      timeSlot === slot && styles.slotBtnActive,
                      timeSlot !== slot &&
                        hoveredTimeSlot === slot &&
                        styles.timeSlotHover,
                    ]}
                    onPress={() => setTimeSlot(slot)}
                    onMouseEnter={() => setHoveredTimeSlot(slot)}
                    onMouseLeave={() => setHoveredTimeSlot(null)}
                    activeOpacity={0.9}>
                    <Text
                      style={[
                        styles.slotText,
                        timeSlot === slot && styles.slotTextActive,
                      ]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.timeSlot ? (
                <Text style={styles.fieldError}>{errors.timeSlot}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>STEP 3</Text>
            <Text style={styles.sectionTitle}>How can we reach you?</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="(919) 555-0100"
                placeholderTextColor="#97A08E"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              {errors.phone ? (
                <Text style={styles.fieldError}>{errors.phone}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Additional Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Share a little context so we can route your request well."
                placeholderTextColor="#97A08E"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {errors.submit ? (
            <View style={styles.submitErrorBox}>
              <Text style={styles.submitError}>{errors.submit}</Text>
            </View>
          ) : null}

          <View style={[styles.submitRow, isMedium && styles.submitRowWide]}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                styles.submitBtn,
                submitting && styles.primaryBtnDisabled,
                !submitting && hoveredPrimary && styles.primaryBtnHover,
              ]}
              onPress={handleSubmit}
              onMouseEnter={() => setHoveredPrimary(true)}
              onMouseLeave={() => setHoveredPrimary(false)}
              disabled={submitting}
              activeOpacity={0.9}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Request My Call</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              FairNest will match you with an available advocate. Response time
              is typically 1-2 business days.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const webDateStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '18px',
  border: `1px solid ${COLORS.border}`,
  fontSize: '16px',
  color: COLORS.textPrimary,
  backgroundColor: '#FCFDF9',
  outlineColor: COLORS.primary,
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
  boxSizing: 'border-box',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5EF',
  },
  pageFill: {
    paddingBottom: 64,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.primaryDeep,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 112,
  },
  heroGlowA: {
    position: 'absolute',
    top: -120,
    right: -30,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(133, 196, 112, 0.18)',
  },
  heroGlowB: {
    position: 'absolute',
    bottom: -180,
    left: -70,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroInner: {
    width: '100%',
    maxWidth: 1380,
    alignSelf: 'center',
    gap: 28,
  },
  heroInnerWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    maxWidth: 720,
  },
  heroLabel: {
    color: '#CBE8B8',
    fontSize: fontSize.small,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  heroSub: {
    fontSize: fontSize.bodyLg,
    lineHeight: 30,
    color: 'rgba(255,255,255,0.88)',
    maxWidth: 660,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  heroBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroBadgeText: {
    color: '#F6FBF2',
    fontSize: fontSize.caption,
    fontWeight: '700',
  },
  heroGuide: {
    width: '100%',
    maxWidth: 390,
    padding: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
  heroGuideLabel: {
    color: '#E7F3DD',
    fontSize: fontSize.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  heroGuideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroGuideIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5FAF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  heroGuideIndexText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.small,
    fontWeight: '800',
  },
  heroGuideText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: fontSize.small,
    lineHeight: 22,
  },
  workspace: {
    width: '100%',
    maxWidth: 1380,
    alignSelf: 'center',
    paddingHorizontal: 24,
    marginTop: -56,
    gap: 24,
  },
  workspaceWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sideRail: {
    width: '100%',
    gap: 18,
  },
  sideRailWide: {
    width: 340,
  },
  sidePanel: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  sidePanelMuted: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#EEF5E9',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  sidePanelEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  sidePanelTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    fontWeight: '800',
    marginBottom: 10,
  },
  sidePanelText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
  },
  snapshotCard: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: '#F7FAF4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  snapshotRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 94, 32, 0.08)',
  },
  snapshotLabel: {
    color: COLORS.textMuted,
    fontSize: fontSize.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  snapshotValue: {
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    fontWeight: '600',
    lineHeight: 20,
  },
  snapshotValueMuted: {
    color: '#8A9484',
    fontWeight: '500',
  },
  infoCallout: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  infoCalloutTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoCalloutText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 26,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 36,
    elevation: 6,
  },
  formCardWide: {
    minWidth: 0,
  },
  formHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 26,
  },
  formEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  formTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h2,
    fontWeight: '800',
  },
  formHelper: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
  },
  formSection: {
    marginBottom: 26,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(27, 94, 32, 0.08)',
    marginBottom: 28,
  },
  sectionLabel: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h3,
    fontWeight: '800',
    marginBottom: 18,
  },
  typeGrid: {
    gap: 14,
  },
  typeGridWide: {
    flexDirection: 'row',
  },
  typeCard: {
    flex: 1,
    minHeight: 208,
    borderRadius: 26,
    padding: 22,
    backgroundColor: '#FBFCF8',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  typeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  callTypeCardHover: {
    borderColor: 'rgba(46, 125, 50, 0.35)',
    backgroundColor: '#F1F8EC',
    transform: [{ translateY: -2 }],
  },
  typeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF7E8',
  },
  typeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F3E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  typeTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    fontWeight: '800',
    marginBottom: 8,
  },
  typeTitleActive: {
    color: COLORS.primaryDeep,
  },
  typeDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 23,
  },
  typeCheck: {
    minWidth: 40,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCheckText: {
    color: '#FFFFFF',
    fontSize: fontSize.tiny,
    fontWeight: '800',
  },
  field: {
    marginBottom: 22,
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FCFDF9',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fontSize.input,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: '#BE3A34',
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: fontSize.tiny,
    color: '#BE3A34',
    marginTop: 8,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FCFDF9',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  dateBtnError: {
    borderColor: '#BE3A34',
  },
  dateBtnText: {
    fontSize: fontSize.input,
    color: COLORS.textPrimary,
    flex: 1,
  },
  dateBtnPlaceholder: {
    fontSize: fontSize.input,
    color: '#97A08E',
    flex: 1,
  },
  dateBtnIcon: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    fontWeight: '800',
  },
  slotRow: {
    gap: 10,
  },
  slotBtn: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FBFCF8',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  timeSlotHover: {
    borderColor: 'rgba(46, 125, 50, 0.35)',
    backgroundColor: '#F1F8EC',
  },
  slotBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: fontSize.small,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  slotTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  submitErrorBox: {
    backgroundColor: '#FFF0EE',
    borderWidth: 1,
    borderColor: '#F1B3AD',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  submitError: {
    fontSize: fontSize.caption,
    color: '#BE3A34',
    textAlign: 'center',
    lineHeight: 20,
  },
  submitRow: {
    gap: 14,
    marginTop: 8,
  },
  submitRowWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    minWidth: 240,
  },
  primaryBtnDisabled: {
    backgroundColor: '#A7C8A3',
  },
  primaryBtnHover: {
    backgroundColor: COLORS.primaryDeep,
    transform: [{ translateY: -1 }],
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: fontSize.button,
  },
  secondaryBtn: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 125, 50, 0.28)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnHover: {
    backgroundColor: '#F2F8ED',
    borderColor: COLORS.primary,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: fontSize.button,
  },
  secondaryBtnTextHover: {
    color: COLORS.primaryDeep,
  },
  disclaimer: {
    flex: 1,
    fontSize: fontSize.tiny,
    color: '#6C756A',
    lineHeight: 20,
  },
  authGuard: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 72,
    paddingHorizontal: 28,
    gap: 14,
  },
  authIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#E8F3E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authTitle: {
    fontSize: fontSize.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  authDesc: {
    fontSize: fontSize.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
    maxWidth: 420,
  },
  successState: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 72,
    paddingHorizontal: 28,
    gap: 14,
  },
  successIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#E8F3E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: fontSize.h2,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  successText: {
    fontSize: fontSize.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 480,
    marginBottom: 10,
  },
  successInfoBox: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  successInfoLabel: {
    fontSize: fontSize.caption,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  successStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  successStepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F3E2',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: fontSize.tiny,
    fontWeight: '800',
    color: COLORS.primary,
    flexShrink: 0,
  },
  successStepText: {
    fontSize: fontSize.small,
    color: COLORS.textMuted,
    lineHeight: 22,
    flex: 1,
  },
});
