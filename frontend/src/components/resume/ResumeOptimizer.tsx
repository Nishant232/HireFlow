import { useState } from 'react'
import { resumeAPI, type ResumeOptimization } from '@/lib/api'
import AtsScoreRing from './AtsScoreRing'
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  resumeText: string
}

export default function ResumeOptimizer({ resumeText }: Props) {
  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [optimization, setOptimization] = useState<ResumeOptimization | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedBullets, setCopiedBullets] = useState(false)

  const handleOptimize = async () => {
    if (!jobDescription) { toast.error('Please paste a job description'); return }
    setLoading(true)
    try {
      const { data } = await resumeAPI.optimize({ resumeText, jobDescription, targetRole, targetCompany })
      setOptimization(data.optimization)
      toast.success('Resume optimized!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  const copyBullets = () => {
    if (!optimization) return
    navigator.clipboard.writeText(optimization.optimizedBullets.map((b) => `• ${b}`).join('\n'))
    setCopiedBullets(true)
    setTimeout(() => setCopiedBullets(false), 2000)
    toast.success('Bullets copied!')
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match', color: 'text-green-600' }
    if (score >= 60) return { label: 'Good Match', color: 'text-blue-600' }
    if (score >= 40) return { label: 'Partial Match', color: 'text-yellow-600' }
    return { label: 'Needs Work', color: 'text-red-600' }
  }

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Software Engineer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Company</label>
          <input value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="LexisNexis" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Description * <span className="text-gray-400 font-normal">(paste from job posting)</span>
        </label>
        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
          rows={6} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Paste the complete job description here..." />
      </div>

      <button onClick={handleOptimize} disabled={loading || !resumeText}
        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
      >
        {loading ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Optimize & Score</>
        )}
      </button>

      {/* Results */}
      {optimization && (
        <div className="space-y-5 mt-2">
          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-4 flex flex-col items-center">
              <AtsScoreRing score={optimization.atsScore} label="ATS Score" />
            </div>
            <div className="bg-white rounded-xl border p-4 flex flex-col items-center">
              <AtsScoreRing score={optimization.matchPercentage} label="JD Match" />
            </div>
            <div className="bg-white rounded-xl border p-4 md:col-span-1 col-span-2">
              <p className={`text-lg font-bold ${getScoreLabel(optimization.atsScore).color}`}>
                {getScoreLabel(optimization.atsScore).label}
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500">Present keywords: {optimization.presentKeywords.length}</p>
                <p className="text-xs text-gray-500">Missing keywords: {optimization.missingKeywords.length}</p>
              </div>
            </div>
          </div>

          {/* Missing Keywords */}
          {optimization.missingKeywords.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Missing Keywords (Add These!)</h4>
              <div className="flex flex-wrap gap-2">
                {optimization.missingKeywords.map((kw) => (
                  <span key={kw} className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Present Keywords */}
          {optimization.presentKeywords.length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Matching Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {optimization.presentKeywords.map((kw) => (
                  <span key={kw} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Optimized Summary */}
          {optimization.optimizedSummary && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📝 Optimized Summary</h4>
              <p className="text-sm text-blue-800">{optimization.optimizedSummary}</p>
            </div>
          )}

          {/* Optimized Bullets */}
          {optimization.optimizedBullets.length > 0 && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-900">✨ Optimized Bullets</h4>
                <button onClick={copyBullets} className="flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 transition">
                  {copiedBullets ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedBullets ? 'Copied!' : 'Copy All'}
                </button>
              </div>
              <ul className="space-y-2">
                {optimization.optimizedBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-purple-800">
                    <span className="text-purple-400 mt-0.5 font-bold">•</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {optimization.recommendations.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <h4 className="font-semibold text-amber-900 mb-2">💡 Recommendations</h4>
              <ul className="space-y-1">
                {optimization.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">{i + 1}.</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
