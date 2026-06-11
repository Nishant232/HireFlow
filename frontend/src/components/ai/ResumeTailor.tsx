import { useState } from 'react'
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react'
import { aiAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  applicationId?: string
  company?: string
  role?: string
  jobDescription?: string
}

export default function ResumeTailor({ applicationId, company = '', role = '', jobDescription = '' }: Props) {
  const [jd, setJd] = useState(jobDescription)
  const [companyName, setCompanyName] = useState(company)
  const [roleName, setRoleName] = useState(role)
  const [currentBullets, setCurrentBullets] = useState('')
  const [bullets, setBullets] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!jd || !roleName || !companyName) {
      toast.error('Please fill in company, role, and job description')
      return
    }
    setLoading(true)
    try {
      const { data } = await aiAPI.tailorResume({
        jobDescription: jd,
        currentBullets,
        role: roleName,
        company: companyName,
        applicationId,
      })
      setBullets(data.bullets)
      toast.success('Resume bullets generated!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate bullets')
    } finally {
      setLoading(false)
    }
  }

  const copyAll = () => {
    navigator.clipboard.writeText(bullets.map((b) => `• ${b}`).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Google"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Description * <span className="text-gray-400 font-normal">(paste from LinkedIn/Naukri)</span>
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Paste the complete job description here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Current Bullets <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={currentBullets}
          onChange={(e) => setCurrentBullets(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Paste your existing resume bullets here..."
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
      >
        {loading ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Generate Tailored Bullets</>
        )}
      </button>

      {bullets.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-purple-900">
              ✨ {bullets.length} AI-Generated Resume Bullets
            </h3>
            <button
              onClick={copyAll}
              className="flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 transition"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          <ul className="space-y-2">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-purple-800">
                <span className="text-purple-400 mt-0.5 font-bold">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-purple-500 mt-3">
            💡 These bullets are ATS-optimized and match keywords from the job description
          </p>
        </div>
      )}
    </div>
  )
}
