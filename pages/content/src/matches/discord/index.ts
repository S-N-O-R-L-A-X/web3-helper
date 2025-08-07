/**
 * Discord Chat Capture Content Script
 * Captures messages from Discord chat and sends them to background script
 */
console.log('Discord Chat Capture content script loaded');

// Initialize chat message observer
const initChatObserver = () => {
  // Target the chat messages container
  const chatContainer = document.querySelector('[class^="chatContent"]');

  if (!chatContainer) {
    console.warn('Discord chat container not found');
    return;
  }

  // Create observer to detect new messages
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const messageElement = node as HTMLElement;
          const messageId = messageElement.getAttribute('data-message-id');

          if (messageId && messageElement.querySelector('[class^="messageContent"]')) {
            const username = messageElement.querySelector('[class^="username"]')?.textContent?.trim();
            const content = messageElement.querySelector('[class^="messageContent"]')?.textContent?.trim();
            const timestamp = messageElement.querySelector('time')?.getAttribute('datetime');

            if (username && content && timestamp) {
              // Send captured message to background script
              chrome.runtime.sendMessage({
                type: 'DISCORD_MESSAGE',
                data: {
                  id: messageId,
                  username,
                  content,
                  timestamp,
                  url: window.location.href,
                },
              });
            }
          }
        }
      });
    });
  });

  // Start observing
  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
  });

  console.log('Chat observer initialized');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatObserver);
} else {
  initChatObserver();
}
