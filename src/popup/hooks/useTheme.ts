import { useEffect } from 'react';
import { usePopupStore } from '../store';

/**
 * Hook to manage theme (color + dark/light mode)
 */
export function useTheme() {
  const { settings, updateUserSettings } = usePopupStore();
  const { colorTheme, themeMode } = settings;

  // Apply theme classes to document
  useEffect(() => {
    const html = document.documentElement;

    // Apply dark mode class
    if (themeMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Apply color theme class
    html.setAttribute('data-theme', colorTheme);
  }, [colorTheme, themeMode]);

  const toggleThemeMode = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await updateUserSettings({ themeMode: newMode });
  };

  const setColorTheme = async (theme: 'sabbath' | 'professional') => {
    await updateUserSettings({ colorTheme: theme });
  };

  return {
    colorTheme,
    themeMode,
    toggleThemeMode,
    setColorTheme,
    isDark: themeMode === 'dark',
  };
}
