import React from 'react';
import ReactDOM from 'react-dom/client';
import '../popup/index.css';

// Simple options page - can be enhanced later
function OptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Job Application Analyzer Settings
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-700 dark:text-gray-300">
            Configure your preferences in the extension popup by clicking the extension icon
            in your toolbar.
          </p>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
);
