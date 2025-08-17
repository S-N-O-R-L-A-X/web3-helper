import inlineCss from '../../../dist/example/index.css?inline';
import { initAppWithShadow } from '@extension/shared';
import App from '@src/matches/example/App';

initAppWithShadow({ id: 'CEB-extension-runtime-example', app: <App />, inlineCss });

console.log('test');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendChatResponse') {
    alert('test why');
  }
  return true; // Indicates we want to send a response asynchronously
});
