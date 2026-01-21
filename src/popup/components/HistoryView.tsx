import { usePopupStore } from '../store';
import { formatDate } from '@/shared';

export default function HistoryView() {
  const { analyzedJobs } = usePopupStore();

  const jobsArray = Object.values(analyzedJobs).sort(
    (a, b) => new Date(b.analyzedDate).getTime() - new Date(a.analyzedDate).getTime()
  );

  if (jobsArray.length === 0) {
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
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Job History ({jobsArray.length})
      </h2>

      {jobsArray.map((job) => (
        <div
          key={job.jobId}
          className="card hover:shadow-lg cursor-pointer transition-all"
          onClick={() => {
            // Open job URL in new tab
            browser.tabs.create({ url: job.url });
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
            Click to open job →
          </div>
        </div>
      ))}
    </div>
  );
}
