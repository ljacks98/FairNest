import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminDashboardScreen() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      const snapshot = await getDocs(collection(db, 'reports'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(data);
    };

    fetchReports();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 15, borderWidth: 1, padding: 10 }}>
            <Text>Type: {item.type}</Text>
            <Text>Status: {item.status}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}
