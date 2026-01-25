import axios from 'axios';
import { API_BASE_URL, AI_API_KEY } from '@env';

const api = axios.create({
  baseURL: API_BASE_URL || 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    if (AI_API_KEY) {
      config.headers.Authorization = `Bearer ${AI_API_KEY}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const aiService = {
  // AI Chat completion
  getChatResponse: async (message) => {
    try {
      const response = await api.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for FairNest, helping Durham residents with housing rights, discrimination issues, and housing resources.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 500,
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  },

  // Get housing resources
  getHousingResources: async (location = 'Durham') => {
    try {
      // This would connect to your backend API
      const response = await api.get(`/resources?location=${location}`);
      return response.data;
    } catch (error) {
      console.error('Resources Error:', error);
      throw error;
    }
  },
};

export default api;