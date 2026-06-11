import { useState } from 'react'
import { Sparkles, FileText, MessageSquare, Wand2 } from 'lucide-react'
import ResumeTailor from '@/components/ai/ResumeTailor'
import InterviewPrep from '@/components/ai/InterviewPrep'
import CoverLetterGen from '@/components/ai/CoverLetterGen'

const TABS = [
  { id: 'resume', label: 'Resume Tailor', icon: Wand2, color: 'purple',
    desc: 'Paste any JD → get ATS-optimized resume bullets instantly' },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare, color: 'blue',
    desc: 'Get technical questions, behavioral Q&A, and company research' },
  { id: 'cover-letter', label: 'Cover Letter', icon: FileText, color: 'green',
    desc: 'Generate a personalized, non-generic cover letter in seconds' },
]

const activeBgMap: Record<string, string> = {
  purple: 'bg-purple-600 text-white shadow-sm',
  blue: 'bg-blue-600 text-white shadow-sm',
  green: 'bg-green-600 text-white shadow-sm',
}

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState('resume')
  const active = TABS.find((t) => t.id === activeTab)!

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        </div>
        <p className="text-gray-500">Powered by GPT-4o-mini — your job search superpower</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === id
                ? activeBgMap[color]
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <active.icon className="h-5 w-5" />
            {active.label}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{active.desc}</p>
        </div>

        {activeTab === 'resume' && <ResumeTailor />}
        {activeTab === 'interview' && <InterviewPrep />}
        {activeTab === 'cover-letter' && <CoverLetterGen />}
      </div>

      {/* Usage note */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Limited to 20 AI requests per hour · Powered by OpenAI GPT-4o-mini
      </p>
    </div>
  )
}
