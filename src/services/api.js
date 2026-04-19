// src/services/api.js
import { API_BASE_URL } from '@env';

const FUNCTION_URL = API_BASE_URL || 'https://us-central1-fairnest-abe1e.cloudfunctions.net/chatGPT';

const MAX_MESSAGE_LENGTH = 2000;

export const aiService = {
  async getChatResponse(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required.');
    }

    const sanitized = message.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!sanitized) {
      throw new Error('Message cannot be empty.');
    }

    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: sanitized }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  },
};
