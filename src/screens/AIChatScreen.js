import React, { useState, useEffect, useContext, useRef } from 'react';
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
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { aiService } from '../services/api';
import { COLORS } from '../utils/constants';
import { fontSize, font } from '../theme/typography';

export default function AIChatScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const flatListRef = useRef(null);

  const chatRef = collection(
    db,
    'users',
    user.uid,
    'aiChats',
    'default',
    'messages'
  );

  useEffect(() => {
    const q = query(chatRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
        setHistoryLoading(false);
      },
      () => {
        setHistoryLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);

    try {
      await addDoc(chatRef, {
        role: 'user',
        content: userMessage,
        timestamp: serverTimestamp(),
      });

      const reply = await aiService.getChatResponse(userMessage);

      await addDoc(chatRef, {
        role: 'assistant',
        content: reply,
        timestamp: serverTimestamp(),
      });
    } catch {
      await addDoc(chatRef, {
        role: 'assistant',
        content: 'Something went wrong. Please check your connection and try again.',
        timestamp: serverTimestamp(),
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAi,
          ]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  if (historyLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back">
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerDot} />
        <View>
          <Text style={styles.headerTitle}>FairNest AI</Text>
          <Text style={styles.headerSub}>Housing rights assistant</Text>
        </View>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyTitle}>How can I help you?</Text>
          <Text style={styles.emptyDesc}>
            Ask me about Durham housing rights, fair housing law, or local resources.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about housing rights..."
          placeholderTextColor={COLORS.placeholder}
          maxLength={2000}
          multiline
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!message.trim() || loading) && styles.sendBtnDisabled,
          ]}
          onPress={sendMessage}
          disabled={!message.trim() || loading}
          activeOpacity={0.7}
          accessibilityLabel="Send message">
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        AI responses are for informational purposes only, not legal advice.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    marginRight: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: fontSize.body,
    color: COLORS.primary,
    ...font.semi,
  },
  headerDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.body,
    ...font.bold,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: fontSize.tiny,
    color: COLORS.subtle,
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: fontSize.h2,
    ...font.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: fontSize.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },

  // Messages
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  aiAvatarText: {
    color: COLORS.white,
    fontSize: fontSize.tiny,
    ...font.bold,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {},
  bubbleText: {
    fontSize: fontSize.body,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: COLORS.white,
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingText: {
    fontSize: fontSize.caption,
    color: COLORS.subtle,
  },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSize.body,
    backgroundColor: COLORS.inputBg,
    maxHeight: 100,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.secondary,
    opacity: 0.5,
  },
  sendBtnText: {
    color: COLORS.white,
    fontSize: fontSize.h3,
    ...font.bold,
    marginTop: -2,
  },

  footerNote: {
    fontSize: fontSize.tiny,
    color: COLORS.muted,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
});
