import type { Analysis, JobData, CVProfile } from '../shared/types'
import { getRecommendationText, getRecommendationEmoji } from '../shared'
import MatchScore from '../components/MatchScore'
import SkillsList from '../components/SkillsList'
import { compressToEncodedURIComponent } from 'lz-string'

interface ResultsPageProps {
  analysis: Analysis
  jobData: JobData
  cvProfile: CVProfile
  onReset: () => void
}

export default function ResultsPage({ analysis, jobData, cvProfile, onReset }: ResultsPageProps) {
  const { matchScore, recommendation, matchDetails } = analysis

  const downloadResults = () => {
    const results = {
      job: {
        title: jobData.title,
        company: jobData.company,
        url: jobData.url,
      },
      analysis: {
        matchScore,
        recommendation,
        matchedSkills: matchDetails.matchedSkills,
        missingSkills: matchDetails.missingSkills,
        strengths: matchDetails.strengthAreas,
        gaps: matchDetails.weakAreas,
      },
      analyzedDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `job-analysis-${jobData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Generate compressed debug string with ALL data including job description
  const generateDebugString = () => {
    const debugData = {
      date: new Date().toISOString().split('T')[0],
      job: {
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        location: jobData.location,
      },
      analysis: {
        matchScore,
        recommendation,
        baseScore: analysis.baseScore,
        matchedSkills: matchDetails.matchedSkills,
        missingSkills: matchDetails.missingSkills,
        strengths: matchDetails.strengthAreas,
        gaps: matchDetails.weakAreas,
      },
      scoring: analysis.scoringBreakdown,
    }

    return compressToEncodedURIComponent(JSON.stringify(debugData))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button onClick={onReset} className="btn-secondary">
          ← Analyse Another Job
        </button>
        <button onClick={downloadResults} className="btn-secondary">
          📥 Download Results
        </button>
      </div>

      {/* Debug Summary - Compressed */}
      <div className="card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔬 Test Data (compressed - includes full job description)
            </p>
            <div className="flex gap-2">
              <a
                href="/decode"
                className="btn-secondary text-xs"
                target="_blank"
                rel="noopener noreferrer"
              >
                🔓 Decoder Tool
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateDebugString());
                }}
                className="btn-secondary text-xs whitespace-nowrap"
              >
                📋 Copy
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
            <code className="text-xs text-gray-700 dark:text-gray-300 font-mono break-all">
              {generateDebugString()}
            </code>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Preview: {jobData.title} @ {jobData.company} • {matchScore}% • {matchDetails.matchedSkills.length} matched, {matchDetails.missingSkills.length} missing
          </p>
        </div>
      </div>

      {/* Match Score Circle */}
      <div className="card text-center">
        <MatchScore score={matchScore} />
      </div>

      {/* Recommendation Card */}
      <div
        className={`
          p-6 rounded-lg border-l-4
          ${
            recommendation === 'apply'
              ? 'bg-green-50 dark:bg-green-900/30 border-green-500'
              : recommendation === 'maybe'
              ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500'
              : 'bg-red-50 dark:bg-red-900/30 border-red-500'
          }
        `}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{getRecommendationEmoji(recommendation)}</span>
          <h3
            className={`
              text-2xl font-bold
              ${
                recommendation === 'apply'
                  ? 'text-green-800 dark:text-green-200'
                  : recommendation === 'maybe'
                  ? 'text-yellow-800 dark:text-yellow-200'
                  : 'text-red-800 dark:text-red-200'
              }
            `}
          >
            {getRecommendationText(recommendation)}
          </h3>
        </div>
      </div>

      {/* Job Info */}
      <div className="card">
        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {jobData.title}
        </h4>
        <p className="text-gray-600 dark:text-gray-400">{jobData.company}</p>
        {jobData.location && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            📍 {jobData.location}
          </p>
        )}
      </div>

      {/* Scoring Details */}
      {analysis.scoringBreakdown && (
        <div className="card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
          <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
            📊 Scoring Details
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Base Score</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {analysis.baseScore}%
              </p>
            </div>
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                Experience Bonus
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                +{analysis.scoringBreakdown.experienceBonus}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-t border-purple-200 dark:border-purple-700">
              <span className="text-purple-700 dark:text-purple-300">
                Required Skills (3x weight)
              </span>
              <span className="font-semibold text-purple-900 dark:text-purple-100">
                {analysis.scoringBreakdown.requiredMatched} /{' '}
                {analysis.scoringBreakdown.requiredTotal}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-purple-700 dark:text-purple-300">
                Preferred Skills (1x weight)
              </span>
              <span className="font-semibold text-purple-900 dark:text-purple-100">
                {analysis.scoringBreakdown.preferredMatched} /{' '}
                {analysis.scoringBreakdown.preferredTotal}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Matched Skills */}
      {matchDetails.matchedSkills.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            ✓ Matched Skills ({matchDetails.matchedSkills.length})
          </h4>
          <SkillsList skills={matchDetails.matchedSkills} type="matched" />
        </div>
      )}

      {/* Missing Skills */}
      {matchDetails.missingSkills.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            ✗ Missing Skills ({matchDetails.missingSkills.length})
          </h4>
          <SkillsList skills={matchDetails.missingSkills} type="missing" />
        </div>
      )}

      {/* Strengths */}
      {matchDetails.strengthAreas.length > 0 && (
        <div className="card bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
          <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            💪 Your Strengths
          </h4>
          <ul className="space-y-2">
            {matchDetails.strengthAreas.map((strength, index) => (
              <li
                key={index}
                className="text-sm text-green-800 dark:text-green-200 flex items-start"
              >
                <span className="mr-2">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {matchDetails.weakAreas.length > 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700">
          <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
            ⚠️ Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {matchDetails.weakAreas.map((weakness, index) => (
              <li
                key={index}
                className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start"
              >
                <span className="mr-2">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Your Profile Summary */}
      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          📊 Your Profile Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total Skills</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {cvProfile.skills.length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Work Experience</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {cvProfile.totalExperienceYears || cvProfile.experience.length} years
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
