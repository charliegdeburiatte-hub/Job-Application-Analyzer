import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import type { CVProfile, JobData, Analysis } from './shared/types'
import { analyzeJob } from './shared/utils/analysis'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import DecodePage from './pages/DecodePage'

export interface SavedProfile {
  id: string
  name: string
  profile: CVProfile
  savedAt: string
}

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

export interface HistoryEntry {
  id: string
  date: string
  jobTitle: string
  company: string
  matchScore: number
  recommendation: string
  analysis: Analysis
  jobData: JobData
  status?: ApplicationStatus
  notes?: string
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function MainApp() {
  const [darkMode, setDarkMode] = useState(() => loadJSON('darkMode', false))
  const [cvProfile, setCVProfile] = useState<CVProfile | null>(() => loadJSON('cvProfile', null))
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(() => loadJSON('savedProfiles', []))
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadJSON('analysisHistory', []))
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const location = useLocation()

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Persist active CV
  useEffect(() => {
    if (cvProfile) {
      localStorage.setItem('cvProfile', JSON.stringify(cvProfile))
    } else {
      localStorage.removeItem('cvProfile')
    }
  }, [cvProfile])

  // Persist saved profiles
  useEffect(() => {
    localStorage.setItem('savedProfiles', JSON.stringify(savedProfiles))
  }, [savedProfiles])

  // Persist history
  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(history))
  }, [history])

  const handleAnalyze = (job: JobData) => {
    if (!cvProfile) {
      alert('Please upload your CV first')
      return
    }
    const result = analyzeJob(job, cvProfile)
    setJobData(job)
    setAnalysis(result)

    // Save to history (cap at 20)
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      jobTitle: job.title,
      company: job.company,
      matchScore: result.matchScore,
      recommendation: result.recommendation,
      analysis: result,
      jobData: job,
    }
    setHistory(prev => [entry, ...prev].slice(0, 20))
  }

  const handleReset = () => {
    setJobData(null)
    setAnalysis(null)
  }

  const handleClearCV = () => {
    setCVProfile(null)
    setJobData(null)
    setAnalysis(null)
  }

  const handleSaveProfile = (name: string) => {
    if (!cvProfile) return
    const newProfile: SavedProfile = {
      id: Date.now().toString(),
      name: name.trim() || 'My CV',
      profile: cvProfile,
      savedAt: new Date().toISOString(),
    }
    setSavedProfiles(prev => [...prev, newProfile])
  }

  const handleDeleteProfile = (id: string) => {
    setSavedProfiles(prev => prev.filter(p => p.id !== id))
  }

  const handleLoadProfile = (id: string) => {
    const found = savedProfiles.find(p => p.id === id)
    if (found) setCVProfile(found.profile)
  }

  const handleUpdateProfile = (updated: CVProfile) => {
    setCVProfile(updated)
  }

  const handleViewHistory = (entry: HistoryEntry) => {
    setJobData(entry.jobData)
    setAnalysis(entry.analysis)
  }

  const updateHistoryEntry = (id: string, patch: Partial<HistoryEntry>) => {
    setHistory(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  const isDecodePage = location.pathname === '/decode'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-purple-600 dark:bg-purple-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="hover:opacity-90 transition-opacity min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold truncate">Job Application Analyser</h1>
              <p className="text-purple-100 mt-0.5 text-xs sm:text-sm hidden sm:block">
                {isDecodePage ? 'Test Data Decoder' : "Find out if you're a good match for any job posting"}
              </p>
            </Link>
            <div className="flex items-center gap-3">
              {isDecodePage && (
                <Link to="/" className="btn-secondary text-sm">
                  ← Back to Analyser
                </Link>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-purple-700 dark:bg-purple-900 hover:bg-purple-800 dark:hover:bg-purple-950 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Routes>
          <Route
            path="/"
            element={
              !analysis ? (
                <HomePage
                  cvProfile={cvProfile}
                  onCVUpload={setCVProfile}
                  onClearCV={handleClearCV}
                  onAnalyze={handleAnalyze}
                  savedProfiles={savedProfiles}
                  onSaveProfile={handleSaveProfile}
                  onDeleteProfile={handleDeleteProfile}
                  onLoadProfile={handleLoadProfile}
                  onUpdateProfile={handleUpdateProfile}
                  history={history}
                  onViewHistory={handleViewHistory}
                  onUpdateEntry={updateHistoryEntry}
                />
              ) : (
                <ResultsPage
                  analysis={analysis}
                  jobData={jobData!}
                  cvProfile={cvProfile!}
                  onReset={handleReset}
                />
              )
            }
          />
          <Route path="/decode" element={<DecodePage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>
            Built with React + TypeScript • No data is sent to any server • Everything runs in your browser
          </p>
          <p className="mt-2 text-sm">
            Open source on{' '}
            <a
              href="https://github.com/charliegdeburiatte-hub/Job-Application-Analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  )
}

export default App
