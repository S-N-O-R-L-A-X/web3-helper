import 'webextension-polyfill';
import { exampleThemeStorage, trackedProjectsStorage } from '@extension/storage';

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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'processChatWithAI')
    try {
      chrome.tabs.sendMessage(request.tabId, {
        action: 'sendChatResponse',
        message: 'success',
      });
    } catch (i) {
      console.error('Error processing Discord chat:', i);
    }
});
