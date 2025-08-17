import '@src/index.css';
import Popup from '@src/Popup';
import { createRoot } from 'react-dom/client';

const init = async () => {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }

  const tab = await chrome.tabs.query({ active: true });
  const id = tab[0].id!;
  await chrome.scripting.executeScript({
    target: { tabId: id },
    files: ['/content-runtime/discord.iife.js'],
  });
  const root = createRoot(appContainer);

  root.render(<Popup />);
};

init();
