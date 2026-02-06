import { useState } from 'react'
import type { CVProfile, JobData } from '../shared/types'
import { parseCV } from '../shared/utils/cvParser'

interface HomePageProps {
  cvProfile: CVProfile | null
  onCVUpload: (profile: CVProfile) => void
  onAnalyze: (job: JobData) => void
}

export default function HomePage({ cvProfile, onCVUpload, onAnalyze }: HomePageProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.docx')) {
      setError('Please upload a .docx file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const result = await parseCV(file)
      onCVUpload(result.profile)
    } catch (err) {
      setError('Failed to parse CV. Please make sure it\'s a valid .docx file.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }

    if (jobDescription.length < 50) {
      setError('Job description is too short (minimum 50 characters)')
      return
    }

    const jobData: JobData = {
      url: window.location.href,
      title: jobTitle.trim() || 'Manual Job Entry',
      company: company.trim() || 'Unknown Company',
      description: jobDescription.trim(),
      source: 'linkedin',
    }

    onAnalyze(jobData)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Introduction */}
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div>
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Upload Your CV</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload your CV (.docx format) - we'll extract your skills and experience
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Paste Job Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Copy and paste the full job description from any job posting
            </p>
          </div>
          <div>
            <div className="mb-2">
              <img src="/logo.jpeg" alt="Target" className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Get Your Match Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Instantly see how well you match and what skills you're missing
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* CV Upload Section */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Step 1: Upload Your CV
        </h3>
        
        {!cvProfile ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".docx"
              onChange={handleCVUpload}
              disabled={uploading}
              className="hidden"
              id="cv-upload"
            />
            <label
              htmlFor="cv-upload"
              className="cursor-pointer inline-block"
            >
              <div className="text-6xl mb-4">📄</div>
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {uploading ? 'Parsing CV...' : 'Click to upload your CV'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                .docx format only • Your data never leaves your browser
              </div>
            </label>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  ✓ CV Uploaded Successfully
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Found {cvProfile.skills.length} skills and {cvProfile.experience.length} work experiences
                </p>
                {cvProfile.totalExperienceYears && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Total experience: {cvProfile.totalExperienceYears} years
                  </p>
                )}
              </div>
              <button
                onClick={() => document.getElementById('cv-upload')?.click()}
                className="btn-secondary text-sm"
              >
                Upload Different CV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Description Section */}
      {cvProfile && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Step 2: Paste Job Description
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Job Title <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Company <span className="text-gray-500 dark:text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input-field"
                placeholder="e.g. Google"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Job Description *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="Paste the full job description here..."
                rows={12}
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {jobDescription.length} characters (minimum 50 required)
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || jobDescription.length < 50}
              className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔍 Analyze Match
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              100% Private & Secure
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              All analysis happens in your browser. Your CV and job descriptions are never sent to any server.
              No data is collected, stored, or shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
