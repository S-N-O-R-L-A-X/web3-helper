import 'webextension-polyfill';
import { exampleThemeStorage, trackedProjectsStorage } from '@extension/storage';
import axios from 'axios';

// Store API key in memory for quick access
let openaiApiKey: string | null = null;

// Load API key from storage on startup
chrome.storage.local.get('openaiApiKey', result => {
  openaiApiKey = result.openaiApiKey || null;
});

// Listen for API key updates from the options page
chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'API_KEY_UPDATED') {
    openaiApiKey = message.apiKey;
  }
});

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

// 定时每天4:00重置每日签到状态
const scheduleDailyReset = () => {
  const now = new Date();
  const next = new Date();
  next.setHours(4, 0, 0, 0);
  if (now > next) {
    next.setDate(next.getDate() + 1);
  }
  const ms = next.getTime() - now.getTime();
  setTimeout(async () => {
    await trackedProjectsStorage.resetDailyCheckIn();
    scheduleDailyReset(); // 递归设置下一次
  }, ms);
};

scheduleDailyReset();

// Handle Discord chat processing
chrome.runtime.onMessage.addListener(async request => {
  if (request.action === 'processChatWithAI') {
    try {
      // Use API key from storage
      if (!openaiApiKey) {
        throw new Error('API key not configured. Please set your OpenAI API key in the extension options.');
      }

      // Prepare API request - request.content is an array of messages
      const prompt = request.content.join('\n\n');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Extract response text
      const aiResponse = response.data.choices[0].message.content.trim();

      // Send the AI response to the content script
      chrome.tabs.sendMessage(request.tabId, {
        action: 'sendChatResponse',
        message: aiResponse,
      });
    } catch (error) {
      console.error('Error processing Discord chat:', error);
    }
  }
});
