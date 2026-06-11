import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { applicationsAPI } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import ApplicationCard from '@/components/applications/ApplicationCard'
import ApplicationForm from '@/components/applications/ApplicationForm'
import type { Application } from '@/types'
import toast from 'react-hot-toast'

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Wishlist', value: 'wishlist' },
  { label: 'Applied', value: 'applied' },
  { label: 'Screening', value: 'screening' },
  { label: 'Interview', value: 'interview' },
  { label: 'Offer', value: 'offer' },
  { label: 'Rejected', value: 'rejected' },
]

export default function ApplicationsPage() {
  const { applications, setApplications, addApplication,
    removeApplication,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [statusFilter])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const { data } = await applicationsAPI.getAll(params)
      setApplications(data.applications)
    } catch {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData: Partial<Application>) => {
    setSaving(true)
    try {
      const { data } = await applicationsAPI.create(formData)
      addApplication(data.application)
      setShowForm(false)
      toast.success('Application added!')
    } catch {
      toast.error('Failed to add application')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return
    try {
      await applicationsAPI.delete(id)
      removeApplication(id)
      toast.success('Application deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = applications.filter((app) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      app.location?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{applications.length} total</p>
        </div>
        <button
          id="add-application-btn"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 mb-10">
            <h2 className="text-lg font-semibold mb-4">Add New Application</h2>
            <ApplicationForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role, location..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition ${
                statusFilter === value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No results found' : 'No applications yet. Add your first one!'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              Add First Application
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <ApplicationCard key={app._id} application={app} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
