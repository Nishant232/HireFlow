import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, X } from 'lucide-react'
import { applicationsAPI } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import ApplicationForm from '@/components/applications/ApplicationForm'
import StatusBadge from '@/components/applications/StatusBadge'
import type { Application } from '@/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { updateApplication } = useAppStore()
  const [app, setApp] = useState<Application | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) loadApp(id)
  }, [id])

  const loadApp = async (appId: string) => {
    try {
      const { data } = await applicationsAPI.getOne(appId)
      setApp(data.application)
    } catch {
      toast.error('Application not found')
      navigate('/applications')
    }
  }

  const handleUpdate = async (formData: Partial<Application>) => {
    if (!app) return
    setSaving(true)
    try {
      const { data } = await applicationsAPI.update(app._id, formData)
      setApp(data.application)
      updateApplication(app._id, data.application)
      setEditing(false)
      toast.success('Updated!')
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/applications')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </button>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{app.role}</h1>
            <p className="text-blue-600 font-medium text-lg mt-1">{app.company}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={app.status} />
              {app.location && <span className="text-sm text-gray-500">{app.location}</span>}
              <span className="text-sm text-gray-500">
                Applied {format(new Date(app.appliedDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition"
          >
            {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <ApplicationForm
            initial={app}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            loading={saving}
          />
        ) : (
          <div className="space-y-4">
            {app.jobDescription && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Job Description</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                  {app.jobDescription}
                </p>
              </div>
            )}
            {app.notes && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.notes}</p>
              </div>
            )}
            {app.aiInsights?.resumeBullets?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">AI Resume Bullets</h3>
                <ul className="space-y-1">
                  {app.aiInsights.resumeBullets.map((b, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {app.aiInsights?.coverLetter && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">AI Cover Letter</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-blue-50 p-3 rounded-lg">
                  {app.aiInsights.coverLetter}
                </p>
              </div>
            )}
            {app.contactName && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Contact</h3>
                <p className="text-sm text-gray-600">
                  {app.contactName} {app.contactEmail && `· ${app.contactEmail}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
