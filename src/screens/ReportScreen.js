```js
// =======================
// STATE (TOP OF COMPONENT)
// =======================

const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [submittedReportId, setSubmittedReportId] = useState(null);


// =======================
// SUBMIT FUNCTION
// =======================

const handleSubmit = async () => {
  try {
    setSubmitting(true);

    const docRef = await addDoc(collection(db, 'reports'), {
      userId: user.uid,
      issueType: housingIssueType,
      description,
      createdAt: serverTimestamp(),
    });

    setSubmittedReportId(docRef.id);

    setSubmitting(false);
    setSubmitted(true);

  } catch (error) {
    console.log(error);
    setSubmitting(false);
  }
};


// =======================
// SUCCESS SCREEN (PUT ABOVE RETURN)
// =======================

if (submitted) {
  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="Report" />

      <View style={styles.successState}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-circle-outline" size={40} color="#2E7D32" />
        </View>

        <Text style={styles.successTitle}>Report Submitted</Text>

        <Text style={styles.successText}>
          Your report has been received. You can track its status in your profile under "My Reports".
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('ScheduleCall', {
              reportId: submittedReportId,
              reportType: housingIssueType,
            })
          }
        >
          <Text style={styles.primaryBtnText}>
            Schedule a Call with an Advocate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.secondaryBtnText}>
            View My Reports
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

