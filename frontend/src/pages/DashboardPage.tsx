import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, TrendingUp, Users, Award, ArrowRight, Sparkles } from 'lucide-react'
import { statsAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import StatusBadge from '@/components/applications/StatusBadge'
import type { Stats, ApplicationStatus } from '@/types'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsAPI.get().then(({ data }) => {
      setStats(data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const firstName = user?.email?.split('@')[0] || 'there'

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const overview = stats?.overview

  const cards = [
    { label: 'Total Applied', value: overview?.total || 0, icon: Briefcase, colorClass: 'bg-blue-50 text-blue-600' },
    { label: 'Active', value: overview?.active || 0, icon: TrendingUp, colorClass: 'bg-yellow-50 text-yellow-600' },
    { label: 'Interviews', value: overview?.interviews || 0, icon: Users, colorClass: 'bg-purple-50 text-purple-600' },
    { label: 'Offers', value: overview?.offers || 0, icon: Award, colorClass: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {overview?.responseRate
            ? `Your response rate is ${overview.responseRate}% — keep going!`
            : 'Start tracking your applications to see insights.'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, colorClass }) => (
          <div key={label} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition">
            <div className={`inline-flex p-2 rounded-lg ${colorClass} mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentApplications?.length ? (
              stats.recentApplications.map((app) => (
                <div key={app._id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{app.role}</p>
                    <p className="text-xs text-gray-500">{app.company}</p>
                  </div>
                  {app.status && <StatusBadge status={app.status as ApplicationStatus} />}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No applications yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/applications"
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
            >
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700">Track New Application</p>
                <p className="text-xs text-blue-500">Add a job you applied to</p>
              </div>
            </Link>
            <Link
              to="/ai-tools"
              className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition"
            >
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-700">Use AI Tools</p>
                <p className="text-xs text-purple-500">Tailor resume, prep interview</p>
              </div>
            </Link>
            <Link
              to="/stats"
              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition"
            >
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700">View Analytics</p>
                <p className="text-xs text-green-500">Charts & pipeline breakdown</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
