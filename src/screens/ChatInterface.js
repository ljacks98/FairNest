import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { fontSize, font } from '../theme/typography';

const SUGGESTED_QUESTIONS = [
  'Can my landlord evict me without notice?',
  'What counts as housing discrimination?',
  'How do I report a fair housing violation?',
  'What are my rights if my landlord won\'t make repairs?',
];

export default function ChatInterface({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const isWide = width >= 700;

  const [messages, setMessages]           = useState([]);
  const [inputText, setInputText]         = useState('');
  const [loading, setLoading]             = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const flatListRef = useRef(null);

  // ── Load history ───────────────────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) { setHistoryLoading(false); return; }
      try {
        const q = query(
          collection(db, 'users', user.uid, 'chatHistory'),
          orderBy('timestamp', 'asc')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setMessages(snap.docs.map(d => ({
            id: d.id,
            text: d.data().text,
            sender: d.data().sender,
            timestamp: d.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          })));
        }
      } catch (err) {
        console.log('History load error:', err);
      }
      setHistoryLoading(false);
    };
    loadHistory();
  }, [user]);

  // ── Save message (user history + admin-readable chatLogs) ─────────
  const saveMessage = async (msg) => {
    if (!user) return;
    const payload = {
      text: msg.text,
      sender: msg.sender,
      timestamp: serverTimestamp(),
    };
    try {
      // 1. User's personal history
      await addDoc(collection(db, 'users', user.uid, 'chatHistory'), payload);
      // 2. Admin-visible log (top-level collection, queryable by userId)
      await addDoc(collection(db, 'chatLogs'), {
        ...payload,
        userId: user.uid,
        userEmail: user.email || '',
      });
    } catch (err) {
      console.log('Save error:', err);
    }
  };

  // ── Send ───────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = text || inputText;
    if (!msg.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: msg.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(
        'https://us-central1-fairnest-abe1e.cloudfunctions.net/chatGPT',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg.trim() }),
        }
      );
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: data.reply || 'No response received.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      saveMessage(aiMessage);
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Something went wrong. Please check your connection and try again.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi, isWide && styles.bubbleWide]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
          <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  if (historyLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerAiDot} />
        <View>
          <Text style={styles.headerTitle}>FairNest AI Assistant</Text>
          <Text style={styles.headerSub}>Ask about housing rights, eviction, or discrimination</Text>
        </View>
      </View>

      {/* Message area */}
      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>How can I help you today?</Text>
          <Text style={styles.emptyDesc}>
            Ask me anything about Durham housing rights, fair housing law, eviction, or how to find local resources.
          </Text>
          <View style={[styles.suggestionsGrid, isWide && styles.suggestionsGridWide]}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionBtn}
                onPress={() => sendMessage(q)}>
                <Text style={styles.suggestionText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Typing indicator */}
      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color="#2E7D32" />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputBar, isWide && styles.inputBarWide]}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about housing rights, eviction, discrimination..."
          multiline
          maxHeight={100}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || loading}>
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>AI responses are for informational purposes only, not legal advice.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerAiDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: fontSize.body, ...font.bold, color: '#1a1a1a' },
  headerSub:   { fontSize: fontSize.tiny, color: '#888', marginTop: 1 },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon:  { fontSize: fontSize.hero, marginBottom: 16 },
  emptyTitle: { fontSize: fontSize.h2, ...font.bold, color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  emptyDesc:  { fontSize: fontSize.body, color: '#666', textAlign: 'center', lineHeight: 22, maxWidth: 400, marginBottom: 28 },

  suggestionsGrid:     { width: '100%', maxWidth: 600, gap: 10 },
  suggestionsGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  suggestionBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0e8d0',
    borderRadius: 10,
    padding: 14,
    flex: 1,
    minWidth: 200,
  },
  suggestionText: { fontSize: fontSize.caption, color: '#2E7D32', lineHeight: 18 },

  // Messages
  messageList: { padding: 16, paddingBottom: 8 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 8,
  },
  messageRowUser: { flexDirection: 'row-reverse' },

  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  aiAvatarText: { color: '#fff', fontSize: fontSize.tiny, ...font.bold },

  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
  },
  bubbleWide:     { maxWidth: '60%' },
  bubbleUser:     { backgroundColor: '#2E7D32', borderColor: '#2E7D32', borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  bubbleAi:       {},
  bubbleText:     { fontSize: fontSize.body, color: '#333', lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTime:     { fontSize: fontSize.tiny, color: '#aaa', marginTop: 5, alignSelf: 'flex-end' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)' },

  // Typing
  typingRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  typingText:   { fontSize: fontSize.caption, color: '#888' },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  inputBarWide: { paddingHorizontal: 24 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: fontSize.input,
    backgroundColor: '#fafafa',
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { backgroundColor: '#a5d6a7' },
  sendBtnText:     { color: '#fff', fontSize: fontSize.h3, ...font.bold, marginTop: -2 },

  footerNote: { fontSize: fontSize.tiny, color: '#bbb', textAlign: 'center', paddingVertical: 4, backgroundColor: '#fff' },
  backBtn: { marginRight: 8, paddingHorizontal: 4, paddingVertical: 4 },
  backBtnText: { fontSize: fontSize.body, color: '#2E7D32', ...font.semi },
});
