import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function ReportScreen() {
  const [incidentDate, setIncidentDate] = useState('');
  const [housingIssueType, setHousingIssueType] = useState('');
  const [discriminationBasis, setDiscriminationBasis] = useState('');
  const [witnesses, setWitnesses] = useState('No');
  const [witnessNames, setWitnessNames] = useState('');
  const [description, setDescription] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const storage = getStorage();
  const auth = getAuth();

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: true,
    });

    if (!result.canceled) {
      setEvidenceFiles([...evidenceFiles, ...result.assets]);
    }
  };

  const uploadEvidenceFiles = async (reportId) => {
    if (!evidenceFiles.length) return [];

    const uploadedUrls = [];

    for (const file of evidenceFiles) {
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const fileRef = ref(
        storage,
        `reportEvidence/${auth.currentUser?.uid || 'anonymous'}/${reportId}/${file.name}`
      );

      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      uploadedUrls.push(downloadURL);
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;

      if (!description) {
        Alert.alert('Missing Info', 'Please describe what happened.');
        return;
      }

      // 1️⃣ Create report first
      const reportRef = await addDoc(collection(db, 'reports'), {
        userId: user?.uid || 'anonymous',
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

      // 2️⃣ Upload evidence files
      const evidenceUrls = await uploadEvidenceFiles(reportRef.id);

      // 3️⃣ Update report with file URLs
      if (evidenceUrls.length) {
        await updateDoc(reportRef, {
          evidenceUrls,
        });
      }

      Alert.alert('Success', 'Report submitted successfully.');

      // 4️⃣ Clear form
      setIncidentDate('');
      setHousingIssueType('');
      setDiscriminationBasis('');
      setWitnesses('No');
      setWitnessNames('');
      setDescription('');
      setDesiredResolution('');
      setContactInfo('');
      setEvidenceFiles([]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Submission failed.');
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Housing Discrimination Report
      </Text>

      <Text>Date of Incident</Text>

      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 15,
            borderRadius: 5,
            border: '1px solid #ccc',
            fontSize: 16,
          }}
        />
      ) : (
        <TextInput
          style={styles.input}
          value={incidentDate}
          onChangeText={setIncidentDate}
          placeholder="MM/DD/YYYY"
        />
      )}

      <Text>Type of Housing Issue</Text>
      <TextInput
        placeholder="Eviction, Denial, Harassment, Other"
        value={housingIssueType}
        onChangeText={setHousingIssueType}
        style={styles.input}
      />

      <Text>Basis of Discrimination</Text>
      <TextInput
        placeholder="Race, Gender, Disability, Family Status..."
        value={discriminationBasis}
        onChangeText={setDiscriminationBasis}
        style={styles.input}
      />

      <Text>Were there witnesses? (Yes/No)</Text>
      <TextInput
        value={witnesses}
        onChangeText={setWitnesses}
        style={styles.input}
      />

      <Text>Witness Name(s)</Text>
      <TextInput
        value={witnessNames}
        onChangeText={setWitnessNames}
        style={styles.input}
      />

      <Text>Describe What Happened</Text>
      <TextInput
        multiline
        numberOfLines={5}
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 120 }]}
      />

      <Text>Desired Resolution</Text>
      <TextInput
        value={desiredResolution}
        onChangeText={setDesiredResolution}
        style={styles.input}
      />

      <Text>Phone or Email (optional)</Text>
      <TextInput
        value={contactInfo}
        onChangeText={setContactInfo}
        style={styles.input}
      />
      <Text style={{ marginBottom: 5 }}>Supporting Evidence (Optional)</Text>

      <TouchableOpacity onPress={pickDocument} style={styles.input}>
        <Text style={{ color: evidenceFiles.length ? '#000' : '#999' }}>
          {evidenceFiles.length
            ? `${evidenceFiles.length} file(s) selected`
            : 'Upload Images or PDFs'}
        </Text>
      </TouchableOpacity>

      {evidenceFiles.map((file, index) => (
        <Text key={index} style={{ fontSize: 12, marginBottom: 5 }}>
          • {file.name}
        </Text>
      ))}

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Submit Report
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 15,
    marginTop: 10,
    borderRadius: 5,
  },
};
