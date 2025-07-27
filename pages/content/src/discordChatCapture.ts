// Detect Discord chat container and capture messages
function captureDiscordMessages() {
  const chatElements = document.querySelectorAll('[class^="messageContent_"]');
  return Array.from(chatElements)
    .map(el => el.textContent?.trim())
    .filter(Boolean);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureDiscordChat') {
    const messages = captureDiscordMessages();
    sendResponse(messages);
  }
});

// Add message sending capability
function sendChatMessage(message: string) {
  const input = document.querySelector('[role="textbox"][aria-label="Message #"]') as HTMLDivElement;
  if (input) {
    input.focus();
    document.execCommand('insertText', false, message);
    (input.parentElement?.parentElement?.querySelector('button[type="submit"]') as HTMLElement)?.click();
  }
}

// Listen for AI responses
chrome.runtime.onMessage.addListener(request => {
  if (request.action === 'sendChatResponse' && request.message) {
    sendChatMessage(request.message);
  }
});
