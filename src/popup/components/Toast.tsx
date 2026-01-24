/**
 * Toast Component
 *
 * Displays temporary notification messages
 * Auto-dismisses after 3 seconds
 */

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, onDismiss, type = 'success' }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
    }
  };

  const getBgClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100';
      case 'error':
        return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className={`${getBgClass()} border-2 rounded-lg shadow-lg p-4 pr-12 flex items-center gap-3 max-w-sm`}>
        <span className="text-xl">{getIcon()}</span>
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
