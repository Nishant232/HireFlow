import { useState } from 'react'
import { FileText, Copy, Check, RefreshCw } from 'lucide-react'
import { aiAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface Props {
  applicationId?: string
  company?: string
  role?: string
  jobDescription?: string
}

export default function CoverLetterGen({
  applicationId, company = '', role = '', jobDescription = ''
}: Props) {
  const { user } = useAuth()
  const [companyName, setCompanyName] = useState(company)
  const [roleName, setRoleName] = useState(role)
  const [jd, setJd] = useState(jobDescription)
  const [highlights, setHighlights] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!companyName || !roleName || !jd) {
      toast.error('Company, role, and job description are required')
      return
    }
    setLoading(true)
    try {
      const { data } = await aiAPI.coverLetter({
        company: companyName,
        role: roleName,
        jobDescription: jd,
        candidateName: user?.email?.split('@')[0] || '',
        highlights,
        applicationId,
      })
      setCoverLetter(data.coverLetter)
      toast.success('Cover letter generated!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate cover letter')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="LexisNexis" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <input value={roleName} onChange={(e) => setRoleName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Software Engineer" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
        <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={5}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Paste the full job description..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Key Highlights <span className="text-gray-400 font-normal">(optional — specific achievements)</span>
        </label>
        <textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={2}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="E.g. Built a real-time collaborative editor with 50+ users, reduced API latency by 40%..." />
      </div>

      <button onClick={handleGenerate} disabled={loading}
        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
      >
        {loading ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
        ) : (
          <><FileText className="h-4 w-4" /> Generate Cover Letter</>
        )}
      </button>

      {coverLetter && (
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-900">✅ Your Cover Letter</h3>
            <button onClick={handleCopy}
              className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 transition"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">{coverLetter}</p>
        </div>
      )}
    </div>
  )
}
