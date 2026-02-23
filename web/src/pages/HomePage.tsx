import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CVProfile, JobData } from '../shared/types'
import { parseCV, parseCVFromText } from '../shared/utils/cvParser'
import { downloadBlob } from '../shared/utils/helpers'
import type { ApplicationStatus, SavedProfile, HistoryEntry } from '../App'

interface HomePageProps {
  cvProfile: CVProfile | null
  onCVUpload: (profile: CVProfile) => void
  onClearCV: () => void
  onAnalyze: (job: JobData) => void
  savedProfiles: SavedProfile[]
  onSaveProfile: (name: string) => void
  onDeleteProfile: (id: string) => void
  onLoadProfile: (id: string) => void
  onUpdateProfile: (profile: CVProfile) => void
  history: HistoryEntry[]
  onViewHistory: (entry: HistoryEntry) => void
  onUpdateEntry: (id: string, patch: Partial<HistoryEntry>) => void
}

const scoreColour = (score: number) =>
  score >= 70 ? 'text-green-600 dark:text-green-400' :
  score >= 50 ? 'text-amber-600 dark:text-amber-400' :
               'text-red-600 dark:text-red-400'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string }> = {
  saved:     { label: 'Saved',     className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
  applied:   { label: 'Applied',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  interview: { label: 'Interview', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  offer:     { label: 'Offer',     className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  rejected:  { label: 'Rejected',  className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

function exportHistoryToCSV(entries: HistoryEntry[]) {
  const headers = ['Date', 'Job Title', 'Company', 'Score', 'Recommendation', 'Status', 'Notes', 'Matched Skills', 'Missing Skills']
  const rows = entries.map(e => [
    new Date(e.date).toLocaleDateString('en-GB'),
    e.jobTitle,
    e.company,
    String(e.matchScore),
    e.recommendation,
    e.status ?? 'saved',
    e.notes ?? '',
    e.analysis.matchDetails.matchedSkills.join('; '),
    e.analysis.matchDetails.missingSkills.join('; '),
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `job-applications-${new Date().toISOString().slice(0, 10)}.csv`)
}

export default function HomePage({
  cvProfile, onCVUpload, onClearCV, onAnalyze,
  savedProfiles, onSaveProfile, onDeleteProfile, onLoadProfile, onUpdateProfile,
  history, onViewHistory, onUpdateEntry,
}: HomePageProps) {
  const [cvTab, setCvTab] = useState<'upload' | 'paste'>('upload')
  const [cvText, setCvText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')

  const [saveProfileName, setSaveProfileName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [showSkillEditor, setShowSkillEditor] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const [showHistory, setShowHistory] = useState(false)
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all')
  const [noteEdit, setNoteEdit] = useState<{ id: string; value: string } | null>(null)

  const [searchParams] = useSearchParams()
  useEffect(() => {
    const jd = searchParams.get('jd')
    const t = searchParams.get('title')
    const c = searchParams.get('company')
    if (jd) setJobDescription(decodeURIComponent(jd))
    if (t) setJobTitle(decodeURIComponent(t))
    if (c) setCompany(decodeURIComponent(c))
  }, [])

  // Bookmarklet: React blocks javascript: in href props, so we set it directly on the DOM element
  const bookmarkletRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    if (bookmarkletRef.current) {
      bookmarkletRef.current.href = `javascript:(function(){var d=window.getSelection().toString().trim();if(!d)d=prompt('Paste the job description:','');if(d)window.open('${window.location.origin}/?jd='+encodeURIComponent(d.slice(0,8000)),'_blank');})()`
    }
  }, [])

  const filteredHistory = history
    .filter(e => {
      const term = searchTerm.toLowerCase()
      return e.jobTitle.toLowerCase().includes(term) || e.company.toLowerCase().includes(term)
    })
    .filter(e => statusFilter === 'all' || (e.status ?? 'saved') === statusFilter)

  // ── CV handlers ──

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      setError('Please upload a .docx or .pdf file')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const result = await parseCV(file)
      onCVUpload(result.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CV. Please make sure it\'s a valid .docx or .pdf file.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleTextParse = () => {
    setError(null)
    try {
      const profile = parseCVFromText(cvText)
      onCVUpload(profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CV text.')
    }
  }

  // ── Profile save ──

  const handleSaveProfile = () => {
    onSaveProfile(saveProfileName)
    setSaveProfileName('')
    setShowSaveForm(false)
  }

  // ── Skill editor ──

  const handleRemoveSkill = (skill: string) => {
    if (!cvProfile) return
    onUpdateProfile({ ...cvProfile, skills: cvProfile.skills.filter(s => s !== skill) })
  }

  const handleAddSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed || !cvProfile) return
    if (cvProfile.skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) return
    onUpdateProfile({ ...cvProfile, skills: [...cvProfile.skills, trimmed] })
    setNewSkill('')
  }

  // ── Analyse ──

  const handleAnalyse = () => {
    if (!jobDescription.trim()) { setError('Please paste a job description'); return }
    if (jobDescription.length < 50) { setError('Job description is too short (minimum 50 characters)'); return }
    onAnalyze({
      url: window.location.href,
      title: jobTitle.trim() || 'Manual Job Entry',
      company: company.trim() || 'Unknown Company',
      description: jobDescription.trim(),
      source: 'linkedin',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── How It Works ── */}
      <div className="grid md:grid-cols-3 gap-8 py-2">
        <div>
          <p className="text-2xl mb-2">📂</p>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Upload Your CV</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">.docx or .pdf, or paste plain text</p>
        </div>
        <div>
          <p className="text-2xl mb-2">📋</p>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Paste Job Description</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Copy from any job posting</p>
        </div>
        <div>
          <p className="text-2xl mb-2">🎯</p>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Get Your Match Score</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">See your score and what skills you're missing</p>
        </div>
      </div>

      {/* ── Bookmarklet ── */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">🔖 Bookmarklet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Drag to your bookmarks bar — click on any job page to open the analyser with the description pre-filled.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            ref={bookmarkletRef}
            draggable
            className="btn-primary text-sm select-none cursor-grab active:cursor-grabbing"
            title="Drag me to your bookmarks bar"
          >
            🔖 Analyse This Job
          </a>
          <button
            onClick={() => {
              if (bookmarkletRef.current) {
                navigator.clipboard.writeText(bookmarkletRef.current.href)
                setBookmarkletCopied(true)
                setTimeout(() => setBookmarkletCopied(false), 2000)
              }
            }}
            className="btn-secondary text-sm"
          >
            {bookmarkletCopied ? '✓ Copied!' : '📋 Copy code'}
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500">← drag to bookmarks bar</span>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* ── Step 1: CV ── */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Step 1: Your CV</h3>

        {!cvProfile ? (
          <>
            {/* Tab switcher */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => setCvTab('upload')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  cvTab === 'upload'
                    ? 'border-forest-600 text-forest-600 dark:text-forest-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                📂 Upload File
              </button>
              <button
                onClick={() => setCvTab('paste')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  cvTab === 'paste'
                    ? 'border-forest-600 text-forest-600 dark:text-forest-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                📝 Paste Text
              </button>
            </div>

            {cvTab === 'upload' ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input type="file" accept=".docx,.pdf" onChange={handleFileUpload} disabled={uploading} className="hidden" id="cv-upload" />
                <label htmlFor="cv-upload" className="cursor-pointer inline-block">
                  <div className="text-6xl mb-4">{uploading ? '⏳' : '📂'}</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {uploading ? 'Parsing CV...' : 'Click to upload your CV'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">.docx or .pdf • Your data never leaves your browser</div>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={cvText}
                  onChange={e => setCvText(e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="Paste your CV text here — copy everything from your Word or Google Doc..."
                  rows={12}
                />
                <button
                  onClick={handleTextParse}
                  disabled={cvText.trim().length < 50}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Parse CV
                </button>
              </div>
            )}

            {/* Saved profiles quick-load */}
            {savedProfiles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or load a saved profile:</p>
                <div className="flex flex-wrap gap-2">
                  {savedProfiles.map(p => (
                    <button key={p.id} onClick={() => onLoadProfile(p.id)} className="btn-secondary text-sm">
                      👤 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {/* CV loaded banner */}
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">✓ CV Loaded</p>
                  {cvProfile.personalInfo?.name && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">{cvProfile.personalInfo.name}</p>
                  )}
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {cvProfile.skills.length} skills
                    {cvProfile.experience.length > 0 && ` • ${cvProfile.experience.length} role${cvProfile.experience.length !== 1 ? 's' : ''}`}
                    {cvProfile.totalExperienceYears ? ` • ${cvProfile.totalExperienceYears} yrs experience` : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <label htmlFor="cv-upload-replace" className="btn-secondary text-sm cursor-pointer">
                    📤 Replace CV
                  </label>
                  <input type="file" accept=".docx,.pdf" onChange={handleFileUpload} className="hidden" id="cv-upload-replace" />
                  <button onClick={onClearCV} className="btn-secondary text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">
                    🗑️ Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Skill editor */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowSkillEditor(s => !s)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  ✏️ Review &amp; Edit Skills ({cvProfile.skills.length})
                </span>
                <span className="text-gray-400 text-xs">{showSkillEditor ? '▲ Hide' : '▼ Show'}</span>
              </button>

              {showSkillEditor && (
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Remove skills the parser picked up incorrectly, or add ones it missed. This directly affects your match score.
                  </p>

                  {/* Skill chips */}
                  <div className="flex flex-wrap gap-2">
                    {cvProfile.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-forest-100 dark:bg-forest-900/40 text-forest-800 dark:text-forest-200"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-600 dark:hover:text-red-400 font-bold leading-none ml-0.5"
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add skill input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                      placeholder="Add a skill and press Enter..."
                      className="input-field text-sm flex-1"
                    />
                    <button
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Save as profile */}
            {!showSaveForm ? (
              <button onClick={() => setShowSaveForm(true)} className="btn-secondary text-sm">
                💾 Save as Profile
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={saveProfileName}
                  onChange={e => setSaveProfileName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveProfile()}
                  placeholder="Profile name (e.g. Main CV, Tech CV)"
                  className="input-field text-sm flex-1"
                  autoFocus
                />
                <button onClick={handleSaveProfile} className="btn-primary text-sm">Save</button>
                <button onClick={() => setShowSaveForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Saved Profiles ── */}
      {savedProfiles.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">👤 Saved CV Profiles</h3>
          <div className="space-y-2">
            {savedProfiles.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {p.profile.skills.length} skills • saved {new Date(p.savedAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onLoadProfile(p.id)} className="btn-primary text-sm">Load</button>
                  <button onClick={() => onDeleteProfile(p.id)} className="btn-secondary text-sm text-red-600 dark:text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Job Description ── */}
      {cvProfile && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Step 2: Paste Job Description</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Job Title <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-field" placeholder="e.g. Senior Software Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Company <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
              </label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="input-field" placeholder="e.g. Google" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Job Description *</label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Paste the full job description here..."
                rows={12}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {jobDescription.length} characters (minimum 50 required)
              </div>
            </div>
            <button
              onClick={handleAnalyse}
              disabled={!jobDescription.trim() || jobDescription.length < 50}
              className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔍 Analyse Match
            </button>
          </div>
        </div>
      )}

      {/* ── Recent Analyses ── */}
      {history.length > 0 && (
        <div className="card">
          {/* Header row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(h => !h)}
              className="flex items-center gap-2 text-left flex-1 min-w-0"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                🕒 Recent Analyses ({history.length})
              </h3>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{showHistory ? '▲' : '▼'}</span>
            </button>
            <button
              onClick={() => exportHistoryToCSV(history)}
              className="btn-secondary text-sm flex-shrink-0"
              title="Export all applications as CSV"
            >
              📥 Export CSV
            </button>
          </div>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {/* Search + filter */}
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search title or company..."
                  className="input-field text-sm flex-1 min-w-[160px]"
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as 'all' | ApplicationStatus)}
                  className="input-field text-sm w-auto"
                >
                  <option value="all">All Statuses</option>
                  {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>

              {filteredHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No analyses match your search.
                </p>
              ) : (
                filteredHistory.map(entry => {
                  const status = entry.status ?? 'saved'
                  const isEditingNote = noteEdit?.id === entry.id
                  return (
                    <div key={entry.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {/* Main info row */}
                      <div className="flex items-start gap-2 p-3">
                        <button
                          onClick={() => onViewHistory(entry)}
                          className="text-left flex-1 min-w-0 hover:text-forest-600 dark:hover:text-forest-400 transition-colors"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">{entry.jobTitle}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {entry.company} • {new Date(entry.date).toLocaleDateString('en-GB')}
                          </p>
                        </button>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-base font-bold ${scoreColour(entry.matchScore)}`}>
                            {entry.matchScore}%
                          </span>
                          <select
                            value={status}
                            onChange={e => onUpdateEntry(entry.id, { status: e.target.value as ApplicationStatus })}
                            className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${STATUS_CONFIG[status].className}`}
                          >
                            {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map(s => (
                              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Notes row */}
                      <div className="px-3 pb-3">
                        {isEditingNote ? (
                          <textarea
                            value={noteEdit.value}
                            onChange={e => setNoteEdit(n => n ? { ...n, value: e.target.value } : null)}
                            onBlur={() => {
                              onUpdateEntry(entry.id, { notes: noteEdit.value })
                              setNoteEdit(null)
                            }}
                            placeholder="Add a note..."
                            className="input-field text-sm w-full"
                            rows={2}
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setNoteEdit({ id: entry.id, value: entry.notes ?? '' })}
                            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-left"
                          >
                            {entry.notes ? `📝 ${entry.notes}` : '+ Add note'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Recurring Skill Gaps ── */}
      {history.length >= 3 && (() => {
        const freq = history
          .flatMap(e => e.analysis.matchDetails.missingSkills)
          .reduce((acc: Record<string, number>, skill) => {
            acc[skill] = (acc[skill] || 0) + 1
            return acc
          }, {})
        const topGaps = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6)
        if (topGaps.length === 0) return null
        const maxCount = topGaps[0][1]
        return (
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              📊 Recurring Skill Gaps
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Based on your last {history.length} {history.length === 1 ? 'analysis' : 'analyses'} — these skills keep coming up as missing.
            </p>
            <div className="space-y-3">
              {topGaps.map(([skill, count]) => (
                <div key={skill} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-28 shrink-0 truncate">{skill}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-red-400 dark:bg-red-500 transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right shrink-0">
                    {count} {count === 1 ? 'role' : 'roles'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              Worth adding to your CV or upskilling — especially the top ones.
            </p>
          </div>
        )
      })()}

      {/* ── Privacy ── */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4">
        🔒 All analysis runs in your browser — your CV and job descriptions are never sent anywhere.
      </p>

    </div>
  )
}
