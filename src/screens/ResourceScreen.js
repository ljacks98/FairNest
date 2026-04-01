import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { resources as staticResources } from '../data/resources';
import Navbar from '../components/Navbar';

const FILTERS = [
  { label: 'All',                value: null },
  { label: 'Rental Assistance',  value: 'assistance' },
  { label: 'Affordable Housing', value: 'affordable' },
  { label: 'Legal Help',         value: 'legal' },
];

export default function ResourceScreen({ route }) {
  const { category, type } = route.params || {};
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [activeType, setActiveType]   = useState(type || null);
  const [resources, setResources]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [hoveredFilter, setHoveredFilter]   = useState(null);
  const [hoveredCard, setHoveredCard]       = useState(null);
  const [hoveredWebsite, setHoveredWebsite] = useState(null);

  // Try Firestore first, fall back to static data
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const q = query(
          collection(db, 'resources'),
          orderBy('title', 'asc')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setResources(staticResources);
        }
      } catch {
        // Firestore collection doesn't exist yet — use static data
        setResources(staticResources);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  const filtered = resources.filter(item => {
    if (category && category !== 'housing') {
      return item.category === category;
    }
    if (activeType) {
      return item.category === 'housing' && item.type === activeType;
    }
    return category ? item.category === category : true;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Navbar navigation={navigation} currentRoute="Resources" />

      {/* Breadcrumb */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <Text onPress={() => navigation.navigate('Home')} style={{ fontSize: 13, color: '#2E7D32', fontWeight: '600' }}>Home</Text>
        <Text style={{ fontSize: 13, color: '#bbb', marginHorizontal: 4 }}> / </Text>
        <Text style={{ fontSize: 13, color: '#666' }}>Resources</Text>
      </View>

      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          {category === 'employment' ? 'Employment Resources'
            : category === 'accessibility' ? 'Accessibility Resources'
            : 'Housing Resources'}
        </Text>
        <Text style={styles.pageSubtitle}>
          Local Durham programs, services, and legal aid
        </Text>
      </View>

      <View style={styles.body}>
        {/* Filters — only for housing */}
        {(!category || category === 'housing') && (
          <View style={styles.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={String(f.value)}
                style={[
                  styles.filterBtn,
                  activeType === f.value && styles.filterBtnActive,
                  activeType !== f.value && hoveredFilter === f.value && styles.filterBtnHover,
                ]}
                onPress={() => setActiveType(f.value)}
                onMouseEnter={() => setHoveredFilter(f.value)}
                onMouseLeave={() => setHoveredFilter(null)}
                activeOpacity={0.7}
                accessibilityLabel={`Filter by ${f.label}`}>
                <Text style={[styles.filterText, activeType === f.value && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results count */}
        <Text style={styles.resultsCount}>{filtered.length} resource{filtered.length !== 1 ? 's' : ''} found</Text>

        {/* Cards */}
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {filtered.map(resource => (
            <TouchableOpacity
              key={resource.id}
              style={[styles.card, isWide && styles.cardWide, hoveredCard === resource.id && styles.cardHover]}
              onMouseEnter={() => setHoveredCard(resource.id)}
              onMouseLeave={() => setHoveredCard(null)}
              activeOpacity={1}
              accessibilityLabel={resource.title}>
              {resource.type && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {resource.type === 'assistance' ? 'Rental Assistance'
                      : resource.type === 'affordable' ? 'Affordable Housing'
                      : resource.type === 'legal' ? 'Legal Help'
                      : resource.type}
                  </Text>
                </View>
              )}

              <Text style={styles.cardTitle}>{resource.title}</Text>
              <Text style={styles.cardDescription}>{resource.description}</Text>

              <View style={styles.cardDetails}>
                {resource.phone && (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${resource.phone}`)}>
                    <Text style={styles.detailRow}>📞 {resource.phone}</Text>
                  </TouchableOpacity>
                )}
                {resource.address && (
                  <Text style={styles.detailRow}>📍 {resource.address}</Text>
                )}
                {resource.eligibility && (
                  <Text style={styles.detailRow}>✅ {resource.eligibility}</Text>
                )}
              </View>

              {resource.website && (
                <TouchableOpacity
                  style={[styles.websiteBtn, hoveredWebsite === resource.id && styles.websiteBtnHover]}
                  onPress={() => Linking.openURL(resource.website)}
                  onMouseEnter={() => setHoveredWebsite(resource.id)}
                  onMouseLeave={() => setHoveredWebsite(null)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Visit ${resource.title} website`}>
                  <Text style={[styles.websiteBtnText, hoveredWebsite === resource.id && styles.websiteBtnTextHover]}>Visit Website →</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No resources found for this filter.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },

  pageHeader: {
    backgroundColor: '#1B5E20',
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  pageTitle:    { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  pageSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },

  body: { padding: 20, maxWidth: 1000, alignSelf: 'center', width: '100%' },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterBtnActive:  { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  filterText:       { fontSize: 14, color: '#555' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  resultsCount: { fontSize: 13, color: '#888', marginBottom: 14 },

  grid:     { gap: 14 },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardWide: { flex: 1, minWidth: 280, maxWidth: '48%' },

  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  typeBadgeText: { fontSize: 11, color: '#2E7D32', fontWeight: 'bold' },

  cardTitle:       { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 6 },
  cardDescription: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },

  cardDetails: { gap: 5, marginBottom: 14 },
  detailRow:   { fontSize: 13, color: '#555', lineHeight: 20 },

  websiteBtn: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  websiteBtnHover:     { backgroundColor: '#2E7D32' },
  websiteBtnText:      { color: '#2E7D32', fontWeight: 'bold', fontSize: 13 },
  websiteBtnTextHover: { color: '#fff' },

  filterBtnHover: { backgroundColor: '#f0f7f0', borderColor: '#2E7D32' },

  cardHover: {
    borderColor: '#2E7D32',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  empty:     { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#999' },
});
