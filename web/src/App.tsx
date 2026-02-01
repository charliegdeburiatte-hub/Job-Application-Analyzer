import { useState, useEffect } from 'react'
import type { CVProfile, JobData, Analysis } from './shared/types'
import { analyzeJob } from './shared/utils/analysis'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [cvProfile, setCVProfile] = useState<CVProfile | null>(null)
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Job Application Analyzer</h1>
              <p className="text-blue-100 mt-1">
                Find out if you're a good match for any job posting
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-blue-700 dark:bg-blue-900 hover:bg-blue-800 dark:hover:bg-blue-950 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!analysis ? (
          <HomePage
            cvProfile={cvProfile}
            onCVUpload={setCVProfile}
            onAnalyze={handleAnalyze}
          />
        ) : (
          <ResultsPage
            analysis={analysis}
            jobData={jobData!}
            cvProfile={cvProfile!}
            onReset={handleReset}
          />
        )}
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

export default App
