import { useEffect } from 'react';
import { usePopupStore } from './store';
import { useTheme } from './hooks/useTheme';

// Components (to be created)
import AnalysisView from './components/AnalysisView';
import HistoryView from './components/HistoryView';
import CVView from './components/CVView';
import SettingsView from './components/SettingsView';
import TabNavigation from './components/TabNavigation';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBanner from './components/ErrorBanner';

function App() {
  const { currentTab, isLoading, error, init, settings } = usePopupStore();
  useTheme();

  // Initialize store on mount
  useEffect(() => {
    init();
  }, [init]);

  // Apply popup size
  useEffect(() => {
    const root = document.documentElement;
    const sizes = {
      small: '400px',
      medium: '500px',
      large: '600px',
    };
    root.style.setProperty('--popup-width', sizes[settings.popupSize]);
  }, [settings.popupSize]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with App Title */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Job Analyzer
          </h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Error Banner */}
      {error && <ErrorBanner message={error} />}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading && currentTab === 'analysis' ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {currentTab === 'analysis' && <AnalysisView />}
            {currentTab === 'history' && <HistoryView />}
            {currentTab === 'cv' && <CVView />}
            {currentTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
