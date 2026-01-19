import { usePopupStore } from '../store';
import { formatDateShort } from '@/shared';

export default function CVView() {
  const { cvDocument, cvProfile } = usePopupStore();

  const openSettings = () => {
    browser.runtime.openOptionsPage();
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your CV</h2>

      {/* Upload Section */}
      {!cvDocument ? (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Upload Your CV
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload your CV in .docx format to start analyzing jobs
          </p>

          <button
            onClick={openSettings}
            className="btn-primary w-full"
          >
            📄 Upload CV in Settings
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Opens in a new tab for better file upload support
          </p>
        </div>
      ) : (
        <>
          {/* Current CV */}
          <div className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  📄 {cvDocument.fileName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Uploaded: {formatDateShort(cvDocument.uploadDate)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Size: {Math.round(cvDocument.fileSize / 1024)} KB
                </p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={openSettings}
                className="btn-secondary w-full"
              >
                Upload New CV
              </button>
            </div>
          </div>

          {/* Extracted Skills */}
          {cvProfile && cvProfile.skills.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Extracted Skills ({cvProfile.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {cvProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="skill-tag skill-tag-matched"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                These skills were automatically extracted from your CV
              </p>
            </div>
          )}

          {/* CV Preview */}
          <div className="card max-h-64 overflow-y-auto scrollbar-thin">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              CV Preview
            </h3>
            <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {cvDocument.extractedText.slice(0, 1000)}
              {cvDocument.extractedText.length > 1000 && '...'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
