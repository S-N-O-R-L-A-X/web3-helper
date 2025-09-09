document.getElementById('getContentBtn').addEventListener('click', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, { action: "runGetContent" });
	});
});

document.getElementById('setApiKeyBtn').addEventListener('click', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, { action: "setApiKey", apiKey: document.getElementById('apiKeyInput').value });
	});
});
