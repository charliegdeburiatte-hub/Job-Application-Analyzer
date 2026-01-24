/**
 * StorageInfo Component
 *
 * Displays storage usage breakdown and statistics
 */

import { useEffect, useState } from 'react';
import { getStorageUsage, getAnalyzedJobs, getCVDocument } from '../../shared/utils/storage';

interface StorageStats {
  cvSizeKB: number;
  jobCount: number;
  totalUsageKB: number;
  localUsageKB: number;
  syncUsageKB: number;
}

export function StorageInfo() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Get storage usage
        const usage = await getStorageUsage();

        // Get analyzed jobs count
        const jobs = await getAnalyzedJobs();
        const jobCount = Object.keys(jobs).length;

        // Get CV size (if exists)
        const cvDoc = await getCVDocument();
        const cvSizeKB = cvDoc ? Math.round(JSON.stringify(cvDoc).length / 1024) : 0;

        setStats({
          cvSizeKB,
          jobCount,
          totalUsageKB: Math.round((usage.local + usage.sync) / 1024),
          localUsageKB: Math.round(usage.local / 1024),
          syncUsageKB: Math.round(usage.sync / 1024)
        });
      } catch (error) {
        console.error('[StorageInfo] Failed to load storage stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          💾 Storage Usage
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          💾 Storage Usage
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Storage information unavailable
        </p>
      </div>
    );
  }

  // Calculate percentage (Firefox local storage is typically 5-10MB)
  const estimatedLimit = 5 * 1024; // 5MB in KB
  const usagePercent = Math.min(100, Math.round((stats.totalUsageKB / estimatedLimit) * 100));

  // Get color based on usage
  const getUsageColor = () => {
    if (usagePercent >= 80) return 'bg-red-500';
    if (usagePercent >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
        💾 Storage Usage
      </h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Total Used</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {stats.totalUsageKB} KB / ~{estimatedLimit} KB ({usagePercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`${getUsageColor()} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${usagePercent}%` }}
          ></div>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">CV Size</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.cvSizeKB} KB
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Analyzed Jobs</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.jobCount} {stats.jobCount === 1 ? 'job' : 'jobs'}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Local Storage</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.localUsageKB} KB
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Sync Storage</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {stats.syncUsageKB} KB
          </p>
        </div>
      </div>

      {/* Warning if nearing limit */}
      {usagePercent >= 80 && (
        <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-xs text-yellow-900 dark:text-yellow-100">
          ⚠️ Storage usage is high. Consider clearing old job history to free up space.
        </div>
      )}
    </div>
  );
}
