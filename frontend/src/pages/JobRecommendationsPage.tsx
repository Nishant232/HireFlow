import { useState } from 'react'
import { Briefcase, Search, RefreshCw, MapPin } from 'lucide-react'
import { jobsAPI, resumeAPI, type JobListing, type MatchScore } from '@/lib/api'
import JobCard from '@/components/jobs/JobCard'
import toast from 'react-hot-toast'

interface MatchModal {
  job: JobListing
  score: MatchScore | null
  loading: boolean
}

const VERDICT_COLORS: Record<string, string> = {
  'Strong Match': 'text-green-600',
  'Good Match': 'text-blue-600',
  'Partial Match': 'text-yellow-600',
  'Weak Match': 'text-red-600',
}

export default function JobRecommendationsPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState('india')
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [matchModal, setMatchModal] = useState<MatchModal | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  const handleSearch = async () => {
    if (!resumeText && !jobTitle) {
      toast.error('Paste resume text or enter a job title')
      return
    }
    setLoading(true)
    setJobs([])
    try {
      const { data } = await jobsAPI.recommend({
        resumeText: resumeText || undefined,
        jobTitle: jobTitle || undefined,
        location,
      })
      setJobs(data.jobs)
      setKeywords(data.searchKeywords)
      if (data.jobs.length === 0) {
        toast(data.note || 'No jobs found. Try different keywords.', { icon: '🔍' })
      } else {
        toast.success(data.note)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadLoading(true)
    try {
      const { data } = await resumeAPI.upload(file)
      setResumeText(data.resume.text)
      toast.success('Resume loaded! Click Find Jobs to search.')
    } catch {
      toast.error('Failed to parse resume')
    } finally {
      setUploadLoading(false)
      e.target.value = ''
    }
  }

  const handleMatchScore = async (job: JobListing) => {
    if (!resumeText) {
      toast.error('Please load your resume first to get a match score')
      return
    }
    setMatchModal({ job, score: null, loading: true })
    try {
      const { data } = await jobsAPI.matchScore({
        resumeText,
        jobTitle: job.title,
        jobDescription: job.description,
        company: job.company,
      })
      setMatchModal({ job, score: data, loading: false })
    } catch {
      toast.error('Failed to calculate match score')
      setMatchModal(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Job Recommendations</h1>
        </div>
        <p className="text-gray-500 text-sm">
          AI-powered job matching using Adzuna · Active listings only (last 30 days)
        </p>
      </div>

      {/* Search Panel */}
      <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title / Keywords</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full Stack Developer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="bangalore" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Resume (optional)
            </label>
            <label className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition text-gray-600">
              {uploadLoading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Parsing...</>
              ) : (
                <><Search className="h-4 w-4" /> {resumeText ? '✅ Resume loaded' : 'Load PDF/DOCX'}</>
              )}
              <input type="file" className="hidden" accept=".pdf,.docx"
                onChange={handleFileUpload} disabled={uploadLoading} />
            </label>
          </div>
        </div>

        {!resumeText && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or paste resume text for better matching
            </label>
            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
              rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your resume text here for AI-powered keyword extraction..." />
          </div>
        )}

        <button onClick={handleSearch} disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Searching...</>
          ) : (
            <><Search className="h-4 w-4" /> Find Jobs</>
          )}
        </button>
      </div>

      {/* Keywords used */}
      {keywords.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Searched for:</span>
          {keywords.map((kw) => (
            <span key={kw} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{kw}</span>
          ))}
        </div>
      )}

      {/* Jobs Grid */}
      {jobs.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-3">{jobs.length} active jobs found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onMatchScore={handleMatchScore} />
            ))}
          </div>
        </div>
      )}

      {/* Match Score Modal */}
      {matchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Match Score: {matchModal.job.title}</h2>
            {matchModal.loading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Analyzing match...</span>
              </div>
            ) : matchModal.score ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">{matchModal.score.matchScore}%</div>
                  <div className={`font-semibold mt-1 ${VERDICT_COLORS[matchModal.score.verdict] || 'text-gray-600'}`}>
                    {matchModal.score.verdict}
                  </div>
                </div>

                {matchModal.score.topMatchingSkills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Matching Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {matchModal.score.topMatchingSkills.map((s) => (
                        <span key={s} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {matchModal.score.missingSkills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Skills to Add</p>
                    <div className="flex flex-wrap gap-1">
                      {matchModal.score.missingSkills.map((s) => (
                        <span key={s} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{matchModal.score.recommendation}</p>
                </div>

                <a href={matchModal.job.url} target="_blank" rel="noopener noreferrer"
                  className="block text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Apply Now →
                </a>
              </div>
            ) : null}

            <button onClick={() => setMatchModal(null)}
              className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
