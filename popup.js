async function callGemini() {
	// Get API key from storage
	const result = await chrome.storage.local.get(['apiKey']);
	const apiKey = result.apiKey;
	if (!apiKey) {
		alert('Please set your API key first');
		return;
	}
	// Make API call directly from popup
	const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
		method: 'POST',
		headers: {
			'x-goog-api-key': apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			contents: [{
				parts: [{
					text: 'What is the meaning of life?',
				}],
			}],
		}),
	});
	if (!res.ok) {
		throw new Error(`API request failed: ${res.status} ${res.statusText}`);
	}
	const data = await res.json();
	const content = data.candidates[0].content.parts[0].text;

	return content;
}

document.getElementById('getContentBtn').addEventListener('click', async () => {
	try {
		const content = await callGemini();

		try {
			// Get the current active tab
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

			// Check if we're on a Discord page
			if (!tab.url.startsWith('https://discord.com/')) {
				throw new Error('Please open Discord in the current tab first');
			}

			// Inject content script manually if needed
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['content.js']
			});

			const response = await chrome.tabs.sendMessage(tab.id, {
				action: 'inputContent',
				content: content
			});

			if (response && response.success) {
				console.log('Message sent to Discord successfully');
				return;
			}

		} catch (err) {
			console.error('Error sending message to Discord:', err);
			if (err.message.includes('could not establish connection')) {
				alert('Please make sure Discord is open in the current tab and refresh the page if needed.');
			} else {
				alert('Error: ' + err.message);
			}
		}


	} catch (error) {
		console.error('Error in getContent:', error);
		alert('Error: ' + error.message);
	}
});


document.getElementById('setApiKeyBtn').addEventListener('click', async () => {
	try {
		const apiKey = document.getElementById('apiKeyInput').value.trim();
		if (!apiKey) {
			alert('Please enter an API key');
			return;
		}
		// Save API key directly in popup
		await chrome.storage.local.set({ apiKey });
		alert('API key saved successfully!');
		// Clear the input field
		document.getElementById('apiKeyInput').value = '';
	} catch (error) {
		console.error('Error saving API key:', error);
		alert('Error saving API key: ' + error.message);
	}
});
