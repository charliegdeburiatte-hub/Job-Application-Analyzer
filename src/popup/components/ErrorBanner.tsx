import { usePopupStore } from '../store';

interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  const { setError } = usePopupStore();

  return (
    <div className="px-4 py-3 bg-danger-50 dark:bg-danger-900 border-b border-danger-200 dark:border-danger-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="text-danger-600 dark:text-danger-400 mt-0.5">⚠️</span>
          <p className="text-sm text-danger-800 dark:text-danger-200">{message}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-danger-600 dark:text-danger-400 hover:text-danger-800 dark:hover:text-danger-200"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
