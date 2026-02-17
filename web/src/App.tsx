import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import type { CVProfile, JobData, Analysis } from './shared/types'
import { analyzeJob } from './shared/utils/analysis'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import DecodePage from './pages/DecodePage'

function MainApp() {
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })
  const [cvProfile, setCVProfile] = useState<CVProfile | null>(() => {
    // Load CV from localStorage on mount
    try {
      const saved = localStorage.getItem('cvProfile')
      if (saved) {
        console.log('📦 Loaded CV from localStorage:', JSON.parse(saved).skills.length, 'skills')
        return JSON.parse(saved)
      }
      console.log('📦 No CV found in localStorage')
      return null
    } catch (error) {
      console.error('❌ Error loading CV from localStorage:', error)
      return null
    }
  })
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const location = useLocation()

  // Apply dark mode class to document and persist preference
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Persist CV profile to localStorage whenever it changes
  useEffect(() => {
    if (cvProfile) {
      try {
        localStorage.setItem('cvProfile', JSON.stringify(cvProfile))
        console.log('💾 Saved CV to localStorage:', cvProfile.skills.length, 'skills')
      } catch (error) {
        console.error('❌ Error saving CV to localStorage:', error)
      }
    }
  }, [cvProfile])

  const handleAnalyze = (job: JobData) => {
    if (!cvProfile) {
      alert('Please upload your CV first')
      return
    }

    setJobData(job)
    const result = analyzeJob(job, cvProfile)
    setAnalysis(result)
  }

  const handleReset = () => {
    setJobData(null)
    setAnalysis(null)
  }

  const handleClearCV = () => {
    setCVProfile(null)
    localStorage.removeItem('cvProfile')
    // Also clear analysis if any
    setJobData(null)
    setAnalysis(null)
  }

  const isDecodePage = location.pathname === '/decode'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <h1 className="text-3xl font-bold">Job Application Analyser</h1>
              <p className="text-blue-100 mt-1">
                {isDecodePage ? 'Test Data Decoder' : 'Find out if you\'re a good match for any job posting'}
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
                className="p-2 rounded-lg bg-blue-700 dark:bg-blue-900 hover:bg-blue-800 dark:hover:bg-blue-950 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
              className="text-blue-600 dark:text-blue-400 hover:underline"
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
