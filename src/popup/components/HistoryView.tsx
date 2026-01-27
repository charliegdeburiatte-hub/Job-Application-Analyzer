import { useState, useMemo } from 'react';
import { usePopupStore } from '../store';
import { formatDate } from '@/shared';
import { ExportMenu } from './ExportMenu';
import { Toast } from './Toast';
import type { JobStatus, Recommendation, JobData, Analysis } from '../../shared/types';

type DateFilter = 'all' | '7days' | '30days' | '90days';
type SortBy = 'date' | 'score' | 'status';

export default function HistoryView() {
  const { analyzedJobs } = usePopupStore();
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Convert jobs object to array
  const allJobs = useMemo(() => Object.values(analyzedJobs), [analyzedJobs]);

  // Apply filters
  const filteredJobs = useMemo(() => {
    let filtered = [...allJobs];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const daysAgo = {
        '7days': 7,
        '30days': 30,
        '90days': 90
      }[dateFilter];

      if (daysAgo) {
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(job =>
          new Date(job.analyzedDate).getTime() >= cutoffDate.getTime()
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.analyzedDate).getTime() - new Date(a.analyzedDate).getTime();
        case 'score':
          return b.matchScore - a.matchScore;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allJobs, statusFilter, dateFilter, sortBy]);

  const handleExportComplete = (message: string) => {
    setToastMessage(message);
  };

  if (allJobs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Analyzed Jobs Yet
        </h3>
        <p className="empty-state-text max-w-xs mx-auto">
          Visit a job posting to see your first analysis
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Job History ({filteredJobs.length}/{allJobs.length})
        </h2>
        <ExportMenu
          jobs={filteredJobs}
          onExportComplete={handleExportComplete}
        />
      </div>

      {/* Filters Section */}
      <div className="card bg-gray-50 dark:bg-gray-800/50 space-y-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`filter-chip ${statusFilter === 'all' ? 'filter-chip-active' : ''}`}
            >
              All
            </button>
            {(['analyzed', 'applied', 'rejected', 'interviewing', 'offer', 'accepted'] as JobStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-chip ${statusFilter === status ? 'filter-chip-active' : ''}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date Range
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateFilter('all')}
              className={`filter-chip ${dateFilter === 'all' ? 'filter-chip-active' : ''}`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`filter-chip ${dateFilter === '7days' ? 'filter-chip-active' : ''}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`filter-chip ${dateFilter === '30days' ? 'filter-chip-active' : ''}`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateFilter('90days')}
              className={`filter-chip ${dateFilter === '90days' ? 'filter-chip-active' : ''}`}
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`filter-chip ${sortBy === 'date' ? 'filter-chip-active' : ''}`}
            >
              📅 Date
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`filter-chip ${sortBy === 'score' ? 'filter-chip-active' : ''}`}
            >
              🎯 Score
            </button>
            <button
              onClick={() => setSortBy('status')}
              className={`filter-chip ${sortBy === 'status' ? 'filter-chip-active' : ''}`}
            >
              📊 Status
            </button>
          </div>
        </div>
      </div>

      {/* No Results Message */}
      {filteredJobs.length === 0 && (
        <div className="card text-center text-gray-500 dark:text-gray-400">
          <p>No jobs match the selected filters</p>
        </div>
      )}

      {/* Job Cards */}
      {filteredJobs.map((job) => (
        <div
          key={job.jobId}
          className="card hover:shadow-lg cursor-pointer transition-all"
          onClick={() => {
            const { setCurrentJob, setCurrentAnalysis, setCurrentTab } = usePopupStore.getState();

            // Reconstruct JobData from AnalyzedJob
            const jobData: JobData = {
              url: job.url,
              title: job.title,
              company: job.company,
              description: '', // Not stored in AnalyzedJob, but not used by AnalysisView
              source: 'linkedin', // Default value
            };

            // Reconstruct Analysis from AnalyzedJob
            // Calculate recommendation based on match score (simplified logic)
            let recommendation: Recommendation;
            if (job.matchScore >= 70) {
              recommendation = 'apply';
            } else if (job.matchScore >= 50) {
              recommendation = 'maybe';
            } else {
              recommendation = 'pass';
            }

            const analysis: Analysis = {
              jobId: job.jobId,
              analyzedDate: job.analyzedDate,
              matchScore: job.matchScore,
              recommendation,
              matchDetails: job.matchDetails,
              confidence: 0.85, // Default confidence value
            };

            // Set the current job and analysis, then switch to analysis tab
            setCurrentJob(jobData);
            setCurrentAnalysis(analysis);
            setCurrentTab('analysis');
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {job.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
            </div>
            <span
              className={`
                badge
                ${
                  job.matchScore >= 70
                    ? 'badge-success'
                    : job.matchScore >= 50
                    ? 'badge-warning'
                    : 'badge-danger'
                }
              `}
            >
              {job.matchScore}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="badge badge-info">{job.status}</span>
            <span>{formatDate(job.analyzedDate)}</span>
          </div>

          {/* Click hint */}
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic">
            Click to view analysis →
          </div>
        </div>
      ))}

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
          type="success"
        />
      )}
    </div>
  );
}
