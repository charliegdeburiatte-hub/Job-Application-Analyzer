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
  const [shareCopied, setShareCopied] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const copyShareLink = () => {
    const url = `${window.location.origin}/decode?data=${generateDebugString()}`
    navigator.clipboard.writeText(url)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

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
    doc.setFillColor(45, 106, 79) // forest-600
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
    doc.setDrawColor(156, 212, 181) // forest-200
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onReset} className="btn-secondary">
          ← Analyse Another Job
        </button>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadPDF} className="btn-primary">
            📄 Download PDF
          </button>
          <button onClick={downloadResults} className="btn-secondary">
            📥 Download JSON
          </button>
          <button onClick={copyShareLink} className="btn-secondary">
            {shareCopied ? '✓ Copied!' : '🔗 Share'}
          </button>
        </div>
      </div>

      {/* Debug — ultra-minimal, out of the way */}
      <div className="text-center">
        <button
          onClick={() => setShowDebug(d => !d)}
          className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          🔬 {showDebug ? 'hide debug' : 'debug'}
        </button>
        {showDebug && (
          <div className="mt-3 text-left space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-end gap-2">
              <a href="/decode" className="btn-secondary text-xs" target="_blank" rel="noopener noreferrer">🔓 Decoder</a>
              <button onClick={() => navigator.clipboard.writeText(generateDebugString())} className="btn-secondary text-xs">📋 Copy</button>
            </div>
            <code className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all block">
              {generateDebugString()}
            </code>
          </div>
        )}
      </div>

      {/* Score + Recommendation */}
      <div className="text-center py-4">
        <MatchScore score={matchScore} />
      </div>

      <div className={`border-l-4 pl-5 py-1 ${
        recommendation === 'apply'
          ? 'border-green-500'
          : recommendation === 'maybe'
          ? 'border-yellow-500'
          : 'border-red-500'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{getRecommendationEmoji(recommendation)}</span>
          <h3 className={`text-xl font-bold ${
            recommendation === 'apply'
              ? 'text-green-700 dark:text-green-300'
              : recommendation === 'maybe'
              ? 'text-yellow-700 dark:text-yellow-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {getRecommendationText(recommendation)}
          </h3>
        </div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">{jobData.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {jobData.company}{jobData.location ? ` · ${jobData.location}` : ''}
        </p>
        <p className={`text-sm mt-2 ${
          recommendation === 'apply'
            ? 'text-green-700 dark:text-green-300'
            : recommendation === 'maybe'
            ? 'text-yellow-700 dark:text-yellow-300'
            : 'text-red-700 dark:text-red-300'
        }`}>
          {buildRoleSummary(analysis)}
        </p>
      </div>

      {/* Scoring Details */}
      {analysis.scoringBreakdown && (
        <div className="card bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-700">
          <h4 className="text-lg font-semibold text-forest-900 dark:text-forest-100 mb-3">
            📊 Scoring Details
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-forest-700 dark:text-forest-300 font-medium">Base Score</p>
              <p className="text-2xl font-bold text-forest-900 dark:text-forest-100">
                {analysis.baseScore}%
              </p>
            </div>
            <div>
              <p className="text-sm text-forest-700 dark:text-forest-300 font-medium">
                Experience Bonus
              </p>
              <p className="text-2xl font-bold text-forest-900 dark:text-forest-100">
                +{analysis.scoringBreakdown.experienceBonus}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-t border-forest-200 dark:border-forest-700">
              <span className="text-forest-700 dark:text-forest-300">
                Required Skills (3x weight)
              </span>
              <span className="font-semibold text-forest-900 dark:text-forest-100">
                {analysis.scoringBreakdown.requiredMatched} /{' '}
                {analysis.scoringBreakdown.requiredTotal}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-forest-700 dark:text-forest-300">
                Preferred Skills (1x weight)
              </span>
              <span className="font-semibold text-forest-900 dark:text-forest-100">
                {analysis.scoringBreakdown.preferredMatched} /{' '}
                {analysis.scoringBreakdown.preferredTotal}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Matched Skills */}
      {matchDetails.matchedSkills.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Matched Skills ({matchDetails.matchedSkills.length})
          </h4>
          <SkillsList skills={matchDetails.matchedSkills} type="matched" />
        </div>
      )}

      {/* Missing Skills + Keyword Suggestions */}
      {matchDetails.missingSkills.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Missing Skills ({matchDetails.missingSkills.length})
            </h4>
            <button onClick={copyMissingSkills} className="btn-secondary text-xs">
              {copied ? '✓ Copied!' : '📋 Copy for CV'}
            </button>
          </div>
          <SkillsList skills={matchDetails.missingSkills} type="missing" />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Consider adding these to your CV if you have the experience.
          </p>
        </div>
      )}

      {/* Strengths */}
      {matchDetails.strengthAreas.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-3">
            Your Strengths
          </h4>
          <ul className="space-y-2">
            {matchDetails.strengthAreas.map((strength, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {matchDetails.weakAreas.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {matchDetails.weakAreas.map((weakness, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">→</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Profile Summary */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-6 flex gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Skills on CV</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cvProfile.skills.length}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Experience</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {cvProfile.totalExperienceYears ? `${cvProfile.totalExperienceYears} yrs` : `${cvProfile.experience.length} roles`}
          </p>
        </div>
      </div>
    </div>
  )
}
