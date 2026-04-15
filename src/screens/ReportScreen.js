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
import {
  collection,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import Navbar from '../components/Navbar';
import { fontSize, font } from '../theme/typography';
import { COLORS } from '../utils/constants';

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

const REVIEW_POINTS = [
  'Select the issue type and discrimination basis that match the incident.',
  'Use names, dates, notices, or exact wording when you can.',
  'Add files only if they help clarify what happened.',
];

const SUPPORT_BADGES = [
  'Confidential review',
  'Team follow-up',
  'Evidence optional',
];

function SnapshotRow({ label, value }) {
  return (
    <View style={styles.snapshotRow}>
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text
        numberOfLines={2}
        style={[styles.snapshotValue, !value && styles.snapshotValueMuted]}>
        {value || 'Not added yet'}
      </Text>
    </View>
  );
}

function OptionPicker({
  label,
  options,
  value,
  onChange,
  error,
  hoverGroup,
  hoveredOption,
  setHoveredOption,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((opt) => {
          const hoverId = `${hoverGroup}:${opt}`;
          const isActive = value === opt;
          const isHovered = hoveredOption === hoverId;

          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionBtn,
                isActive && styles.optionBtnActive,
                !isActive && isHovered && styles.optionBtnHover,
              ]}
              onPress={() => onChange(opt)}
              onMouseEnter={() => setHoveredOption(hoverId)}
              onMouseLeave={() => setHoveredOption(null)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.optionText,
                  isActive && styles.optionTextActive,
                  !isActive && isHovered && styles.optionTextHover,
                ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function ReportScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isMedium = width >= 760;
  const isWide = width >= 1120;

  const [incidentDate, setIncidentDate] = useState('');
  const [housingIssueType, setHousingIssueType] = useState('');
  const [discriminationBasis, setDiscriminationBasis] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [witnessNames, setWitnessNames] = useState('');
  const [description, setDescription] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState('');
  const [uploadFailed, setUploadFailed] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [hoveredWitness, setHoveredWitness] = useState(null);
  const [hoveredPrimary, setHoveredPrimary] = useState(false);
  const [hoveredUpload, setHoveredUpload] = useState(false);
  const [hoveredSecondary, setHoveredSecondary] = useState(null);

  const snapshotItems = [
    { label: 'Issue Type', value: housingIssueType },
    { label: 'Basis', value: discriminationBasis },
    { label: 'Incident Date', value: incidentDate },
    {
      label: 'Evidence',
      value: evidenceFiles.length
        ? `${evidenceFiles.length} file${evidenceFiles.length === 1 ? '' : 's'} attached`
        : '',
    },
    {
      label: 'Witnesses',
      value: witnesses
        ? witnesses === 'Yes'
          ? witnessNames || 'Witness names can be added below'
          : 'No witnesses listed'
        : '',
    },
  ];

  // -- Auth guard -----------------------------------------------------
  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="Report" />
        <View style={styles.authGuard}>
          <View style={styles.authIconCircle}>
            <Text style={{ fontSize: 32, color: COLORS.primaryDeep }}>!</Text>
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
            style={[
              styles.secondaryBtn,
              hoveredSecondary === 'signup' && styles.secondaryBtnHover,
            ]}
            onPress={() => navigation.navigate('SignUp')}
            onMouseEnter={() => setHoveredSecondary('signup')}
            onMouseLeave={() => setHoveredSecondary(null)}>
            <Text
              style={[
                styles.secondaryBtnText,
                hoveredSecondary === 'signup' && styles.secondaryBtnTextHover,
              ]}>
              Create an Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // -- Success state --------------------------------------------------
  if (submitted) {
    return (
      <ScrollView style={styles.container}>
        <Navbar navigation={navigation} currentRoute="Report" />
        <View style={styles.successState}>
          <View style={styles.successIconCircle}>
            <Text
              style={{
                fontSize: 28,
                ...font.extra,
                color: COLORS.primaryDeep,
              }}>
              OK
            </Text>
          </View>
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successText}>
            Your report has been received. You can track its status in your
            profile under "My Reports".
          </Text>
          {uploadFailed && (
            <View style={styles.uploadWarning}>
              <Text style={styles.uploadWarningText}>
                Your report was saved, but the evidence files could not be
                uploaded. Please contact the FairNest team to share your files
                directly.
              </Text>
            </View>
          )}
          <View style={styles.successInfoBox}>
            <Text style={styles.successInfoLabel}>WHAT HAPPENS NEXT</Text>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>1</Text>
              <Text style={styles.successStepText}>
                The FairNest team reviews your report within 1–2 business days.
              </Text>
            </View>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>2</Text>
              <Text style={styles.successStepText}>
                An advocate may reach out if additional details are needed.
              </Text>
            </View>
            <View style={styles.successStep}>
              <Text style={styles.successStepNum}>3</Text>
              <Text style={styles.successStepText}>
                You can check your report status any time under My Reports.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate('ScheduleCall', {
                reportId: submittedReportId,
                reportType: housingIssueType,
              })
            }>
            <Text style={styles.primaryBtnText}>
              Schedule a Call with an Advocate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              hoveredSecondary === 'profile' && styles.secondaryBtnHover,
            ]}
            onPress={() => navigation.navigate('Profile')}
            onMouseEnter={() => setHoveredSecondary('profile')}
            onMouseLeave={() => setHoveredSecondary(null)}>
            <Text
              style={[
                styles.secondaryBtnText,
                hoveredSecondary === 'profile' && styles.secondaryBtnTextHover,
              ]}>
              View My Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              hoveredSecondary === 'again' && styles.secondaryBtnHover,
            ]}
            onPress={() => {
              setSubmitted(false);
              setUploadFailed(false);
              setIncidentDate('');
              setHousingIssueType('');
              setDiscriminationBasis('');
              setWitnesses('');
              setWitnessNames('');
              setDescription('');
              setDesiredResolution('');
              setContactInfo('');
              setEvidenceFiles([]);
            }}
            onMouseEnter={() => setHoveredSecondary('again')}
            onMouseLeave={() => setHoveredSecondary(null)}>
            <Text
              style={[
                styles.secondaryBtnText,
                hoveredSecondary === 'again' && styles.secondaryBtnTextHover,
              ]}>
              File Another Report
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // -- Validation -----------------------------------------------------
  const validate = () => {
    const e = {};
    if (!housingIssueType)
      e.housingIssueType = 'Please select the type of issue.';
    if (!discriminationBasis)
      e.discriminationBasis = 'Please select the basis of discrimination.';
    if (!description.trim()) e.description = 'Please describe what happened.';
    if (description.trim().length < 20)
      e.description = 'Please provide more detail (at least 20 characters).';
    if (!witnesses)
      e.witnesses = 'Please indicate whether there were witnesses.';
    return e;
  };

  // -- File picker ----------------------------------------------------
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: true,
    });
    if (!result.canceled) {
      setEvidenceFiles((prev) => [...prev, ...result.assets]);
    }
  };

  const removeFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // -- Submit ---------------------------------------------------------
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setUploadFailed(false);
    setSubmitting(true);

    try {
      // 1. Save the report to Firestore immediately
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

      // 2. Show success — don't wait for file upload
      setSubmittedReportId(reportRef.id);
      setSubmitted(true);
      setSubmitting(false);

      // 3. Upload files in background; update doc when done
      if (evidenceFiles.length) {
        const storage = getStorage();
        const urls = [];
        try {
          for (const file of evidenceFiles) {
            const blob =
              Platform.OS === 'web' && file.file instanceof Blob
                ? file.file
                : await fetch(file.uri).then((r) => r.blob());
            const fileRef = ref(
              storage,
              `reportEvidence/${user.uid}/${reportRef.id}/${file.name}`
            );
            await uploadBytes(fileRef, blob);
            urls.push(await getDownloadURL(fileRef));
          }
          await updateDoc(doc(db, 'reports', reportRef.id), { evidenceUrls: urls });
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr?.code, uploadErr?.message);
          setUploadFailed(true);
        }
      }
    } catch (err) {
      console.error('Submit failed:', err);
      setErrors({
        submit: 'Submission failed. Please check your connection and try again.',
      });
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageFill}>
      <Navbar navigation={navigation} currentRoute="Report" />

      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={[styles.heroInner, isMedium && styles.heroInnerWide]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>SECURE REPORTING</Text>
            <Text style={styles.heroTitle}>File a Housing Report</Text>
            <Text style={styles.heroSub}>
              Document what happened, add the details that matter, and send it
              directly to the FairNest review team.
            </Text>
            <View style={styles.heroBadgeRow}>
              {SUPPORT_BADGES.map((badge) => (
                <View key={badge} style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.heroGuide}>
            <Text style={styles.heroGuideLabel}>Before you submit</Text>
            {REVIEW_POINTS.map((point, index) => (
              <View key={point} style={styles.heroGuideRow}>
                <View style={styles.heroGuideIndex}>
                  <Text style={styles.heroGuideIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.heroGuideText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.workspace, isWide && styles.workspaceWide]}>
        <View style={[styles.sideRail, isWide && styles.sideRailWide]}>
          <View style={styles.sidePanel}>
            <Text style={styles.sidePanelEyebrow}>Live Snapshot</Text>
            <Text style={styles.sidePanelTitle}>What your report includes</Text>
            <Text style={styles.sidePanelText}>
              Use this side summary to spot anything you still want to add
              before submitting.
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

          <View style={styles.sidePanelMuted}>
            <Text style={styles.sidePanelEyebrow}>Helpful Notes</Text>
            <Text style={styles.sidePanelTitle}>Make the review easier</Text>
            <Text style={styles.sidePanelText}>
              Specific facts, dates, and documents are more useful than long
              filler. Short and concrete works well.
            </Text>
            <View style={styles.infoCallout}>
              <Text style={styles.infoCalloutTitle}>Follow-up contact</Text>
              <Text style={styles.infoCalloutText}>
                Add a phone number or email if you want outreach outside the
                app.
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.formCard, isWide && styles.formCardWide]}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formEyebrow}>Report Details</Text>
              <Text style={styles.formTitle}>Tell us what happened</Text>
            </View>
            <Text style={styles.formHelper}>
              Fields marked with * are required.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTag}>Section 1</Text>
            <Text style={styles.sectionHeading}>Incident details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Date of Incident</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  style={webDateStyle}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  value={incidentDate}
                  onChangeText={setIncidentDate}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#96A08D"
                />
              )}
            </View>

            <OptionPicker
              label="Type of Housing Issue *"
              options={ISSUE_TYPES}
              value={housingIssueType}
              onChange={(v) => {
                setHousingIssueType(v);
                setErrors((p) => ({ ...p, housingIssueType: '' }));
              }}
              error={errors.housingIssueType}
              hoverGroup="issue"
              hoveredOption={hoveredOption}
              setHoveredOption={setHoveredOption}
            />

            <OptionPicker
              label="Basis of Discrimination *"
              options={DISCRIMINATION_BASES}
              value={discriminationBasis}
              onChange={(v) => {
                setDiscriminationBasis(v);
                setErrors((p) => ({ ...p, discriminationBasis: '' }));
              }}
              error={errors.discriminationBasis}
              hoverGroup="basis"
              hoveredOption={hoveredOption}
              setHoveredOption={setHoveredOption}
            />
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.formSection}>
            <Text style={styles.sectionTag}>Section 2</Text>
            <Text style={styles.sectionHeading}>Describe the incident</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Describe What Happened *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={7}
                value={description}
                onChangeText={(v) => {
                  setDescription(v);
                  setErrors((p) => ({ ...p, description: '' }));
                }}
                placeholder="Describe the incident, what was said or done, and what outcome you are seeking."
                placeholderTextColor="#96A08D"
                textAlignVertical="top"
              />
              <View style={styles.fieldMetaRow}>
                <Text style={styles.fieldMetaText}>
                  Clear facts are more useful than perfect wording.
                </Text>
                <Text style={styles.charCount}>
                  {description.length} characters
                </Text>
              </View>
              {errors.description ? (
                <Text style={styles.fieldError}>{errors.description}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Were there witnesses? *</Text>
              <View
                style={[styles.toggleRow, isMedium && styles.toggleRowWide]}>
                {['Yes', 'No'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.toggleBtn,
                      witnesses === opt && styles.toggleBtnActive,
                      witnesses !== opt &&
                        hoveredWitness === opt &&
                        styles.toggleBtnHover,
                    ]}
                    onPress={() => {
                      setWitnesses(opt);
                      setErrors((p) => ({ ...p, witnesses: '' }));
                    }}
                    onMouseEnter={() => setHoveredWitness(opt)}
                    onMouseLeave={() => setHoveredWitness(null)}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.toggleText,
                        witnesses === opt && styles.toggleTextActive,
                        witnesses !== opt &&
                          hoveredWitness === opt &&
                          styles.toggleTextHover,
                      ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.witnesses ? (
                <Text style={styles.fieldError}>{errors.witnesses}</Text>
              ) : null}
            </View>

            {witnesses === 'Yes' && (
              <View style={styles.field}>
                <Text style={styles.label}>Witness Name(s)</Text>
                <TextInput
                  style={styles.input}
                  value={witnessNames}
                  onChangeText={setWitnessNames}
                  placeholder="Full names of witnesses"
                  placeholderTextColor="#96A08D"
                />
              </View>
            )}
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.formSection}>
            <Text style={styles.sectionTag}>Section 3</Text>
            <Text style={styles.sectionHeading}>
              Resolution and supporting details
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Desired Resolution{' '}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={desiredResolution}
                onChangeText={setDesiredResolution}
                placeholder="e.g. Repair completed, eviction stopped, apology..."
                placeholderTextColor="#96A08D"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Phone or Email for Follow-up{' '}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={contactInfo}
                onChangeText={setContactInfo}
                placeholder="e.g. 919-555-0100 or name@email.com"
                placeholderTextColor="#96A08D"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Supporting Evidence{' '}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  hoveredUpload && styles.uploadBtnHover,
                ]}
                onPress={pickDocument}
                onMouseEnter={() => setHoveredUpload(true)}
                onMouseLeave={() => setHoveredUpload(false)}
                activeOpacity={0.85}>
                <Text style={styles.uploadBtnTitle}>Attach Images or PDFs</Text>
                <Text style={styles.uploadBtnText}>
                  Upload notices, screenshots, photos, or any documents that
                  support the report.
                </Text>
              </TouchableOpacity>

              {evidenceFiles.map((file, i) => (
                <View key={i} style={styles.fileRow}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeFile(i)}>
                    <Text style={styles.fileRemove}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {errors.submit ? (
            <View style={styles.submitError}>
              <Text style={styles.submitErrorText}>{errors.submit}</Text>
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
              activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              FairNest does not provide legal advice. For urgent matters,
              contact Legal Aid NC at 866-219-5262.
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
  marginBottom: '4px',
  borderRadius: '18px',
  border: `1px solid ${COLORS.border}`,
  fontSize: '16px',
  color: COLORS.textPrimary,
  backgroundColor: '#FCFDF9',
  outlineColor: COLORS.primary,
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
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
    right: -20,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(133, 196, 112, 0.18)',
  },
  heroGlowB: {
    position: 'absolute',
    bottom: -180,
    left: -80,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  heroEyebrow: {
    color: '#CBE8B8',
    fontSize: fontSize.small,
    ...font.extra,
    letterSpacing: 2,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: fontSize.hero,
    ...font.extra,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  heroSub: {
    fontSize: fontSize.bodyLg,
    lineHeight: 30,
    color: 'rgba(255,255,255,0.88)',
    maxWidth: 620,
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
    ...font.bold,
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
    ...font.extra,
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
    ...font.extra,
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
    ...font.extra,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  sidePanelTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    ...font.extra,
    marginBottom: 10,
  },
  sidePanelText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
    marginBottom: 18,
  },
  snapshotCard: {
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
    ...font.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  snapshotValue: {
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    ...font.semi,
    lineHeight: 20,
  },
  snapshotValueMuted: {
    color: '#8A9484',
    ...font.regular,
  },
  infoCallout: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  infoCalloutTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    ...font.extra,
    marginBottom: 6,
  },
  infoCalloutText: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 21,
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
    ...font.extra,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  formTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h2,
    ...font.extra,
  },
  formHelper: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
  },
  formSection: {
    marginBottom: 26,
  },
  sectionTag: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    ...font.extra,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  sectionHeading: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    ...font.extra,
    marginBottom: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(27, 94, 32, 0.08)',
    marginBottom: 28,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: fontSize.label,
    ...font.bold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  optional: {
    color: '#8C9587',
    ...font.regular,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fontSize.input,
    color: COLORS.textPrimary,
    backgroundColor: '#FCFDF9',
  },
  textarea: {
    minHeight: 160,
    textAlignVertical: 'top',
  },
  fieldMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  fieldMetaText: {
    color: '#A0A79A',
    fontSize: fontSize.tiny,
  },
  charCount: {
    fontSize: fontSize.tiny,
    color: '#A0A79A',
    textAlign: 'right',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: '#FBFCF8',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  optionBtnHover: {
    borderColor: 'rgba(46, 125, 50, 0.35)',
    backgroundColor: '#F1F8EC',
    transform: [{ translateY: -1 }],
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  optionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: fontSize.caption,
    color: COLORS.textMuted,
    ...font.semi,
  },
  optionTextHover: {
    color: COLORS.primaryDeep,
  },
  optionTextActive: {
    color: '#FFFFFF',
    ...font.extra,
  },
  toggleRow: {
    gap: 12,
  },
  toggleRowWide: {
    flexDirection: 'row',
  },
  toggleBtn: {
    flex: 1,
    minHeight: 62,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFCF8',
  },
  toggleBtnHover: {
    borderColor: 'rgba(46, 125, 50, 0.35)',
    backgroundColor: '#F1F8EC',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleText: {
    fontSize: fontSize.body,
    ...font.bold,
    color: COLORS.textMuted,
  },
  toggleTextHover: {
    color: COLORS.primaryDeep,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(46, 125, 50, 0.32)',
    borderStyle: 'dashed',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'flex-start',
    backgroundColor: '#F9FCF5',
    marginBottom: 10,
  },
  uploadBtnHover: {
    backgroundColor: '#EFF7E8',
    borderColor: COLORS.primary,
  },
  uploadBtnTitle: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.body,
    ...font.extra,
    marginBottom: 4,
  },
  uploadBtnText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F7EE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.06)',
  },
  fileName: {
    flex: 1,
    marginRight: 10,
    fontSize: fontSize.caption,
    color: COLORS.textPrimary,
  },
  fileRemove: {
    fontSize: fontSize.small,
    color: COLORS.primary,
    ...font.extra,
  },
  fieldError: {
    fontSize: fontSize.tiny,
    color: '#BE3A34',
    marginTop: 8,
  },
  submitError: {
    backgroundColor: '#FFF0EE',
    borderWidth: 1,
    borderColor: '#F1B3AD',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  submitErrorText: {
    color: '#BE3A34',
    fontSize: fontSize.small,
    textAlign: 'center',
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
  primaryBtnHover: {
    backgroundColor: COLORS.primaryDeep,
    transform: [{ translateY: -1 }],
  },
  primaryBtnDisabled: {
    backgroundColor: '#A7C8A3',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    ...font.extra,
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
    ...font.extra,
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
    ...font.extra,
    color: COLORS.textPrimary,
  },
  authText: {
    fontSize: fontSize.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
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
  },
  successTitle: {
    fontSize: fontSize.h2,
    ...font.extra,
    color: COLORS.textPrimary,
  },
  successText: {
    fontSize: fontSize.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 440,
    marginBottom: 10,
    lineHeight: 24,
  },
  uploadWarning: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    marginBottom: 4,
  },
  uploadWarningText: {
    fontSize: fontSize.small,
    color: '#F57F17',
    lineHeight: 20,
    textAlign: 'center',
  },
  successInfoBox: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  successInfoLabel: {
    fontSize: fontSize.caption,
    ...font.extra,
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
    ...font.extra,
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

