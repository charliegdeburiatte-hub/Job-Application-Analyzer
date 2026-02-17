import { useState } from 'react'
import type { CVProfile, JobData } from '../shared/types'
import { parseCV, parseCVFromText } from '../shared/utils/cvParser'
import type { SavedProfile, HistoryEntry } from '../App'

interface HomePageProps {
  cvProfile: CVProfile | null
  onCVUpload: (profile: CVProfile) => void
  onClearCV: () => void
  onAnalyze: (job: JobData) => void
  savedProfiles: SavedProfile[]
  onSaveProfile: (name: string) => void
  onDeleteProfile: (id: string) => void
  onLoadProfile: (id: string) => void
  history: HistoryEntry[]
  onViewHistory: (entry: HistoryEntry) => void
}

const scoreColour = (score: number) =>
  score >= 70 ? 'text-green-600 dark:text-green-400' :
  score >= 50 ? 'text-amber-600 dark:text-amber-400' :
               'text-red-600 dark:text-red-400'

export default function HomePage({
  cvProfile, onCVUpload, onClearCV, onAnalyze,
  savedProfiles, onSaveProfile, onDeleteProfile, onLoadProfile,
  history, onViewHistory,
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

  const [showHistory, setShowHistory] = useState(false)

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
      setError('Failed to parse CV. Please make sure it\'s a valid .docx or .pdf file.')
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
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── How It Works ── */}
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div>
            <div className="text-3xl mb-2">📂</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Upload Your CV</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload your CV (.docx or .pdf) or paste it as plain text</p>
          </div>
          <div>
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Paste Job Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Copy and paste the full job description from any job posting</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Get Your Match Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Instantly see how well you match and what skills you're missing</p>
          </div>
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
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                📂 Upload File
              </button>
              <button
                onClick={() => setCvTab('paste')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  cvTab === 'paste'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
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
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">✓ CV Loaded</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {cvProfile.skills.length} skills • {cvProfile.experience.length} work experiences
                  {cvProfile.totalExperienceYears ? ` • ${cvProfile.totalExperienceYears} years total` : ''}
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
          <button
            onClick={() => setShowHistory(h => !h)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">🕒 Recent Analyses ({history.length})</h3>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{showHistory ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showHistory && (
            <div className="mt-4 space-y-2">
              {history.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => onViewHistory(entry)}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{entry.jobTitle}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.company} • {new Date(entry.date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${scoreColour(entry.matchScore)}`}>
                      {entry.matchScore}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Privacy Notice ── */}
      <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">100% Private & Secure</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              All analysis happens in your browser. Your CV and job descriptions are never sent to any server.
              No data is collected, stored, or shared.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
