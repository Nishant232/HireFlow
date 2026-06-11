import { ExternalLink, MapPin, Building2, DollarSign } from 'lucide-react'
import type { JobListing } from '@/lib/api'

interface Props {
  job: JobListing
  onMatchScore?: (job: JobListing) => void
}

const AGE_COLOR = (days: number) => {
  if (days <= 3) return 'text-green-600 bg-green-50'
  if (days <= 7) return 'text-blue-600 bg-blue-50'
  if (days <= 14) return 'text-yellow-600 bg-yellow-50'
  return 'text-gray-600 bg-gray-100'
}

export default function JobCard({ job, onMatchScore }: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 className="h-3 w-3 text-blue-500" />
            <span className="text-sm text-blue-600 font-medium truncate">{job.company}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${AGE_COLOR(job.daysOld)}`}>
          {job.daysOld === 0 ? 'Today' : `${job.daysOld}d ago`}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {job.location}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {job.salary.currency} {job.salary.min.toLocaleString()}
            {job.salary.max > job.salary.min ? `–${job.salary.max.toLocaleString()}` : ''}
          </span>
        )}
        <span className="bg-gray-100 px-2 py-0.5 rounded-full capitalize">
          {job.jobType.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-4 line-clamp-2">{job.description}</p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition"
        >
          <ExternalLink className="h-3 w-3" />
          Apply Now
        </a>
        {onMatchScore && (
          <button onClick={() => onMatchScore(job)}
            className="flex items-center gap-1.5 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-50 transition"
          >
            ✨ Match Score
          </button>
        )}
      </div>
    </div>
  )
}
