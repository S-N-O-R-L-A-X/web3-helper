import '@src/Options.css';
import ApiKeySetting from './components/ApiKeySetting';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const handleApiKeySet = (key: string) => {
    // Notify other parts of the extension that the API key was updated
    chrome.runtime.sendMessage({ type: 'API_KEY_UPDATED', apiKey: key });
  };

  return (
    <div className={cn('App p-4', isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100')}>
      <div className="mb-4 flex justify-center">
        <button onClick={goGithubSite}>
          <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        </button>
      </div>

      <div className="mx-auto max-w-lg">
        <ApiKeySetting onApiKeySet={handleApiKeySet} />

        <div className="mt-6">
          <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
