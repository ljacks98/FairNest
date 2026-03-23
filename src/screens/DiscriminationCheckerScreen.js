import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Navbar from '../components/Navbar';

// ── Data ──────────────────────────────────────────────────────────────────────

const PROTECTED_CLASSES = [
  { id: 'race',       label: 'Race or Color' },
  { id: 'religion',   label: 'Religion' },
  { id: 'sex',        label: 'Sex, Gender, Pregnancy, or LGBTQ+ Status' },
  { id: 'national',   label: 'National Origin' },
  { id: 'age',        label: 'Age (40 or older)' },
  { id: 'disability', label: 'Disability' },
  { id: 'family',     label: 'Familial Status (e.g. having children)' },
];

const ADVERSE_ACTIONS = [
  { id: 'eviction',    label: 'Eviction or Wrongful Removal' },
  { id: 'denial',      label: 'Denied Housing or Rental Application' },
  { id: 'harassment',  label: 'Harassment or Intimidation by Landlord' },
  { id: 'terms',       label: 'Different or Unfair Lease Terms' },
  { id: 'repairs',     label: 'Refusal to Make Repairs' },
  { id: 'advertising', label: 'Discriminatory Advertising or Statements' },
  { id: 'other',       label: 'Other Unfair Treatment' },
];

const CAUSAL_EVIDENCE = [
  { id: 'treated_diff', label: 'I was treated differently than others outside my protected class' },
  { id: 'comments',     label: 'The person made comments about my race, religion, disability, etc.' },
  { id: 'timing',       label: 'This happened shortly after they learned of my protected status' },
  { id: 'pattern',      label: 'There is a pattern of this behavior toward others like me' },
  { id: 'witnesses',    label: 'I have witnesses or documentation of the incident' },
];

const STEPS = [
  {
    id: 'protected_class',
    stepNum: 1,
    title: 'Protected Class Membership',
    subtitle: 'To qualify, you must belong to a legally protected group.',
    legal: 'Federal fair housing law (Fair Housing Act) protects individuals from discrimination based on specific characteristics. You must show you belong to at least one protected class.',
    question: 'Which of the following apply to you?',
    hint: 'Select all that apply',
    type: 'multi',
    options: PROTECTED_CLASSES,
    minRequired: 1,
    failMessage: 'You have not selected a protected class. Federal fair housing law requires membership in a protected class. However, you may still have rights under North Carolina state law — contact Legal Aid NC for guidance.',
  },
  {
    id: 'adverse_action',
    stepNum: 2,
    title: 'Adverse Housing Action',
    subtitle: 'You must have experienced a real negative housing event.',
    legal: 'The law requires that you suffered a significant, negative housing action — not just a feeling of unfair treatment. The action must be concrete and documented.',
    question: 'What happened to you?',
    hint: 'Select all that apply',
    type: 'multi',
    options: ADVERSE_ACTIONS,
    minRequired: 1,
    failMessage: 'The situation you described may not meet the threshold of an "adverse housing action" under the Fair Housing Act. Consider speaking with Legal Aid NC to better understand your options.',
  },
  {
    id: 'causal_link',
    stepNum: 3,
    title: 'Connection to Protected Status',
    subtitle: 'You must show the action happened because of your protected status.',
    legal: 'This is the hardest element to prove. You must show that the adverse action was linked to your protected characteristic — not an unrelated reason. Evidence and documentation are critical here.',
    question: 'Which of the following can you demonstrate?',
    hint: 'Select all that apply — more is stronger',
    type: 'multi',
    options: CAUSAL_EVIDENCE,
    minRequired: 1,
    failMessage: 'Without a clear link between the action and your protected status, it may be difficult to prove discrimination. We still encourage you to document everything and consult with Legal Aid NC.',
  },
];

// ── Scoring ───────────────────────────────────────────────────────────────────

function getResult(answers) {
  const step1 = answers.protected_class?.length || 0;
  const step2 = answers.adverse_action?.length || 0;
  const step3 = answers.causal_link?.length || 0;

  if (step1 === 0 || step2 === 0) {
    return 'weak';
  }
  if (step3 >= 3) return 'strong';
  if (step3 >= 1) return 'possible';
  return 'weak';
}

