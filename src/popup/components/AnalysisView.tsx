import { usePopupStore } from '../store';
import { getRecommendationText, getRecommendationEmoji } from '@/shared';
import MatchScore from './MatchScore';
import SkillsList from './SkillsList';

export default function AnalysisView() {
  const { currentAnalysis, currentJob, cvProfile } = usePopupStore();

  // No CV uploaded yet
  if (!cvProfile) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No CV Uploaded
        </h3>
        <p className="empty-state-text max-w-xs mx-auto mb-4">
          Upload your CV to start analyzing job postings
        </p>
        <button
          onClick={() => usePopupStore.getState().setCurrentTab('cv')}
          className="btn-primary"
        >
          Upload CV
        </button>
      </div>
    );
  }

  // No current job analysis
  if (!currentAnalysis || !currentJob) {
    const handleManualAnalysis = async () => {
      try {
        // Query the active tab
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (!tabs[0]?.id) {
          usePopupStore.getState().setError('Could not access current tab');
          return;
        }

        usePopupStore.getState().setLoading(true);
        usePopupStore.getState().setError(null);

        // Send message to content script to extract job data
        const response = await browser.tabs.sendMessage(tabs[0].id, {
          type: 'GET_CURRENT_JOB',
        });

        if (response?.success && response.jobData) {
          // Send to background for analysis
          const analysisResponse = await browser.runtime.sendMessage({
            type: 'ANALYZE_JOB',
            payload: { jobData: response.jobData },
          });

          if (analysisResponse?.success) {
            // Update store with job and analysis
            usePopupStore.getState().setCurrentJob(response.jobData);
            usePopupStore.getState().setCurrentAnalysis(analysisResponse.analysis);
          } else {
            throw new Error('Analysis failed');
          }
        } else {
          throw new Error(response?.error || 'Could not extract job data from this page');
        }
      } catch (error) {
        console.error('Manual analysis error:', error);
        usePopupStore.getState().setError(
          error instanceof Error ? error.message : 'Failed to analyze page'
        );
      } finally {
        usePopupStore.getState().setLoading(false);
      }
    };

    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Job Detected
        </h3>
        <p className="empty-state-text max-w-xs mx-auto mb-4">
          Visit a job posting on LinkedIn, Indeed, or Reed for automatic analysis
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">or</div>
        <button onClick={handleManualAnalysis} className="btn-primary">
          📄 Analyze This Page
        </button>
      </div>
    );
  }

  const { matchScore, recommendation, matchDetails } = currentAnalysis;

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* Saved to History Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
        ✓ Analysis saved to History tab
      </div>

      {/* Match Score Circle */}
      <MatchScore score={matchScore} />

      {/* Recommendation Card */}
      <div
        className={`
          p-4 rounded-lg border-l-4
          ${
            recommendation === 'apply'
              ? 'bg-success-50 dark:bg-success-900 border-success-500'
              : recommendation === 'maybe'
              ? 'bg-warning-50 dark:bg-warning-900 border-warning-500'
              : 'bg-danger-50 dark:bg-danger-900 border-danger-500'
          }
        `}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{getRecommendationEmoji(recommendation)}</span>
          <h3
            className={`
              text-lg font-bold
              ${
                recommendation === 'apply'
                  ? 'text-success-800 dark:text-success-200'
                  : recommendation === 'maybe'
                  ? 'text-warning-800 dark:text-warning-200'
                  : 'text-danger-800 dark:text-danger-200'
              }
            `}
          >
            {getRecommendationText(recommendation)}
          </h3>
        </div>
      </div>

      {/* Job Info */}
      <div className="card">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
          {currentJob.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{currentJob.company}</p>
        {currentJob.location && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {currentJob.location}
          </p>
        )}
      </div>

      {/* Matched Skills */}
      {matchDetails.matchedSkills.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ✓ Matched Skills ({matchDetails.matchedSkills.length})
          </h4>
          <SkillsList skills={matchDetails.matchedSkills} type="matched" />
        </div>
      )}

      {/* Missing Skills */}
      {matchDetails.missingSkills.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ✗ Missing Skills ({matchDetails.missingSkills.length})
          </h4>
          <SkillsList skills={matchDetails.missingSkills} type="missing" />
        </div>
      )}

      {/* Strengths */}
      {matchDetails.strengthAreas.length > 0 && (
        <div className="card bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-700">
          <h4 className="font-semibold text-success-900 dark:text-success-100 mb-2">
            💪 Your Strengths
          </h4>
          <ul className="space-y-1">
            {matchDetails.strengthAreas.map((strength, index) => (
              <li
                key={index}
                className="text-sm text-success-800 dark:text-success-200"
              >
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {matchDetails.weakAreas.length > 0 && (
        <div className="card bg-warning-50 dark:bg-warning-900 border-warning-200 dark:border-warning-700">
          <h4 className="font-semibold text-warning-900 dark:text-warning-100 mb-2">
            ⚠️ Gaps
          </h4>
          <ul className="space-y-1">
            {matchDetails.weakAreas.map((weakness, index) => (
              <li
                key={index}
                className="text-sm text-warning-800 dark:text-warning-200"
              >
                • {weakness}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            // TODO: Mark as applied
            usePopupStore.getState().setCurrentTab('history');
          }}
          className="flex-1 btn-primary"
        >
          ✓ Applied
        </button>
        <button
          onClick={() => {
            // TODO: Mark as rejected
          }}
          className="flex-1 btn-secondary"
        >
          ✗ Reject
        </button>
      </div>
    </div>
  );
}
