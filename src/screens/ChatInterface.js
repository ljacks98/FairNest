import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';

export default function ChatInterface() {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  // 🔒 Hard protection
  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.lockedText}>
          Please log in to use the AI Assistant.
        </Text>
      </View>
    );
  }

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput('');

    // 🧠 Mock AI Response (temporary)
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your question. AI integration coming next.',
        sender: 'ai',
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 800);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble,
      ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about housing, eviction, discrimination..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 16,
    color: '#555',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#2E7D32',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
