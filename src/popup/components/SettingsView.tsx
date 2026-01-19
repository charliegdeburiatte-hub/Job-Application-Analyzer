import { usePopupStore } from '../store';
import { useTheme } from '../hooks/useTheme';

export default function SettingsView() {
  const { settings, updateUserSettings } = usePopupStore();
  const { colorTheme, themeMode, toggleThemeMode, setColorTheme } = useTheme();

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h2>

      {/* Theme Settings */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🎨 Appearance
        </h3>

        {/* Color Theme */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Theme
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setColorTheme('sabbath')}
              className={`
                flex-1 px-4 py-3 rounded-lg border-2 transition-all
                ${
                  colorTheme === 'sabbath'
                    ? 'border-sabbath-600 bg-sabbath-50 dark:bg-sabbath-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-sabbath-400'
                }
              `}
            >
              <div className="text-2xl mb-1">🤘</div>
              <div className="text-xs font-medium">Black Sabbath</div>
            </button>
            <button
              onClick={() => setColorTheme('professional')}
              className={`
                flex-1 px-4 py-3 rounded-lg border-2 transition-all
                ${
                  colorTheme === 'professional'
                    ? 'border-professional-600 bg-professional-50 dark:bg-professional-900'
                    : 'border-gray-300 dark:border-gray-600 hover:border-professional-400'
                }
              `}
            >
              <div className="text-2xl mb-1">💼</div>
              <div className="text-xs font-medium">Professional</div>
            </button>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {themeMode === 'dark' ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <button
            onClick={toggleThemeMode}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${themeMode === 'dark' ? 'bg-sabbath-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${themeMode === 'dark' ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Job Detection Settings */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🔍 Job Detection
        </h3>

        <label className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Auto-detect job pages
          </span>
          <input
            type="checkbox"
            checked={settings.autoDetect}
            onChange={(e) => updateUserSettings({ autoDetect: e.target.checked })}
            className="w-4 h-4"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Show notifications
          </span>
          <input
            type="checkbox"
            checked={settings.showNotifications}
            onChange={(e) =>
              updateUserSettings({ showNotifications: e.target.checked })
            }
            className="w-4 h-4"
          />
        </label>
      </div>

      {/* Analysis Settings */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📊 Analysis Settings
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum match for "Apply": {settings.minimumMatchPercentage}%
          </label>
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={settings.minimumMatchPercentage}
            onChange={(e) =>
              updateUserSettings({
                minimumMatchPercentage: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Detail Level
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateUserSettings({ analysisDetail: 'quick' })}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm border
                ${
                  settings.analysisDetail === 'quick'
                    ? 'border-sabbath-600 bg-sabbath-50 dark:bg-sabbath-900 text-sabbath-700 dark:text-sabbath-300'
                    : 'border-gray-300 dark:border-gray-600'
                }
              `}
            >
              Quick
            </button>
            <button
              onClick={() => updateUserSettings({ analysisDetail: 'detailed' })}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm border
                ${
                  settings.analysisDetail === 'detailed'
                    ? 'border-sabbath-600 bg-sabbath-50 dark:bg-sabbath-900 text-sabbath-700 dark:text-sabbath-300'
                    : 'border-gray-300 dark:border-gray-600'
                }
              `}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Enabled Job Sites */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🌐 Enabled Job Sites
        </h3>

        <div className="space-y-2">
          {['linkedin', 'indeed', 'reed'].map((site) => (
            <label key={site} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {site === 'linkedin' && '🔗 LinkedIn'}
                {site === 'indeed' && '🔍 Indeed'}
                {site === 'reed' && '📋 Reed'}
              </span>
              <input
                type="checkbox"
                checked={settings.enabledJobSites.includes(site as any)}
                onChange={(e) => {
                  const newSites = e.target.checked
                    ? [...settings.enabledJobSites, site]
                    : settings.enabledJobSites.filter((s) => s !== site);
                  updateUserSettings({ enabledJobSites: newSites as any });
                }}
                className="w-4 h-4"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🗑️ Data Management
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Auto-delete old jobs after: {settings.retentionDays} days
          </label>
          <input
            type="number"
            min="30"
            max="365"
            step="30"
            value={settings.retentionDays}
            onChange={(e) =>
              updateUserSettings({ retentionDays: parseInt(e.target.value) })
            }
            className="input"
          />
        </div>

        <button className="btn-danger w-full">Clear All History</button>
      </div>

      {/* Version Info */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Job Application Analyzer v1.0.0
      </div>
    </div>
  );
}
