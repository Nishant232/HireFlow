import type { VerifiedUrl } from '@/lib/api'
import { CheckCircle2, XCircle, AlertCircle, Clock, HelpCircle, ExternalLink } from 'lucide-react'

const STATUS_CONFIG = {
  valid: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Valid' },
  broken: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Broken' },
  redirect: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Redirects' },
  timeout: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Timeout' },
  unknown: { icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', label: 'Unverifiable' },
}

export default function UrlStatusBadge({ urlData }: { urlData: VerifiedUrl }) {
  const config = STATUS_CONFIG[urlData.status]
  const Icon = config.icon
  const displayUrl = urlData.url.length > 50 ? urlData.url.substring(0, 47) + '...' : urlData.url

  return (
    <div className={`rounded-lg border p-3 ${config.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config.color}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-700 truncate">{displayUrl}</span>
              <a href={urlData.url} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                <ExternalLink className="h-3 w-3 text-gray-400 hover:text-blue-600" />
              </a>
            </div>
            {urlData.platform && <span className="text-xs text-gray-500">{urlData.platform}</span>}
            {urlData.suggestion && <p className="text-xs text-gray-600 mt-1">{urlData.suggestion}</p>}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
          {urlData.responseTime > 0 && <p className="text-xs text-gray-400">{urlData.responseTime}ms</p>}
        </div>
      </div>
    </div>
  )
}
