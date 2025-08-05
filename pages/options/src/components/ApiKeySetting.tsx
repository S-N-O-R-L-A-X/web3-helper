import { useState } from 'react';

interface ApiKeySettingProps {
  onApiKeySet: (key: string) => void;
  initialValue?: string;
}

export default function ApiKeySetting({ onApiKeySet, initialValue = '' }: ApiKeySettingProps) {
  const [apiKey, setApiKey] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ text: 'Please enter a valid API key', type: 'error' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Save to chrome.storage
      await chrome.storage.local.set({ openaiApiKey: apiKey });
      onApiKeySet(apiKey);
      setMessage({ text: 'API key saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to save API key:', error);
      setMessage({ text: 'Failed to save API key. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="api-key" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          OpenAI API Key
        </label>
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Your API key is stored locally in your browser and never sent to any server except OpenAI's.
        </p>
      </div>

      {message && (
        <div
          className={`rounded p-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`rounded-md px-4 py-2 font-medium text-white ${
          isSaving
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}>
        {isSaving ? 'Saving...' : 'Save API Key'}
      </button>
    </div>
  );
}
