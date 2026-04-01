import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import Navbar from '../components/Navbar';
import { fontSize } from '../theme/typography';

const ISSUE_TYPES = [
  'Eviction / Wrongful Removal',
  'Denial of Housing',
  'Harassment / Intimidation',
  'Failure to Make Repairs',
  'Illegal Entry by Landlord',
  'Discriminatory Advertising',
  'Other',
];

const DISCRIMINATION_BASES = [
  'Race',
  'Color',
  'National Origin',
  'Religion',
  'Sex / Gender',
  'Disability',
  'Familial Status',
  'Other',
];

function OptionPicker({ label, options, value, onChange, error }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, value === opt && styles.optionBtnActive]}
            onPress={() => onChange(opt)}>
            <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function ReportScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [incidentDate, setIncidentDate]             = useState('');
  const [housingIssueType, setHousingIssueType]     = useState('');
  const [discriminationBasis, setDiscriminationBasis] = useState('');
  const [witnesses, setWitnesses]                   = useState('');
  const [witnessNames, setWitnessNames]             = useState('');
  const [description, setDescription]               = useState('');
  const [desiredResolution, setDesiredResolution]   = useState('');
  const [contactInfo, setContactInfo]               = useState('');
  const [evidenceFiles, setEvidenceFiles]           = useState([]);
  const [errors, setErrors]                         = useState({});
  const [submitting, setSubmitting]                 = useState(false);
  const [submitted, setSubmitted]                   = useState(false);
  const [submittedReportId, setSubmittedReportId]   = useState('');

  // ── Auth guard ─────────────────────────────────────────────────────
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="Report" />
        <View style={styles.authGuard}>
          <View style={styles.authIconCircle}>
            <Text style={{ fontSize: 32 }}>🔒</Text>
          </View>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authText}>
            You need to be logged in to file a housing discrimination report.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.secondaryBtnText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── Success state ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="Report" />
        <View style={styles.successState}>
          <View style={styles.successIconCircle}>
            <Text style={{ fontSize: 40 }}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successText}>
            Your report has been received. You can track its status in your profile under "My Reports".
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('ScheduleCall', {
              reportId: submittedReportId,
              reportType: housingIssueType,
            })}>
            <Text style={styles.primaryBtnText}>Schedule a Call with an Advocate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.secondaryBtnText}>View My Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              setSubmitted(false);
              setIncidentDate(''); setHousingIssueType(''); setDiscriminationBasis('');
              setWitnesses(''); setWitnessNames(''); setDescription('');
              setDesiredResolution(''); setContactInfo(''); setEvidenceFiles([]);
            }}>
            <Text style={styles.secondaryBtnText}>File Another Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── Validation ─────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!housingIssueType)    e.housingIssueType    = 'Please select the type of issue.';
    if (!discriminationBasis) e.discriminationBasis = 'Please select the basis of discrimination.';
    if (!description.trim())  e.description         = 'Please describe what happened.';
    if (description.trim().length < 20) e.description = 'Please provide more detail (at least 20 characters).';
    if (!witnesses)           e.witnesses           = 'Please indicate whether there were witnesses.';
    return e;
  };

  // ── File picker ────────────────────────────────────────────────────
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: true,
    });
    if (!result.canceled) {
      setEvidenceFiles(prev => [...prev, ...result.assets]);
    }
  };

  const removeFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const storage = getStorage();

      const reportRef = await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userEmail: user.email || '',
        incidentDate,
        housingIssueType,
        discriminationBasis,
        witnesses,
        witnessNames,
        description,
        desiredResolution,
        contactInfo,
        status: 'pending',
        createdAt: serverTimestamp(),
        evidenceUrls: [],
      });

      // Upload evidence files
      if (evidenceFiles.length) {
        const urls = [];
        for (const file of evidenceFiles) {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          const fileRef = ref(storage, `reportEvidence/${user.uid}/${reportRef.id}/${file.name}`);
          await uploadBytes(fileRef, blob);
          urls.push(await getDownloadURL(fileRef));
        }
        await updateDoc(reportRef, { evidenceUrls: urls });
      }

      setSubmittedReportId(reportRef.id);
      setSubmitted(true);
    } catch (err) {
      console.log(err);
      setErrors({ submit: 'Submission failed. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="Report" />

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>File a Housing Report</Text>
        <Text style={styles.heroSub}>
          All reports are confidential and reviewed by our team.
        </Text>
      </View>

      <View style={[styles.formCard, isWide && styles.formCardWide]}>

        {/* Incident Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date of Incident</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={incidentDate}
              onChange={e => setIncidentDate(e.target.value)}
              style={webDateStyle}
            />
          ) : (
            <TextInput
              style={styles.input}
              value={incidentDate}
              onChangeText={setIncidentDate}
              placeholder="MM/DD/YYYY"
            />
          )}
        </View>

        {/* Issue type */}
        <OptionPicker
          label="Type of Housing Issue *"
          options={ISSUE_TYPES}
          value={housingIssueType}
          onChange={v => { setHousingIssueType(v); setErrors(p => ({ ...p, housingIssueType: '' })); }}
          error={errors.housingIssueType}
        />

        {/* Discrimination basis */}
        <OptionPicker
          label="Basis of Discrimination *"
          options={DISCRIMINATION_BASES}
          value={discriminationBasis}
          onChange={v => { setDiscriminationBasis(v); setErrors(p => ({ ...p, discriminationBasis: '' })); }}
          error={errors.discriminationBasis}
        />

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Describe What Happened *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={v => { setDescription(v); setErrors(p => ({ ...p, description: '' })); }}
            placeholder="Please describe the incident in as much detail as possible..."
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length} characters</Text>
          {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}
        </View>

        {/* Witnesses */}
        <View style={styles.field}>
          <Text style={styles.label}>Were there witnesses? *</Text>
          <View style={styles.toggleRow}>
            {['Yes', 'No'].map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.toggleBtn, witnesses === opt && styles.toggleBtnActive]}
                onPress={() => { setWitnesses(opt); setErrors(p => ({ ...p, witnesses: '' })); }}>
                <Text style={[styles.toggleText, witnesses === opt && styles.toggleTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.witnesses ? <Text style={styles.fieldError}>{errors.witnesses}</Text> : null}
        </View>

        {witnesses === 'Yes' && (
          <View style={styles.field}>
            <Text style={styles.label}>Witness Name(s)</Text>
            <TextInput
              style={styles.input}
              value={witnessNames}
              onChangeText={setWitnessNames}
              placeholder="Full names of witnesses"
            />
          </View>
        )}

        {/* Desired resolution */}
        <View style={styles.field}>
          <Text style={styles.label}>Desired Resolution <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.input}
            value={desiredResolution}
            onChangeText={setDesiredResolution}
            placeholder="e.g. Repair completed, eviction stopped, apology..."
          />
        </View>

        {/* Contact */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone or Email for Follow-up <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.input}
            value={contactInfo}
            onChangeText={setContactInfo}
            placeholder="e.g. 919-555-0100 or name@email.com"
            autoCapitalize="none"
          />
        </View>

        {/* Evidence */}
        <View style={styles.field}>
          <Text style={styles.label}>Supporting Evidence <Text style={styles.optional}>(optional)</Text></Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
            <Text style={styles.uploadBtnText}>+ Attach Images or PDFs</Text>
          </TouchableOpacity>
          {evidenceFiles.map((file, i) => (
            <View key={i} style={styles.fileRow}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <TouchableOpacity onPress={() => removeFile(i)}>
                <Text style={styles.fileRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit error */}
        {errors.submit ? (
          <View style={styles.submitError}>
            <Text style={styles.submitErrorText}>{errors.submit}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text style={styles.primaryBtnText}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          FairNest does not provide legal advice. For urgent matters, contact Legal Aid NC at 866-219-5262.
        </Text>
      </View>
    </ScrollView>
  );
}

const webDateStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '4px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '15px',
  backgroundColor: '#fafafa',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  hero: {
    backgroundColor: '#1B5E20',
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: { fontSize: fontSize.h2, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  heroSub:   { fontSize: fontSize.body, color: 'rgba(255,255,255,0.85)' },

  formCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  formCardWide: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  field:    { marginBottom: 20 },
  label:    { fontSize: fontSize.label, fontWeight: '600', color: '#333', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#999' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: fontSize.input,
    backgroundColor: '#fafafa',
  },
  textarea:  { minHeight: 130, textAlignVertical: 'top' },
  charCount: { fontSize: fontSize.tiny, color: '#bbb', marginTop: 4, textAlign: 'right' },

  // Option picker
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#fafafa',
  },
  optionBtnActive:  { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  optionText:       { fontSize: fontSize.caption, color: '#444' },
  optionTextActive: { color: '#fff', fontWeight: 'bold' },

  // Yes/No toggle
  toggleRow: { flexDirection: 'row', gap: 12 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  toggleBtnActive:  { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  toggleText:       { fontSize: fontSize.body, fontWeight: '600', color: '#555' },
  toggleTextActive: { color: '#fff' },

  // File upload
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: fontSize.small },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
  fileName:   { fontSize: fontSize.caption, color: '#333', flex: 1, marginRight: 8 },
  fileRemove: { fontSize: fontSize.small, color: '#999', fontWeight: 'bold' },

  fieldError: { fontSize: fontSize.tiny, color: '#C62828', marginTop: 6 },

  submitError: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  submitErrorText: { color: '#C62828', fontSize: fontSize.small, textAlign: 'center' },

  primaryBtn:         { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryBtnDisabled: { backgroundColor: '#a5d6a7' },
  primaryBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: fontSize.button },

  secondaryBtn:     { borderWidth: 1.5, borderColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  secondaryBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: fontSize.button },

  disclaimer: { fontSize: fontSize.tiny, color: '#999', textAlign: 'center', lineHeight: 18, marginTop: 4 },

  // Auth guard
  authGuard:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 12 },
  authIconCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  authTitle:      { fontSize: fontSize.h2, fontWeight: 'bold', color: '#1a1a1a' },
  authText:       { fontSize: fontSize.body, color: '#666', textAlign: 'center', marginBottom: 8 },

  // Success
  successState:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 12 },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  successTitle:      { fontSize: fontSize.h2, fontWeight: 'bold', color: '#1a1a1a' },
  successText:       { fontSize: fontSize.body, color: '#555', textAlign: 'center', maxWidth: 360, marginBottom: 8 },
});
