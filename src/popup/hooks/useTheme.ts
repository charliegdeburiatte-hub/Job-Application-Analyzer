import { useEffect } from 'react';
import { usePopupStore } from '../store';

/**
 * Hook to manage theme (light/dark mode only)
 */
export function useTheme() {
  const { settings, updateUserSettings } = usePopupStore();
  const { themeMode } = settings;

  // Apply theme class to document
  useEffect(() => {
    const html = document.documentElement;

    // Apply dark mode class
    if (themeMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [themeMode]);

  const toggleThemeMode = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await updateUserSettings({ themeMode: newMode });
  };

  return {
    themeMode,
    toggleThemeMode,
    isDark: themeMode === 'dark',
  };
}
