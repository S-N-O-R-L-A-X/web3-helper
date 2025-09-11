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
		// Display result in a new div
		const resultDiv = document.getElementById('result') || createResultDiv();
		resultDiv.textContent = content;
	} catch (error) {
		console.error('Error in getContent:', error);
		alert('Error: ' + error.message);
	}
});

function createResultDiv() {
	const resultDiv = document.createElement('div');
	resultDiv.id = 'result';
	resultDiv.style.cssText = 'margin-top: 10px; padding: 10px; border: 1px solid #ccc; max-height: 200px; overflow-y: auto; white-space: pre-wrap;';
	document.body.appendChild(resultDiv);
	return resultDiv;
}

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
