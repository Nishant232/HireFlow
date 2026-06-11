import { useState } from 'react'
import { MessageSquare, Building2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { aiAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface PrepData {
  technicalQuestions: string[]
  behavioralQuestions: string[]
  questionsToAsk: string[]
  companyResearch: string
  tips: string[]
}

interface Props {
  applicationId?: string
  company?: string
  role?: string
  jobDescription?: string
}

export default function InterviewPrep({ applicationId, company = '', role = '', jobDescription = '' }: Props) {
  const [companyName, setCompanyName] = useState(company)
  const [roleName, setRoleName] = useState(role)
  const [jd, setJd] = useState(jobDescription)
  const [prep, setPrep] = useState<PrepData | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['technical', 'research'])
  )

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  const handleGenerate = async () => {
    if (!companyName || !roleName) {
      toast.error('Company and role are required')
      return
    }
    setLoading(true)
    try {
      const { data } = await aiAPI.interviewPrep({
        company: companyName,
        role: roleName,
        jobDescription: jd,
        applicationId,
      })
      setPrep(data as PrepData)
      toast.success('Interview prep ready!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate prep')
    } finally {
      setLoading(false)
    }
  }

  const Section = ({ id, title, items, bgColor, textColor, borderColor }: {
    id: string; title: string; items: string[];
    bgColor: string; textColor: string; borderColor: string
  }) => (
    <div className={`border ${borderColor} rounded-xl overflow-hidden`}>
      <button
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-4 ${bgColor} text-left`}
      >
        <span className={`font-semibold ${textColor}`}>{title}</span>
        {expandedSections.has(id)
          ? <ChevronUp className={`h-4 w-4 ${textColor}`} />
          : <ChevronDown className={`h-4 w-4 ${textColor}`} />
        }
      </button>
      {expandedSections.has(id) && (
        <div className="p-4">
          <ol className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className={`text-sm ${textColor} flex items-start gap-2`}>
                <span className="font-bold min-w-[1.2rem] opacity-60">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Google"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Description <span className="text-gray-400 font-normal">(optional but recommended)</span>
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste the job description for more targeted questions..."
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
        ) : (
          <><MessageSquare className="h-4 w-4" /> Generate Interview Prep</>
        )}
      </button>

      {prep && (
        <div className="space-y-4">
          {/* Company Research */}
          <div className="bg-gray-50 rounded-xl p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Company Research</h3>
            </div>
            <p className="text-sm text-gray-700">{prep.companyResearch}</p>
          </div>

          <Section id="technical" title="Technical Questions" items={prep.technicalQuestions}
            bgColor="bg-blue-50" textColor="text-blue-900" borderColor="border-blue-200" />
          <Section id="behavioral" title="Behavioral Questions (STAR Method)" items={prep.behavioralQuestions}
            bgColor="bg-purple-50" textColor="text-purple-900" borderColor="border-purple-200" />
          <Section id="ask" title="Questions to Ask the Interviewer" items={prep.questionsToAsk}
            bgColor="bg-green-50" textColor="text-green-900" borderColor="border-green-200" />

          {/* Tips */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">💡 Pro Tips</h3>
            <ul className="space-y-1">
              {prep.tips.map((tip, i) => (
                <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
