chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	alert("enter listener")
	if (request.action === "runGetContent") {
		getContent();
	}
	if (request.action === "setApiKey") {
		const { apiKey } = request;
		chrome.storage.local.set({ apiKey }, () => {
			console.log('API key saved:', apiKey);
		});
	}

	if (request.action === "getApiKey") {
		chrome.storage.local.get(['apiKey'], (result) => {
			sendResponse({ apiKey: result.apiKey });
		});
		return true; // indicates we want to send a response asynchronously
	}
});

async function getApiKey() {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({ type: "getApiKey" }, (response) => {
			resolve(response.apiKey);
		});
	});
}

async function getContent() {
	try {
		console.log("enter getContent")
		const apiKey = await getApiKey();
		if (!apiKey) {
			console.error('API key is not set');
			return;
		}

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
		const body = res.body;
		const x = await res.json();
		const { choices } = x;
		const [first] = choices;
		const { message } = first;

		const content = message.content;
		alert(content);
	} catch (e) {
		console.error('Error in getContent:', e);
		// Add more detailed error logging
		if (e instanceof TypeError) {
			console.error('Network error or CORS issue:', e.message);
		} else {
			console.error('Unexpected error:', e);
		}
	}

}
