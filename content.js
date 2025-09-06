chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "runGetContent") {
    getContent();
  }
});

async function getContent() {
	try {
		const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.API_KEY}`,
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
		console.log(e);
	}

}
