import React, { useState, useContext } from 'react';
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
const DateTimePicker = Platform.OS !== 'web'
  ? require('@react-native-community/datetimepicker').default
  : null;
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { fontSize } from '../theme/typography';
import { COLORS } from '../utils/constants';

const CALL_TYPES = [
  {
    key: 'advocate',
    icon: '⚖️',
    title: 'Speak with an Advocate',
    desc: 'Get guidance from a fair housing advocate about your situation or an existing report.',
  },
  {
    key: 'legal',
    icon: '🏛️',
    title: 'Legal Consultation',
    desc: 'Talk directly with a legal expert about your rights and potential next steps.',
  },
];

const TIME_SLOTS = ['Morning (9am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–7pm)'];

export default function ScheduleCallScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  // Pre-fill from report if coming from ReportScreen success
  const linkedReportId   = route?.params?.reportId   || '';
  const linkedReportType = route?.params?.reportType || '';

  const [callType, setCallType]         = useState(linkedReportId ? 'advocate' : '');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [preferredDate, setPreferredDate]   = useState('');
  const [timeSlot, setTimeSlot]         = useState('');
  const [phone, setPhone]             = useState('');
  const [notes, setNotes]             = useState('');
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  // Hover states (web only)
  const [hoveredCallType, setHoveredCallType] = useState(null);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState(null);
  const [hoveredPrimary, setHoveredPrimary]   = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="ScheduleCall" />
        <View style={styles.authGuard}>
          <View style={styles.authIconCircle}>
            <Text style={{ fontSize: 32 }}>🔒</Text>
          </View>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authDesc}>
            You need an account to schedule a call with an advocate or legal expert.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, hoveredSecondary && styles.secondaryBtnHover]}
            onMouseEnter={() => setHoveredSecondary(true)}
            onMouseLeave={() => setHoveredSecondary(false)}
            onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.secondaryBtnText, hoveredSecondary && styles.secondaryBtnTextHover]}>Create Account</Text>
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
            <Text style={{ fontSize: 40 }}>📅</Text>
          </View>
          <Text style={styles.successTitle}>Request Received!</Text>
          <Text style={styles.successText}>
            Your call request has been submitted. An advocate or legal expert will
            reach out to you at the contact number provided within 1–2 business days
            to confirm your appointment.
          </Text>
          <View style={styles.successInfoBox}>
            <Text style={styles.successInfoLabel}>WHAT HAPPENS NEXT</Text>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>1</Text>
              <Text style={styles.successStepText}>We review your request and match you with the right person.</Text>
            </View>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>2</Text>
              <Text style={styles.successStepText}>You'll receive a call to confirm the exact date and time.</Text>
            </View>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>3</Text>
              <Text style={styles.successStepText}>Your consultation takes place — free of charge.</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, hoveredSecondary && styles.secondaryBtnHover]}
            onMouseEnter={() => setHoveredSecondary(true)}
            onMouseLeave={() => setHoveredSecondary(false)}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={[styles.secondaryBtnText, hoveredSecondary && styles.secondaryBtnTextHover]}>View My Reports</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── Validation ───────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!callType)          e.callType      = 'Please select a call type.';
    if (!preferredDate.trim()) e.preferredDate = 'Please enter a preferred date.';
    if (!timeSlot)          e.timeSlot      = 'Please select a preferred time slot.';
    if (!phone.trim())      e.phone         = 'Please enter a phone number we can reach you at.';
    return e;
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'callRequests'), {
        userId:        user.uid,
        userEmail:     user.email || '',
        callType,
        preferredDate: preferredDate.trim(),
        timeSlot,
        phone:         phone.trim(),
        notes:         notes.trim(),
        reportId:      linkedReportId || null,
        reportType:    linkedReportType || null,
        status:        'pending',
        createdAt:     serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.log('Schedule error:', err);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    }
    setSubmitting(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="ScheduleCall" />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>FREE CONSULTATIONS</Text>
        <Text style={styles.heroTitle}>Schedule a Call</Text>
        <Text style={styles.heroSub}>
          Connect with a fair housing advocate or legal expert at no cost to you.
          All consultations are confidential.
        </Text>
      </View>

      <View style={[styles.body, isWide && styles.bodyWide]}>

        {/* Linked report notice */}
        {linkedReportId ? (
          <View style={styles.linkedBanner}>
            <Text style={styles.linkedBannerText}>
              This call is linked to your report:{' '}
              <Text style={{ fontWeight: 'bold' }}>{linkedReportType || 'Housing Issue'}</Text>
            </Text>
          </View>
        ) : null}

        {/* Call type selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STEP 1</Text>
          <Text style={styles.sectionTitle}>What kind of call do you need?</Text>
          <View style={[styles.typeGrid, isWide && styles.typeGridWide]}>
            {CALL_TYPES.map(ct => (
              <TouchableOpacity
                key={ct.key}
                style={[
                  styles.typeCard,
                  callType === ct.key && styles.typeCardActive,
                  callType !== ct.key && hoveredCallType === ct.key && styles.callTypeCardHover,
                ]}
                onPress={() => setCallType(ct.key)}
                onMouseEnter={() => setHoveredCallType(ct.key)}
                onMouseLeave={() => setHoveredCallType(null)}>
                <View style={styles.typeIconCircle}>
                  <Text style={{ fontSize: 24 }}>{ct.icon}</Text>
                </View>
                <Text style={[styles.typeTitle, callType === ct.key && styles.typeTitleActive]}>
                  {ct.title}
                </Text>
                <Text style={styles.typeDesc}>{ct.desc}</Text>
                {callType === ct.key && (
                  <View style={styles.typeCheck}>
                    <Text style={styles.typeCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {errors.callType ? <Text style={styles.fieldError}>{errors.callType}</Text> : null}
        </View>

        {/* Date & time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STEP 2</Text>
          <Text style={styles.sectionTitle}>When works for you?</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Preferred Date</Text>

            {Platform.OS === 'web' ? (
              // Web: HTML native date input
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                style={{
                  backgroundColor: '#fff',
                  border: errors.preferredDate ? '1px solid #e53935' : '1px solid #ddd',
                  borderRadius: 8,
                  padding: '12px 14px',
                  fontSize: 15,
                  color: '#1a1a1a',
                  width: '100%',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                onChange={(e) => {
                  if (e.target.value) {
                    const d = new Date(e.target.value + 'T12:00:00');
                    setSelectedDate(d);
                    setPreferredDate(
                      d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                    );
                  }
                }}
              />
            ) : (
              // Native: button to open OS date picker
              <>
                <TouchableOpacity
                  style={[styles.dateBtn, errors.preferredDate && styles.dateBtnError]}
                  onPress={() => setShowDatePicker(true)}>
                  <Text style={selectedDate ? styles.dateBtnText : styles.dateBtnPlaceholder}>
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Tap to select a date'}
                  </Text>
                  <Text style={{ fontSize: 18 }}>📅</Text>
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
                          date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                        );
                      }
                    }}
                  />
                )}
              </>
            )}

            {errors.preferredDate ? <Text style={styles.fieldError}>{errors.preferredDate}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Preferred Time of Day</Text>
            <View style={styles.slotRow}>
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotBtn,
                    timeSlot === slot && styles.slotBtnActive,
                    timeSlot !== slot && hoveredTimeSlot === slot && styles.timeSlotHover,
                  ]}
                  onPress={() => setTimeSlot(slot)}
                  onMouseEnter={() => setHoveredTimeSlot(slot)}
                  onMouseLeave={() => setHoveredTimeSlot(null)}>
                  <Text style={[styles.slotText, timeSlot === slot && styles.slotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.timeSlot ? <Text style={styles.fieldError}>{errors.timeSlot}</Text> : null}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STEP 3</Text>
          <Text style={styles.sectionTitle}>How can we reach you?</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="(919) 555-0100"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Additional Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Briefly describe your situation or anything specific you'd like to discuss..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Confidential & Free</Text>
          <Text style={styles.infoBoxText}>
            All consultations are confidential and provided at no cost through our
            partnerships with Legal Aid NC and Durham fair housing advocates.
          </Text>
        </View>

        {errors.submit ? (
          <Text style={styles.submitError}>{errors.submit}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            submitting && styles.primaryBtnDisabled,
            !submitting && hoveredPrimary && styles.primaryBtnHover,
          ]}
          onPress={handleSubmit}
          onMouseEnter={() => setHoveredPrimary(true)}
          onMouseLeave={() => setHoveredPrimary(false)}
          disabled={submitting}>
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>Request My Call →</Text>
          }
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          FairNest will match you with an available advocate. Response time is
          typically 1–2 business days.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Auth guard
  authGuard:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  authIconCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  authTitle:      { fontSize: fontSize.h2, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  authDesc:       { fontSize: fontSize.body, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28, maxWidth: 340 },

  // Success
  successState:      { alignItems: 'center', padding: 32, marginTop: 20 },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle:    { fontSize: fontSize.h2, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10, textAlign: 'center' },
  successText:     { fontSize: fontSize.body, color: '#555', textAlign: 'center', lineHeight: 23, maxWidth: 420, marginBottom: 24 },
  successInfoBox:  { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 440, marginBottom: 28, borderWidth: 1, borderColor: '#e8e8e8' },
  successInfoLabel:{ fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 2, marginBottom: 14 },
  successStep:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  successStepNum:  { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E8F5E9', textAlign: 'center', lineHeight: 24, fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32', flexShrink: 0 },
  successStepText: { fontSize: fontSize.small, color: '#444', lineHeight: 20, flex: 1 },

  // Hero
  hero: {
    backgroundColor: '#1B5E20',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroLabel: { fontSize: fontSize.tiny, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', letterSpacing: 2.5, marginBottom: 12 },
  heroTitle: { fontSize: fontSize.h1, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  heroSub:   { fontSize: fontSize.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, maxWidth: 520 },

  body:     { padding: 20, maxWidth: 800, alignSelf: 'center', width: '100%' },
  bodyWide: { paddingHorizontal: 32 },

  linkedBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  linkedBannerText: { fontSize: fontSize.small, color: '#2E7D32', lineHeight: 20 },

  section:      { marginBottom: 28 },
  sectionLabel: { fontSize: fontSize.tiny, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  sectionTitle: { fontSize: fontSize.h3, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },

  // Call type cards
  typeGrid:     { gap: 12 },
  typeGridWide: { flexDirection: 'row' },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    flex: 1,
    position: 'relative',
  },
  typeCardActive:  { borderColor: '#2E7D32', backgroundColor: '#F1F8F1' },
  typeIconCircle:  { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  typeTitle:       { fontSize: fontSize.body, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  typeTitleActive:{ color: '#2E7D32' },
  typeDesc:       { fontSize: fontSize.caption, color: '#666', lineHeight: 19 },
  typeCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeCheckText: { color: '#fff', fontSize: fontSize.tiny, fontWeight: 'bold' },

  // Fields
  field:      { marginBottom: 16 },
  label:      { fontSize: fontSize.label, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: fontSize.input,
    color: '#1a1a1a',
  },
  inputError: { borderColor: '#e53935' },
  textarea:   { minHeight: 100, textAlignVertical: 'top' },
  fieldError: { fontSize: fontSize.tiny, color: '#e53935', marginTop: 5 },

  // Date picker button (native only)
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateBtnError:       { borderColor: '#e53935' },
  dateBtnText:        { fontSize: fontSize.input, color: '#1a1a1a', flex: 1 },
  dateBtnPlaceholder: { fontSize: fontSize.input, color: '#aaa', flex: 1 },

  // Time slots
  slotRow: { gap: 8 },
  slotBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  slotBtnActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  slotText:      { fontSize: fontSize.small, color: '#555' },
  slotTextActive:{ color: '#fff', fontWeight: 'bold' },

  // Info box
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  infoBoxTitle: { fontSize: fontSize.small, fontWeight: 'bold', color: '#2E7D32', marginBottom: 6 },
  infoBoxText:  { fontSize: fontSize.caption, color: '#444', lineHeight: 19 },

  submitError: { fontSize: fontSize.caption, color: '#e53935', textAlign: 'center', marginBottom: 12 },

  primaryBtn:         { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryBtnDisabled: { backgroundColor: '#a5d6a7' },
  primaryBtnHover:    { backgroundColor: '#163d18' },
  primaryBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: fontSize.button },
  secondaryBtn:       { borderWidth: 1.5, borderColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  secondaryBtnHover:  { backgroundColor: COLORS.primaryDeep, borderColor: COLORS.primaryDeep },
  secondaryBtnText:   { color: '#2E7D32', fontWeight: 'bold', fontSize: fontSize.button },
  secondaryBtnTextHover: { color: '#ffffff' },

  // Hover states for cards and slots (web)
  callTypeCardHover: { backgroundColor: 'rgba(27,94,32,0.05)', borderColor: '#A5D6A7' },
  timeSlotHover:     { backgroundColor: 'rgba(27,94,32,0.05)', borderColor: '#A5D6A7' },

  disclaimer: { fontSize: fontSize.tiny, color: '#aaa', textAlign: 'center', lineHeight: 18, marginBottom: 40 },
});
