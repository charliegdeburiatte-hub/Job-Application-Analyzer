import { useState } from 'react'
import { decompressFromEncodedURIComponent } from 'lz-string'

export default function DecodePage() {
  const [compressedString, setCompressedString] = useState('')
  const [decodedData, setDecodedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDecode = () => {
    if (!compressedString.trim()) {
      setError('Please paste a compressed test string')
      return
    }

    try {
      const decompressed = decompressFromEncodedURIComponent(compressedString.trim())
      if (!decompressed) {
        setError('Failed to decompress string. Make sure you copied the entire compressed string.')
        return
      }

      const parsed = JSON.parse(decompressed)
      setDecodedData(parsed)
      setError(null)
    } catch (err) {
      setError('Invalid compressed string. Please check and try again.')
      console.error(err)
    }
  }

  const handleClear = () => {
    setCompressedString('')
    setDecodedData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔓 Test Data Decoder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Paste your compressed test string to view the full job analysis including description
          </p>
        </div>

        {/* Input Section */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Compressed Test String
          </label>
          <textarea
            value={compressedString}
            onChange={(e) => setCompressedString(e.target.value)}
            placeholder="Paste your compressed test string here (e.g., N4IgdghgtgpiBcIDKBXAlgYwPYwJYBc0A...)"
            className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     font-mono text-sm"
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={handleDecode} className="btn-primary flex-1">
              🔓 Decode
            </button>
            <button onClick={handleClear} className="btn-secondary">
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Decoded Data Display */}
        {decodedData && (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                📊 Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-purple-700 dark:text-purple-300">Date</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">{decodedData.date}</p>
                </div>
                <div>
                  <p className="text-purple-700 dark:text-purple-300">Match Score</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">{decodedData.analysis.matchScore}%</p>
                </div>
                <div>
                  <p className="text-purple-700 dark:text-purple-300">Recommendation</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 capitalize">{decodedData.analysis.recommendation}</p>
                </div>
                <div>
                  <p className="text-purple-700 dark:text-purple-300">Base Score</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">{decodedData.analysis.baseScore}%</p>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                💼 Job Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{decodedData.job.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{decodedData.job.company}</p>
                </div>
                {decodedData.job.location && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="text-gray-900 dark:text-gray-100">{decodedData.job.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Job Description</p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {decodedData.job.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Breakdown */}
            {decodedData.scoring && (
              <div className="card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                  🔢 Scoring Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-700 dark:text-purple-300">Required Skills (3x weight)</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {decodedData.scoring.requiredMatched} / {decodedData.scoring.requiredTotal}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-700 dark:text-purple-300">Preferred Skills (1x weight)</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {decodedData.scoring.preferredMatched} / {decodedData.scoring.preferredTotal}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-purple-700 dark:text-purple-300">Experience Bonus</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      +{decodedData.scoring.experienceBonus}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Matched Skills */}
            <div className="card">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                ✓ Matched Skills ({decodedData.analysis.matchedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {decodedData.analysis.matchedSkills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            {decodedData.analysis.missingSkills.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
                  ✗ Missing Skills ({decodedData.analysis.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {decodedData.analysis.missingSkills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Gaps */}
            <div className="grid md:grid-cols-2 gap-4">
              {decodedData.analysis.strengths.length > 0 && (
                <div className="card bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                    💪 Strengths
                  </h3>
                  <ul className="space-y-2">
                    {decodedData.analysis.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="text-sm text-green-800 dark:text-green-200 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {decodedData.analysis.gaps.length > 0 && (
                <div className="card bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700">
                  <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                    ⚠️ Gaps
                  </h3>
                  <ul className="space-y-2">
                    {decodedData.analysis.gaps.map((gap: string, idx: number) => (
                      <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Raw JSON (for debugging) */}
            <div className="card">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔍 View Raw JSON
                </summary>
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-xs overflow-x-auto">
                  <code className="text-gray-700 dark:text-gray-300">
                    {JSON.stringify(decodedData, null, 2)}
                  </code>
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!decodedData && (
          <div className="card bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
              📖 How to Use
            </h3>
            <ol className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>After analyzing a job, click the "Copy" button in the debug section</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Paste the compressed string into the text area above</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Click "Decode" to view the full job analysis including the complete job description</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Use this to verify scoring accuracy, review test results, or share with Claude for analysis</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
