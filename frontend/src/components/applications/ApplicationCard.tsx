import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Trash2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import StatusBadge from './StatusBadge'
import type { Application } from '@/types'

interface Props {
  application: Application
  onDelete: (id: string) => void
}

export default function ApplicationCard({ application, onDelete }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/applications/${application._id}`)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition">{application.role}</h3>
            <p className="text-sm text-blue-600 font-medium mt-0.5">{application.company}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(application._id)
            }}
            className="ml-2 p-1 text-gray-300 hover:text-red-500 transition rounded opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <StatusBadge status={application.status} />
          {application.jobType && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {application.jobType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {application.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {application.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(application.appliedDate), 'MMM d, yyyy')}
          </span>
        </div>

        {application.salary?.min && (
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {application.salary.currency} {application.salary.min.toLocaleString()}
            {application.salary.max ? ` – ${application.salary.max.toLocaleString()}` : '+'}
          </p>
        )}
      </div>

      {application.jobUrl && (
        <div
          className="border-t px-5 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View Job Posting
          </a>
        </div>
      )}
    </div>
  )
}
