// src/services/api.js

const FUNCTION_URL =
  'https://us-central1-fairnest-abe1e.cloudfunctions.net/chatGPT';

export const aiService = {
  async getChatResponse(message) {
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
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
