import { useState } from 'react';
import { usePopupStore } from '../store';
import { getRecommendationText, getRecommendationEmoji } from '@/shared';
import MatchScore from './MatchScore';
import SkillsList from './SkillsList';

export default function AnalysisView() {
  const { currentAnalysis, currentJob, cvProfile, settings } = usePopupStore();
  const [showScoringDetails, setShowScoringDetails] = useState(false);
  const [showAllMatchedSkills, setShowAllMatchedSkills] = useState(false);
  const [showAllMissingSkills, setShowAllMissingSkills] = useState(false);

  const isQuickView = settings.analysisDetail === 'quick';

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

  // Skills to display based on view mode
  const matchedSkillsToShow = isQuickView && !showAllMatchedSkills
    ? matchDetails.matchedSkills.slice(0, 5)
    : matchDetails.matchedSkills;

  const missingSkillsToShow = isQuickView && !showAllMissingSkills
    ? matchDetails.missingSkills.slice(0, 3)
    : matchDetails.missingSkills;

  const strengthsToShow = isQuickView
    ? matchDetails.strengthAreas.slice(0, 2)
    : matchDetails.strengthAreas;

  const gapsToShow = isQuickView
    ? matchDetails.weakAreas.slice(0, 2)
    : matchDetails.weakAreas;

  const handleAnalyzeNewJob = async () => {
    const { clearCurrentAnalysis } = usePopupStore.getState();
    await clearCurrentAnalysis();
  };

  return (
    <div className={`p-4 space-y-6 pb-6 ${isQuickView ? 'analysis-quick-view' : 'analysis-detailed-view'}`}>
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-sm text-blue-800 dark:text-blue-200 flex-1 mr-2">
          ✓ Analysis saved to History tab
        </div>
        <button
          onClick={handleAnalyzeNewJob}
          className="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
          title="Clear current analysis and analyze a new job"
        >
          🔄 New Job
        </button>
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

      {/* Scoring Details (v1.2.0 Weighted Scoring) - Hidden by default in Quick View */}
      {currentAnalysis.scoringBreakdown && (!isQuickView || showScoringDetails) && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <button
            onClick={() => setShowScoringDetails(!showScoringDetails)}
            className="w-full flex items-center justify-between text-left"
          >
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              📊 Scoring Details
            </h4>
            <span className="text-blue-600 dark:text-blue-300">
              {showScoringDetails ? '▼' : '▶'}
            </span>
          </button>

          {showScoringDetails && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-700 dark:text-blue-300 font-medium">Base Score</p>
                  <p className="text-gray-900 dark:text-blue-100 text-lg font-bold">
                    {currentAnalysis.baseScore}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-blue-300 font-medium">Experience Bonus</p>
                  <p className="text-gray-900 dark:text-blue-100 text-lg font-bold">
                    +{currentAnalysis.scoringBreakdown.experienceBonus}
                  </p>
                </div>
              </div>

              <hr className="border-blue-200 dark:border-blue-700" />

              <div>
                <p className="text-gray-700 dark:text-blue-300 font-medium mb-1">
                  Required Skills (3x weight)
                </p>
                <p className="text-gray-900 dark:text-blue-200">
                  {currentAnalysis.scoringBreakdown.requiredMatched} / {currentAnalysis.scoringBreakdown.requiredTotal} matched
                </p>
              </div>

              <div>
                <p className="text-gray-700 dark:text-blue-300 font-medium mb-1">
                  Preferred Skills (1x weight)
                </p>
                <p className="text-gray-900 dark:text-blue-200">
                  {currentAnalysis.scoringBreakdown.preferredMatched} / {currentAnalysis.scoringBreakdown.preferredTotal} matched
                </p>
              </div>

              <hr className="border-blue-200 dark:border-blue-700" />

              <div className="text-xs text-gray-700 dark:text-blue-300">
                <p className="mb-1">
                  <strong>How scoring works:</strong>
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Required skills weighted 3x more than preferred</li>
                  <li>Technical skills (languages, frameworks) weighted 2x</li>
                  <li>Experience bonus: +5 points per year (max +20)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick View Toggle for Scoring Details */}
      {isQuickView && currentAnalysis.scoringBreakdown && !showScoringDetails && (
        <button
          onClick={() => setShowScoringDetails(true)}
          className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          📊 Show Scoring Details
        </button>
      )}

      {/* Matched Skills */}
      {matchDetails.matchedSkills.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ✓ Matched Skills ({matchDetails.matchedSkills.length})
          </h4>
          <SkillsList skills={matchedSkillsToShow} type="matched" />

          {/* Show All button in Quick View */}
          {isQuickView && matchDetails.matchedSkills.length > 5 && !showAllMatchedSkills && (
            <button
              onClick={() => setShowAllMatchedSkills(true)}
              className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              + Show {matchDetails.matchedSkills.length - 5} more
            </button>
          )}
        </div>
      )}

      {/* Missing Skills */}
      {matchDetails.missingSkills.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ✗ Missing Skills ({matchDetails.missingSkills.length})
          </h4>
          <SkillsList skills={missingSkillsToShow} type="missing" />

          {/* Show All button in Quick View */}
          {isQuickView && matchDetails.missingSkills.length > 3 && !showAllMissingSkills && (
            <button
              onClick={() => setShowAllMissingSkills(true)}
              className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              + Show {matchDetails.missingSkills.length - 3} more
            </button>
          )}
        </div>
      )}

      {/* Strengths */}
      {matchDetails.strengthAreas.length > 0 && (
        <div className="card bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-700">
          <h4 className="font-semibold text-success-900 dark:text-success-100 mb-2">
            💪 Your Strengths
          </h4>
          <ul className="space-y-1">
            {strengthsToShow.map((strength, index) => (
              <li
                key={index}
                className="text-sm text-success-800 dark:text-success-200"
              >
                • {strength}
              </li>
            ))}
          </ul>
          {isQuickView && matchDetails.strengthAreas.length > 2 && (
            <p className="text-xs text-success-700 dark:text-success-300 mt-2">
              + {matchDetails.strengthAreas.length - 2} more (switch to Detailed view)
            </p>
          )}
        </div>
      )}

      {/* Gaps */}
      {matchDetails.weakAreas.length > 0 && (
        <div className="card bg-warning-50 dark:bg-warning-900 border-warning-200 dark:border-warning-700">
          <h4 className="font-semibold text-warning-900 dark:text-warning-100 mb-2">
            ⚠️ Gaps
          </h4>
          <ul className="space-y-1">
            {gapsToShow.map((weakness, index) => (
              <li
                key={index}
                className="text-sm text-warning-800 dark:text-warning-200"
              >
                • {weakness}
              </li>
            ))}
          </ul>
          {isQuickView && matchDetails.weakAreas.length > 2 && (
            <p className="text-xs text-warning-700 dark:text-warning-300 mt-2">
              + {matchDetails.weakAreas.length - 2} more (switch to Detailed view)
            </p>
          )}
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