const RESULTS = {
  strong: {
    icon: '✅',
    color: '#2E7D32',
    bg: '#E8F5E9',
    border: '#A5D6A7',
    title: 'Your situation likely qualifies',
    summary:
      'Based on your answers, you appear to meet all three legal criteria for a housing discrimination claim. You should file a report.',
    advice: [
      'Document everything: dates, names, conversations, and any written communication.',
      'File a report with FairNest so it is on record.',
      'Contact Legal Aid NC (866-219-5262) for free legal assistance.',
      'You may also file directly with HUD at hud.gov/fair_housing.',
    ],
  },
  possible: {
    icon: '⚠️',
    color: '#E65100',
    bg: '#FFF3E0',
    border: '#FFCC80',
    title: 'Your situation may qualify',
    summary:
      'You meet some of the criteria, but your case may need more evidence to be actionable. It is still worth filing a report and speaking with an attorney.',
    advice: [
      'Start documenting everything now — evidence gathered later is less credible.',
      'File a report with FairNest to create an official record.',
      'Speak with Legal Aid NC (866-219-5262) for a free case evaluation.',
      'Ask neighbors or colleagues if they have experienced similar treatment.',
    ],
  },
  weak: {
    icon: '❌',
    color: '#B71C1C',
    bg: '#FFEBEE',
    border: '#EF9A9A',
    title: 'Your situation may not qualify under federal law',
    summary:
      'Based on your answers, your situation may not meet the required legal criteria for a Fair Housing Act claim. This does not mean nothing wrong happened — North Carolina state law may offer additional protections.',
    advice: [
      'Contact Legal Aid NC (866-219-5262) for a free consultation — state law may still apply.',
      'Document your experience in case the situation escalates.',
      'Browse our Resources page for housing assistance and advocacy organizations.',
      'You can still use our AI Assistant to better understand your situation.',
    ],
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DiscriminationCheckerScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-3 = steps, 4 = result
  const [answers, setAnswers] = useState({});

  const step = STEPS[currentStep - 1];
  const totalSteps = STEPS.length;
  const isIntro = currentStep === 0;
  const isResult = currentStep === totalSteps + 1;

  const toggleOption = (stepId, optionId) => {
    setAnswers(prev => {
      const current = prev[stepId] || [];
      const updated = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      return { ...prev, [stepId]: updated };
    });
  };

  const canProceed = () => {
    if (!step) return false;
    return (answers[step.id]?.length || 0) >= step.minRequired;
  };

  const handleNext = () => {
    if (currentStep <= totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
  };

  const result = isResult ? RESULTS[getResult(answers)] : null;

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="DiscriminationChecker" />

      {/* ── Intro ── */}
      {isIntro && (
        <>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>KNOW YOUR RIGHTS</Text>
            <Text style={styles.heroTitle}>Does Your Situation Qualify?</Text>
            <Text style={styles.heroSub}>
              Answer 3 short questions to find out if your housing experience
              meets the legal criteria for a discrimination claim.
            </Text>
          </View>

          <View style={[styles.card, isWide && styles.cardWide]}>
            <Text style={styles.cardTitle}>The 3 Legal Criteria</Text>
            <Text style={styles.cardSubtitle}>
              Under federal fair housing law, you must establish all three of
              the following to file a valid discrimination claim:
            </Text>

            {STEPS.map((s, i) => (
              <View key={s.id} style={styles.criteriaRow}>
                <View style={styles.criteriaNumber}>
                  <Text style={styles.criteriaNumberText}>{i + 1}</Text>
                </View>
                <View style={styles.criteriaContent}>
                  <Text style={styles.criteriaTitle}>{s.title}</Text>
                  <Text style={styles.criteriaDesc}>{s.subtitle}</Text>
                </View>
              </View>
            ))}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This tool provides educational guidance only and is not legal
                advice. Results are based on general fair housing law principles.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setCurrentStep(1)}>
              <Text style={styles.primaryBtnText}>Start the Checker →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Step ── */}
      {!isIntro && !isResult && step && (
        <>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
          </View>

          <View style={[styles.card, isWide && styles.cardWide]}>
            {/* Step header */}
            <View style={styles.stepHeader}>
              <Text style={styles.stepLabel}>STEP {step.stepNum} OF {totalSteps}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
            </View>

            {/* Legal context box */}
            <View style={styles.legalBox}>
              <Text style={styles.legalBoxLabel}>⚖️ The Law Says</Text>
              <Text style={styles.legalBoxText}>{step.legal}</Text>
            </View>

            {/* Question */}
            <Text style={styles.question}>{step.question}</Text>
            <Text style={styles.hint}>{step.hint}</Text>

            {/* Options */}
            {step.options.map(opt => {
              const selected = (answers[step.id] || []).includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionRow, selected && styles.optionRowSelected]}
                  onPress={() => toggleOption(step.id, opt.id)}>
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Fail message if none selected and trying to proceed */}
            {!canProceed() && answers[step.id] !== undefined && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>{step.failMessage}</Text>
              </View>
            )}

            {/* Nav buttons */}
            <View style={styles.navRow}>
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }, !canProceed() && styles.primaryBtnDisabled]}
                onPress={handleNext}>
                <Text style={styles.primaryBtnText}>
                  {currentStep === totalSteps ? 'See Results →' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* ── Result ── */}
      {isResult && result && (
        <>
          <View style={[styles.resultHero, { backgroundColor: result.bg, borderBottomColor: result.border }]}>
            <Text style={styles.resultIcon}>{result.icon}</Text>
            <Text style={[styles.resultTitle, { color: result.color }]}>{result.title}</Text>
            <Text style={styles.resultSummary}>{result.summary}</Text>
          </View>

          <View style={[styles.card, isWide && styles.cardWide]}>
            {/* Answers summary */}
            <Text style={styles.cardTitle}>Your Answers</Text>
            {STEPS.map(s => {
              const chosen = answers[s.id] || [];
              return (
                <View key={s.id} style={styles.answerRow}>
                  <View style={styles.answerHeader}>
                    <Text style={styles.answerStepLabel}>Step {s.stepNum}</Text>
                    <Text style={styles.answerStepTitle}>{s.title}</Text>
                  </View>
                  {chosen.length > 0 ? (
                    chosen.map(id => {
                      const opt = s.options.find(o => o.id === id);
                      return opt ? (
                        <Text key={id} style={styles.answerItem}>✓ {opt.label}</Text>
                      ) : null;
                    })
                  ) : (
                    <Text style={styles.answerNone}>None selected</Text>
                  )}
                </View>
              );
            })}

            <View style={styles.divider} />

            {/* Next steps */}
            <Text style={styles.cardTitle}>Recommended Next Steps</Text>
            {result.advice.map((tip, i) => (
              <View key={i} style={styles.adviceRow}>
                <Text style={styles.adviceNum}>{i + 1}</Text>
                <Text style={styles.adviceText}>{tip}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Actions */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Report')}>
              <Text style={styles.primaryBtnText}>File a Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Resources', { category: 'housing' })}>
              <Text style={styles.secondaryBtnText}>Find Local Resources</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={handleReset}>
              <Text style={styles.ghostBtnText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Hero
  hero: {
    backgroundColor: '#1B5E20',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  heroTitle:  { fontSize: 30, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  heroSub:    { fontSize: 16, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24, maxWidth: 580 },

  // Progress
  progressBar: { height: 4, backgroundColor: '#e0e0e0' },
  progressFill: { height: 4, backgroundColor: '#2E7D32' },

  // Card
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardWide:     { maxWidth: 700, alignSelf: 'center', width: '100%' },
  cardTitle:    { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  cardSubtitle: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 20 },

  // Intro criteria
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 14,
  },
  criteriaNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  criteriaNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  criteriaContent:    { flex: 1 },
  criteriaTitle:      { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 3 },
  criteriaDesc:       { fontSize: 13, color: '#666', lineHeight: 19 },

  disclaimer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  disclaimerText: { fontSize: 12, color: '#795548', lineHeight: 18 },

  // Step
  stepHeader:   { marginBottom: 20 },
  stepLabel:    { fontSize: 11, fontWeight: 'bold', color: '#2E7D32', letterSpacing: 2, marginBottom: 8 },
  stepTitle:    { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  stepSubtitle: { fontSize: 14, color: '#666', lineHeight: 20 },

  legalBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  legalBoxLabel: { fontSize: 13, fontWeight: 'bold', color: '#2E7D32', marginBottom: 6 },
  legalBoxText:  { fontSize: 13, color: '#2E7D32', lineHeight: 20 },

  question: { fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  hint:     { fontSize: 12, color: '#999', marginBottom: 16 },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    backgroundColor: '#fafafa',
  },
  optionRowSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxSelected: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  checkmark:        { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  optionLabel:      { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
  optionLabelSelected: { color: '#1B5E20', fontWeight: '600' },

  warningBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  warningText: { fontSize: 13, color: '#795548', lineHeight: 19 },

  navRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  backBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 15, color: '#555', fontWeight: '600' },

  // Result
  resultHero: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  resultIcon:    { fontSize: 52, marginBottom: 12 },
  resultTitle:   { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  resultSummary: { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 23, maxWidth: 560 },

  answerRow: { marginBottom: 18 },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  answerStepLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  answerStepTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  answerItem:      { fontSize: 13, color: '#2E7D32', marginLeft: 8, marginBottom: 3 },
  answerNone:      { fontSize: 13, color: '#bbb', marginLeft: 8, fontStyle: 'italic' },

  adviceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  adviceNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 24,
    flexShrink: 0,
  },
  adviceText: { fontSize: 14, color: '#444', lineHeight: 21, flex: 1 },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },

  // Buttons
  primaryBtn:         { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  primaryBtnDisabled: { backgroundColor: '#a5d6a7' },
  primaryBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn:       { borderWidth: 1.5, borderColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  secondaryBtnText:   { color: '#2E7D32', fontWeight: 'bold', fontSize: 15 },
  ghostBtn:           { padding: 12, alignItems: 'center' },
  ghostBtnText:       { color: '#aaa', fontSize: 14 },
});
