import { useState } from 'react'
import { jsPDF } from 'jspdf'
import type { Analysis, JobData, CVProfile } from '../shared/types'
import { getRecommendationText, getRecommendationEmoji } from '../shared'
import MatchScore from '../components/MatchScore'
import SkillsList from '../components/SkillsList'
import { compressToEncodedURIComponent } from 'lz-string'

interface AIResult {
  coverLetter: string
  addBullets: string[]
  removeBullets: string[]
}

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

  // Claude AI
  const [apiKey] = useState(() => localStorage.getItem('claudeApiKey') || '')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [coverLetterCopied, setCoverLetterCopied] = useState(false)
  const [addBulletsCopied, setAddBulletsCopied] = useState(false)
  const [genCoverLetter, setGenCoverLetter] = useState(true)
  const [genCvEdits, setGenCvEdits] = useState(true)

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

  // ── Claude AI ──

  const generateWithClaude = async () => {
    if (!apiKey) return
    setAiLoading(true)
    setAiError(null)

    const cvSummary = [
      cvProfile.personalInfo?.name ? `Name: ${cvProfile.personalInfo.name}` : '',
      `Skills: ${cvProfile.skills.join(', ')}`,
      cvProfile.experience.length > 0
        ? `Experience:\n${cvProfile.experience.map(e => `- ${e.title} at ${e.company} (${e.duration}): ${e.description}`).join('\n')}`
        : '',
      cvProfile.education.length > 0
        ? `Education:\n${cvProfile.education.map(e => `- ${e.degree} from ${e.institution} (${e.year})`).join('\n')}`
        : '',
      cvProfile.certifications.length > 0 ? `Certifications: ${cvProfile.certifications.join(', ')}` : '',
      cvProfile.totalExperienceYears ? `Total Experience: ${cvProfile.totalExperienceYears} years` : '',
    ].filter(Boolean).join('\n')

    const coverLetterBlock = genCoverLetter
      ? `STRUCTURE — follow this exactly, seven paragraphs:
1. Opening line: "Dear [extract the hiring manager's name from the job description if one is clearly present, otherwise "Hiring Manager"]," — then one sentence stating the role and company, then a genuine explanation of why this specific company or industry appeals to Charlie, connected to something real in the job description or the nature of the work.
2. His most relevant past experience mapped directly to the key requirements of this role. Name the actual job title(s) and what he did. Be specific about tasks and skills.
3. A second complementary angle — different experience or skills. Mention specific tools or systems by name (e.g. Freshdesk, Active Directory, Outlook, Windows 10/11, Starlink). Describe his end-to-end approach and attention to quality.
4. Soft skills under pressure — staying calm, reassuring users or customers, escalating appropriately rather than passing stress on. Grounded and specific, not generic.
5. Short paragraph: a genuine personal interest showing he cares about this space outside of work. Charlie maintains a homelab where he practises Active Directory tasks (creating accounts, managing groups, resetting passwords), general Windows and networking tasks, and has set up his own Starlink connection. Pick whichever aspects are most relevant to the role and keep it natural, not performative.
6. Practical logistics: confirm availability and flexibility, then a sentence about wanting to grow his career specifically within this company or team.
7. Sign-off: "Thank you for considering my application. I would be happy to discuss how I can contribute to [say something specific about the team or company's goal]." then a blank line, then "Kind regards," then a blank line, then "Charlie De Buriatte"

VOICE REFERENCE — do not copy this, use it only to calibrate tone:
"In my previous role as an IT Technician I provided remote support to a small but busy user base on Windows 10 and 11, handling day to day issues such as Outlook problems, hardware faults and basic connectivity issues. I am comfortable working as a first point of contact, asking the right questions, and either resolving issues myself or collecting clear information for the next line of support. I like the idea of supporting users whose work has a direct impact on clients, and I am very aware that reliable IT can be the difference between them being able to help someone or not."`
      : `Set "coverLetter" to an empty string.`

    const cvEditsBlock = genCvEdits
      ? `Also suggest CV edits specific to this role:
- 3–5 bullet points to ADD. For each one, start with the role or section it belongs under in square brackets, then the bullet text. Example format: "[IT Technician at Acme Ltd] Resolved hardware faults across a remote Windows 10/11 user base". Phrase the bullet exactly as it would appear on the CV (concise, past-tense action phrase).
- 2–3 existing items to REMOVE or de-emphasise, each with a brief reason why they are less relevant for this specific role.`
      : `Set "addBullets" and "removeBullets" to empty arrays.`

    const prompt = `You are writing a cover letter on behalf of Charlie De Buriatte, a UK-based IT support and customer service professional. Match his exact writing voice and structure precisely.

VOICE AND STYLE:
- British English throughout (practise, recognise, programme, etc.)
- First person, warm but professional — never stiff or formal
- Zero buzzwords or corporate filler (no "leverage", "synergy", "passionate about", "team player", "proactive", "results-driven")
- Never use em dashes (—). Use commas, colons, or rewrite the sentence instead.
- Use "genuinely" at most once in the whole letter, and only if nothing else fits.
- A small amount of warmth toward the company is fine, but do not overdo it. One brief, specific reason why this company or role appeals is enough — do not pile on compliments or mention how popular or visible they are.
- Specific: name real tools, systems, and job titles rather than vague claims
- Honest about what he is still learning — does not overclaim
- Shows reasoning and values, not just a list of achievements
- Target around 350–400 words

${coverLetterBlock}

CV Profile:
${cvSummary}

Job: ${jobData.title} at ${jobData.company}${jobData.location ? ` (${jobData.location})` : ''}
Description:
${jobData.description.slice(0, 3000)}

Match Analysis:
- Matched skills: ${matchDetails.matchedSkills.join(', ') || 'none identified'}
- Missing skills: ${matchDetails.missingSkills.join(', ') || 'none identified'}

${cvEditsBlock}

Respond ONLY with valid JSON, no markdown fences:
{"coverLetter":"...","addBullets":["..."],"removeBullets":["..."]}`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(err.error?.message || `API error ${response.status}`)
      }

      const data = await response.json() as { content: { text: string }[] }
      let text = data.content[0].text.trim()
      // Strip markdown fences if Claude wrapped the JSON
      if (text.startsWith('```')) text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      setAiResult(JSON.parse(text) as AIResult)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong. Check your API key and try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const downloadCoverLetterPDF = () => {
    if (!aiResult) return
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentW = pageW - margin * 2
    let y = 25

    if (cvProfile.personalInfo?.name) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(45, 106, 79)
      doc.text(cvProfile.personalInfo.name, margin, y)
      y += 7
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), margin, y)
    y += 5
    doc.text(`Re: ${jobData.title} — ${jobData.company}`, margin, y)
    y += 10

    doc.setTextColor(17, 24, 39)
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(aiResult.coverLetter, contentW)
    doc.text(lines, margin, y)

    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text('Generated by Job Application Analyser', margin, 290)

    doc.save(`cover-letter-${jobData.company.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`)
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

      {/* Claude AI */}
      {apiKey && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-forest-600 dark:text-forest-400 mb-3">
              AI Assistant
            </h4>
            {!aiResult && (
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={genCoverLetter}
                    onChange={e => setGenCoverLetter(e.target.checked)}
                    className="accent-forest-600"
                  />
                  Cover letter
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={genCvEdits}
                    onChange={e => setGenCvEdits(e.target.checked)}
                    className="accent-forest-600"
                  />
                  CV suggestions
                </label>
                <button
                  onClick={generateWithClaude}
                  disabled={aiLoading || (!genCoverLetter && !genCvEdits)}
                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? '⏳ Generating…' : '✨ Generate with Claude'}
                </button>
              </div>
            )}
          </div>

          {aiError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
              {aiError}
            </div>
          )}

          {aiLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sending your CV and job description to Claude Sonnet…
            </p>
          )}

          {aiResult && (
            <div className="space-y-6">

              {/* Cover Letter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cover Letter</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(aiResult.coverLetter); setCoverLetterCopied(true); setTimeout(() => setCoverLetterCopied(false), 2000) }}
                      className="btn-secondary text-xs"
                    >
                      {coverLetterCopied ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    <button onClick={downloadCoverLetterPDF} className="btn-secondary text-xs">
                      📄 PDF
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {aiResult.coverLetter}
                  </p>
                </div>
              </div>

              {/* Add to CV */}
              {aiResult.addBullets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Add to your CV</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(aiResult.addBullets.map(b => `• ${b}`).join('\n')); setAddBulletsCopied(true); setTimeout(() => setAddBulletsCopied(false), 2000) }}
                      className="btn-secondary text-xs"
                    >
                      {addBulletsCopied ? '✓ Copied!' : '📋 Copy all'}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {aiResult.addBullets.map((bullet, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-forest-500 mt-0.5 shrink-0">+</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remove / de-emphasise */}
              {aiResult.removeBullets.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Consider removing or downplaying</p>
                  <ul className="space-y-2">
                    {aiResult.removeBullets.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 shrink-0">−</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => { setAiResult(null); setAiError(null) }}
                className="btn-secondary text-xs"
              >
                ↺ Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
