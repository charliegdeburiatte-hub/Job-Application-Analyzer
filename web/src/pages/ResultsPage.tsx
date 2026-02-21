import { useState } from 'react'
import { jsPDF } from 'jspdf'
import type { Analysis, JobData, CVProfile } from '../shared/types'
import { getRecommendationText, getRecommendationEmoji } from '../shared'
import MatchScore from '../components/MatchScore'
import SkillsList from '../components/SkillsList'
import { compressToEncodedURIComponent } from 'lz-string'

function buildRoleSummary(analysis: Analysis): string {
  const { matchDetails, scoringBreakdown, matchScore } = analysis
  const { missingSkills } = matchDetails

  if (!scoringBreakdown) return `You scored ${matchScore}% for this role.`

  const { requiredMatched, requiredTotal, preferredMatched, preferredTotal } = scoringBreakdown
  const missingRequired = requiredTotal - requiredMatched

  if (requiredTotal > 0 && missingRequired === 0) {
    const prefSentence = preferredTotal > 0
      ? ` You also matched ${preferredMatched} of ${preferredTotal} preferred skill${preferredTotal !== 1 ? 's' : ''}.`
      : ''
    return `You meet all ${requiredTotal} required skill${requiredTotal !== 1 ? 's' : ''} for this role.${prefSentence}`
  }

  if (requiredTotal > 0) {
    const topMissing = missingSkills.slice(0, 3).join(', ')
    const missingPhrase = topMissing ? ` (${topMissing})` : ''
    return `You match ${requiredMatched} of ${requiredTotal} required skills for this role. The ${missingRequired} missing skill${missingRequired !== 1 ? 's' : ''}${missingPhrase} ${missingRequired === 1 ? 'is' : 'are'} the main reason for your ${matchScore}% score.`
  }

  return `You matched ${preferredMatched} of ${preferredTotal} preferred skills for this role, scoring ${matchScore}%.`
}

interface ResultsPageProps {
  analysis: Analysis
  jobData: JobData
  cvProfile: CVProfile
  onReset: () => void
}

