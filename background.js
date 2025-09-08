chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getApiKey") {
    chrome.storage.local.get(['apiKey'], (result) => {
      sendResponse({ apiKey: result.apiKey });
    });
    return true; // indicates we want to send a response asynchronously
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ apiKey: 'your_api_key_here' });
});
