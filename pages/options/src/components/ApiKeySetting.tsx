import { useState } from 'react';

const ApiKeySetting = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');

  const saveApiKey = async () => {
    try {
      await chrome.storage.local.set({ apiKey });
      setStatus('API key saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('Failed to save API key');
      console.error(error);
    }
  };

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">OpenAI API Key</label>
      <div className="flex">
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="flex-grow rounded-l-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
        <button
          onClick={saveApiKey}
          className="rounded-r-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Save
        </button>
      </div>
      {status && <p className="mt-1 text-sm text-green-600">{status}</p>}
    </div>
  );
};

export default ApiKeySetting;
