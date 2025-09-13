document.getElementById('getContentBtn').addEventListener('click', async () => {
	try {
		// Get API key from storage
		const result = await chrome.storage.local.get(['apiKey']);
		const apiKey = result.apiKey;
		if (!apiKey) {
			alert('Please set your API key first');
			return;
		}

		// Make API call directly from popup
		const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: 'deepseek/deepseek-r1-0528:free',
				messages: [
					{
						role: 'user',
						content: 'What is the meaning of life?',
					},
				],
			}),
		});

		if (!res.ok) {
			throw new Error(`API request failed: ${res.status} ${res.statusText}`);
		}

		const data = await res.json();
		const content = data.choices[0].message.content;

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
