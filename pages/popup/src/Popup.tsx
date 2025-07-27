import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';

const Popup = () => {
  const [error, setError] = useState<string | null>(null);

  const handleOpenSidePanel = async () => {
    setError(null);
    try {
      if (chrome?.sidePanel?.setOptions && chrome?.sidePanel?.open) {
        const [currentWindow] = await chrome.windows.getAll({ populate: false, windowTypes: ['normal'] });
        await chrome.sidePanel.setOptions({ enabled: true });
        if (typeof currentWindow.id === 'number') {
          await chrome.sidePanel.open({ windowId: currentWindow.id });
        } else {
          throw new Error('无法获取当前窗口 ID');
        }
      } else {
        throw new Error('当前浏览器不支持 sidePanel API');
      }
    } catch (e) {
      setError((e as Error)?.message || '打开侧边栏失败');
    }
  };

  const startAutomatedChat = async () => {
    setError(null);
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('无法获取活动标签页');

      // Send message to content script to capture chat
      const chatContent = await chrome.tabs.sendMessage(tab.id, {
        action: 'captureDiscordChat',
      });

      if (!chatContent) throw new Error('无法获取聊天内容');

      // Send to background for processing
      chrome.runtime.sendMessage({
        action: 'processChatWithAI',
        content: chatContent,
        tabId: tab.id,
      });
    } catch (e) {
      setError((e as Error)?.message || '启动自动聊天失败');
    }
  };

  return (
    <div className="w-56 p-4">
      <button
        className="mb-2 w-full rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
        onClick={handleOpenSidePanel}>
        查看项目情况
      </button>
      <button
        className="mb-2 w-full rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
        onClick={startAutomatedChat}>
        在当前discord进行聊天
      </button>
      {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
