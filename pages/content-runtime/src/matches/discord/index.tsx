import inlineCss from '../../../dist/discord/index.css?inline';
import { initAppWithShadow } from '@extension/shared';
import App from '@src/matches/discord/App';

initAppWithShadow({ id: 'CEB-extension-runtime-discord', app: <App />, inlineCss });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendChatResponse') {
    console.log('start chat');
  }
  return true; // Indicates we want to send a response asynchronously
});
