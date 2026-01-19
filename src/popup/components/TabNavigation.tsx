import { usePopupStore } from '../store';
import { ViewTab } from '@/shared/types';

const tabs: Array<{ id: ViewTab; label: string; icon: string }> = [
  { id: 'analysis', label: 'Analysis', icon: '📊' },
  { id: 'history', label: 'History', icon: '📝' },
  { id: 'cv', label: 'CV', icon: '📄' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function TabNavigation() {
  const { currentTab, setCurrentTab } = usePopupStore();

  return (
    <nav className="flex border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`
            flex-1 px-4 py-3 text-sm font-medium
            transition-colors duration-200
            border-b-2
            ${
              currentTab === tab.id
                ? 'tab-btn tab-btn-active'
                : 'tab-btn tab-btn-inactive border-transparent'
            }
          `}
        >
          <span className="mr-1">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