export default function ResultsPage({ analysis, jobData, cvProfile, onReset }: ResultsPageProps) {
  const { matchScore, recommendation, matchDetails } = analysis
  const [copied, setCopied] = useState(false)

  const copyMissingSkills = () => {
    const text = 'Skills to add to CV:\n' + matchDetails.missingSkills.map(s => `• ${s}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
      analysedDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `job-analysis-${jobData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 15
    const contentW = pageW - margin * 2
    let y = 0

    const addPage = () => {
      doc.addPage()
      y = 20
    }

    const checkPageBreak = (needed: number) => {
      if (y + needed > 275) addPage()
    }

    // ── Header bar ──
    doc.setFillColor(126, 34, 206) // purple-700
    doc.rect(0, 0, pageW, 28, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text('Job Application Analyser', margin, 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Analysis Report  •  ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), margin, 21)
    y = 38

    // ── Job details ──
    doc.setTextColor(17, 24, 39) // gray-900
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.text(jobData.title, margin, y)
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(75, 85, 99) // gray-600
    doc.text(jobData.company, margin, y)
    y += 5
    if (jobData.location) {
      doc.text(jobData.location, margin, y)
      y += 5
    }
    y += 4

    // ── Divider ──
    doc.setDrawColor(216, 180, 254) // purple-200
    doc.line(margin, y, pageW - margin, y)
    y += 8

    // ── Match score ──
    const scoreColour = matchScore >= 70 ? [22, 163, 74] : matchScore >= 50 ? [202, 138, 4] : [220, 38, 38]
    doc.setFillColor(...(scoreColour as [number, number, number]))
    doc.circle(margin + 18, y + 14, 14, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    const scoreText = `${matchScore}%`
    const scoreW = doc.getTextWidth(scoreText)
    doc.text(scoreText, margin + 18 - scoreW / 2, y + 16)

    doc.setTextColor(17, 24, 39)
    doc.setFontSize(14)
    doc.text(getRecommendationText(recommendation), margin + 38, y + 10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('Match Score', margin + 38, y + 18)
    y += 36

    // ── Scoring breakdown ──
    if (analysis.scoringBreakdown) {
      checkPageBreak(30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(17, 24, 39)
      doc.text('Scoring Breakdown', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(75, 85, 99)
      const sb = analysis.scoringBreakdown
      doc.text(`Base Score: ${analysis.baseScore}%   Experience Bonus: +${sb.experienceBonus}   Final Score: ${matchScore}%`, margin, y)
      y += 5
      doc.text(`Required Skills: ${sb.requiredMatched} / ${sb.requiredTotal} matched (3× weight)`, margin, y)
      y += 5
      doc.text(`Preferred Skills: ${sb.preferredMatched} / ${sb.preferredTotal} matched (1× weight)`, margin, y)
      y += 10
    }

    // ── Helper to render a section with wrapped skill chips as text ──
    const renderSection = (title: string, items: string[], colour: [number, number, number]) => {
      if (items.length === 0) return
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...colour)
      doc.text(`${title} (${items.length})`, margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 65, 81)
      const line: string[] = []
      let lineW = 0
      for (const skill of items) {
        const w = doc.getTextWidth(skill + '  ')
        if (lineW + w > contentW && line.length > 0) {
          checkPageBreak(6)
          doc.text(line.join('   '), margin, y)
          y += 5
          line.length = 0
          lineW = 0
        }
        line.push(skill)
        lineW += w
      }
      if (line.length > 0) {
        checkPageBreak(6)
        doc.text(line.join('   '), margin, y)
        y += 5
      }
      y += 5
    }

    // ── Helper for bullet list sections ──
    const renderBullets = (title: string, items: string[], colour: [number, number, number]) => {
      if (items.length === 0) return
      checkPageBreak(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...colour)
      doc.text(title, margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(55, 65, 81)
      for (const item of items) {
        const lines = doc.splitTextToSize('• ' + item, contentW)
        checkPageBreak(lines.length * 5 + 2)
        doc.text(lines, margin, y)
        y += lines.length * 5 + 1
      }
      y += 4
    }

    renderSection('Matched Skills', matchDetails.matchedSkills, [22, 163, 74])
    renderSection('Missing Skills', matchDetails.missingSkills, [220, 38, 38])
    renderBullets('Your Strengths', matchDetails.strengthAreas, [22, 163, 74])
    renderBullets('Areas for Improvement', matchDetails.weakAreas, [202, 138, 4])

    // ── Footer on each page ──
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('Generated by Job Application Analyser  •  All analysis runs locally in your browser', margin, 290)
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin - 20, 290)
    }

    const filename = `job-analysis-${jobData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
    doc.save(filename)
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onReset} className="btn-secondary">
          ← Analyse Another Job
        </button>
        <div className="flex gap-2">
          <button onClick={downloadPDF} className="btn-primary">
            📄 Download PDF
          </button>
          <button onClick={downloadResults} className="btn-secondary">
            📥 Download JSON
          </button>
        </div>
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
        <div className="flex items-center gap-3 mb-3">
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
        <p className={`text-sm ${
          recommendation === 'apply'
            ? 'text-green-700 dark:text-green-300'
            : recommendation === 'maybe'
            ? 'text-yellow-700 dark:text-yellow-300'
            : 'text-red-700 dark:text-red-300'
        }`}>
          {buildRoleSummary(analysis)}
        </p>
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

      {/* Keyword Suggestions */}
      {matchDetails.missingSkills.length > 0 && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              💡 Add to Your CV
            </h4>
            <button
              onClick={copyMissingSkills}
              className="btn-secondary text-sm flex-shrink-0"
            >
              {copied ? '✓ Copied!' : '📋 Copy as list'}
            </button>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            These required skills aren't on your CV — consider adding them if you have the experience:
          </p>
          <div className="flex flex-wrap gap-2">
            {matchDetails.missingSkills.map(skill => (
              <span
                key={skill}
                className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-600"
              >
                {skill}
              </span>
            ))}
          </div>
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
              {cvProfile.totalExperienceYears
                ? `${cvProfile.totalExperienceYears} yrs`
                : `${cvProfile.experience.length} roles`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
